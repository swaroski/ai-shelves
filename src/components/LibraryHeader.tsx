import { BookOpen, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

interface LibraryHeaderProps {
  onApiKeyClick: () => void;
  hasApiKey: boolean;
}

export const LibraryHeader = ({ onApiKeyClick, hasApiKey }: LibraryHeaderProps) => {
  const { isSignedIn, user } = useUser();

  return (
    <header className="bg-gradient-hero shadow-elegant">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <BookOpen className="w-8 h-8 text-library-gold" />
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">
                Alexandria Library
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                AI-Powered Knowledge Management
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
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

            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-library-navy font-semibold">
                    Dashboard
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-library-navy font-semibold">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="gold">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};