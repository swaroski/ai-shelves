import { BookOpen, Search, Sparkles, BarChart3, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: BookOpen,
    title: "Smart Collection",
    description: "Organize your books with intelligent categorization and metadata management.",
    gradient: "from-library-navy to-library-burgundy"
  },
  {
    icon: Search,
    title: "Powerful Search",
    description: "Find any book instantly with advanced search and filtering capabilities.",
    gradient: "from-library-burgundy to-library-gold"
  },
  {
    icon: Sparkles,
    title: "AI Summaries",
    description: "Generate intelligent book summaries and recommendations powered by Gemini AI.",
    gradient: "from-library-gold to-library-navy"
  },
  {
    icon: Users,
    title: "Borrowing System",
    description: "Track who borrowed what and when, with automated due date reminders.",
    gradient: "from-library-navy to-library-gold"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Gain insights into your collection trends and reading patterns.",
    gradient: "from-library-burgundy to-library-navy"
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Instant synchronization and live status updates across your library.",
    gradient: "from-library-gold to-library-burgundy"
  }
];

export const FeatureCards = () => {
  return (
    <section className="py-20 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-library-navy mb-4">
            Everything You Need to Manage Your Library
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Powerful features designed to make library management effortless and intelligent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group bg-gradient-card shadow-book hover:shadow-elegant transition-spring hover:scale-105 border-0 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="space-y-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} p-3 shadow-book group-hover:scale-110 transition-spring`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-library-navy group-hover:text-library-burgundy transition-smooth">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};