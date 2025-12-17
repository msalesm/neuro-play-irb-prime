import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, BookOpen, Wand2, CheckCircle, 
  RefreshCw, Download, Share2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneratedStory {
  title: string;
  description: string;
  ageMin: number;
  ageMax: number;
  steps: Array<{
    order: number;
    title: string;
    description: string;
    imagePrompt: string;
  }>;
  targetBehavior: string;
  therapeuticGoal: string;
}

interface StoryGeneratorProps {
  childId?: string;
  childAge?: number;
  childConditions?: string[];
  onStoryGenerated?: (story: GeneratedStory) => void;
}

export function StoryGenerator({ 
  childId, 
  childAge, 
  childConditions,
  onStoryGenerated 
}: StoryGeneratorProps) {
  const { toast } = useToast();
  const [problem, setProblem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);

  const handleGenerate = async () => {
    if (!problem.trim()) {
      toast({
        title: 'Descreva o problema',
        description: 'Por favor, descreva a situação ou comportamento para criar a história',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedStory(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-social-story', {
        body: {
          problemDescription: problem,
          childId,
          childAge,
          childConditions
        }
      });

      if (error) throw error;

      if (data?.story) {
        setGeneratedStory(data.story);
        onStoryGenerated?.(data.story);
        toast({
          title: 'História gerada!',
          description: 'Sua história social personalizada foi criada'
        });
      }
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: 'Erro ao gerar história',
        description: 'Não foi possível gerar a história. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Gerador de Histórias Sociais com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Descreva o problema ou situação
            </label>
            <Textarea
              placeholder="Ex: Meu filho tem dificuldade em esperar sua vez nas brincadeiras com outras crianças..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Seja específico sobre o comportamento ou situação que você gostaria de abordar
            </p>
          </div>

          {childAge && (
            <div className="flex gap-2">
              <Badge variant="secondary">Idade: {childAge} anos</Badge>
              {childConditions?.map(condition => (
                <Badge key={condition} variant="outline">{condition}</Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !problem.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Gerando história...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar História Social
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Loading State */}
      {isGenerating && (
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Story */}
      {generatedStory && (
        <Card className="border-primary/50">
          <CardHeader className="bg-primary/5">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {generatedStory.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {generatedStory.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge>Idade: {generatedStory.ageMin}-{generatedStory.ageMax} anos</Badge>
              <Badge variant="secondary">{generatedStory.therapeuticGoal}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedStory.steps.map((step, index) => (
                <Card key={index} className="relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {step.order}
                  </div>
                  <CardContent className="pt-6">
                    {/* Placeholder for image */}
                    <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <h4 className="font-semibold mb-1 leading-normal pb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed pb-2" style={{ lineHeight: 1.6 }}>{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Comportamento Alvo</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {generatedStory.targetBehavior}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setGeneratedStory(null)}>
              Gerar Nova
            </Button>
            <Button>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar na Biblioteca
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
