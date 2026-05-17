// Curated placeholder professionals shown on the public discovery page
// until real famous users sign up.

export type SeedPro = {
  username: string;
  display_name: string;
  profession: string;
  bio: string;
  skills: string[];
  avatar_gradient: string;
  is_verified?: boolean;
  is_premium?: boolean;
  works: { title: string; category: string; gradient: string; aspect?: "video" | "square" | "tall" }[];
};

export const SEED_PROS: SeedPro[] = [
  {
    username: "cy7e",
    display_name: "cy7e",
    profession: "Founder · Developer",
    bio: "Building Professionals. Available for select dev contracts.",
    skills: ["TypeScript", "React", "Systems"],
    avatar_gradient: "linear-gradient(135deg, #ffffff, #888)",
    is_verified: true,
    is_premium: true,
    works: [
      { title: "Professionals — Platform", category: "Development", gradient: "linear-gradient(135deg, #1a1a1a, #404040)", aspect: "video" },
      { title: "Neural Index", category: "AI Systems", gradient: "linear-gradient(135deg, #0a0a0a, #2a2a2a)", aspect: "square" },
    ],
  },
  {
    username: "blob",
    display_name: "blob",
    profession: "Designer · Editor",
    bio: "Motion + brand systems. Founder badge.",
    skills: ["After Effects", "Branding", "Editorial"],
    avatar_gradient: "linear-gradient(135deg, #444, #fff)",
    is_verified: true,
    is_premium: true,
    works: [
      { title: "Editorial Loop No. 4", category: "Motion", gradient: "linear-gradient(160deg, #2a2a2a, #555)", aspect: "video" },
      { title: "Aether Identity", category: "Branding", gradient: "linear-gradient(160deg, #0f0f0f, #383838)", aspect: "tall" },
    ],
  },
  {
    username: "voss",
    display_name: "Elena Voss",
    profession: "Motion Artist",
    bio: "Cinema 4D / Redshift. Brand films & 3D residencies.",
    skills: ["Cinema 4D", "Redshift", "Houdini"],
    avatar_gradient: "linear-gradient(135deg, #5e5e5e, #c4c4c4)",
    is_verified: true,
    works: [
      { title: "Liquid Chrome — Frame 042", category: "Motion", gradient: "linear-gradient(135deg, #1a1a1a, #6a6a6a)", aspect: "video" },
      { title: "Glass Studies", category: "3D", gradient: "linear-gradient(135deg, #222, #888)", aspect: "square" },
    ],
  },
  {
    username: "schen",
    display_name: "Sarah Chen",
    profession: "Product Designer",
    bio: "End-to-end product design for ambitious teams.",
    skills: ["Product", "Visual ID", "Strategy"],
    avatar_gradient: "linear-gradient(135deg, #8a8a8a, #f0f0f0)",
    works: [
      { title: "Atlas — Dashboard System", category: "UI/UX", gradient: "linear-gradient(135deg, #0d0d0d, #4a4a4a)", aspect: "video" },
    ],
  },
  {
    username: "kael",
    display_name: "Kael Sorensen",
    profession: "Frontend Engineer",
    bio: "Layout obsessive. Building UIs for top-tier startups.",
    skills: ["TypeScript", "WebGL", "Layout"],
    avatar_gradient: "linear-gradient(135deg, #3a3a3a, #b8b8b8)",
    works: [
      { title: "Type Index v2", category: "Development", gradient: "linear-gradient(135deg, #161616, #4f4f4f)", aspect: "square" },
    ],
  },
  {
    username: "mira",
    display_name: "Mira Jeong",
    profession: "Thumbnail Designer",
    bio: "Thumbnails that print clicks. 200M+ views attributed.",
    skills: ["Photoshop", "Typography", "Color"],
    avatar_gradient: "linear-gradient(135deg, #555, #ddd)",
    works: [
      { title: "Mr. X — March drop", category: "Thumbnails", gradient: "linear-gradient(135deg, #222, #777)", aspect: "video" },
      { title: "Gaming pack vol. 12", category: "Thumbnails", gradient: "linear-gradient(135deg, #0a0a0a, #555)", aspect: "video" },
    ],
  },
];

export const SEED_FEED_TAGS = [
  "All", "Editing", "Thumbnails", "Development", "Photography", "Motion", "3D", "Music", "Branding",
];
