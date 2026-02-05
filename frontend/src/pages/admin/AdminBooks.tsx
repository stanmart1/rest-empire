import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Star, Grid3x3, List, Pencil } from 'lucide-react';
import { Book } from '@/types/admin-books';
import { useBooks, useBookReviews, useUploadBook, useDeleteBook } from '@/hooks/useAdminBooks';
import RichTextEditor from '@/components/ui/rich-text-editor';
import RichTextDisplay from '@/components/ui/rich-text-display';
import { getImageUrl } from '@/utils/imageUtils';

const AdminBooks = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [selectedBookReviews, setSelectedBookReviews] = useState<Book | null>(null);
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    cover_image: null as File | null,
  });
  const uploadMutation = useUploadBook({
    onSuccess: () => {
      setUploadDialogOpen(false);
      setEditingBook(null);
      setFormData({ title: '', author: '', description: '', cover_image: null });
    },
  });
  const deleteMutation = useDeleteBook({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    },
  });
  const { data: books, isLoading } = useBooks();
  const { data: reviews } = useBookReviews(selectedBookReviews?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('description', formData.description);
    if (formData.cover_image) {
      data.append('cover_image', formData.cover_image);
    }
    uploadMutation.mutate({ data, bookId: editingBook?.id });
  };

  const handleDialogClose = (open: boolean) => {
    setUploadDialogOpen(open);
    if (!open) {
      setEditingBook(null);
      setFormData({ title: '', author: '', description: '', cover_image: null });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description || '',
      cover_image: null,
    });
    setUploadDialogOpen(true);
  };

  const handleViewReviews = (book: Book) => {
    setSelectedBookReviews(book);
    setReviewsDialogOpen(true);
  };

  const getAverageRating = (bookId: number) => {
    const bookReviews = reviews?.filter(r => r.book_id === bookId) || [];
    if (bookReviews.length === 0) return 0;
    return bookReviews.reduce((acc, r) => acc + r.rating, 0) / bookReviews.length;
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      deleteMutation.mutate(bookToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Books Management</h1>
          <p className="text-muted-foreground">Manage books and view user reviews</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Book' : 'Upload New Book'}</DialogTitle>
              <DialogDescription>{editingBook ? 'Update book information and cover image' : 'Add a new book to the library'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  id="description"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  minHeight="150px"
                />
              </div>
              <div>
                <Label htmlFor="cover_image">Cover Image</Label>
                <Input
                  id="cover_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.files?.[0] || null })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? (editingBook ? 'Updating...' : 'Uploading...') : (editingBook ? 'Update Book' : 'Upload Book')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="books">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="books" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : !books || books.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No books found
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewReviews(book)}>
                  <div className="aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-200 relative">
                    <img
                      src={getImageUrl(book.cover_image)}
                      alt={book.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%23e5e7eb" width="300" height="450"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleEditClick(e, book)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleDeleteClick(e, book)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="flex-1 p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                    <RichTextDisplay content={book.description || ''} className="text-sm line-clamp-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Added {new Date(book.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {books.map((book) => (
                    <div key={book.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => handleViewReviews(book)}>
                      <img
                        src={getImageUrl(book.cover_image)}
                        alt={book.title}
                        className="w-16 h-24 object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="96" viewBox="0 0 64 96"%3E%3Crect fill="%23e5e7eb" width="64" height="96"/%3E%3C/svg%3E';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{book.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Added {new Date(book.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEditClick(e, book)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(e, book)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Book Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {books?.map((book) => (
                  <div key={book.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{book.title}</h4>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewReviews(book)}>
                        View Reviews
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={reviewsDialogOpen} onOpenChange={setReviewsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reviews for "{selectedBookReviews?.title}"</DialogTitle>
            <DialogDescription>View all user reviews for this book</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!reviews || reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reviews yet</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBooks;
