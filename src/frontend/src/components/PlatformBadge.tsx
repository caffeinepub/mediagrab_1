import {
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaReddit,
  FaSnapchat,
  FaTiktok,
  FaVimeo,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export type Platform =
  | "youtube"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "twitter"
  | "snapchat"
  | "pinterest"
  | "vimeo"
  | "reddit"
  | "unknown";

export function detectPlatform(url: string): Platform {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be"))
    return "youtube";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("facebook.com") || lower.includes("fb.watch"))
    return "facebook";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("twitter.com") || lower.includes("x.com"))
    return "twitter";
  if (lower.includes("snapchat.com")) return "snapchat";
  if (lower.includes("pinterest.com") || lower.includes("pin.it"))
    return "pinterest";
  if (lower.includes("vimeo.com")) return "vimeo";
  if (lower.includes("reddit.com") || lower.includes("redd.it"))
    return "reddit";
  return "unknown";
}

interface PlatformConfig {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
}

const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  youtube: {
    name: "YouTube",
    icon: FaYoutube,
    colorClass: "text-red-500",
    bgClass: "bg-red-500/15 border-red-500/30",
  },
  instagram: {
    name: "Instagram",
    icon: FaInstagram,
    colorClass: "text-pink-400",
    bgClass: "bg-pink-500/15 border-pink-500/30",
  },
  facebook: {
    name: "Facebook",
    icon: FaFacebook,
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/15 border-blue-500/30",
  },
  tiktok: {
    name: "TikTok",
    icon: FaTiktok,
    colorClass: "text-cyan-300",
    bgClass: "bg-cyan-500/15 border-cyan-500/30",
  },
  twitter: {
    name: "Twitter / X",
    icon: FaXTwitter,
    colorClass: "text-white",
    bgClass: "bg-white/10 border-white/20",
  },
  snapchat: {
    name: "Snapchat",
    icon: FaSnapchat,
    colorClass: "text-yellow-400",
    bgClass: "bg-yellow-400/15 border-yellow-400/30",
  },
  pinterest: {
    name: "Pinterest",
    icon: FaPinterest,
    colorClass: "text-red-400",
    bgClass: "bg-red-400/15 border-red-400/30",
  },
  vimeo: {
    name: "Vimeo",
    icon: FaVimeo,
    colorClass: "text-teal-400",
    bgClass: "bg-teal-500/15 border-teal-500/30",
  },
  reddit: {
    name: "Reddit",
    icon: FaReddit,
    colorClass: "text-orange-400",
    bgClass: "bg-orange-500/15 border-orange-500/30",
  },
  unknown: {
    name: "Unknown",
    icon: FaYoutube,
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted/50 border-border",
  },
};

interface PlatformBadgeProps {
  platform: Platform;
  size?: "sm" | "md" | "lg";
}

export default function PlatformBadge({
  platform,
  size = "md",
}: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;

  if (platform === "unknown") return null;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses[size]} ${config.bgClass} ${config.colorClass}`}
    >
      <Icon className={iconSizes[size]} />
      {config.name}
    </span>
  );
}

export { PLATFORM_CONFIG };
