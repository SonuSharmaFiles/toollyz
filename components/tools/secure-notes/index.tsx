"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LockOpen,
  Plus,
  Share2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PBKDF2_ITERATIONS, createVaultKey, decryptText, encryptText, encryptWithKey, openBlob, type VaultKey } from "@/lib/tools/secure-notes/crypto";
import { WELCOME_NOTE, newNote, parseVault, serializeVault, type Note } from "@/lib/tools/secure-notes/vault";

const VAULT_KEY = "toollyz:securenotes-vault";
const LOCK_MS = 10 * 60 * 1000;

type Tab = "vault" | "share";
type SaveState = "idle" | "saving" | "saved";

export default function SecureNotes() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("vault");
  const [hasVault, setHasVault] = React.useState(false);
  const [unlocked, setUnlocked] = React.useState(false);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [activeId, setActiveId] = React.useState("");
  const [saveState, setSaveState] = React.useState<SaveState>("idle");

  const vaultKeyRef = React.useRef<VaultKey | null>(null);
  const lastActivity = React.useRef(Date.now());

  React.useEffect(() => {
    try { setHasVault(!!localStorage.getItem(VAULT_KEY)); } catch { /* noop */ }
    setMounted(true);
  }, []);

  // encrypted autosave (fast — reuses the derived key, no PBKDF2)
  React.useEffect(() => {
    if (!unlocked || !vaultKeyRef.current) return;
    setSaveState("saving");
    const id = window.setTimeout(async () => {
      const vk = vaultKeyRef.current;
      if (!vk) return;
      try {
        const blob = await encryptWithKey(vk.key, vk.salt, vk.iterations, serializeVault(notes));
        localStorage.setItem(VAULT_KEY, blob);
        setSaveState("saved");
      } catch { setSaveState("idle"); }
    }, 600);
    return () => window.clearTimeout(id);
  }, [notes, unlocked]);

  // inactivity auto-lock
  React.useEffect(() => {
    if (!unlocked) return;
    const iv = window.setInterval(() => { if (Date.now() - lastActivity.current > LOCK_MS) lock(); }, 30000);
    return () => window.clearInterval(iv);
  }, [unlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  function bump() { lastActivity.current = Date.now(); }

  function lock() {
    vaultKeyRef.current = null;
    setNotes([]);
    setActiveId("");
    setUnlocked(false);
    setSaveState("idle");
    toast("Vault locked");
  }

  function openCreated(vk: VaultKey, initial: Note[]) {
    vaultKeyRef.current = vk;
    setNotes(initial);
    setActiveId(initial[0]?.id ?? "");
    setUnlocked(true);
    setHasVault(true);
    bump();
  }

  const active = notes.find((n) => n.id === activeId) ?? null;

  function updateActive(patch: Partial<Note>) {
    if (!active) return;
    bump();
    setNotes((prev) => prev.map((n) => (n.id === active.id ? { ...n, ...patch, updatedAt: Date.now() } : n)));
  }
  function addNote() { const n = newNote(); setNotes((prev) => [n, ...prev]); setActiveId(n.id); bump(); }
  function removeNote(id: string) {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (id === activeId) setActiveId(next[0]?.id ?? "");
      return next;
    });
    bump();
  }

  if (!mounted) {
    return <div className="space-y-4" aria-hidden="true"><div className="h-12 animate-pulse rounded-2xl bg-muted" /><div className="h-72 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  return (
    <div className="space-y-6" onClick={unlocked ? bump : undefined}>
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border/70 bg-card p-1">
        <TabBtn active={tab === "vault"} onClick={() => setTab("vault")} icon={<Lock className="size-4" />} label="Encrypted vault" />
        <TabBtn active={tab === "share"} onClick={() => setTab("share")} icon={<Share2 className="size-4" />} label="Encrypt & share" />
      </div>

      {tab === "vault" && !hasVault && <CreateVault onCreate={openCreated} />}
      {tab === "vault" && hasVault && !unlocked && <UnlockVault onUnlock={openCreated} onReset={() => { try { localStorage.removeItem(VAULT_KEY); } catch { /* noop */ } setHasVault(false); }} />}
      {tab === "vault" && unlocked && (
        <Workspace
          notes={notes} active={active} activeId={activeId} setActiveId={(id) => { setActiveId(id); bump(); }}
          onAdd={addNote} onRemove={removeNote} onUpdate={updateActive} onLock={lock}
          saveState={saveState} reduceMotion={!!reduceMotion}
          onChangePassword={async (pw) => {
            const vk = await createVaultKey(pw);
            vaultKeyRef.current = vk;
            const blob = await encryptWithKey(vk.key, vk.salt, vk.iterations, serializeVault(notes));
            try { localStorage.setItem(VAULT_KEY, blob); } catch { /* noop */ }
          }}
        />
      )}

      {tab === "share" && <SharePanel reduceMotion={!!reduceMotion} />}

      <SecurityNote />
    </div>
  );
}

