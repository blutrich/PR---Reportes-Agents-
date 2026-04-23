import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getContextStrategy, getValidatedWaves } from '../api/client'

const LENS_LABELS: Record<string, { label: string; color: string }> = {
  human_pain: { label: 'Human Pain', color: 'bg-red-50 text-red-700' },
  broken_status_quo: { label: 'Broken Status Quo', color: 'bg-orange-50 text-orange-700' },
  emerging_trend: { label: 'Emerging Trend', color: 'bg-blue-50 text-blue-700' },
}

function ScoreBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-ink-muted w-36 text-left">{label}</span>
      <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-medium text-ink w-8 text-left">{value}</span>
    </div>
  )
}

export default function ResearchReview() {
  const { companyId, productId } = useParams<{ companyId: string; productId: string }>()
  const navigate = useNavigate()
  const [strategy, setStrategy] = useState<any>(null)
  const [waves, setWaves] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedWave, setExpandedWave] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId || !productId) return
    Promise.all([
      getContextStrategy(companyId, productId),
      getValidatedWaves(companyId, productId),
    ]).then(([s, w]) => {
      setStrategy(s)
      setWaves(w)
    }).finally(() => setLoading(false))
  }, [companyId, productId])

  if (loading) return <div className="p-8 text-ink-muted">Loading research data...</div>
  if (!strategy && !waves) return <div className="p-8 text-ink-muted">No research data found.</div>

  return (
    <div className="p-8 max-w-4xl he-content">
      <div className="flex items-center justify-between mb-8" dir="ltr">
        <div>
          <h1 className="text-3xl font-serif text-ink">Research Review</h1>
          <p className="text-ink-muted mt-1">Review the strategic framing and research waves</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Re-run Research</button>
          <button
            className="btn-primary"
            onClick={() => navigate(`/clients/${companyId}/launches/${productId}/brief`)}
          >
            Approve & Generate Brief
          </button>
        </div>
      </div>

      {/* Context Strategy */}
      {strategy && (
        <section className="mb-8">
          <h2 className="text-xl font-serif text-ink mb-4">Context Strategy — "Why Now"</h2>

          <div className="card mb-4">
            <h3 className="text-sm font-medium text-ink mb-2">Core Tension</h3>
            <p className="text-ink-light">{strategy.world_context_framing?.core_tension}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="card">
              <h3 className="text-sm font-medium text-ink mb-2">Structural Forces</h3>
              <ul className="space-y-1">
                {strategy.world_context_framing?.structural_forces?.map((f: string, i: number) => (
                  <li key={i} className="text-sm text-ink-light">{f}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-ink mb-2">Recent Triggers</h3>
              <ul className="space-y-1">
                {strategy.world_context_framing?.recent_triggers?.map((t: string, i: number) => (
                  <li key={i} className="text-sm text-ink-light">{t}</li>
                ))}
              </ul>
            </div>
          </div>

          {strategy.editorial_strategy && (
            <div className="card mb-4">
              <h3 className="text-sm font-medium text-ink mb-2">Editorial Angle</h3>
              <p className="text-ink-light mb-3">{strategy.editorial_strategy.primary_angle}</p>
              {strategy.editorial_strategy.narrative_hook && (
                <div className="bg-cream-50 rounded-lg px-4 py-3">
                  <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Narrative Hook</span>
                  <p className="text-sm text-ink mt-1">{strategy.editorial_strategy.narrative_hook}</p>
                </div>
              )}
            </div>
          )}

          {/* Research Theses */}
          <h3 className="text-sm font-medium text-ink mb-3">Research Theses</h3>
          <div className="grid grid-cols-3 gap-3">
            {strategy.research_theses?.map((thesis: any) => {
              const lens = LENS_LABELS[thesis.lens] || { label: thesis.lens, color: 'bg-cream-200 text-ink-light' }
              return (
                <div key={thesis.thesis_id} className="card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-serif font-bold text-accent">{thesis.thesis_id}</span>
                    <span className={`badge-status ${lens.color}`}>{lens.label}</span>
                  </div>
                  <p className="text-sm text-ink-light">{thesis.claim}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Validated Waves */}
      {waves && (
        <section>
          <h2 className="text-xl font-serif text-ink mb-4">
            Validated Waves
            <span className="text-ink-muted font-sans text-base mr-2"> — {waves.waves_count} waves</span>
          </h2>

          {/* Cluster Summary */}
          <div className="card mb-6 bg-cream-50">
            <h3 className="text-sm font-medium text-ink mb-2">Cluster Summary</h3>
            <p className="text-sm text-ink-light">{waves.cluster_summary}</p>
          </div>

          {/* Continuity Chain */}
          {waves.continuity_chain && (
            <div className="card mb-6">
              <h3 className="text-sm font-medium text-ink mb-2">Continuity Chain</h3>
              <p className="text-sm text-ink-light">{waves.continuity_chain}</p>
            </div>
          )}

          {/* Individual Waves */}
          <div className="space-y-4">
            {waves.waves?.map((wave: any) => {
              const lens = LENS_LABELS[wave.lens] || { label: wave.lens, color: 'bg-cream-200 text-ink-light' }
              const isExpanded = expandedWave === wave.thesis_id

              return (
                <div key={wave.thesis_id} className="card">
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpandedWave(isExpanded ? null : wave.thesis_id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-2xl text-accent">{wave.thesis_id}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`badge-status ${lens.color}`}>{lens.label}</span>
                            <span className={`badge-status ${wave.status === 'approved' ? 'bg-success/10 text-success' : 'bg-red-50 text-red-700'}`}>
                              {wave.status === 'approved' ? 'Approved' : 'Cut'}
                            </span>
                            {wave.classification && (
                              <span className="badge-status bg-cream-200 text-ink-light">{wave.classification}</span>
                            )}
                          </div>
                          <h3 className="font-medium text-ink mt-1">{wave.wave_title}</h3>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-3xl font-serif text-accent">{wave.score?.total}</div>
                        <div className="text-xs text-ink-muted">/ 50</div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-cream-200 space-y-4">
                      {/* Score breakdown */}
                      <div className="space-y-2">
                        <ScoreBar label="Evidence Strength" value={wave.score?.evidence_strength} />
                        <ScoreBar label="Story Utility" value={wave.score?.story_utility} />
                        <ScoreBar label="Narrative Alignment" value={wave.score?.narrative_alignment} />
                        <ScoreBar label="Why Now Power" value={wave.score?.why_now_power} />
                        <ScoreBar label="Thin Line Check" value={wave.score?.thin_line_check} />
                      </div>

                      {/* Narrative */}
                      <div>
                        <h4 className="text-sm font-medium text-ink mb-2">Wave Narrative</h4>
                        <p className="text-sm text-ink-light">{wave.wave_narrative}</p>
                      </div>

                      {/* Core Tension */}
                      <div className="bg-cream-50 rounded-lg px-4 py-3">
                        <h4 className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">Core Tension</h4>
                        <p className="text-sm text-ink">{wave.core_tension}</p>
                      </div>

                      {/* Affected Groups */}
                      {wave.affected_groups?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-ink mb-2">Affected Groups</h4>
                          <ul className="space-y-1">
                            {wave.affected_groups.map((g: string, i: number) => (
                              <li key={i} className="text-sm text-ink-light flex items-start gap-2">
                                <span className="text-accent mt-1">&#x2022;</span>
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Evidence */}
                      {wave.evidence_details?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-ink mb-2">Evidence Sources</h4>
                          <div className="space-y-2">
                            {wave.evidence_details.map((ev: any, i: number) => (
                              <div key={i} className="bg-cream-50 rounded-lg px-4 py-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm text-ink">{ev.source_name}</span>
                                  <span className="text-xs text-ink-muted">{ev.date}</span>
                                </div>
                                <ul className="space-y-0.5">
                                  {ev.key_points?.map((kp: string, j: number) => (
                                    <li key={j} className="text-xs text-ink-light">{kp}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button className="btn-ghost text-sm text-red-600">Flag as irrelevant</button>
                        <button className="btn-ghost text-sm">Request re-run</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
