import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Trash2, 
  GripVertical, 
  Image, 
  FileText,
  Loader2,
  BookOpen,
  Volume2
} from 'lucide-react';

interface StoryStep {
  id?: string;
  order_number: number;
  title: string;
  description: string;
  image_url?: string;
  audio_url?: string;
}

interface StoryData {
  id?: string;
  title: string;
  description: string;
  category: string;
  age_min: number;
  age_max: number;
  cover_image_url?: string;
  steps: StoryStep[];
}

const categories = [
  { value: 'rotinas', label: 'Rotinas' },
  { value: 'sensorial', label: 'Sensorial' },
  { value: 'emocoes', label: 'Emoções' },
  { value: 'social', label: 'Habilidades Sociais' },
];

export default function StoryEditor() {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<StoryStep | null>(null);

  const [story, setStory] = useState<StoryData>({
    title: '',
    description: '',
    category: 'rotinas',
    age_min: 3,
    age_max: 12,
    steps: [],
  });

  const [newStep, setNewStep] = useState<StoryStep>({
    order_number: 0,
    title: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    if (storyId && storyId !== 'new') {
      loadStory();
    }
  }, [storyId]);

  const loadStory = async () => {
    try {
      setLoading(true);

      const { data: storyData, error: storyError } = await supabase
        .from('social_stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (storyError) throw storyError;

      const { data: stepsData, error: stepsError } = await supabase
        .from('story_steps')
        .select('*')
        .eq('story_id', storyId)
        .order('order_number');

      if (stepsError) throw stepsError;

      setStory({
        id: storyData.id,
        title: storyData.title,
        description: storyData.description || '',
        category: storyData.category || 'rotinas',
        age_min: storyData.age_min || 3,
        age_max: storyData.age_max || 12,
        cover_image_url: storyData.cover_image_url,
        steps: stepsData || [],
      });
    } catch (error) {
      console.error('Error loading story:', error);
      toast.error('Erro ao carregar história');
    } finally {
      setLoading(false);
    }
  };

  const saveStory = async () => {
    if (!user) return;

    if (!story.title.trim()) {
      toast.error('Digite um título para a história');
      return;
    }

    try {
      setSaving(true);

      if (story.id) {
        // Update existing story
        const { error: updateError } = await supabase
          .from('social_stories')
          .update({
            title: story.title,
            description: story.description,
            category: story.category,
            age_min: story.age_min,
            age_max: story.age_max,
            cover_image_url: story.cover_image_url,
          })
          .eq('id', story.id);

        if (updateError) throw updateError;

        // Update steps
        for (const step of story.steps) {
          if (step.id) {
            await supabase
              .from('story_steps')
              .update({
                title: step.title,
                description: step.description,
                image_url: step.image_url,
                order_number: step.order_number,
              })
              .eq('id', step.id);
          } else {
            await supabase
              .from('story_steps')
              .insert({
                story_id: story.id,
                title: step.title,
                description: step.description,
                image_url: step.image_url,
                order_number: step.order_number,
              });
          }
        }

        toast.success('História atualizada!');
      } else {
        // Create new story
        const { data: newStory, error: createError } = await supabase
          .from('social_stories')
          .insert({
            title: story.title,
            description: story.description,
            category: story.category,
            age_min: story.age_min,
            age_max: story.age_max,
            cover_image_url: story.cover_image_url,
            created_by: user.id,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Create steps
        if (story.steps.length > 0) {
          const stepsToInsert = story.steps.map((step, idx) => ({
            story_id: newStory.id,
            title: step.title,
            description: step.description,
            image_url: step.image_url,
            order_number: idx + 1,
          }));

          await supabase.from('story_steps').insert(stepsToInsert);
        }

        toast.success('História criada!');
        navigate(`/admin/story-editor/${newStory.id}`);
      }
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Erro ao salvar história');
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    if (!newStep.title.trim()) {
      toast.error('Digite um título para o passo');
      return;
    }

    if (editingStep) {
      // Update existing step
      setStory(prev => ({
        ...prev,
        steps: prev.steps.map(s => 
          s.order_number === editingStep.order_number ? { ...newStep, id: s.id } : s
        ),
      }));
    } else {
      // Add new step
      setStory(prev => ({
        ...prev,
        steps: [
          ...prev.steps,
          { ...newStep, order_number: prev.steps.length + 1 },
        ],
      }));
    }

    setNewStep({ order_number: 0, title: '', description: '', image_url: '' });
    setEditingStep(null);
    setShowStepModal(false);
  };

  const removeStep = (orderNumber: number) => {
    setStory(prev => ({
      ...prev,
      steps: prev.steps
        .filter(s => s.order_number !== orderNumber)
        .map((s, idx) => ({ ...s, order_number: idx + 1 })),
    }));
  };

  const openEditStep = (step: StoryStep) => {
    setEditingStep(step);
    setNewStep(step);
    setShowStepModal(true);
  };

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {story.id ? 'Editar História' : 'Nova História Social'}
              </h1>
              <p className="text-muted-foreground">
                Crie histórias personalizadas para seus alunos
              </p>
            </div>
          </div>
          <Button onClick={saveStory} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>

        {/* Story Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Detalhes da História
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={story.title}
                onChange={(e) => setStory({ ...story, title: e.target.value })}
                placeholder="Ex: Como lidar com mudanças"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={story.description}
                onChange={(e) => setStory({ ...story, description: e.target.value })}
                placeholder="Uma breve descrição da história..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={story.category}
                  onValueChange={(value) => setStory({ ...story, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="age_min">Idade Mín.</Label>
                  <Input
                    id="age_min"
                    type="number"
                    min={1}
                    max={18}
                    value={story.age_min}
                    onChange={(e) => setStory({ ...story, age_min: parseInt(e.target.value) || 3 })}
                  />
                </div>
                <div>
                  <Label htmlFor="age_max">Idade Máx.</Label>
                  <Input
                    id="age_max"
                    type="number"
                    min={1}
                    max={18}
                    value={story.age_max}
                    onChange={(e) => setStory({ ...story, age_max: parseInt(e.target.value) || 18 })}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="cover">URL da Capa (opcional)</Label>
              <Input
                id="cover"
                value={story.cover_image_url || ''}
                onChange={(e) => setStory({ ...story, cover_image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Páginas da História
                </CardTitle>
                <CardDescription>
                  Adicione as páginas com texto e imagens
                </CardDescription>
              </div>
              <Dialog open={showStepModal} onOpenChange={(open) => {
                setShowStepModal(open);
                if (!open) {
                  setEditingStep(null);
                  setNewStep({ order_number: 0, title: '', description: '', image_url: '' });
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Página
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingStep ? 'Editar Página' : 'Nova Página'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Título da Página *</Label>
                      <Input
                        value={newStep.title}
                        onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                        placeholder="Ex: Passo 1"
                      />
                    </div>
                    <div>
                      <Label>Texto</Label>
                      <Textarea
                        value={newStep.description}
                        onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                        placeholder="O texto que será lido..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label>URL da Imagem (opcional)</Label>
                      <Input
                        value={newStep.image_url || ''}
                        onChange={(e) => setNewStep({ ...newStep, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowStepModal(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addStep}>
                        {editingStep ? 'Atualizar' : 'Adicionar'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {story.steps.length > 0 ? (
              <div className="space-y-3">
                {story.steps.map((step) => (
                  <div
                    key={step.order_number}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <Badge variant="outline" className="w-8 justify-center">
                      {step.order_number}
                    </Badge>
                    {step.image_url && <Image className="h-5 w-5 text-muted-foreground" />}
                    <div className="flex-1">
                      <p className="font-medium">{step.title}</p>
                      {step.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {step.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditStep(step)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeStep(step.order_number)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma página adicionada ainda
                </p>
                <Button className="mt-4" onClick={() => setShowStepModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Página
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernPageLayout>
  );
}
