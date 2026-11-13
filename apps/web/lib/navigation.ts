import {
  Clapperboard,
  CreditCard,
  History,
  ImagePlus,
  LayoutDashboard,
  ScanSearch,
  Settings,
  UserRound,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  section: "Workspace" | "Studios" | "Enhance" | "Account";
  /** Backend feature key that powers this page, if any. */
  feature?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", description: "Overview of tools and models", icon: LayoutDashboard, section: "Workspace" },
  { href: "/image-studio", label: "Image Studio", description: "Generate images from text and references", icon: ImagePlus, section: "Studios", feature: "ai_image" },
  { href: "/video-studio", label: "Video Studio", description: "Text, image and reference-to-video", icon: Clapperboard, section: "Studios", feature: "ai_video" },
  { href: "/character-studio", label: "Character Studio", description: "Motion transfer and identity workflows", icon: UserRound, section: "Studios", feature: "ai_character" },
  { href: "/image-upscaler", label: "Image Upscaler", description: "Enlarge and restore images", icon: ScanSearch, section: "Enhance", feature: "ai_upscale" },
  { href: "/video-enhancer", label: "Video Enhancer", description: "Upscale, denoise and interpolate video", icon: WandSparkles, section: "Enhance", feature: "ai_video_enhance" },
  { href: "/history", label: "Generation History", description: "Your past generations", icon: History, section: "Account" },
  { href: "/pricing", label: "Pricing", description: "Plans and token allocations", icon: CreditCard, section: "Account" },
  { href: "/settings", label: "Settings", description: "Preferences and account", icon: Settings, section: "Account" },
];

export const NAV_SECTIONS = ["Workspace", "Studios", "Enhance", "Account"] as const;

export function findNavItem(pathname: string): NavItem | undefined {
  if (pathname === "/") return NAV_ITEMS[0];
  return NAV_ITEMS.find((item) => item.href !== "/" && pathname.startsWith(item.href));
}
