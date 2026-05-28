import {
  Clapperboard,
  Dumbbell,
  GraduationCap,
  Heart,
  Plane,
  Sparkles,
  Users,
  Utensils,
  CalendarHeart,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";

export interface DecisionPreset {
  id: string;
  label: string;
  icon: LucideIcon;
  theme: string;
  options: string[];
}

export const DECISION_PRESETS: DecisionPreset[] = [
  {
    id: "lunch",
    label: "Lunch picker",
    icon: Utensils,
    theme: "birthday",
    options: ["Pizza", "Sushi", "Burgers", "Tacos", "Pasta", "Salad", "Ramen", "Sandwich"],
  },
  {
    id: "movie",
    label: "Movie night",
    icon: Clapperboard,
    theme: "neon",
    options: ["Action", "Comedy", "Horror", "Sci-Fi", "Romance", "Thriller", "Animation", "Documentary"],
  },
  {
    id: "yesno",
    label: "Yes / No",
    icon: CircleHelp,
    theme: "minimal",
    options: ["Yes", "No", "Yes", "No", "Maybe", "Ask again"],
  },
  {
    id: "truth-dare",
    label: "Truth or Dare",
    icon: Sparkles,
    theme: "gaming",
    options: ["Truth", "Dare", "Truth", "Dare", "Truth", "Dare"],
  },
  {
    id: "workout",
    label: "Workout",
    icon: Dumbbell,
    theme: "gaming",
    options: ["Push-ups", "Squats", "Plank", "Burpees", "Lunges", "Jumping jacks", "Sit-ups", "Rest"],
  },
  {
    id: "study",
    label: "Study topic",
    icon: GraduationCap,
    theme: "classroom",
    options: ["Math", "Science", "History", "English", "Coding", "Languages", "Review", "Break"],
  },
  {
    id: "team",
    label: "Team picker",
    icon: Users,
    theme: "corporate",
    options: ["Team Red", "Team Blue", "Team Green", "Team Gold"],
  },
  {
    id: "date",
    label: "Date ideas",
    icon: CalendarHeart,
    theme: "luxury",
    options: ["Dinner out", "Movie", "Picnic", "Game night", "Cooking", "Museum", "Concert", "Long walk"],
  },
  {
    id: "travel",
    label: "Where to travel",
    icon: Plane,
    theme: "neon",
    options: ["Paris", "Tokyo", "New York", "Bali", "Rome", "Barcelona", "Dubai", "Sydney"],
  },
  {
    id: "weekend",
    label: "Weekend plan",
    icon: Heart,
    theme: "retro",
    options: ["Hiking", "Movie", "Shopping", "Gaming", "Cooking", "Sleep in", "Friends", "Beach"],
  },
];
