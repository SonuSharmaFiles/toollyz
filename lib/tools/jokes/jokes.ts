export type JokeCategory =
  | "dad"
  | "programming"
  | "tech"
  | "school"
  | "animal"
  | "knockknock"
  | "oneliner"
  | "pun"
  | "gaming"
  | "meme"
  | "office"
  | "relationship"
  | "food"
  | "kids"
  | "science";

export interface CategoryConfig {
  id: JokeCategory;
  label: string;
  emoji: string;
  accent: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "dad", label: "Dad jokes", emoji: "👨", accent: "text-amber-500" },
  { id: "programming", label: "Programming", emoji: "💻", accent: "text-cyan-500" },
  { id: "tech", label: "Tech", emoji: "📱", accent: "text-sky-500" },
  { id: "school", label: "School", emoji: "🏫", accent: "text-emerald-500" },
  { id: "animal", label: "Animals", emoji: "🐾", accent: "text-lime-600" },
  { id: "knockknock", label: "Knock-knock", emoji: "🚪", accent: "text-orange-500" },
  { id: "oneliner", label: "One-liners", emoji: "⚡", accent: "text-violet-500" },
  { id: "pun", label: "Puns", emoji: "😏", accent: "text-pink-500" },
  { id: "gaming", label: "Gaming", emoji: "🎮", accent: "text-purple-500" },
  { id: "meme", label: "Meme humor", emoji: "🤣", accent: "text-fuchsia-500" },
  { id: "office", label: "Office", emoji: "💼", accent: "text-slate-500" },
  { id: "relationship", label: "Relationships", emoji: "💕", accent: "text-rose-500" },
  { id: "food", label: "Food", emoji: "🍕", accent: "text-red-500" },
  { id: "kids", label: "Kids", emoji: "🧒", accent: "text-yellow-500" },
  { id: "science", label: "Science", emoji: "🔬", accent: "text-indigo-500" },
];

export const CATEGORY_BY_ID: Record<JokeCategory, CategoryConfig> =
  Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
    JokeCategory,
    CategoryConfig
  >;

export interface Joke {
  setup?: string; // optional — one-liners only have a punchline
  punchline: string;
  c: JokeCategory;
}

