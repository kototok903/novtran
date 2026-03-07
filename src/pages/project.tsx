import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Pencil,
  Trash2,
  Plus,
  Settings,
  FileText,
  Wrench,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BackButton } from "@/components/back-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  EMPTY_CHUNK_NAME,
  EMPTY_PROJECT_NAME,
  type ChunkStatus,
  type Project,
} from "@/lib/types";
import { getProject, saveProject } from "@/lib/db";
import { getModelLabel } from "@/lib/models";

// Temp, until "reviewed" status is implemented
const EDITABLE_CHUNK_STATUSES = ["pending", "translated"] as const;

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [editChunkId, setEditChunkId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [statusDraft, setStatusDraft] =
    useState<(typeof EDITABLE_CHUNK_STATUSES)[number]>("pending");
  const [deleteChunkId, setDeleteChunkId] = useState<string | null>(null);

  useEffect(() => {
    if (id) getProject(id).then((p) => setProject(p ?? null));
  }, [id]);

  const persist = useCallback(async (updated: Project) => {
    const withTimestamp = { ...updated, updatedAt: new Date().toISOString() };
    await saveProject(withTimestamp);
    setProject(withTimestamp);
  }, []);

  function openEditDialog(chunkId: string) {
    const chunk = project?.chunks.find((item) => item.id === chunkId);
    if (!chunk) return;

    setEditChunkId(chunkId);
    setNameDraft(chunk.name);
    setStatusDraft(chunk.status === "pending" ? "pending" : "translated");
  }

  function closeEditDialog() {
    setEditChunkId(null);
    setNameDraft("");
    setStatusDraft("pending");
  }

  async function handleEdit() {
    if (!project || editChunkId === null) return;
    const index = project.chunks.findIndex((chunk) => chunk.id === editChunkId);
    if (index < 0) return;

    const chunks = [...project.chunks];
    chunks[index] = {
      ...chunks[index],
      name: nameDraft.trim(),
      status: statusDraft as ChunkStatus,
    };
    await persist({ ...project, chunks });
    closeEditDialog();
  }

  async function handleDelete() {
    if (!project || deleteChunkId === null) return;
    const chunks = project.chunks.filter((chunk) => chunk.id !== deleteChunkId);
    await persist({ ...project, chunks });
    setDeleteChunkId(null);
    toast.success("Chunk deleted");
  }

  async function moveChunk(chunkId: string, direction: -1 | 1) {
    if (!project) return;

    const index = project.chunks.findIndex((chunk) => chunk.id === chunkId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= project.chunks.length)
      return;

    const chunks = [...project.chunks];
    [chunks[index], chunks[nextIndex]] = [chunks[nextIndex], chunks[index]];
    await persist({ ...project, chunks });
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
            items={[
              { label: "Projects", to: "/" },
              { label: project.name || EMPTY_PROJECT_NAME },
            ]}
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
          <span className="text-dim-foreground">
            Model: {getModelLabel(project.model)}
          </span>
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
          <div className="grid gap-3">
            {project.chunks.map((chunk, i) => (
              <ChunkRow
                key={chunk.id}
                index={i}
                chunk={chunk}
                canMoveUp={i > 0}
                canMoveDown={i < project.chunks.length - 1}
                onOpen={() => navigate(`/project/${id}/chunk/${chunk.id}`)}
                onEdit={() => openEditDialog(chunk.id)}
                onDelete={() => setDeleteChunkId(chunk.id)}
                onMoveUp={() => moveChunk(chunk.id, -1)}
                onMoveDown={() => moveChunk(chunk.id, 1)}
              />
            ))}
          </div>
        )}
      </main>

      <EditChunkDialog
        open={editChunkId !== null}
        nameDraft={nameDraft}
        onNameDraftChange={setNameDraft}
        statusDraft={statusDraft}
        onStatusDraftChange={setStatusDraft}
        onClose={closeEditDialog}
        onSave={handleEdit}
      />

      <DeleteChunkDialog
        open={deleteChunkId !== null}
        chunkName={
          project.chunks.find((chunk) => chunk.id === deleteChunkId)?.name ?? ""
        }
        onClose={() => setDeleteChunkId(null)}
        onDelete={handleDelete}
      />
    </div>
  );
}

type ChunkRowProps = {
  index: number;
  chunk: Project["chunks"][number];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

function ChunkRow({
  index,
  chunk,
  canMoveUp,
  canMoveDown,
  onOpen,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ChunkRowProps) {
  const statusVariant =
    chunk.status === "translated"
      ? "success"
      : chunk.status === "reviewed"
        ? "accent"
        : "outline";

  return (
    <Card className="min-w-0 cursor-pointer transition-colors" onClick={onOpen}>
      <CardContent className="flex items-center gap-3">
        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-mono text-sm text-muted-foreground self-end">
                {index + 1}.
              </span>
              <p className="min-w-0 truncate font-medium">
                {chunk.name || EMPTY_CHUNK_NAME}
              </p>
            </div>
            <Badge variant={statusVariant} className="shrink-0 capitalize">
              {chunk.status}
            </Badge>
          </div>

          <div className="flex items-center">
            <span className="min-w-0 text-xs text-muted-foreground truncate">
              {chunk.sourceText.trim()}
            </span>
          </div>
        </div>

        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={!canMoveUp} onClick={onMoveUp}>
                <ChevronUp />
                Move Up
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canMoveDown} onClick={onMoveDown}>
                <ChevronDown />
                Move Down
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
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

type EditChunkDialogProps = {
  open: boolean;
  nameDraft: string;
  onNameDraftChange: (value: string) => void;
  statusDraft: (typeof EDITABLE_CHUNK_STATUSES)[number];
  onStatusDraftChange: (
    value: (typeof EDITABLE_CHUNK_STATUSES)[number]
  ) => void;
  onClose: () => void;
  onSave: () => void;
};

function EditChunkDialog({
  open,
  nameDraft,
  onNameDraftChange,
  statusDraft,
  onStatusDraftChange,
  onClose,
  onSave,
}: EditChunkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit chunk</DialogTitle>
          <DialogDescription>
            Update the chunk name and translation status shown in the project
            list.
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
          placeholder={EMPTY_CHUNK_NAME}
        />
        <Select
          value={statusDraft}
          onValueChange={(value) =>
            onStatusDraftChange(
              value as (typeof EDITABLE_CHUNK_STATUSES)[number]
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {EDITABLE_CHUNK_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            Are you sure you want to delete "{chunkName || EMPTY_CHUNK_NAME}"?
            This cannot be undone.
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
