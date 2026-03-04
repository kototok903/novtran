import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Project } from '@/lib/types'
import { getProject, saveProject } from '@/lib/db'

const COMMON_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'ru', label: 'Russian' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'pl', label: 'Polish' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
]

export function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (id) getProject(id).then((p) => setProject(p ?? null))
  }, [id])

  if (!project) return null

  function update(fields: Partial<Project>) {
    setProject((prev) => (prev ? { ...prev, ...fields } : prev))
    setSaved(false)
  }

  async function handleSave() {
    if (!project) return
    const updated = { ...project, updatedAt: new Date().toISOString() }
    await saveProject(updated)
    setProject(updated)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/project/${id}`} className="text-sm text-fg-muted hover:text-foreground">
              &larr; Workspace
            </Link>
            <span className="text-fg-dim">|</span>
            <h1 className="text-sm font-semibold">{project.name}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h2 className="mb-6 text-sm font-semibold text-fg-muted uppercase tracking-widest">
          Project Settings
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={project.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceLang">Source Language</Label>
              <Select
                value={project.sourceLang}
                onValueChange={(v) => update({ sourceLang: v })}
              >
                <SelectTrigger id="sourceLang">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label} ({lang.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetLang">Target Language</Label>
              <Select
                value={project.targetLang}
                onValueChange={(v) => update({ targetLang: v })}
              >
                <SelectTrigger id="targetLang">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label} ({lang.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={project.model}
              onChange={(e) => update({ model: e.target.value })}
              placeholder="e.g. gemini-2.0-flash"
            />
            <p className="text-xs text-fg-dim">
              The model identifier sent to the AI provider (e.g. gemini-2.0-flash,
              claude-sonnet-4-5-20250929)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Translation Context / Instructions</Label>
            <Textarea
              id="context"
              value={project.context}
              onChange={(e) => update({ context: e.target.value })}
              placeholder="e.g. Translate in a literary, slightly archaic Ukrainian style. Prefer Ukrainian-origin words over Russian borrowings..."
              className="min-h-[160px] font-prose"
            />
            <p className="text-xs text-fg-dim">
              Markdown instructions included in every translation prompt
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>Save</Button>
            {saved && <span className="text-sm text-success">Saved</span>}
            <div className="ml-auto">
              <Button variant="outline" onClick={() => navigate(`/project/${id}`)}>
                Go to Workspace
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
