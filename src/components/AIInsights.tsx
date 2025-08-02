import { useState, useEffect } from 'react';
import { Book } from '@/types/library';
import { AIRecommendationService } from '@/services/aiRecommendationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Lightbulb, 
  BarChart3,
  Star,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface AIInsightsProps {
  books: Book[];
  className?: string;
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

export function AIInsights({ books, className = '' }: AIInsightsProps) {
  const [insights, setInsights] = useState<LibraryInsights | null>(null);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (books.length > 0) {
      generateInsights();
    }
  }, [books.length]);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const libraryInsights = await AIRecommendationService.generateLibraryInsights(books);
      const bookRecommendations = AIRecommendationService.generateBookRecommendations(books, undefined, { limit: 6 });
      
      setInsights(libraryInsights);
      setRecommendations(bookRecommendations);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInsights = () => {
    generateInsights();
  };

  if (!insights && !isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Library Insights
          </CardTitle>
          <CardDescription>
            Generate intelligent insights about your library collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateInsights} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
            Analyzing Your Library...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <Progress value={75} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Generating personalized insights and recommendations...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>AI Library Insights</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={refreshInsights}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Intelligent analysis of your reading patterns and collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Reading Trends */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Reading Trends
              </h4>
              <p className="text-sm text-muted-foreground">{insights.readingTrends}</p>
            </div>

            {/* Top Genres */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                Genre Distribution
              </h4>
              <div className="space-y-2">
                {insights.topGenres.slice(0, 4).map((genre, index) => (
                  <div key={genre.genre} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{genre.genre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={genre.percentage} className="w-16 h-2" />
                      <span className="text-xs text-muted-foreground w-8">
                        {genre.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {/* AI Recommendations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-orange-600" />
                Personalized Suggestions
              </h4>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Book Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  Recommended Books
                </h4>
                <div className="grid gap-2">
                  {recommendations.slice(0, 3).map((book) => (
                    <div key={book.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/50">
                      <div className="w-8 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground">by {book.author}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {book.genre}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            {/* Library Health Score */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Library Health Score
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={insights.libraryHealth.score * 10} className="h-3" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {insights.libraryHealth.score}/10
                </div>
              </div>
            </div>

            {/* Health Factors */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Health Factors</h4>
              <ul className="space-y-2">
                {insights.libraryHealth.factors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}