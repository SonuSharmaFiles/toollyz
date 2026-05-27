"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  AtSign,
  Briefcase,
  Building2,
  Cake,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Globe,
  Hash,
  Mail,
  MapPin,
  Phone,
  Repeat,
  Shuffle,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/shared/copy-button";
import { cn } from "@/lib/utils";
import {
  generateIdentities,
  profilesToCsv,
  profilesToJson,
  profilesToTxt,
  profileToText,
  type AgeRange,
  type Gender,
  type IdentityProfile,
  type GenerateOptions,
} from "@/lib/tools/fake-name/generator";
import { COUNTRIES } from "@/lib/tools/fake-name/countries";

const QUANTITY_OPTIONS = [1, 5, 10, 25, 50, 100];
const PAGE_SIZE = 10;

export default function FakeNameGenerator() {
  const [countryCode, setCountryCode] = React.useState<string>("US");
  const [count, setCount] = React.useState(5);
  const [gender, setGender] = React.useState<Gender>("any");
  const [ageRange, setAgeRange] = React.useState<AgeRange>("any");
  const [includeUsername, setIncludeUsername] = React.useState(true);
  const [includeEmail, setIncludeEmail] = React.useState(true);
  const [includeOccupation, setIncludeOccupation] = React.useState(true);
  const [includePhone, setIncludePhone] = React.useState(true);
  const [includeCompany, setIncludeCompany] = React.useState(false);
  const [includeBirthdate, setIncludeBirthdate] = React.useState(true);
  const [includeMiddle, setIncludeMiddle] = React.useState(false);
  const [results, setResults] = React.useState<IdentityProfile[]>([]);
  const [page, setPage] = React.useState(0);

  const opts: GenerateOptions = React.useMemo(
    () => ({
      countryCode,
      count,
      gender,
      ageRange,
      includeUsername,
      includeEmail,
      includeOccupation,
      includePhone,
      includeCompany,
      includeBirthdate,
      includeMiddle,
    }),
    [
      countryCode,
      count,
      gender,
      ageRange,
      includeUsername,
      includeEmail,
      includeOccupation,
      includePhone,
      includeCompany,
      includeBirthdate,
      includeMiddle,
    ],
  );

  const generate = React.useCallback(() => {
    setResults(generateIdentities(opts));
    setPage(0);
  }, [opts]);

  React.useEffect(() => {
    setResults(generateIdentities(opts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const visible = results.slice(pageStart, pageStart + PAGE_SIZE);

  async function copyAll() {
    if (!results.length) return;
    try {
      await navigator.clipboard.writeText(profilesToTxt(results));
      toast.success(`Copied ${results.length} identities`);
    } catch {
      toast.error("Could not copy");
    }
  }

  function downloadFile(
    content: string,
    extension: "txt" | "csv" | "json",
    mime: string,
  ) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toollyz-fake-names-${countryCode.toLowerCase()}-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${extension.toUpperCase()}`);
  }

  function clearResults() {
    setResults([]);
    toast.info("Cleared");
  }

  return (
    <div className="space-y-6">
      <DisclaimerAlert />

      {/* ─── Controls ─────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Country / culture</Label>
            <Select
              value={countryCode}
              onValueChange={(v) => v && setCountryCode(v)}
            >
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">
                  <Shuffle className="text-muted-foreground" />
                  <span>Random global</span>
                </SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="text-base leading-none">{c.flag}</span>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Select
              value={String(count)}
              onValueChange={(v) => v && setCount(Number(v))}
            >
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUANTITY_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? "identity" : "identities"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={gender}
              onValueChange={(v) => v && setGender(v as Gender)}
            >
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Age range</Label>
            <Select
              value={ageRange}
              onValueChange={(v) => v && setAgeRange(v as AgeRange)}
            >
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any (18–80)</SelectItem>
                <SelectItem value="young">Young (18–30)</SelectItem>
                <SelectItem value="adult">Adult (31–55)</SelectItem>
                <SelectItem value="senior">Senior (56–80)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ToggleChip
            active={includeUsername}
            onClick={() => setIncludeUsername((v) => !v)}
            label="Username & nickname"
          />
          <ToggleChip
            active={includeEmail}
            onClick={() => setIncludeEmail((v) => !v)}
            label="Email"
          />
          <ToggleChip
            active={includePhone}
            onClick={() => setIncludePhone((v) => !v)}
            label="Phone"
          />
          <ToggleChip
            active={includeOccupation}
            onClick={() => setIncludeOccupation((v) => !v)}
            label="Occupation"
          />
          <ToggleChip
            active={includeCompany}
            onClick={() => setIncludeCompany((v) => !v)}
            label="Company"
          />
          <ToggleChip
            active={includeBirthdate}
            onClick={() => setIncludeBirthdate((v) => !v)}
            label="Birthdate"
          />
          <ToggleChip
            active={includeMiddle}
            onClick={() => setIncludeMiddle((v) => !v)}
            label="Middle name"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="lg" onClick={generate}>
            <Repeat className="size-4" />
            Generate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={copyAll}
            disabled={!results.length}
          >
            <Copy className="size-4" />
            Copy all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => downloadFile(profilesToTxt(results), "txt", "text/plain")}
            disabled={!results.length}
          >
            <Download className="size-4" />
            TXT
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => downloadFile(profilesToCsv(results), "csv", "text/csv")}
            disabled={!results.length}
          >
            <Download className="size-4" />
            CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() =>
              downloadFile(profilesToJson(results), "json", "application/json")
            }
            disabled={!results.length}
          >
            <Download className="size-4" />
            JSON
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={clearResults}
            disabled={!results.length}
          >
            <Trash2 className="size-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* ─── Results ───────────────────────────────────────────────── */}
      {results.length === 0 ? (
        <EmptyState onGenerate={generate} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="size-4 text-primary" />
              <span>
                <span className="font-medium text-foreground">{results.length}</span>{" "}
                {results.length === 1 ? "identity" : "identities"} generated
              </span>
            </div>
            {results.length > PAGE_SIZE && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </div>

          <ul
            aria-label="Generated fake identities"
            className="grid list-none gap-4 sm:grid-cols-2"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((profile, idx) => (
                <motion.li
                  key={profile.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.02, 0.2) }}
                >
                  <IdentityCard profile={profile} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {results.length > PAGE_SIZE && (
            <div className="flex justify-center">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Disclaimer ───────────────────────────────────────────────────────────

function DisclaimerAlert() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-sm"
    >
      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="size-3.5" />
      </span>
      <p className="text-foreground/90">
        <span className="font-medium">For testing & creative use only.</span>{" "}
        <span className="text-foreground/70">
          Generated identities are fictional and intended only for testing,
          educational, entertainment and development purposes. Do not use them to
          deceive, impersonate or commit fraud.
        </span>
      </p>
    </div>
  );
}

// ─── Identity card ────────────────────────────────────────────────────────

function IdentityCard({ profile }: { profile: IdentityProfile }) {
  const initials = `${profile.name.first[0] ?? ""}${profile.name.last[0] ?? ""}`.toUpperCase();
  const country = COUNTRIES.find((c) => c.code === profile.countryCode);
  const fullText = profileToText(profile);
  const fullJson = JSON.stringify(profile, null, 2);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-base ring-1 ring-black/5 dark:ring-white/5",
            profile.name.gender === "female"
              ? "from-rose-500/15 to-pink-500/15 text-rose-500"
              : "from-indigo-500/15 to-violet-500/15 text-indigo-500",
          )}
        >
          {initials || "?"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {profile.name.full}
            </h3>
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
              {country?.flag} {country?.code}
            </span>
          </div>
          <p className="text-xs capitalize text-muted-foreground">
            {profile.name.gender} · {profile.age} yrs
            {profile.birthdate && (
              <>
                {" "}
                · born <span className="tabular-nums">{profile.birthdate}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Identity rows */}
      <div className="space-y-1.5 text-sm">
        {profile.username && (
          <Row icon={<AtSign className="size-3.5" />} value={profile.username} mono />
        )}
        {profile.nickname && (
          <Row
            icon={<User className="size-3.5" />}
            value={profile.nickname}
            secondary="Nickname"
          />
        )}
        {profile.occupation && (
          <Row icon={<Briefcase className="size-3.5" />} value={profile.occupation} />
        )}
        {profile.company && (
          <Row icon={<Building2 className="size-3.5" />} value={profile.company} />
        )}
        {profile.email && (
          <Row icon={<Mail className="size-3.5" />} value={profile.email} mono />
        )}
        {profile.phone && (
          <Row icon={<Phone className="size-3.5" />} value={profile.phone} mono />
        )}
      </div>

      {/* Location footer */}
      <div className="space-y-1.5 border-t border-border/60 pt-3 text-sm">
        <Row
          icon={<MapPin className="size-3.5" />}
          value={`${profile.city}, ${profile.country}`}
        />
        <Row
          icon={<Globe className="size-3.5" />}
          value={profile.timezone}
          secondary="Timezone"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5 border-t border-border/60 pt-3">
        <CopyButton
          value={fullText}
          variant="ghost"
          size="sm"
          label="Copy as text"
          message="Identity copied"
        />
        <CopyButton
          value={fullJson}
          variant="ghost"
          size="sm"
          label="Copy as JSON"
          message="JSON copied"
        />
      </div>
    </div>
  );
}

interface RowProps {
  icon: React.ReactNode;
  value: string;
  secondary?: string;
  mono?: boolean;
}

function Row({ icon, value, secondary, mono }: RowProps) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }
  return (
    <div className="group flex items-center gap-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-foreground/90",
          mono && "font-mono text-xs",
        )}
      >
        {value}
        {secondary && (
          <span className="ml-1.5 text-xs text-muted-foreground">({secondary})</span>
        )}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy"
        className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
        )}
      </button>
    </div>
  );
}

// ─── Toggle chip ──────────────────────────────────────────────────────────

function ToggleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground/80 hover:border-border hover:bg-muted",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-1.5 rounded-full transition-colors",
          active ? "bg-primary" : "bg-muted-foreground/40",
        )}
      />
      {label}
    </button>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <User className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">No identities yet</p>
        <p className="text-xs text-muted-foreground">
          Pick a country and gender, then hit Generate.
        </p>
      </div>
      <Button type="button" size="sm" onClick={onGenerate}>
        <Repeat className="size-3.5" />
        Generate now
      </Button>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        Page {page + 1} of {totalPages}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
