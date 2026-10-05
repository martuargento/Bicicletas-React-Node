import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, registerSchema } from '../utils/validation'

export default function Login() {
  const { login, register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const schema = isRegister ? registerSchema : loginSchema
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '' },
  })

  const onSubmit = async (form) => {
    setError('')

    try {
      if (isRegister) {
        await createAccount(form.username, form.email, form.password)
      } else {
        await login(form.username, form.password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'No se pudo iniciar sesión.')
    }
  }

  const toggleMode = () => {
    setError('')
    setIsRegister((current) => !current)
  }

  return (
    <div className="container">
      <div className="auth-card">
        <h1>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p className="muted">Acceso con autenticación JWT</p>

        <form onSubmit={handleSubmit(onSubmit)} className="form-grid" noValidate>
          <label htmlFor="username">Usuario</label>
          <input id="username" type="text" autoComplete="username" placeholder="Usuario" {...register('username')} />
          {errors.username && <small role="alert">{errors.username.message}</small>}

          {isRegister && (
            <>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" placeholder="Email" {...register('email')} />
              {errors.email && <small role="alert">{errors.email.message}</small>}
            </>
          )}

          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="Contraseña" {...register('password')} />
          {errors.password && <small role="alert">{errors.password.message}</small>}

          {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : isRegister ? 'Registrarme' : 'Entrar'}
          </button>
          <button type="button" className="secondary" onClick={toggleMode}>
            {isRegister ? 'Ya tengo cuenta' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