// [setup, punchline] — setup can be empty string for one-liners
const RAW: Record<JokeCategory, [string, string][]> = {
  dad: [
    ["Why don't scientists trust atoms?", "Because they make up everything."],
    ["What do you call a fake noodle?", "An impasta."],
    ["Why did the scarecrow win an award?", "Because he was outstanding in his field."],
    ["I'm reading a book about anti-gravity.", "It's impossible to put down."],
    ["Why don't skeletons fight each other?", "They don't have the guts."],
    ["What do you call cheese that isn't yours?", "Nacho cheese."],
    ["Why did the bicycle fall over?", "Because it was two-tired."],
    ["How do you organize a space party?", "You planet."],
  ],
  programming: [
    ["Why do programmers prefer dark mode?", "Because light attracts bugs."],
    ["How many programmers does it take to change a light bulb?", "None — that's a hardware problem."],
    ["Why do Java developers wear glasses?", "Because they can't C#."],
    ["", "There are 10 types of people in the world: those who understand binary and those who don't."],
    ["", "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'"],
    ["Why did the developer go broke?", "Because he used up all his cache."],
    ["", "I would tell you a UDP joke, but you might not get it."],
    ["Why was the function sad after the breakup?", "It never got a callback."],
  ],
  tech: [
    ["Why was the computer cold?", "It left its Windows open."],
    ["Why did the smartphone need glasses?", "It lost all its contacts."],
    ["", "I changed my password to 'incorrect' so my computer just tells me when I forget it."],
    ["Why don't robots ever panic?", "They have nerves of steel."],
    ["", "My Wi-Fi went down for five minutes, so I had to talk to my family. They seem like nice people."],
    ["Why did the PowerPoint cross the road?", "To get to the other slide."],
    ["", "To whoever stole my copy of Microsoft Office: I will find you. You have my Word."],
    ["Why was the keyboard up all night?", "It had two shifts."],
  ],
  school: [
    ["Why did the student eat his homework?", "The teacher said it was a piece of cake."],
    ["Why is the math book always sad?", "Because it has too many problems."],
    ["What's a snake's favorite subject?", "Hiss-tory."],
    ["Why did the kid bring a ladder to school?", "Because he wanted to go to high school."],
    ["Why did the teacher wear sunglasses?", "Because her students were so bright."],
    ["What did the pencil say to the paper?", "I dot my i's on you."],
    ["How do you make seven even?", "Take away the 's'."],
    ["Why was the geometry book stressed?", "It had too many angles to consider."],
  ],
  animal: [
    ["What do you call a bear with no teeth?", "A gummy bear."],
    ["What do you call a dog that can do magic?", "A labracadabrador."],
    ["Why don't elephants use computers?", "They're afraid of the mouse."],
    ["What do you call a fish with no eyes?", "A fsh."],
    ["How does a penguin build its house?", "Igloos it together."],
    ["Why are cats bad storytellers?", "They only have one tail."],
    ["What do you call a sleeping dinosaur?", "A dino-snore."],
    ["What do you call a pig that does karate?", "A pork chop."],
  ],
  knockknock: [
    ["Knock knock. Who's there? Lettuce. Lettuce who?", "Lettuce in — it's cold out here!"],
    ["Knock knock. Who's there? Boo. Boo who?", "Aw, don't cry, it's just a joke!"],
    ["Knock knock. Who's there? Tank. Tank who?", "You're welcome!"],
    ["Knock knock. Who's there? Atch. Atch who?", "Bless you!"],
    ["Knock knock. Who's there? Cow says. Cow says who?", "No, a cow says moooo!"],
    ["Knock knock. Who's there? Olive. Olive who?", "Olive you and I miss you!"],
    ["Knock knock. Who's there? Interrupting cow. Interrupting c—", "MOO!"],
    ["Knock knock. Who's there? Wanda. Wanda who?", "Wanda hang out sometime?"],
  ],
  oneliner: [
    ["", "I told my wife she was drawing her eyebrows too high. She looked surprised."],
    ["", "I used to play piano by ear, but now I use my hands."],
    ["", "I'm on a seafood diet. I see food and I eat it."],
    ["", "Parallel lines have so much in common. It's a shame they'll never meet."],
    ["", "Singing in the shower is fun until you get soap in your mouth. Then it's a soap opera."],
    ["", "I only know 25 letters of the alphabet. I don't know y."],
    ["", "The past, the present, and the future walked into a bar. It was tense."],
    ["", "I have a fear of speed bumps, but I'm slowly getting over it."],
  ],
  pun: [
    ["", "I wouldn't buy anything with velcro. It's a total rip-off."],
    ["", "Did you hear about the cheese factory that exploded? There was nothing left but de-brie."],
    ["", "I'm reading a book on the history of glue — I just can't put it down."],
    ["", "A boiled egg every morning is hard to beat."],
    ["", "I used to be a banker, but I lost interest."],
    ["", "The grammarian had a lot of comma sense."],
    ["", "Time flies like an arrow. Fruit flies like a banana."],
    ["", "I made a pencil with two erasers. It was pointless."],
  ],
  gaming: [
    ["Why did the gamer bring string to the dungeon?", "To tie up loose ends."],
    ["Why don't gamers ever get cold?", "They get plenty of heat from their PCs."],
    ["What's a gamer's favorite snack?", "Game chips."],
    ["Why did Mario go to therapy?", "His princess was always in another castle."],
    ["Why are gamers great at relationships?", "They never give up after the first try."],
    ["What do you call a sheep that loves battle royales?", "A baaa-ttle royale fan."],
    ["Why did the gamer cross the road?", "To respawn on the other side."],
    ["Why was the video game character so calm?", "He had unlimited lives."],
  ],
  meme: [
    ["", "Me: I'll go to bed early tonight. Me at 3am: but what if dolphins have names for each other?"],
    ["", "Nobody: ... Me: explaining the entire plot of a show no one asked about."],
    ["", "Adulthood is just googling how to do things and being tired."],
    ["", "I'm not lazy, I'm on energy-saving mode."],
    ["", "My motivation is on a coffee break. Indefinitely."],
    ["", "I put my phone on airplane mode and it's still not flying. Worst purchase ever."],
    ["", "My bed in the morning: stay. My bed at night: actually, get up and overthink."],
    ["", "Me trying to remember why I walked into this room: a documentary."],
  ],
  office: [
    ["", "My coworker can no longer attend meetings on Thursdays. We're really going to miss her."],
    ["", "The office printer works on faith alone — it senses fear."],
    ["", "Teamwork is important; it helps you put the blame on someone else."],
    ["", "My favorite part of working from home is the commute from my bed to my desk."],
    ["", "A meeting is an event where minutes are kept and hours are lost."],
    ["", "I told my boss three companies were after me, so I needed a raise: the gas, electric, and water company."],
    ["", "I always give 100% at work: 13% Monday, 22% Tuesday, 26% Wednesday, 35% Thursday, 4% Friday."],
    ["", "My out-of-office reply just says 'same.'"],
  ],
  relationship: [
    ["", "My partner asked me to stop singing 'Wonderwall.' I said maybe."],
    ["", "Marriage is finding that one special person you want to annoy for the rest of your life."],
    ["", "Relationships are like algebra. Have you ever looked at your X and wondered Y?"],
    ["", "My partner said I never listen. Or something like that."],
    ["", "Behind every great person is someone rolling their eyes."],
    ["", "Love is sharing your popcorn — which is why I eat mine alone."],
    ["", "My partner and I never fight over the remote. We have two TVs."],
    ["", "I told my crush I liked them. They said 'aww' — that's 'no' with a hug."],
  ],
  food: [
    ["Why did the tomato turn red?", "Because it saw the salad dressing."],
    ["What do you call a sad strawberry?", "A blueberry."],
    ["Why did the cookie go to the doctor?", "Because it was feeling crumby."],
    ["Why don't eggs tell jokes?", "They'd crack each other up."],
    ["What did the grape do when it got stepped on?", "Nothing — it just let out a little wine."],
    ["Why did the banana go to the doctor?", "Because it wasn't peeling well."],
    ["What's a potato's favorite horror movie?", "The Silence of the Yams."],
    ["How do you fix a cracked pumpkin?", "With a pumpkin patch."],
  ],
  kids: [
    ["What do you call a dinosaur that crashes his car?", "Tyrannosaurus wrecks."],
    ["Why did the cookie cry?", "Because its mom was a wafer too long."],
    ["What's brown and sticky?", "A stick!"],
    ["Why can't you give Elsa a balloon?", "Because she'll let it go."],
    ["Why did the teddy bear say no to dessert?", "Because she was stuffed."],
    ["What has ears but cannot hear?", "A cornfield."],
    ["What do you call two birds in love?", "Tweethearts."],
    ["Why did the kid cross the playground?", "To get to the other slide."],
  ],
  science: [
    ["", "I have a new theory on inertia, but it doesn't seem to be gaining momentum."],
    ["Why are chemists great at solving problems?", "They have all the solutions."],
    ["What did one cell say when its sister stepped on its toe?", "Mitosis!"],
    ["Why did the physics teacher break up with the biology teacher?", "There was no chemistry."],
    ["", "How often do I make chemistry jokes? Periodically."],
    ["", "Schrödinger's cat walks into a bar. And doesn't."],
    ["What do you do with a sick chemist?", "If you can't helium or curium, you might as well barium."],
    ["", "Biology is the only science where multiplication is the same thing as division."],
  ],
};

