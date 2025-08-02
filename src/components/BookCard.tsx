import { useState } from 'react';
import { Book, Calendar, User, Tag, Sparkles, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book as BookType } from '@/types/library';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useToast } from '@/components/ui/use-toast';
import { GeminiService } from '@/services/geminiService';
import { useUser } from '@clerk/clerk-react';

interface BookCardProps {
  book: BookType;
  onEdit: (book: BookType) => void;
  onDelete: (id: string) => void;
  onCheckOut: (id: string, borrower: string, dueDate: string) => void;
  onCheckIn: (id: string) => void;
  onClick?: (book: BookType) => void;
}

export const BookCard = ({ book, onEdit, onDelete, onCheckOut, onCheckIn, onClick }: BookCardProps) => {
  const { toast } = useToast();
  const { isSignedIn } = useUser();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [borrower, setBorrower] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const summary = await GeminiService.generateBookSummary(book.title, book.author, book.genre);
      // Update the book with the generated summary
      onEdit({ ...book, summary });
      toast({
        title: "Summary Generated",
        description: "AI-powered summary has been added to the book.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCheckOut = () => {
    if (borrower && dueDate) {
      onCheckOut(book.id, borrower, dueDate);
      setBorrower('');
      setDueDate('');
      setShowCheckoutForm(false);
      toast({
        title: "Book Checked Out",
        description: `${book.title} has been checked out to ${borrower}`,
      });
    }
  };

  const handleCheckIn = () => {
    onCheckIn(book.id);
    toast({
      title: "Book Checked In",
      description: `${book.title} has been returned`,
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or inputs
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    onClick?.(book);
  };

  return (
    <Card 
      className="bg-gradient-card shadow-book hover:shadow-elegant transition-spring transform hover:scale-105 group cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-library-navy group-hover:text-library-burgundy transition-smooth">
              {book.title}
            </CardTitle>
            <p className="text-muted-foreground font-medium">{book.author}</p>
            <p className="text-sm text-muted-foreground">{book.year}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <FavoriteButton
              bookId={book.id}
              bookTitle={book.title}
              variant="ghost"
              size="sm"
              showText={false}
              className="h-8 w-8 p-0"
            />
            {book.isAvailable ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Available
              </Badge>
            ) : (
              <Badge 
                variant={book.dueDate && new Date(book.dueDate) < new Date() ? "destructive" : "default"}
                className={book.dueDate && new Date(book.dueDate) < new Date() ? 
                  'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                }
              >
                <XCircle className="w-3 h-3 mr-1" />
                {book.dueDate && new Date(book.dueDate) < new Date() ? 'Overdue' : 'Borrowed'}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Book className="w-4 h-4" />
            <span>{book.genre}</span>
          </div>
          {!book.isAvailable && book.borrower && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Borrowed by {book.borrower}</span>
              </div>
              {book.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Due {new Date(book.dueDate).toLocaleDateString()}</span>
                  {new Date(book.dueDate) < new Date() && (
                    <Badge variant="destructive" className="text-xs ml-1">
                      OVERDUE
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {book.summary ? (
          <p className="text-sm text-muted-foreground bg-library-cream p-3 rounded-lg">
            {book.summary}
          </p>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
          </Button>
        )}

        {showCheckoutForm && book.isAvailable && (
          <div className="space-y-3 p-3 bg-library-cream rounded-lg">
            <input
              type="text"
              placeholder="Borrower name"
              value={borrower}
              onChange={(e) => setBorrower(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCheckOut} className="flex-1">
                Confirm Checkout
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowCheckoutForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isSignedIn && (
            <>
              <Button variant="outline" size="sm" onClick={() => onEdit(book)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(book.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          {book.isAvailable ? (
            <Button 
              variant="library" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowCheckoutForm(!showCheckoutForm)}
            >
              Check Out
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="flex-1" onClick={handleCheckIn}>
              Check In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};