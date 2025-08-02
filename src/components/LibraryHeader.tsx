import { BookOpen, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LibraryHeaderProps {
  onApiKeyClick: () => void;
  hasApiKey: boolean;
}

export const LibraryHeader = ({ onApiKeyClick, hasApiKey }: LibraryHeaderProps) => {
  return (
    <header className="bg-gradient-hero shadow-elegant">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-library-gold" />
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">
                Alexandria Library
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                AI-Powered Knowledge Management
              </p>
            </div>
          </div>
          
          <Button
            variant="gold"
            size="sm"
            onClick={onApiKeyClick}
            className="flex items-center gap-2"
          >
            {hasApiKey ? (
              <>
                <Sparkles className="w-4 h-4" />
                AI Active
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                Setup AI
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};