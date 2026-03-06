import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import type { Chunk, Project } from "@/lib/types";
import { getProject, saveProject } from "@/lib/db";
import { translateChunk } from "@/lib/translate";
import { toast } from "sonner";
import {
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Check,
  ChevronDown,
  ChevronUp,
  Wrench,
  X,
  Copy,
} from "lucide-react";
import { ReadableTextarea } from "@/components/readable-textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/back-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

type BottomTab = "notes" | "context" | "prompt";

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [sourceInput, setSourceInput] = useState("");
  const [bottomTab, setBottomTab] = useState<BottomTab>("notes");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [editingContext, setEditingContext] = useState(false);
  const [contextDraft, setContextDraft] = useState("");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (id) getProject(id).then((p) => setProject(p ?? null));
  }, [id]);

  const chunk: Chunk | undefined = project?.chunks[chunkIndex];
  const totalChunks = project?.chunks.length ?? 0;

  const persist = useCallback(async (updated: Project) => {
    const withTimestamp = { ...updated, updatedAt: new Date().toISOString() };
    await saveProject(withTimestamp);
    setProject(withTimestamp);
  }, []);

  async function handleAddChunk() {
    if (!project || !sourceInput.trim()) return;
    const newChunk: Chunk = {
      sourceText: sourceInput,
      translatedText: "",
      status: "pending",
    };
    const updated = { ...project, chunks: [...project.chunks, newChunk] };
    await persist(updated);
    setChunkIndex(updated.chunks.length - 1);
    setSourceInput("");
  }

  async function handleSaveSource(newValue: string) {
    if (!project || !chunk) return;
    const chunks = [...project.chunks];
    chunks[chunkIndex] = { ...chunk, sourceText: newValue };
    await persist({ ...project, chunks });
  }

  async function handleSaveTranslation(newValue: string) {
    if (!project || !chunk) return;
    const chunks = [...project.chunks];
    chunks[chunkIndex] = { ...chunk, translatedText: newValue };
    await persist({ ...project, chunks });
  }

  async function handleSaveNotes() {
    if (!project) return;
    await persist({ ...project, notes: notesDraft });
    setEditingNotes(false);
  }

  async function handleSaveContext() {
    if (!project) return;
    await persist({ ...project, context: contextDraft });
    setEditingContext(false);
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  async function handleTranslate() {
    if (!project || !chunk) return;
    setTranslating(true);
    try {
      const result = await translateChunk({
        sourceText: chunk.sourceText,
        notes: project.notes,
        context: project.context,
        sourceLang: project.sourceLang,
        targetLang: project.targetLang,
        model: project.model,
      });
      const chunks = [...project.chunks];
      chunks[chunkIndex] = {
        ...chunk,
        translatedText: result.translation,
        status: "translated",
      };
      await persist({ ...project, chunks, notes: result.notes });
      toast.success("Chunk translated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslating(false);
    }
  }

  function buildPrompt(): string {
    if (!project) return "";
    const source = chunk?.sourceText ?? sourceInput;
    return `System: You are a literary translator. Translate from ${project.sourceLang} to ${project.targetLang}.

${project.context ? `${project.context}\n` : ""}Here are your accumulated notes about this text:
${project.notes || "(no notes yet)"}

Translate the following text. Return:
1. The translation
2. Updated notes — rewrite the full notes block. Preserve all existing notes. Only add or modify entries, never remove unless explicitly asked.

Source text:
${source}`;
  }

  if (!project) return null;

  const sourceTranslationPanels = (
    <>
      <TextPanel
        key={`source-${chunkIndex}`}
        label={`Source — ${project.sourceLang.toUpperCase()}`}
        value={chunk?.sourceText ?? ""}
        onSave={handleSaveSource}
        onCopy={() => handleCopy(chunk?.sourceText ?? "")}
        copyDisabled={!chunk?.sourceText}
        editDisabled={!chunk || translating}
        placeholder="No source text."
        className="border-r border-border bg-panel-source"
        emptyState={
          !chunk ? (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto">
                <ReadableTextarea
                  editing
                  value={sourceInput}
                  onChange={setSourceInput}
                  placeholderEdit="Paste source text here to create a new chunk..."
                  className="font-prose text-prose! p-5 whitespace-pre-wrap"
                />
              </div>
              <div className="flex justify-end px-4 py-2 bg-surface-1 border-t">
                <Button
                  variant="accent"
                  onClick={handleAddChunk}
                  disabled={!sourceInput.trim()}
                >
                  Add Chunk
                </Button>
              </div>
            </div>
          ) : undefined
        }
      />
      <TextPanel
        key={`translation-${chunkIndex}`}
        label={`Translation — ${project.targetLang.toUpperCase()}`}
        value={chunk?.translatedText ?? ""}
        onSave={handleSaveTranslation}
        onCopy={() => handleCopy(chunk?.translatedText ?? "")}
        copyDisabled={!chunk?.translatedText || translating}
        editDisabled={!chunk || translating}
        placeholder={
          chunk
            ? "Translation will appear here after you press Translate."
            : undefined
        }
        className="bg-panel-translation"
      />
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface h-12 px-4">
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
            <Link to={`/settings`}>
              <Settings className="size-4" />
            </Link>
          </Button>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Chunk Navigation Bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-background px-4 py-1.5">
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
            {totalChunks === 0 ? "No chunks" : `Chunk ${chunkIndex + 1}`}
          </span>
          {totalChunks > 0 && (
            <span className="text-xs text-muted-foreground">
              of {totalChunks}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          disabled={chunkIndex >= totalChunks}
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
                chunk.status === "translated"
                  ? "success"
                  : chunk.status === "reviewed"
                    ? "accent"
                    : "outline"
              }
              className="capitalize"
            >
              {chunk.status}
            </Badge>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {chunk && (
            <Button
              variant={chunk?.translatedText ? "secondary" : "accent"}
              size="sm"
              disabled={translating}
              onClick={handleTranslate}
            >
              {translating
                ? "Translating..."
                : chunk?.translatedText
                  ? "Re-translate"
                  : "Translate"}
            </Button>
          )}
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
          <ResizablePanelGroup
            orientation="vertical"
            className="flex-1 min-h-0"
          >
            <ResizablePanel defaultSize="75%" minSize="40%">
              <div className="flex h-full min-h-0">
                {sourceTranslationPanels}
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              defaultSize="25%"
              minSize="10%"
              maxSize="50%"
              className="flex flex-col"
            >
              <BottomTabBar
                bottomTab={bottomTab}
                editingNotes={editingNotes}
                editingContext={editingContext}
                panelCollapsed={panelCollapsed}
                editNotes={() => {
                  setNotesDraft(project.notes);
                  setEditingNotes(true);
                }}
                editContext={() => {
                  setContextDraft(project.context);
                  setEditingContext(true);
                }}
                saveEditNotes={handleSaveNotes}
                saveEditContext={handleSaveContext}
                cancelEditNotes={() => setEditingNotes(false)}
                cancelEditContext={() => setEditingContext(false)}
                onToggleCollapse={() => setPanelCollapsed((c) => !c)}
              />
              <div className="flex-1 min-h-0 overflow-y-auto bg-surface">
                <TabsContent value="notes" className="mt-0 h-full">
                  <ReadableTextarea
                    editing={editingNotes}
                    value={editingNotes ? notesDraft : project.notes}
                    onChange={setNotesDraft}
                    placeholderEdit="Translation notes (markdown)..."
                    placeholderRead="Notes will be populated by the AI after translation, or you can add them manually."
                    markdown
                    className="prose-content text-prose-sm! p-4"
                  />
                </TabsContent>
                <TabsContent value="context" className="mt-0 h-full">
                  <ReadableTextarea
                    editing={editingContext}
                    value={editingContext ? contextDraft : project.context}
                    onChange={setContextDraft}
                    placeholderEdit="Translation instructions (markdown)..."
                    placeholderRead="No context provided."
                    markdown
                    className="prose-content text-prose-sm! p-4"
                  />
                </TabsContent>
                <TabsContent value="prompt" className="mt-0 h-full">
                  <div className="flex flex-col gap-2 p-4">
                    <p className="text-xs text-muted-foreground">
                      Preview of the full prompt sent to the AI (read-only):
                    </p>
                    <pre className="whitespace-pre-wrap rounded border border-border bg-background p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                      {buildPrompt()}
                    </pre>
                  </div>
                </TabsContent>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {panelCollapsed && (
          <BottomTabBar
            bottomTab={bottomTab}
            editingNotes={editingNotes}
            editingContext={editingContext}
            panelCollapsed={panelCollapsed}
            editNotes={() => {
              setNotesDraft(project.notes);
              setEditingNotes(true);
            }}
            editContext={() => {
              setContextDraft(project.context);
              setEditingContext(true);
            }}
            saveEditNotes={handleSaveNotes}
            saveEditContext={handleSaveContext}
            cancelEditNotes={() => setEditingNotes(false)}
            cancelEditContext={() => setEditingContext(false)}
            onToggleCollapse={() => setPanelCollapsed((c) => !c)}
          />
        )}
      </Tabs>
    </div>
  );
}

type TextPanelProps = {
  label: string;
  value: string;
  onSave: (newValue: string) => void | Promise<void>;
  onCopy: () => void;
  copyDisabled?: boolean;
  editDisabled?: boolean;
  placeholder?: string;
  className?: string;
  emptyState?: React.ReactNode;
};

function TextPanel({
  label,
  value,
  onSave,
  onCopy,
  copyDisabled,
  editDisabled,
  placeholder,
  className,
  emptyState,
}: TextPanelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div className={cn("flex w-1/2 min-h-0 flex-col", className)}>
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 h-9">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={async () => {
                  await onSave(draft);
                  setEditing(false);
                }}
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setEditing(false)}
              >
                <X className="size-3.5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={editDisabled}
              onClick={() => {
                setDraft(value);
                setEditing(true);
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={copyDisabled}
            onClick={onCopy}
          >
            <Copy className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {emptyState ?? (
          <ReadableTextarea
            editing={editing}
            value={editing ? draft : value}
            onChange={setDraft}
            placeholderEdit={placeholder}
            placeholderRead={placeholder}
            className="font-prose text-prose! p-5 whitespace-pre-wrap"
          />
        )}
      </div>
    </div>
  );
}

