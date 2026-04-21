import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CompanySetup() {
  const navigate = useNavigate()
  const [urls, setUrls] = useState<string[]>([''])
  const [rawText, setRawText] = useState('')

  // Override fields
  const [companyName, setCompanyName] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [antiTarget, setAntiTarget] = useState('')
  const [spokespersonName, setSpokespersonName] = useState('')
  const [spokespersonTitle, setSpokespersonTitle] = useState('')
  const [countries, setCountries] = useState('')
  const [termSubs, setTermSubs] = useState<{ instead_of: string; say: string }[]>([])

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

  function addTermSub() {
    setTermSubs([...termSubs, { instead_of: '', say: '' }])
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="border-b border-cream-200 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg">F</span>
          </div>
          <div>
            <span className="font-serif text-2xl font-semibold text-ink">Front</span>
            <span className="font-serif text-2xl font-semibold text-accent">Page</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-ink mb-2">Set up your company profile</h1>
          <p className="text-ink-light">
            Throw in your website URLs and any background materials. We'll extract everything automatically.
            <br />
            You can also pre-fill any field you want to define yourself — those will take priority.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left pane — Sources */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="section-title">Sources</h2>
              <p className="text-sm text-ink-muted mb-4">
                Add your company website, about page, press page, blog — anything that represents the company.
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
              <h2 className="section-title">Paste anything else</h2>
              <p className="text-sm text-ink-muted mb-3">
                Internal docs, company description, background materials — any format.
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste any text about your company here..."
                className="input-field min-h-[200px] resize-y"
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
          </div>

          {/* Right pane — Optional fields */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="section-title">Company Details</h2>
              <p className="text-sm text-ink-muted mb-4">
                All optional. Fill in what you want to define yourself — everything else will be extracted from your sources.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Company Name</label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Will be extracted if left empty"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Target Audience</label>
                  <p className="text-xs text-ink-muted mb-1">In your own words — who is this for?</p>
                  <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Describe your target audience..."
                    className="input-field min-h-[80px] resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Anti-Target Audience</label>
                  <p className="text-xs text-ink-muted mb-1">Who is this explicitly NOT for?</p>
                  <textarea
                    value={antiTarget}
                    onChange={(e) => setAntiTarget(e.target.value)}
                    placeholder="Who should not be associated with this company..."
                    className="input-field min-h-[60px] resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Countries & Languages</label>
                  <input
                    value={countries}
                    onChange={(e) => setCountries(e.target.value)}
                    placeholder="e.g. Israel, Hebrew"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="section-title">Spokesperson</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Name</label>
                  <input
                    value={spokespersonName}
                    onChange={(e) => setSpokespersonName(e.target.value)}
                    placeholder="Full name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Title</label>
                  <input
                    value={spokespersonTitle}
                    onChange={(e) => setSpokespersonTitle(e.target.value)}
                    placeholder="e.g. CEO"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="section-title">Term Substitutions</h2>
              <p className="text-sm text-ink-muted mb-3">
                Words to avoid and what to say instead. Optional — can also be generated automatically.
              </p>
              {termSubs.map((sub, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    value={sub.instead_of}
                    onChange={(e) => {
                      const next = [...termSubs]
                      next[i] = { ...next[i], instead_of: e.target.value }
                      setTermSubs(next)
                    }}
                    placeholder="Instead of..."
                    className="input-field flex-1"
                  />
                  <input
                    value={sub.say}
                    onChange={(e) => {
                      const next = [...termSubs]
                      next[i] = { ...next[i], say: e.target.value }
                      setTermSubs(next)
                    }}
                    placeholder="Say..."
                    className="input-field flex-1"
                  />
                </div>
              ))}
              <button onClick={addTermSub} className="text-sm text-accent hover:text-accent-dark font-medium">
                + Add substitution
              </button>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-8 flex justify-center">
          <button
            className="btn-primary text-lg px-8 py-3"
            onClick={() => {
              // In a real app, this would trigger the company profiler agent
              alert('In the real system, this triggers the Company Profiler agent. For this prototype, data is already loaded.')
              navigate('/clients/riseup-israel/profile')
            }}
          >
            Generate Company Profile
          </button>
        </div>
      </div>
    </div>
  )
}
