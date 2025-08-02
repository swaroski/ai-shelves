import { useState, useEffect } from 'react';
import { Book } from '@/types/library';
import { OpenLibraryService } from '@/services/openLibraryService';
import { LibraryService } from '@/services/libraryService';

export function useOpenLibraryBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any old book data to force refresh
    localStorage.removeItem('library_books');
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Always try to fetch fresh books from OpenLibrary first
      console.log('Fetching books from OpenLibrary...');
      const openLibraryBooks = await OpenLibraryService.getPopularBooks();
      
      if (openLibraryBooks.length >= 25) {
        // Save to localStorage for future visits
        LibraryService.saveBooks(openLibraryBooks);
        setBooks(openLibraryBooks);
        console.log(`Successfully loaded ${openLibraryBooks.length} books from OpenLibrary`);
        return;
      } else {
        throw new Error(`Only got ${openLibraryBooks.length} books from OpenLibrary, expected at least 25`);
      }
    } catch (err) {
      console.error('Error loading books from OpenLibrary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load books from OpenLibrary');
      
      // Use our comprehensive fallback books (30 books)
      console.log('Using fallback book collection (30 books)');
      const fallbackBooks = await OpenLibraryService.getPopularBooks();
      LibraryService.saveBooks(fallbackBooks);
      setBooks(fallbackBooks);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const freshBooks = await OpenLibraryService.getPopularBooks();
      LibraryService.saveBooks(freshBooks);
      setBooks(freshBooks);
      console.log('Books refreshed from OpenLibrary');
    } catch (err) {
      console.error('Error refreshing books:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh books');
    } finally {
      setIsLoading(false);
    }
  };

  const addBook = (bookData: Omit<Book, 'id'>) => {
    const newBook = LibraryService.addBook(bookData);
    setBooks(LibraryService.getBooks());
    return newBook;
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    const updated = LibraryService.updateBook(id, updates);
    if (updated) {
      setBooks(LibraryService.getBooks());
    }
    return updated;
  };

  const deleteBook = (id: string) => {
    const success = LibraryService.deleteBook(id);
    if (success) {
      setBooks(LibraryService.getBooks());
    }
    return success;
  };

  const checkOutBook = (id: string, borrower: string, dueDate: string) => {
    const success = LibraryService.checkOutBook(id, borrower, dueDate);
    if (success) {
      setBooks(LibraryService.getBooks());
    }
    return success;
  };

  const checkInBook = (id: string) => {
    const success = LibraryService.checkInBook(id);
    if (success) {
      setBooks(LibraryService.getBooks());
    }
    return success;
  };

  return {
    books,
    isLoading,
    error,
    refreshBooks,
    addBook,
    updateBook,
    deleteBook,
    checkOutBook,
    checkInBook
  };
}