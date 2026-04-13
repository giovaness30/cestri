'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBasket, AlertCircle, LoaderCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import style from './style.module.scss'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
        } else {
          setError(error.message)
        }
        return
      }

      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={style.page}>
      <div className={style.brand}>
        <div className={style.brandIcon}>
          <ShoppingBasket />
        </div>
        <h1 className={style.brandName}>Cestri</h1>
        <p className={style.brandTagline}>Sua cesta de compras inteligente</p>
      </div>

      <div className={style.card}>
        <h2 className={style.cardTitle}>Bem-vindo de volta</h2>
        <p className={style.cardSubtitle}>Entre com sua conta para continuar</p>

        <form className={style.form} onSubmit={handleLogin}>
          {error && (
            <div className={style.errorBanner}>
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          <div className={style.fieldGroup}>
            <label className={style.label} htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              className={`${style.input} ${error ? style.inputError : ''}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              required
            />
          </div>

          <div className={style.fieldGroup}>
            <label className={style.label} htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={`${style.input} ${error ? style.inputError : ''}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              required
            />
          </div>

          <button
            type="submit"
            className={style.submitButton}
            disabled={loading || !email || !password}
          >
            {loading && <LoaderCircle className={style.spinner} />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <p className={style.footer}>
        Não tem uma conta?{' '}
        <Link href="/register">Cadastre-se</Link>
      </p>
    </div>
  )
}
