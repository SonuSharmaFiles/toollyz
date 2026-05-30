"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileUser,
  Info,
  Loader2,
  Lock,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { downloadBytes } from "@/lib/tools/pdf/merge";
import {
  buildResumePdf,
  emptyCert,
  emptyEducation,
  emptyExperience,
  emptyLanguage,
  emptyProject,
  type CertEntry,
  type EducationEntry,
  type ExperienceEntry,
  type FontChoice,
  type LanguageEntry,
  type ProjectEntry,
  type ResumeData,
  type Template,
} from "@/lib/tools/pdf/resume";

const STORAGE_KEY = "toollyz:resume-data";

const DEFAULTS: ResumeData = {
  template: "classic",
  font: "Helvetica",
  themeColor: "#6366F1",
  fullName: "Alex Rivera",
  title: "Senior Product Designer",
  email: "alex@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  website: "alexrivera.design",
  linkedin: "linkedin.com/in/alexrivera",
  github: "github.com/alexrivera",
  summary:
    "Product designer with 8 years of experience shaping consumer SaaS — from research and wireframes through production-ready Figma systems and front-end implementation. Previously led design at two seed-stage teams that grew to Series B.",
  experience: [
    {
      id: "e1",
      role: "Senior Product Designer",
      company: "Lumen",
      location: "Remote",
      start: "2022",
      end: "Present",
      bullets:
        "Led the redesign of the onboarding flow that lifted activation by 18% in the first 90 days.\nDesigned and shipped a component library used across web, iOS and macOS surfaces.\nMentored two junior designers and ran a weekly critique that the whole product team joined.",
    },
    {
      id: "e2",
      role: "Product Designer",
      company: "Helio",
      location: "Berlin, DE",
      start: "2018",
      end: "2022",
      bullets:
        "Owned end-to-end design for the data-import experience — sketches, Figma, hand-off, QA.\nBuilt the team's first design system in Figma and contributed to the React component implementation.",
    },
  ],
  education: [
    {
      id: "edu1",
      school: "Northwestern University",
      degree: "BFA, Interaction Design",
      location: "Evanston, IL",
      start: "2014",
      end: "2018",
      details: "Magna cum laude. Thesis on tactile interfaces for low-vision users.",
    },
  ],
  skills:
    "Product strategy · Figma · Design systems · React · TypeScript · Tailwind · User research · Prototyping · Motion design",
  projects: [
    {
      id: "p1",
      name: "Sunrise OSS",
      link: "github.com/alexrivera/sunrise",
      description: "A small open-source toolkit for building accessible color palettes with WCAG-checked contrast and OKLCH-aware blends.",
    },
  ],
  languages: [
    { id: "l1", name: "English", level: "Native" },
    { id: "l2", name: "Spanish", level: "Fluent" },
  ],
  certifications: [
    { id: "c1", name: "Nielsen Norman UX Master Certification", issuer: "NN/g", date: "2021" },
  ],
};

