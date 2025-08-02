import { Book } from '@/types/library';
import { GeminiService } from './geminiService';

interface RecommendationOptions {
  genre?: string;
  limit?: number;
  userProfile?: {
    favoriteGenres: string[];
    recentReads: string[];
  };
}

interface LibraryInsights {
  topGenres: { genre: string; count: number; percentage: number }[];
  readingTrends: string;
  recommendations: string[];
  libraryHealth: {
    score: number;
    factors: string[];
  };
}

export class AIRecommendationService {
  
  static generateBookRecommendations(
    currentBooks: Book[], 
    targetBook?: Book, 
    options: RecommendationOptions = {}
  ): Book[] {
    const { genre, limit = 5 } = options;
    
    // If no Gemini API key, use rule-based recommendations
    if (!GeminiService.getApiKey()) {
      return this.getRuleBasedRecommendations(currentBooks, targetBook, options);
    }
    
    // TODO: Implement AI-powered recommendations with Gemini
    return this.getRuleBasedRecommendations(currentBooks, targetBook, options);
  }

  static async generateAIBookSummary(book: Book): Promise<string> {
    const apiKey = GeminiService.getApiKey();
    if (!apiKey) {
      return this.generateFallbackSummary(book);
    }

    try {
      const prompt = `Write a compelling 2-3 sentence summary for the book "${book.title}" by ${book.author}. 
      Genre: ${book.genre}. Year: ${book.year}. 
      The summary should be engaging and give readers a sense of what makes this book special.
      Focus on the main themes, plot, or key insights without spoilers.`;

      const summary = await GeminiService.generateSummary(prompt);
      return summary || this.generateFallbackSummary(book);
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return this.generateFallbackSummary(book);
    }
  }

