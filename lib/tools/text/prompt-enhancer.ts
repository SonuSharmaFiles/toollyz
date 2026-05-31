// AI Prompt Enhancer engine. Pure-heuristic prompt analyser + rewriter.
//
// We don't call an LLM (no backend, no API key). Instead we score a prompt
// against the components prompt-engineering literature consistently
// recommends — a role for the model, a clear task, surrounding context,
// constraints, the desired output format, and examples — then build a
// structured rewrite that fills in scaffold sections the user can edit.

export interface PromptCheck {
  id: "role" | "task" | "context" | "constraints" | "format" | "examples" | "audience" | "tone";
  label: string;
  /** Is this component clearly present in the original prompt? */
  present: boolean;
  /** Hint to show the user when it's missing. */
  suggestion: string;
}

export interface PromptAnalysis {
  /** 0–100 completeness score. */
  score: number;
  /** Length in characters of the trimmed input. */
  length: number;
  /** Length in words. */
  words: number;
  checks: PromptCheck[];
  /** Quick callouts for very short or single-sentence prompts. */
  warnings: string[];
}

const ROLE_PATTERNS = [
  /\byou (?:are|will be|act as)\b/i,
  /\bact as\b/i,
  /\bpretend (?:to be|you'?re)\b/i,
  /\bplay the role\b/i,
  /\bas an? \w+/i,
  /^you'?re an? /i,
];
const TASK_PATTERNS = [
  /\b(write|generate|create|produce|draft|summari[sz]e|explain|translate|rewrite|analy[sz]e|design|build|plan|outline|list|find|extract|classify|compare|review|edit|critique|score|rank)\b/i,
];
const CONTEXT_PATTERNS = [
  /\bcontext\b/i,
  /\bbackground\b/i,
  /\bgiven\b/i,
  /\bthe (?:user|customer|reader|audience|company|product) is\b/i,
];
const CONSTRAINT_PATTERNS = [
  /\b(must|should|do not|don'?t|avoid|never|only|at most|no more than|under \d+|between \d+|less than|exactly \d+|in (?:fewer|less) than)\b/i,
];
const FORMAT_PATTERNS = [
  /\b(json|markdown|html|csv|xml|yaml|table|bullet(?:s|ed)?|numbered list|list of|format|sections?|headings?|structure|output as|return (?:a|the))\b/i,
];
const EXAMPLE_PATTERNS = [
  /\b(example|for instance|e\.?g\.?|sample|here'?s an example)\b/i,
];
const AUDIENCE_PATTERNS = [
  /\b(for|target|aimed at|written for|audience)\b.*\b(developers?|beginners?|experts?|kids?|teens?|students?|managers?|founders?|customers?|professionals?)\b/i,
];
const TONE_PATTERNS = [
  /\b(tone|voice|style|formal|casual|professional|playful|friendly|serious|witty|conversational|technical|persuasive)\b/i,
];

const CHECK_TEMPLATES: Omit<PromptCheck, "present">[] = [
  {
    id: "role",
    label: "Role for the model",
    suggestion: "Add 'You are a …' or 'Act as a …' so the model adopts the right perspective.",
  },
  {
    id: "task",
    label: "Clear task verb",
    suggestion: "Lead with an action verb — write, explain, summarise, classify — so the goal is unambiguous.",
  },
  {
    id: "context",
    label: "Context / background",
    suggestion: "Tell the model who the user is or what came before — a sentence of context dramatically improves output.",
  },
  {
    id: "constraints",
    label: "Constraints & rules",
    suggestion: "Be explicit about what must/must-not happen, length limits and edge cases.",
  },
  {
    id: "format",
    label: "Output format",
    suggestion: "Specify the desired shape — markdown, JSON, numbered list, table, headings.",
  },
  {
    id: "examples",
    label: "Examples / few-shot",
    suggestion: "Show one or two input→output pairs — examples beat instructions for hard formatting.",
  },
  {
    id: "audience",
    label: "Audience",
    suggestion: "Name the reader — beginners, executives, devs — so the model picks the right register.",
  },
  {
    id: "tone",
    label: "Tone / style",
    suggestion: "Mention formal / casual / playful so the voice matches your brand.",
  },
];

function presence(input: string, patterns: RegExp[]): boolean {
  return patterns.some((re) => re.test(input));
}

export function analyse(input: string): PromptAnalysis {
  const trimmed = input.trim();
  const length = trimmed.length;
  const words = trimmed ? trimmed.split(/\s+/).length : 0;

  const checks: PromptCheck[] = CHECK_TEMPLATES.map((tmpl) => {
    let present = false;
    if (tmpl.id === "role") present = presence(trimmed, ROLE_PATTERNS);
    else if (tmpl.id === "task") present = presence(trimmed, TASK_PATTERNS);
    else if (tmpl.id === "context") present = presence(trimmed, CONTEXT_PATTERNS);
    else if (tmpl.id === "constraints") present = presence(trimmed, CONSTRAINT_PATTERNS);
    else if (tmpl.id === "format") present = presence(trimmed, FORMAT_PATTERNS);
    else if (tmpl.id === "examples") present = presence(trimmed, EXAMPLE_PATTERNS);
    else if (tmpl.id === "audience") present = presence(trimmed, AUDIENCE_PATTERNS);
    else if (tmpl.id === "tone") present = presence(trimmed, TONE_PATTERNS);
    return { ...tmpl, present };
  });

  // Weights add up to 1.0 — role/task are the most critical.
  const weights: Record<PromptCheck["id"], number> = {
    role: 0.15,
    task: 0.2,
    context: 0.15,
    constraints: 0.1,
    format: 0.15,
    examples: 0.1,
    audience: 0.075,
    tone: 0.075,
  };
  const score = Math.round(
    checks.reduce((sum, c) => sum + (c.present ? weights[c.id] : 0), 0) * 100,
  );

  const warnings: string[] = [];
  if (length === 0) warnings.push("Empty prompt — nothing to enhance yet.");
  if (length > 0 && words < 5) warnings.push("Very short prompt — most prompts benefit from at least one full sentence of context.");
  if (length > 0 && !/[.!?\n]/.test(trimmed)) warnings.push("No sentence punctuation — break the prompt into clear sentences.");
  if (/^(write|do|make)\s+\S+\s*$/.test(trimmed.toLowerCase())) warnings.push("Single command — adding context, format and constraints often doubles the response quality.");

  return { score, length, words, checks, warnings };
}

// ─── Rewriter ───────────────────────────────────────────────────────────────

export type PromptStyle = "structured" | "xml" | "markdown";

export interface RewriteOptions {
  style: PromptStyle;
  /** Add an example placeholder block even when none was detected. */
  includeExamplePlaceholder: boolean;
  /** Wrap a default role/persona when missing. */
  defaultRole: string;
  /** Default audience to suggest when missing. */
  defaultAudience: string;
  /** Default format hint when missing. */
  defaultFormat: string;
}

export const DEFAULT_REWRITE_OPTIONS: RewriteOptions = {
  style: "markdown",
  includeExamplePlaceholder: true,
  defaultRole: "You are an expert assistant focused on producing high-quality, accurate work.",
  defaultAudience: "An informed reader who values clarity and concision.",
  defaultFormat: "Respond in well-structured Markdown with short paragraphs and headings where helpful.",
};

function section(title: string, body: string, style: PromptStyle): string {
  switch (style) {
    case "xml":
      return `<${slugify(title)}>\n${body}\n</${slugify(title)}>`;
    case "structured":
      return `${title.toUpperCase()}\n${body}`;
    case "markdown":
    default:
      return `## ${title}\n${body}`;
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function rewrite(original: string, analysis: PromptAnalysis, opt: RewriteOptions = DEFAULT_REWRITE_OPTIONS): string {
  const trimmed = original.trim();
  const has = (id: PromptCheck["id"]) => analysis.checks.find((c) => c.id === id)?.present ?? false;

  // Strip a leading "You are X." line if the user already gave a role —
  // we'll inline it as the role section instead.
  const parts: string[] = [];

  // Role
  if (!has("role")) {
    parts.push(section("Role", opt.defaultRole, opt.style));
  } else {
    parts.push(section("Role", `(Detected role from your prompt — adjust if needed.)\n${trimmed.split(/[.!?\n]/)[0].trim()}.`, opt.style));
  }

  // Task — use the first verb-led sentence we can find.
  const taskLine =
    trimmed
      .split(/[.!?\n]+/)
      .map((s) => s.trim())
      .find((s) => TASK_PATTERNS.some((re) => re.test(s))) ?? trimmed.split(/[.!?\n]+/)[0] ?? trimmed;
  parts.push(
    section(
      "Task",
      taskLine
        ? `${taskLine.replace(/^\s*[-*•]\s*/, "")}.`
        : "Describe what you want the model to do, leading with an action verb.",
      opt.style,
    ),
  );

  // Context
  if (has("context")) {
    parts.push(section("Context", `(Use the same context you described in your original prompt.)\n${trimmed}`, opt.style));
  } else {
    parts.push(section("Context", "Add a sentence of background here — who the user is, what the goal is, what came before.", opt.style));
  }

  // Audience
  if (!has("audience")) {
    parts.push(section("Audience", opt.defaultAudience, opt.style));
  }

  // Constraints
  if (!has("constraints")) {
    parts.push(
      section(
        "Constraints",
        [
          "- State any must-haves (e.g. length, formality, banned phrases).",
          "- Note edge cases the model should not invent answers for.",
          "- Clarify what to do when uncertain.",
        ].join("\n"),
        opt.style,
      ),
    );
  }

  // Format
  if (!has("format")) {
    parts.push(section("Output format", opt.defaultFormat, opt.style));
  }

  // Tone
  if (!has("tone")) {
    parts.push(section("Tone", "Professional, clear, friendly — adjust to your brand voice.", opt.style));
  }

  // Examples
  if (!has("examples") && opt.includeExamplePlaceholder) {
    parts.push(
      section(
        "Examples",
        ["Input: <a short illustrative input>", "Output: <the ideal response for that input>"].join("\n"),
        opt.style,
      ),
    );
  }

  // Original prompt at the bottom for reference.
  parts.push(
    section("Original prompt", trimmed || "(empty — paste your prompt into the editor)", opt.style),
  );

  return parts.join("\n\n");
}

export const PROMPT_STYLES: { id: PromptStyle; label: string; hint: string }[] = [
  { id: "markdown", label: "Markdown sections", hint: "## Role / ## Task / ## Constraints — clean default." },
  { id: "xml", label: "XML tags", hint: "<role>…</role> — best with Claude and other XML-trained models." },
  { id: "structured", label: "ALL-CAPS sections", hint: "ROLE\nTASK\n… — plain text fallback for older models." },
];

export const PRESET_PROMPTS: { id: string; label: string; prompt: string }[] = [
  {
    id: "vague",
    label: "Vague request",
    prompt: "Write something about climate change.",
  },
  {
    id: "blog",
    label: "Blog idea",
    prompt: "Help me write a blog post about productivity tips for remote workers.",
  },
  {
    id: "code",
    label: "Code help",
    prompt: "Fix this Python script for me.",
  },
  {
    id: "email",
    label: "Email draft",
    prompt: "Draft an email to my client about a missed deadline.",
  },
];
