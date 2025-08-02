import { useState, useMemo } from 'react';
import { useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Book } from '@/types/library';
import { LibraryService } from '@/services/libraryService';
import { GeminiService } from '@/services/geminiService';
import { useOpenLibraryBooks } from '@/hooks/useOpenLibraryBooks';
import { LibraryHeader } from '@/components/LibraryHeader';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { BookGrid } from '@/components/BookGrid';
import { BookForm } from '@/components/BookForm';
import { LibraryStats } from '@/components/LibraryStats';
import { ApiKeySetup } from '@/components/ApiKeySetup';
import { HeroSection } from '@/components/HeroSection';
import { BookDetailsModal } from '@/components/BookDetailsModal';
import { FeatureCards } from '@/components/FeatureCards';
import { AIInsights } from '@/components/AIInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Shield, Bot } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();
  const { 
    books, 
    isLoading: booksLoading, 
    error: booksError,
    addBook: addBookToLibrary,
    updateBook: updateBookInLibrary,
    deleteBook: deleteBookFromLibrary,
    checkOutBook: checkOutBookFromLibrary,
    checkInBook: checkInBookFromLibrary
  } = useOpenLibraryBooks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!GeminiService.getApiKey());
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);

  const filteredBooks = useMemo(() => {
    if (!books.length) return [];
    return books.filter(book => {
      const matchesQuery = searchQuery === '' || 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;

      return matchesQuery && matchesGenre;
    });
  }, [searchQuery, selectedGenre, books]);

  const availableGenres = useMemo(() => {
    const genres = [...new Set(books.map(book => book.genre))];
    return genres.sort();
  }, [books]);

  const libraryStats = useMemo(() => {
    if (!books.length) return {
      totalBooks: 0,
      borrowedBooks: 0,
      availableBooks: 0,
      popularGenres: [],
      recentBorrowings: []
    };

    const totalBooks = books.length;
    const borrowedBooks = books.filter(book => !book.isAvailable).length;
    const availableBooks = books.filter(book => book.isAvailable).length;

    const genreCount = books.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularGenres = Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalBooks,
      borrowedBooks,
      availableBooks,
      popularGenres,
      recentBorrowings: []
    };
  }, [books]);

  const handleAddBook = (bookData: Omit<Book, 'id'>) => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add books to your library",
        variant: "destructive",
      });
      return;
    }
    
    const newBook = addBookToLibrary(bookData);
    toast({
      title: "Book Added",
      description: `"${newBook.title}" has been added to your library`,
    });
  };

  const handleUpdateBook = (bookData: Omit<Book, 'id'>) => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit books",
        variant: "destructive",
      });
      return;
    }
    
    if (editingBook) {
      updateBookInLibrary(editingBook.id, bookData);
      setShowBookForm(false);
      setEditingBook(null);
      toast({
        title: "Book Updated",
        description: `"${bookData.title}" has been updated`,
      });
    }
  };

  const handleDeleteBook = (id: string) => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete books",
        variant: "destructive",
      });
      return;
    }
    
    const book = books.find(b => b.id === id);
    if (book) {
      deleteBookFromLibrary(id);
      toast({
        title: "Book Deleted",
        description: `"${book.title}" has been removed from your library`,
      });
    }
  };

  const handleCheckOut = (id: string, borrower: string, dueDate: string) => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to check out books",
        variant: "destructive",
      });
      return;
    }
    
    checkOutBookFromLibrary(id, borrower, dueDate);
  };

  const handleCheckIn = (id: string) => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to check in books",
        variant: "destructive",
      });
      return;
    }
    
    checkInBookFromLibrary(id);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  const handleApiKeySetup = () => {
    setShowApiKeySetup(false);
    setHasApiKey(!!GeminiService.getApiKey());
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const handleCloseBookDetails = () => {
    setSelectedBook(null);
    setShowBookDetails(false);
  };

  // Show the full original experience for both signed in and out users
  // This preserves the original Alexandria design and functionality

  return (
    <div className="min-h-screen bg-background">
      <LibraryHeader 
        onApiKeyClick={() => setShowApiKeySetup(true)} 
        hasApiKey={hasApiKey}
      />

      {/* Hero Section */}
      <HeroSection 
        onGetStarted={() => {
          if (!isSignedIn) {
            toast({
              title: "Authentication Required",
              description: "Please sign in to start managing your library",
              variant: "destructive",
            });
            return;
          }
          setShowBookForm(true);
        }}
        totalBooks={books.length}
        availableBooks={libraryStats.availableBooks}
      />

      {/* Feature Highlights */}
      <FeatureCards />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-library-navy mb-4">Manage Your Collection</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Organize, track, and discover books with the power of AI-driven insights and modern management tools.
          </p>
          
          {/* Show loading state */}
          {booksLoading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-library-gold mr-3"></div>
              <span className="text-library-navy">Loading books from OpenLibrary...</span>
            </div>
          )}
          
          {/* Show error state */}
          {booksError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">Error loading books: {booksError}</p>
              <p className="text-sm text-red-600 mt-1">Showing fallback books instead.</p>
            </div>
          )}
        </div>

        <Tabs defaultValue="books" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto bg-card shadow-elegant">
            <TabsTrigger value="books" className="data-[state=active]:bg-library-gold data-[state=active]:text-library-navy">
              Library Collection
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-library-gold data-[state=active]:text-library-navy">
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-library-gold data-[state=active]:text-library-navy">
              Analytics Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-8 animate-fade-in">
            <SearchAndFilters
              searchQuery={searchQuery}
              selectedGenre={selectedGenre}
              onSearchChange={setSearchQuery}
              onGenreChange={setSelectedGenre}
              onAddBook={() => {
                if (!isSignedIn) {
                  toast({
                    title: "Authentication Required",
                    description: "Please sign in to add books to your library",
                    variant: "destructive",
                  });
                  return;
                }
                setShowBookForm(true);
              }}
              genres={availableGenres}
            />

            <BookGrid
              books={filteredBooks}
              onEdit={handleEditBook}
              onDelete={handleDeleteBook}
              onCheckOut={handleCheckOut}
              onCheckIn={handleCheckIn}
              onBookClick={handleBookClick}
            />
          </TabsContent>

          <TabsContent value="insights" className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <AIInsights books={books} />
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="animate-fade-in">
            <LibraryStats stats={libraryStats} books={books} />
          </TabsContent>
        </Tabs>
      </div>

      {showBookForm && (
        <BookForm
          book={editingBook || undefined}
          onSave={editingBook ? handleUpdateBook : handleAddBook}
          onCancel={() => {
            setShowBookForm(false);
            setEditingBook(null);
          }}
        />
      )}

      {showApiKeySetup && (
        <ApiKeySetup onClose={handleApiKeySetup} />
      )}

      <BookDetailsModal
        book={selectedBook}
        allBooks={books}
        open={showBookDetails}
        onClose={handleCloseBookDetails}
        onEdit={handleEditBook}
        onCheckOut={handleCheckOut}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
};

export default Index;
