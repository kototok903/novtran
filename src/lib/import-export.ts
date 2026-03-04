import { z } from "zod";
import type { Project } from "@/lib/types";
import { saveProject } from "@/lib/db";

const ChunkSchema = z.object({
  sourceText: z.string(),
  translatedText: z.string(),
  status: z.enum(["pending", "translated", "reviewed"]),
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  sourceLang: z.string(),
  targetLang: z.string(),
  context: z.string(),
  notes: z.string(),
  model: z.string(),
  chunks: z.array(ChunkSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function exportProject(project: Project): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProject(file: File): Promise<Project> {
  const text = await file.text();
  const data = JSON.parse(text);
  const project = ProjectSchema.parse(data) as Project;
  await saveProject(project);
  return project;
}
