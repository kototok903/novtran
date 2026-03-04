import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Textarea } from '@/components/ui/textarea'
import type { Chunk, Project } from '@/lib/types'
import { getProject, saveProject } from '@/lib/db'
import { useSettings } from '@/hooks/use-settings'
import { translateChunk } from '@/lib/translate'
import { toast } from 'sonner'
import {
  Sun,
  Moon,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Check,
  ChevronDown,
  ChevronUp,
  Wrench,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'

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
      toast.success('Chunk translated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Translation failed')
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

  const sourceTranslationPanels = (
    <>
      {/* Source Panel */}
      <div className="flex w-1/2 min-h-0 flex-col border-r border-border bg-panel-source">
        <div className="flex shrink-0 items-center border-b border-border bg-surface-2 px-4 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Source — {project.sourceLang.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {chunk ? (
            <div className="font-prose text-prose text-foreground/85">
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
                className="min-h-[200px] flex-1 resize-none font-prose text-prose"
              />
              <Button
                variant="accent"
                onClick={handleAddChunk}
                disabled={!sourceInput.trim()}
                className="self-end"
              >
                Add Chunk
              </Button>
            </div>
          )}
        </div>
        {chunk && (
          <div className="shrink-0 border-t border-border bg-surface-2 px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setChunkIndex(totalChunks)
                setSourceInput('')
              }}
            >
              <Plus className="size-3.5" />
              New chunk
            </Button>
          </div>
        )}
      </div>

      {/* Translation Panel */}
      <div className="flex w-1/2 min-h-0 flex-col bg-panel-translation">
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-2 px-4 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Translation — {project.targetLang.toUpperCase()}
          </span>
          {chunk?.translatedText && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                if (editingTranslation) {
                  handleSaveTranslation()
                } else {
                  setTranslationDraft(chunk.translatedText)
                  setEditingTranslation(true)
                }
              }}
            >
              {editingTranslation ? (
                <Check className="size-3.5" />
              ) : (
                <Pencil className="size-3.5" />
              )}
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {editingTranslation ? (
            <Textarea
              value={translationDraft}
              onChange={(e) => setTranslationDraft(e.target.value)}
              className="min-h-full resize-none font-prose text-prose"
            />
          ) : chunk?.translatedText ? (
            <div className="font-prose text-prose">
              {chunk.translatedText.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {chunk ? 'Translation will appear here after you press Translate.' : ''}
            </p>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface h-12 px-4">
        <div className="flex items-center gap-3">
          <Breadcrumbs items={[{ label: 'Projects', to: '/' }, { label: project.name }]} />
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to={`/project/${id}/settings`}>
              <Wrench className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to={`/project/${id}/full-text`}>
              <FileText className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to={`/settings`}>
              <Settings className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                theme: prev.theme === 'light' ? 'dark' : 'light',
              }))
            }
          >
            {settings.theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </header>

      {/* Chunk Navigation Bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface-2 px-4 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={chunkIndex <= 0}
          onClick={() => setChunkIndex((i) => i - 1)}
        >
          <ChevronLeft className="size-3.5" />
          Prev
        </Button>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium">
            {totalChunks === 0 ? 'No chunks' : `Chunk ${chunkIndex + 1}`}
          </span>
          {totalChunks > 0 && (
            <span className="text-xs text-muted-foreground">of {totalChunks}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={chunkIndex >= totalChunks - 1}
          onClick={() => setChunkIndex((i) => i + 1)}
        >
          Next
          <ChevronRight className="size-3.5" />
        </Button>
        {chunk && (
          <div className="ml-4 flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Badge
              variant={
                chunk.status === 'translated'
                  ? 'success'
                  : chunk.status === 'reviewed'
                    ? 'accent'
                    : 'outline'
              }
              className="capitalize"
            >
              {chunk.status}
            </Badge>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {chunk?.translatedText && (
            <Button variant="outline" size="sm" disabled={translating} onClick={handleTranslate}>
              {translating ? 'Translating...' : 'Re-translate'}
            </Button>
          )}
          <Button
            variant="accent"
            size="sm"
            disabled={!chunk || translating}
            onClick={handleTranslate}
          >
            {translating ? 'Translating...' : 'Translate'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={bottomTab}
        onValueChange={(v) => setBottomTab(v as BottomTab)}
        className="flex flex-1 min-h-0 gap-0 flex-col"
      >
        {panelCollapsed ? (
          <div className="flex flex-1 min-h-0">{sourceTranslationPanels}</div>
        ) : (
          <ResizablePanelGroup orientation="vertical" className="flex-1 min-h-0">
            <ResizablePanel defaultSize="75%" minSize="40%">
              <div className="flex h-full min-h-0">{sourceTranslationPanels}</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="25%" minSize="10%" maxSize="50%">
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                <TabsContent value="notes" className="mt-0">
                  {editingNotes ? (
                    <Textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      className="min-h-full resize-none text-prose-sm"
                      placeholder="Translation notes (markdown)..."
                    />
                  ) : project.notes ? (
                    <div className="prose-content text-prose-sm">
                      <ReactMarkdown>{project.notes}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Notes will be populated by the AI after translation, or you can add them
                      manually.
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="context" className="mt-0">
                  {editingContext ? (
                    <Textarea
                      value={contextDraft}
                      onChange={(e) => setContextDraft(e.target.value)}
                      className="min-h-full resize-none text-prose-sm"
                      placeholder="Translation instructions (markdown)..."
                    />
                  ) : project.context ? (
                    <div className="rounded border border-border bg-surface-2 p-3 text-prose-sm">
                      <ReactMarkdown>{project.context}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No context set. Add translation instructions in Project Settings.
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="prompt" className="mt-0">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                      Preview of the full prompt sent to the AI (read-only):
                    </p>
                    <pre className="whitespace-pre-wrap rounded border border-border bg-surface-2 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                      {buildPrompt()}
                    </pre>
                  </div>
                </TabsContent>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {/* Bottom Tab Bar — always visible */}
        <div className="shrink-0 border-t border-border bg-surface">
          <div className="flex items-center justify-between px-4">
            <TabsList variant="line">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="context">Context</TabsTrigger>
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-1">
              {bottomTab === 'notes' && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    if (editingNotes) {
                      handleSaveNotes()
                    } else {
                      setNotesDraft(project.notes)
                      setEditingNotes(true)
                    }
                  }}
                >
                  {editingNotes ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
                </Button>
              )}
              {bottomTab === 'context' && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    if (editingContext) {
                      handleSaveContext()
                    } else {
                      setContextDraft(project.context)
                      setEditingContext(true)
                    }
                  }}
                >
                  {editingContext ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Pencil className="size-3.5" />
                  )}
                </Button>
              )}
              <Button variant="ghost" size="icon-xs" onClick={() => setPanelCollapsed((c) => !c)}>
                {panelCollapsed ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
