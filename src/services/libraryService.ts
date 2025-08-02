import { Book, BorrowingRecord, LibraryStats, WorkspaceRole } from '@/types/library';

export class LibraryService {
  private static BOOKS_STORAGE_KEY = 'workspace_books';
  private static BORROWING_STORAGE_KEY = 'workspace_borrowings';

  static getWorkspaceBooks(workspaceId: string): Book[] {
    const stored = localStorage.getItem(`${this.BOOKS_STORAGE_KEY}_${workspaceId}`);
    return stored ? JSON.parse(stored) : this.getDefaultBooks(workspaceId);
  }

  static getBooks(): Book[] {
    // Legacy method for backward compatibility
    const stored = localStorage.getItem('library_books');
    if (stored) {
      const books = JSON.parse(stored);
      return books.length > 0 ? books : this.getDefaultBooks();
    }
    return this.getDefaultBooks();
  }

  static saveWorkspaceBooks(workspaceId: string, books: Book[]): void {
    localStorage.setItem(`${this.BOOKS_STORAGE_KEY}_${workspaceId}`, JSON.stringify(books));
  }

  static saveBooks(books: Book[]): void {
    // Legacy method for backward compatibility
    localStorage.setItem('library_books', JSON.stringify(books));
  }

  static getWorkspaceBorrowingRecords(workspaceId: string): BorrowingRecord[] {
    const stored = localStorage.getItem(`${this.BORROWING_STORAGE_KEY}_${workspaceId}`);
    return stored ? JSON.parse(stored) : [];
  }

  static saveWorkspaceBorrowingRecords(workspaceId: string, records: BorrowingRecord[]): void {
    localStorage.setItem(`${this.BORROWING_STORAGE_KEY}_${workspaceId}`, JSON.stringify(records));
  }

  static getBorrowingRecords(): BorrowingRecord[] {
    // Legacy method for backward compatibility
    const stored = localStorage.getItem('library_borrowings');
    return stored ? JSON.parse(stored) : [];
  }

  static saveBorrowingRecords(records: BorrowingRecord[]): void {
    // Legacy method for backward compatibility
    localStorage.setItem('library_borrowings', JSON.stringify(records));
  }

