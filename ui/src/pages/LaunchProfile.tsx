import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLaunchProfile } from '../api/client'

function EditableField({
  label,
  value,
  source,
  multiline = false,
}: {
  label: string
  value: string
  source?: string
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState(value)
  const [edited, setEdited] = useState(false)
  const isClientDefined = source === 'client_defined'

  if (editing) {
    return (
      <div className="mb-4">
        <label className="text-sm font-medium text-ink mb-1 block">{label}</label>
        {multiline ? (
          <textarea
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="input-field min-h-[80px] resize-y"
            autoFocus
          />
        ) : (
          <input value={current} onChange={(e) => setCurrent(e.target.value)} className="input-field" autoFocus />
        )}
        <div className="flex gap-2 mt-2">
          <button className="btn-primary text-xs px-3 py-1" onClick={() => { setEditing(false); setEdited(current !== value) }}>
            Save
          </button>
          <button className="btn-ghost text-xs px-3 py-1" onClick={() => { setCurrent(value); setEditing(false) }}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 group cursor-pointer rounded-lg px-3 py-2 -mx-3 hover:bg-cream-50 transition-colors" onClick={() => setEditing(true)}>
      <div className="flex items-center gap-2 mb-0.5">
        <label className="text-sm font-medium text-ink">{label}</label>
        {edited || isClientDefined ? (
          <span className="badge-user">You defined</span>
        ) : (
          <span className="badge-extracted">Extracted</span>
        )}
        <span className="text-xs text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity">Click to edit</span>
      </div>
      <div dir="auto" className="text-sm text-ink-light whitespace-pre-wrap">{current || '—'}</div>
    </div>
  )
}

export default function LaunchProfile() {
  const { companyId, productId } = useParams<{ companyId: string; productId: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId || !productId) return
    getLaunchProfile(companyId, productId).then(setProfile).finally(() => setLoading(false))
  }, [companyId, productId])

  if (loading) return <div className="p-8 text-ink-muted">Loading launch profile...</div>
  if (!profile) return <div className="p-8 text-ink-muted">Launch profile not found.</div>

  return (
    <div className="p-8 max-w-4xl he-content">
      <div className="flex items-center justify-between mb-8" dir="ltr">
        <div>
          <h1 className="text-3xl font-serif text-ink">{profile.launched_product_name || productId}</h1>
          <p className="text-ink-muted mt-1">Launch Profile</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Re-extract</button>
          <button
            className="btn-primary"
            onClick={() => navigate(`/clients/${companyId}/launches/${productId}/research`)}
          >
            Approve & Run Research
          </button>
        </div>
      </div>

      {/* Product Identity */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">Product Identity</h2>
        <EditableField label="Product Name" value={profile.launched_product_name || ''} source={profile.launched_product_name_source} />
        <EditableField label="One-liner" value={profile.launched_product_one_liner || ''} source={profile.launched_product_one_liner_source} multiline />
        <EditableField label="Core Problem" value={profile.launched_product_core_problem || ''} source={profile.launched_product_core_problem_source} multiline />
        <EditableField label="Top-Level Issue" value={typeof profile.top_level_issue === 'object' ? profile.top_level_issue?.value : profile.top_level_issue || ''} source={profile.top_level_issue_source} multiline />
      </section>

      {/* Audience */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">Audience</h2>
        <EditableField label="Target Audience" value={profile.launched_product_target_audience || ''} source={profile.launched_product_target_audience_source} multiline />
        <EditableField label="Value Proposition" value={profile.launched_product_value_proposition || ''} source={profile.launched_product_value_proposition_source} multiline />
        <EditableField label="Differentiation Claim" value={profile.launched_product_differentiation_claim || ''} source={profile.launched_product_differentiation_claim_source} multiline />
      </section>

      {/* Offering */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">Offering Structure</h2>
        {profile.launched_product_offering_structure?.service_tracks?.map((track: any, i: number) => (
          <div key={i} className="bg-cream-50 rounded-lg px-4 py-3 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-ink">{track.track_name}</span>
              <span className="font-serif text-accent font-semibold">{track.track_price}</span>
            </div>
            <div className="text-sm text-ink-light">{track.track_details}</div>
          </div>
        ))}
        {profile.launched_product_offering_structure?.payment_flexibility && (
          <div className="text-sm text-ink-muted mt-2">
            {profile.launched_product_offering_structure.payment_flexibility}
          </div>
        )}
      </section>

      {/* Functional Breakdown */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">How It Works</h2>
        <EditableField
          label="Functional Description"
          value={profile.launched_product_functional_breakdown?.functional_description || ''}
          source={profile.launched_product_functional_breakdown?.functional_description_source}
          multiline
        />
        <EditableField
          label="User Benefit"
          value={profile.launched_product_functional_breakdown?.user_benefit || ''}
          source={profile.launched_product_functional_breakdown?.user_benefit_source}
          multiline
        />
      </section>

      {/* Hard Stats */}
      {profile.launched_product_hard_stats?.length > 0 && (
        <section className="card mb-6">
          <h2 className="section-title mb-4">Hard Stats</h2>
          <ul className="space-y-1">
            {profile.launched_product_hard_stats.map((stat: string, i: number) => (
              <li key={i} className="text-sm text-ink-light flex items-start gap-2">
                <span className="text-accent mt-1">&#x2022;</span>
                {stat}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Previous Product */}
      {profile.previous_product && (
        <section className="card mb-6">
          <h2 className="section-title mb-4">Previous Product / Predecessor</h2>
          <EditableField label="Functional Description" value={profile.previous_product.functional_description || ''} multiline />
          <EditableField label="Switch Reason" value={profile.previous_product.switch_reason || ''} multiline />
        </section>
      )}

      {/* Timing Signals */}
      {profile.launch_timing_signals?.length > 0 && (
        <section className="card mb-6">
          <h2 className="section-title mb-4">Timing Signals</h2>
          <div className="flex flex-wrap gap-2">
            {profile.launch_timing_signals.map((signal: string, i: number) => (
              <span key={i} className="badge bg-blue-50 text-blue-700">{signal}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
