import { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Erreur React non interceptée:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl dark:bg-slate-900">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quelque chose s'est mal passé</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Une erreur inattendue est survenue. Vous pouvez réessayer ou revenir à l'accueil.
            </p>
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-800">
              {this.state.error?.message}
            </pre>
            <div className="mt-6 flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
              >
                Retour au tableau de bord
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
