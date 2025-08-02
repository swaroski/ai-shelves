import { useState, useEffect, useMemo } from 'react';
import { Book } from '@/types/library';
import { LibraryService } from '@/services/libraryService';
import { GeminiService } from '@/services/geminiService';
import { LibraryHeader } from '@/components/LibraryHeader';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { BookGrid } from '@/components/BookGrid';
import { BookForm } from '@/components/BookForm';
import { LibraryStats } from '@/components/LibraryStats';
import { ApiKeySetup } from '@/components/ApiKeySetup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    setBooks(LibraryService.getBooks());
    setHasApiKey(!!GeminiService.getApiKey());
  }, []);

  const filteredBooks = useMemo(() => {
    return LibraryService.searchBooks(searchQuery, selectedGenre);
  }, [searchQuery, selectedGenre, books]);

  const availableGenres = useMemo(() => {
    const genres = [...new Set(books.map(book => book.genre))];
    return genres.sort();
  }, [books]);

  const libraryStats = useMemo(() => {
    return LibraryService.getLibraryStats();
  }, [books]);

  const handleAddBook = (bookData: Omit<Book, 'id'>) => {
    const newBook = LibraryService.addBook(bookData);
    setBooks(LibraryService.getBooks());
    setShowBookForm(false);
    setEditingBook(null);
    toast({
      title: "Book Added",
      description: `"${newBook.title}" has been added to your library`,
    });
  };

  const handleUpdateBook = (bookData: Omit<Book, 'id'>) => {
    if (editingBook) {
      LibraryService.updateBook(editingBook.id, bookData);
      setBooks(LibraryService.getBooks());
      setShowBookForm(false);
      setEditingBook(null);
      toast({
        title: "Book Updated",
        description: `"${bookData.title}" has been updated`,
      });
    }
  };

  const handleDeleteBook = (id: string) => {
    const book = books.find(b => b.id === id);
    if (book && LibraryService.deleteBook(id)) {
      setBooks(LibraryService.getBooks());
      toast({
        title: "Book Deleted",
        description: `"${book.title}" has been removed from your library`,
      });
    }
  };

  const handleCheckOut = (id: string, borrower: string, dueDate: string) => {
    if (LibraryService.checkOutBook(id, borrower, dueDate)) {
      setBooks(LibraryService.getBooks());
    }
  };

  const handleCheckIn = (id: string) => {
    if (LibraryService.checkInBook(id)) {
      setBooks(LibraryService.getBooks());
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  const handleApiKeySetup = () => {
    setShowApiKeySetup(false);
    setHasApiKey(!!GeminiService.getApiKey());
  };

  return (
    <div className="min-h-screen bg-background">
      <LibraryHeader 
        onApiKeyClick={() => setShowApiKeySetup(true)} 
        hasApiKey={hasApiKey}
      />

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="books">Library Collection</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-6">
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
            />
          </TabsContent>

          <TabsContent value="dashboard">
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
    </div>
  );
};

export default Index;
