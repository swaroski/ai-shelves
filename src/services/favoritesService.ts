import { UserFavorite } from '@/types/library';

export class FavoritesService {
  private static FAVORITES_STORAGE_KEY = 'user_favorites';

  // Get all favorites for a user
  static getUserFavorites(userId: string): UserFavorite[] {
    const stored = localStorage.getItem(this.FAVORITES_STORAGE_KEY);
    const allFavorites: UserFavorite[] = stored ? JSON.parse(stored) : [];
    return allFavorites.filter(fav => fav.userId === userId);
  }

  // Get all favorites (for admin purposes)
  static getAllFavorites(): UserFavorite[] {
    const stored = localStorage.getItem(this.FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Save all favorites
  private static saveFavorites(favorites: UserFavorite[]): void {
    localStorage.setItem(this.FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }

  // Check if a book is favorited by a user
  static isFavorite(userId: string, bookId: string): boolean {
    const userFavorites = this.getUserFavorites(userId);
    return userFavorites.some(fav => fav.bookId === bookId);
  }

  // Add a book to favorites
  static addToFavorites(userId: string, bookId: string): UserFavorite {
    const allFavorites = this.getAllFavorites();
    
    // Check if already favorited
    const existingFavorite = allFavorites.find(
      fav => fav.userId === userId && fav.bookId === bookId
    );
    
    if (existingFavorite) {
      return existingFavorite;
    }

    // Create new favorite
    const newFavorite: UserFavorite = {
      id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      bookId,
      dateAdded: new Date().toISOString()
    };

    allFavorites.push(newFavorite);
    this.saveFavorites(allFavorites);
    return newFavorite;
  }

  // Remove a book from favorites
  static removeFromFavorites(userId: string, bookId: string): boolean {
    const allFavorites = this.getAllFavorites();
    const filteredFavorites = allFavorites.filter(
      fav => !(fav.userId === userId && fav.bookId === bookId)
    );

    if (filteredFavorites.length === allFavorites.length) {
      return false; // Nothing was removed
    }

    this.saveFavorites(filteredFavorites);
    return true;
  }

  // Toggle favorite status
  static toggleFavorite(userId: string, bookId: string): { isFavorite: boolean; favorite?: UserFavorite } {
    if (this.isFavorite(userId, bookId)) {
      this.removeFromFavorites(userId, bookId);
      return { isFavorite: false };
    } else {
      const favorite = this.addToFavorites(userId, bookId);
      return { isFavorite: true, favorite };
    }
  }

  // Get favorite book IDs for a user
  static getFavoriteBookIds(userId: string): string[] {
    const userFavorites = this.getUserFavorites(userId);
    return userFavorites.map(fav => fav.bookId);
  }

  // Get favorites count for a user
  static getFavoritesCount(userId: string): number {
    return this.getUserFavorites(userId).length;
  }

  // Clear all favorites for a user (useful for testing or user deletion)
  static clearUserFavorites(userId: string): void {
    const allFavorites = this.getAllFavorites();
    const filteredFavorites = allFavorites.filter(fav => fav.userId !== userId);
    this.saveFavorites(filteredFavorites);
  }
}