export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  isbn: string;
  tags: string[];
  summary?: string;
  isAvailable: boolean;
  borrower?: string;
  dueDate?: string;
  borrowedDate?: string;
}

export interface BorrowingRecord {
  id: string;
  bookId: string;
  borrower: string;
  borrowedDate: string;
  dueDate: string;
  returnedDate?: string;
}

export interface LibraryStats {
  totalBooks: number;
  borrowedBooks: number;
  availableBooks: number;
  popularGenres: { genre: string; count: number }[];
  recentBorrowings: BorrowingRecord[];
}