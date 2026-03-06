import { EMPTY_PROJECT_NAME, type Project } from "@/lib/types";
import { saveProject } from "@/lib/db";
import { normalizeProject } from "@/lib/normalize";

export function exportProject(project: Project): void {
  const fileBaseName = (project.name || EMPTY_PROJECT_NAME)
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileBaseName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProject(file: File): Promise<Project> {
  const text = await file.text();
  const data = JSON.parse(text);
  const { value: project } = normalizeProject(data);
  await saveProject(project);
  return project;
}
