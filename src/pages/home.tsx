import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  Settings,
  MoreVertical,
  Upload,
  Plus,
  Download,
  Trash2,
  Github,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEFAULT_PROJECT_NAME,
  EMPTY_PROJECT_NAME,
  type Project,
} from "@/lib/types";
import { getProjects, saveProject, deleteProject } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { exportProject, importProject } from "@/lib/import-export";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createProjectId } from "@/lib/ids";

export function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  async function handleNewProject() {
    const defaults = getSettings();
    const project: Project = {
      id: createProjectId(),
      name: DEFAULT_PROJECT_NAME,
      sourceLang: defaults.defaultSourceLang,
      targetLang: defaults.defaultTargetLang,
      context: "",
      notes: "",
      model: defaults.defaultModel,
      chunks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveProject(project);
    navigate(`/project/${project.id}/settings`);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importProject(file);
      setProjects(await getProjects());
      toast.success("Project imported");
    } catch {
      toast.error("Failed to import project. Invalid file format.");
    }
    e.target.value = "";
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteProject(deleteTarget.id);
    setProjects(await getProjects());
    setDeleteTarget(null);
    toast.success("Project deleted");
  }

  const sorted = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg">
            <span className="text-xl font-heading font-semibold">NovTran</span>{" "}
            — Translate a lot
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" asChild>
              <a href="https://github.com/kototok903/novtran" target="_blank">
                <Github className="size-4" />
              </a>
            </Button>
            <ThemeSwitcher />
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/settings">
                <Settings className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Projects
          </h2>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Import
            </Button>
            <Button size="sm" onClick={handleNewProject}>
              <Plus className="size-4" />
              New Project
            </Button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No projects yet</p>
            <p className="mt-1 text-sm text-dim-foreground">
              Create a new project or import an existing one
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {sorted.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={(projectId) => navigate(`/project/${projectId}`)}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              {deleteTarget?.name || EMPTY_PROJECT_NAME}"? This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type ProjectCardProps = {
  project: Project;
  onOpen: (projectId: string) => void;
  onDelete: (project: Project) => void;
};

function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors"
      onClick={() => onOpen(project.id)}
    >
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium">{project.name || EMPTY_PROJECT_NAME}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="secondary">
                {project.sourceLang.toUpperCase()} →{" "}
                {project.targetLang.toUpperCase()}
              </Badge>
              <span>{project.chunks.length} chunks</span>
              <span>
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportProject(project)}>
                <Download />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(project)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
