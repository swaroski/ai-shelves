import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { useOpenLibraryBooks } from '@/hooks/useOpenLibraryBooks';
import { FavoritesService } from '@/services/favoritesService';
import { Book } from '@/types/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookGrid } from '@/components/BookGrid';
import { BookDetailsModal } from '@/components/BookDetailsModal';
import { LibraryHeader } from '@/components/LibraryHeader';
import { useToast } from '@/components/ui/use-toast';
import { 
  Heart,
  BookOpen,
  Home,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { user, isSignedIn } = useUser();
  const { 
    books, 
    updateBook: updateBookInLibrary,
    deleteBook: deleteBookFromLibrary,
    checkOutBook: checkOutBookFromLibrary,
    checkInBook: checkInBookFromLibrary
  } = useOpenLibraryBooks();
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [favoriteBookIds, setFavoriteBookIds] = useState<string[]>([]);
  const { toast } = useToast();
  const signInButtonRef = useRef<HTMLButtonElement>(null);

  // Load user's favorite book IDs
  useEffect(() => {
    if (isSignedIn && user?.id) {
      const favIds = FavoritesService.getFavoriteBookIds(user.id);
      setFavoriteBookIds(favIds);
    } else {
      setFavoriteBookIds([]);
    }
  }, [isSignedIn, user?.id]);

  // Filter books to show only favorites
  const favoriteBooks = useMemo(() => {
    if (!favoriteBookIds.length) return [];
    return books.filter(book => favoriteBookIds.includes(book.id));
  }, [books, favoriteBookIds]);

  // Stats about favorites
  const favoritesStats = useMemo(() => {
    const totalFavorites = favoriteBooks.length;
    const availableFavorites = favoriteBooks.filter(book => book.isAvailable).length;
    const borrowedFavorites = favoriteBooks.filter(book => !book.isAvailable).length;
    
    const genreCount = favoriteBooks.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topGenre = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalFavorites,
      availableFavorites,
      borrowedFavorites,
      topGenre: topGenre ? topGenre[0] : null,
      topGenreCount: topGenre ? topGenre[1] : 0
    };
  }, [favoriteBooks]);

  // Helper function to trigger sign-in instead of showing toast
  const triggerSignIn = () => {
    signInButtonRef.current?.click();
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const handleCloseBookDetails = () => {
    setSelectedBook(null);
    setShowBookDetails(false);
  };

  const handleEditBook = (book: Book) => {
    // Handle edit functionality
    toast({
      title: "Edit Feature",
      description: "Book editing will be implemented soon!",
    });
  };

  const handleDeleteBook = (id: string) => {
    if (!isSignedIn) {
      triggerSignIn();
      return;
    }
    
    deleteBookFromLibrary(id);
    // Also remove from favorites if deleted
    if (user?.id) {
      FavoritesService.removeFromFavorites(user.id, id);
      setFavoriteBookIds(FavoritesService.getFavoriteBookIds(user.id));
    }
  };

  const handleCheckOut = (id: string, borrower: string, dueDate: string) => {
    if (!isSignedIn) {
      triggerSignIn();
      return;
    }
    
    checkOutBookFromLibrary(id, borrower, dueDate);
  };

  const handleCheckIn = (id: string) => {
    if (!isSignedIn) {
      triggerSignIn();
      return;
    }
    
    checkInBookFromLibrary(id);
  };

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <LibraryHeader onApiKeyClick={() => {}} hasApiKey={false} />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-library-navy mb-4">Your Favorites</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to start building your personal collection of favorite books.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LibraryHeader onApiKeyClick={() => {}} hasApiKey={false} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-library-navy flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500 fill-current" />
                My Favorites
              </h1>
              <p className="text-muted-foreground mt-1">
                Your personal collection of favorite books
              </p>
            </div>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favoritesStats.totalFavorites}</div>
              <p className="text-xs text-muted-foreground">
                Books in your favorites
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {favoritesStats.availableFavorites}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to read
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {favoritesStats.borrowedFavorites}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently checked out
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Genre</CardTitle>
              <Sparkles className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {favoritesStats.topGenreCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {favoritesStats.topGenre || 'No favorites yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Favorites Grid */}
        {favoriteBooks.length > 0 ? (
          <BookGrid
            books={favoriteBooks}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
            onCheckOut={handleCheckOut}
            onCheckIn={handleCheckIn}
            onBookClick={handleBookClick}
          />
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">
              No favorites yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start adding books to your favorites by clicking the heart icon on any book card. 
              Your favorite books will appear here for easy access.
            </p>
            <Link to="/">
              <Button>
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Books
              </Button>
            </Link>
          </div>
        )}
      </div>

      <BookDetailsModal
        book={selectedBook}
        allBooks={books}
        open={showBookDetails}
        onClose={handleCloseBookDetails}
        onEdit={handleEditBook}
        onCheckOut={handleCheckOut}
        onCheckIn={handleCheckIn}
      />

      {/* Hidden SignInButton for programmatic triggering */}
      <SignInButton mode="modal">
        <button ref={signInButtonRef} style={{ display: 'none' }} />
      </SignInButton>
    </div>
  );
};

export default Favorites;