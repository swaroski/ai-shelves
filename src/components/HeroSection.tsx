import { BookOpen, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LampContainer } from '@/components/ui/lamp';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onGetStarted: () => void;
  totalBooks: number;
  availableBooks: number;
}

export const HeroSection = ({ onGetStarted, totalBooks, availableBooks }: HeroSectionProps) => {
  return (
    <LampContainer className="min-h-screen">
      <motion.div
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="text-center space-y-3 max-w-4xl mx-auto px-4 pt-26"
      >
        {/* Main heading */}
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400 rounded-full px-6 py-3 text-sm font-semibold text-black border border-yellow-500 shadow-xl">
              <Sparkles className="w-4 h-4" />
              AI-Powered Library Management
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Welcome to
            <span className="block bg-gradient-to-br from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Alexandria
            </span>
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mt-1">
            Intelligent book discovery, seamless checkout flows, and analytics 
            that reveal your reading patterns—all under the lamp of knowledge.
          </p>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5,
            duration: 0.6,
            ease: "easeInOut",
          }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold px-8 py-6 text-lg shadow-2xl hover:shadow-amber-400/25 transition-all duration-300 hover:scale-105"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Add Your First Book
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-900 px-8 py-6 text-lg backdrop-blur-sm font-semibold shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Explore Features
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.7,
            duration: 0.6,
            ease: "easeInOut",
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl hover:shadow-amber-400/10 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{totalBooks}</div>
              <div className="text-white/80 text-sm">Books in Collection</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl hover:shadow-amber-400/10 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{availableBooks}</div>
              <div className="text-white/80 text-sm">Available Now</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl hover:shadow-amber-400/10 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">AI</div>
              <div className="text-white/80 text-sm">Powered Features</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </LampContainer>
  );
};