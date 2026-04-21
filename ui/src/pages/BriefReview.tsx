import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getLatestBrief, listBriefs } from '../api/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SectionComment {
  sectionId: string
  sectionTitle: string
  text: string
}

interface InlineComment {
  selectedText: string
  text: string
  id: string
  sectionId?: string
}

interface Section {
  id: string
  title: string
  heading: string  // just the heading line(s)
  body: string     // everything after the heading
  content: string  // full content (heading + body)
}

// Parse brief into sections by ## headings
function parseSections(markdown: string): Section[] {
  const lines = markdown.split('\n')
  const sections: Section[] = []
  let currentSection: { id: string; title: string; headingLine: string; bodyLines: string[] } | null = null

  for (const line of lines) {
    const h1Match = line.match(/^# (.+)/)
    const h2Match = line.match(/^## (.+)/)

    if (h1Match && !currentSection) {
      currentSection = {
        id: 'title',
        title: h1Match[1],
        headingLine: line,
        bodyLines: [],
      }
    } else if (h2Match) {
      if (currentSection) {
        const body = currentSection.bodyLines.join('\n')
        sections.push({
          ...currentSection,
          heading: currentSection.headingLine,
          body,
          content: currentSection.headingLine + '\n' + body,
        })
      }
      const id = h2Match[1].replace(/\s+/g, '-').toLowerCase()
      currentSection = {
        id,
        title: h2Match[1],
        headingLine: line,
        bodyLines: [],
      }
    } else if (currentSection) {
      currentSection.bodyLines.push(line)
    } else {
      if (line.trim()) {
        currentSection = { id: 'intro', title: 'Introduction', headingLine: '', bodyLines: [line] }
      }
    }
  }
  if (currentSection) {
    const body = currentSection.bodyLines.join('\n')
    sections.push({
      ...currentSection,
      heading: currentSection.headingLine,
      body,
      content: currentSection.headingLine + '\n' + body,
    })
  }
  return sections
}

// Highlight inline-commented text within a string by wrapping matches in <mark>
function HighlightedText({
  text,
  commentMap,
  onClickHighlight,
}: {
  text: string
  commentMap: { text: string; id: string; pending?: boolean }[]
  onClickHighlight: (id: string) => void
}) {
  const highlights = commentMap.map(c => c.text)
  if (highlights.length === 0) return <>{text}</>

  const escaped = highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'g')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) => {
        const match = commentMap.find(c => c.text === part)
        if (!match) return <span key={i}>{part}</span>

        // Pending highlight (while writing comment) — blue selection-like color
        if (match.pending) {
          return (
            <mark key={i} className="bg-blue-200/60 rounded-sm px-0.5 text-ink-light">
              {part}
            </mark>
          )
        }

        // Confirmed highlight — yellow, clickable
        return (
          <mark
            key={i}
            className="bg-yellow-200/70 rounded-sm px-0.5 text-ink-light cursor-pointer hover:bg-yellow-300/70 transition-colors"
            onMouseDown={(e) => {
              (e.currentTarget as any)._clickStart = { x: e.clientX, y: e.clientY }
            }}
            onMouseUp={(e) => {
              const start = (e.currentTarget as any)._clickStart
              if (!start) return
              const dx = Math.abs(e.clientX - start.x)
              const dy = Math.abs(e.clientY - start.y)
              if (dx < 5 && dy < 5) {
                const sel = window.getSelection()
                if (!sel || sel.isCollapsed || sel.toString().trim().length < 3) {
                  e.stopPropagation()
                  onClickHighlight(match.id)
                }
              }
            }}
          >
            {part}
          </mark>
        )
      })}
    </>
  )
}

