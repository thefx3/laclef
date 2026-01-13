// lib/apps.ts
import { Croissant, Headset, Music, PersonStanding } from "lucide-react";

export const APPS = [
  { key: "accueil", href: "/accueil", label: "Accueil", Icon: Headset, colorClass: "text-green-500" },
  { key: "flce", href: "/flce", label: "FLCE", Icon: Croissant, colorClass: "text-blue-500" },
  { key: "activites", href: "/activites", label: "Activités", Icon: PersonStanding, colorClass: "text-violet-500" },
  { key: "musique", href: "/musique", label: "Musique", Icon: Music, colorClass: "text-orange-500" },
] as const;

export type AppKey = (typeof APPS)[number]["key"];
export type AppItem = (typeof APPS)[number];
