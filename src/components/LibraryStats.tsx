import { useState } from 'react';
import { LibraryStats as LibraryStatsType } from '@/types/library';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, BookOpen, Users, Calendar, Sparkles, TrendingUp } from 'lucide-react';
import { GeminiService } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';

interface LibraryStatsProps {
  stats: LibraryStatsType;
  books: any[];
}

export const LibraryStats = ({ stats, books }: LibraryStatsProps) => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const aiInsights = await GeminiService.getLibraryInsights(books);
      setInsights(aiInsights);
      toast({
        title: "AI Insights Generated",
        description: "Your library analysis is ready!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate insights",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-library-burgundy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-library-navy">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">
              In your collection
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.availableBooks}</div>
            <p className="text-xs text-muted-foreground">
              Ready to borrow
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.borrowedBooks}</div>
            <p className="text-xs text-muted-foreground">
              Currently out
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Genres */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-library-burgundy" />
            Popular Genres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.popularGenres.map((genre, index) => (
              <div key={genre.genre} className="flex items-center justify-between">
                <span className="font-medium">{genre.genre}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-library-burgundy h-2 rounded-full transition-smooth"
                      style={{
                        width: `${(genre.count / stats.totalBooks) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {genre.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-library-gold" />
              AI Library Insights
            </CardTitle>
            <Button
              variant="gold"
              size="sm"
              onClick={handleGenerateInsights}
              disabled={isLoadingInsights}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {isLoadingInsights ? 'Analyzing...' : 'Generate Insights'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {insights ? (
            <div className="bg-library-cream p-4 rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-line">{insights}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Click "Generate Insights" to get AI-powered analysis of your library collection.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats.recentBorrowings.length > 0 && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-library-burgundy" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentBorrowings.map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{record.borrower}</p>
                    <p className="text-sm text-muted-foreground">
                      Borrowed on {new Date(record.borrowedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Due: {new Date(record.dueDate).toLocaleDateString()}</p>
                    {record.returnedDate && (
                      <p className="text-xs text-green-600">
                        Returned {new Date(record.returnedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};