export type FactCategory =
  | "science"
  | "space"
  | "technology"
  | "history"
  | "psychology"
  | "animals"
  | "body"
  | "geography"
  | "food"
  | "movies"
  | "gaming"
  | "internet"
  | "business"
  | "nature"
  | "weird"
  | "funny"
  | "mindblowing"
  | "kids";

export interface CategoryConfig {
  id: FactCategory;
  label: string;
  accent: string; // tailwind text/bg accent
  emoji: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "science", label: "Science", accent: "text-sky-500", emoji: "🔬" },
  { id: "space", label: "Space", accent: "text-indigo-500", emoji: "🪐" },
  { id: "technology", label: "Technology", accent: "text-cyan-500", emoji: "💻" },
  { id: "history", label: "History", accent: "text-amber-600", emoji: "🏛️" },
  { id: "psychology", label: "Psychology", accent: "text-violet-500", emoji: "🧠" },
  { id: "animals", label: "Animals", accent: "text-emerald-500", emoji: "🦊" },
  { id: "body", label: "Human body", accent: "text-rose-500", emoji: "🫀" },
  { id: "geography", label: "Geography", accent: "text-teal-500", emoji: "🌍" },
  { id: "food", label: "Food", accent: "text-orange-500", emoji: "🍕" },
  { id: "movies", label: "Movies", accent: "text-fuchsia-500", emoji: "🎬" },
  { id: "gaming", label: "Gaming", accent: "text-purple-500", emoji: "🎮" },
  { id: "internet", label: "Internet", accent: "text-blue-500", emoji: "🌐" },
  { id: "business", label: "Business", accent: "text-green-600", emoji: "💼" },
  { id: "nature", label: "Nature", accent: "text-lime-600", emoji: "🌿" },
  { id: "weird", label: "Weird", accent: "text-pink-500", emoji: "🤪" },
  { id: "funny", label: "Funny", accent: "text-yellow-500", emoji: "😂" },
  { id: "mindblowing", label: "Mind-blowing", accent: "text-red-500", emoji: "🤯" },
  { id: "kids", label: "Kids", accent: "text-amber-500", emoji: "🧒" },
];

export const CATEGORY_BY_ID: Record<FactCategory, CategoryConfig> =
  Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
    FactCategory,
    CategoryConfig
  >;

export interface Fact {
  text: string;
  c: FactCategory;
}

