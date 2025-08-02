import { BookOpen, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface HeroSectionProps {
  onGetStarted: () => void;
  totalBooks: number;
  availableBooks: number;
}

export const HeroSection = ({ onGetStarted, totalBooks, availableBooks }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-library-gold/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-library-burgundy/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Main heading */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-library-gold/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-primary-foreground">
              <Sparkles className="w-4 h-4" />
              AI-Powered Library Management
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
              Welcome to
              <span className="block bg-gradient-accent bg-clip-text text-transparent">
                Alexandria
              </span>
            </h1>
            
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Transform your library management with intelligent automation, beautiful organization, 
              and AI-powered insights that help you discover and manage your collection like never before.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-library-gold hover:bg-library-gold/90 text-library-navy font-semibold px-8 py-6 text-lg shadow-book hover:shadow-elegant transition-spring hover:scale-105"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Add Your First Book
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg backdrop-blur-sm"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Explore Features
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16 animate-fade-in">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-book hover:shadow-elegant transition-spring hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-library-gold mb-2">{totalBooks}</div>
                <div className="text-primary-foreground/80 text-sm">Books in Collection</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-book hover:shadow-elegant transition-spring hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-library-gold mb-2">{availableBooks}</div>
                <div className="text-primary-foreground/80 text-sm">Available Now</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-book hover:shadow-elegant transition-spring hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-library-gold mb-2">AI</div>
                <div className="text-primary-foreground/80 text-sm">Powered Features</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};