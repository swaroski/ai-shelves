import { Book } from '@/types/library';

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  subject?: string[];
  cover_i?: number;
}

interface OpenLibrarySearchResponse {
  docs: OpenLibraryBook[];
  numFound: number;
}

export class OpenLibraryService {
  private static readonly BASE_URL = 'https://openlibrary.org';
  private static readonly SEARCH_URL = `${this.BASE_URL}/search.json`;

  static async searchBooks(query: string = 'popular', limit: number = 30): Promise<Book[]> {
    try {
      const url = `${this.SEARCH_URL}?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,first_publish_year,isbn,subject,cover_i`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OpenLibrary API error: ${response.status}`);
      }

      const data: OpenLibrarySearchResponse = await response.json();
      
      return data.docs.map((book, index) => this.convertToBook(book, index));
    } catch (error) {
      console.error('Error fetching from OpenLibrary:', error);
      return this.getFallbackBooks();
    }
  }

  static async getPopularBooks(): Promise<Book[]> {
    try {
      // Try to get a diverse set of popular books
      const url = `${this.SEARCH_URL}?q=*&sort=rating desc&limit=50&fields=key,title,author_name,first_publish_year,isbn,subject,cover_i`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OpenLibrary API error: ${response.status}`);
      }

      const data: OpenLibrarySearchResponse = await response.json();
      
