import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Video, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { getImageUrl } from '@/utils/imageUtils';

interface VideoItem {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
}

const VideoGallery = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await api.get('/videos/');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Video Gallery</h1>
        <p className="text-muted-foreground">Watch educational and training videos</p>
      </div>

      {!videos || videos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No videos available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video: VideoItem) => (
            <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedVideo(video)}>
              <CardContent className="p-4">
                <div className="relative w-full h-80 bg-black rounded-lg mb-4 overflow-hidden group">
                  {video.thumbnail_url ? (
                    <>
                      <img
                        src={getImageUrl(video.thumbnail_url)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-all">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
                          <Play className="w-10 h-10 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {video.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

export default VideoGallery;