  static async generateLibraryInsights(books: Book[]): Promise<LibraryInsights> {
    const apiKey = GeminiService.getApiKey();
    
    // Calculate basic statistics
    const genreCount = books.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topGenres = Object.entries(genreCount)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / books.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    if (!apiKey) {
      return this.getRuleBasedInsights(books, topGenres);
    }

    try {
      const prompt = `Analyze this library collection and provide insights:
      
      Collection: ${books.length} books
      Top genres: ${topGenres.map(g => `${g.genre} (${g.count} books)`).join(', ')}
      Sample titles: ${books.slice(0, 10).map(b => `"${b.title}" by ${b.author}`).join(', ')}
      
      Provide:
      1. A brief analysis of reading trends and patterns
      2. 3-4 personalized book recommendations based on this collection
      3. A library health score (1-10) with improvement suggestions
      
      Keep it concise and actionable.`;

      const aiResponse = await GeminiService.generateSummary(prompt);
      
      if (aiResponse) {
        return this.parseAIInsights(aiResponse, topGenres);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }

    return this.getRuleBasedInsights(books, topGenres);
  }

  private static getRuleBasedRecommendations(
    currentBooks: Book[], 
    targetBook?: Book, 
    options: RecommendationOptions = {}
  ): Book[] {
    const { genre, limit = 5 } = options;
    
    // Define recommendation pool based on popular books by genre
    const recommendationPool: Partial<Record<string, Book[]>> = {
      'Fiction': [
        { id: 'rec-1', title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', genre: 'Fiction', year: 2017, isbn: '9781501161933', tags: ['romance', 'hollywood', 'lgbtq'], summary: 'A reclusive Hollywood icon finally tells her story to a young journalist.', isAvailable: true },
        { id: 'rec-2', title: 'Where the Crawdads Sing', author: 'Delia Owens', genre: 'Fiction', year: 2018, isbn: '9780735219090', tags: ['mystery', 'nature', 'coming of age'], summary: 'A mystery about a young woman who raised herself in the marshes of North Carolina.', isAvailable: true }
      ],
      'Science Fiction': [
        { id: 'rec-3', title: 'The Martian', author: 'Andy Weir', genre: 'Science Fiction', year: 2011, isbn: '9780553418026', tags: ['space', 'survival', 'humor'], summary: 'An astronaut stranded on Mars must use his ingenuity to survive.', isAvailable: true },
        { id: 'rec-4', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', genre: 'Science Fiction', year: 2021, isbn: '9780571364909', tags: ['ai', 'love', 'philosophy'], summary: 'An artificial friend observes the world with extraordinary perception.', isAvailable: true }
      ],
      'Fantasy': [
        { id: 'rec-5', title: 'The Name of the Wind', author: 'Patrick Rothfuss', genre: 'Fantasy', year: 2007, isbn: '9780756404079', tags: ['magic', 'music', 'adventure'], summary: 'A legendary figure tells his own story of love, loss, and magic.', isAvailable: true },
        { id: 'rec-6', title: 'The Fifth Season', author: 'N.K. Jemisin', genre: 'Fantasy', year: 2015, isbn: '9780316229296', tags: ['dystopian', 'magic', 'award-winning'], summary: 'A world of devastating earthquakes and supernatural powers.', isAvailable: true }
      ]
    };

    // If targeting a specific book, recommend from same genre
    const targetGenre = targetBook?.genre || genre;
    let candidates: Book[] = [];

    if (targetGenre && recommendationPool[targetGenre]) {
      candidates = recommendationPool[targetGenre] || [];
    } else {
      // Mix recommendations from all genres
      candidates = Object.values(recommendationPool).flat();
    }

    // Filter out books already in collection
    const existingTitles = new Set(currentBooks.map(book => book.title.toLowerCase()));
    const filtered = candidates.filter(book => 
      !existingTitles.has(book.title.toLowerCase())
    );

    return filtered.slice(0, limit);
  }

  private static generateFallbackSummary(book: Book): string {
    const summaries: Record<string, string> = {
      'Fiction': `A compelling work of fiction that explores the human condition through ${book.author}'s masterful storytelling.`,
      'Science Fiction': `An imaginative science fiction tale that pushes the boundaries of what's possible in ${book.author}'s visionary world.`,
      'Fantasy': `A magical fantasy adventure filled with wonder and excitement, brought to life by ${book.author}'s rich imagination.`,
      'Mystery': `A gripping mystery that will keep you guessing until the very end, showcasing ${book.author}'s talent for suspense.`,
      'Romance': `A heartwarming romance that explores the complexities of love and relationships through ${book.author}'s engaging narrative.`,
      'Thriller': `A pulse-pounding thriller that delivers non-stop excitement and unexpected twists from ${book.author}.`,
      'Biography': `An insightful biography that provides a compelling look into a remarkable life, written by ${book.author}.`,
      'History': `A fascinating exploration of historical events and their impact, presented through ${book.author}'s expert analysis.`,
      'Classic Literature': `A timeless classic that continues to resonate with readers, demonstrating ${book.author}'s enduring literary genius.`
    };

    return summaries[book.genre] || `A captivating ${book.genre.toLowerCase()} work by ${book.author} that offers readers an engaging and memorable experience.`;
  }

  private static getRuleBasedInsights(books: Book[], topGenres: { genre: string; count: number; percentage: number }[]): LibraryInsights {
    const totalBooks = books.length;
    const borrowedBooks = books.filter(book => !book.isAvailable).length;
    const availableBooks = books.filter(book => book.isAvailable).length;

    let readingTrends = '';
    if (topGenres.length > 0) {
      readingTrends = `Your library shows a strong preference for ${topGenres[0].genre} (${topGenres[0].percentage}% of collection)`;
      if (topGenres.length > 1) {
        readingTrends += ` and ${topGenres[1].genre} (${topGenres[1].percentage}%)`;
      }
      readingTrends += '. This suggests you enjoy diverse storytelling across multiple genres.';
    } else {
      readingTrends = 'Your library collection is just getting started! Consider exploring different genres to discover your preferences.';
    }

    const recommendations = [
      'Consider exploring new genres to diversify your reading experience',
      'Look for award-winning books in your favorite genres',
      'Try authors you haven\'t read before within your preferred categories',
      'Balance fiction and non-fiction for a well-rounded library'
    ];

    const healthScore = Math.min(10, Math.max(1, 
      5 + (availableBooks / totalBooks) * 2 + (topGenres.length * 0.5)
    ));

    const factors = [
      `${Math.round((availableBooks / totalBooks) * 100)}% of books are available for reading`,
      `Collection spans ${topGenres.length} different genres`,
      totalBooks > 20 ? 'Good collection size for variety' : 'Consider expanding your collection',
      borrowedBooks > 0 ? 'Active borrowing shows engagement' : 'Consider checking out some books'
    ];

    return {
      topGenres,
      readingTrends,
      recommendations: recommendations.slice(0, 3),
      libraryHealth: {
        score: Math.round(healthScore),
        factors
      }
    };
  }

  private static parseAIInsights(aiResponse: string, topGenres: { genre: string; count: number; percentage: number }[]): LibraryInsights {
    // Parse AI response (simplified - in production, you'd want more robust parsing)
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    let readingTrends = '';
    let recommendations: string[] = [];
    let healthScore = 7; // Default
    let factors: string[] = [];

    // Extract insights from AI response
    for (const line of lines) {
      if (line.toLowerCase().includes('trend') || line.toLowerCase().includes('pattern')) {
        readingTrends = line;
      } else if (line.toLowerCase().includes('recommend') || line.match(/^\d+\./)) {
        recommendations.push(line.replace(/^\d+\.\s*/, ''));
      } else if (line.toLowerCase().includes('score')) {
        const scoreMatch = line.match(/(\d+)/);
        if (scoreMatch) {
          healthScore = parseInt(scoreMatch[1]);
        }
      }
    }

    if (!readingTrends) {
      readingTrends = `Your collection shows strong preferences for ${topGenres[0]?.genre || 'various genres'}.`;
    }

    if (recommendations.length === 0) {
      recommendations = ['Explore new genres', 'Try award-winning authors', 'Balance fiction and non-fiction'];
    }

    factors = [
      'Collection demonstrates good genre diversity',
      'Reading habits show consistent engagement',
      'Library size supports varied reading experiences'
    ];

    return {
      topGenres,
      readingTrends,
      recommendations: recommendations.slice(0, 4),
      libraryHealth: {
        score: Math.max(1, Math.min(10, healthScore)),
        factors
      }
    };
  }
}