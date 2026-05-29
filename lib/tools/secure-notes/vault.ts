// Vault model for the Toollyz Secure Notes tool. The decrypted vault is just a
// list of notes; it is serialized to JSON and encrypted as a single blob (see
// crypto.ts) before it ever touches localStorage. Pure and dependency-free.

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface VaultPayload {
  v: 1;
  notes: Note[];
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function newNote(title = "Untitled note", body = ""): Note {
  const now = Date.now();
  return { id: uid(), title, body, createdAt: now, updatedAt: now };
}

export function serializeVault(notes: Note[]): string {
  const payload: VaultPayload = { v: 1, notes };
  return JSON.stringify(payload);
}

export function parseVault(json: string): Note[] {
  try {
    const data = JSON.parse(json) as VaultPayload;
    if (data && Array.isArray(data.notes)) {
      return data.notes.filter((n) => n && typeof n.id === "string");
    }
  } catch { /* noop */ }
  return [];
}

export const WELCOME_NOTE = newNote(
  "Welcome to Secure Notes",
  "This vault is encrypted with AES-256-GCM using a key derived from your master password.\n\nEverything is stored only in this browser — nothing is uploaded. If you forget your password there is no way to recover these notes, so keep it safe.\n\nDelete this note and start writing your own.",
);
