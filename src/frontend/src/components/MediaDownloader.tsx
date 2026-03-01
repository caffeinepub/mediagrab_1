import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clipboard,
  Download,
  Globe,
  Link,
  Loader2,
  Shield,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
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
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import { useActor } from "../hooks/useActor";
import PlatformBadge, { detectPlatform, type Platform } from "./PlatformBadge";
import ResultCard, { type MediaResult } from "./ResultCard";

const SUPPORTED_PLATFORMS = [
  { name: "YouTube", icon: FaYoutube, color: "text-red-500" },
  { name: "Instagram", icon: FaInstagram, color: "text-pink-400" },
  { name: "Facebook", icon: FaFacebook, color: "text-blue-400" },
  { name: "TikTok", icon: FaTiktok, color: "text-cyan-300" },
  { name: "Twitter/X", icon: FaXTwitter, color: "text-white" },
  { name: "Snapchat", icon: FaSnapchat, color: "text-yellow-400" },
  { name: "Pinterest", icon: FaPinterest, color: "text-red-400" },
  { name: "Vimeo", icon: FaVimeo, color: "text-teal-400" },
  { name: "Reddit", icon: FaReddit, color: "text-orange-400" },
];

interface CobaltResponse {
  status: "stream" | "redirect" | "picker" | "error" | "rate-limit";
  url?: string;
  picker?: Array<{ url: string; thumb?: string; type?: string }>;
  text?: string;
}

async function fetchMediaInfo(
  actor: backendInterface,
  url: string,
): Promise<MediaResult> {
  // Use backend canister as proxy — bypasses browser CORS restrictions
  const rawJson = await actor.resolveMedia(url);

  // Handle backend-level error strings (e.g. "Unsupported platform", "Invalid URL")
  if (!rawJson.startsWith("{")) {
    throw new Error(rawJson);
  }

  const data: CobaltResponse = JSON.parse(rawJson);

  if (data.status === "rate-limit") {
    throw new Error("Rate limit reached. Please try again in a moment.");
  }

  if (data.status === "error") {
    throw new Error(data.text ?? "No downloadable media found for this link.");
  }

  // Single stream or redirect URL
  if ((data.status === "stream" || data.status === "redirect") && data.url) {
    return {
      title: "Media Download Ready",
      thumbnail: "https://picsum.photos/seed/cobalt/640/360",
      links: [{ quality: "Best Quality (Video)", link: data.url }],
    };
  }

  // Picker — carousel or multiple items (e.g. Instagram post with multiple photos/videos)
  if (data.status === "picker" && data.picker && data.picker.length > 0) {
    const links = data.picker.map((item, i) => ({
      quality: item.type === "photo" ? `Photo ${i + 1}` : `Video ${i + 1}`,
      link: item.url,
    }));
    return {
      title: "Media Gallery",
      thumbnail:
        data.picker[0]?.thumb ?? "https://picsum.photos/seed/cobalt/640/360",
      links,
    };
  }

  throw new Error("No downloadable media found for this link.");
}

