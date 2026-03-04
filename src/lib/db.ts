import { openDB, type IDBPDatabase } from "idb";
import type { Project } from "@/lib/types";

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
  return db.getAll(STORE_NAME);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, project);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
