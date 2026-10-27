import path from "node:path";
import type { Folder } from "../src/lib/storage";

/** Sama dengan STORAGE_DIR di src/lib/storage.ts (file itu bertanda server-only). */
export const STORAGE_DIR_SCRIPT = path.join(process.cwd(), "storage");

export type FolderScript = Folder;
