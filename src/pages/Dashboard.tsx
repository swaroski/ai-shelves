import { useState, useMemo } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useOpenLibraryBooks } from '@/hooks/useOpenLibraryBooks';
import { Book } from '@/types/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookGrid } from '@/components/BookGrid';
import { BookForm } from '@/components/BookForm';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { LibraryStats } from '@/components/LibraryStats';
import { AIInsights } from '@/components/AIInsights';
import { BookDetailsModal } from '@/components/BookDetailsModal';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  BookOpen, 
  Activity, 
  Settings,
  Plus,
  Library,
  TrendingUp,
  Clock,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
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
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const { toast } = useToast();

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

  // Book management functions
  const handleAddBook = (bookData: Omit<Book, 'id'>) => {
    if (!isSignedIn) {
      toast({
        title: "Please Sign In",
        description: "Sign in to add books to your library",
        variant: "destructive",
      });
      return;
    }
    
    const newBook = addBookToLibrary(bookData);
    setShowBookForm(false);
    setEditingBook(null);
    toast({
      title: "Book Added",
      description: `"${newBook.title}" has been added to your library`,
    });
  };

  const handleUpdateBook = (bookData: Omit<Book, 'id'>) => {
    if (!isSignedIn) {
      toast({
        title: "Please Sign In",
        description: "Sign in to edit books",
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
        title: "Please Sign In",
        description: "Sign in to delete books",
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
        title: "Please Sign In",
        description: "Sign in to check out books",
        variant: "destructive",
      });
      return;
    }
    
    checkOutBookFromLibrary(id, borrower, dueDate);
  };

  const handleCheckIn = (id: string) => {
    if (!isSignedIn) {
      toast({
        title: "Please Sign In",
        description: "Sign in to check in books",
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

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const handleCloseBookDetails = () => {
    setSelectedBook(null);
    setShowBookDetails(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-library-navy hover:text-library-gold transition-colors">
                <Library className="h-6 w-6" />
                Alexandria Library
              </Link>
              <div className="h-6 w-px bg-border"></div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <div className="text-sm text-muted-foreground">Not signed in</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Loading State */}
        {booksLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-library-gold mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your library...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {booksError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error loading books: {booksError}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <Library className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{libraryStats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">
                From OpenLibrary collection
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{libraryStats.availableBooks}</div>
              <p className="text-xs text-muted-foreground">
                Ready to borrow
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borrowed Books</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{libraryStats.borrowedBooks}</div>
              <p className="text-xs text-muted-foreground">
                Currently checked out
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Genres</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableGenres.length}</div>
              <p className="text-xs text-muted-foreground">
                Different categories
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Library Collection</h2>
                <Button onClick={() => setShowBookForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book
                </Button>
              </div>
              
              <SearchAndFilters
                searchQuery={searchQuery}
                selectedGenre={selectedGenre}
                onSearchChange={setSearchQuery}
                onGenreChange={setSelectedGenre}
                onAddBook={() => setShowBookForm(true)}
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
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <AIInsights books={books} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
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

export default Dashboard;