const RAW: Record<FactCategory, string[]> = {
  science: [
    "A teaspoon of neutron-star material would weigh about 6 billion tons on Earth.",
    "Honey never spoils — archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
    "Under the right conditions, hot water can freeze faster than cold water — known as the Mpemba effect.",
    "Bananas are slightly radioactive because they contain potassium-40.",
    "A single bolt of lightning is roughly five times hotter than the surface of the Sun.",
    "Glass is an amorphous solid, not a slow-moving liquid — old wavy windows come from manufacturing, not flow.",
    "Helium is the only element that was discovered in space (in the Sun) before being found on Earth.",
    "If you removed all the empty space from atoms, the entire human race would fit in the volume of a sugar cube.",
  ],
  space: [
    "A day on Venus is longer than its entire year — it rotates slower than it orbits the Sun.",
    "There are more stars in the universe than grains of sand on all of Earth's beaches.",
    "Footprints left on the Moon could last millions of years — there's no wind or water to erode them.",
    "Saturn is less dense than water, so it would float if you could find a big enough bathtub.",
    "About one million Earths could fit inside the Sun.",
    "Space is completely silent because there is no air to carry sound waves.",
    "Neutron stars can spin up to 600 times every second.",
    "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  ],
  technology: [
    "The first computer 'bug' was a real moth found stuck in a relay in 1947.",
    "The QWERTY keyboard layout was designed in the 1870s partly to keep typewriter keys from jamming.",
    "The first webcam was created to watch a coffee pot at Cambridge University.",
    "Email is older than the World Wide Web.",
    "Nintendo was founded in 1889 and originally made playing cards.",
    "The first 1 GB hard drive (1980) weighed over 250 kg and cost around $40,000.",
    "The '@' symbol was used in commerce for centuries before it appeared in email addresses.",
    "More than 90% of the world's money exists only as digital data, not physical cash.",
  ],
  history: [
    "Oxford University is older than the Aztec Empire.",
    "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.",
    "The shortest war in recorded history, between Britain and Zanzibar in 1896, lasted about 38 minutes.",
    "Vikings never actually wore horned helmets — that image came from 19th-century opera costumes.",
    "The Eiffel Tower can grow more than 15 cm taller in summer as its metal expands in the heat.",
    "Ancient Egyptians used slabs of stone as pillows.",
    "The Great Wall of China is not visible from space with the naked eye, despite the popular myth.",
    "Napoleon was once attacked by a horde of rabbits released for a hunt.",
  ],
  psychology: [
    "Your brain uses about 20% of your body's energy while being only about 2% of its weight.",
    "'Déjà vu' is French for 'already seen.'",
    "The Dunning-Kruger effect describes how people with the least skill often overestimate their ability.",
    "Smiling — even a forced smile — can slightly lift your mood, an idea called the facial-feedback hypothesis.",
    "Most people can hold only about four items in working memory at once.",
    "The colour red can raise heart rate and create a sense of urgency.",
    "Your brain is more active while you sleep than while you watch television.",
    "We tend to remember the beginning and end of an experience more than the middle — the 'peak-end rule.'",
  ],
  animals: [
    "Octopuses have three hearts and blue blood.",
    "A group of flamingos is called a 'flamboyance.'",
    "Sea otters hold hands while sleeping so they don't drift apart.",
    "Cows have best friends and become stressed when they are separated.",
    "Wombat droppings are cube-shaped.",
    "Honeybees can recognise individual human faces.",
    "A snail can sleep for up to three years.",
    "Sloths can hold their breath longer than dolphins — up to 40 minutes.",
  ],
  body: [
    "Your stomach gets a new lining every few days, or its own acid would digest it.",
    "You're about 1 cm taller in the morning than at night, as spinal discs compress during the day.",
    "The human nose can distinguish over one trillion different scents.",
    "Humans are the only animals with a true chin.",
    "Your heart beats roughly 100,000 times a day.",
    "Bone is, gram for gram, several times stronger than steel.",
    "You have more bacterial cells associated with your body than human cells.",
    "The acid in your stomach is strong enough to dissolve some metals over time.",
  ],
  geography: [
    "Russia spans 11 time zones.",
    "Canada has more lakes than the rest of the world combined.",
    "The Sahara Desert was green and dotted with lakes around 6,000 years ago.",
    "Measured from base to peak, Mauna Kea in Hawaii is taller than Mount Everest.",
    "Africa is the only continent that sits in all four hemispheres.",
    "Australia is wider than the diameter of the Moon.",
    "The Mariana Trench is deeper than Mount Everest is tall.",
    "In Longyearbyen, Norway, it is effectively illegal to die — the permafrost prevents burials.",
  ],
  food: [
    "Carrots were originally purple — orange ones were cultivated in the Netherlands in the 17th century.",
    "Pineapples take about two to three years to grow a single fruit.",
    "The Aztecs used cacao beans as a form of currency.",
    "Apples float in water because they're roughly 25% air.",
    "Peanuts are not nuts — they're legumes, like beans and lentils.",
    "Ketchup was sold as medicine in the 1830s to treat indigestion.",
    "Saffron is the world's most expensive spice by weight.",
    "Honey is made by bees regurgitating and evaporating nectar — and it never goes bad.",
  ],
  movies: [
    "Anthony Hopkins is on screen for about 16 minutes in 'The Silence of the Lambs' yet won Best Actor.",
    "Pixar accidentally almost deleted 'Toy Story 2' with a single server command — a backup at home saved it.",
    "The 'Wilhelm Scream' sound effect has appeared in hundreds of films since 1951.",
    "Pixar hides the code 'A113' (a CalArts classroom) in nearly all of its films.",
    "The shark in 'Jaws' was nicknamed 'Bruce' after Steven Spielberg's lawyer.",
    "The MGM lion's roar is one of the most recognisable trademarks in cinema.",
    "The first feature-length animated film was Disney's 'Snow White and the Seven Dwarfs' (1937).",
    "Sound in space scenes is added purely for drama — real space is silent.",
  ],
  gaming: [
    "Minecraft is the best-selling video game of all time, with over 300 million copies sold.",
    "Pac-Man's design was inspired by a pizza with a slice missing.",
    "One of the earliest video games, 'Tennis for Two,' was built in 1958 on an oscilloscope.",
    "Players of the game Foldit helped solve a protein-folding puzzle that had stumped scientists for years.",
    "The Konami Code — up, up, down, down, left, right, left, right, B, A — debuted in 1986.",
    "Tetris was created by Alexey Pajitnov in 1984 in the Soviet Union.",
    "The PlayStation began as a Nintendo–Sony collaboration before the partnership collapsed.",
    "The word 'avatar' for a game character comes from a Sanskrit word for a divine incarnation.",
  ],
  internet: [
    "The first item ever sold on eBay was a broken laser pointer.",
    "'Google' comes from 'googol' — the number 1 followed by 100 zeros.",
    "The first YouTube video, 'Me at the zoo,' was uploaded in April 2005.",
    "The hashtag symbol (#) is formally called an 'octothorpe.'",
    "The first emoji set was designed in 1999 by Shigetaka Kurita in Japan.",
    "Wikipedia is available in more than 300 languages.",
    "The first registered domain name, symbolics.com, was registered in 1985.",
    "Roughly 500 hours of video are uploaded to YouTube every single minute.",
  ],
  business: [
    "Amazon launched in 1994 as an online bookstore run out of a garage.",
    "Lego is the world's largest tyre manufacturer by number of units produced.",
    "Coca-Cola's secret formula is famously kept in a vault in Atlanta.",
    "Apple was founded in 1976 in Steve Jobs's family garage.",
    "Ferrari produces a deliberately limited number of cars each year to protect exclusivity.",
    "IKEA's furniture names follow themes — e.g. beds and wardrobes often use Norwegian place names.",
    "The most valuable companies in history have nearly all been built on either oil or technology.",
    "Bubble wrap was originally invented in 1957 as textured wallpaper.",
  ],
  nature: [
    "There are an estimated 3 trillion trees on Earth — more than the stars in the Milky Way.",
    "Bamboo is the fastest-growing plant, capable of growing up to 90 cm in a single day.",
    "Lightning strikes the Earth roughly 8 million times every day.",
    "Rainbows are actually full circles — from the ground we usually see only an arc.",
    "Trees can share nutrients and warnings through underground fungal networks nicknamed the 'wood wide web.'",
    "The Earth's inner core is roughly as hot as the surface of the Sun.",
    "A single mature tree can release enough oxygen in a season for two people.",
    "Some bamboo species flower only once every 60 to 120 years.",
  ],
  weird: [
    "It's almost impossible to hum while holding your nose closed.",
    "A 'jiffy' is an actual unit of time — about one hundredth of a second.",
    "Scotland's national animal is the unicorn.",
    "There are more possible games of chess than there are atoms in the observable universe.",
    "The dot over a lowercase 'i' or 'j' is called a 'tittle.'",
    "Gustave Eiffel built a small private apartment near the top of the Eiffel Tower.",
    "A 'moment' was a real medieval unit of time lasting about 90 seconds.",
    "The longest English word without a vowel (besides 'y') is 'rhythms.'",
  ],
  funny: [
    "A group of pugs is called a 'grumble.'",
    "Penguins sometimes propose to a mate with a carefully chosen pebble.",
    "The Welsh word 'cwtch' means a warm, affectionate cuddle.",
    "Sea otters keep a favourite rock in a pouch of loose skin under their arm.",
    "The word 'nerd' first appeared in a Dr. Seuss book in 1950.",
    "A group of ferrets is called a 'business.'",
    "Cows are reported to produce a little more milk when they listen to calm music.",
    "The fear of long words is humorously called 'hippopotomonstrosesquippedaliophobia.'",
  ],
  mindblowing: [
    "If you could fold a sheet of paper 42 times, it would be thick enough to reach the Moon.",
    "There are more ways to shuffle a deck of 52 cards than there are atoms on Earth.",
    "Bananas and humans share roughly 50% of their DNA.",
    "The observable universe is about 93 billion light-years across.",
    "Your body is made of around 37 trillion cells.",
    "Every day is getting very slightly longer — Earth's rotation slows by about 1.7 milliseconds per century.",
    "We now take more photographs every two minutes than all of humanity did in the entire 1800s.",
    "The number of possible iterations of a Rubik's Cube is over 43 quintillion.",
  ],
  kids: [
    "A shrimp's heart is located in its head.",
    "Butterflies taste with their feet.",
    "Sharks existed on Earth before trees did.",
    "Cats can't taste sweetness.",
    "Elephants are the only animals that can't jump.",
    "A group of frogs is called an 'army.'",
    "Some baby turtles can breathe partly through their bottoms.",
    "A cloud can weigh more than a million pounds, yet still float.",
  ],
};

export const FACTS: Fact[] = (Object.keys(RAW) as FactCategory[]).flatMap((cat) =>
  RAW[cat].map((text) => ({ text, c: cat })),
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

export function randomFact(category: FactCategory | "all"): Fact {
  const pool = category === "all" ? FACTS : FACTS.filter((f) => f.c === category);
  const list = pool.length ? pool : FACTS;
  return list[secureInt(list.length)];
}

export function randomFacts(category: FactCategory | "all", count: number): Fact[] {
  const pool = category === "all" ? FACTS : FACTS.filter((f) => f.c === category);
  const list = pool.length ? pool : FACTS;
  // unique where possible
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const out = shuffled.slice(0, Math.min(count, shuffled.length));
  while (out.length < count) out.push(list[secureInt(list.length)]);
  return out;
}

export function similarFact(fact: Fact): Fact {
  const pool = FACTS.filter((f) => f.c === fact.c && f.text !== fact.text);
  const list = pool.length ? pool : FACTS;
  return list[secureInt(list.length)];
}

// Deterministic fact-of-the-day based on day number
export function dailyFact(): Fact {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86400000,
  );
  const seed = dayOfYear + now.getFullYear() * 366;
  return FACTS[seed % FACTS.length];
}

export function readingSeconds(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(3, Math.round((words / 200) * 60));
}

export function searchFacts(query: string, limit = 40): Fact[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FACTS.filter((f) => f.text.toLowerCase().includes(q)).slice(0, limit);
}
