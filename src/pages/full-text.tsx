import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Project } from "@/lib/types";
import { getProject } from "@/lib/db";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Settings } from "lucide-react";
import { BackButton } from "@/components/back-button";

export function FullTextPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);

  useEffect(() => {
    if (id)
      getProject(id).then((p) => {
        if (p) {
          setProject(p);
          setFrom(1);
          setTo(p.chunks.length);
        }
      });
  }, [id]);

  if (!project) return null;

  const totalChunks = project.chunks.length;
  const safeFrom = Math.max(1, Math.min(from, totalChunks));
  const safeTo = Math.max(safeFrom, Math.min(to, totalChunks));

  const selectedChunks = project.chunks.slice(safeFrom - 1, safeTo);
  const fullText = selectedChunks
    .map((c) => c.translatedText)
    .filter(Boolean)
    .join("\n\n");

  async function handleCopy() {
    await navigator.clipboard.writeText(fullText);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 h-12">
        <div className="flex items-center gap-3">
          <BackButton />
          <Breadcrumbs
            items={[
              { label: "Projects", to: "/" },
              { label: project.name, to: `/project/${id}` },
              { label: "Full Text" },
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

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Full Text View
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={!fullText}
          >
            Copy to Clipboard
          </Button>
        </div>

        {totalChunks > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <Label className="text-xs text-muted-foreground">Chunks</Label>
            <Input
              type="number"
              min={1}
              max={totalChunks}
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-dim-foreground">to</span>
            <Input
              type="number"
              min={1}
              max={totalChunks}
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-dim-foreground">of {totalChunks}</span>
          </div>
        )}

        {fullText ? (
          <div className="rounded-lg border border-border bg-surface p-8">
            <div className="font-prose text-prose">
              {fullText.split("\n\n").map((para, i) => (
                <p key={i} className="mb-4">
                  {para}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No translations yet</p>
            <p className="mt-1 text-sm text-dim-foreground">
              Translate some chunks first, then come back here to see the full
              text
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
