import { invoke } from "@tauri-apps/api/core";

export interface DirEntry {
  name: string;
  path: string;
  is_dir: boolean;
}

/**
 * Read file content
 */
export async function readFile(path: string): Promise<string> {
  return invoke<string>("read_file", { path });
}

/**
 * Write content to file
 */
export async function writeFile(path: string, content: string): Promise<void> {
  return invoke("write_file", { path, content });
}

/**
 * Read directory entries
 */
export async function readDir(path: string): Promise<DirEntry[]> {
  return invoke<DirEntry[]>("read_dir", { path });
}

/**
 * Create a new empty file
 */
export async function createFile(path: string): Promise<void> {
  return invoke("create_file", { path });
}

/**
 * Check if path exists
 */
export async function pathExists(path: string): Promise<boolean> {
  return invoke<boolean>("path_exists", { path });
}