export default function MediaDownloader() {
  const { actor, isFetching: isActorFetching } = useActor();
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MediaResult | null>(null);

  const handleUrlChange = useCallback(
    (value: string) => {
      setUrl(value);
      if (value.trim()) {
        setPlatform(detectPlatform(value));
      } else {
        setPlatform("unknown");
      }
      if (result) setResult(null);
    },
    [result],
  );

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleUrlChange(text);
        toast.success("Link pasted from clipboard!");
      }
    } catch {
      toast.error("Couldn't access clipboard. Please paste manually.");
    }
  }, [handleUrlChange]);

  const handleDownload = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter a URL first");
      return;
    }

    if (!trimmed.startsWith("http")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    if (!actor) {
      toast.error("Service is loading, please try again in a moment.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = await fetchMediaInfo(actor, trimmed);
      setResult(data);
      toast.success("Download links ready! Choose your format below.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.toLowerCase().includes("rate limit")) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else if (
        msg.toLowerCase().includes("unsupported") ||
        msg.toLowerCase().includes("platform")
      ) {
        toast.error(
          "This platform is not supported yet. Try YouTube, Instagram, TikTok, or Twitter/X.",
        );
      } else if (
        msg.toLowerCase().includes("invalid url") ||
        msg.toLowerCase().includes("invalid")
      ) {
        toast.error("Invalid link. Please check the URL and try again.");
      } else if (msg.toLowerCase().includes("private")) {
        toast.error("This content is private and cannot be downloaded.");
      } else {
        toast.error(
          msg.length < 120
            ? msg
            : "Could not fetch media. Make sure the link is public and try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, actor]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleDownload();
  };

  return (
    <div className="min-h-screen mesh-bg noise-overlay font-outfit">
      {/* Header */}
      <header className="relative z-10 border-b border-border/40 bg-background/40 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-sm">
              <Download className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              Media<span className="gradient-text">Grab</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe className="w-3.5 h-3.5 text-primary" />
              10+ Platforms
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              Safe & Free
            </span>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-16 pb-20 space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-semibold tracking-wide uppercase mb-2">
            <Zap className="w-3.5 h-3.5" />
            Universal Media Downloader
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight tracking-tight">
            Download Any <span className="gradient-text">Video or Photo</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Paste a link from Instagram, YouTube, TikTok, Facebook, or any
            social platform — and download it instantly in the best quality.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-3"
        >
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            {/* URL input row */}
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste your link here... (Instagram, YouTube, TikTok...)"
                  className="pl-10 pr-4 h-12 bg-muted/60 border-border/60 text-foreground placeholder:text-muted-foreground/60 text-sm rounded-xl focus-visible:ring-primary/50 focus-visible:border-primary/60 transition-all"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handlePaste}
                className="h-12 w-12 flex-shrink-0 bg-muted/60 border-border/60 hover:bg-primary/20 hover:border-primary/50 rounded-xl transition-all"
                title="Paste from clipboard"
              >
                <Clipboard className="w-4 h-4" />
              </Button>
            </div>

            {/* Platform detection */}
            <AnimatePresence>
              {platform !== "unknown" && url && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span>Detected platform:</span>
                  <PlatformBadge platform={platform} size="sm" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Download button */}
            <Button
              onClick={handleDownload}
              disabled={isLoading || !url.trim() || isActorFetching}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm gap-2 transition-all duration-200 glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching media...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Get Download Links
                </>
              )}
            </Button>
          </div>

          {/* Quick tips */}
          <p className="text-center text-xs text-muted-foreground/70">
            Supports public videos, reels, posts, and images. Private content
            cannot be downloaded.
          </p>
        </motion.div>

        {/* Result Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ResultCard result={result} platform={platform} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "Instant media detection and download link generation",
              color: "text-yellow-400",
            },
            {
              icon: Shield,
              title: "Safe & Secure",
              desc: "No registration needed, no data stored on servers",
              color: "text-green-400",
            },
            {
              icon: Globe,
              title: "10+ Platforms",
              desc: "Works with all major social media platforms worldwide",
              color: "text-blue-400",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-4 flex items-start gap-3 hover:border-primary/30 transition-colors"
              >
                <div className={`mt-0.5 flex-shrink-0 ${feature.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Supported Platforms Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          aria-label="Supported platforms"
        >
          <h2 className="text-center text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-5">
            Supported Platforms
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
            {SUPPORTED_PLATFORMS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-default group"
                >
                  <Icon
                    className={`w-5 h-5 ${p.color} group-hover:scale-110 transition-transform`}
                  />
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {p.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 bg-background/40 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">
              <Download className="w-3 h-3 text-primary" />
            </div>
            <span className="font-medium">
              MediaGrab — Download from 10+ platforms
            </span>
          </div>
          <span>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/80 hover:text-primary transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
