import { Toaster } from "@/components/ui/sonner";
import MediaDownloader from "./components/MediaDownloader";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <MediaDownloader />
      <Toaster richColors position="top-center" />
    </div>
  );
}
