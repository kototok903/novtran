import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Pencil, Trash2, Plus, Settings, FileText, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BackButton } from "@/components/back-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { Project } from "@/lib/types";
import { getProject, saveProject } from "@/lib/db";

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [renameIndex, setRenameIndex] = useState<number | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) getProject(id).then((p) => setProject(p ?? null));
  }, [id]);

  const persist = useCallback(async (updated: Project) => {
    const withTimestamp = { ...updated, updatedAt: new Date().toISOString() };
    await saveProject(withTimestamp);
    setProject(withTimestamp);
  }, []);

  function openRenameDialog(index: number) {
    setRenameIndex(index);
    setNameDraft(project?.chunks[index]?.name ?? "");
  }

  function closeRenameDialog() {
    setRenameIndex(null);
    setNameDraft("");
  }

  async function handleRename() {
    if (!project || renameIndex === null) return;
    const chunks = [...project.chunks];
    chunks[renameIndex] = { ...chunks[renameIndex], name: nameDraft.trim() };
    await persist({ ...project, chunks });
    closeRenameDialog();
  }

  async function handleDelete() {
    if (!project || deleteIndex === null) return;
    const chunks = project.chunks.filter((_, i) => i !== deleteIndex);
    await persist({ ...project, chunks });
    setDeleteIndex(null);
    toast.success("Chunk deleted");
  }

  if (!project) return null;

  const translatedCount = project.chunks.filter(
    (c) => c.status === "translated" || c.status === "reviewed"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 h-12">
        <div className="flex items-center gap-3">
          <BackButton />
          <Breadcrumbs
            items={[{ label: "Projects", to: "/" }, { label: project.name }]}
          />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to={`/project/${id}/settings`}>
                <Wrench className="size-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to={`/project/${id}/full-text`}>
                <FileText className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to="/settings">
              <Settings className="size-4" />
            </Link>
          </Button>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Project Info */}
        <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {project.sourceLang.toUpperCase()} →{" "}
            {project.targetLang.toUpperCase()}
          </Badge>
          <span>
            {project.chunks.length} chunks,&ensp;{translatedCount} translated
          </span>
          <span className="text-dim-foreground">Model: {project.model}</span>
        </div>

        {/* Chunk List Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Chunks</h2>
          <Button size="sm" asChild>
            <Link to={`/project/${id}/chunk/new`}>
              <Plus className="size-3.5" />
              Add Chunk
            </Link>
          </Button>
        </div>

        {/* Chunk List */}
        {project.chunks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No chunks yet</p>
            <p className="mt-1 text-sm text-dim-foreground">
              Add a chunk to start translating
            </p>
            <Button size="sm" className="mt-4" asChild>
              <Link to={`/project/${id}/chunk/new`}>
                <Plus className="size-3.5" />
                Add Chunk
              </Link>
            </Button>
          </div>
        ) : (
          <div>
            {project.chunks.map((chunk, i) => (
              <ChunkRow
                key={i}
                index={i}
                chunk={chunk}
                onOpen={() => navigate(`/project/${id}/chunk/${i + 1}`)}
                onRename={() => openRenameDialog(i)}
                onDelete={() => setDeleteIndex(i)}
              />
            ))}
          </div>
        )}
      </main>

      <RenameChunkDialog
        open={renameIndex !== null}
        nameDraft={nameDraft}
        onNameDraftChange={setNameDraft}
        onClose={closeRenameDialog}
        onSave={handleRename}
      />

      <DeleteChunkDialog
        open={deleteIndex !== null}
        chunkName={
          deleteIndex !== null ? project.chunks[deleteIndex]?.name : ""
        }
        onClose={() => setDeleteIndex(null)}
        onDelete={handleDelete}
      />
    </div>
  );
}

type ChunkRowProps = {
  index: number;
  chunk: Project["chunks"][number];
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
};

function ChunkRow({ index, chunk, onOpen, onRename, onDelete }: ChunkRowProps) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-2 border-b border-border px-2 py-2.5 hover:bg-surface-2"
      onClick={onOpen}
    >
      <span className="shrink-0 font-mono text-sm text-muted-foreground">
        {index + 1}.
      </span>
      <div className="min-w-0 flex flex-1 items-center gap-6">
        <span className="truncate text-sm font-medium">
          {chunk.name || "Untitled"}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {chunk.sourceText.trim()}
        </span>
      </div>
      <Badge
        variant={
          chunk.status === "translated"
            ? "success"
            : chunk.status === "reviewed"
              ? "accent"
              : "outline"
        }
        className="shrink-0 capitalize"
      >
        {chunk.status}
      </Badge>
      <div
        className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon-xs" onClick={onRename}>
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={onDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

type RenameChunkDialogProps = {
  open: boolean;
  nameDraft: string;
  onNameDraftChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

function RenameChunkDialog({
  open,
  nameDraft,
  onNameDraftChange,
  onClose,
  onSave,
}: RenameChunkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename chunk</DialogTitle>
          <DialogDescription>
            Update the chunk name shown in the project list.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={nameDraft}
          onChange={(e) => onNameDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onClose();
          }}
          autoFocus
          placeholder="Untitled"
        />
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DeleteChunkDialogProps = {
  open: boolean;
  chunkName: string;
  onClose: () => void;
  onDelete: () => void;
};

function DeleteChunkDialog({
  open,
  chunkName,
  onClose,
  onDelete,
}: DeleteChunkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete chunk</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{chunkName || "Untitled"}"? This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