// Walk DOM text nodes and wrap matching text with a <mark> element
function applyDomHighlights(
  container: HTMLElement,
  highlights: { text: string; className: string; id: string }[]
) {
  // Remove all previous marks we added
  container.querySelectorAll('mark[data-hl]').forEach((mark) => {
    const parent = mark.parentNode
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark)
      parent.normalize() // merge adjacent text nodes
    }
  })

  if (highlights.length === 0) return

  // Walk all text nodes
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text)

  for (const hl of highlights) {
    for (const node of textNodes) {
      const idx = node.textContent?.indexOf(hl.text) ?? -1
      if (idx === -1) continue

      const range = document.createRange()
      range.setStart(node, idx)
      range.setEnd(node, idx + hl.text.length)

      const mark = document.createElement('mark')
      mark.className = hl.className
      mark.setAttribute('data-hl', hl.id)
      range.surroundContents(mark)
      break // found it, stop searching for this highlight
    }
  }
}

function SectionBlock({
  section,
  sectionComment,
  onAddComment,
  inlineComments,
  onAddInlineComment,
  onClickHighlight,
  pendingHighlight,
}: {
  section: Section
  sectionComment: SectionComment | undefined
  onAddComment: (sectionId: string, sectionTitle: string, text: string) => void
  inlineComments: InlineComment[]
  onAddInlineComment: (selectedText: string, sectionId: string) => void
  onClickHighlight: (id: string) => void
  pendingHighlight: string | null
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const markdownRef = useRef<HTMLDivElement>(null)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState(sectionComment?.text || '')
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number; text: string } | null>(null)

  const hasSectionComment = !!sectionComment

  // Apply DOM highlights after every render
  useLayoutEffect(() => {
    if (!markdownRef.current) return

    const highlights: { text: string; className: string; id: string }[] = []

    // Confirmed inline comments — yellow
    for (const ic of inlineComments) {
      highlights.push({
        text: ic.selectedText,
        className: 'bg-yellow-200/70 rounded-sm px-0.5 cursor-pointer',
        id: ic.id,
      })
    }

    // Pending selection — blue
    if (pendingHighlight) {
      highlights.push({
        text: pendingHighlight,
        className: 'bg-blue-200/60 rounded-sm px-0.5',
        id: '__pending__',
      })
    }

    applyDomHighlights(markdownRef.current, highlights)

    // Attach click handlers to confirmed highlight marks
    if (markdownRef.current) {
      markdownRef.current.querySelectorAll('mark[data-hl]').forEach((mark) => {
        const id = mark.getAttribute('data-hl')
        if (id && id !== '__pending__') {
          (mark as HTMLElement).onclick = (e) => {
            const sel = window.getSelection()
            if (!sel || sel.isCollapsed || sel.toString().trim().length < 3) {
              e.stopPropagation()
              onClickHighlight(id)
            }
          }
        }
      })
    }
  })

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !contentRef.current) {
      setSelectionPopup(null)
      return
    }

    const text = selection.toString().trim()
    if (!text || text.length < 3) {
      setSelectionPopup(null)
      return
    }

    // Check if selection is inside a heading — if so, treat as section comment
    const anchorNode = selection.anchorNode
    const parentEl = anchorNode?.parentElement
    const headingEl = parentEl?.closest('h1, h2')
    if (headingEl) {
      window.getSelection()?.removeAllRanges()
      setSelectionPopup(null)
      setShowCommentInput(true)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = contentRef.current.getBoundingClientRect()

    setSelectionPopup({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text,
    })
  }, [])

  return (
    <div className={`relative group mb-6 transition-all ${
      hasSectionComment ? 'border-r-3 border-accent pr-4 mr-[-16px]' : ''
    }`}>
      <div className="relative" ref={contentRef} onMouseUp={handleMouseUp}>
        {/* Section comment button — right side in RTL content */}
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className={`absolute -right-12 top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            hasSectionComment
              ? 'bg-accent text-white'
              : 'bg-cream-200 text-ink-muted opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-white'
          }`}
          title="Add section comment"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Inline comment popup — appears on text selection */}
        {selectionPopup && (
          <div
            className="absolute z-20"
            style={{ left: selectionPopup.x, top: selectionPopup.y, transform: 'translate(-50%, -100%)' }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation()
                onAddInlineComment(selectionPopup.text, section.id)
                setSelectionPopup(null)
              }}
              className="bg-ink text-white text-xs px-3 py-1.5 rounded-lg shadow-lg hover:bg-ink-light transition-colors whitespace-nowrap"
            >
              Add comment on this text
            </button>
          </div>
        )}

        {/* Heading */}
        {section.heading && (
          <div dir="rtl" className="
            [&_h1]:font-serif [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-ink [&_h1]:mb-2 [&_h1]:leading-snug
            [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-cream-200 [&_h2]:pb-2
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {section.heading}
            </ReactMarkdown>
          </div>
        )}

        {/* Section comment input — between heading and body */}
        {showCommentInput && (
          <div className="my-3 bg-cream-50 rounded-lg p-4 border border-cream-200">
            <div className="text-xs font-medium text-ink-muted mb-2 uppercase tracking-wider">
              Comment on: {section.title}
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What should change in this section?"
              className="input-field min-h-[60px] resize-y text-sm"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                className="btn-primary text-xs px-3 py-1"
                onClick={() => {
                  if (commentText.trim()) {
                    onAddComment(section.id, section.title, commentText)
                    setShowCommentInput(false)
                  }
                }}
              >
                Save comment
              </button>
              <button className="btn-ghost text-xs px-3 py-1" onClick={() => setShowCommentInput(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Body content */}
        <div ref={markdownRef} dir="rtl" className="max-w-none text-ink-light text-base leading-relaxed
          [&_p]:mb-4 [&_p]:leading-relaxed
          [&_strong]:text-ink [&_strong]:font-semibold
          [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {section.body}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default function BriefReview() {
  const { companyId, productId } = useParams<{ companyId: string; productId: string }>()
  const [briefContent, setBriefContent] = useState('')
  const [briefs, setBriefs] = useState<{ filename: string; date: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrief, setSelectedBrief] = useState<string | null>(null)

  // Comments state
  const [sectionComments, setSectionComments] = useState<SectionComment[]>([])
  const [inlineComments, setInlineComments] = useState<InlineComment[]>([])
  const [generalComment, setGeneralComment] = useState('')
  const [showInlineInput, setShowInlineInput] = useState<string | null>(null)
  const [inlineInputText, setInlineInputText] = useState('')
  const [inlineInputSectionId, setInlineInputSectionId] = useState('')
  const [showGeneralInput, setShowGeneralInput] = useState(false)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)

  // Flash a comment card briefly then clear
  function flashComment(id: string) {
    setActiveCommentId(id)
    // Scroll the comment into view
    setTimeout(() => {
      document.getElementById(`comment-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
    setTimeout(() => setActiveCommentId(null), 1500)
  }

  useEffect(() => {
    if (!companyId || !productId) return
    Promise.all([
      getLatestBrief(companyId, productId),
      listBriefs(companyId, productId),
    ]).then(([content, list]) => {
      setBriefContent(content)
      setBriefs(list)
      if (list.length > 0) setSelectedBrief(list[0].filename)
    }).finally(() => setLoading(false))
  }, [companyId, productId])

  const sections = parseSections(briefContent)
  const totalComments = sectionComments.length + inlineComments.length + (generalComment.trim() ? 1 : 0)

  function handleAddSectionComment(sectionId: string, sectionTitle: string, text: string) {
    const existing = sectionComments.find((c) => c.sectionId === sectionId)
    if (existing) {
      setSectionComments(sectionComments.map((c) => (c.sectionId === sectionId ? { ...c, text } : c)))
    } else {
      setSectionComments([...sectionComments, { sectionId, sectionTitle, text }])
    }
  }

  function handleAddInlineComment(selectedText: string, sectionId: string) {
    setShowInlineInput(selectedText)
    setInlineInputText('')
    setInlineInputSectionId(sectionId)
  }

  function saveInlineComment() {
    if (showInlineInput && inlineInputText.trim()) {
      setInlineComments([
        ...inlineComments,
        { selectedText: showInlineInput, text: inlineInputText, id: Date.now().toString(), sectionId: inlineInputSectionId },
      ])
      setShowInlineInput(null)
      setInlineInputText('')
      setInlineInputSectionId('')
      window.getSelection()?.removeAllRanges()
    }
  }

  function cancelInlineComment() {
    setShowInlineInput(null)
    setInlineInputText('')
    setInlineInputSectionId('')
    window.getSelection()?.removeAllRanges()
  }

  // Build the stacked comment tree: sections in brief order, each with its inline comments
  const commentTree = sections
    .map((section) => ({
      section,
      sectionComment: sectionComments.find((c) => c.sectionId === section.id),
      inlineComments: inlineComments.filter((ic) => ic.sectionId === section.id),
    }))
    .filter((entry) => entry.sectionComment || entry.inlineComments.length > 0)

  if (loading) return <div className="p-8 text-ink-muted">Loading brief...</div>
  if (!briefContent) return <div className="p-8 text-ink-muted">No brief found for this launch.</div>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-ink">Brief Review</h1>
          <p className="text-ink-muted mt-1">
            Review, comment, and approve the journalist brief
          </p>
        </div>
        <div className="flex gap-3">
          {briefs.length > 1 && (
            <select
              value={selectedBrief || ''}
              onChange={(e) => {
                setSelectedBrief(e.target.value)
                if (companyId && productId) {
                  import('../api/client').then(({ getBrief }) =>
                    getBrief(companyId, productId, e.target.value).then(setBriefContent)
                  )
                }
              }}
              className="input-field w-auto text-sm"
            >
              {briefs.map((b) => (
                <option key={b.filename} value={b.filename}>{b.date}</option>
              ))}
            </select>
          )}
          <button className="btn-secondary">Regenerate Brief</button>
          <button className="btn-primary">Approve Brief</button>
        </div>
      </div>

      {/* Inline comment input modal */}
      {showInlineInput && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={cancelInlineComment}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-[500px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg text-ink mb-2">Comment on selected text</h3>
            <div dir="auto" className="bg-blue-100/60 rounded-lg px-3 py-2 mb-4 text-sm text-ink-light border border-blue-200/50">
              &ldquo;{showInlineInput.slice(0, 200)}{showInlineInput.length > 200 ? '...' : ''}&rdquo;
            </div>
            <textarea
              value={inlineInputText}
              onChange={(e) => setInlineInputText(e.target.value)}
              placeholder="What should change about this text?"
              className="input-field min-h-[80px] resize-y"
              onFocus={() => window.getSelection()?.removeAllRanges()}
            />
            <div className="flex gap-2 mt-3 justify-end">
              <button className="btn-ghost" onClick={cancelInlineComment}>Cancel</button>
              <button className="btn-primary" onClick={saveInlineComment}>Save Comment</button>
            </div>
          </div>
        </div>
      )}

      {/* General comment input — above the brief */}
      <div className="mb-6">
        {!showGeneralInput && !generalComment.trim() ? (
          <button
            onClick={() => setShowGeneralInput(true)}
            className="btn-ghost text-sm text-ink-muted border border-dashed border-cream-300 w-full py-3"
          >
            + Add a general comment on the entire brief
          </button>
        ) : (
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-ink-muted uppercase tracking-wider">General Comment</h4>
              {generalComment.trim() && !showGeneralInput && (
                <button className="text-xs text-accent" onClick={() => setShowGeneralInput(true)}>Edit</button>
              )}
            </div>
            {showGeneralInput ? (
              <>
                <textarea
                  value={generalComment}
                  onChange={(e) => setGeneralComment(e.target.value)}
                  placeholder="Overall feedback — tone, structure, direction..."
                  className="input-field min-h-[80px] resize-y text-sm"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button className="btn-primary text-xs px-3 py-1" onClick={() => setShowGeneralInput(false)}>
                    Save
                  </button>
                  <button className="btn-ghost text-xs px-3 py-1" onClick={() => { setGeneralComment(''); setShowGeneralInput(false) }}>
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-light cursor-pointer" onClick={() => setShowGeneralInput(true)}>
                {generalComment}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* Brief content */}
        <div className={`card pl-8 pr-16 py-8 transition-all ${
          generalComment.trim() ? 'ring-2 ring-accent/20 border-accent/30' : ''
        }`}>
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              sectionComment={sectionComments.find((c) => c.sectionId === section.id)}
              onAddComment={handleAddSectionComment}
              inlineComments={inlineComments.filter((ic) => ic.sectionId === section.id)}
              onAddInlineComment={handleAddInlineComment}
              onClickHighlight={flashComment}
              pendingHighlight={showInlineInput}
            />
          ))}
        </div>

        {/* Comments stack panel */}
        <div className="space-y-4">
          <div className="sticky top-8">
            <h3 className="font-serif text-lg text-ink mb-4">
              Comments
              {totalComments > 0 && (
                <span className="text-sm font-sans text-ink-muted ml-1">({totalComments})</span>
              )}
            </h3>

            {totalComments === 0 ? (
              <div className="card text-center py-8">
                <p className="text-sm text-ink-muted">No comments yet.</p>
                <p className="text-xs text-ink-muted mt-1">
                  Hover over a section to add a comment,
                  or select text for an inline comment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* General comment — always first */}
                {generalComment.trim() && (
                  <div className="card border-accent/30 bg-accent/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-accent uppercase tracking-wider">General</span>
                      <button className="text-xs text-ink-muted hover:text-red-500" onClick={() => setGeneralComment('')}>
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-ink-light">{generalComment}</p>
                  </div>
                )}

                {/* Section comments — in brief order, each with its inline comments nested */}
                {commentTree.map(({ section, sectionComment: sc, inlineComments: ics }) => (
                  <div key={section.id} className="card">
                    {/* Section header */}
                    <div className="text-xs font-medium text-accent mb-2">{section.title}</div>

                    {/* Section-level comment */}
                    {sc && (
                      <div className="bg-cream-50 rounded-lg px-3 py-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-ink-muted">Section comment</span>
                          <button
                            className="text-xs text-ink-muted hover:text-red-500"
                            onClick={() => setSectionComments(sectionComments.filter((c) => c.sectionId !== section.id))}
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-sm text-ink-light mt-1">{sc.text}</p>
                      </div>
                    )}

                    {/* Inline comments under this section */}
                    {ics.length > 0 && (
                      <div className="space-y-2">
                        {ics.map((ic) => (
                          <div
                            key={ic.id}
                            id={`comment-${ic.id}`}
                            className={`rounded-lg px-3 py-2 border transition-all duration-500 ${
                              activeCommentId === ic.id
                                ? 'bg-yellow-100 border-yellow-300 shadow-md scale-[1.02]'
                                : 'bg-yellow-50/50 border-yellow-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span dir="auto" className="text-xs text-ink-muted italic truncate max-w-[200px]">
                                &ldquo;{ic.selectedText.slice(0, 40)}{ic.selectedText.length > 40 ? '...' : ''}&rdquo;
                              </span>
                              <button
                                className="text-xs text-ink-muted hover:text-red-500 flex-shrink-0 ml-2"
                                onClick={() => setInlineComments(inlineComments.filter((c) => c.id !== ic.id))}
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-sm text-ink-light mt-1">{ic.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Submit button */}
            {totalComments > 0 && (
              <button
                className="btn-primary w-full mt-4"
                onClick={() => {
                  alert(
                    `Submitting ${totalComments} comments for regeneration.\n\n` +
                    `General: ${generalComment.trim() ? 'Yes' : 'No'}\n` +
                    `Section comments: ${sectionComments.length}\n` +
                    `Inline comments: ${inlineComments.length}`
                  )
                }}
              >
                Submit & Regenerate ({totalComments})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
