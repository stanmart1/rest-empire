import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBooks } from '@/hooks/useApi';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Book, BookReview } from '@/types/books';
import FeatureRestricted from '@/components/common/FeatureRestricted';
import RichTextEditor from '@/components/ui/rich-text-editor';
import RichTextDisplay from '@/components/ui/rich-text-display';
import { getImageUrl } from '@/utils/imageUtils';

const BOOKS_PER_PAGE = 12;

const Books = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const { data: books, isLoading, error: booksError } = useBooks();
  const [bookReviews, setBookReviews] = useState<Record<number, BookReview[]>>({});
  const [userReviews, setUserReviews] = useState<Record<number, BookReview>>({});
  const [currentReview, setCurrentReview] = useState({
    bookId: 0,
    rating: 0,
    comment: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (books) {
      books.forEach((book: Book) => {
        apiService.books.getBookReviews(book.id).then((reviews) => {
          setBookReviews(prev => ({ ...prev, [book.id]: reviews }));
          const userReview = reviews.find((r: BookReview) => r.user_id === book.id);
          if (userReview) {
            setUserReviews(prev => ({ ...prev, [book.id]: userReview }));
          }
        });
      });
    }
  }, [books]);

  const reviewMutation = useMutation({
    mutationFn: ({ bookId, reviewData }: { bookId: number; reviewData: { rating: number; comment?: string } }) =>
      apiService.books.createReview(bookId, reviewData),
    onSuccess: async (data, variables) => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });
      const reviews = await apiService.books.getBookReviews(variables.bookId);
      setBookReviews(prev => ({ ...prev, [variables.bookId]: reviews }));
      const userReview = reviews.find((r: BookReview) => r.user_id === data.user_id);
      if (userReview) {
        setUserReviews(prev => ({ ...prev, [variables.bookId]: userReview }));
      }
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
    const existingReview = userReviews[bookId];
    setCurrentReview({
      bookId,
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || ''
    });
    setIsDialogOpen(true);
  };

  const getAverageRating = (bookId: number) => {
    const reviews = bookReviews[bookId] || [];
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  };

  const paginatedBooks = books?.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE) || [];
  const totalPages = Math.ceil((books?.length || 0) / BOOKS_PER_PAGE);

  const setRating = (rating: number) => {
    setCurrentReview({
      ...currentReview,
      rating
    });
  };

  if (booksError && (booksError as any)?.response?.status === 403) {
    return <FeatureRestricted message={(booksError as any)?.response?.data?.detail} />;
  }

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
        {paginatedBooks.map((book: Book) => (
          <Card key={book.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-200">
              <img 
                src={getImageUrl(book.cover_image)} 
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%23e5e7eb" width="300" height="450"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <CardContent className="flex-1 p-4 flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 line-clamp-2 text-foreground">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= getAverageRating(book.id)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({bookReviews[book.id]?.length || 0})
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  <RichTextDisplay content={book.description} />
                </div>
              </div>
              <Dialog open={isDialogOpen && currentReview.bookId === book.id} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    className="w-full mt-auto"
                    onClick={() => openReviewModal(book.id)}
                  >
                    {userReviews[book.id] ? 'Edit Review' : 'Review Book'}
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
                      <RichTextEditor
                        id="review"
                        placeholder="Write your review here..."
                        value={currentReview.comment}
                        onChange={(value) => setCurrentReview({
                          ...currentReview,
                          comment: value
                        })}
                        minHeight="200px"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Books;