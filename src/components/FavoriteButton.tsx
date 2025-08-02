import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { FavoritesService } from '@/services/favoritesService';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  bookId: string;
  bookTitle: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export function FavoriteButton({ 
  bookId, 
  bookTitle, 
  variant = 'ghost', 
  size = 'sm',
  className = '',
  showText = true
}: FavoriteButtonProps) {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const signInButtonRef = useRef<HTMLButtonElement>(null);

  // Check if book is favorited on component mount and when user changes
  useEffect(() => {
    if (isSignedIn && user?.id) {
      const favoriteStatus = FavoritesService.isFavorite(user.id, bookId);
      setIsFavorite(favoriteStatus);
    } else {
      setIsFavorite(false);
    }
  }, [isSignedIn, user?.id, bookId]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click events (like opening book modal)
    
    if (!isSignedIn || !user?.id) {
      signInButtonRef.current?.click();
      return;
    }

    setIsLoading(true);
    
    try {
      const result = FavoritesService.toggleFavorite(user.id, bookId);
      setIsFavorite(result.isFavorite);
      
      toast({
        title: result.isFavorite ? "Added to Favorites" : "Removed from Favorites",
        description: result.isFavorite 
          ? `"${bookTitle}" has been added to your favorites`
          : `"${bookTitle}" has been removed from your favorites`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={cn(
          "transition-all duration-200",
          isFavorite && "text-red-600 hover:text-red-700",
          !isFavorite && "text-muted-foreground hover:text-red-500",
          className
        )}
      >
        <Heart 
          className={cn(
            "h-4 w-4",
            isFavorite && "fill-current",
            showText && "mr-2"
          )} 
        />
        {showText && (
          <span className="text-sm">
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </span>
        )}
      </Button>
      
      {/* Hidden SignInButton for programmatic triggering */}
      <SignInButton mode="modal">
        <button ref={signInButtonRef} style={{ display: 'none' }} />
      </SignInButton>
    </>
  );
}