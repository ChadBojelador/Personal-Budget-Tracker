import { Github, RefreshCw, ShieldCheck, WifiOff } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from './config'

type AuthProvider = 'google' | 'github'
type AuthPhase = 'checking' | 'ready' | 'redirecting' | 'waiting' | 'slow' | 'offline' | 'error' | 'success' | 'unconfigured'

export type AuthAccount = {
  id: string
  email?: string
  signOut: () => Promise<void>
}

type AuthGateProps = {
  children: (account: AuthAccount) => ReactNode
}

const authReturnAtBoot = (() => {
  const query = new URLSearchParams(window.location.search)
  return query.get('auth') === 'callback' || query.has('code') || query.has('error')
})()

function AuthSurface({ phase, activeProvider, error, onSignIn, onRetry }: {
  phase: AuthPhase
  activeProvider: AuthProvider | null
  error: string
  onSignIn: (provider: AuthProvider) => Promise<void>
  onRetry: () => void
}) {
  const busy = phase === 'checking' || phase === 'redirecting' || phase === 'waiting' || phase === 'slow'
  const showProviders = phase === 'ready' || phase === 'error' || phase === 'offline' || phase === 'unconfigured'
  const providerLabel = activeProvider === 'google' ? 'Google' : activeProvider === 'github' ? 'GitHub' : 'your account'

  let title = 'Your money. One clear view.'
  let description = 'Sign in to keep your budget private and available only to you.'

  if (phase === 'checking') {
    title = 'Welcome back.'
    description = 'Checking your session...'
  } else if (phase === 'redirecting') {
    title = `Opening ${providerLabel}.`
    description = "You'll return here automatically after signing in."
  } else if (phase === 'waiting') {
    title = 'Signing you in.'
    description = 'Verifying your account and preparing your budget...'
  } else if (phase === 'slow') {
    title = 'Still connecting.'
    description = 'This is taking a little longer. Your budget remains private.'
  } else if (phase === 'success') {
    title = "You're in."
    description = 'Preparing your budget...'
  } else if (phase === 'offline') {
    title = "You're offline."
    description = 'Reconnect to the internet, then try signing in again.'
  } else if (phase === 'error') {
    title = "Sign-in didn't finish."
    description = error || 'Try again with Google or GitHub.'
  } else if (phase === 'unconfigured') {
    description = 'Connect Supabase to enable Google and GitHub sign-in.'
  }

  return (
    <div className={`auth-shell ${phase === 'success' ? 'is-success' : ''}`}>
      <section className={`auth-orb ${busy ? 'is-busy' : ''}`} aria-labelledby="auth-title">
        {busy && <span className="auth-progress-ring" aria-hidden="true" />}
        <div className="auth-content">
          <span className="auth-mark" aria-hidden="true"><ShieldCheck size={25} /></span>
          <h1 id="auth-title">{title}</h1>
          <p>{description}</p>

          {showProviders && (
            <div className="auth-actions">
              <button className="auth-provider google" onClick={() => void onSignIn('google')} disabled={phase === 'unconfigured'}>
                <span className="google-mark" aria-hidden="true">G</span>
                Continue with Google
              </button>
              <button className="auth-provider github" onClick={() => void onSignIn('github')} disabled={phase === 'unconfigured'}>
                <Github size={20} aria-hidden="true" />
                Continue with GitHub
              </button>
            </div>
          )}

          {(phase === 'offline' || phase === 'error') && (
            <button className="auth-retry" onClick={onRetry}>
              {phase === 'offline' ? <WifiOff size={16} /> : <RefreshCw size={16} />}
              Retry connection
            </button>
          )}

          {showProviders && phase !== 'unconfigured' && <small>New here? Your account is created automatically.</small>}
          {phase === 'unconfigured' && <small className="auth-notice">Add the Supabase URL and publishable key to the environment.</small>}
        </div>
      </section>
    </div>
  )
}

export default function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [phase, setPhase] = useState<AuthPhase>(authReturnAtBoot ? 'waiting' : 'checking')
  const [activeProvider, setActiveProvider] = useState<AuthProvider | null>(null)
  const [error, setError] = useState('')
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    const client = getSupabaseClient()
    if (!client) {
      setPhase('unconfigured')
      return
    }

    let active = true
    let signedIn = false
    let transitionTimer: number | undefined
    const query = new URLSearchParams(window.location.search)
    const callbackError = query.get('error_description') ?? query.get('error')

    if (callbackError) {
      setError(callbackError)
      setPhase('error')
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    const slowTimer = window.setTimeout(() => {
      if (active && authReturnAtBoot && !signedIn) setPhase(navigator.onLine ? 'slow' : 'offline')
    }, 4000)
    const timeoutTimer = window.setTimeout(() => {
      if (active && authReturnAtBoot && !signedIn) {
        if (navigator.onLine) {
          setError('We could not reach the sign-in service.')
          setPhase('error')
        } else {
          setPhase('offline')
        }
      }
    }, 10000)

    const finishSignIn = (nextSession: Session) => {
      if (!active) return
      signedIn = true
      window.clearTimeout(slowTimer)
      window.clearTimeout(timeoutTimer)
      setSession(nextSession)
      if (authReturnAtBoot) {
        setPhase('success')
        setTransitioning(true)
        window.history.replaceState({}, document.title, window.location.pathname)
        window.clearTimeout(transitionTimer)
        transitionTimer = window.setTimeout(() => setTransitioning(false), 780)
      } else {
        setTransitioning(false)
      }
    }

    const { data: listener } = client.auth.onAuthStateChange((event: AuthChangeEvent, nextSession: Session | null) => {
      if (!active) return
      if (event === 'SIGNED_OUT') {
        signedIn = false
        setSession(null)
        setTransitioning(false)
        setPhase('ready')
      } else if (nextSession) {
        finishSignIn(nextSession)
      }
    })

    void client.auth.getSession().then(({ data, error: sessionError }: { data: { session: Session | null }; error: { message: string } | null }) => {
      if (!active) return
      if (sessionError) {
        setError(sessionError.message)
        setPhase('error')
      } else if (data.session) {
        finishSignIn(data.session)
      } else if (!authReturnAtBoot) {
        setPhase('ready')
      }
    })

    return () => {
      active = false
      window.clearTimeout(slowTimer)
      window.clearTimeout(timeoutTimer)
      window.clearTimeout(transitionTimer)
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (provider: AuthProvider) => {
    const client = getSupabaseClient()
    if (!client) {
      setPhase('unconfigured')
      return
    }
    if (!navigator.onLine) {
      setPhase('offline')
      return
    }

    setActiveProvider(provider)
    setError('')
    setPhase('redirecting')
    const { error: signInError } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/?auth=callback` },
    })
    if (signInError) {
      setError(signInError.message)
      setPhase('error')
    }
  }

  const signOut = async () => {
    const client = getSupabaseClient()
    if (!client) return
    const { error: signOutError } = await client.auth.signOut()
    if (signOutError) throw signOutError
  }

  const retry = () => window.location.reload()

  if (session) {
    const app = children({ id: session.user.id, email: session.user.email, signOut })
    if (!transitioning) return app
    return <>{app}<AuthSurface phase="success" activeProvider={activeProvider} error="" onSignIn={signIn} onRetry={retry} /></>
  }

  return <AuthSurface phase={phase} activeProvider={activeProvider} error={error} onSignIn={signIn} onRetry={retry} />
}
