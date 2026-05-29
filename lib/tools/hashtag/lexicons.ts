// Curated hashtag lexicons for the Toollyz Hashtag Generator. A static site has
// no access to live platform trends, so suggestions are built from well-known
// popular ("broad") and long-tail ("niche") modifiers plus per-platform and
// per-category banks. Deterministic and dependency-free.

export const PLATFORMS = ["instagram", "tiktok", "x", "linkedin", "youtube"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_META: Record<Platform, { name: string; defaultCount: number; max: number; tags: string[] }> = {
  instagram: { name: "Instagram", defaultCount: 20, max: 30, tags: ["instagood", "instadaily", "igers", "instamood", "photooftheday", "picoftheday", "bhfyp", "reels", "explorepage", "instagram"] },
  tiktok: { name: "TikTok", defaultCount: 6, max: 15, tags: ["fyp", "foryou", "foryoupage", "viral", "tiktok", "trending", "fypシ", "tiktokviral"] },
  x: { name: "X / Twitter", defaultCount: 4, max: 10, tags: ["trending", "news", "thread", "community"] },
  linkedin: { name: "LinkedIn", defaultCount: 5, max: 12, tags: ["leadership", "networking", "career", "innovation", "growth", "hiring", "personalbranding", "professionaldevelopment"] },
  youtube: { name: "YouTube", defaultCount: 8, max: 15, tags: ["youtube", "subscribe", "video", "vlog", "shorts", "youtubechannel", "youtuber", "newvideo"] },
};

// High-volume, broad-reach modifiers (lots of posts, lots of competition)
export const GENERIC_BROAD = ["love", "life", "daily", "best", "top", "world", "style", "art", "happy", "beautiful", "amazing", "viral", "trending", "explore", "follow", "vibes", "mood", "goals", "inspiration", "motivation"];

// Long-tail, niche modifiers (fewer posts, easier to rank)
export const GENERIC_NICHE = ["tips", "ideas", "hacks", "guide", "blogger", "lover", "addict", "community", "ofinstagram", "gram", "nation", "official", "lifestyle", "everyday", "obsessed", "enthusiast", "junkie", "diaries", "journal", "routine"];

export const PREFIX_MODIFIERS = ["best", "my", "daily", "love"];

export interface Category { id: string; name: string; match: string[]; tags: string[] }

export const CATEGORIES: Category[] = [
  { id: "travel", name: "Travel", match: ["travel", "trip", "vacation", "wanderlust", "adventure", "tourism", "explore", "backpack", "roadtrip"], tags: ["travelgram", "wanderlust", "travelphotography", "instatravel", "travelblogger", "explore", "adventure", "traveltheworld", "passionpassport", "roamtheplanet"] },
  { id: "food", name: "Food", match: ["food", "recipe", "cook", "baking", "foodie", "meal", "dinner", "restaurant", "cuisine"], tags: ["foodporn", "foodie", "instafood", "foodphotography", "homemade", "yummy", "foodstagram", "delicious", "tasty", "foodlover"] },
  { id: "fitness", name: "Fitness", match: ["fitness", "gym", "workout", "exercise", "training", "muscle", "health", "cardio", "yoga"], tags: ["fitfam", "fitnessmotivation", "workout", "gymlife", "fitspo", "training", "healthylifestyle", "noexcuses", "getfit", "fitnessjourney"] },
  { id: "fashion", name: "Fashion", match: ["fashion", "style", "outfit", "clothing", "wear", "ootd", "streetwear", "designer"], tags: ["ootd", "fashionista", "style", "fashionblogger", "streetstyle", "outfitoftheday", "lookbook", "fashionstyle", "wiwt", "instafashion"] },
  { id: "beauty", name: "Beauty", match: ["beauty", "makeup", "skincare", "cosmetic", "hair", "nails", "lashes", "glam"], tags: ["makeup", "beauty", "skincare", "makeupartist", "mua", "glam", "beautyblogger", "instamakeup", "selfcare", "makeuplover"] },
  { id: "photography", name: "Photography", match: ["photo", "photography", "camera", "portrait", "shoot", "lens", "photographer"], tags: ["photography", "photooftheday", "photographer", "portrait", "naturephotography", "streetphotography", "photoshoot", "canon", "nikon", "shotoniphone"] },
  { id: "business", name: "Business", match: ["business", "startup", "entrepreneur", "marketing", "money", "finance", "ecommerce", "sales"], tags: ["entrepreneur", "businessowner", "startup", "smallbusiness", "marketing", "success", "hustle", "entrepreneurlife", "digitalmarketing", "growthmindset"] },
  { id: "tech", name: "Tech", match: ["tech", "code", "coding", "programming", "developer", "software", "ai", "data", "web"], tags: ["technology", "coding", "programming", "developer", "webdevelopment", "javascript", "tech", "coderlife", "softwareengineer", "100daysofcode"] },
  { id: "art", name: "Art & Design", match: ["art", "design", "draw", "paint", "illustration", "sketch", "creative", "artist"], tags: ["art", "artist", "artwork", "illustration", "drawing", "design", "digitalart", "creative", "artoftheday", "instaart"] },
  { id: "music", name: "Music", match: ["music", "song", "artist", "band", "singer", "producer", "beat", "rap", "guitar"], tags: ["music", "musician", "newmusic", "singer", "songwriter", "producer", "musicproducer", "spotify", "musiclover", "instamusic"] },
  { id: "nature", name: "Nature", match: ["nature", "outdoor", "hiking", "mountain", "forest", "wildlife", "landscape", "garden"], tags: ["nature", "naturephotography", "naturelovers", "landscape", "hiking", "outdoors", "wildlife", "earthpix", "mothernature", "naturegram"] },
  { id: "pets", name: "Pets", match: ["pet", "dog", "cat", "puppy", "kitten", "animal", "doggo"], tags: ["petsofinstagram", "dogsofinstagram", "catsofinstagram", "puppy", "doglover", "catlover", "petstagram", "instapet", "adoptdontshop", "cutepets"] },
];

// Tags to never emit (commonly shadow-banned or unsafe seeds)
export const BLOCKLIST = new Set<string>([
  "follow4follow", "f4f", "like4like", "l4l", "followforfollow", "likeforlike",
  "followback", "tagsforlikes", "instagood4you", "kissing", "valentinesday",
  "nasty", "snap", "petite", "alone", "sopretty", "thought", "single", "stranger",
]);

export function detectCategory(words: string[]): Category | null {
  const lower = words.map((w) => w.toLowerCase());
  for (const cat of CATEGORIES) {
    if (cat.match.some((m) => lower.some((w) => w.includes(m) || m.includes(w)))) return cat;
  }
  return null;
}
