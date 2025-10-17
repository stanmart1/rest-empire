import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoPlayerModalProps {
  video: {
    id: number;
    title: string;
    description: string;
    video_url: string;
  } | null;
  onClose: () => void;
}

const extractYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
};

const VideoPlayerModal = ({ video, onClose }: VideoPlayerModalProps) => {
  return (
    <Dialog open={!!video} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{video?.title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[500px] bg-black rounded-lg overflow-hidden">
          {video && (
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(video.video_url)}`}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          {video?.description}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;
