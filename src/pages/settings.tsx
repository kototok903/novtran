import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelect } from "@/components/language-select";
import { useSettings } from "@/hooks/use-settings";
import { getApiKeys, saveApiKeys } from "@/lib/settings";
import type { ApiKeys } from "@/lib/types";
import { ModelSelect } from "@/components/model-select";
import { BackButton } from "@/components/back-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

const PROVIDERS: { key: keyof ApiKeys; label: string }[] = [
  { key: "google", label: "Google (Gemini)" },
  { key: "anthropic", label: "Anthropic (Claude)" },
  { key: "openai", label: "OpenAI" },
];

export function SettingsPage() {
  const [settings, setSettings] = useSettings();
  const [apiKeys, setApiKeysState] = useState<ApiKeys>(getApiKeys);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  function handleApiKeyChange(provider: keyof ApiKeys, value: string) {
    setApiKeysState((prev) => ({ ...prev, [provider]: value }));
  }

  function handleSave() {
    saveApiKeys(apiKeys);
    toast.success("Settings saved");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 h-12">
        <div className="flex items-center gap-3">
          <BackButton />
          <Breadcrumbs
            items={[{ label: "Projects", to: "/" }, { label: "Settings" }]}
          />
        </div>
        <div className="flex items-center gap-1">
          <ThemeSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 flex flex-col gap-10">
        {/* API Keys */}
        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            API Keys
          </h2>
          <div className="flex flex-col gap-4">
            {PROVIDERS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-2">
                <Label htmlFor={key}>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={key}
                    type={visible[key] ? "text" : "password"}
                    value={apiKeys[key] ?? ""}
                    onChange={(e) => handleApiKeyChange(key, e.target.value)}
                    placeholder={`Enter ${label} API key`}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      setVisible((v) => ({ ...v, [key]: !v[key] }))
                    }
                  >
                    {visible[key] ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Defaults */}
        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Defaults
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="defaultSourceLang">
                  Default Source Language
                </Label>
                <LanguageSelect
                  id="defaultSourceLang"
                  value={settings.defaultSourceLang}
                  onValueChange={(v) => setSettings({ defaultSourceLang: v })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="defaultTargetLang">
                  Default Target Language
                </Label>
                <LanguageSelect
                  id="defaultTargetLang"
                  value={settings.defaultTargetLang}
                  onValueChange={(v) => setSettings({ defaultTargetLang: v })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="defaultModel">Default Model</Label>
              <ModelSelect
                id="defaultModel"
                value={settings.defaultModel}
                onValueChange={(v) => setSettings({ defaultModel: v })}
              />
            </div>
          </div>
        </section>

        <div>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </main>
    </div>
  );
}
