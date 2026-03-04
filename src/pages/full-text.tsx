import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Project } from '@/lib/types'
import { getProject } from '@/lib/db'

export function FullTextPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(1)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (id)
      getProject(id).then((p) => {
        if (p) {
          setProject(p)
          setFrom(1)
          setTo(p.chunks.length)
        }
      })
  }, [id])

  if (!project) return null

  const totalChunks = project.chunks.length
  const safeFrom = Math.max(1, Math.min(from, totalChunks))
  const safeTo = Math.max(safeFrom, Math.min(to, totalChunks))

  const selectedChunks = project.chunks.slice(safeFrom - 1, safeTo)
  const fullText = selectedChunks
    .map((c) => c.translatedText)
    .filter(Boolean)
    .join('\n\n')

  async function handleCopy() {
    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/project/${id}`}
              className="text-sm text-fg-muted hover:text-foreground"
            >
              &larr; Workspace
            </Link>
            <span className="text-fg-dim">|</span>
            <h1 className="text-sm font-semibold">{project.name}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg-muted uppercase tracking-widest">
            Full Text View
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!fullText}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>

        {totalChunks > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <Label className="text-xs text-fg-muted">Chunks</Label>
            <Input
              type="number"
              min={1}
              max={totalChunks}
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-fg-dim">to</span>
            <Input
              type="number"
              min={1}
              max={totalChunks}
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-fg-dim">of {totalChunks}</span>
          </div>
        )}

        {fullText ? (
          <div className="rounded-lg border border-border bg-surface p-8">
            <div className="font-prose text-[15px] leading-[1.85]">
              {fullText.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4">
                  {para}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-fg-muted">No translations yet</p>
            <p className="mt-1 text-sm text-fg-dim">
              Translate some chunks first, then come back here to see the full text
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
