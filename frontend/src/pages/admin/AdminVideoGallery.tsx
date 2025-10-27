import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Pencil, Trash2, Video, Play } from 'lucide-react';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/rich-text-editor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface VideoItem {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
}

const extractYouTubeId = (url: string) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*$/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

const AdminVideoGallery = () => {
  const [open, setOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailMode, setThumbnailMode] = useState<'generate' | 'upload'>('generate');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ['adminVideos'],
    queryFn: async () => {
      const response = await api.get('/admin/videos/');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/admin/videos/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVideos'] });
      toast.success('Video added successfully');
      handleClose();
    },
    onError: () => {
      toast.error('Failed to add video');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await api.put(`/admin/videos/${id}/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVideos'] });
      toast.success('Video updated successfully');
      handleClose();
    },
    onError: () => {
      toast.error('Failed to update video');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/videos/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVideos'] });
      toast.success('Video deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete video');
    },
  });

  const handleClose = () => {
    setOpen(false);
    setEditingVideo(null);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setThumbnailUrl('');
    setThumbnailMode('generate');
    setThumbnailFile(null);
  };

  const handleEdit = (video: VideoItem) => {
    setEditingVideo(video);
    setTitle(video.title);
    setDescription(video.description);
    setVideoUrl(video.video_url);
    setThumbnailUrl(video.thumbnail_url || '');
    setThumbnailMode(video.thumbnail_url?.includes('img.youtube.com') ? 'generate' : 'upload');
    setOpen(true);
  };

  const handleSubmit = async () => {
    let finalThumbnailUrl = thumbnailUrl;

    if (thumbnailMode === 'upload' && thumbnailFile) {
      const formData = new FormData();
      formData.append('file', thumbnailFile);

      try {
        const response = await api.post('/admin/videos/upload-thumbnail', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalThumbnailUrl = response.data.url;
      } catch (error) {
        toast.error('Failed to upload thumbnail');
        return;
      }
    }

    const data = {
      title,
      description,
      video_url: videoUrl,
      thumbnail_url: finalThumbnailUrl || null,
    };

    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Video Gallery</h1>
          <p className="text-muted-foreground">Manage video content</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingVideo(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <RichTextEditor
                  value={description}
                  onChange={(value) => setDescription(value)}
                  placeholder="Video description"
                  minHeight="150px"
                />
              </div>
              <div>
                <Label>YouTube Video URL</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setVideoUrl(url);
                    
                    if (thumbnailMode === 'generate') {
                      const videoId = extractYouTubeId(url);
                      if (videoId) {
                        setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
                      }
                    }
                  }}
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                />
              </div>
              <div>
                <Label>Thumbnail</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={thumbnailMode === 'generate'}
                      onChange={() => {
                        setThumbnailMode('generate');
                        setThumbnailFile(null);
                        const videoId = extractYouTubeId(videoUrl);
                        if (videoId) {
                          setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
                        }
                      }}
                    />
                    <span className="text-sm">Generate from YouTube</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={thumbnailMode === 'upload'}
                      onChange={() => {
                        setThumbnailMode('upload');
                        setThumbnailUrl('');
                      }}
                    />
                    <span className="text-sm">Upload Thumbnail</span>
                  </label>
                </div>
              </div>
              {thumbnailMode === 'upload' && (
                <div>
                  <Label>Upload Thumbnail</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setThumbnailFile(file);
                        setThumbnailUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="mt-2"
                  />
                </div>
              )}
              {thumbnailUrl && (
                <div>
                  <Label>Thumbnail Preview</Label>
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-32 object-cover rounded mt-2" />
                </div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!title || !videoUrl || createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingVideo ? 'Update' : 'Add'} Video
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!videos || videos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No videos yet. Add your first video.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video: VideoItem) => (
            <Card key={video.id}>
              <CardContent className="p-4">
                <div 
                  className="relative w-full h-64 bg-black rounded-lg mb-4 overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  {video.thumbnail_url ? (
                    <>
                      <img
                        src={video.thumbnail_url.startsWith('http') ? video.thumbnail_url : `${import.meta.env.VITE_API_BASE_URL}${video.thumbnail_url}`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-all">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(video)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(video.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

export default AdminVideoGallery;
