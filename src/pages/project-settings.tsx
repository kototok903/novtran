import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSelect } from "@/components/language-select";
import { ModelSelect } from "@/components/model-select";
import { toast } from "sonner";
import { EMPTY_PROJECT_NAME, type Project } from "@/lib/types";
import { getProject, saveProject } from "@/lib/db";
import { Settings } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { BackButton } from "@/components/back-button";

export function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) getProject(id).then((p) => setProject(p ?? null));
  }, [id]);

  if (!project) return null;

  function update(fields: Partial<Project>) {
    setProject((prev) => (prev ? { ...prev, ...fields } : prev));
  }

  async function handleSave() {
    if (!project) return;
    const updated = { ...project, updatedAt: new Date().toISOString() };
    await saveProject(updated);
    setProject(updated);
    toast.success("Settings saved");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 h-12">
        <div className="flex items-center gap-3">
          <BackButton />
          <Breadcrumbs
            items={[
              { label: "Projects", to: "/" },
              {
                label: project.name || EMPTY_PROJECT_NAME,
                to: `/project/${id}`,
              },
              { label: "Settings" },
            ]}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to={`/settings`}>
              <Settings className="size-4" />
            </Link>
          </Button>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h2 className="mb-6 text-sm font-medium text-muted-foreground">
          Project Settings
        </h2>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={project.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder={EMPTY_PROJECT_NAME}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sourceLang">Source Language</Label>
              <LanguageSelect
                id="sourceLang"
                value={project.sourceLang}
                onValueChange={(v) => update({ sourceLang: v })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="targetLang">Target Language</Label>
              <LanguageSelect
                id="targetLang"
                value={project.targetLang}
                onValueChange={(v) => update({ targetLang: v })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="model">Model</Label>
            <ModelSelect
              id="model"
              value={project.model}
              onValueChange={(v) => update({ model: v })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="context">Translation Context / Instructions</Label>
            <Textarea
              id="context"
              value={project.context}
              onChange={(e) => update({ context: e.target.value })}
              placeholder="e.g. Translate in a literary, slightly archaic Ukrainian style. Prefer Ukrainian-origin words over Russian borrowings..."
              className="min-h-[160px] font-prose"
            />
            <p className="text-xs text-dim-foreground">
              Markdown instructions included in every translation prompt
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>Save</Button>
            <div className="ml-auto">
              <Button
                variant="secondary"
                onClick={() => navigate(`/project/${id}`)}
              >
                Go to Workspace
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
