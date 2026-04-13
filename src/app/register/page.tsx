'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBasket, AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import style from './style.module.scss'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordMismatch = confirm.length > 0 && password !== confirm
  const passwordTooShort = password.length > 0 && password.length < 6

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/login` } })

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este e-mail já está cadastrado. Tente fazer login.')
        } else {
          setError(error.message)
        }
        return
      }

      setSuccess(true)
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
        <h2 className={style.cardTitle}>Criar conta</h2>
        <p className={style.cardSubtitle}>Comece a economizar nas suas compras</p>

        {success ? (
          <div className={style.successBanner}>
            <CheckCircle2 />
            <span>
              Conta criada! Enviamos um e-mail de confirmação para <strong>{email}</strong>.
              Verifique sua caixa de entrada para ativar sua conta.
            </span>
          </div>
        ) : (
          <form className={style.form} onSubmit={handleRegister}>
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
                className={style.input}
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
                autoComplete="new-password"
                placeholder="mínimo 6 caracteres"
                className={`${style.input} ${passwordTooShort ? style.inputError : ''}`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                required
              />
              {passwordTooShort && (
                <p className={style.fieldError}>Mínimo de 6 caracteres</p>
              )}
            </div>

            <div className={style.fieldGroup}>
              <label className={style.label} htmlFor="confirm">Confirmar senha</label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="repita a senha"
                className={`${style.input} ${passwordMismatch ? style.inputError : ''}`}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError('') }}
                required
              />
              {passwordMismatch && (
                <p className={style.fieldError}>As senhas não coincidem</p>
              )}
            </div>

            <button
              type="submit"
              className={style.submitButton}
              disabled={loading || !email || !password || !confirm || passwordMismatch || passwordTooShort}
            >
              {loading && <LoaderCircle className={style.spinner} />}
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        )}
      </div>

      <p className={style.footer}>
        Já tem uma conta?{' '}
        <Link href="/login">Entrar</Link>
      </p>
    </div>
  )
}
