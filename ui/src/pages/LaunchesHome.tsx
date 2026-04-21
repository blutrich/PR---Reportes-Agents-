import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { listClients, type ClientSummary, type LaunchSummary } from '../api/client'

const STATUS_CONFIG: Record<string, { label: string; color: string; nextPage: string }> = {
  setup: { label: 'Setup', color: 'bg-cream-300 text-ink-light', nextPage: 'profile' },
  profile_review: { label: 'Profile Review', color: 'bg-warning/20 text-warning', nextPage: 'profile' },
  researching: { label: 'Researching...', color: 'bg-blue-100 text-blue-700', nextPage: 'research' },
  research_review: { label: 'Research Review', color: 'bg-purple-100 text-purple-700', nextPage: 'research' },
  brief_review: { label: 'Brief Ready', color: 'bg-accent/10 text-accent', nextPage: 'brief' },
  approved: { label: 'Approved', color: 'bg-success/10 text-success', nextPage: 'brief' },
}

export default function LaunchesHome() {
  const { companyId } = useParams<{ companyId: string }>()
  const [client, setClient] = useState<ClientSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listClients().then((clients) => {
      setClient(clients.find((c) => c.company_id === companyId) || null)
    }).finally(() => setLoading(false))
  }, [companyId])

  if (loading) return <div className="p-8 text-ink-muted">Loading...</div>
  if (!client) return <div className="p-8 text-ink-muted">Client not found.</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-ink">Launches</h1>
          <p className="text-ink-muted mt-1">{client.company_name}</p>
        </div>
        <Link to={`/clients/${companyId}/launches/new`} className="btn-primary">
          + New Launch
        </Link>
      </div>

      {client.launches.length === 0 ? (
        <div className="card text-center py-16">
          <h2 className="font-serif text-xl text-ink mb-2">No launches yet</h2>
          <p className="text-ink-muted mb-6">
            Create your first launch to start generating journalist briefs.
          </p>
          <Link to={`/clients/${companyId}/launches/new`} className="btn-primary">
            Create First Launch
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {client.launches.map((launch) => (
            <LaunchCard key={launch.product_id} launch={launch} companyId={companyId!} />
          ))}
        </div>
      )}
    </div>
  )
}

function LaunchCard({ launch, companyId }: { launch: LaunchSummary; companyId: string }) {
  const status = STATUS_CONFIG[launch.status] || STATUS_CONFIG.setup

  return (
    <Link
      to={`/clients/${companyId}/launches/${launch.product_id}/${status.nextPage}`}
      className="card hover:border-accent/30 transition-colors group block"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-serif text-lg text-ink group-hover:text-accent transition-colors">
              {launch.launched_product_name || launch.product_id}
            </h3>
            <span className={`badge-status ${status.color}`}>{status.label}</span>
          </div>
          {launch.launched_product_one_liner && (
            <p className="text-sm text-ink-light mt-1 line-clamp-2">
              {launch.launched_product_one_liner}
            </p>
          )}
        </div>
        {launch.briefs_count > 0 && (
          <div className="text-left mr-4">
            <div className="text-2xl font-serif text-accent">{launch.briefs_count}</div>
            <div className="text-xs text-ink-muted">briefs</div>
          </div>
        )}
      </div>
    </Link>
  )
}
