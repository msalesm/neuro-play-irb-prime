import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, ListChecks, Gamepad2, Route, Image, 
  Plus, Edit, Trash2, Search, Upload, Eye, Save,
  FileText, Volume2, Folder
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Story {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_active: boolean;
  age_min: number;
  age_max: number;
  created_at: string;
  steps_count?: number;
}

interface ContentItem {
  id: string;
  name: string;
  type: string;
  category: string | null;
  file_url: string;
  is_public: boolean;
  created_at: string;
}

export default function ContentManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stories');
  const [stories, setStories] = useState<Story[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [trails, setTrails] = useState<any[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form states
  const [storyForm, setStoryForm] = useState({
    title: '',
    description: '',
    category: 'rotinas',
    age_min: 3,
    age_max: 12,
    is_active: true
  });

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'stories':
          const { data: storiesData } = await supabase
            .from('social_stories')
            .select('*')
            .order('created_at', { ascending: false });
          setStories(storiesData || []);
          break;
        case 'routines':
          const { data: routinesData } = await supabase
            .from('routines')
            .select('*')
            .order('created_at', { ascending: false });
          setRoutines(routinesData || []);
          break;
        case 'trails':
          const { data: trailsData } = await supabase
            .from('development_trails')
            .select('*')
            .order('created_at', { ascending: false });
          setTrails(trailsData || []);
          break;
        case 'media':
          const { data: mediaData } = await supabase
            .from('content_library')
            .select('*')
            .order('created_at', { ascending: false });
          setMediaLibrary(mediaData || []);
          break;
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async () => {
    try {
      const { error } = await supabase
        .from('social_stories')
        .insert({
          ...storyForm,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('História criada com sucesso!');
      setShowCreateDialog(false);
      setStoryForm({ title: '', description: '', category: 'rotinas', age_min: 3, age_max: 12, is_active: true });
      loadContent();
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Erro ao criar história');
    }
  };

  const handleDeleteItem = async (table: string, id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      toast.success('Item excluído com sucesso!');
      loadContent();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const handleToggleActive = async (table: string, id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentValue })
        .eq('id', id);

      if (error) throw error;
      loadContent();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRoutines = routines.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModernPageLayout 
      title="Gerenciador de Conteúdo" 
      subtitle="CMS interno para administradores"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="stories" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Histórias
              </TabsTrigger>
              <TabsTrigger value="routines" className="gap-2">
                <ListChecks className="w-4 h-4" />
                Rotinas
              </TabsTrigger>
              <TabsTrigger value="trails" className="gap-2">
                <Route className="w-4 h-4" />
                Trilhas
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2">
                <Image className="w-4 h-4" />
                Mídia
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Novo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {activeTab === 'stories' && 'Nova História Social'}
                      {activeTab === 'routines' && 'Nova Rotina'}
                      {activeTab === 'trails' && 'Nova Trilha'}
                      {activeTab === 'media' && 'Upload de Mídia'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  {activeTab === 'stories' && (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input 
                          value={storyForm.title}
                          onChange={(e) => setStoryForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Título da história"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea 
                          value={storyForm.description}
                          onChange={(e) => setStoryForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descrição breve..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select 
                            value={storyForm.category}
                            onValueChange={(v) => setStoryForm(prev => ({ ...prev, category: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rotinas">Rotinas</SelectItem>
                              <SelectItem value="emocoes">Emoções</SelectItem>
                              <SelectItem value="social">Social</SelectItem>
                              <SelectItem value="saude">Saúde</SelectItem>
                              <SelectItem value="escola">Escola</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Idade Mínima</Label>
                          <Input 
                            type="number"
                            value={storyForm.age_min}
                            onChange={(e) => setStoryForm(prev => ({ ...prev, age_min: parseInt(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Ativo</Label>
                        <Switch 
                          checked={storyForm.is_active}
                          onCheckedChange={(v) => setStoryForm(prev => ({ ...prev, is_active: v }))}
                        />
                      </div>
                      <Button onClick={handleCreateStory} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Criar História
                      </Button>
                    </div>
                  )}

                  {activeTab === 'media' && (
                    <div className="space-y-4 py-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Arraste arquivos ou clique para fazer upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, MP3, MP4 (máx. 10MB)
                        </p>
                        <input type="file" className="hidden" />
                        <Button variant="outline" className="mt-4">
                          Selecionar Arquivo
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-4">
            <div className="grid gap-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredStories.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Nenhuma história encontrada
                  </CardContent>
                </Card>
              ) : (
                filteredStories.map((story) => (
                  <Card key={story.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{story.title}</h3>
                              <Badge variant={story.is_active ? 'default' : 'secondary'}>
                                {story.is_active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {story.description?.substring(0, 80)}...
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{story.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                Idade: {story.age_min}-{story.age_max} anos
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleActive('social_stories', story.id, story.is_active)}
                          >
                            <Switch checked={story.is_active} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDeleteItem('social_stories', story.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Routines Tab */}
          <TabsContent value="routines" className="space-y-4">
            <div className="grid gap-4">
              {filteredRoutines.map((routine) => (
                <Card key={routine.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <ListChecks className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{routine.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {routine.description?.substring(0, 80)}...
                          </p>
                          <Badge variant="outline" className="mt-1">{routine.routine_type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDeleteItem('routines', routine.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trails Tab */}
          <TabsContent value="trails" className="space-y-4">
            <div className="grid gap-4">
              {trails.map((trail) => (
                <Card key={trail.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Route className="w-8 h-8 text-purple-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{trail.name}</h3>
                            <Badge variant={trail.is_active ? 'default' : 'secondary'}>
                              {trail.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            {trail.is_premium && <Badge variant="outline">Premium</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {trail.description?.substring(0, 80)}...
                          </p>
                          <span className="text-xs text-muted-foreground">
                            Duração: ~{trail.estimated_duration_days} dias
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDeleteItem('development_trails', trail.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Media Library Tab */}
          <TabsContent value="media" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaLibrary.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {item.type === 'image' ? (
                      <img src={item.file_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : item.type === 'audio' ? (
                      <Volume2 className="w-12 h-12 text-muted-foreground" />
                    ) : (
                      <FileText className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </CardContent>
                </Card>
              ))}
              {mediaLibrary.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Biblioteca de mídia vazia</p>
                    <p className="text-sm">Faça upload de imagens, ícones e áudios</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ModernPageLayout>
  );
}
