import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import type { Chunk, Project } from '@/lib/types'
import { getProject, saveProject } from '@/lib/db'
import { useSettings } from '@/hooks/use-settings'
import { translateChunk } from '@/lib/translate'
import ReactMarkdown from 'react-markdown'

type BottomTab = 'notes' | 'context' | 'prompt'

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const [settings, setSettings] = useSettings()
  const [project, setProject] = useState<Project | null>(null)
  const [chunkIndex, setChunkIndex] = useState(0)
  const [sourceInput, setSourceInput] = useState('')
  const [editingTranslation, setEditingTranslation] = useState(false)
  const [translationDraft, setTranslationDraft] = useState('')
  const [bottomTab, setBottomTab] = useState<BottomTab>('notes')
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [editingContext, setEditingContext] = useState(false)
  const [contextDraft, setContextDraft] = useState('')
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) getProject(id).then((p) => setProject(p ?? null))
  }, [id])

  const chunk: Chunk | undefined = project?.chunks[chunkIndex]
  const totalChunks = project?.chunks.length ?? 0

  const persist = useCallback(async (updated: Project) => {
    const withTimestamp = { ...updated, updatedAt: new Date().toISOString() }
    await saveProject(withTimestamp)
    setProject(withTimestamp)
  }, [])

  async function handleAddChunk() {
    if (!project || !sourceInput.trim()) return
    const newChunk: Chunk = {
      sourceText: sourceInput.trim(),
      translatedText: '',
      status: 'pending',
    }
    const updated = { ...project, chunks: [...project.chunks, newChunk] }
    await persist(updated)
    setChunkIndex(updated.chunks.length - 1)
    setSourceInput('')
  }

  async function handleSaveTranslation() {
    if (!project || !chunk) return
    const chunks = [...project.chunks]
    chunks[chunkIndex] = { ...chunk, translatedText: translationDraft }
    await persist({ ...project, chunks })
    setEditingTranslation(false)
  }

  async function handleSaveNotes() {
    if (!project) return
    await persist({ ...project, notes: notesDraft })
    setEditingNotes(false)
  }

  async function handleSaveContext() {
    if (!project) return
    await persist({ ...project, context: contextDraft })
    setEditingContext(false)
  }

  async function handleTranslate() {
    if (!project || !chunk) return
    setTranslating(true)
    setError(null)
    try {
      const result = await translateChunk({
        sourceText: chunk.sourceText,
        notes: project.notes,
        context: project.context,
        sourceLang: project.sourceLang,
        targetLang: project.targetLang,
        model: project.model,
      })
      const chunks = [...project.chunks]
      chunks[chunkIndex] = {
        ...chunk,
        translatedText: result.translation,
        status: 'translated',
      }
      await persist({ ...project, chunks, notes: result.notes })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Translation failed')
    } finally {
      setTranslating(false)
    }
  }

  function buildPrompt(): string {
    if (!project) return ''
    const source = chunk?.sourceText ?? sourceInput
    return `System: You are a literary translator. Translate from ${project.sourceLang} to ${project.targetLang}.

${project.context ? `${project.context}\n` : ''}Here are your accumulated notes about this text:
${project.notes || '(no notes yet)'}

Translate the following text. Return:
1. The translation
2. Updated notes — rewrite the full notes block. Preserve all existing notes. Only add or modify entries, never remove unless explicitly asked.

Source text:
${source}`
  }

  if (!project) return null

  const statusColors: Record<string, string> = {
    pending: 'bg-muted text-muted-foreground',
    translated: 'bg-success-bg text-success',
    reviewed: 'bg-accent-subtle text-accent-warm',
  }

  const langLabel = (code: string) => code.toUpperCase()

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-fg-muted hover:text-foreground">
            &larr; Projects
          </Link>
          <span className="text-fg-dim">|</span>
          <h1 className="text-sm font-semibold">{project.name}</h1>
          <span className="rounded border border-border bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">
            {langLabel(project.sourceLang)} &rarr; {langLabel(project.targetLang)}
          </span>
          <span className="text-xs text-fg-dim">{project.model}</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            to={`/project/${id}/full-text`}
            className="rounded px-2.5 py-1.5 text-xs text-fg-muted hover:bg-surface-2 hover:text-foreground"
          >
            Full Text
          </Link>
          <Link
            to={`/project/${id}/settings`}
            className="rounded px-2.5 py-1.5 text-xs text-fg-muted hover:bg-surface-2 hover:text-foreground"
          >
            Settings
          </Link>
          <span className="mx-1 text-fg-dim">|</span>
          <button
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                theme: prev.theme === 'light' ? 'dark' : 'light',
              }))
            }
            className="rounded px-2.5 py-1.5 text-xs text-fg-muted hover:bg-surface-2 hover:text-foreground"
          >
            {settings.theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {/* Chunk Navigation Bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface-2 px-4 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-fg-muted"
          disabled={chunkIndex <= 0}
          onClick={() => setChunkIndex((i) => i - 1)}
        >
          &larr; Prev
        </Button>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold">
            {totalChunks === 0 ? 'No chunks' : `Chunk ${chunkIndex + 1}`}
          </span>
          {totalChunks > 0 && <span className="text-xs text-fg-dim">of {totalChunks}</span>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-fg-muted"
          disabled={chunkIndex >= totalChunks - 1}
          onClick={() => setChunkIndex((i) => i + 1)}
        >
          Next &rarr;
        </Button>
        {chunk && (
          <div className="ml-4 flex items-center gap-1.5">
            <span className="text-xs text-fg-dim">Status:</span>
            <Badge variant="secondary" className={statusColors[chunk.status]}>
              {chunk.status}
            </Badge>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {error && <span className="text-xs text-destructive">{error}</span>}
          {chunk?.translatedText && (
            <Button
              variant="outline"
              size="sm"
              className="h-auto px-3 py-1 text-xs"
              disabled={translating}
              onClick={handleTranslate}
            >
              {translating ? 'Translating...' : 'Re-translate'}
            </Button>
          )}
          <Button
            size="sm"
            className="h-auto bg-accent-warm px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-warm-hover"
            disabled={!chunk || translating}
            onClick={handleTranslate}
          >
            {translating ? 'Translating...' : 'Translate'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Source + Translation panels */}
        <div className="flex min-h-0 flex-1">
          {/* Source Panel */}
          <div className="flex w-1/2 min-h-0 flex-col border-r border-border bg-panel-source">
            <div className="shrink-0 border-b border-border bg-surface-2 px-4 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-fg-dim">
                Source — {project.sourceLang.charAt(0).toUpperCase() + project.sourceLang.slice(1)}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {chunk ? (
                <div className="font-prose text-[15px] leading-[1.85] opacity-85">
                  {chunk.sourceText.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-4">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col gap-3">
                  <Textarea
                    value={sourceInput}
                    onChange={(e) => setSourceInput(e.target.value)}
                    placeholder="Paste source text here to create a new chunk..."
                    className="min-h-[200px] flex-1 resize-none font-prose text-[15px] leading-[1.85]"
                  />
                  <Button
                    onClick={handleAddChunk}
                    disabled={!sourceInput.trim()}
                    className="self-end bg-accent-warm text-white hover:bg-accent-warm-hover"
                  >
                    Add Chunk
                  </Button>
                </div>
              )}
            </div>
            {/* Add new chunk when viewing existing chunk */}
            {chunk && (
              <div className="shrink-0 border-t border-border bg-surface-2 px-4 py-2">
                <button
                  onClick={() => {
                    setChunkIndex(totalChunks)
                    setSourceInput('')
                  }}
                  className="text-xs text-accent-warm hover:text-accent-warm-hover"
                >
                  + New chunk
                </button>
              </div>
            )}
          </div>

          {/* Translation Panel */}
          <div className="flex w-1/2 min-h-0 flex-col bg-panel-translation">
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-2 px-4 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-fg-dim">
                Translation —{' '}
                {project.targetLang.charAt(0).toUpperCase() + project.targetLang.slice(1)}
              </span>
              {chunk?.translatedText && (
                <button
                  className="text-[11px] font-medium text-accent-warm"
                  onClick={() => {
                    if (editingTranslation) {
                      handleSaveTranslation()
                    } else {
                      setTranslationDraft(chunk.translatedText)
                      setEditingTranslation(true)
                    }
                  }}
                >
                  {editingTranslation ? 'Save' : 'Edit'}
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {editingTranslation ? (
                <Textarea
                  value={translationDraft}
                  onChange={(e) => setTranslationDraft(e.target.value)}
                  className="min-h-full resize-none font-prose text-[15px] leading-[1.85]"
                />
              ) : chunk?.translatedText ? (
                <div className="font-prose text-[15px] leading-[1.85]">
                  {chunk.translatedText.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-4">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-fg-dim">
                  {chunk ? 'Translation will appear here after you press Translate.' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div
          className="shrink-0 border-t border-border bg-surface"
          style={{
            height: panelCollapsed ? '37px' : '220px',
            overflow: panelCollapsed ? 'hidden' : undefined,
          }}
        >
          {/* Tab Bar */}
          <div className="flex items-center justify-between border-b border-border px-4">
            <div className="flex items-center">
              {(['notes', 'context', 'prompt'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  className={`px-3 py-2 text-xs capitalize ${
                    bottomTab === tab
                      ? 'border-b-2 border-accent-warm font-medium text-accent-warm'
                      : 'border-b-2 border-transparent text-fg-muted hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {bottomTab === 'notes' && (
                <button
                  className="text-[11px] font-medium text-accent-warm"
                  onClick={() => {
                    if (editingNotes) {
                      handleSaveNotes()
                    } else {
                      setNotesDraft(project.notes)
                      setEditingNotes(true)
                    }
                  }}
                >
                  {editingNotes ? 'Save' : 'Edit'}
                </button>
              )}
              {bottomTab === 'context' && (
                <button
                  className="text-[11px] font-medium text-accent-warm"
                  onClick={() => {
                    if (editingContext) {
                      handleSaveContext()
                    } else {
                      setContextDraft(project.context)
                      setEditingContext(true)
                    }
                  }}
                >
                  {editingContext ? 'Save' : 'Edit'}
                </button>
              )}
              <button
                className="text-[11px] text-fg-dim hover:text-foreground"
                onClick={() => setPanelCollapsed((c) => !c)}
              >
                {panelCollapsed ? 'Expand \u2191' : 'Collapse \u2193'}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto p-4" style={{ height: 'calc(220px - 37px)' }}>
            {bottomTab === 'notes' &&
              (editingNotes ? (
                <Textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="min-h-full resize-none text-sm"
                  placeholder="Translation notes (markdown)..."
                />
              ) : project.notes ? (
                <div className="prose-content text-sm">
                  <ReactMarkdown>{project.notes}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-fg-dim">
                  Notes will be populated by the AI after translation, or you can add them manually.
                </p>
              ))}
            {bottomTab === 'context' &&
              (editingContext ? (
                <Textarea
                  value={contextDraft}
                  onChange={(e) => setContextDraft(e.target.value)}
                  className="min-h-full resize-none text-sm"
                  placeholder="Translation instructions (markdown)..."
                />
              ) : project.context ? (
                <div className="rounded border border-border bg-surface-2 p-3 text-xs leading-relaxed">
                  <ReactMarkdown>{project.context}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-fg-dim">
                  No context set. Add translation instructions in Project Settings.
                </p>
              ))}
            {bottomTab === 'prompt' && (
              <div className="space-y-2">
                <p className="text-xs text-fg-muted">
                  Preview of the full prompt sent to the AI (read-only):
                </p>
                <pre className="whitespace-pre-wrap rounded border border-border bg-surface-2 p-3 font-mono text-[11px] leading-relaxed text-fg-muted">
                  {buildPrompt()}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
