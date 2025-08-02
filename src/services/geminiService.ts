interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export class GeminiService {
  private static API_KEY_STORAGE_KEY = 'gemini_api_key';
  private static BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async generateBookSummary(title: string, author: string, genre: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set your API key first.');
    }

    const prompt = `Generate a concise, engaging book summary for "${title}" by ${author} in the ${genre} genre. The summary should be 2-3 sentences that capture the essence and appeal of the book. If this is a well-known book, provide accurate information. If it's fictional or unknown, create a plausible and compelling summary that fits the genre.`;

    try {
      const response = await fetch(`${this.BASE_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'Unable to generate summary.';
    } catch (error) {
      console.error('Error generating book summary:', error);
      throw error;
    }
  }

  static async getBookRecommendations(userBooks: string[], favoriteGenres: string[]): Promise<string[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set your API key first.');
    }

    const prompt = `Based on these books: ${userBooks.join(', ')} and favorite genres: ${favoriteGenres.join(', ')}, recommend 5 similar books. Return only the book titles, each on a new line, without numbering or additional text.`;

    try {
      const response = await fetch(`${this.BASE_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 300,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      const recommendations = data.candidates[0]?.content?.parts[0]?.text || '';
      return recommendations.split('\n').filter(line => line.trim()).slice(0, 5);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  static async getLibraryInsights(books: any[]): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set your API key first.');
    }

    const stats = {
      totalBooks: books.length,
      genres: books.reduce((acc, book) => {
        acc[book.genre] = (acc[book.genre] || 0) + 1;
        return acc;
      }, {}),
      borrowedCount: books.filter(book => !book.isAvailable).length,
    };

    const prompt = `Analyze this library data and provide interesting insights: Total books: ${stats.totalBooks}, Borrowed: ${stats.borrowedCount}, Genres: ${JSON.stringify(stats.genres)}. Provide 2-3 interesting observations about the collection, reading patterns, or recommendations for the library.`;

    try {
      const response = await fetch(`${this.BASE_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 400,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'Unable to generate insights.';
    } catch (error) {
      console.error('Error getting insights:', error);
      throw error;
    }
  }
}