"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  ImageDown,
  ListTodo,
  Lock,
  Plus,
  Printer,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  EVENT_COLORS,
  EVENT_EMOJIS,
  HOLIDAY_REGIONS,
  MONTH_NAMES,
  THEMES,
  THEME_BY_ID,
  WEEKDAYS_MON,
  WEEKDAYS_SUN,
  buildMonthGrid,
  eventsToIcs,
  holidaysForYear,
  isoKey,
  monthToCanvas,
  type CalEvent,
  type CalMode,
  type CalTheme,
  type HolidayRegion,
} from "@/lib/tools/calendar/calendar";

const EVENTS_KEY = "toollyz:calendar-events";
const NOTES_KEY = "toollyz:calendar-notes";
const TODOS_KEY = "toollyz:calendar-todos";
const SETTINGS_KEY = "toollyz:calendar-settings";

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function groupEvents(events: CalEvent[]): Record<string, CalEvent[]> {
  const map: Record<string, CalEvent[]> = {};
  for (const ev of events) {
    (map[ev.date] ??= []).push(ev);
  }
  return map;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Pick a readable text color (black/white) for a given background hex.
function readableOn(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1a1a1a" : "#ffffff";
}

export default function CalendarGenerator() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<CalMode>("month");
  const [year, setYear] = React.useState(2025);
  const [month, setMonth] = React.useState(0);
  const [startMonday, setStartMonday] = React.useState(false);
  const [highlightWeekends, setHighlightWeekends] = React.useState(true);
  const [region, setRegion] = React.useState<HolidayRegion>("international");
  const [themeId, setThemeId] = React.useState("minimal");
  const [events, setEvents] = React.useState<CalEvent[]>([]);
  const [notes, setNotes] = React.useState("");
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  const theme = THEME_BY_ID[themeId] ?? THEMES[0];
  const holidays = React.useMemo(() => holidaysForYear(region, year), [region, year]);
  const eventsByDate = React.useMemo(() => groupEvents(events), [events]);

  // ── Load persisted state (client only — avoids hydration mismatch) ──
  React.useEffect(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    try {
      const e = localStorage.getItem(EVENTS_KEY);
      if (e) setEvents(JSON.parse(e));
      const n = localStorage.getItem(NOTES_KEY);
      if (n) setNotes(n);
      const t = localStorage.getItem(TODOS_KEY);
      if (t) setTodos(JSON.parse(t));
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) {
        const p = JSON.parse(s);
        if (p.mode) setMode(p.mode);
        if (typeof p.startMonday === "boolean") setStartMonday(p.startMonday);
        if (typeof p.highlightWeekends === "boolean") setHighlightWeekends(p.highlightWeekends);
        if (p.region) setRegion(p.region);
        if (p.themeId) setThemeId(p.themeId);
      }
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);

  // ── Persist ──
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch {
      /* noop */
    }
  }, [events, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(NOTES_KEY, notes);
    } catch {
      /* noop */
    }
  }, [notes, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    } catch {
      /* noop */
    }
  }, [todos, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ mode, startMonday, highlightWeekends, region, themeId }),
      );
    } catch {
      /* noop */
    }
  }, [mode, startMonday, highlightWeekends, region, themeId, mounted]);

  // ── Navigation ──
  function prevPeriod() {
    if (mode === "year") {
      setYear((y) => y - 1);
      return;
    }
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function nextPeriod() {
    if (mode === "year") {
      setYear((y) => y + 1);
      return;
    }
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  function goToday() {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    toast.success("Jumped to today");
  }

  // ── Events ──
  function addEvent(ev: Omit<CalEvent, "id">) {
    setEvents((prev) => [...prev, { ...ev, id: uid() }]);
  }

  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  // ── Canvas / exports ──
  function buildYearCanvas(): HTMLCanvasElement {
    const months = Array.from({ length: 12 }, (_, m) =>
      monthToCanvas(year, m, startMonday, theme, holidays, eventsByDate, highlightWeekends),
    );
    const cols = 3;
    const rows = 4;
    const gap = 28;
    const pad = 44;
    const titleH = 96;
    const targetW = 760;
    const aspect = months[0].height / months[0].width;
    const targetH = targetW * aspect;
    const W = pad * 2 + cols * targetW + (cols - 1) * gap;
    const H = pad * 2 + titleH + rows * targetH + (rows - 1) * gap;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = theme.cardBg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = theme.id === "printable" ? "#000000" : theme.dayText;
    ctx.font = "bold 56px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${year}`, W / 2, pad + titleH / 2);

    months.forEach((mc, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = pad + c * (targetW + gap);
      const y = pad + titleH + r * (targetH + gap);
      ctx.drawImage(mc, x, y, targetW, targetH);
    });
    return canvas;
  }

  function currentCanvas(): HTMLCanvasElement {
    return mode === "year"
      ? buildYearCanvas()
      : monthToCanvas(year, month, startMonday, theme, holidays, eventsByDate, highlightWeekends);
  }

  function exportPng() {
    const canvas = currentCanvas();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const label = mode === "year" ? `${year}` : `${MONTH_NAMES[month]}-${year}`;
      downloadBlob(blob, `toollyz-calendar-${label}.png`);
      toast.success("Calendar PNG downloaded");
    }, "image/png");
  }

  function printView() {
    const canvas = currentCanvas();
    const data = canvas.toDataURL("image/png");
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      toast.error("Allow pop-ups to print");
      return;
    }
    const label = mode === "year" ? `${year}` : `${MONTH_NAMES[month]} ${year}`;
    w.document.write(`<!doctype html><html><head><title>Calendar — ${label}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;background:#fff}
  .wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px}
  img{max-width:100%;max-height:100%;height:auto;object-fit:contain}
  @page{margin:10mm}
  @media print{.wrap{min-height:auto;padding:0}}
</style></head>
<body><div class="wrap"><img src="${data}" alt="Calendar ${label}" /></div>
<script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
</body></html>`);
    w.document.close();
  }

  function exportIcs() {
    if (!events.length) {
      toast.error("Add an event first");
      return;
    }
    const blob = new Blob([eventsToIcs(events)], { type: "text/calendar;charset=utf-8" });
    downloadBlob(blob, `toollyz-events-${year}.ics`);
    toast.success("ICS file downloaded");
  }

  const periodLabel = mode === "year" ? `${year}` : `${MONTH_NAMES[month]} ${year}`;
  const monthEvents = events
    .filter((e) => e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
    .sort((a, b) => a.date.localeCompare(b.date));
  const visibleEvents = mode === "year" ? events.filter((e) => e.date.startsWith(`${year}-`)) : monthEvents;

  if (!mounted) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-14 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="h-[480px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[480px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Toolbar: mode + navigation ──────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-border bg-background p-1">
          <ModeButton active={mode === "month"} onClick={() => setMode("month")} icon={<CalendarDays className="size-4" />} label="Month" />
          <ModeButton active={mode === "year"} onClick={() => setMode("year")} icon={<CalendarRange className="size-4" />} label="Year" />
        </div>

        <div className="flex items-center gap-1.5">
          <Button type="button" variant="outline" size="icon" onClick={prevPeriod} aria-label={mode === "year" ? "Previous year" : "Previous month"}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="min-w-[150px] text-center font-heading text-lg font-semibold tracking-tight">
            {periodLabel}
          </div>
          <Button type="button" variant="outline" size="icon" onClick={nextPeriod} aria-label={mode === "year" ? "Next year" : "Next month"}>
            <ChevronRight className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={goToday} className="ml-1">
            Today
          </Button>
        </div>
      </div>

      {/* ─── Settings ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select value={themeId} onValueChange={(v) => v && setThemeId(v)}>
            <SelectTrigger className="w-full justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Holidays</Label>
          <Select value={region} onValueChange={(v) => v && setRegion(v as HolidayRegion)}>
            <SelectTrigger className="w-full justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOLIDAY_REGIONS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Week starts on</Label>
          <div className="inline-flex w-full rounded-md border border-border bg-background p-1">
            <SegButton active={!startMonday} onClick={() => setStartMonday(false)} label="Sunday" />
            <SegButton active={startMonday} onClick={() => setStartMonday(true)} label="Monday" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Weekends</Label>
          <button
            type="button"
            onClick={() => setHighlightWeekends((v) => !v)}
            aria-pressed={highlightWeekends}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm font-medium transition-colors",
              highlightWeekends
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-foreground/80 hover:bg-muted",
            )}
          >
            Highlight weekends
            <span
              aria-hidden="true"
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                highlightWeekends ? "bg-primary" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-4 rounded-full bg-white transition-all",
                  highlightWeekends ? "left-[18px]" : "left-0.5",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ─── Calendar + sidebar ──────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Preview */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${year}-${mode === "month" ? month : "y"}-${themeId}`}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {mode === "month" ? (
                <MonthCard
                  year={year}
                  month={month}
                  theme={theme}
                  holidays={holidays}
                  eventsByDate={eventsByDate}
                  startMonday={startMonday}
                  highlightWeekends={highlightWeekends}
                  selectedDate={selectedDate}
                  onSelectDay={setSelectedDate}
                />
              ) : (
                <div className="grid gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-2 xl:grid-cols-3">
                  {MONTH_NAMES.map((_, m) => (
                    <MiniMonth
                      key={m}
                      year={year}
                      month={m}
                      theme={theme}
                      holidays={holidays}
                      eventsByDate={eventsByDate}
                      startMonday={startMonday}
                      highlightWeekends={highlightWeekends}
                      onOpen={() => {
                        setMonth(m);
                        setMode("month");
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Export bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button type="button" onClick={printView}>
              <Printer className="size-4" />
              Print
            </Button>
            <Button type="button" variant="outline" onClick={printView}>
              <FileDown className="size-4" />
              Save PDF
            </Button>
            <Button type="button" variant="outline" onClick={exportPng}>
              <ImageDown className="size-4" />
              PNG
            </Button>
            <Button type="button" variant="outline" onClick={exportIcs}>
              <Download className="size-4" />
              ICS
            </Button>
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3" />
            Everything runs in your browser — events, notes and exports never leave your device.
          </p>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <EventManager
            selectedDate={selectedDate}
            year={year}
            month={month}
            events={visibleEvents}
            onAdd={addEvent}
            onRemove={removeEvent}
            onPickDate={setSelectedDate}
            scope={mode === "year" ? "year" : "month"}
          />
          <ProductivityPanel
            notes={notes}
            setNotes={setNotes}
            todos={todos}
            setTodos={setTodos}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Month card (large) ────────────────────────────────────────────────────

function MonthCard({
  year,
  month,
  theme,
  holidays,
  eventsByDate,
  startMonday,
  highlightWeekends,
  selectedDate,
  onSelectDay,
}: {
  year: number;
  month: number;
  theme: CalTheme;
  holidays: Record<string, string>;
  eventsByDate: Record<string, CalEvent[]>;
  startMonday: boolean;
  highlightWeekends: boolean;
  selectedDate: string | null;
  onSelectDay: (iso: string) => void;
}) {
  const weeks = buildMonthGrid(year, month, startMonday);
  const labels = startMonday ? WEEKDAYS_MON : WEEKDAYS_SUN;

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{ background: theme.cardBg, borderColor: theme.border, borderRadius: theme.radius }}
    >
      <div
        className="px-5 py-4 text-center"
        style={{ background: theme.headerBg, color: theme.headerText }}
      >
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {MONTH_NAMES[month]} {year}
        </h2>
      </div>
      <table className="w-full" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            {labels.map((l) => (
              <th
                key={l}
                scope="col"
                className="py-2 text-xs font-semibold uppercase tracking-wide"
                style={{ background: theme.weekdayBg, color: theme.weekdayText, borderColor: theme.border }}
              >
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, r) => (
            <tr key={r}>
              {week.map((d) => {
                const holiday = d.inMonth ? holidays[d.iso] : undefined;
                const dayEvents = d.inMonth ? eventsByDate[d.iso] : undefined;
                const weekend = highlightWeekends && d.isWeekend;
                const isSelected = selectedDate === d.iso;
                const bg = d.isToday ? theme.todayBg : weekend ? theme.weekendBg : theme.dayBg;
                const fg = d.isToday
                  ? theme.todayText
                  : !d.inMonth
                    ? theme.mutedText
                    : holiday
                      ? theme.holidayText
                      : theme.dayText;
                return (
                  <td
                    key={d.iso}
                    className="p-0 align-top"
                    style={{ border: `1px solid ${theme.border}` }}
                  >
                    <button
                      type="button"
                      onClick={() => d.inMonth && onSelectDay(d.iso)}
                      disabled={!d.inMonth}
                      aria-label={`${d.day} ${MONTH_NAMES[month]}${holiday ? ` — ${holiday}` : ""}${
                        dayEvents?.length ? ` — ${dayEvents.map((e) => e.title).join(", ")}` : ""
                      }`}
                      className={cn(
                        "relative flex min-h-16 w-full flex-col items-start gap-0.5 overflow-hidden p-1.5 text-left transition-[box-shadow] sm:min-h-24",
                        d.inMonth && "cursor-pointer hover:brightness-95",
                        isSelected && "ring-2 ring-inset ring-primary",
                      )}
                      style={{ background: bg, color: fg }}
                    >
                      <span className={cn("text-sm font-bold leading-none", d.isToday && "font-extrabold")}>
                        {d.day}
                      </span>
                      {holiday && (
                        <span
                          className="line-clamp-2 text-[10px] font-medium leading-tight"
                          style={{ color: d.isToday ? theme.todayText : theme.holidayText }}
                        >
                          {holiday}
                        </span>
                      )}
                      {dayEvents && dayEvents.length > 0 && (
                        <span className="mt-auto flex w-full flex-col gap-0.5">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <span
                              key={ev.id}
                              className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-[9px] font-semibold leading-tight sm:text-[10px]"
                              style={{ background: ev.color, color: readableOn(ev.color) }}
                              title={`${ev.emoji ?? ""} ${ev.title}`.trim()}
                            >
                              {ev.emoji && <span className="shrink-0 leading-none">{ev.emoji}</span>}
                              <span className="truncate">{ev.title}</span>
                            </span>
                          ))}
                          {dayEvents.length > 2 && (
                            <span
                              className="px-1 text-[9px] font-semibold leading-none"
                              style={{ color: d.isToday ? theme.todayText : theme.mutedText }}
                            >
                              +{dayEvents.length - 2} more
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mini month (year view) ────────────────────────────────────────────────

function MiniMonth({
  year,
  month,
  theme,
  holidays,
  eventsByDate,
  startMonday,
  highlightWeekends,
  onOpen,
}: {
  year: number;
  month: number;
  theme: CalTheme;
  holidays: Record<string, string>;
  eventsByDate: Record<string, CalEvent[]>;
  startMonday: boolean;
  highlightWeekends: boolean;
  onOpen: () => void;
}) {
  const weeks = buildMonthGrid(year, month, startMonday);
  const labels = startMonday ? WEEKDAYS_MON : WEEKDAYS_SUN;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="overflow-hidden rounded-xl border text-left transition-transform hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: theme.cardBg, borderColor: theme.border }}
      aria-label={`Open ${MONTH_NAMES[month]} ${year}`}
    >
      <div
        className="px-3 py-2 text-center text-sm font-bold"
        style={{ background: theme.headerBg, color: theme.headerText }}
      >
        {MONTH_NAMES[month]}
      </div>
      <table className="w-full" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            {labels.map((l) => (
              <th
                key={l}
                scope="col"
                className="py-1 text-[9px] font-semibold"
                style={{ color: theme.weekdayText }}
              >
                {l.slice(0, 1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, r) => (
            <tr key={r}>
              {week.map((d) => {
                const holiday = d.inMonth ? holidays[d.iso] : undefined;
                const hasEvent = d.inMonth && !!eventsByDate[d.iso]?.length;
                const weekend = highlightWeekends && d.isWeekend;
                const bg = d.isToday ? theme.todayBg : weekend ? theme.weekendBg : "transparent";
                const fg = d.isToday
                  ? theme.todayText
                  : !d.inMonth
                    ? theme.mutedText
                    : holiday
                      ? theme.holidayText
                      : theme.dayText;
                return (
                  <td key={d.iso} className="p-0 text-center">
                    <span
                      className="relative mx-auto flex h-6 w-6 items-center justify-center text-[10px] font-medium"
                      style={{ background: bg, color: fg, borderRadius: d.isToday ? 999 : 0 }}
                    >
                      {d.day}
                      {hasEvent && (
                        <span
                          className="absolute bottom-0.5 size-1.5 rounded-full ring-1 ring-white/50"
                          style={{ background: eventsByDate[d.iso][0].color }}
                        />
                      )}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </button>
  );
}

// ─── Event manager ─────────────────────────────────────────────────────────

function EventManager({
  selectedDate,
  year,
  month,
  events,
  onAdd,
  onRemove,
  onPickDate,
  scope,
}: {
  selectedDate: string | null;
  year: number;
  month: number;
  events: CalEvent[];
  onAdd: (ev: Omit<CalEvent, "id">) => void;
  onRemove: (id: string) => void;
  onPickDate: (iso: string) => void;
  scope: "month" | "year";
}) {
  const defaultDate = selectedDate ?? isoKey(new Date(year, month, 1));
  const [date, setDate] = React.useState(defaultDate);
  const [title, setTitle] = React.useState("");
  const [color, setColor] = React.useState(EVENT_COLORS[0]);
  const [emoji, setEmoji] = React.useState<string>(EVENT_EMOJIS[0]);

  React.useEffect(() => {
    if (selectedDate) setDate(selectedDate);
  }, [selectedDate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Add an event title");
      return;
    }
    onAdd({ date, title: title.trim(), color, emoji });
    setTitle("");
    toast.success("Event added");
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-labelledby="events-heading">
      <h2 id="events-heading" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <CalendarDays className="size-4 text-primary" />
        Custom events
      </h2>

      <form onSubmit={submit} className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="ev-date" className="text-xs">Date</Label>
          <Input
            id="ev-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (e.target.value) onPickDate(e.target.value);
            }}
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-title" className="text-xs">Title</Label>
          <Input
            id="ev-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Birthday, deadline, trip…"
            className="rounded-lg"
            maxLength={60}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Color</Label>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                aria-pressed={color === c}
                className={cn(
                  "size-6 rounded-full ring-offset-2 ring-offset-card transition-transform hover:scale-110",
                  color === c && "ring-2 ring-foreground",
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Emoji</Label>
          <div className="flex flex-wrap gap-1">
            {EVENT_EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setEmoji(em)}
                aria-label={`Emoji ${em}`}
                aria-pressed={emoji === em}
                className={cn(
                  "grid size-7 place-items-center rounded-md text-base transition-colors",
                  emoji === em ? "bg-primary/15 ring-1 ring-primary" : "hover:bg-muted",
                )}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" size="sm" className="w-full">
          <Plus className="size-4" />
          Add event
        </Button>
      </form>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{scope === "year" ? "Events this year" : "Events this month"}</span>
          <span>{events.length}</span>
        </div>
        {events.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            No events yet. Click any day on the calendar to pick a date.
          </p>
        ) : (
          <ul className="space-y-1.5 list-none">
            <AnimatePresence initial={false}>
              {events.map((ev) => (
                <motion.li
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-2 text-sm"
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: ev.color }} />
                  <span className="shrink-0">{ev.emoji}</span>
                  <span className="min-w-0 flex-1 truncate">{ev.title}</span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {ev.date.slice(5)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(ev.id)}
                    aria-label="Remove event"
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-rose-500"
                  >
                    <X className="size-3.5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  );
}

// ─── Productivity panel (notes + todos) ────────────────────────────────────

function ProductivityPanel({
  notes,
  setNotes,
  todos,
  setTodos,
}: {
  notes: string;
  setNotes: (v: string) => void;
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}) {
  const [draft, setDraft] = React.useState("");
  const remaining = todos.filter((t) => !t.done).length;

  function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setTodos((prev) => [...prev, { id: uid(), text: draft.trim(), done: false }]);
    setDraft("");
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4" aria-labelledby="prod-heading">
      <h2 id="prod-heading" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <ListTodo className="size-4 text-primary" />
        Planner
        {todos.length > 0 && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {remaining} left
          </span>
        )}
      </h2>

      <form onSubmit={addTodo} className="mt-3 flex gap-1.5">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a to-do…"
          className="rounded-lg"
          maxLength={80}
        />
        <Button type="submit" size="icon" variant="outline" aria-label="Add to-do">
          <Plus className="size-4" />
        </Button>
      </form>

      {todos.length > 0 && (
        <ul className="mt-3 space-y-1 list-none">
          {todos.map((t) => (
            <li key={t.id} className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setTodos((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                aria-label={t.done ? "Mark not done" : "Mark done"}
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded border transition-colors",
                  t.done ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary",
                )}
              >
                {t.done && <Check className="size-3.5" />}
              </button>
              <span className={cn("min-w-0 flex-1 truncate", t.done && "text-muted-foreground line-through")}>
                {t.text}
              </span>
              <button
                type="button"
                onClick={() => setTodos((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Delete to-do"
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-rose-500"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="cal-notes" className="flex items-center gap-1.5 text-xs">
          <StickyNote className="size-3.5" />
          Notes
        </Label>
        <textarea
          id="cal-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Jot down goals, reminders or a monthly focus…"
          rows={4}
          className="w-full resize-y rounded-lg border border-input bg-background p-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>
    </section>
  );
}

// ─── Small controls ────────────────────────────────────────────────────────

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SegButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex-1 rounded px-2 py-1 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
