import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { useBooks } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Book } from '@/types/books';

interface Review {
  bookId: number;
  rating: number;
  comment: string;
}

const Books = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: books, isLoading } = useBooks();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReview, setCurrentReview] = useState<Review>({
    bookId: 0,
    rating: 0,
    comment: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const reviewMutation = useMutation({
    mutationFn: ({ bookId, reviewData }: { bookId: number; reviewData: { rating: number; comment?: string } }) =>
      apiService.books.createReview(bookId, reviewData),
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });
      setReviews([...reviews, currentReview]);
      setCurrentReview({ bookId: 0, rating: 0, comment: '' });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleReviewSubmit = () => {
    if (currentReview.rating > 0 && currentReview.comment.trim() !== '') {
      reviewMutation.mutate({
        bookId: currentReview.bookId,
        reviewData: {
          rating: currentReview.rating,
          comment: currentReview.comment
        }
      });
    }
  };

  const openReviewModal = (bookId: number) => {
    setCurrentReview({
      bookId,
      rating: 0,
      comment: ''
    });
    setIsDialogOpen(true);
  };

  const setRating = (rating: number) => {
    setCurrentReview({
      ...currentReview,
      rating
    });
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Books</h1>
        <p className="text-muted-foreground">
          Browse our collection of recommended books and share your reviews with the community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books?.map((book: Book) => (
          <Card key={book.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
              <img 
                src={book.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'} 
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <CardContent className="flex-1 p-4 flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 line-clamp-2 text-foreground">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">by {book.author}</p>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{book.description}</p>
              </div>
              <Dialog open={isDialogOpen && currentReview.bookId === book.id} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    className="w-full mt-auto"
                    onClick={() => openReviewModal(book.id)}
                  >
                    Review Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-foreground">Review "{book.title}"</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                      <Label className="text-base text-foreground">Rating</Label>
                      <p className="text-sm text-muted-foreground">
                        How would you rate this book? Select the number of stars that best represents your experience.
                      </p>
                      <div className="flex justify-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Button
                            key={star}
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`h-14 w-14 ${currentReview.rating >= star ? 'text-yellow-500' : 'text-muted-foreground'}`}
                            onClick={() => setRating(star)}
                          >
                            <Star className="h-10 w-10 fill-current" />
                          </Button>
                        ))}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {currentReview.rating > 0 
                            ? `${currentReview.rating} star${currentReview.rating > 1 ? 's' : ''}` 
                            : 'Select a rating'}
                        </p>
                      </div>
                    </div>
                    <div className="grid w-full gap-2">
                      <Label htmlFor="review" className="text-base text-foreground">Review</Label>
                      <p className="text-sm text-muted-foreground">
                        Share your detailed thoughts about this book. What did you like or dislike? How did it impact you?
                      </p>
                      <Textarea
                        id="review"
                        placeholder="Write your review here..."
                        value={currentReview.comment}
                        onChange={(e) => setCurrentReview({
                          ...currentReview,
                          comment: e.target.value
                        })}
                        className="min-h-[150px] text-base p-4"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={handleReviewSubmit}
                      disabled={currentReview.rating === 0 || currentReview.comment.trim() === '' || reviewMutation.isPending}
                      className="px-6 py-2 text-base"
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Submit Review
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Books;