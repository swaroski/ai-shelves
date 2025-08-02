import { Book } from '@/types/library';
import { BookCard } from './BookCard';

interface BookGridProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onCheckOut: (id: string, borrower: string, dueDate: string) => void;
  onCheckIn: (id: string) => void;
}

export const BookGrid = ({ books, onEdit, onDelete, onCheckOut, onCheckIn }: BookGridProps) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">No books found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or add some books to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onEdit={onEdit}
          onDelete={onDelete}
          onCheckOut={onCheckOut}
          onCheckIn={onCheckIn}
        />
      ))}
    </div>
  );
};