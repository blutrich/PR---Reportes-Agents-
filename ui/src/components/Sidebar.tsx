import { Link, useLocation, useParams } from 'react-router-dom'
import type { ClientSummary } from '../api/client'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  setup: { label: 'Setup', color: 'bg-cream-300 text-ink-light' },
  profile_review: { label: 'Profile Review', color: 'bg-warning/20 text-warning' },
  researching: { label: 'Researching', color: 'bg-blue-100 text-blue-700' },
  research_review: { label: 'Research Review', color: 'bg-purple-100 text-purple-700' },
  brief_review: { label: 'Brief Review', color: 'bg-accent/10 text-accent' },
  approved: { label: 'Approved', color: 'bg-success/10 text-success' },
}

export default function Sidebar({ client }: { client: ClientSummary }) {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-cream-200 flex flex-col z-10">
      {/* Brand */}
      <div className="p-5 border-b border-cream-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white font-serif font-bold text-sm">F</span>
          </div>
          <div>
            <span className="font-serif font-semibold text-ink">Front</span>
            <span className="font-serif font-semibold text-accent">Page</span>
          </div>
        </Link>
      </div>

      {/* Company */}
      <div className="p-4 border-b border-cream-200">
        <Link
          to={`/clients/${client.company_id}/profile`}
          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
            location.pathname.includes('/profile') && !location.pathname.includes('/launches/')
              ? 'bg-cream-100 text-ink'
              : 'text-ink-light hover:bg-cream-50'
          }`}
        >
          <div className="font-medium">{client.company_name}</div>
          <div className="text-xs text-ink-muted mt-0.5">Company Profile</div>
        </Link>
      </div>

      {/* Launches */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-ink-muted uppercase tracking-wider">Launches</h3>
          <Link
            to={`/clients/${client.company_id}/launches/new`}
            className="text-xs text-accent hover:text-accent-dark font-medium"
          >
            + New
          </Link>
        </div>

        <div className="space-y-1">
          {client.launches.map((launch) => {
            const statusInfo = STATUS_LABELS[launch.status] || STATUS_LABELS.setup
            const isActive = location.pathname.includes(`/launches/${launch.product_id}`)

            return (
              <Link
                key={launch.product_id}
                to={`/clients/${client.company_id}/launches/${launch.product_id}/brief`}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-cream-100' : 'hover:bg-cream-50'
                }`}
              >
                <div className="font-medium text-ink truncate">
                  {launch.launched_product_name || launch.product_id}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge-status ${statusInfo.color}`}>{statusInfo.label}</span>
                  {launch.briefs_count > 0 && (
                    <span className="text-xs text-ink-muted">{launch.briefs_count} briefs</span>
                  )}
                </div>
              </Link>
            )
          })}

          {client.launches.length === 0 && (
            <p className="text-sm text-ink-muted px-3 py-4">
              No launches yet.
              <br />
              <Link to={`/clients/${client.company_id}/launches/new`} className="text-accent hover:underline">
                Create your first launch
              </Link>
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