export default function ResumePdfGenerator() {
  const [mounted, setMounted] = React.useState(false);
  const [data, setData] = React.useState<ResumeData>(DEFAULTS);
  const [filename, setFilename] = React.useState("resume.pdf");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<ResumeData>) });
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* noop */
    }
  }, [data, mounted]);

  function patch<K extends keyof ResumeData>(k: K, v: ResumeData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function addExp() {
    setData((d) => ({ ...d, experience: [...d.experience, emptyExperience()] }));
  }
  function updateExp(id: string, p: Partial<ExperienceEntry>) {
    setData((d) => ({ ...d, experience: d.experience.map((e) => (e.id === id ? { ...e, ...p } : e)) }));
  }
  function removeExp(id: string) {
    setData((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }));
  }

  function addEdu() {
    setData((d) => ({ ...d, education: [...d.education, emptyEducation()] }));
  }
  function updateEdu(id: string, p: Partial<EducationEntry>) {
    setData((d) => ({ ...d, education: d.education.map((e) => (e.id === id ? { ...e, ...p } : e)) }));
  }
  function removeEdu(id: string) {
    setData((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));
  }

  function addProject() {
    setData((d) => ({ ...d, projects: [...d.projects, emptyProject()] }));
  }
  function updateProject(id: string, p: Partial<ProjectEntry>) {
    setData((d) => ({ ...d, projects: d.projects.map((e) => (e.id === id ? { ...e, ...p } : e)) }));
  }
  function removeProject(id: string) {
    setData((d) => ({ ...d, projects: d.projects.filter((e) => e.id !== id) }));
  }

  function addLanguage() {
    setData((d) => ({ ...d, languages: [...d.languages, emptyLanguage()] }));
  }
  function updateLanguage(id: string, p: Partial<LanguageEntry>) {
    setData((d) => ({ ...d, languages: d.languages.map((e) => (e.id === id ? { ...e, ...p } : e)) }));
  }
  function removeLanguage(id: string) {
    setData((d) => ({ ...d, languages: d.languages.filter((e) => e.id !== id) }));
  }

  function addCert() {
    setData((d) => ({ ...d, certifications: [...d.certifications, emptyCert()] }));
  }
  function updateCert(id: string, p: Partial<CertEntry>) {
    setData((d) => ({ ...d, certifications: d.certifications.map((e) => (e.id === id ? { ...e, ...p } : e)) }));
  }
  function removeCert(id: string) {
    setData((d) => ({ ...d, certifications: d.certifications.filter((e) => e.id !== id) }));
  }

  async function build() {
    setError(null);
    setBusy(true);
    try {
      const bytes = await buildResumePdf(data);
      downloadBytes(bytes, filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
      toast.success("Resume PDF downloaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Build failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
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
      {/* Hero with template + style */}
      <section
        aria-label="Resume style"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_95%_120%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="relative grid items-end gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="template" className="text-xs font-medium text-indigo-200/80">Template</Label>
            <Select value={data.template} onValueChange={(v) => v && patch("template", v as Template)}>
              <SelectTrigger id="template" className="w-full justify-between bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic (centered, full-width)</SelectItem>
                <SelectItem value="modern">Modern (left-aligned, accent rule)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="font" className="text-xs font-medium text-indigo-200/80">Font</Label>
            <Select value={data.font} onValueChange={(v) => v && patch("font", v as FontChoice)}>
              <SelectTrigger id="font" className="w-full justify-between bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times">Times Roman</SelectItem>
                <SelectItem value="Courier">Courier</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-indigo-200/80">Theme colour</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.themeColor}
                onChange={(e) => patch("themeColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-white/5 p-1"
                aria-label="Theme colour"
              />
              <Input
                value={data.themeColor}
                onChange={(e) => patch("themeColor", e.target.value)}
                className="bg-white/5 font-mono text-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" onClick={build} disabled={busy} className="flex-1 sm:flex-none">
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Building…
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setData(DEFAULTS)} className="text-white">
              <RefreshCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-fit sm:grid-cols-none sm:auto-cols-auto sm:grid-flow-col">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        {/* Header */}
        <TabsContent value="header" className="mt-4 space-y-3">
          <Section title="Identity">
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldRow label="Full name"><Input value={data.fullName} onChange={(e) => patch("fullName", e.target.value)} /></FieldRow>
              <FieldRow label="Title"><Input value={data.title} onChange={(e) => patch("title", e.target.value)} placeholder="Senior Product Designer" /></FieldRow>
              <FieldRow label="Email"><Input type="email" value={data.email} onChange={(e) => patch("email", e.target.value)} /></FieldRow>
              <FieldRow label="Phone"><Input value={data.phone} onChange={(e) => patch("phone", e.target.value)} /></FieldRow>
              <FieldRow label="Location"><Input value={data.location} onChange={(e) => patch("location", e.target.value)} /></FieldRow>
              <FieldRow label="Website"><Input value={data.website} onChange={(e) => patch("website", e.target.value)} placeholder="example.com" /></FieldRow>
              <FieldRow label="LinkedIn"><Input value={data.linkedin} onChange={(e) => patch("linkedin", e.target.value)} placeholder="linkedin.com/in/handle" /></FieldRow>
              <FieldRow label="GitHub"><Input value={data.github} onChange={(e) => patch("github", e.target.value)} placeholder="github.com/handle" /></FieldRow>
            </div>
          </Section>
        </TabsContent>

        {/* Summary */}
        <TabsContent value="summary" className="mt-4 space-y-3">
          <Section title="Summary">
            <Textarea
              value={data.summary}
              onChange={(e) => patch("summary", e.target.value)}
              placeholder="A short professional summary, 2–4 sentences."
              className="min-h-[120px]"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">2–4 sentences works best — recruiters skim. Wrap to multiple lines as needed.</p>
          </Section>
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience" className="mt-4 space-y-3">
          <Section
            title="Experience"
            action={
              <Button type="button" size="sm" variant="outline" onClick={addExp}>
                <Plus className="size-3.5" />
                Add role
              </Button>
            }
          >
            <div className="space-y-3">
              {data.experience.map((exp, idx) => (
                <div key={exp.id} className="space-y-2 rounded-lg border border-border/60 bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Role {idx + 1}</span>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeExp(exp.id)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FieldRow label="Role"><Input value={exp.role} onChange={(e) => updateExp(exp.id, { role: e.target.value })} /></FieldRow>
                    <FieldRow label="Company"><Input value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })} /></FieldRow>
                    <FieldRow label="Start"><Input value={exp.start} onChange={(e) => updateExp(exp.id, { start: e.target.value })} placeholder="2022" /></FieldRow>
                    <FieldRow label="End"><Input value={exp.end} onChange={(e) => updateExp(exp.id, { end: e.target.value })} placeholder="Present" /></FieldRow>
                    <FieldRow label="Location" full><Input value={exp.location} onChange={(e) => updateExp(exp.id, { location: e.target.value })} placeholder="Remote, NY, Berlin" /></FieldRow>
                  </div>
                  <FieldRow label="Bullets (one per line)">
                    <Textarea
                      value={exp.bullets}
                      onChange={(e) => updateExp(exp.id, { bullets: e.target.value })}
                      placeholder={`Led the redesign of …\nDesigned and shipped …`}
                      className="min-h-[100px]"
                    />
                  </FieldRow>
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education" className="mt-4 space-y-3">
          <Section
            title="Education"
            action={
              <Button type="button" size="sm" variant="outline" onClick={addEdu}>
                <Plus className="size-3.5" />
                Add school
              </Button>
            }
          >
            <div className="space-y-3">
              {data.education.map((ed, idx) => (
                <div key={ed.id} className="space-y-2 rounded-lg border border-border/60 bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">School {idx + 1}</span>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeEdu(ed.id)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FieldRow label="School"><Input value={ed.school} onChange={(e) => updateEdu(ed.id, { school: e.target.value })} /></FieldRow>
                    <FieldRow label="Degree / programme"><Input value={ed.degree} onChange={(e) => updateEdu(ed.id, { degree: e.target.value })} /></FieldRow>
                    <FieldRow label="Start"><Input value={ed.start} onChange={(e) => updateEdu(ed.id, { start: e.target.value })} /></FieldRow>
                    <FieldRow label="End"><Input value={ed.end} onChange={(e) => updateEdu(ed.id, { end: e.target.value })} /></FieldRow>
                    <FieldRow label="Location" full><Input value={ed.location} onChange={(e) => updateEdu(ed.id, { location: e.target.value })} /></FieldRow>
                  </div>
                  <FieldRow label="Details (optional)">
                    <Textarea
                      value={ed.details}
                      onChange={(e) => updateEdu(ed.id, { details: e.target.value })}
                      placeholder="Honours, GPA, thesis, scholarships…"
                      className="min-h-[70px]"
                    />
                  </FieldRow>
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills" className="mt-4 space-y-3">
          <Section title="Skills">
            <Textarea
              value={data.skills}
              onChange={(e) => patch("skills", e.target.value)}
              placeholder="Comma-, pipe- or newline-separated"
              className="min-h-[100px]"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">Separate skills with commas, pipes or newlines — the PDF will join them with middle dots.</p>
          </Section>
        </TabsContent>

        {/* Other */}
        <TabsContent value="other" className="mt-4 space-y-3">
          <Section
            title="Projects"
            action={
              <Button type="button" size="sm" variant="outline" onClick={addProject}>
                <Plus className="size-3.5" />
                Project
              </Button>
            }
          >
            <div className="space-y-3">
              {data.projects.map((p, idx) => (
                <div key={p.id} className="space-y-2 rounded-lg border border-border/60 bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Project {idx + 1}</span>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeProject(p.id)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FieldRow label="Name"><Input value={p.name} onChange={(e) => updateProject(p.id, { name: e.target.value })} /></FieldRow>
                    <FieldRow label="Link"><Input value={p.link} onChange={(e) => updateProject(p.id, { link: e.target.value })} placeholder="example.com/project" /></FieldRow>
                  </div>
                  <FieldRow label="Description"><Textarea value={p.description} onChange={(e) => updateProject(p.id, { description: e.target.value })} className="min-h-[80px]" /></FieldRow>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Languages"
            action={
              <Button type="button" size="sm" variant="outline" onClick={addLanguage}>
                <Plus className="size-3.5" />
                Language
              </Button>
            }
          >
            <div className="space-y-2">
              {data.languages.map((l) => (
                <div key={l.id} className="grid grid-cols-[1fr_1fr_24px] gap-2">
                  <Input value={l.name} onChange={(e) => updateLanguage(l.id, { name: e.target.value })} placeholder="Language" />
                  <Input value={l.level} onChange={(e) => updateLanguage(l.id, { level: e.target.value })} placeholder="Native / Fluent / B2 …" />
                  <button
                    type="button"
                    onClick={() => removeLanguage(l.id)}
                    className="grid place-items-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Remove language"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Certifications"
            action={
              <Button type="button" size="sm" variant="outline" onClick={addCert}>
                <Plus className="size-3.5" />
                Certification
              </Button>
            }
          >
            <div className="space-y-2">
              {data.certifications.map((c) => (
                <div key={c.id} className="grid grid-cols-[1.5fr_1fr_100px_24px] gap-2">
                  <Input value={c.name} onChange={(e) => updateCert(c.id, { name: e.target.value })} placeholder="Certification name" />
                  <Input value={c.issuer} onChange={(e) => updateCert(c.id, { issuer: e.target.value })} placeholder="Issuer" />
                  <Input value={c.date} onChange={(e) => updateCert(c.id, { date: e.target.value })} placeholder="2024" />
                  <button
                    type="button"
                    onClick={() => removeCert(c.id)}
                    className="grid place-items-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Remove certification"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      <section className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <Label htmlFor="filename" className="text-xs font-medium">Output filename</Label>
        <Input
          id="filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="resume.pdf"
          className="font-mono w-64"
        />
      </section>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-sm text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-4" />
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Info className="size-4 text-primary" />
          About this generator
        </h2>
        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 list-none">
          <li className="flex items-start gap-1.5"><FileUser className="mt-0.5 size-3.5 shrink-0 text-primary" />A4 portrait, drawn with pdf-lib using the standard 14 PDF fonts (Helvetica / Times / Courier) — no licensing concerns for fonts.</li>
          <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />Two layouts: <strong>Classic</strong> centres the name and uses full-width sections; <strong>Modern</strong> left-aligns the name with a coloured accent rule.</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />Long content overflows onto additional pages automatically. Skills, projects, languages and certifications hide their headers when empty.</li>
          <li className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />Toollyz has no backend — every byte stays in your browser. Form data saves to localStorage.</li>
        </ul>
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3" />
        <CheckCircle2 className="size-3 text-emerald-500" />
        Rendered locally — nothing is uploaded.
      </p>
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function FieldRow({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", full && "sm:col-span-2")}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