type BottomTabBarProps = {
  bottomTab: BottomTab;
  editingNotes: boolean;
  editingContext: boolean;
  panelCollapsed: boolean;
  editNotes: () => void;
  editContext: () => void;
  saveEditNotes: () => void;
  saveEditContext: () => void;
  cancelEditNotes: () => void;
  cancelEditContext: () => void;
  onToggleCollapse: () => void;
};

function BottomTabBar({
  bottomTab,
  editingNotes,
  editingContext,
  panelCollapsed,
  editNotes,
  editContext,
  saveEditNotes,
  saveEditContext,
  cancelEditNotes,
  cancelEditContext,
  onToggleCollapse,
}: BottomTabBarProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-b border-border bg-background",
        panelCollapsed && "border-t"
      )}
    >
      <div className="flex items-center justify-between px-4">
        <TabsList variant="line">
          <TabsTrigger value="notes">AI Notes</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-1">
          {bottomTab === "notes" &&
            (editingNotes ? (
              <>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={panelCollapsed}
                  onClick={saveEditNotes}
                >
                  <Check className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={panelCollapsed}
                  onClick={cancelEditNotes}
                >
                  <X className="size-3.5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={panelCollapsed}
                onClick={editNotes}
              >
                <Pencil className="size-3.5" />
              </Button>
            ))}
          {bottomTab === "context" &&
            (editingContext ? (
              <>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={panelCollapsed}
                  onClick={saveEditContext}
                >
                  <Check className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={panelCollapsed}
                  onClick={cancelEditContext}
                >
                  <X className="size-3.5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={panelCollapsed}
                onClick={editContext}
              >
                <Pencil className="size-3.5" />
              </Button>
            ))}
          <Button variant="ghost" size="icon-xs" onClick={onToggleCollapse}>
            {panelCollapsed ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
