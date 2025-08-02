import { useState, useEffect } from 'react';
import { Book } from '@/types/library';
import { AIRecommendationService } from '@/services/aiRecommendationService';
import { useUser } from '@clerk/clerk-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FavoriteButton } from '@/components/FavoriteButton';
import {
  BookOpen,
  Calendar,
  User,
  Tag,
  Sparkles,
  Clock,
  Star,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface BookDetailsModalProps {
  book: Book | null;
  allBooks: Book[];
  open: boolean;
  onClose: () => void;
  onEdit?: (book: Book) => void;
  onCheckOut?: (id: string, borrower: string, dueDate: string) => void;
  onCheckIn?: (id: string) => void;
}

export function BookDetailsModal({ 
  book, 
  allBooks, 
  open, 
  onClose, 
  onEdit, 
  onCheckOut, 
  onCheckIn 
}: BookDetailsModalProps) {
  const { user, isSignedIn } = useUser();
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  useEffect(() => {
    if (book && allBooks.length > 0) {
      setIsLoadingRecs(true);
      try {
        const recs = AIRecommendationService.generateBookRecommendations(
          allBooks, 
          book, 
          { limit: 4 }
        );
        setRecommendations(recs);
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setIsLoadingRecs(false);
      }
    }
  }, [book, allBooks]);

  if (!book) return null;

  // Calculate due date (14 days from now)
  const calculateDueDate = () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    return dueDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  };

  // Get user's display name
  const getUserName = () => {
    if (!user) return 'Anonymous User';
    return user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || 'Library User';
  };

  // Handle sleek checkout
  const handleCheckOut = () => {
    if (!isSignedIn || !onCheckOut) return;
    
    const borrowerName = getUserName();
    const dueDate = calculateDueDate();
    
    onCheckOut(book.id, borrowerName, dueDate);
    onClose();
  };

  // Handle check in
  const handleCheckIn = () => {
    if (!onCheckIn) return;
    onCheckIn(book.id);
    onClose();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if book is overdue
  const isOverdue = () => {
    if (!book.dueDate || book.isAvailable) return false;
    return new Date(book.dueDate) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-library-navy">
                {book.title}
              </DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground mt-1">
                by {book.author} • {book.year}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton
                bookId={book.id}
                bookTitle={book.title}
                variant="outline"
                size="sm"
              />
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Book Status and Info */}
          <div className="flex flex-wrap items-center gap-4">
            {book.isAvailable ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Available for Checkout
              </Badge>
            ) : (
              <Badge 
                variant={isOverdue() ? "destructive" : "default"} 
                className={`text-sm px-3 py-1 ${isOverdue() ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isOverdue() ? 'Overdue' : 'Checked Out'}
              </Badge>
            )}
            
            <Badge variant="outline" className="flex items-center gap-2 text-sm px-3 py-1">
              <BookOpen className="w-4 h-4" />
              {book.genre}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-2 text-sm px-3 py-1">
              <Calendar className="w-4 h-4" />
              Published {book.year}
            </Badge>
          </div>

          {/* Enhanced Borrowing Info */}
          {!book.isAvailable && book.borrower && (
            <Card className={`${isOverdue() ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${isOverdue() ? 'text-red-800' : 'text-orange-800'}`}>
                  Current Checkout Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${isOverdue() ? 'text-red-800' : 'text-orange-800'}`}>
                    <User className="w-5 h-5" />
                    <div>
                      <span className="font-medium">Borrowed by:</span>
                      <p className="text-lg font-semibold">{book.borrower}</p>
                    </div>
                  </div>
                  
                  {book.borrowedDate && (
                    <div className={`flex items-center gap-3 ${isOverdue() ? 'text-red-800' : 'text-orange-800'}`}>
                      <Calendar className="w-5 h-5" />
                      <div>
                        <span className="font-medium">Checked out:</span>
                        <p>{formatDate(book.borrowedDate)}</p>
                      </div>
                    </div>
                  )}
                  
                  {book.dueDate && (
                    <div className={`flex items-center gap-3 ${isOverdue() ? 'text-red-800' : 'text-orange-800'}`}>
                      <Clock className="w-5 h-5" />
                      <div>
                        <span className="font-medium">Due date:</span>
                        <p className={`text-lg font-semibold ${isOverdue() ? 'font-bold' : ''}`}>
                          {formatDate(book.dueDate)}
                          {isOverdue() && (
                            <span className="ml-2 text-sm font-normal">(OVERDUE)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {book.summary && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed">{book.summary}</p>
            </div>
          )}

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Book Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">ISBN:</span>
                <p>{book.isbn}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Genre:</span>
                <p>{book.genre}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Author:</span>
                <p>{book.author}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Year:</span>
                <p>{book.year}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              You Might Also Like
            </h3>
            
            {isLoadingRecs ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Finding recommendations...</span>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((recBook) => (
                  <Card key={recBook.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{recBook.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">by {recBook.author}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {recBook.genre}
                        </Badge>
                        {recBook.isAvailable ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Borrowed
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recommendations available at the moment.
              </p>
            )}
          </div>

          {/* Sleek Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t">
            {/* Primary Actions */}
            <div className="flex gap-3 flex-1">
              {book.isAvailable && onCheckOut && isSignedIn && (
                <Button 
                  onClick={handleCheckOut} 
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 py-3"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Check Out Book
                  <span className="ml-2 text-sm opacity-80">(14 days)</span>
                </Button>
              )}
              
              {!book.isAvailable && onCheckIn && (
                <Button 
                  onClick={handleCheckIn} 
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 flex-1 py-3"
                  size="lg"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Return Book
                </Button>
              )}
              
              {!isSignedIn && book.isAvailable && (
                <Button 
                  disabled 
                  variant="outline"
                  className="flex-1 py-3"
                  size="lg"
                >
                  <User className="w-5 h-5 mr-2" />
                  Sign in to Check Out
                </Button>
              )}
            </div>
            
            {/* Secondary Actions */}
            <div className="flex gap-2">
              {onEdit && (
                <Button onClick={() => onEdit(book)} variant="outline" size="lg">
                  Edit Book
                </Button>
              )}
            </div>
          </div>
          
          {/* Checkout Info for Signed-in Users */}
          {book.isAvailable && isSignedIn && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800 text-sm">
                <strong>Ready to check out?</strong> This book will be assigned to <strong>{getUserName()}</strong> 
                {' '}and will be due on <strong>{formatDate(calculateDueDate())}</strong>.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}