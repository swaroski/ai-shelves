import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, ExternalLink, Sparkles, X } from 'lucide-react';
import { GeminiService } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';

interface ApiKeySetupProps {
  onClose: () => void;
}

export const ApiKeySetup = ({ onClose }: ApiKeySetupProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(GeminiService.getApiKey() || '');
  const [isValidating, setIsValidating] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      // Save the API key first
      GeminiService.saveApiKey(apiKey.trim());
      
      // Test with a simple summary generation
      await GeminiService.generateBookSummary("Test Book", "Test Author", "Fiction");
      
      toast({
        title: "Success!",
        description: "Gemini AI is now active and ready to use",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Invalid API Key",
        description: "Please check your API key and try again",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-book">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-library-gold" />
              Setup Gemini AI
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            <p className="mb-3">
              To enable AI-powered features like book summaries and recommendations, 
              you'll need a Gemini API key.
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Visit Google AI Studio</li>
              <li>Create or select a project</li>
              <li>Generate an API key</li>
              <li>Paste it below</li>
            </ol>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Get Gemini API Key
          </Button>

          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-library-cream p-3 rounded-lg">
            <p className="font-medium mb-1">🔒 Privacy Notice</p>
            <p>Your API key is stored locally in your browser and never sent to our servers.</p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSaveApiKey}
              disabled={isValidating || !apiKey.trim()}
              className="flex-1"
              variant="hero"
            >
              {isValidating ? 'Validating...' : 'Save & Activate'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};