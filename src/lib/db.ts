import { openDB, type IDBPDatabase } from "idb";
import type { Project } from "@/lib/types";
import { normalizeProject } from "@/lib/normalize";

const DB_NAME = "novtran";
const DB_VERSION = 1;
const STORE_NAME = "projects";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function getProjects(): Promise<Project[]> {
  const db = await getDB();
  const projects = await db.getAll(STORE_NAME);
  const normalized = projects.map(normalizeProject);

  await Promise.all(
    normalized
      .filter(({ changed }) => changed)
      .map(({ value }) => db.put(STORE_NAME, value))
  );

  return normalized.map(({ value }) => value);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  const project = await db.get(STORE_NAME, id);
  if (!project) return undefined;

  const normalized = normalizeProject(project);
  if (normalized.changed) {
    await db.put(STORE_NAME, normalized.value);
  }

  return normalized.value;
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, project);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