// ─── Create / unlock ─────────────────────────────────────────────────────────

function CreateVault({ onCreate }: { onCreate: (vk: VaultKey, initial: Note[]) => void }) {
  const [pw, setPw] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function create() {
    if (pw.length < 6) { setError("Use a password of at least 6 characters."); return; }
    if (pw !== confirm) { setError("Passwords don't match."); return; }
    setError("");
    setBusy(true);
    try {
      const vk = await createVaultKey(pw);
      const initial = [WELCOME_NOTE];
      const blob = await encryptWithKey(vk.key, vk.salt, vk.iterations, serializeVault(initial));
      localStorage.setItem("toollyz:securenotes-vault", blob);
      onCreate(vk, initial);
      toast.success("Encrypted vault created");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create the vault."); }
    setBusy(false);
  }

  return (
    <section className="mx-auto max-w-md space-y-4 rounded-2xl border border-border/70 bg-card p-6 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10"><ShieldCheck className="size-6 text-primary" /></div>
      <div>
        <h2 className="font-heading text-xl font-semibold">Create your encrypted vault</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a master password. Your notes are encrypted with it and stored only in this browser.</p>
      </div>
      <div className="space-y-3 text-left">
        <PasswordField id="cv-pw" label="Master password" value={pw} onChange={setPw} onEnter={create} />
        <PasswordField id="cv-cf" label="Confirm password" value={confirm} onChange={setConfirm} onEnter={create} />
      </div>
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-600 dark:text-amber-400">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>There is no password reset. If you forget this password, your notes <strong>cannot be recovered</strong>.</span>
      </div>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      <Button type="button" onClick={create} disabled={busy} className="w-full">{busy ? <><Loader2 className="size-4 animate-spin" />Creating…</> : <><Lock className="size-4" />Create vault</>}</Button>
    </section>
  );
}

function UnlockVault({ onUnlock, onReset }: { onUnlock: (vk: VaultKey, notes: Note[]) => void; onReset: () => void }) {
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function unlock() {
    if (!pw) return;
    setBusy(true);
    setError("");
    try {
      const blob = localStorage.getItem("toollyz:securenotes-vault") ?? "";
      const res = await openBlob(blob, pw);
      if (!res.ok || !res.vaultKey) { setError(res.error ?? "Incorrect password."); setBusy(false); return; }
      onUnlock(res.vaultKey, parseVault(res.plaintext ?? ""));
      toast.success("Vault unlocked");
    } catch { setError("Could not unlock the vault."); }
    setBusy(false);
  }
  function reset() {
    if (!window.confirm("Delete this encrypted vault and all its notes? This cannot be undone.")) return;
    onReset();
    toast("Vault deleted");
  }

  return (
    <section className="mx-auto max-w-md space-y-4 rounded-2xl border border-border/70 bg-card p-6 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10"><Lock className="size-6 text-primary" /></div>
      <div>
        <h2 className="font-heading text-xl font-semibold">Unlock your vault</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter your master password to decrypt your notes.</p>
      </div>
      <div className="text-left"><PasswordField id="uv-pw" label="Master password" value={pw} onChange={setPw} onEnter={unlock} autoFocus /></div>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      <Button type="button" onClick={unlock} disabled={busy} className="w-full">{busy ? <><Loader2 className="size-4 animate-spin" />Unlocking…</> : <><LockOpen className="size-4" />Unlock</>}</Button>
      <button type="button" onClick={reset} className="text-xs text-muted-foreground underline-offset-4 hover:text-rose-500 hover:underline">Forgot password? Delete vault and start over</button>
    </section>
  );
}

// ─── Workspace ───────────────────────────────────────────────────────────────

function Workspace({ notes, active, activeId, setActiveId, onAdd, onRemove, onUpdate, onLock, saveState, reduceMotion, onChangePassword }: {
  notes: Note[]; active: Note | null; activeId: string; setActiveId: (id: string) => void;
  onAdd: () => void; onRemove: (id: string) => void; onUpdate: (patch: Partial<Note>) => void; onLock: () => void;
  saveState: SaveState; reduceMotion: boolean; onChangePassword: (pw: string) => Promise<void>;
}) {
  const [showChange, setShowChange] = React.useState(false);
  const words = active ? active.body.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={onAdd}><Plus className="size-4" />New note</Button>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveState === "saving" ? <><Loader2 className="size-3.5 animate-spin" />Encrypting…</> : saveState === "saved" ? <><Check className="size-3.5 text-emerald-500" />Encrypted & saved</> : null}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={() => setShowChange((s) => !s)}><KeyRound className="size-4" />Password</Button>
          <Button type="button" size="sm" variant="outline" onClick={onLock}><Lock className="size-4" />Lock</Button>
        </div>
      </div>

      {showChange && <ChangePassword onSave={async (pw) => { await onChangePassword(pw); setShowChange(false); toast.success("Master password updated"); }} />}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-1.5">
          {notes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">No notes yet — create one.</p>
          ) : (
            <ul className="max-h-[460px] space-y-1.5 overflow-auto list-none">
              <AnimatePresence initial={false}>
                {notes.map((n) => (
                  <motion.li key={n.id} layout={!reduceMotion} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className={cn("group flex items-start gap-1.5 rounded-xl border p-2.5 transition-colors", n.id === activeId ? "border-primary/50 bg-primary/10" : "border-border/60 bg-card hover:bg-muted")}>
                      <button type="button" onClick={() => setActiveId(n.id)} className="min-w-0 flex-1 text-left">
                        <div className="truncate text-sm font-medium">{n.title || "Untitled"}</div>
                        <p className="truncate text-[11px] text-muted-foreground">{n.body.trim().slice(0, 48) || "Empty note"}</p>
                      </button>
                      <button type="button" onClick={() => onRemove(n.id)} aria-label="Delete note" className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"><Trash2 className="size-3.5" /></button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </aside>

        {/* Editor */}
        <div className="min-w-0">
          {active ? (
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card">
              <input value={active.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Note title" aria-label="Note title" className="border-b border-border/60 bg-transparent px-4 py-3 text-base font-medium outline-none placeholder:text-muted-foreground/50" />
              <textarea value={active.body} onChange={(e) => onUpdate({ body: e.target.value })} placeholder="Write something private…" aria-label="Note body" className="h-[360px] flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50" />
              <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
                <span>{words} word{words === 1 ? "" : "s"}</span>
                <span className="flex items-center gap-1"><ShieldCheck className="size-3 text-emerald-500" />AES-256 encrypted</span>
              </div>
            </div>
          ) : (
            <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">Select or create a note.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChangePassword({ onSave }: { onSave: (pw: string) => Promise<void> }) {
  const [pw, setPw] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  async function save() {
    if (pw.length < 6) { setError("Use at least 6 characters."); return; }
    if (pw !== confirm) { setError("Passwords don't match."); return; }
    setError(""); setBusy(true);
    try { await onSave(pw); } catch { setError("Could not change the password."); }
    setBusy(false);
  }
  return (
    <div className="grid gap-3 rounded-xl border border-border/70 bg-card p-3 sm:grid-cols-2">
      <PasswordField id="ch-pw" label="New master password" value={pw} onChange={setPw} onEnter={save} />
      <PasswordField id="ch-cf" label="Confirm new password" value={confirm} onChange={setConfirm} onEnter={save} />
      {error && <p className="text-sm text-rose-600 dark:text-rose-400 sm:col-span-2">{error}</p>}
      <Button type="button" size="sm" onClick={save} disabled={busy} className="sm:col-span-2">{busy ? <><Loader2 className="size-4 animate-spin" />Re-encrypting…</> : "Update password"}</Button>
    </div>
  );
}

// ─── Share ───────────────────────────────────────────────────────────────────

function SharePanel({ reduceMotion }: { reduceMotion: boolean }) {
  const [encText, setEncText] = React.useState("");
  const [encPw, setEncPw] = React.useState("");
  const [encOut, setEncOut] = React.useState("");
  const [encBusy, setEncBusy] = React.useState(false);

  const [decBlob, setDecBlob] = React.useState("");
  const [decPw, setDecPw] = React.useState("");
  const [decOut, setDecOut] = React.useState("");
  const [decErr, setDecErr] = React.useState("");
  const [decBusy, setDecBusy] = React.useState(false);

  async function encrypt() {
    if (!encText || !encPw) { toast.error("Enter a note and a passphrase"); return; }
    setEncBusy(true);
    try { setEncOut(await encryptText(encText, encPw)); toast.success("Encrypted"); } catch { toast.error("Encryption failed"); }
    setEncBusy(false);
  }
  async function decrypt() {
    if (!decBlob || !decPw) { toast.error("Paste an encrypted note and its passphrase"); return; }
    setDecBusy(true); setDecErr(""); setDecOut("");
    const res = await decryptText(decBlob.trim(), decPw);
    if (res.ok) setDecOut(res.plaintext ?? ""); else setDecErr(res.error ?? "Could not decrypt.");
    setDecBusy(false);
  }
  async function copy(v: string) { if (!v) return; try { await navigator.clipboard.writeText(v); toast.success("Copied"); } catch { toast.error("Could not copy"); } }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.section initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><Lock className="size-4 text-primary" />Encrypt a note</h2>
        <textarea value={encText} onChange={(e) => setEncText(e.target.value)} rows={5} placeholder="Type the secret note to share…" className="w-full resize-none rounded-lg border border-input bg-background p-2.5 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
        <PasswordField id="sh-enc-pw" label="Passphrase" value={encPw} onChange={setEncPw} onEnter={encrypt} />
        <Button type="button" size="sm" onClick={encrypt} disabled={encBusy}>{encBusy ? <><Loader2 className="size-4 animate-spin" />Encrypting…</> : <><Lock className="size-4" />Encrypt</>}</Button>
        {encOut && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Encrypted — share this with the passphrase separately</span><Button type="button" size="sm" variant="outline" onClick={() => copy(encOut)}><Copy className="size-4" />Copy</Button></div>
            <pre className="max-h-40 overflow-auto rounded-lg border border-border/60 bg-background p-2.5 font-mono text-[11px] break-all text-emerald-600 dark:text-emerald-400">{encOut}</pre>
          </div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"><LockOpen className="size-4 text-primary" />Decrypt a note</h2>
        <textarea value={decBlob} onChange={(e) => setDecBlob(e.target.value)} rows={5} placeholder="Paste an encrypted note (TLZ1.…)" className="w-full resize-none rounded-lg border border-input bg-background p-2.5 font-mono text-[11px] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
        <PasswordField id="sh-dec-pw" label="Passphrase" value={decPw} onChange={setDecPw} onEnter={decrypt} />
        <Button type="button" size="sm" onClick={decrypt} disabled={decBusy}>{decBusy ? <><Loader2 className="size-4 animate-spin" />Decrypting…</> : <><LockOpen className="size-4" />Decrypt</>}</Button>
        {decErr && <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-sm text-rose-600 dark:text-rose-400"><AlertTriangle className="size-4" />{decErr}</p>}
        {decOut && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Decrypted</span><Button type="button" size="sm" variant="outline" onClick={() => copy(decOut)}><Copy className="size-4" />Copy</Button></div>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-background p-2.5 text-sm">{decOut}</pre>
          </div>
        )}
      </motion.section>
    </div>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────────────────

function SecurityNote() {
  return (
    <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight"><ShieldCheck className="size-4 text-emerald-500" />How your data is protected</h2>
      <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
        <li className="flex items-start gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />AES-256-GCM encryption with a PBKDF2-SHA-256 key ({PBKDF2_ITERATIONS.toLocaleString()} iterations).</li>
        <li className="flex items-start gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Everything runs in your browser — nothing is ever uploaded.</li>
        <li className="flex items-start gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Your password is never stored and the vault auto-locks when idle.</li>
        <li className="flex items-start gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Zero-knowledge: there is no recovery, so keep your password safe.</li>
      </ul>
    </section>
  );
}

function PasswordField({ id, label, value, onChange, onEnter, autoFocus }: { id: string; label: string; value: string; onChange: (v: string) => void; onEnter?: () => void; autoFocus?: boolean }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onEnter?.()} autoFocus={autoFocus} autoComplete="off" className="h-9 rounded-lg pl-8 pr-9" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide" : "Show"} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted")}>{icon}{label}</button>
  );
}
