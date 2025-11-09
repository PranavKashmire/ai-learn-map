import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LearningMapFlow } from '@/components/LearningMapFlow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, BookOpen, Map, Zap, Brain, TrendingUp, Star } from 'lucide-react';

interface LearningMapData {
  topic: string;
  branches: Array<{
    id: string;
    name: string;
    description: string;
    subtopics: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  }>;
}

const Index = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [loading, setLoading] = useState(false);
  const [learningMap, setLearningMap] = useState<LearningMapData | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic required',
        description: 'Please enter a topic to generate a learning map.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setLearningMap(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-learning-map', {
        body: { topic, level },
      });

      if (error) {
        throw error;
      }

      if (!data || !data.branches) {
        throw new Error('Invalid learning map structure received');
      }

      setLearningMap(data);
      toast({
        title: '✨ Learning map generated!',
        description: `Explore the interactive map for "${data.topic}"`,
      });
    } catch (error: any) {
      console.error('Error generating learning map:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate learning map. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleGenerate();
    }
  };

  const exampleTopics = [
    { name: 'Machine Learning', icon: Brain },
    { name: 'Web Development', icon: Zap },
    { name: 'Data Science', icon: TrendingUp },
    { name: 'UI/UX Design', icon: Star }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
      <div className="fixed inset-0 bg-background/80 backdrop-blur-3xl pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float [animation-delay:2s] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float [animation-delay:4s] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border/50 glass-effect sticky top-0 z-50 shadow-medium">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 animate-slide-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-70" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-medium transform group-hover:scale-110 transition-transform duration-300">
                <Map className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gradient animate-shimmer" 
                  style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)), hsl(var(--primary)))' }}>
                AI Learning Pathways
              </h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                Visualize your learning journey with AI
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-12 max-w-7xl">
        {/* Input Section */}
        <Card className="mb-12 glass-effect border-2 border-primary/20 shadow-medium hover:shadow-glow transition-all duration-500 animate-fade-in-up overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3 text-3xl font-display">
              <div className="p-3 rounded-xl bg-gradient-primary/10 ring-2 ring-primary/20">
                <BookOpen className="w-7 h-7 text-primary animate-pulse-glow" />
              </div>
              Generate Your Learning Map
            </CardTitle>
            <CardDescription className="text-base mt-3 text-foreground/70">
              Enter any topic and we'll create an interactive, AI-powered learning roadmap tailored to your level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-accent" />
                  Topic
                </label>
                <Input
                  placeholder="e.g., Machine Learning, Photography, Cooking..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="h-14 text-lg glass-effect border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="w-full lg:w-56 space-y-2">
                <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  Learning Level
                </label>
                <Select value={level} onValueChange={(v: any) => setLevel(v)} disabled={loading}>
                  <SelectTrigger className="h-14 glass-effect border-2 border-secondary/20 focus:border-secondary focus:ring-4 focus:ring-secondary/20 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect backdrop-blur-xl border-2 border-border/50 z-50 bg-popover">
                    <SelectItem value="beginner" className="text-base hover:bg-primary/10 focus:bg-primary/10 cursor-pointer">
                      🌱 Beginner
                    </SelectItem>
                    <SelectItem value="intermediate" className="text-base hover:bg-primary/10 focus:bg-primary/10 cursor-pointer">
                      🚀 Intermediate
                    </SelectItem>
                    <SelectItem value="advanced" className="text-base hover:bg-primary/10 focus:bg-primary/10 cursor-pointer">
                      ⚡ Advanced
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-14 text-lg font-bold bg-gradient-primary hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group/btn"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-display">Generating Map...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 animate-pulse" />
                    <span className="font-display">Generate Learning Map</span>
                    <Zap className="h-6 w-6" />
                  </>
                )}
              </div>
            </Button>

            {/* Example Topics */}
            <div className="pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                Try these popular topics:
              </p>
              <div className="flex flex-wrap gap-3">
                {exampleTopics.map(({ name, icon: Icon }) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTopic(name);
                      setTimeout(() => handleGenerate(), 200);
                    }}
                    disabled={loading}
                    className="glass-effect border-2 border-accent/20 hover:border-accent hover:bg-accent/10 hover:scale-105 transition-all duration-300 group/example"
                  >
                    <Icon className="w-4 h-4 mr-2 text-accent group-hover/example:rotate-12 transition-transform duration-300" />
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Map Visualization */}
        {learningMap && (
          <div className="animate-fade-in-up space-y-6">
            <div className="glass-effect p-8 rounded-2xl border-2 border-primary/20 shadow-glow">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-display font-bold text-gradient" 
                      style={{ backgroundImage: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
                    {learningMap.topic}
                  </h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Map className="w-5 h-5 text-accent" />
                    Explore {learningMap.branches.length} main learning areas below
                  </p>
                </div>
                <div className="px-6 py-3 rounded-xl glass-effect border-2 border-accent/30 animate-pulse-glow">
                  <span className="text-sm font-bold text-accent uppercase tracking-wider">Interactive</span>
                </div>
              </div>
            </div>
            <LearningMapFlow data={learningMap} />
          </div>
        )}

        {/* Welcome Message */}
        {!learningMap && !loading && (
          <Card className="border-2 border-dashed border-primary/20 glass-effect animate-fade-in-up overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-700" />
            <CardContent className="pt-20 pb-20 text-center relative">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-primary rounded-full blur-3xl opacity-50 animate-pulse-glow" />
                <div className="relative w-28 h-28 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-float">
                  <Sparkles className="w-14 h-14 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-4xl font-display font-bold mb-4 text-gradient"
                  style={{ backgroundImage: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))' }}>
                Ready to Start Learning?
              </h3>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-8 leading-relaxed">
                Enter any topic above to generate an intelligent, visual learning pathway. 
                Our AI will structure your journey from fundamentals to advanced concepts with interactive nodes.
              </p>
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                {['Web3 & Blockchain', 'Artificial Intelligence', 'Creative Writing', 'Music Production'].map((example, i) => (
                  <Button
                    key={example}
                    variant="outline"
                    onClick={() => {
                      setTopic(example);
                      setTimeout(() => handleGenerate(), 100);
                    }}
                    className="glass-effect border-2 border-primary/20 hover:border-primary hover:bg-primary/10 hover:scale-110 hover:shadow-glow transition-all duration-300 text-base px-6 py-6 animate-scale-in group/quick"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Zap className="w-5 h-5 mr-2 text-primary group-hover/quick:rotate-12 transition-transform duration-300" />
                    Try: {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/30 glass-effect mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-semibold">Powered by AI</span>
            <span>•</span>
            <Map className="w-4 h-4 text-secondary" />
            <span className="font-semibold">Interactive Learning Maps</span>
            <span>•</span>
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="font-semibold">Structured Knowledge</span>
          </div>
          <p className="text-xs text-muted-foreground/50">Transform any topic into a beautiful learning journey</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;