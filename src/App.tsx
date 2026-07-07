import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import SplashScreen from './components/SplashScreen'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useState, useEffect } from 'react'

function App() {
  const [ready, setReady] = useState(false)
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 2200)
    return () => clearTimeout(timer)
  }, [])

  if (!appReady) {
    return <SplashScreen onFinish={() => setReady(true)} />
  }

  if (!ready) {
    return <SplashScreen onFinish={() => setReady(true)} />
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
