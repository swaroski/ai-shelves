import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, SignInButton } from '@clerk/clerk-react';

interface SearchAndFiltersProps {
  searchQuery: string;
  selectedGenre: string;
  onSearchChange: (query: string) => void;
  onGenreChange: (genre: string) => void;
  onAddBook: () => void;
  genres: string[];
}

export const SearchAndFilters = ({
  searchQuery,
  selectedGenre,
  onSearchChange,
  onGenreChange,
  onAddBook,
  genres
}: SearchAndFiltersProps) => {
  const { isSignedIn } = useUser();

  return (
    <div className="bg-card shadow-elegant rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search books, authors, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedGenre} onValueChange={onGenreChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isSignedIn ? (
            <Button variant="hero" onClick={onAddBook} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Book
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button variant="hero" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Sign In to Add Books
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  );
};