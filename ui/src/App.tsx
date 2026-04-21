import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { listClients, type ClientSummary } from './api/client'
import Sidebar from './components/Sidebar'
import CompanySetup from './pages/CompanySetup'
import CompanyProfile from './pages/CompanyProfile'
import LaunchesHome from './pages/LaunchesHome'
import LaunchSetup from './pages/LaunchSetup'
import LaunchProfile from './pages/LaunchProfile'
import ResearchReview from './pages/ResearchReview'
import BriefReview from './pages/BriefReview'

export default function App() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listClients().then(setClients).finally(() => setLoading(false))
  }, [])

  const hasClients = clients.length > 0
  const activeClient = clients[0] // single-company model for now

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-ink-muted">Loading...</div>
      </div>
    )
  }

  // No company profile yet — show onboarding
  if (!hasClients) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="*" element={<CompanySetup />} />
        </Routes>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<CompanySetup />} />
      <Route path="*" element={
        <div className="flex min-h-screen">
          <Sidebar client={activeClient} />
          <main className="flex-1 ml-64 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to={`/clients/${activeClient.company_id}/launches`} replace />} />
              <Route path="/clients/:companyId/profile" element={<CompanyProfile />} />
              <Route path="/clients/:companyId/launches" element={<LaunchesHome />} />
              <Route path="/clients/:companyId/launches/new" element={<LaunchSetup />} />
              <Route path="/clients/:companyId/launches/:productId/profile" element={<LaunchProfile />} />
              <Route path="/clients/:companyId/launches/:productId/research" element={<ResearchReview />} />
              <Route path="/clients/:companyId/launches/:productId/brief" element={<BriefReview />} />
            </Routes>
          </main>
        </div>
      } />
    </Routes>
  )
}
