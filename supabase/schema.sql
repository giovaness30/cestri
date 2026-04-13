-- ============================================================
-- CESTRI - Supabase Schema
-- Gerado em: 2026-04-13
-- ============================================================
-- Como importar:
--   1. Acesse o Supabase Dashboard → SQL Editor
--   2. Cole este arquivo e execute
--   (ou use: supabase db push com supabase CLI)
-- ============================================================


-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Para normalizar nomes de produtos na comparação de preços


-- ============================================================
-- HELPERS: trigger de updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABELA: user_settings
-- Configurações do app por usuário (tema, moeda, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme       TEXT NOT NULL DEFAULT 'dark'   CHECK (theme IN ('light', 'dark')),
  currency    TEXT NOT NULL DEFAULT 'BRL'    CHECK (currency IN ('BRL', 'USD', 'EUR')),
  confirm_delete BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Cria settings padrão automaticamente quando um usuário é criado no Auth
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca bloquear o cadastro mesmo se a tabela não existir
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_user_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();

-- Políticas RLS para user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);


-- ============================================================
-- TABELA: shopping_lists
-- Cada lista de compras do usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS shopping_lists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Minha Lista',
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shopping_lists_user_id    ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_completed  ON shopping_lists(user_id, completed);
CREATE INDEX idx_shopping_lists_updated_at ON shopping_lists(updated_at DESC);

CREATE TRIGGER trg_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- TABELA: shopping_items
-- Produtos dentro de uma lista de compras
-- ============================================================
CREATE TABLE IF NOT EXISTS shopping_items (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id                  UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,

  -- Produto
  name                     TEXT NOT NULL,
  quantity                 INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  checked                  BOOLEAN NOT NULL DEFAULT FALSE,

  -- Preço (armazenado como numérico; a formatação "R$ 12,50" é feita no front)
  unit_price               NUMERIC(10, 2),        -- preço por unidade (ex: 21.50)

  -- Dados de promoção / embalagem
  promo_min_qty            INTEGER,               -- qtd mínima para o preço promo valer (ex: 3)
  regular_unit_price       NUMERIC(10, 2),        -- preço unitário normal para calcular % de desconto
  promo_label              TEXT,                  -- "Promoção" | "Caixa" | NULL

  -- Ordem de exibição na lista
  position                 INTEGER NOT NULL DEFAULT 0,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shopping_items_list_id ON shopping_items(list_id);
CREATE INDEX idx_shopping_items_checked  ON shopping_items(list_id, checked);

CREATE TRIGGER trg_shopping_items_updated_at
  BEFORE UPDATE ON shopping_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- TABELA: stores
-- Catálogo de mercados registrados nas compras concluídas
-- ============================================================
CREATE TABLE IF NOT EXISTS stores (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, name)
);

CREATE INDEX idx_stores_user_id ON stores(user_id);


-- ============================================================
-- TABELA: list_completions
-- Dados preenchidos ao concluir uma compra
-- (1:1 com shopping_lists quando completed = true)
-- ============================================================
CREATE TABLE IF NOT EXISTS list_completions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id           UUID NOT NULL UNIQUE REFERENCES shopping_lists(id) ON DELETE CASCADE,
  store_id          UUID REFERENCES stores(id) ON DELETE SET NULL,
  store_name        TEXT NOT NULL,                -- denormalizado para facilitar queries históricas
  notes             TEXT,
  receipt_photo_url TEXT,                         -- URL no Supabase Storage (bucket: receipts)
  location_lat      NUMERIC(10, 7),
  location_lng      NUMERIC(11, 7),
  total_amount      NUMERIC(10, 2),               -- total calculado no momento da conclusão
  completed_at      TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_list_completions_list_id      ON list_completions(list_id);
CREATE INDEX idx_list_completions_completed_at ON list_completions(completed_at DESC);
CREATE INDEX idx_list_completions_store_name   ON list_completions(store_name);


-- ============================================================
-- TABELA: price_history
-- Histórico de preços por produto por mercado.
-- Populada automaticamente quando uma lista é concluída.
-- Serve para a tela de comparação de preços.
-- ============================================================
CREATE TABLE IF NOT EXISTS price_history (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id          UUID REFERENCES shopping_lists(id) ON DELETE SET NULL,
  completion_id    UUID REFERENCES list_completions(id) ON DELETE SET NULL,
  store_name       TEXT NOT NULL,
  item_name        TEXT NOT NULL,
  item_name_normal TEXT,                          -- nome normalizado (lowercase, sem acento) para busca
  unit_price       NUMERIC(10, 2) NOT NULL,
  quantity         INTEGER NOT NULL DEFAULT 1,
  promo_label      TEXT,
  recorded_at      TIMESTAMPTZ NOT NULL           -- = completed_at da lista
);

CREATE INDEX idx_price_history_user_id     ON price_history(user_id);
CREATE INDEX idx_price_history_item_name   ON price_history(item_name_normal);
CREATE INDEX idx_price_history_store_name  ON price_history(store_name);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at DESC);