  static addBookToWorkspace(
    workspaceId: string, 
    book: Omit<Book, 'id'>, 
    userId: string,
    userRole?: WorkspaceRole
  ): Book {
    // Permission check
    if (!this.canManageBooks(userRole)) {
      throw new Error('Insufficient permissions to add books');
    }

    const books = this.getWorkspaceBooks(workspaceId);
    const newBook: Book = {
      ...book,
      id: `${workspaceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isAvailable: true,
      workspaceId,
      createdBy: userId,
      lastModifiedBy: userId,
      lastModified: new Date().toISOString(),
      version: 1,
    };
    books.push(newBook);
    this.saveWorkspaceBooks(workspaceId, books);
    return newBook;
  }

  static addBook(book: Omit<Book, 'id'>): Book {
    // Legacy method for backward compatibility
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

  static updateBookInWorkspace(
    workspaceId: string,
    bookId: string, 
    updates: Partial<Book>, 
    userId: string,
    userRole?: WorkspaceRole
  ): Book | null {
    // Permission check
    if (!this.canManageBooks(userRole)) {
      throw new Error('Insufficient permissions to update books');
    }

    const books = this.getWorkspaceBooks(workspaceId);
    const index = books.findIndex(book => book.id === bookId && book.workspaceId === workspaceId);
    if (index === -1) return null;

    books[index] = { 
      ...books[index], 
      ...updates,
      lastModifiedBy: userId,
      lastModified: new Date().toISOString(),
      version: (books[index].version || 1) + 1,
    };
    this.saveWorkspaceBooks(workspaceId, books);
    return books[index];
  }

  static deleteBookFromWorkspace(
    workspaceId: string,
    bookId: string,
    userRole?: WorkspaceRole
  ): boolean {
    // Permission check
    if (!this.canManageBooks(userRole)) {
      throw new Error('Insufficient permissions to delete books');
    }

    const books = this.getWorkspaceBooks(workspaceId);
    const filteredBooks = books.filter(book => !(book.id === bookId && book.workspaceId === workspaceId));
    if (filteredBooks.length === books.length) return false;

    this.saveWorkspaceBooks(workspaceId, filteredBooks);
    return true;
  }

  static updateBook(id: string, updates: Partial<Book>): Book | null {
    // Legacy method for backward compatibility
    const books = this.getBooks();
    const index = books.findIndex(book => book.id === id);
    if (index === -1) return null;

    books[index] = { ...books[index], ...updates };
    this.saveBooks(books);
    return books[index];
  }

  static deleteBook(id: string): boolean {
    // Legacy method for backward compatibility
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

  static searchWorkspaceBooks(workspaceId: string, query: string, genre?: string): Book[] {
    const books = this.getWorkspaceBooks(workspaceId);
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

  static getWorkspaceLibraryStats(workspaceId: string): LibraryStats {
    const books = this.getWorkspaceBooks(workspaceId);
    const borrowings = this.getWorkspaceBorrowingRecords(workspaceId);

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

  static searchBooks(query: string, genre?: string): Book[] {
    // Legacy method for backward compatibility
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
    // Legacy method for backward compatibility
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

  // Permission checking methods
  static canManageBooks(role?: WorkspaceRole): boolean {
    return role ? ['owner', 'admin', 'librarian'].includes(role) : false;
  }

  static canBorrowBooks(role?: WorkspaceRole): boolean {
    return role ? ['owner', 'admin', 'librarian', 'member'].includes(role) : false;
  }

  static canViewBooks(role?: WorkspaceRole): boolean {
    return role ? ['owner', 'admin', 'librarian', 'member', 'viewer'].includes(role) : false;
  }

  private static getDefaultBooks(workspaceId?: string): Book[] {
    const baseBooks = [
      {
        id: workspaceId ? `${workspaceId}-1` : '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Classic Literature',
        year: 1925,
        isbn: '9780743273565',
        tags: ['American Literature', 'Jazz Age', 'Classic'],
        summary: 'A masterpiece of American literature set in the Jazz Age, exploring themes of wealth, love, and the American Dream through the eyes of Nick Carraway.',
        isAvailable: true,
        workspaceId,
        createdBy: 'system',
        lastModifiedBy: 'system',
        lastModified: new Date().toISOString(),
        version: 1,
      },
      {
        id: workspaceId ? `${workspaceId}-2` : '2',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Classic Literature',
        year: 1960,
        isbn: '9780061120084',
        tags: ['American Literature', 'Social Justice', 'Coming of Age'],
        summary: 'A profound tale of moral courage in the American South, told through the perspective of Scout Finch as her father defends an innocent Black man.',
        isAvailable: false,
        borrower: 'Demo User',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        borrowedDate: new Date().toISOString(),
        workspaceId,
        createdBy: 'system',
        lastModifiedBy: 'system',
        lastModified: new Date().toISOString(),
        version: 1,
      },
      {
        id: workspaceId ? `${workspaceId}-3` : '3',
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Science Fiction',
        year: 1965,
        isbn: '9780441172719',
        tags: ['Space Opera', 'Politics', 'Ecology'],
        summary: 'An epic science fiction saga set on the desert planet Arrakis, following Paul Atreides as he navigates politics, religion, and ecology.',
        isAvailable: true,
        workspaceId,
        createdBy: 'system',
        lastModifiedBy: 'system',
        lastModified: new Date().toISOString(),
        version: 1,
      },
      {
        id: workspaceId ? `${workspaceId}-4` : '4',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genre: 'Romance',
        year: 1813,
        isbn: '9780141439518',
        tags: ['British Literature', 'Romance', 'Social Commentary'],
        summary: 'A witty and romantic tale of Elizabeth Bennet and Mr. Darcy, exploring themes of love, class, and social expectations in Regency England.',
        isAvailable: true,
        workspaceId,
        createdBy: 'system',
        lastModifiedBy: 'system',
        lastModified: new Date().toISOString(),
        version: 1,
      }
    ];

    return workspaceId ? baseBooks : baseBooks.map(book => {
      const { workspaceId: _, createdBy: __, lastModifiedBy: ___, lastModified: ____, version: _____, ...legacyBook } = book;
      return legacyBook as Book;
    });
  }
}