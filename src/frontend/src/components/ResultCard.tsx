import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Film, Music } from "lucide-react";
import { motion } from "motion/react";
import PlatformBadge, { type Platform } from "./PlatformBadge";

export interface DownloadLink {
  quality: string;
  link: string;
}

export interface MediaResult {
  title: string;
  thumbnail: string;
  links: DownloadLink[];
  isDemo?: boolean;
}

interface ResultCardProps {
  result: MediaResult;
  platform: Platform;
}

function getQualityIcon(quality: string) {
  if (
    quality.toLowerCase().includes("audio") ||
    quality.toLowerCase().includes("mp3")
  ) {
    return <Music className="w-4 h-4" />;
  }
  return <Film className="w-4 h-4" />;
}

function getQualityColor(quality: string): string {
  const q = quality.toLowerCase();
  if (q.includes("2160") || q.includes("4k")) return "text-yellow-400";
  if (q.includes("1080") || q.includes("hd")) return "text-violet-400";
  if (q.includes("720")) return "text-blue-400";
  if (q.includes("audio") || q.includes("mp3")) return "text-green-400";
  return "text-muted-foreground";
}

export default function ResultCard({ result, platform }: ResultCardProps) {
  const handleDownload = (link: DownloadLink) => {
    if (link.link === "#" || link.link === "") return;
    window.open(link.link, "_blank", "noopener,noreferrer");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Demo badge */}
      {result.isDemo && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-300 text-xs font-medium tracking-wide uppercase">
            Demo Preview — Live fetch failed (network/CORS issue)
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={result.thumbnail}
          alt={result.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://picsum.photos/seed/fallback/640/360";
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
        {/* Platform badge on thumbnail */}
        <div className="absolute bottom-3 left-3">
          <PlatformBadge platform={platform} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <motion.div variants={itemVariants}>
          <h3 className="text-foreground font-semibold text-lg leading-snug line-clamp-2">
            {result.title}
          </h3>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Download options */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-3">
            Available Formats
          </p>
          {result.links.map((link) => (
            <motion.div
              key={link.quality}
              variants={itemVariants}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/40 hover:border-primary/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`flex-shrink-0 ${getQualityColor(link.quality)}`}
                >
                  {getQualityIcon(link.quality)}
                </span>
                <span
                  className={`font-medium text-sm truncate ${getQualityColor(link.quality)}`}
                >
                  {link.quality}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => handleDownload(link)}
                disabled={link.link === "#" || link.link === ""}
                className="flex-shrink-0 bg-primary/90 hover:bg-primary text-primary-foreground border-0 gap-1.5 text-xs font-semibold rounded-lg transition-all duration-200 glow-sm group-hover:scale-105"
              >
                {link.link === "#" || link.link === "" ? (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    Demo
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
