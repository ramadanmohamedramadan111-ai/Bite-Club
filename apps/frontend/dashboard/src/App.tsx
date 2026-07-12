import { useAuthStore } from './store/authStore'
import { LoginPage } from './components/auth/LoginPage'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { Toaster } from 'react-hot-toast'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {isAuthenticated ? <DashboardPage /> : <LoginPage />}
    </>
  )
}

export default App