export const JOKES: Joke[] = (Object.keys(RAW) as JokeCategory[]).flatMap((cat) =>
  RAW[cat].map(([setup, punchline]) => ({
    setup: setup || undefined,
    punchline,
    c: cat,
  })),
);

// ─── Random + daily ─────────────────────────────────────────────────────────

function secureInt(max: number): number {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let v: number;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

export function randomJoke(category: JokeCategory | "all"): Joke {
  const pool = category === "all" ? JOKES : JOKES.filter((j) => j.c === category);
  const list = pool.length ? pool : JOKES;
  return list[secureInt(list.length)];
}

export function randomJokes(category: JokeCategory | "all", count: number): Joke[] {
  const pool = category === "all" ? JOKES : JOKES.filter((j) => j.c === category);
  const list = pool.length ? pool : JOKES;
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const out = shuffled.slice(0, Math.min(count, shuffled.length));
  while (out.length < count) out.push(list[secureInt(list.length)]);
  return out;
}

export function similarJoke(joke: Joke): Joke {
  const pool = JOKES.filter((j) => j.c === joke.c && j.punchline !== joke.punchline);
  const list = pool.length ? pool : JOKES;
  return list[secureInt(list.length)];
}

export function dailyJoke(): Joke {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const seed = dayOfYear + now.getFullYear() * 366;
  return JOKES[seed % JOKES.length];
}

export function jokeText(joke: Joke): string {
  return joke.setup ? `${joke.setup}\n${joke.punchline}` : joke.punchline;
}

export function searchJokes(query: string, limit = 30): Joke[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return JOKES.filter(
    (j) =>
      j.punchline.toLowerCase().includes(q) ||
      (j.setup ?? "").toLowerCase().includes(q),
  ).slice(0, limit);
}

export type Reaction = "funny" | "meh" | "unexpected" | "love";

export const REACTIONS: { id: Reaction; emoji: string; label: string }[] = [
  { id: "funny", emoji: "😂", label: "Funny" },
  { id: "meh", emoji: "😐", label: "Meh" },
  { id: "unexpected", emoji: "🤯", label: "Unexpected" },
  { id: "love", emoji: "❤️", label: "Love" },
];
