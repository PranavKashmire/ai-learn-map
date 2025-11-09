import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LearningMapFlow } from '@/components/LearningMapFlow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, BookOpen, Map } from 'lucide-react';

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
        title: 'Learning map generated!',
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Learning Pathways
              </h1>
              <p className="text-sm text-muted-foreground">Visualize your learning journey</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Input Section */}
        <Card className="mb-8 shadow-soft border-2 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="w-6 h-6 text-primary" />
              Generate Your Learning Map
            </CardTitle>
            <CardDescription>
              Enter any topic and we'll create an interactive, AI-powered learning roadmap tailored to your level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Input
                  placeholder="e.g., Web Development, Machine Learning, Gardening..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="h-12 text-base"
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-2 block">Learning Level</label>
                <Select value={level} onValueChange={(v: any) => setLevel(v)} disabled={loading}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full sm:w-auto h-12 px-8 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Map...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Learning Map
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Learning Map Visualization */}
        {learningMap && (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-1">{learningMap.topic}</h2>
                <p className="text-muted-foreground">
                  Explore {learningMap.branches.length} main learning areas below
                </p>
              </div>
            </div>
            <LearningMapFlow data={learningMap} />
          </div>
        )}

        {/* Welcome Message */}
        {!learningMap && !loading && (
          <Card className="border-2 border-dashed border-border/50 bg-card/30 animate-fade-in">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Ready to Start Learning?</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Enter any topic above to generate an intelligent, visual learning pathway. 
                Our AI will structure your journey from fundamentals to advanced concepts.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Web Development', 'Data Science', 'Photography', 'Cooking'].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTopic(example);
                      setTimeout(() => handleGenerate(), 100);
                    }}
                    className="text-sm"
                  >
                    Try: {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by AI • Interactive Learning Maps • Structured Knowledge</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;