-- Função que normaliza o nome do produto para buscas insensíveis
CREATE OR REPLACE FUNCTION normalize_item_name(raw TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(TRIM(unaccent(raw)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Trigger: ao inserir em price_history, preenche item_name_normal automaticamente
CREATE OR REPLACE FUNCTION fill_price_history_normalized()
RETURNS TRIGGER AS $$
BEGIN
  NEW.item_name_normal = normalize_item_name(NEW.item_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_price_history_normalize
  BEFORE INSERT OR UPDATE ON price_history
  FOR EACH ROW EXECUTE FUNCTION fill_price_history_normalized();


-- Trigger: ao concluir uma lista (completed = true), popula price_history automaticamente
CREATE OR REPLACE FUNCTION populate_price_history_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_completion list_completions%ROWTYPE;
BEGIN
  -- Só age quando completed muda para true
  IF NEW.completed = TRUE AND (OLD.completed IS DISTINCT FROM TRUE) THEN
    -- Busca a completion record
    SELECT * INTO v_completion FROM list_completions WHERE list_id = NEW.id LIMIT 1;

    IF FOUND THEN
      INSERT INTO price_history (
        user_id, list_id, completion_id, store_name,
        item_name, unit_price, quantity, promo_label, recorded_at
      )
      SELECT
        NEW.user_id,
        NEW.id,
        v_completion.id,
        v_completion.store_name,
        si.name,
        si.unit_price,
        si.quantity,
        si.promo_label,
        v_completion.completed_at
      FROM shopping_items si
      WHERE si.list_id = NEW.id
        AND si.unit_price IS NOT NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_populate_price_history
  AFTER UPDATE ON shopping_lists
  FOR EACH ROW EXECUTE FUNCTION populate_price_history_on_completion();


-- ============================================================
-- TABELA: wishlist_items
-- Lista de desejos do usuário (produto que quer comprar futuramente)
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  target_price NUMERIC(10, 2),    -- preço desejado / referência
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);

CREATE TRIGGER trg_wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- View: listas ativas com total calculado
CREATE OR REPLACE VIEW v_active_lists AS
SELECT
  sl.id,
  sl.user_id,
  sl.name,
  sl.created_at,
  sl.updated_at,
  COUNT(si.id)                                      AS total_items,
  COUNT(si.id) FILTER (WHERE si.checked = TRUE)     AS checked_items,
  COALESCE(SUM(si.unit_price * si.quantity)
    FILTER (WHERE si.unit_price IS NOT NULL), 0)    AS total_amount
FROM shopping_lists sl
LEFT JOIN shopping_items si ON si.list_id = sl.id
WHERE sl.completed = FALSE
GROUP BY sl.id;

-- View: histórico de compras com dados do mercado e total
CREATE OR REPLACE VIEW v_purchase_history AS
SELECT
  sl.id                AS list_id,
  sl.user_id,
  sl.name              AS list_name,
  lc.store_name,
  lc.completed_at,
  lc.notes,
  lc.receipt_photo_url,
  lc.location_lat,
  lc.location_lng,
  lc.total_amount,
  COUNT(si.id)         AS total_items
FROM shopping_lists sl
JOIN list_completions lc ON lc.list_id = sl.id
LEFT JOIN shopping_items si ON si.list_id = sl.id
WHERE sl.completed = TRUE
GROUP BY sl.id, sl.user_id, sl.name, lc.store_name, lc.completed_at,
         lc.notes, lc.receipt_photo_url, lc.location_lat, lc.location_lng, lc.total_amount;

-- View: melhor preço histórico por produto
CREATE OR REPLACE VIEW v_best_prices AS
SELECT
  user_id,
  item_name,
  item_name_normal,
  MIN(unit_price)                          AS best_price,
  ROUND(AVG(unit_price)::NUMERIC, 2)       AS avg_price,
  MAX(unit_price)                          AS worst_price,
  (ARRAY_AGG(store_name ORDER BY recorded_at DESC))[1] AS last_store,
  (ARRAY_AGG(unit_price ORDER BY recorded_at DESC))[1]  AS last_price,
  MAX(recorded_at)                         AS last_seen_at,
  COUNT(*)                                 AS occurrences
FROM price_history
GROUP BY user_id, item_name, item_name_normal;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cada usuário só acessa seus próprios dados
-- ============================================================
ALTER TABLE user_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists   ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items   ENABLE ROW LEVEL SECURITY;

-- user_settings
CREATE POLICY "user_settings: own data only" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- shopping_lists
CREATE POLICY "shopping_lists: own data only" ON shopping_lists
  FOR ALL USING (auth.uid() = user_id);

-- shopping_items (via lista)
CREATE POLICY "shopping_items: own data only" ON shopping_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = shopping_items.list_id AND sl.user_id = auth.uid()
    )
  );

-- stores
CREATE POLICY "stores: own data only" ON stores
  FOR ALL USING (auth.uid() = user_id);

-- list_completions (via lista)
CREATE POLICY "list_completions: own data only" ON list_completions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = list_completions.list_id AND sl.user_id = auth.uid()
    )
  );

-- price_history
CREATE POLICY "price_history: own data only" ON price_history
  FOR ALL USING (auth.uid() = user_id);

-- wishlist_items
CREATE POLICY "wishlist_items: own data only" ON wishlist_items
  FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- STORAGE BUCKET: receipts
-- Para armazenar fotos de comprovantes
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  FALSE,
  5242880,  -- 5 MB por arquivo
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Apenas o dono pode acessar seus recibos
CREATE POLICY "receipts: owner access only"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
