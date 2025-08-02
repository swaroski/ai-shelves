import { Book, BorrowingRecord, LibraryStats } from '@/types/library';

export class LibraryService {
  private static BOOKS_STORAGE_KEY = 'library_books';
  private static BORROWING_STORAGE_KEY = 'library_borrowings';

  static getBooks(): Book[] {
    const stored = localStorage.getItem(this.BOOKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultBooks();
  }

  static saveBooks(books: Book[]): void {
    localStorage.setItem(this.BOOKS_STORAGE_KEY, JSON.stringify(books));
  }

  static getBorrowingRecords(): BorrowingRecord[] {
    const stored = localStorage.getItem(this.BORROWING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveBorrowingRecords(records: BorrowingRecord[]): void {
    localStorage.setItem(this.BORROWING_STORAGE_KEY, JSON.stringify(records));
  }

  static addBook(book: Omit<Book, 'id'>): Book {
    const books = this.getBooks();
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
      isAvailable: true,
    };
    books.push(newBook);
    this.saveBooks(books);
    return newBook;
  }

  static updateBook(id: string, updates: Partial<Book>): Book | null {
    const books = this.getBooks();
    const index = books.findIndex(book => book.id === id);
    if (index === -1) return null;

    books[index] = { ...books[index], ...updates };
    this.saveBooks(books);
    return books[index];
  }

  static deleteBook(id: string): boolean {
    const books = this.getBooks();
    const filteredBooks = books.filter(book => book.id !== id);
    if (filteredBooks.length === books.length) return false;

    this.saveBooks(filteredBooks);
    return true;
  }

  static checkOutBook(bookId: string, borrower: string, dueDate: string): boolean {
    const book = this.updateBook(bookId, {
      isAvailable: false,
      borrower,
      dueDate,
      borrowedDate: new Date().toISOString(),
    });

    if (book) {
      const records = this.getBorrowingRecords();
      const newRecord: BorrowingRecord = {
        id: Date.now().toString(),
        bookId,
        borrower,
        borrowedDate: new Date().toISOString(),
        dueDate,
      };
      records.push(newRecord);
      this.saveBorrowingRecords(records);
      return true;
    }
    return false;
  }

  static checkInBook(bookId: string): boolean {
    const book = this.updateBook(bookId, {
      isAvailable: true,
      borrower: undefined,
      dueDate: undefined,
      borrowedDate: undefined,
    });

    if (book) {
      const records = this.getBorrowingRecords();
      const activeRecord = records.find(r => r.bookId === bookId && !r.returnedDate);
      if (activeRecord) {
        activeRecord.returnedDate = new Date().toISOString();
        this.saveBorrowingRecords(records);
      }
      return true;
    }
    return false;
  }

  static searchBooks(query: string, genre?: string): Book[] {
    const books = this.getBooks();
    const lowercaseQuery = query.toLowerCase();

    return books.filter(book => {
      const matchesQuery = query === '' || 
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author.toLowerCase().includes(lowercaseQuery) ||
        book.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));

      const matchesGenre = !genre || genre === 'all' || book.genre === genre;

      return matchesQuery && matchesGenre;
    });
  }

  static getLibraryStats(): LibraryStats {
    const books = this.getBooks();
    const borrowings = this.getBorrowingRecords();

    const genreCount = books.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularGenres = Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentBorrowings = borrowings
      .sort((a, b) => new Date(b.borrowedDate).getTime() - new Date(a.borrowedDate).getTime())
      .slice(0, 5);

    return {
      totalBooks: books.length,
      borrowedBooks: books.filter(book => !book.isAvailable).length,
      availableBooks: books.filter(book => book.isAvailable).length,
      popularGenres,
      recentBorrowings,
    };
  }

  private static getDefaultBooks(): Book[] {
    return [
      {
        id: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Classic Literature',
        year: 1925,
        isbn: '9780743273565',
        tags: ['American Literature', 'Jazz Age', 'Classic'],
        summary: 'A masterpiece of American literature set in the Jazz Age, exploring themes of wealth, love, and the American Dream through the eyes of Nick Carraway.',
        isAvailable: true,
      },
      {
        id: '2',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Classic Literature',
        year: 1960,
        isbn: '9780061120084',
        tags: ['American Literature', 'Social Justice', 'Coming of Age'],
        summary: 'A profound tale of moral courage in the American South, told through the perspective of Scout Finch as her father defends an innocent Black man.',
        isAvailable: false,
        borrower: 'Sarah Johnson',
        dueDate: '2024-08-15',
        borrowedDate: '2024-08-01',
      },
      {
        id: '3',
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Science Fiction',
        year: 1965,
        isbn: '9780441172719',
        tags: ['Space Opera', 'Politics', 'Ecology'],
        summary: 'An epic science fiction saga set on the desert planet Arrakis, following Paul Atreides as he navigates politics, religion, and ecology.',
        isAvailable: true,
      },
      {
        id: '4',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genre: 'Romance',
        year: 1813,
        isbn: '9780141439518',
        tags: ['British Literature', 'Romance', 'Social Commentary'],
        summary: 'A witty and romantic tale of Elizabeth Bennet and Mr. Darcy, exploring themes of love, class, and social expectations in Regency England.',
        isAvailable: true,
      }
    ];
  }
}