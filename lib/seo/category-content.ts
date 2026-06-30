// Long-form, hand-written SEO copy for each category landing page. Lives
// in its own module (not in `categories.ts`) so this ~12k-word body never
// gets pulled into the client search-index bundle — same isolation trick
// used by `registry-seo.ts`. Only the server-rendered
// /category/[slug] page reads from this map.

export interface SeoFAQ {
  q: string;
  a: string;
}

export interface SeoBlock {
  heading: string;
  paragraphs: string[];
  bullets?: { lead?: string; items: string[] };
}

export interface CategoryArticle {
  /** h2 that opens the section, rendered by <SeoArticle>. */
  title: string;
  /** Intro paragraphs shown directly under the h2. */
  lead: string[];
  /** Sub-sections, each an h3 with prose and optional bullet list. */
  blocks: SeoBlock[];
  faqs?: SeoFAQ[];
}

export const categoryArticles: Record<string, CategoryArticle> = {
  image: {
    title: "Edit images in your browser — fast, private, and free",
    lead: [
      "Images are the heaviest thing most of us ship to the web, attach to an email, or hand off to a printer — and they are also the part of a project most likely to be done with the wrong tool. You do not need a sprawling photo-editing suite to crop a profile picture, you do not need a paid subscription to shrink a 6 MB phone photo down to something an email server will accept, and you certainly should not have to upload a private screenshot to an anonymous website just to convert it from PNG to JPG. The image utilities in this category exist to close that gap. Each one does a single, well-defined job — resize, compress, convert, crop, rotate, extract colors, strip metadata — and does it entirely inside the browser tab you already have open.",
      "Because every tool here runs on your own device, the photo you load never travels across the internet. There is no upload progress bar because there is nothing to upload: the file is read locally, processed by the browser's canvas and image APIs, and handed back to you as a download. That single architectural decision changes everything about how the tools feel to use. They are instant, they work offline once the page has loaded, and they keep sensitive material — ID scans, contracts, medical images, unreleased product shots — on the only machine that should ever see them.",
    ],
    blocks: [
      {
        heading: "What you can actually do here",
        paragraphs: [
          "The category is built around the handful of operations that come up constantly in real work. Resizing is the most common: matching a header image to a 1200-pixel content width, fitting an avatar into a square, or hitting the exact dimensions a job application or government portal demands. Compression is the second: modern cameras produce files far larger than any web page needs, and a good compressor can cut a photo to a fifth of its size with no difference a human eye can detect at screen resolution.",
          "Format conversion solves compatibility headaches — turning a HEIC photo from an iPhone into a universally-accepted JPG, swapping a PNG for a smaller WebP, or producing a transparent PNG from a flat image. Cropping and rotation handle framing and orientation, the two fixes almost every photo needs before it is presentable. And a set of smaller helpers round things out: pulling the dominant color palette out of an image, reading the EXIF metadata a camera silently embeds, or generating a favicon from a single source picture.",
        ],
        bullets: {
          lead: "Typical jobs people bring to this category include:",
          items: [
            "Shrinking a phone photo so it fits under an email or upload size limit without becoming a blurry mess.",
            "Resizing an avatar or banner to the exact pixel dimensions a social platform or CMS requires.",
            "Converting between PNG, JPG, WebP and other formats when a tool or website only accepts one of them.",
            "Cropping out a distracting background or trimming a screenshot down to the part that matters.",
            "Pulling a brand color palette out of a logo or reference photo for a design system.",
            "Stripping location and device metadata from a picture before sharing it publicly.",
          ],
        },
      },
      {
        heading: "Why in-browser editing beats uploading to a server",
        paragraphs: [
          "The conventional online image tool works by uploading your file to a remote server, processing it there, and sending the result back. That model has three quiet costs. The first is privacy: once a file leaves your machine you have no real way to know how long it is retained, who can see it, or whether it ends up in a training set or a leaked bucket. The second is speed: a round trip across the network is always slower than a local operation, and it gets dramatically slower for large files or slow connections. The third is reliability: server tools go down, hit rate limits, or wrap the output in a watermark and a paywall right when you need it.",
          "Doing the work locally removes all three. Your computer's processor is already fast enough to resize or compress an image in a fraction of a second, and it never charges you per use. The practical upshot is that you can run these tools on confidential material without a second thought, batch through dozens of files without waiting on a queue, and keep working even when your connection drops, because the page is just static code running in your tab.",
        ],
      },
      {
        heading: "Understanding image quality and file size",
        paragraphs: [
          "A surprising amount of frustration with images comes from not knowing the difference between dimensions, file size, and compression — three things that sound related but behave independently. Dimensions are the width and height in pixels and decide how large the image appears. File size is how many bytes the file occupies and decides how fast it loads and whether it fits within an upload limit. Compression is the trade you make between the two: it shrinks the file by discarding data, with 'lossless' formats keeping every pixel exact and 'lossy' formats throwing away detail the eye is least likely to miss.",
          "For most web use, JPG and WebP at a quality setting around 75–85% give the best balance — files small enough to load quickly, with artifacts invisible at normal viewing size. PNG is the right choice when you need crisp text, sharp lines, or transparency, but it is wasteful for photographs. When you resize down, you also shrink the file; when you resize up, you do not add real detail, you only stretch what is there, which is why enlarging a small image rarely looks good. Keeping these three concepts straight makes it obvious which tool to reach for and what setting to choose.",
        ],
      },
      {
        heading: "Tips for getting the best results",
        paragraphs: [
          "Always start from the highest-quality original you have, because every edit and re-save of a lossy format loses a little more detail — you cannot recover what an earlier compression pass discarded. Resize before you compress so the compressor works on the final dimensions. If a file must stay under a hard limit, nudge the quality down in small steps and check the preview rather than guessing. And when transparency or sharp edges matter, stay in PNG; when smooth photographic gradients dominate, JPG or WebP will almost always win on size.",
        ],
      },
      {
        heading: "Resizing for the web versus for print",
        paragraphs: [
          "One distinction trips people up more than any other: the size an image needs depends entirely on where it will be seen. Screens think in pixels and care about dimensions, while print thinks in physical inches and cares about pixel density. An image that looks crisp filling a phone screen can come out blurry on paper, and a print-resolution photo is wildly oversized for a web page — wasting bandwidth and slowing the page for no visible benefit.",
          "For the web, the rule is to match the pixel dimensions to the space the image will occupy and stop there. A blog header shown at 1200 pixels wide needs an image about that wide, perhaps doubled for high-density displays, and no more. Anything larger just gets scaled down by the browser, so you pay the file-size cost without gaining sharpness. Compressing that correctly-sized image then keeps the page fast.",
          "For print, the math flips. Printers reproduce roughly 300 dots per inch, so a photo meant to print at four inches wide needs about 1200 pixels across to look sharp on paper. Resize below that and the print looks soft; the screen-perfect version is often not enough. Knowing which target you are aiming at — and resizing to its terms — is what separates an image that looks right from one that disappoints in exactly the medium that mattered.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are my images uploaded anywhere when I use these tools?",
        a: "No. Every image tool in this category runs entirely in your browser using local canvas and image APIs. Your file is read from disk, processed on your own device, and offered back as a download — it is never transmitted to a server, so private photos and documents stay on your machine.",
      },
      {
        q: "Which format should I export to — PNG, JPG or WebP?",
        a: "Use JPG or WebP for photographs and anything with smooth color gradients, since both compress them efficiently. Use PNG when you need transparency or perfectly sharp text and lines. WebP usually produces the smallest file of the three at comparable quality, but confirm the platform you are uploading to accepts it.",
      },
      {
        q: "Will compressing an image make it look worse?",
        a: "At sensible quality levels (around 75–85%) the difference is invisible at normal screen size while the file shrinks dramatically. Heavy compression introduces blocky artifacts and softness, so reduce quality in small steps and watch the live preview to find the point just before degradation becomes noticeable.",
      },
      {
        q: "Can I make a small image larger without losing quality?",
        a: "Not really. Enlarging an image stretches the pixels it already has — it cannot invent new detail — so upscaled photos tend to look soft or blocky. Whenever possible, start from a larger original and resize down rather than up.",
      },
      {
        q: "Do these tools work offline?",
        a: "Yes, once the page has finished loading. Because the processing happens on your device rather than a remote server, you can keep resizing, converting and compressing even if your internet connection drops.",
      },
    ],
  },

  text: {
    title: "Text tools that handle the tedious editing for you",
    lead: [
      "Text is the raw material of almost everything we do at a keyboard, and yet the small operations that text constantly needs — counting it, cleaning it, reformatting it, changing its case, finding and replacing patterns inside it — are exactly the operations a plain text box refuses to do. The tools in this category fill that gap. They are the quiet utilities you reach for between bigger tasks: pasting a messy block of copy and getting back something tidy, checking whether an essay is over a word limit, converting a heading to title case, or sorting a list alphabetically without retyping a single line.",
      "None of these jobs is complicated, but doing them by hand is slow and error-prone, and doing them in a heavyweight word processor is overkill. A dedicated single-purpose tool that loads instantly, works on whatever you paste, and gives you the result in real time is almost always the faster path. Everything here runs locally in your browser, so even long documents and sensitive text — drafts, notes, code comments, private messages — are processed on your own machine and never sent anywhere.",
    ],
    blocks: [
      {
        heading: "The everyday text jobs covered here",
        paragraphs: [
          "Most text work falls into a few repeatable categories, and this collection is organized around them. Counting and measuring tools tell you how many words, characters, sentences and paragraphs a passage contains — essential when you are writing to a strict limit for a meta description, a tweet, an academic abstract, or an application field. Case conversion flips text between uppercase, lowercase, title case, sentence case and more, which saves enormous time when you are normalizing headings, fixing text that arrived in ALL CAPS, or preparing a slug.",
          "Cleaning tools strip out the junk that creeps into copied text: extra spaces, blank lines, stray formatting, smart quotes that break in code, or line breaks pasted from a PDF. Transformation tools reorder and restructure — sorting lines, removing duplicates, reversing text, adding numbering, or wrapping each line in a prefix and suffix. Together they cover the long tail of 'I just need to do this one annoying thing to a block of text' problems that otherwise eat several minutes each.",
        ],
        bullets: {
          lead: "Common reasons people open a text tool:",
          items: [
            "Checking a word or character count against a hard limit before submitting.",
            "Converting a heading or title to the correct capitalization style.",
            "Removing duplicate lines from a list or de-duplicating a pasted column of data.",
            "Stripping extra whitespace and empty lines out of text copied from a PDF or web page.",
            "Sorting a list of names, tags or keywords into alphabetical order.",
            "Finding and replacing a recurring word or pattern across a long passage.",
          ],
        },
      },
      {
        heading: "Why character and word counts actually matter",
        paragraphs: [
          "It is easy to dismiss counting as trivial until a limit costs you something. Search engines typically display only the first 50–60 characters of a page title and around 150–160 of a meta description, and anything past that is truncated with an ellipsis — so writing to the count is the difference between a clean snippet and a cut-off one. Social platforms enforce hard caps. Academic and professional submissions reject anything over the stated word count. SMS messages split into multiple billed segments past 160 characters.",
          "Knowing the count up front, and seeing it update live as you trim, turns a guessing game into a precise edit. The same applies to characters with and without spaces, which different platforms count differently, and to reading-time estimates derived from word count, which help you judge whether an article is the right length for its purpose. A good counting tool surfaces all of these at once so you are never caught out by a limit you did not know applied.",
        ],
      },
      {
        heading: "Cleaning up messy pasted text",
        paragraphs: [
          "Anyone who has copied text out of a PDF, a slide deck, or a poorly built web page knows the result is rarely clean. Lines break in the middle of sentences, words are joined by non-standard spaces, invisible control characters ride along, and curly 'smart' quotes replace the straight quotes that code and many systems expect. Pasting that mess straight into a document or a form carries all the problems with it.",
          "The cleaning tools here exist to neutralize exactly those issues. They collapse runs of whitespace into single spaces, drop empty lines, convert smart punctuation back to plain equivalents, and normalize line endings so the text behaves predictably wherever you paste it next. Running a block through a cleaner before you use it is one of those small habits that quietly prevents a whole class of formatting bugs downstream.",
        ],
      },
      {
        heading: "Privacy when working with text",
        paragraphs: [
          "Text is often more sensitive than people realize — it can be an unpublished draft, a customer message, internal notes, or a snippet of source code. Because every tool in this category processes your input directly in the browser, none of that text is uploaded or logged on a remote server. You can paste a confidential paragraph, get your word count or your cleaned-up version, and close the tab knowing the content never left the device in front of you. That makes these utilities safe to use at work, on client material, and on anything you would not want indexed or retained elsewhere.",
        ],
      },
      {
        heading: "Working with lists and structured text",
        paragraphs: [
          "A large share of text work is really list work — columns of names, tags, URLs, keywords, line items — and lists have their own set of recurring annoyances that plain editing handles badly. Duplicates creep in when you merge sources. Order is wrong when you need it alphabetical or reversed. Each line needs the same prefix or suffix wrapped around it. Blank lines and inconsistent spacing break whatever you paste the list into next. Doing any of these by hand on more than a handful of lines is slow and invites mistakes.",
          "List-oriented tools turn these into single actions. Sorting arranges lines alphabetically or numerically in one click, which is invaluable for putting a glossary, a tag set, or an import file into a predictable order. De-duplication strips repeated entries so a merged list contains each item once. Reversing, numbering, and wrapping each line in fixed text handle the structural reshaping that comes up when you are preparing data for a spreadsheet, a script, or a piece of markup.",
          "The payoff is not just speed but correctness. When a list feeds something downstream — a mail merge, a database import, a configuration file — a single stray duplicate or misordered line can cause a real problem that is hard to trace later. Cleaning and ordering the list with a tool that does it deterministically removes that whole category of error, and because the work happens locally, even a list of private contacts or internal identifiers stays on your own machine.",
          "There is also a compounding benefit to handling lists this way: the same cleaned, sorted, de-duplicated output becomes reliable input for the next step, whether that is a spreadsheet formula, a script, or another text tool. Messy data tends to breed more mess as it moves through a pipeline, while tidy data flows through cleanly. Spending a few seconds to normalize a list at the start often saves far more time than it costs, by preventing the small inconsistencies that would otherwise surface as confusing errors much later, far from where they were introduced.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is my text sent to a server when I use these tools?",
        a: "No. Counting, case conversion, cleaning and every other text operation happens locally in your browser. The text you paste is processed on your own device and never transmitted, so drafts, notes and confidential passages stay private.",
      },
      {
        q: "Why do different tools give me slightly different character counts?",
        a: "The usual reason is whether spaces, line breaks and punctuation are included. Some platforms count characters with spaces, others without; some count each emoji as several characters. A good counter shows both with-spaces and without-spaces totals so you can match the exact rule the platform you are targeting uses.",
      },
      {
        q: "What is the difference between title case and sentence case?",
        a: "Title case capitalizes the first letter of most words, as in 'A Guide to Better Writing', and is common for headings. Sentence case capitalizes only the first word and any proper nouns, as in 'A guide to better writing', and reads more naturally in body text. Case-conversion tools let you switch between them instantly.",
      },
      {
        q: "Can these tools handle very long documents?",
        a: "Yes. Because the work is done on your own device rather than over a network, large blocks of text are processed quickly and there is no upload limit. Extremely large inputs depend on your device's memory, but typical articles, essays and lists pose no problem.",
      },
      {
        q: "Why does pasted text from a PDF look broken?",
        a: "PDFs store text with hard line breaks and non-standard spacing that do not survive copying cleanly, so you get mid-sentence breaks and odd characters. Running the text through a whitespace and line-break cleaner restores it to a normal, usable paragraph.",
      },
    ],
  },

  developer: {
    title: "Developer utilities that save you a context switch",
    lead: [
      "Every developer keeps a mental drawer of tiny tools they reach for a dozen times a day: something to pretty-print a blob of JSON, decode a JWT to see what is inside it, hash a string, escape some HTML, test a regular expression, or generate a UUID. None of these is hard, but each one interrupts your flow if you have to go find a tool, and many of the sites that offer them are slow, ad-choked, or — worst of all — quietly send whatever you paste to a server you do not control. The developer category collects these utilities in one place, runs them entirely in your browser, and gets out of your way.",
      "That last point matters more than it sounds. Developers routinely paste things that are sensitive by nature: tokens, API responses, config fragments, internal URLs, sample records that may contain real data. A formatting or decoding tool that uploads your input is a genuine security risk. Because everything here executes locally, you can decode a production JWT or format a response containing customer fields without that data ever leaving your machine — exactly the property you want from a tool you use on real work.",
    ],
    blocks: [
      {
        heading: "The utilities in this toolbox",
        paragraphs: [
          "The collection covers the operations that come up constantly in day-to-day coding. Data-format tools format, validate and minify JSON, XML and similar structures, turning an unreadable single line into something you can actually inspect — or collapsing a formatted file back down for transport. Encoding and decoding tools handle Base64, URL encoding, HTML entity escaping and JWT inspection, the conversions that sit at the boundaries between systems and are easy to get subtly wrong by hand.",
          "Hashing and identifier tools generate MD5, SHA and similar digests, produce UUIDs, and create random tokens — useful for checksums, cache keys, test fixtures and seeding. Pattern tools let you build and test regular expressions interactively, so you can see exactly what a pattern matches before you drop it into code. And a set of smaller helpers covers the rest: escaping strings, converting between cases used in code, and inspecting structured data. Each is a focused single-purpose tool rather than a bloated all-in-one, which is what makes them fast to load and quick to use.",
        ],
        bullets: {
          lead: "Things developers commonly do here:",
          items: [
            "Pretty-printing and validating a JSON payload to find a missing comma or bracket.",
            "Decoding a JWT to read its header and claims without trusting an external service.",
            "Encoding or decoding Base64 and URL-encoded strings while debugging an API.",
            "Generating a UUID or a batch of them for tests, seeds or database records.",
            "Hashing a string to verify a checksum or build a deterministic key.",
            "Building and testing a regular expression against sample input before shipping it.",
          ],
        },
      },
      {
        heading: "Why local processing is non-negotiable for dev tools",
        paragraphs: [
          "A formatter or decoder seems harmless, but the input you give it often is not. Consider a JWT: it carries a header, a set of claims, and a signature, and developers paste real tokens into decoders all the time to debug auth issues. If that decoder runs on a server, you have just handed a third party a valid token and whatever identity and permissions it encodes. The same logic applies to API responses full of internal IDs, to config snippets containing endpoints, and to any data that hints at how your systems are built.",
          "Running the tool in the browser eliminates the exposure entirely. The token is decoded by JavaScript executing on your own CPU; nothing is logged, stored or transmitted. This is not a nice-to-have for developer tooling — it is the baseline. It means you can use these utilities on production data, on client projects under NDA, and on anything you would never paste into a random website, with the same confidence you would have using a local command-line tool.",
        ],
      },
      {
        heading: "Validation catches bugs before they ship",
        paragraphs: [
          "A large share of integration bugs trace back to malformed data: a JSON document with a trailing comma, an XML file with an unclosed tag, a Base64 string with the wrong padding. These errors are easy to make and frustrating to find because the failure often surfaces far from its cause. Running a payload through a validator turns a vague downstream crash into a precise message pointing at the exact line and character where the structure breaks.",
          "Treating validation as a habit — paste, validate, then use — pays for itself quickly. Formatting a response so you can read it often reveals the problem on sight: a field that is null when you expected a value, an array where you expected an object, a number stored as a string. The regex tester serves the same purpose for patterns, letting you confirm a match against real examples before the pattern reaches code where a false match could be costly.",
        ],
      },
      {
        heading: "Built to fit into a workflow",
        paragraphs: [
          "These tools are deliberately minimal because their job is to be fast, not to be a destination. They load quickly, do one thing, give you a copyable result, and let you get back to your editor. There is no account to create, no limit on how many times you can use them, and no waiting on a server round trip. For the small, frequent operations that punctuate a coding session, that responsiveness is the whole point — a tool that takes five seconds to load defeats the purpose of a five-second task.",
        ],
      },
      {
        heading: "Getting regular expressions right the first time",
        paragraphs: [
          "Regular expressions are one of the most powerful tools a developer has and one of the easiest to get subtly wrong. A pattern that looks correct can match more than you intended, miss an edge case, or behave differently than expected because of how a particular engine treats greedy quantifiers, anchors, or character classes. The danger is that a flawed regex often works on the examples you tried and fails silently on the ones you did not — in validation, in a search-and-replace, or in a parser where a false match corrupts data.",
          "An interactive tester removes the guesswork by letting you see exactly what a pattern matches as you build it. You paste in representative input — including the awkward cases, the empty strings, the values with unusual characters — and watch the matches highlight in real time. That immediate feedback turns regex from a write-and-pray exercise into something you can verify before it ever reaches your code, where a mistake is far more expensive to find.",
          "It also makes regex approachable for the operations developers actually need most of the time: extracting a field, validating a format, replacing a pattern across a block of text. Rather than memorizing the full syntax, you can iterate quickly toward a pattern that does the job, confirm it against real and adversarial examples, and copy it out with confidence. For a tool used to gatekeep or transform data, that confidence is the difference between a quiet bug and a reliable check.",
          "The broader lesson applies to every tool in this toolbox: verify before you trust. A formatter shows you the shape of your data, a validator confirms it parses, a decoder reveals what a token really contains, and a tester proves a pattern matches what you think it does. Each one replaces an assumption with evidence, and assumptions are where most integration bugs are born. Building the habit of checking the small things — the structure, the encoding, the match — with a quick local tool is one of the cheapest forms of insurance a developer has against the expensive bugs that surface in production.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is it safe to decode a real JWT or paste API data here?",
        a: "Yes. Every developer tool in this category runs entirely in your browser, so a token or response you paste is decoded and processed on your own device and never sent to a server. That makes it safe to inspect production tokens and data that would be risky to paste into a server-backed tool.",
      },
      {
        q: "Why is my JSON failing to validate?",
        a: "The most common causes are a trailing comma after the last item, single quotes instead of double quotes around keys or strings, an unquoted key, or a missing closing bracket. A validator points to the exact line and character where parsing breaks, which usually makes the fix obvious at a glance.",
      },
      {
        q: "What is the difference between encoding and hashing?",
        a: "Encoding (like Base64 or URL encoding) is reversible — it transforms data into a transport-safe form that can be decoded back to the original. Hashing (like SHA-256) is one-way — it produces a fixed-length fingerprint that cannot be reversed, which is why it is used for checksums and integrity checks rather than for storing recoverable data.",
      },
      {
        q: "Are the generated UUIDs and tokens actually random?",
        a: "They are produced using the browser's cryptographic random number generator where appropriate, which is suitable for identifiers, test data and non-secret keys. For high-security secrets you should still follow your platform's recommended key-generation practices, but for everyday development the output is more than adequate.",
      },
      {
        q: "Do I need to install anything to use these tools?",
        a: "No. They are plain web pages that run in any modern browser with no installation, account or extension required. Once a page has loaded it also keeps working offline, since the logic runs locally rather than calling out to a server.",
      },
    ],
  },

  seo: {
    title: "SEO tools to make your pages easier to find",
    lead: [
      "Search engine optimization has a reputation for being mysterious, but a large part of it is simply getting the mechanical details right: writing titles and descriptions that fit the space search engines give them, telling crawlers what to index through robots files and sitemaps, marking up your content so it qualifies for rich results, and making sure the signals you send are consistent. The SEO tools in this category handle that mechanical layer. They will not write your content or earn you links, but they make sure the pages you already have are technically sound, properly described, and legible to the machines that decide whether to show them.",
      "These utilities are aimed at anyone who publishes on the web — bloggers, small-business owners, marketers, and developers building sites for clients. You do not need to be an SEO specialist to use them, and you do not need an expensive subscription. Each tool focuses on one concrete task: previewing how a result will look, generating a valid robots or schema snippet, checking a meta tag's length, or building structured data. They run in your browser, so the URLs, copy and draft pages you test stay on your own machine.",
    ],
    blocks: [
      {
        heading: "What these tools help you control",
        paragraphs: [
          "The SEO surface area you can directly control breaks into a few areas, and this collection covers each. Meta-tag tools help you write and preview title tags and meta descriptions at the exact length search engines display, so your snippet reads as a complete thought rather than a sentence cut off mid-word. Structured-data tools generate the JSON-LD markup that lets a page qualify for rich results — star ratings, FAQ accordions, breadcrumb trails and more — which can make your listing larger and more clickable without changing your ranking.",
          "Crawler-control tools generate robots.txt rules and sitemap entries that tell search engines which parts of your site to index and which to skip. Preview tools show how your page will appear not just in search results but when shared on social platforms, where a separate set of Open Graph and card tags governs the title, description and image. Together they cover the technical foundation that has to be right before content and links can do their work.",
        ],
        bullets: {
          lead: "Practical things you can sort out with these tools:",
          items: [
            "Writing a title tag and meta description that fit before search engines truncate them.",
            "Generating valid JSON-LD structured data for articles, FAQs, products or breadcrumbs.",
            "Building a robots.txt file that allows the right pages and blocks the wrong ones.",
            "Previewing how your link will look as a Google result and as a social share card.",
            "Checking that Open Graph tags produce the title, description and image you intend.",
            "Producing clean, lowercase, hyphenated URL slugs from a page title.",
          ],
        },
      },
      {
        heading: "Why titles and descriptions are worth the effort",
        paragraphs: [
          "Your title tag and meta description are the closest thing you have to an advertisement in the search results, and they are governed by hard space limits. Titles are typically shown up to roughly 50–60 characters and descriptions up to around 150–160 before they are cut off with an ellipsis. Write past those limits and your carefully chosen closing words simply disappear; write well under them and you waste prime space. The goal is a title that front-loads the most important words and a description that reads as a complete, compelling summary within the visible window.",
          "These tools let you see exactly where the cut falls as you type, which turns a guess into a precise edit. They also encourage the small best practices that add up: putting the primary keyword near the start, making each page's title unique, and writing a description that earns the click rather than just repeating the title. None of this guarantees a ranking, but it directly affects how many people who see your listing actually choose it — and click-through is a signal worth optimizing in its own right.",
        ],
      },
      {
        heading: "Structured data and rich results",
        paragraphs: [
          "Structured data is a standardized way of describing what a page is about in a vocabulary search engines understand — that this block is a recipe with a cook time and rating, that this is an FAQ with these questions and answers, that these are the breadcrumb steps to the page. When you provide it correctly, search engines can render your listing as a 'rich result' with extra visual elements that make it stand out and take up more space on the page.",
          "The catch is that structured data has to be syntactically valid and match the visible content of the page, or it is ignored — or worse, flagged. Hand-writing JSON-LD is error-prone, with easy mistakes around nesting, required fields and escaping. A generator that produces correct markup from simple inputs removes that risk, letting you add structured data confidently even if you have never touched the schema vocabulary before. It is one of the highest-leverage technical SEO moves available because it improves your listing's appearance without requiring you to outrank anyone.",
        ],
      },
      {
        heading: "Guiding crawlers, not fighting them",
        paragraphs: [
          "A robots.txt file and a sitemap are how you have a conversation with a search engine's crawler. The sitemap says 'here is everything I would like you to consider indexing,' and the robots file says 'please do not waste time on these areas.' Getting them right keeps crawlers focused on your valuable pages and away from admin paths, duplicate parameter URLs, and staging junk. Getting them wrong — a stray disallow rule, a blocked stylesheet — can quietly suppress pages you very much wanted indexed. Generating these files from clear inputs, rather than copying a snippet you half understand, is the safe way to direct crawl behavior with intent.",
        ],
      },
      {
        heading: "Consistency is the signal search engines reward",
        paragraphs: [
          "Beyond any individual tag, search engines are looking for a coherent, consistent picture of what a page is and where it sits. Mixed signals confuse them and dilute your results. A page that declares one URL as canonical but links to itself under another, a title that promises one thing while the heading delivers another, or structured data that describes content the page does not actually show — each of these is a small inconsistency that erodes trust and can suppress how the page performs.",
          "The fixes are mechanical and well within reach. Clean, lowercase, hyphenated URL slugs that reflect the page's topic are easier for both people and crawlers to read and stay stable over time. A single canonical URL per piece of content prevents the same page being seen as several competing duplicates. Titles, headings, descriptions and structured data that all agree reinforce one another instead of pulling in different directions. None of this is glamorous, but it is the groundwork that lets your content compete on its merits.",
          "Internal linking ties it together. The way your pages reference each other tells search engines which pages matter most and how your site is organized, and clear breadcrumb structure — backed by matching structured data — makes that hierarchy explicit. Getting these consistency signals right will not, on its own, vault a thin page to the top, but it removes the self-inflicted friction that holds good pages back, which is often the difference between ranking and being overlooked.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long should my title tag and meta description be?",
        a: "Aim for roughly 50–60 characters for the title and about 150–160 for the description, since search engines truncate beyond those points. Front-load the most important words so your message survives even if the snippet is shortened on smaller screens, and write each as a complete, click-worthy phrase rather than padding to the limit.",
      },
      {
        q: "Will adding structured data improve my ranking?",
        a: "Structured data does not directly raise your position, but it can qualify your page for rich results — star ratings, FAQ accordions, breadcrumbs and similar enhancements — that make your listing larger and more clickable. The benefit is a higher click-through rate from the same position, which is valuable in its own right.",
      },
      {
        q: "What does robots.txt actually do?",
        a: "It tells search-engine crawlers which parts of your site to skip, helping them spend their crawl budget on pages that matter rather than admin paths or duplicate URLs. It is a guideline that well-behaved crawlers respect, not a security control — sensitive pages should be protected by authentication, not just disallowed.",
      },
      {
        q: "Why does my page look different when shared on social media than in Google?",
        a: "Social platforms read a separate set of Open Graph and card meta tags rather than your title tag and meta description. If those tags are missing or misconfigured, the platform falls back to whatever it can scrape, which often looks wrong. Setting explicit Open Graph title, description and image tags gives you control over the shared appearance.",
      },
      {
        q: "Do I need to be an SEO expert to use these tools?",
        a: "No. Each tool focuses on one concrete task with plain inputs and immediate output, so you can write a compliant title, generate valid markup or build a robots file without specialist knowledge. They handle the technical correctness so you can focus on the wording and strategy.",
      },
    ],
  },

  converters: {
    title: "Converters for every format, unit and encoding",
    lead: [
      "A surprising amount of friction in everyday work comes down to two things that should agree but do not: the format you have and the format something else expects. A colleague sends measurements in one unit system, a form demands another. A file is in one encoding, an importer only reads a different one. A timestamp arrives as a cryptic number and you need a human date. Converters exist to dissolve these mismatches. The tools in this category take a value in one representation and give you the exact equivalent in another, instantly and without you having to remember a formula or look up a conversion factor.",
      "What makes a good converter is precision and speed: the right answer, shown the moment you type, with the units and rules made explicit so you are never left wondering what it assumed. Everything in this category runs in your browser, which means conversions are immediate and your inputs — which might be financial figures, internal data, or private measurements — are never sent anywhere. You get the reliability of a calculator that lives on your own device with the convenience of a tool that is always one tab away.",
    ],
    blocks: [
      {
        heading: "The kinds of conversion covered",
        paragraphs: [
          "The category spans several distinct families of conversion. Unit converters handle the physical world — length, weight, temperature, area, volume, speed — translating between metric and imperial and between the many sub-units within each. These are the conversions that come up in cooking, travel, engineering, shipping and science, where getting a factor wrong has real consequences. Number-base converters move values between decimal, binary, hexadecimal and octal, the representations that underpin computing and low-level debugging.",
          "Data and encoding converters translate between text encodings, between data formats, and between the ways the same information can be serialized for different systems. Time and date converters turn timestamps into readable dates, switch between time zones, and compute durations. Currency and rate converters apply a conversion factor to monetary amounts. Each family solves the same fundamental problem — same value, different representation — but the domain knowledge baked into each one is what saves you from manual error.",
        ],
        bullets: {
          lead: "Conversions people reach for regularly:",
          items: [
            "Length, weight and temperature between metric and imperial units.",
            "Decimal, binary, hexadecimal and octal for programming and debugging.",
            "Unix timestamps to human-readable dates and back again.",
            "Time across zones when scheduling across regions.",
            "Cooking measurements between volume, weight and different national systems.",
            "Text and data between encodings or serialization formats for import and export.",
          ],
        },
      },
      {
        heading: "Why manual conversion is a trap",
        paragraphs: [
          "Doing conversions by hand feels harmless until a small slip causes a large problem. Conversion factors are easy to misremember — there are 2.54 centimeters in an inch, not 2.4; a kilometer is 0.621 miles, not 0.625 — and rounding at the wrong step compounds errors. Temperature is especially treacherous because Fahrenheit and Celsius do not share a zero, so you cannot just multiply; you have to apply an offset as well. Number bases trip people up because the same digits mean different values in different bases, and a hexadecimal letter has no obvious decimal equivalent without calculation.",
          "A dedicated converter removes the room for these mistakes. It applies the exact factor, handles offsets and rounding correctly, and shows the result with appropriate precision rather than a guessed-at approximation. For anything where the number actually matters — a dosage, a dimension, a financial figure, a piece of code — that reliability is worth far more than the few seconds it takes. The tool also makes its assumptions visible, so you can confirm it is converting the units you actually meant.",
        ],
      },
      {
        heading: "Timestamps, time zones and dates",
        paragraphs: [
          "Time conversion deserves special mention because it causes an outsized share of bugs and missed meetings. Computers often store time as a Unix timestamp — the number of seconds since the start of 1970 — which is precise but completely unreadable to a human. Converting it to a real date, and being explicit about whether that date is in your local zone or in coordinated universal time, is the difference between debugging an issue quickly and chasing a phantom off-by-one error.",
          "Time-zone conversion has its own pitfalls: zones shift with daylight saving on different dates in different places, and a meeting that is clear in one city can be ambiguous in another. A converter that handles these rules for you, and shows the equivalent moment in the zone you care about, turns scheduling and log-reading from a source of errors into a quick lookup. The same applies to duration math — computing how long is between two points in time without manually carrying across minutes, hours and days.",
        ],
      },
      {
        heading: "Precision and trust",
        paragraphs: [
          "The value of a converter is entirely in being correct, so these tools are built to show their work: the units on both sides, sensible precision, and immediate updates as you change the input. Because they run locally, the result appears instantly and your numbers stay private — useful when the values are sensitive, such as financial figures or proprietary measurements. When a result matters enough to act on, you want a tool that is deterministic and transparent rather than a black box, and that is the standard this category aims for.",
        ],
      },
      {
        heading: "Encodings and why text sometimes turns to gibberish",
        paragraphs: [
          "If you have ever opened a file and found accented letters replaced by strange symbols, or a name rendered as a string of question marks and boxes, you have met a character-encoding mismatch. Computers store text as numbers, and an encoding is the agreement about which number means which character. When a file is written with one encoding and read with another, the agreement breaks and the text comes out scrambled — the data is intact, but it is being interpreted by the wrong rulebook.",
          "This used to be a constant headache because dozens of incompatible encodings were in use. Today most of the web has standardized on a single universal encoding that can represent virtually every character in every language, which is why a converter's job is often to translate older or regional encodings into that modern standard so the text displays correctly everywhere. Knowing that the underlying bytes are fine and only the interpretation is wrong is reassuring: the fix is a conversion, not a retype.",
          "The same principle underlies the other encoding conversions in this category. Turning binary data into a text-safe form so it can travel through systems that only handle text, or translating between the ways structured data is serialized, are all variations on representing the same information under a different agreement. A converter that applies the correct mapping means you can move data between systems that expect different formats without it arriving as gibberish on the other side.",
          "What makes these conversions feel reliable is that they are reversible and lossless when done correctly: the information is preserved exactly, only its representation changes, so converting and converting back returns precisely what you started with. That is a meaningfully different promise from the lossy compression used on images or audio, where some detail is permanently discarded. Understanding which conversions preserve everything and which trade something away helps you reach for the right tool with the right expectations, and it is why encoding conversions can be applied freely without the nagging worry that each pass quietly degrades your data.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are these converters accurate enough to rely on?",
        a: "Yes. Each converter applies the exact, standard conversion factor and handles details like temperature offsets and base-digit values correctly, then displays the result with appropriate precision. The tools also make their units explicit so you can confirm the conversion matches what you intended before you act on the number.",
      },
      {
        q: "Why can't I just multiply to convert Fahrenheit to Celsius?",
        a: "Because the two scales do not share a zero point. Converting between them requires subtracting 32 and then scaling by five-ninths (or the reverse), so a simple multiplication gives the wrong answer. A dedicated temperature converter applies the offset and the scaling in the right order automatically.",
      },
      {
        q: "What is a Unix timestamp and why convert it?",
        a: "A Unix timestamp is the number of seconds elapsed since the start of 1970, which is how many systems store time. It is precise but unreadable to people, so converting it to a normal date — and specifying whether that date is local or UTC — makes logs, databases and API responses understandable.",
      },
      {
        q: "Do the converters work with binary and hexadecimal?",
        a: "Yes. Number-base converters translate values between decimal, binary, hexadecimal and octal, which is essential when reading memory addresses, color codes, bit flags and other low-level data where the same value appears in different bases.",
      },
      {
        q: "Is my data kept private when I convert it?",
        a: "It is. Conversions run entirely in your browser, so the values you enter — including financial figures or proprietary measurements — are processed on your own device and never transmitted to a server.",
      },
      {
        q: "Does converting between encodings change or lose any of my data?",
        a: "No. Encoding and base conversions are reversible and lossless when done correctly — only the representation changes, never the underlying information, so converting and converting back returns exactly what you started with. That is different from lossy image or audio compression, where some detail is permanently discarded, so you can apply these conversions freely without degrading your data.",
      },
    ],
  },

  generators: {
    title: "Generators for passwords, IDs, codes and dummy data",
    lead: [
      "Generators answer a question that comes up constantly across very different kinds of work: 'I need a bunch of this — give it to me now.' Sometimes the 'this' is security-critical, like a strong password or a random token. Sometimes it is structural, like a UUID or a set of unique identifiers. And sometimes it is filler, like a page of placeholder text, a list of fake names, or sample addresses to populate a design or a test database. The tools in this category produce all of it on demand, with the right properties for the job and without you having to invent anything by hand.",
      "The common thread is randomness done correctly. Humans are famously bad at being random — we reuse patterns, favor certain digits, and create passwords that look complex but are easy to guess. A good generator uses proper randomness so the output is genuinely unpredictable where it needs to be, and genuinely varied where it needs to look realistic. Everything here runs in your browser, which is especially important for the security-sensitive generators: a password or key produced locally is never transmitted, so it is yours alone from the moment it exists.",
    ],
    blocks: [
      {
        heading: "What you can generate",
        paragraphs: [
          "The category divides naturally into a few purposes. Security generators produce strong passwords, passphrases, one-time codes and random tokens, with controls over length and character composition so you can meet any service's rules. Identifier generators create UUIDs and other unique IDs for use as database keys, correlation IDs, and anywhere you need a value that will not collide with another. Placeholder generators produce lorem ipsum text, fake names, addresses, and other dummy content for mockups, demos and tests, so you can fill a layout with realistic-looking material before the real content exists.",
          "There are also creative and utility generators — random numbers and picks for raffles and decisions, sample data for spreadsheets and forms, and codes for specific formats. What unites them is that each takes a few simple parameters and returns ready-to-use output, often in bulk, with a one-click copy. Instead of cobbling together a script or repeatedly mashing the keyboard, you describe what you want and get exactly that.",
        ],
        bullets: {
          lead: "Frequent generator jobs:",
          items: [
            "Creating a strong, unique password that satisfies a site's length and character rules.",
            "Generating one or many UUIDs for database keys or test fixtures.",
            "Producing placeholder text to fill a design mockup before real copy arrives.",
            "Making lists of fake names and addresses to populate a demo or test database.",
            "Generating one-time codes or random tokens for testing an auth flow.",
            "Picking a random number or winner for a draw, decision or sample.",
          ],
        },
      },
      {
        heading: "Why strong, random passwords matter",
        paragraphs: [
          "The single most effective thing most people can do for their online security is to use a long, random, unique password for every account — and that is exactly what humans cannot do unaided. We reuse the same few passwords everywhere, base them on memorable words and dates, and substitute predictable characters that attackers' tools already account for. When one of those reused passwords leaks in a breach, every account that shares it is suddenly exposed. A password generator breaks the cycle by producing a value with no pattern, no dictionary word, and enough length that brute-forcing it is computationally hopeless.",
          "Length matters more than complexity: a long passphrase of random words can be both stronger and easier to handle than a short string of symbols. The generators here let you choose, so you can match a service's specific requirements — minimum length, required character classes, banned symbols — while still getting genuine randomness. Crucially, because generation happens in your browser, the password exists only on your device; nothing about it is sent across the network, which is the only safe way to create a credential you intend to keep.",
        ],
      },
      {
        heading: "Identifiers and why uniqueness is hard",
        paragraphs: [
          "When a system needs to label things — rows in a database, events in a log, files in a bucket — it needs labels that never collide, even when many parts of the system are creating them at once without coordinating. UUIDs solve this with values so large and so random that the chance of two ever matching is negligible for any realistic workload. Generating them by hand is impossible and writing the code to do it is a small distraction, so a generator that produces valid UUIDs on demand, singly or in batches, is a genuine time-saver during development and testing.",
          "The same need for guaranteed uniqueness shows up in tokens, slugs and reference codes. A generator that understands the format you need — the right length, the right character set, the right structure — lets you produce conforming values instantly instead of risking a malformed one. For testing especially, being able to generate a hundred unique records in a second turns a tedious setup chore into a non-event.",
        ],
      },
      {
        heading: "Realistic placeholder data",
        paragraphs: [
          "Designing and testing with empty fields or 'asdf' everywhere hides problems that only appear with realistic content: names that are longer than the layout expects, addresses that wrap awkwardly, text that pushes a button off-screen. Placeholder generators produce believable filler — proper-looking names, plausible addresses, natural-reading lorem text of a chosen length — so your mockup or test reflects how the real thing will behave. Because the data is fake by construction, you can use it freely without any privacy concern, and because it is generated fresh each time, you can produce as much variety as you need to stress-test a design or seed a database.",
        ],
      },
      {
        heading: "Choosing length and character sets that fit the rules",
        paragraphs: [
          "Not every generated value can be a free-for-all of random characters — the system receiving it usually has rules. A password field may demand at least one uppercase letter, one digit and one symbol while forbidding spaces. A coupon code might need to be exactly eight uppercase letters. A token may have to avoid characters that are easy to confuse, like the letter O and the number zero, because a human will read it aloud or type it from a screen. Generating a value that ignores these rules just means doing the work twice.",
          "The generators here expose the parameters that matter so the output conforms on the first try. You set the length, choose which character classes to include, and let the tool guarantee the result satisfies the requirements while still being random within them. That combination — random where it can be, constrained where it must be — is exactly what produces a value that is both secure and acceptable to the system that will store it.",
          "Length deserves emphasis because it is the lever with the most effect on strength. Each additional character multiplies the number of possible values, so a longer secret is exponentially harder to guess, far more than adding exotic symbols to a short one. When a service allows it, favoring length over complexity gives you a stronger result that is often easier to handle, and a generator that lets you dial length up to the maximum the service permits makes claiming that strength a single adjustment rather than a calculation.",
          "It helps to think about where a generated value will live and who or what will handle it. A password going straight into a password manager can be long and full of every symbol allowed, because no human ever types it. A code read aloud over the phone should drop ambiguous characters and stay short enough to dictate without errors. A token embedded in a URL must avoid characters that need escaping. Matching the character set to the value's real-world journey is a small decision that prevents a surprising amount of friction, and the generators give you that control directly rather than forcing a one-size-fits-all output.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are passwords generated here safe to use?",
        a: "Yes. Passwords and tokens are generated locally in your browser using strong randomness and are never transmitted to any server, so the value exists only on your device. Combined with a long length and a unique password per account, that makes them a sound basis for your security.",
      },
      {
        q: "What makes a password strong?",
        a: "Length and randomness, more than special characters. A long, genuinely random password or passphrase is extremely hard to guess or brute-force, while a short one full of predictable substitutions is not. Use a unique password for every account so a single breach cannot cascade across your logins.",
      },
      {
        q: "Will two generated UUIDs ever be the same?",
        a: "For any realistic workload, no. UUIDs are drawn from a space so large and so random that the probability of a collision is negligible even across billions of values, which is exactly why they are used as keys in distributed systems where coordination is impossible.",
      },
      {
        q: "Is the fake name and address data based on real people?",
        a: "No. Placeholder data is randomly assembled from generic components to look realistic without corresponding to any real person or location, so it is safe to use freely in designs, demos and test databases without any privacy implications.",
      },
      {
        q: "Can I generate many items at once?",
        a: "Yes. Most generators can produce values in bulk — many UUIDs, a list of fake records, or a block of placeholder text of a chosen length — in a single action, which is far faster than creating them one at a time when seeding a database or filling a layout.",
      },
    ],
  },

  calculators: {
    title: "Calculators for the numbers you deal with every day",
    lead: [
      "Most of the math that actually shapes our decisions is not abstract — it is the practical arithmetic of money, time, health and measurement. How much will this loan cost over its term? What is the tip on this bill split four ways? How many days until a deadline? What percentage did this number change? These questions are simple in principle and tedious in practice, and getting them slightly wrong can mean a missed payment, an awkward split, or a plan built on a bad figure. The calculators in this category take the formula off your plate and give you a dependable answer the moment you enter the inputs.",
      "A purpose-built calculator beats a generic one because it knows the domain. A loan calculator understands interest and amortization; a date calculator knows how many days are in each month and handles leap years; a percentage calculator covers the several distinct things 'percent' can mean. That built-in knowledge is what prevents the subtle errors that creep in when you try to do these calculations on a basic four-function calculator or in your head. And because everything runs in your browser, the figures you enter — which are often financial and personal — never leave your device.",
    ],
    blocks: [
      {
        heading: "The everyday math these tools cover",
        paragraphs: [
          "The collection is organized around the calculations people genuinely repeat. Financial calculators handle loans and interest, tips and bill-splitting, discounts and markups, and the percentage math behind sales and budgets — the figures that touch your wallet directly. Date and time calculators count the days, weeks or months between two dates, add or subtract durations, and answer age and deadline questions without the off-by-one errors that manual counting invites.",
          "Health and body calculators turn measurements into the indicators people track, applying the standard formulas so you get a consistent result. Measurement and everyday calculators handle ratios, proportions, averages and the other small computations that come up in projects and planning. Each one is framed around a real question rather than a raw operation, so you spend your time entering what you know and reading the answer rather than figuring out which formula to apply.",
        ],
        bullets: {
          lead: "Questions these calculators answer fast:",
          items: [
            "What are the monthly payments and total cost of a loan at a given rate and term?",
            "What is the tip, and what does each person owe when the bill is split?",
            "How many days, weeks or months are between two dates?",
            "What is the percentage increase or decrease between two numbers?",
            "What is the final price after a discount, or the original price before it?",
            "What does a standard health or body metric work out to from my measurements?",
          ],
        },
      },
      {
        heading: "Why percentages cause so much confusion",
        paragraphs: [
          "Percentages are deceptively slippery because the word covers several different operations that are easy to mix up. 'What is 20% of 80?' is a different calculation from 'what percent is 16 of 80?', which is different again from 'what is 80 increased by 20%?' and 'a number increased by 20% is 96, what was it originally?'. People reach for the same vague mental shortcut for all of them and get the wrong one. The classic trap is reversing a percentage change: a value that drops 20% does not return to its original by rising 20%, because the second percentage is taken from a smaller base.",
          "A dedicated percentage calculator separates these cases so you pick the one you actually mean and get the right answer. This matters most exactly where the stakes are highest — discounts, tax, tips, interest, and any figure you are reporting or acting on. Letting the tool handle the arithmetic removes both the formula-recall problem and the conceptual slip of applying the wrong kind of percentage in the first place.",
        ],
      },
      {
        heading: "Loans, interest and the cost of borrowing",
        paragraphs: [
          "Borrowing money is one area where intuition badly underestimates the real number, because interest compounds and small differences in rate or term produce large differences in total cost. A loan calculator makes the true picture visible: not just the monthly payment, but the total you will repay over the life of the loan and how much of that is interest rather than principal. Seeing those figures side by side often changes a decision — a slightly higher payment over a shorter term can save a striking amount in total interest.",
          "The same clarity applies to the everyday financial calculators. Splitting a bill with tip across an uneven group, working backward from a sale price to the original, or computing a markup are all quick when a tool handles them and surprisingly error-prone when done in your head at a restaurant table or a checkout. Getting an exact answer instantly means you can act with confidence rather than rounding nervously.",
        ],
      },
      {
        heading: "Dates, deadlines and durations",
        paragraphs: [
          "Counting time is another place where manual math goes wrong, because months have different lengths, years occasionally have an extra day, and 'how many days until' questions are riddled with off-by-one ambiguity about whether you count the start and end days. A date calculator handles all of that consistently, so a deadline, an age, a countdown or a duration comes out right every time. Because the calculation is deterministic and runs locally, you get an immediate answer you can trust, whether you are planning a project timeline, working out a notice period, or figuring out exactly how long is left before something is due.",
        ],
      },
      {
        heading: "Reading health and body metrics in context",
        paragraphs: [
          "Health calculators are popular because they turn a couple of measurements into a single number that is easy to track over time, but those numbers are only useful when you understand what they do and do not say. A body or fitness metric computed from height, weight, age or similar inputs applies a standard formula consistently, which makes it a fair way to compare your own readings from one month to the next. What it cannot do is account for everything that makes an individual unique — body composition, muscle mass, and countless personal factors a single formula was never designed to capture.",
          "That is why the right way to read these figures is as one data point among several, not a verdict. A calculator gives you a precise, repeatable result; interpreting that result sensibly — noticing a trend, flagging something worth discussing with a professional, or simply having a baseline — is where the value lies. The tool's job is to do the arithmetic correctly and consistently so the number you compare against is reliable, and to do it privately so your measurements never leave your device.",
          "Used this way, health calculators become a low-friction habit rather than a source of anxiety. You enter your figures, get an instant and consistent reading, and move on with a clearer sense of where you stand. Because the computation is deterministic and local, you can check in as often as you like, on numbers you would not want stored elsewhere, and trust that the same inputs will always produce the same answer for a meaningful comparison over time.",
          "The same balanced mindset applies across the financial and date calculators too. A loan calculator gives you an exact repayment figure, but the decision to borrow weighs comfort, risk and circumstance the math cannot see. A countdown tells you precisely how many days remain, but how you use that time is yours to judge. The tools are deliberately good at the part that should be exact — the arithmetic — so that your attention is free for the part that genuinely requires judgment. A reliable number is not the end of a decision, but it is the firm ground a good decision is made on.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are my financial figures kept private?",
        a: "Yes. Every calculator runs entirely in your browser, so loan amounts, salaries, bill totals and any other figures you enter are computed on your own device and never sent to a server. You can use them on sensitive personal numbers without any data leaving your machine.",
      },
      {
        q: "Why do reversed percentage changes not cancel out?",
        a: "Because each percentage is taken from a different base. If a value falls 20%, the new, smaller value would need to rise by 25% — not 20% — to return to where it started, since the increase is calculated from the reduced amount. A percentage calculator handles this correctly so you avoid the common reversal error.",
      },
      {
        q: "Does the loan calculator show total interest, not just the payment?",
        a: "Yes. Beyond the monthly payment, it shows the total amount repaid over the loan's term and how much of that is interest versus principal, which is the figure that really reveals the cost of borrowing and often changes which option makes sense.",
      },
      {
        q: "How does the date calculator handle leap years and month lengths?",
        a: "It accounts for the actual length of each month and for leap years automatically, so counts of days, weeks and months between dates come out correctly without the off-by-one errors that manual counting tends to introduce.",
      },
      {
        q: "Do I need to know the formulas to use these calculators?",
        a: "No. Each calculator is built around a real question and asks only for the inputs you already have, then applies the correct formula behind the scenes. You enter what you know and read the answer — no need to remember how the underlying math works.",
      },
    ],
  },

  pdf: {
    title: "PDF tools that work without uploading your documents",
    lead: [
      "The PDF is the format we trust with our most important documents — contracts, statements, applications, records, signed agreements — precisely because it preserves layout and is hard to alter casually. That same importance is what makes the typical online PDF tool so uncomfortable: to merge, split or compress a file, you are usually asked to upload it to a stranger's server, where a confidential document sits for an unknown length of time under terms you did not read. The PDF tools in this category take the opposite approach. They do the work inside your browser, so the document never leaves your device, and you get the convenience of a web tool with the privacy of desktop software.",
      "This matters because the documents people most often need to manipulate are exactly the ones they should be most careful with. Combining the pages of a signed lease, splitting out a single statement from a bank export, or compressing a scanned ID to meet an upload limit are routine tasks — but each involves a file you would not want indexed, retained, or exposed. Processing locally removes that risk entirely. There is nothing to upload and nothing to delete afterward, because the file is read, transformed, and saved back without ever touching the network.",
    ],
    blocks: [
      {
        heading: "What you can do with your PDFs",
        paragraphs: [
          "The category covers the core document operations that come up again and again. Merging combines several PDFs into one, which is how you assemble a single application packet, a complete report from separate sections, or a bundle of receipts. Splitting and extracting do the reverse — pulling a range of pages, or a single page, out of a larger file when you only need to send or keep part of it. Reordering and rotating fix the structural problems scans and exports introduce, like pages that came out sideways or in the wrong sequence.",
          "Compression shrinks a PDF that is too large to email or upload, trading some image fidelity for a much smaller file — invaluable when a portal imposes a strict size cap. Conversion tools move between PDF and other formats so a document can be used where the original format is not accepted. Each tool targets one of these concrete needs, so you can fix exactly what is wrong with a document without learning a complex application or paying for a suite you will use twice a year.",
        ],
        bullets: {
          lead: "Common PDF tasks handled here:",
          items: [
            "Merging several PDFs into a single document for an application or report.",
            "Splitting a large PDF or extracting just the pages you need.",
            "Rotating pages that were scanned sideways or upside down.",
            "Reordering pages that came out in the wrong sequence.",
            "Compressing a PDF so it fits under an email or upload size limit.",
            "Converting between PDF and other formats when a system requires it.",
          ],
        },
      },
      {
        heading: "Why local PDF processing is the safer choice",
        paragraphs: [
          "Think about what a PDF often contains: a full name and address, an account number, a signature, a date of birth, salary figures, medical details. Uploading that to a free online converter means trusting an unknown operator with material that, in the wrong hands, is the raw ingredients of identity theft or fraud. Even reputable services create a window of exposure — the file exists on their infrastructure, in logs and backups, for some period you cannot verify. For genuinely sensitive documents, that window is a risk not worth taking for a thirty-second task.",
          "Browser-based tools close the window completely. The PDF is opened and manipulated by code running on your own machine; the merged, split or compressed result is generated locally and downloaded straight to your device. Nothing is uploaded, so there is nothing to be retained, leaked or subpoenaed. This is the same privacy guarantee you get from installed desktop software, but without the installation — and it is the right default for any document you would hesitate to email to a stranger.",
        ],
      },
      {
        heading: "Understanding PDF compression",
        paragraphs: [
          "PDF files balloon in size for predictable reasons, and knowing them helps you compress effectively. The biggest culprit is images: a scanned document or a PDF full of high-resolution photos carries far more data than a text-based one, and most of that data is finer than any screen or printer will reproduce. Compression works mainly by reducing image resolution and re-encoding pictures more efficiently, which is why a scan-heavy PDF can often shrink dramatically while a pure-text PDF barely moves.",
          "The trade-off is image quality, so the goal is to compress enough to clear a size limit without making text fuzzy or photos muddy. For documents that will only be read on screen or printed at normal size, you can usually compress aggressively with no practical loss. For anything destined for high-quality print, compress more cautiously. Understanding that file size is mostly about image data — not the number of pages — makes it clear why one PDF compresses easily and another stubbornly does not.",
        ],
      },
      {
        heading: "Keeping documents intact",
        paragraphs: [
          "A good PDF tool changes only what you ask it to and leaves everything else exactly as it was — text stays selectable, layout stays fixed, and pages you did not touch are untouched. That fidelity is the whole reason the format exists, so these tools are built to preserve it: merging joins documents without reflowing their contents, splitting extracts pages verbatim, and rotation changes orientation without re-rendering the text. Because the processing is local and deterministic, the output is predictable, and you can verify the result immediately by opening the downloaded file — no waiting on a server and no surprises hidden in a re-encoded copy.",
        ],
      },
      {
        heading: "Scans, images and why some PDFs behave differently",
        paragraphs: [
          "Not all PDFs are built the same way, and the difference explains a lot of confusing behavior. A PDF created directly from a document — exported from a word processor or design tool — stores its text as actual text, so it stays sharp at any zoom, can be searched, and compresses poorly because there is little image data to shrink. A PDF made by scanning paper is the opposite: each page is essentially a photograph, so the text is just pixels, it cannot be searched or selected, and it is heavy precisely because it is all image.",
          "This distinction shapes which operations make sense. Compressing a scanned PDF can produce dramatic size savings because there is so much image data to optimize, whereas a text-based PDF is already lean and barely shrinks. Splitting, merging, rotating and reordering work the same on both because they operate on whole pages rather than their contents — which is why those operations are fast and lossless no matter how a page was created.",
          "Knowing which kind of PDF you are holding sets the right expectations. If a document refuses to let you select its text, it is almost certainly a scan, and you are working with images of words rather than words themselves. If a file is stubbornly large despite few pages, it is image-heavy and a good candidate for compression. Matching the operation to the document's nature — rather than expecting every PDF to behave identically — is what makes these tools feel predictable instead of mysterious.",
          "This also informs how you assemble documents from mixed sources. A packet built from a born-digital export, a couple of scanned pages, and a downloaded statement will carry all three characters at once: some pages searchable and crisp, others image-based and heavy. Merging them is seamless because the operation works page by page, but the resulting file inherits the size and searchability of its parts. If the combined document feels unexpectedly large or refuses to find a word you know is in it, the cause is almost always one of those scanned sections — and that understanding tells you exactly which lever, compression or otherwise, to reach for.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are my PDFs uploaded to a server?",
        a: "No. Every PDF tool in this category processes your file entirely within your browser. The document is read, merged, split or compressed on your own device and the result is downloaded directly — nothing is uploaded, retained or transmitted, which keeps confidential documents private.",
      },
      {
        q: "Why is my PDF so large, and what does compression actually reduce?",
        a: "PDF size is dominated by images, not page count — scanned documents and high-resolution photos carry far more data than text. Compression mainly lowers image resolution and re-encodes pictures more efficiently, so image-heavy PDFs shrink a lot while text-only files barely change.",
      },
      {
        q: "Will merging or splitting change the content of my pages?",
        a: "No. Merging joins documents without reflowing them, and splitting extracts pages exactly as they are, so text stays selectable and layout stays fixed. Only the operation you request is applied; the rest of the document is preserved verbatim.",
      },
      {
        q: "How much can I compress a PDF without it looking bad?",
        a: "For documents read on screen or printed at normal size, you can usually compress quite aggressively with no visible loss, since the discarded detail is finer than the display reproduces. For high-quality print, compress more cautiously. Check the result by opening the file to confirm text and images still look right.",
      },
      {
        q: "Do these tools work for password-protected or signed PDFs?",
        a: "Tools generally need to be able to read a file to modify it, so an encrypted PDF must be unlocked first, and editing a digitally signed PDF can invalidate the signature by design. For ordinary unprotected documents, merging, splitting, rotating and compressing all work directly in your browser.",
      },
    ],
  },
};

export function getCategoryArticle(slug: string): CategoryArticle | undefined {
  return categoryArticles[slug];
}
