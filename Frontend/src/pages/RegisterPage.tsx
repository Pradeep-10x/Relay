import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Layers } from 'lucide-react'
import { useRegister } from '@/hooks'
import { Spinner } from '@/components/ui'
import { ROUTES } from '@/constants'

export function RegisterPage() {
  const register = useRegister()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate(form)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%)',
      }}
    >
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #2fbeff 0%, #06a6f0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(47,190,255,0.3)',
          }}>
            <Layers size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', letterSpacing: '-0.02em' }}>
            Relay
          </span>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="p-6">
            <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Create your account
            </h1>
            <p className="text-sm mb-5" style={{ color: 'var(--text-tertiary)' }}>
              Get started with Relay for free
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  className="input"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Username</label>
                <input
                  className="input"
                  placeholder="janedoe"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
                    style={{ paddingRight: 36 }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full justify-center mt-1"
                disabled={register.isPending}
                style={{ padding: '9px 0' }}
              >
                {register.isPending ? <><Spinner size={14} /> Creating account...</> : 'Create Account'}
              </button>
            </form>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 24px', textAlign: 'center' }}>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