      if (data.docs && data.docs.length > 0) {
        const books = data.docs.map((book, index) => this.convertToBook(book, index));
        console.log(`Successfully fetched ${books.length} books from OpenLibrary`);
        return books;
      } else {
        throw new Error('No books returned from OpenLibrary');
      }
    } catch (error) {
      console.error('Error fetching popular books:', error);
      console.log('Falling back to default book collection');
      return this.getFallbackBooks();
    }
  }

  static async getTrendingBooks(): Promise<Book[]> {
    try {
      // Get books from different trending topics
      const trendingQueries = [
        'harry potter',
        'lord of the rings',
        'game of thrones',
        'dune',
        'sherlock holmes',
        'jane austen'
      ];

      const books = await this.searchBooks(trendingQueries.join(' OR '), 25);
      return books;
    } catch (error) {
      console.error('Error fetching trending books:', error);
      return this.getFallbackBooks();
    }
  }

  private static convertToBook(olBook: OpenLibraryBook, index: number): Book {
    const genres = [
      'Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 
      'Thriller', 'Biography', 'History', 'Science', 'Philosophy',
      'Classic Literature', 'Contemporary Fiction', 'Horror', 'Adventure'
    ];

    const randomGenre = olBook.subject?.[0] || genres[Math.floor(Math.random() * genres.length)];
    const coverUrl = olBook.cover_i 
      ? `https://covers.openlibrary.org/b/id/${olBook.cover_i}-M.jpg`
      : '/placeholder.svg';

    return {
      id: olBook.key.replace('/works/', '') || `ol-${Date.now()}-${index}`,
      title: olBook.title || 'Unknown Title',
      author: olBook.author_name?.[0] || 'Unknown Author',
      genre: this.normalizeGenre(randomGenre),
      year: olBook.first_publish_year || 2020,
      isbn: olBook.isbn?.[0] || `978${Math.floor(Math.random() * 1000000000)}`,
      tags: olBook.subject?.slice(0, 3) || ['fiction', 'literature'],
      summary: `A fascinating ${randomGenre.toLowerCase()} work that explores themes of human nature, society, and the complexities of modern life. This book has captivated readers with its compelling narrative and thought-provoking insights.`,
      isAvailable: Math.random() > 0.3, // 70% available
      borrower: Math.random() > 0.7 ? 'John Doe' : undefined,
      dueDate: Math.random() > 0.7 ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      borrowedDate: Math.random() > 0.7 ? new Date().toISOString() : undefined,
      coverUrl
    };
  }

  private static normalizeGenre(genre: string): string {
    const genreMap: Record<string, string> = {
      'fiction': 'Fiction',
      'science_fiction': 'Science Fiction',
      'fantasy': 'Fantasy',
      'mystery': 'Mystery',
      'romance': 'Romance',
      'thriller': 'Thriller',
      'biography': 'Biography',
      'history': 'History',
      'science': 'Science',
      'philosophy': 'Philosophy',
      'literature': 'Classic Literature',
      'horror': 'Horror',
      'adventure': 'Adventure'
    };

    const normalized = genre.toLowerCase().replace(/\s+/g, '_');
    return genreMap[normalized] || 'Fiction';
  }

  private static getFallbackBooks(): Book[] {
    return [
      {
        id: 'fallback-1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Classic Literature',
        year: 1925,
        isbn: '9780743273565',
        tags: ['American Literature', 'Jazz Age', 'Classic'],
        summary: 'A masterpiece of American literature set in the Jazz Age, exploring themes of wealth, love, and the American Dream.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-2',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Classic Literature',
        year: 1960,
        isbn: '9780061120084',
        tags: ['American Literature', 'Social Justice'],
        summary: 'A profound tale of moral courage in the American South through Scout Finch\'s perspective.',
        isAvailable: false,
        borrower: 'Sarah Johnson',
        dueDate: '2024-08-15',
        borrowedDate: '2024-08-01',
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-3',
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Science Fiction',
        year: 1965,
        isbn: '9780441172719',
        tags: ['Space Opera', 'Politics', 'Ecology'],
        summary: 'An epic science fiction saga set on the desert planet Arrakis.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-4',
        title: '1984',
        author: 'George Orwell',
        genre: 'Dystopian Fiction',
        year: 1949,
        isbn: '9780452284234',
        tags: ['Dystopian', 'Political', 'Classic'],
        summary: 'A chilling depiction of a totalitarian society under constant surveillance.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-5',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genre: 'Romance',
        year: 1813,
        isbn: '9780141439518',
        tags: ['Romance', 'British Literature', 'Classic'],
        summary: 'A witty tale of love and society in Regency England.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-6',
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        genre: 'Fantasy',
        year: 1954,
        isbn: '9780544003415',
        tags: ['Fantasy', 'Adventure', 'Epic'],
        summary: 'The epic fantasy adventure of hobbits, wizards, and the fate of Middle-earth.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-7',
        title: 'Harry Potter and the Philosopher\'s Stone',
        author: 'J.K. Rowling',
        genre: 'Fantasy',
        year: 1997,
        isbn: '9780747532699',
        tags: ['Magic', 'Young Adult', 'Adventure'],
        summary: 'A young wizard discovers his magical heritage and begins his journey at Hogwarts.',
        isAvailable: false,
        borrower: 'Mike Wilson',
        dueDate: '2024-08-20',
        borrowedDate: '2024-08-06',
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-8',
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        genre: 'Coming of Age',
        year: 1951,
        isbn: '9780316769174',
        tags: ['Coming of Age', 'American Literature'],
        summary: 'A teenage protagonist\'s journey through New York City and adolescent alienation.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-9',
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        genre: 'Fantasy',
        year: 1937,
        isbn: '9780547928227',
        tags: ['Fantasy', 'Adventure', 'Children'],
        summary: 'Bilbo Baggins\' unexpected adventure with dwarves and a dragon.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-10',
        title: 'Brave New World',
        author: 'Aldous Huxley',
        genre: 'Science Fiction',
        year: 1932,
        isbn: '9780060850524',
        tags: ['Dystopian', 'Science Fiction', 'Social Commentary'],
        summary: 'A disturbing vision of a future society obsessed with pleasure and control.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-11',
        title: 'The Chronicles of Narnia',
        author: 'C.S. Lewis',
        genre: 'Fantasy',
        year: 1950,
        isbn: '9780066238500',
        tags: ['Fantasy', 'Children', 'Adventure'],
        summary: 'Children discover a magical world through an old wardrobe.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-12',
        title: 'Foundation',
        author: 'Isaac Asimov',
        genre: 'Science Fiction',
        year: 1951,
        isbn: '9780553293357',
        tags: ['Science Fiction', 'Space Opera'],
        summary: 'A mathematician develops a science to predict the future of human civilization.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-13',
        title: 'The Hitchhiker\'s Guide to the Galaxy',
        author: 'Douglas Adams',
        genre: 'Science Fiction',
        year: 1979,
        isbn: '9780345391803',
        tags: ['Humor', 'Science Fiction', 'Comedy'],
        summary: 'A humorous science fiction adventure across the galaxy.',
        isAvailable: false,
        borrower: 'Anna Davis',
        dueDate: '2024-08-25',
        borrowedDate: '2024-08-11',
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-14',
        title: 'Jane Eyre',
        author: 'Charlotte Brontë',
        genre: 'Gothic Romance',
        year: 1847,
        isbn: '9780142437209',
        tags: ['Gothic', 'Romance', 'Classic'],
        summary: 'An orphaned governess finds love and independence in Victorian England.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-15',
        title: 'Moby Dick',
        author: 'Herman Melville',
        genre: 'Adventure',
        year: 1851,
        isbn: '9780142437247',
        tags: ['Adventure', 'Classic', 'Sea'],
        summary: 'Captain Ahab\'s obsessive quest for the white whale.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-16',
        title: 'The Picture of Dorian Gray',
        author: 'Oscar Wilde',
        genre: 'Gothic Fiction',
        year: 1890,
        isbn: '9780141442464',
        tags: ['Gothic', 'Philosophy', 'Classic'],
        summary: 'A young man\'s portrait ages while he remains eternally youthful.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-17',
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        genre: 'Science Fiction',
        year: 1953,
        isbn: '9781451673319',
        tags: ['Dystopian', 'Censorship', 'Science Fiction'],
        summary: 'A fireman burns books in a society where reading is forbidden.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-18',
        title: 'The Handmaid\'s Tale',
        author: 'Margaret Atwood',
        genre: 'Dystopian Fiction',
        year: 1985,
        isbn: '9780385490818',
        tags: ['Dystopian', 'Feminism', 'Science Fiction'],
        summary: 'A woman\'s struggle for survival in a totalitarian theocracy.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-19',
        title: 'The Martian',
        author: 'Andy Weir',
        genre: 'Science Fiction',
        year: 2011,
        isbn: '9780553418026',
        tags: ['Space', 'Survival', 'Humor'],
        summary: 'An astronaut stranded on Mars uses science and wit to survive.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-20',
        title: 'Gone Girl',
        author: 'Gillian Flynn',
        genre: 'Thriller',
        year: 2012,
        isbn: '9780307588364',
        tags: ['Thriller', 'Mystery', 'Psychological'],
        summary: 'A marriage goes dangerously wrong when a wife disappears.',
        isAvailable: false,
        borrower: 'Tom Brown',
        dueDate: '2024-08-18',
        borrowedDate: '2024-08-04',
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-21',
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        genre: 'Mystery',
        year: 2005,
        isbn: '9780307454546',
        tags: ['Mystery', 'Crime', 'Thriller'],
        summary: 'A journalist and hacker investigate a wealthy family\'s dark secrets.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-22',
        title: 'The Hunger Games',
        author: 'Suzanne Collins',
        genre: 'Young Adult',
        year: 2008,
        isbn: '9780439023528',
        tags: ['Dystopian', 'Young Adult', 'Action'],
        summary: 'A teenager fights for survival in a deadly televised competition.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-23',
        title: 'Life of Pi',
        author: 'Yann Martel',
        genre: 'Adventure',
        year: 2001,
        isbn: '9780156027328',
        tags: ['Adventure', 'Survival', 'Philosophy'],
        summary: 'A young man survives 227 days at sea with a Bengal tiger.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-24',
        title: 'The Kite Runner',
        author: 'Khaled Hosseini',
        genre: 'Historical Fiction',
        year: 2003,
        isbn: '9781594631931',
        tags: ['Historical', 'Friendship', 'Afghanistan'],
        summary: 'A story of friendship, guilt, and redemption set in Afghanistan.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-25',
        title: 'The Book Thief',
        author: 'Markus Zusak',
        genre: 'Historical Fiction',
        year: 2005,
        isbn: '9780375842207',
        tags: ['Historical', 'World War II', 'Young Adult'],
        summary: 'Death narrates the story of a girl who steals books in Nazi Germany.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-26',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        genre: 'Philosophy',
        year: 1988,
        isbn: '9780062315007',
        tags: ['Philosophy', 'Adventure', 'Inspiration'],
        summary: 'A shepherd boy\'s journey to find his personal legend.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-27',
        title: 'Educated',
        author: 'Tara Westover',
        genre: 'Memoir',
        year: 2018,
        isbn: '9780399590504',
        tags: ['Memoir', 'Education', 'Family'],
        summary: 'A memoir about education\'s transformative power despite a survivalist upbringing.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-28',
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        genre: 'History',
        year: 2011,
        isbn: '9780062316097',
        tags: ['History', 'Anthropology', 'Science'],
        summary: 'A brief history of humankind from the Stone Age to the present.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-29',
        title: 'Atomic Habits',
        author: 'James Clear',
        genre: 'Self-Help',
        year: 2018,
        isbn: '9780735211292',
        tags: ['Self-Help', 'Psychology', 'Productivity'],
        summary: 'How tiny changes can make a remarkable difference in your life.',
        isAvailable: false,
        borrower: 'Lisa Chen',
        dueDate: '2024-08-22',
        borrowedDate: '2024-08-08',
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-30',
        title: 'Where the Crawdads Sing',
        author: 'Delia Owens',
        genre: 'Mystery',
        year: 2018,
        isbn: '9780735219090',
        tags: ['Mystery', 'Nature', 'Coming of Age'],
        summary: 'A mystery about a young woman who raised herself in the marshes.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-31',
        title: 'The Seven Husbands of Evelyn Hugo',
        author: 'Taylor Jenkins Reid',
        genre: 'Historical Fiction',
        year: 2017,
        isbn: '9781501161933',
        tags: ['Hollywood', 'LGBTQ+', 'Secrets'],
        summary: 'A reclusive Hollywood icon reveals her secrets to an unknown journalist.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-32',
        title: 'Atomic Habits',
        author: 'James Clear',
        genre: 'Self-Help',
        year: 2018,
        isbn: '9780735211292',
        tags: ['Productivity', 'Psychology', 'Personal Development'],
        summary: 'A guide to building good habits and breaking bad ones.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-33',
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        genre: 'Psychological Thriller',
        year: 2019,
        isbn: '9781250301697',
        tags: ['Thriller', 'Psychology', 'Mystery'],
        summary: 'A woman refuses to speak after murdering her husband.',
        isAvailable: false,
        borrower: 'David Kim',
        dueDate: '2024-08-20',
        borrowedDate: '2024-08-06',
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-34',
        title: 'Circe',
        author: 'Madeline Miller',
        genre: 'Mythology',
        year: 2018,
        isbn: '9780316556347',
        tags: ['Greek Mythology', 'Fantasy', 'Feminism'],
        summary: 'The story of Circe, a goddess of magic in Greek mythology.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-35',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        genre: 'Literary Fiction',
        year: 2020,
        isbn: '9780525559474',
        tags: ['Philosophy', 'Life Choices', 'Self-Discovery'],
        summary: 'A library between life and death where every book is a different life.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-36',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        genre: 'Science Fiction',
        year: 2021,
        isbn: '9780593135204',
        tags: ['Space', 'Science', 'Humor'],
        summary: 'A lone astronaut must save humanity from extinction.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-37',
        title: 'The Song of Achilles',
        author: 'Madeline Miller',
        genre: 'Historical Fiction',
        year: 2011,
        isbn: '9780062060624',
        tags: ['Greek Mythology', 'LGBTQ+', 'War'],
        summary: 'The love story between Achilles and Patroclus during the Trojan War.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-38',
        title: 'Klara and the Sun',
        author: 'Kazuo Ishiguro',
        genre: 'Literary Fiction',
        year: 2021,
        isbn: '9780593318171',
        tags: ['AI', 'Coming of Age', 'Philosophy'],
        summary: 'An artificial friend observes and learns about human nature.',
        isAvailable: false,
        borrower: 'Maria Rodriguez',
        dueDate: '2024-08-25',
        borrowedDate: '2024-08-11',
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-39',
        title: 'The Invisible Life of Addie LaRue',
        author: 'V.E. Schwab',
        genre: 'Fantasy',
        year: 2020,
        isbn: '9780765387561',
        tags: ['Magic', 'Immortality', 'Memory'],
        summary: 'A woman cursed to be forgotten by everyone she meets.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-40',
        title: 'Normal People',
        author: 'Sally Rooney',
        genre: 'Literary Fiction',
        year: 2018,
        isbn: '9781984822178',
        tags: ['Relationships', 'Coming of Age', 'Ireland'],
        summary: 'The complex relationship between two Irish teenagers.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-41',
        title: 'The Vanishing Half',
        author: 'Brit Bennett',
        genre: 'Literary Fiction',
        year: 2020,
        isbn: '9780525536291',
        tags: ['Race', 'Identity', 'Family'],
        summary: 'Twin sisters who run away from home and live very different lives.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-42',
        title: 'Such a Fun Age',
        author: 'Kiley Reid',
        genre: 'Contemporary Fiction',
        year: 2019,
        isbn: '9780525541905',
        tags: ['Race', 'Class', 'Relationships'],
        summary: 'A young babysitter navigates an uncomfortable accusation.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-43',
        title: 'The Guest List',
        author: 'Lucy Foley',
        genre: 'Mystery',
        year: 2020,
        isbn: '9780062868930',
        tags: ['Wedding', 'Secrets', 'Island'],
        summary: 'A wedding on a remote island goes terribly wrong.',
        isAvailable: false,
        borrower: 'James Wilson',
        dueDate: '2024-08-18',
        borrowedDate: '2024-08-04',
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-44',
        title: 'The Thursday Murder Club',
        author: 'Richard Osman',
        genre: 'Cozy Mystery',
        year: 2020,
        isbn: '9781984880567',
        tags: ['Elderly', 'Murder', 'Friendship'],
        summary: 'Four retirees meet weekly to investigate cold cases.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      },
      {
        id: 'fallback-45',
        title: 'The Ten Thousand Doors of January',
        author: 'Alix E. Harrow',
        genre: 'Fantasy',
        year: 2019,
        isbn: '9780316421997',
        tags: ['Portal Fantasy', 'Magic', 'Adventure'],
        summary: 'A young woman discovers doors to other worlds.',
        isAvailable: true,
        coverUrl: '/placeholder.svg'
      }
    ];
  }

  static getCoverUrl(bookId: string, size: 'S' | 'M' | 'L' = 'M'): string {
    return `https://covers.openlibrary.org/b/id/${bookId}-${size}.jpg`;
  }

  static getBookUrl(bookKey: string): string {
    return `${this.BASE_URL}${bookKey}`;
  }
}