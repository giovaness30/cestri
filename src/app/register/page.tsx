'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Register() {
  // const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async () => {
    // const { error } = await supabase.auth.signUp({
    // email,
    // password,
    // })

    // if (error) {
    // alert(error.message)
    // return
    // }

    router.push('/dashboard')
  }

  return (
    <div>
      <h1>Cadastro</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Cadastrar</button>
    </div>
  )
}