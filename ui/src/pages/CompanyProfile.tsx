import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCompanyProfile } from '../api/client'

function EditableField({
  label,
  value,
  multiline = false,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState(value)
  const [edited, setEdited] = useState(false)

  if (editing) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-ink">{label}</label>
        </div>
        {multiline ? (
          <textarea
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="input-field min-h-[80px] resize-y"
            autoFocus
          />
        ) : (
          <input
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="input-field"
            autoFocus
          />
        )}
        <div className="flex gap-2 mt-2">
          <button
            className="btn-primary text-xs px-3 py-1"
            onClick={() => {
              setEditing(false)
              setEdited(current !== value)
            }}
          >
            Save
          </button>
          <button
            className="btn-ghost text-xs px-3 py-1"
            onClick={() => {
              setCurrent(value)
              setEditing(false)
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="mb-4 group cursor-pointer rounded-lg px-3 py-2 -mx-3 hover:bg-cream-50 transition-colors"
      onClick={() => setEditing(true)}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <label className="text-sm font-medium text-ink">{label}</label>
        {edited ? (
          <span className="badge-user">You edited</span>
        ) : (
          <span className="badge-extracted">Extracted</span>
        )}
        <span className="text-xs text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity">
          Click to edit
        </span>
      </div>
      <div dir="auto" className="text-sm text-ink-light whitespace-pre-wrap">{current || '—'}</div>
    </div>
  )
}

export default function CompanyProfile() {
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    getCompanyProfile(companyId).then(setProfile).finally(() => setLoading(false))
  }, [companyId])

  if (loading) return <div className="p-8 text-ink-muted">Loading company profile...</div>
  if (!profile) return <div className="p-8 text-ink-muted">Company profile not found.</div>

  return (
    <div className="p-8 max-w-4xl he-content">
      <div className="flex items-center justify-between mb-8" dir="ltr">
        <div>
          <h1 className="text-3xl font-serif text-ink">{profile.company_name}</h1>
          <p className="text-ink-muted mt-1">{profile.company_industry}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Re-extract</button>
          <button
            className="btn-primary"
            onClick={() => navigate(`/clients/${companyId}/launches`)}
          >
            Approved — Go to Launches
          </button>
        </div>
      </div>

      {/* Identity */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">Company Identity</h2>
        <EditableField label="Company Name" value={profile.company_name} />
        <EditableField label="Mission" value={profile.company_mission} multiline />
        <EditableField label="Value Proposition" value={profile.company_value_proposition} multiline />
        <EditableField label="One-liner Mission" value={profile.company_one_liner_mission} />
        <EditableField label="Industry" value={profile.company_industry} />
      </section>

      {/* Audience */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">Audience</h2>
        <EditableField label="Target Audience" value={profile.company_target_audience} multiline />
        <EditableField label="Anti-Target Audience" value={profile.company_anti_target_audience} multiline />
      </section>

      {/* Spokesperson */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">Spokesperson</h2>
        <EditableField label="Name" value={profile.spokesperson?.name || ''} />
        <EditableField label="Title" value={profile.spokesperson?.title || ''} />
        <EditableField label="Speaking Style" value={profile.spokesperson?.speaking_style || ''} multiline />
      </section>

      {/* Brand Voice */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">Brand Voice</h2>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-ink mb-2">Tone Rules</h3>
          <div className="space-y-2">
            {profile.writing_guidance?.global_tone_rules?.map((rule: string, i: number) => (
              <div key={i} className="text-sm text-ink-light bg-cream-50 rounded-lg px-3 py-2">
                {rule}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-ink mb-2">Forbidden Words</h3>
          <div className="flex flex-wrap gap-2">
            {profile.writing_guidance?.global_forbidden_words?.map((word: string, i: number) => (
              <span key={i} className="badge bg-red-50 text-red-700">{word}</span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-ink mb-2">Term Substitutions</h3>
          <div className="space-y-1">
            {profile.writing_guidance?.global_term_substitutions?.map(
              (sub: { instead_of: string; say: string }, i: number) => (
                <div key={i} className="text-sm flex gap-2">
                  <span className="text-red-600 line-through">{sub.instead_of}</span>
                  <span className="text-ink-muted">&larr;</span>
                  <span className="text-success font-medium">{sub.say}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Brand Identity Vocabulary */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">Brand Identity Vocabulary</h2>
        <div className="space-y-3">
          {profile.brand_identity_vocabulary?.map((item: any, i: number) => (
            <div key={i} className="bg-cream-50 rounded-lg px-4 py-3">
              <div className="font-medium text-ink text-sm mb-1">{item.term}</div>
              <div className="flex gap-4 text-xs">
                {item.preferred_adjectives?.length > 0 && (
                  <div>
                    <span className="text-success">Preferred:</span>{' '}
                    <span className="text-ink-light">{item.preferred_adjectives.join(', ')}</span>
                  </div>
                )}
                {item.forbidden_adjectives?.length > 0 && (
                  <div>
                    <span className="text-red-600">Forbidden:</span>{' '}
                    <span className="text-ink-light">{item.forbidden_adjectives.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search Config */}
      <section className="card mb-6">
        <h2 className="section-title mb-4">Geographic Focus</h2>
        <EditableField label="Geo Focus" value={profile.search_config?.geo_focus || ''} />
        <EditableField label="Primary Geo" value={profile.search_config?.primary_geo || ''} />
        <EditableField label="Language Bias" value={profile.search_config?.language_bias || ''} />
      </section>
    </div>
  )
}
