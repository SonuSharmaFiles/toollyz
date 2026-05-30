"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Info,
  Loader2,
  Lock,
  Mail,
  MailPlus,
  MailX,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isOnline } from "@/lib/tools/shared/net";
import {
  createAccount,
  getMessage,
  listDomains,
  listMessages,
  randomAddress,
  randomPassword,
  type MailAccount,
  type MailMessage,
  type MailMessageDetail,
} from "@/lib/tools/temp-mail/mail-tm";

const POLL_INTERVAL_MS = 12_000;

interface State {
  account: MailAccount | null;
  busy: boolean;
  error: string | null;
  messages: MailMessage[];
  selected: MailMessageDetail | null;
  loadingMessage: boolean;
  online: boolean;
}

const INITIAL_STATE: State = {
  account: null,
  busy: false,
  error: null,
  messages: [],
  selected: null,
  loadingMessage: false,
  online: true,
};

export default function TemporaryEmailGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<State>(INITIAL_STATE);

  React.useEffect(() => {
    setMounted(true);
    setState((s) => ({ ...s, online: isOnline() }));
    const on = () => setState((s) => ({ ...s, online: true }));
    const off = () => setState((s) => ({ ...s, online: false }));
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const createNewAccount = React.useCallback(async () => {
    setState((s) => ({ ...s, busy: true, error: null, messages: [], selected: null }));
    try {
      const domains = await listDomains();
      if (!domains.ok) throw new Error(domains.error);
      const domain = domains.data[0]?.domain;
      if (!domain) throw new Error("mail.tm has no active domains right now.");
      const address = randomAddress(domain);
      const password = randomPassword();
      const account = await createAccount(address, password);
      if (!account.ok) throw new Error(account.error);
      setState((s) => ({ ...s, account: account.data, busy: false }));
      toast.success(`Address ready: ${account.data.address}`);
    } catch (e) {
      setState((s) => ({ ...s, busy: false, error: e instanceof Error ? e.message : "Unknown error" }));
    }
  }, []);

  // Auto-create an account once mounted.
  React.useEffect(() => {
    if (mounted && !state.account && !state.busy && state.online) createNewAccount();
  }, [mounted, state.account, state.busy, state.online, createNewAccount]);

  const refreshInbox = React.useCallback(async (silent = false) => {
    if (!state.account) return;
    if (!silent) setState((s) => ({ ...s, busy: true, error: null }));
    const messages = await listMessages(state.account.token);
    if (!messages.ok) {
      if (!silent) setState((s) => ({ ...s, busy: false, error: messages.error }));
      return;
    }
    setState((s) => ({ ...s, messages: messages.data, busy: silent ? s.busy : false }));
  }, [state.account]);

  // Poll the inbox while an account exists.
  React.useEffect(() => {
    if (!mounted || !state.account) return;
    refreshInbox(true);
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refreshInbox(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [mounted, state.account, refreshInbox]);

  async function openMessage(messageId: string) {
    if (!state.account) return;
    setState((s) => ({ ...s, loadingMessage: true, error: null }));
    const r = await getMessage(state.account.token, messageId);
    if (!r.ok) {
      setState((s) => ({ ...s, loadingMessage: false, error: r.error }));
      return;
    }
    setState((s) => ({ ...s, loadingMessage: false, selected: r.data }));
  }

  async function copy(text: string, what = "Address") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Couldn't copy");
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero: account */}
      <section
        aria-label="Temporary inbox"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative space-y-3">
          <div className="text-xs uppercase tracking-wider text-indigo-300/80">Your temporary inbox</div>
          {state.account ? (
            <>
              <div className="font-mono text-2xl font-bold tabular-nums text-emerald-100 sm:text-3xl break-all">
                {state.account.address}
              </div>
              <div className="text-[11px] text-indigo-200/70">
                Created {new Date(state.account.createdAt).toLocaleString()} · via mail.tm · password set locally only
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button type="button" size="sm" onClick={() => copy(state.account!.address)}>
                  <Copy className="size-3.5" />
                  Copy address
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => refreshInbox()} disabled={state.busy} className="bg-white/5 text-white">
                  {state.busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCcw className="size-3.5" />}
                  Refresh
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={createNewAccount} disabled={state.busy} className="bg-white/5 text-white">
                  <MailPlus className="size-3.5" />
                  Generate new
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-sm text-indigo-200">
              <Loader2 className="size-4 animate-spin" />
              {state.busy ? "Creating a fresh address via mail.tm…" : state.online ? "Setting up…" : "You appear to be offline."}
            </div>
          )}
        </div>
      </section>

      {/* Errors */}
      {state.error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-700 dark:text-rose-300">
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle className="size-4" />
            {state.error}
          </span>
        </div>
      )}

      {/* Inbox */}
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Mail className="size-4 text-primary" />
          Inbox ({state.messages.length})
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Auto-refreshing every {POLL_INTERVAL_MS / 1000}s</span>
        </h2>
        {state.messages.length === 0 ? (
          <div className="rounded-lg border border-border/60 bg-background p-6 text-center text-sm text-muted-foreground">
            <MailX className="mx-auto mb-2 size-6" />
            No messages yet. Send a message to the address above and it&apos;ll appear here within ~12 seconds.
          </div>
        ) : (
          <ul className="space-y-1 list-none">
            {state.messages.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => openMessage(m.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border border-border/60 bg-background p-2 text-left text-sm transition-colors hover:bg-muted/40",
                    !m.seen && "border-emerald-500/30",
                  )}
                >
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", m.seen ? "bg-muted-foreground/40" : "bg-emerald-500")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <strong className="truncate">{m.fromName || m.fromAddress}</strong>
                      <span className="ml-auto text-[10px] text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="truncate font-medium">{m.subject || "(no subject)"}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{m.intro}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Message detail */}
      {state.selected && (
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              <Mail className="size-4 text-primary" />
              {state.selected.subject || "(no subject)"}
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={() => setState((s) => ({ ...s, selected: null }))}>
              <ArrowLeft className="size-3.5" />
              Back to inbox
            </Button>
          </div>
          <div className="rounded-lg border border-border/60 bg-background p-3 text-xs text-muted-foreground">
            <div>From: <strong>{state.selected.fromName || state.selected.fromAddress}</strong> &lt;{state.selected.fromAddress}&gt;</div>
            <div>To: {state.selected.to.map((t) => t.address).join(", ")}</div>
            <div>Received: {new Date(state.selected.createdAt).toLocaleString()}</div>
          </div>
          {state.selected.text && (
            <div className="rounded-lg border border-border/60 bg-background p-3">
              <Label className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Plain text</Label>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{state.selected.text}</pre>
            </div>
          )}
          {state.selected.html.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-background p-3">
              <Label className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">HTML</Label>
              <iframe
                className="block h-[400px] w-full rounded border border-border/60"
                title="Message HTML"
                sandbox=""
                srcDoc={`<!DOCTYPE html><html><head><style>body{margin:8px;font-family:system-ui;color:#1f2937}</style></head><body>${state.selected.html.join("")}</body></html>`}
              />
            </div>
          )}
        </section>
      )}

      {/* Loading message indicator */}
      {state.loadingMessage && (
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
          <Loader2 className="mr-2 inline size-4 animate-spin" />
          Fetching message…
        </div>
      )}

      {/* Honest disclosure */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight text-amber-700 dark:text-amber-300">
          <ShieldAlert className="size-4" />
          What you should know
        </h2>
        <ul className="grid gap-1.5 text-xs text-amber-700/90 dark:text-amber-300/90 sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Info className="mt-0.5 size-3.5 shrink-0" />The address and inbox are provided by <strong>mail.tm</strong> — a third party. Your browser talks to mail.tm directly; Toollyz has no server in the path.</li>
          <li className="flex items-start gap-1.5"><Info className="mt-0.5 size-3.5 shrink-0" />Anyone with the address can sign in and read incoming mail until the account is deleted by mail.tm — treat it as <strong>public</strong>.</li>
          <li className="flex items-start gap-1.5"><Info className="mt-0.5 size-3.5 shrink-0" />Don&apos;t use this for password resets to your real accounts, financial confirmations or anything you need long-term access to.</li>
          <li className="flex items-start gap-1.5"><Info className="mt-0.5 size-3.5 shrink-0" />mail.tm rate-limits frequent polling. Toollyz polls every {POLL_INTERVAL_MS / 1000} seconds when the tab is visible.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          How it works
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><Mail className="mt-0.5 size-3.5 shrink-0 text-primary" />On load, Toollyz asks mail.tm for an active domain, generates a random username and password, and creates an account via their public POST /accounts endpoint.</li>
          <li className="flex items-start gap-1.5"><Mail className="mt-0.5 size-3.5 shrink-0 text-primary" />The auth token returned is kept only in this tab&apos;s memory — it&apos;s not persisted, so a reload generates a fresh inbox.</li>
          <li className="flex items-start gap-1.5"><Mail className="mt-0.5 size-3.5 shrink-0 text-primary" />Incoming messages are listed via GET /messages and rendered with sandboxed HTML preview (no scripts, no network).</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend. The browser talks directly to mail.tm; nothing flows through Toollyz.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Inbox via mail.tm public API — Toollyz has no server in the path.
      </p>
    </div>
  );
}
