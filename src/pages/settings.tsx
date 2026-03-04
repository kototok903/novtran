import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings } from '@/hooks/use-settings'
import { getApiKeys, saveApiKeys } from '@/lib/settings'
import type { ApiKeys } from '@/lib/types'

const PROVIDERS: { key: keyof ApiKeys; label: string }[] = [
  { key: 'google', label: 'Google (Gemini)' },
  { key: 'anthropic', label: 'Anthropic (Claude)' },
  { key: 'openai', label: 'OpenAI' },
]

export function SettingsPage() {
  const [settings, setSettings] = useSettings()
  const [apiKeys, setApiKeysState] = useState<ApiKeys>(getApiKeys)
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  function handleApiKeyChange(provider: keyof ApiKeys, value: string) {
    setApiKeysState((prev) => ({ ...prev, [provider]: value }))
    setSaved(false)
  }

  function handleSave() {
    saveApiKeys(apiKeys)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-fg-muted hover:text-foreground">
              &larr; Projects
            </Link>
            <span className="text-fg-dim">|</span>
            <h1 className="text-sm font-semibold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-10">
        {/* API Keys */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-fg-muted uppercase tracking-widest">
            API Keys
          </h2>
          <div className="space-y-4">
            {PROVIDERS.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={key}
                    type={visible[key] ? 'text' : 'password'}
                    value={apiKeys[key] ?? ''}
                    onChange={(e) => handleApiKeyChange(key, e.target.value)}
                    placeholder={`Enter ${label} API key`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
                  >
                    {visible[key] ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Defaults */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-fg-muted uppercase tracking-widest">
            Defaults
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultSourceLang">Default Source Language</Label>
                <Input
                  id="defaultSourceLang"
                  value={settings.defaultSourceLang}
                  onChange={(e) => setSettings({ defaultSourceLang: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTargetLang">Default Target Language</Label>
                <Input
                  id="defaultTargetLang"
                  value={settings.defaultTargetLang}
                  onChange={(e) => setSettings({ defaultTargetLang: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultModel">Default Model</Label>
              <Input
                id="defaultModel"
                value={settings.defaultModel}
                onChange={(e) => setSettings({ defaultModel: e.target.value })}
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Save API Keys</Button>
          {saved && <span className="text-sm text-success">Saved</span>}
        </div>
      </main>
    </div>
  )
}
