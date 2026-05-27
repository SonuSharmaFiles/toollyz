"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
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
  RotateCcw,
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
  generateAddresses,
  profilesToCsv,
  profilesToJson,
  profilesToTxt,
  profileToText,
  type AddressProfile,
  type AgeGroup,
  type Gender,
  type GenerateOptions,
} from "@/lib/tools/fake-address/generator";
import { COUNTRIES } from "@/lib/tools/fake-address/countries";

const QUANTITY_OPTIONS = [1, 5, 10, 25, 50];
const PAGE_SIZE = 10;

export default function FakeAddressGenerator() {
  const [countryCode, setCountryCode] = React.useState<string>("US");
  const [count, setCount] = React.useState(5);
  const [gender, setGender] = React.useState<Gender>("any");
  const [ageGroup, setAgeGroup] = React.useState<AgeGroup>("any");
  const [includePhone, setIncludePhone] = React.useState(true);
  const [includeEmail, setIncludeEmail] = React.useState(true);
  const [includeCompany, setIncludeCompany] = React.useState(true);
  const [includeGeo, setIncludeGeo] = React.useState(true);
  const [results, setResults] = React.useState<AddressProfile[]>([]);
  const [page, setPage] = React.useState(0);

  const opts: GenerateOptions = React.useMemo(
    () => ({
      countryCode,
      count,
      gender,
      ageGroup,
      includePhone,
      includeEmail,
      includeCompany,
      includeGeo,
    }),
    [
      countryCode,
      count,
      gender,
      ageGroup,
      includePhone,
      includeEmail,
      includeCompany,
      includeGeo,
    ],
  );

  const generate = React.useCallback(() => {
    setResults(generateAddresses(opts));
    setPage(0);
  }, [opts]);

  // Generate an initial batch on mount
  React.useEffect(() => {
    setResults(generateAddresses(opts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const visible = results.slice(pageStart, pageStart + PAGE_SIZE);

  async function copyAll() {
    if (!results.length) return;
    try {
      await navigator.clipboard.writeText(profilesToTxt(results));
      toast.success(`Copied ${results.length} addresses`);
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
    a.download = `toollyz-fake-addresses-${countryCode.toLowerCase()}-${Date.now()}.${extension}`;
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
      {/* ─── Disclaimer ─────────────────────────────────────────────── */}
      <DisclaimerAlert />

      {/* ─── Controls ───────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={countryCode} onValueChange={(v) => v && setCountryCode(v)}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">
                  <Shuffle className="text-muted-foreground" />
                  <span>Random country</span>
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
            <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUANTITY_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? "address" : "addresses"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
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
            <Label>Age group</Label>
            <Select value={ageGroup} onValueChange={(v) => setAgeGroup(v as AgeGroup)}>
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
            active={includePhone}
            onClick={() => setIncludePhone((v) => !v)}
            label="Phone number"
          />
          <ToggleChip
            active={includeEmail}
            onClick={() => setIncludeEmail((v) => !v)}
            label="Email"
          />
          <ToggleChip
            active={includeCompany}
            onClick={() => setIncludeCompany((v) => !v)}
            label="Company"
          />
          <ToggleChip
            active={includeGeo}
            onClick={() => setIncludeGeo((v) => !v)}
            label="Geo coordinates"
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
                {results.length === 1 ? "address" : "addresses"} generated
              </span>
            </div>
            {results.length > PAGE_SIZE && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            )}
          </div>

          <ul
            aria-label="Generated fake addresses"
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
                  <AddressCard profile={profile} />
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
        <span className="font-medium">For testing only.</span>{" "}
        <span className="text-foreground/70">
          Generated addresses, names, phone numbers and emails are entirely fake.
          Use them only for development, QA, design mockups or education — never to
          deceive or impersonate.
        </span>
      </p>
    </div>
  );
}

// ─── Address card ────────────────────────────────────────────────────────

interface AddressCardProps {
  profile: AddressProfile;
}

function AddressCard({ profile }: AddressCardProps) {
  const initials = `${profile.name.first[0] ?? ""}${profile.name.last[0] ?? ""}`.toUpperCase();
  const country = COUNTRIES.find((c) => c.code === profile.address.countryCode);
  const fullText = profileToText(profile);
  const fullJson = JSON.stringify(profile, null, 2);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 font-semibold text-indigo-500 ring-1 ring-black/5 dark:ring-white/5"
        >
          {initials || "?"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate font-semibold tracking-tight">
              {profile.name.full}
            </h3>
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
              {country?.flag} {country?.code}
            </span>
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {profile.name.gender} · {profile.name.age} yrs
            {profile.company && (
              <>
                {" "}
                ·{" "}
                <span className="text-foreground/70">{profile.company}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2.5 text-sm">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <address className="not-italic leading-relaxed text-foreground/90">
          {profile.address.street}
          {profile.address.apartment && <>, {profile.address.apartment}</>}
          <br />
          {profile.address.city}, {profile.address.state}{" "}
          {profile.address.postalCode}
          <br />
          {profile.address.country}
        </address>
      </div>

      {/* Contact rows */}
      <div className="space-y-1.5 border-t border-border/60 pt-3 text-sm">
        {profile.contact?.phone && (
          <DetailRow icon={<Phone className="size-3.5" />} value={profile.contact.phone} mono />
        )}
        {profile.contact?.email && (
          <DetailRow icon={<Mail className="size-3.5" />} value={profile.contact.email} mono />
        )}
        {profile.company && (
          <DetailRow icon={<Building2 className="size-3.5" />} value={profile.company} />
        )}
        {profile.geo && (
          <DetailRow
            icon={<Globe className="size-3.5" />}
            value={`${profile.geo.latitude.toFixed(5)}, ${profile.geo.longitude.toFixed(5)}`}
            mono
            secondary={profile.geo.timezone}
          />
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-1.5 border-t border-border/60 pt-3">
        <CopyButton
          value={fullText}
          variant="ghost"
          size="sm"
          label="Copy as text"
          message="Address copied"
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

interface DetailRowProps {
  icon: React.ReactNode;
  value: string;
  secondary?: string;
  mono?: boolean;
}

function DetailRow({ icon, value, secondary, mono }: DetailRowProps) {
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

interface ToggleChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function ToggleChip({ active, onClick, label }: ToggleChipProps) {
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
        <p className="text-sm font-medium">No addresses yet</p>
        <p className="text-xs text-muted-foreground">
          Pick a country and quantity, then hit Generate.
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

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

function Pagination({ page, totalPages, onChange }: PaginationProps) {
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
