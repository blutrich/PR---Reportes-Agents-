import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function LaunchSetup() {
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()

  const [launchName, setLaunchName] = useState('')
  const [urls, setUrls] = useState<string[]>([''])
  const [rawText, setRawText] = useState('')
  const [testimonials, setTestimonials] = useState('')

  // Override fields
  const [productName, setProductName] = useState('')
  const [oneLiner, setOneLiner] = useState('')
  const [coreProblem, setCoreProblem] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [valueProp, setValueProp] = useState('')
  const [diffClaim, setDiffClaim] = useState('')
  const [editorialDirectives, setEditorialDirectives] = useState('')

  function addUrl() {
    setUrls([...urls, ''])
  }

  function updateUrl(i: number, val: string) {
    const next = [...urls]
    next[i] = val
    setUrls(next)
  }

  function removeUrl(i: number) {
    setUrls(urls.filter((_, idx) => idx !== i))
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-ink mb-2">New Launch</h1>
        <p className="text-ink-light">
          Add your source materials and the system will extract everything.
          Pre-fill any field you want to define yourself.
        </p>
      </div>

      {/* Launch name */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-ink mb-1">Launch Name</label>
        <p className="text-xs text-ink-muted mb-2">A short identifier for this launch (e.g. "mortgage-advisory")</p>
        <input
          value={launchName}
          onChange={(e) => setLaunchName(e.target.value)}
          placeholder="my-new-launch"
          className="input-field max-w-sm"
          dir="ltr"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left — Sources */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="section-title">Source Materials</h2>
            <p className="text-sm text-ink-muted mb-4">
              Product page, blog post, landing page — anything that explains what you're launching.
            </p>

            <div className="space-y-2 mb-4">
              {urls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateUrl(i, e.target.value)}
                    placeholder="https://..."
                    className="input-field flex-1"
                    dir="ltr"
                  />
                  {urls.length > 1 && (
                    <button onClick={() => removeUrl(i)} className="btn-ghost text-ink-muted text-sm px-2">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addUrl} className="text-sm text-accent hover:text-accent-dark font-medium">
              + Add another URL
            </button>
          </div>

          <div className="card">
            <h2 className="section-title">Paste raw text</h2>
            <p className="text-sm text-ink-muted mb-3">
              Internal brief, copied notes, any background material about this launch.
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste any text about this launch..."
              className="input-field min-h-[160px] resize-y"
            />
          </div>

          <div className="card">
            <h2 className="section-title">Upload files</h2>
            <div className="border-2 border-dashed border-cream-300 rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
              <div className="text-ink-muted text-sm">
                Drag and drop files here, or click to browse
              </div>
              <div className="text-xs text-ink-muted mt-1">PDF, DOCX, TXT</div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Customer Testimonials</h2>
            <p className="text-sm text-ink-muted mb-3">
              Paste customer stories in any format — WhatsApp messages, emails, survey responses.
              The system will parse and structure them automatically.
            </p>
            <textarea
              value={testimonials}
              onChange={(e) => setTestimonials(e.target.value)}
              placeholder="Paste raw testimonials here..."
              className="input-field min-h-[140px] resize-y"
            />
          </div>
        </div>

        {/* Right — Overrides */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="section-title">Product Details</h2>
            <p className="text-sm text-ink-muted mb-4">
              All optional. These override whatever the system extracts.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Product Name</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Will be extracted if left empty"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">One-liner</label>
                <input
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                  placeholder="One sentence: what it is and who it's for"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Core Problem</label>
                <textarea
                  value={coreProblem}
                  onChange={(e) => setCoreProblem(e.target.value)}
                  placeholder="The specific pain point this solves"
                  className="input-field min-h-[80px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Target Audience</label>
                <textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="If different from company-level audience"
                  className="input-field min-h-[60px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Value Proposition</label>
                <textarea
                  value={valueProp}
                  onChange={(e) => setValueProp(e.target.value)}
                  placeholder="The concrete benefit the user receives"
                  className="input-field min-h-[60px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Differentiation Claim</label>
                <textarea
                  value={diffClaim}
                  onChange={(e) => setDiffClaim(e.target.value)}
                  placeholder="What makes this structurally different"
                  className="input-field min-h-[60px] resize-y"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Editorial Directives</h2>
            <p className="text-sm text-ink-muted mb-3">
              Angles or framings to emphasize that may not be in the materials.
              One directive per line — each should be a complete instruction.
            </p>
            <textarea
              value={editorialDirectives}
              onChange={(e) => setEditorialDirectives(e.target.value)}
              placeholder={"e.g. Emphasize that this is the first product in the market to do X\ne.g. The financial independence angle matters more than the savings angle\ne.g. Do not frame this as a budgeting tool"}
              className="input-field min-h-[120px] resize-y"
            />
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-8 flex justify-center">
        <button
          className="btn-primary text-lg px-8 py-3"
          onClick={() => {
            const productId = launchName.toLowerCase().replace(/\s+/g, '-') || 'new-launch'
            alert('In the real system, this triggers the extraction pipeline.')
            navigate(`/clients/${companyId}/launches/${productId}/profile`)
          }}
        >
          Extract Launch Profile
        </button>
      </div>
    </div>
  )
}
