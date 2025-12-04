import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, UserPlus, Link2, Search, Send, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const conditions = [
  { id: 'TEA', label: 'TEA (Transtorno do Espectro Autista)' },
  { id: 'TDAH', label: 'TDAH (Déficit de Atenção e Hiperatividade)' },
  { id: 'Dislexia', label: 'Dislexia' },
  { id: 'Discalculia', label: 'Discalculia' },
  { id: 'DLD', label: 'DLD (Transtorno do Desenvolvimento da Linguagem)' },
];

const newChildSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  date_of_birth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 18;
  }, 'Idade deve estar entre 0 e 18 anos'),
  conditions: z.array(z.string()).optional(),
});

const linkChildSchema = z.object({
  searchCode: z.string().min(2, 'Digite pelo menos 2 caracteres para buscar'),
});

const inviteSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  date_of_birth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 18;
  }, 'Idade deve estar entre 0 e 18 anos'),
  conditions: z.array(z.string()).optional(),
  invite_type: z.enum(['parent', 'child']),
});

type NewChildFormData = z.infer<typeof newChildSchema>;
type LinkChildFormData = z.infer<typeof linkChildSchema>;
type InviteFormData = z.infer<typeof inviteSchema>;

interface ChildToLink {
  id: string;
  name: string;
  age: number;
  conditions: string[];
}

interface AddChildModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddChildModal({ open, onClose, onSuccess }: AddChildModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [searching, setSearching] = useState(false);
  const [foundChild, setFoundChild] = useState<ChildToLink | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const newChildForm = useForm<NewChildFormData>({
    resolver: zodResolver(newChildSchema),
    defaultValues: {
      name: '',
      date_of_birth: '',
      conditions: [],
    },
  });

  const linkChildForm = useForm<LinkChildFormData>({
    resolver: zodResolver(linkChildSchema),
    defaultValues: {
      searchCode: '',
    },
  });

  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: '',
      date_of_birth: '',
      conditions: [],
      invite_type: 'child',
    },
  });

  const onSubmitNewChild = async (data: NewChildFormData) => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar um filho');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('child_profiles')
        .insert({
          name: data.name,
          date_of_birth: data.date_of_birth,
          diagnosed_conditions: data.conditions || [],
          parent_user_id: user.id,
        });

      if (error) throw error;

      toast.success('Filho cadastrado com sucesso!');
      newChildForm.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating child profile:', error);
      toast.error('Erro ao cadastrar filho. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const searchChild = async (data: LinkChildFormData) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      setSearching(true);
      setFoundChild(null);

      const searchTerm = data.searchCode.trim();

      // Search by name in children table (therapist-created)
      const { data: childData, error } = await supabase
        .from('children')
        .select('id, name, birth_date, neurodevelopmental_conditions')
        .ilike('name', `%${searchTerm}%`)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (childData) {
        const birthDate = new Date(childData.birth_date);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
        const conditions: string[] = Array.isArray(childData.neurodevelopmental_conditions)
          ? childData.neurodevelopmental_conditions.filter((c): c is string => typeof c === 'string')
          : [];

        setFoundChild({
          id: childData.id,
          name: childData.name,
          age,
          conditions,
        });
      } else {
        toast.error('Criança não encontrada. A criança deve estar cadastrada por um terapeuta e ainda não vinculada a outro responsável.');
      }
    } catch (error: any) {
      console.error('Error searching child:', error);
      toast.error('Erro ao buscar. Verifique o nome e tente novamente.');
    } finally {
      setSearching(false);
    }
  };

  const linkChild = async () => {
    if (!user || !foundChild) {
      toast.error('Erro ao vincular criança');
      return;
    }

    try {
      setLoading(true);

      // Check if already linked
      const { data: existingLink } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_user_id', user.id)
        .eq('name', foundChild.name)
        .maybeSingle();

      if (existingLink) {
        toast.error('Esta criança já está vinculada ao seu perfil');
        return;
      }

      // Create child_profiles entry
      const { error: profileError } = await supabase
        .from('child_profiles')
        .insert({
          name: foundChild.name,
          date_of_birth: new Date().toISOString().split('T')[0], // Will be updated
          diagnosed_conditions: foundChild.conditions,
          parent_user_id: user.id,
        });

      if (profileError) throw profileError;

      // Update children table with parent_id
      const { error: childError } = await supabase
        .from('children')
        .update({ parent_id: user.id })
        .eq('id', foundChild.id);

      if (childError) throw childError;

      toast.success(`${foundChild.name} vinculado(a) com sucesso!`);
      linkChildForm.reset();
      setFoundChild(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error linking child:', error);
      toast.error('Erro ao vincular criança. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitInvite = async (data: InviteFormData) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um convite');
      return;
    }

    try {
      setLoading(true);

      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert({
          inviter_id: user.id,
          invite_type: data.invite_type,
          child_name: data.name,
          child_birth_date: data.date_of_birth,
          child_conditions: data.conditions || [],
        })
        .select('invite_code')
        .single();

      if (error) throw error;

      setGeneratedCode(invitation.invite_code);
      toast.success('Código de convite gerado com sucesso!');
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast.error('Erro ao criar convite. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    newChildForm.reset();
    linkChildForm.reset();
    inviteForm.reset();
    setFoundChild(null);
    setGeneratedCode(null);
    setCopied(false);
    setActiveTab('new');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Adicionar Filho
          </DialogTitle>
          <DialogDescription>
            Cadastre, vincule ou convide para a plataforma
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new" className="flex items-center gap-1 text-xs sm:text-sm">
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Novo</span>
              <span className="sm:hidden">Novo</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-1 text-xs sm:text-sm">
              <Link2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Vincular</span>
              <span className="sm:hidden">Vincular</span>
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center gap-1 text-xs sm:text-sm">
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Convidar</span>
              <span className="sm:hidden">Convidar</span>
            </TabsTrigger>
          </TabsList>

          {/* New Child Tab */}
          <TabsContent value="new" className="mt-4 flex-1 overflow-y-auto pr-1">
            <Form {...newChildForm}>
              <form onSubmit={newChildForm.handleSubmit(onSubmitNewChild)} className="space-y-6 pb-4">
                <FormField
                  control={newChildForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Filho *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João Pedro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={newChildForm.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={newChildForm.control}
                  name="conditions"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Condições (opcional)</FormLabel>
                        <p className="text-sm text-muted-foreground mt-1">
                          Selecione se houver diagnóstico confirmado
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {conditions.map((condition) => (
                          <FormField
                            key={condition.id}
                            control={newChildForm.control}
                            name="conditions"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(condition.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, condition.id]);
                                      } else {
                                        field.onChange(current.filter((v) => v !== condition.id));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1">
                                  {condition.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar Filho
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Link Existing Child Tab */}
          <TabsContent value="link" className="mt-4 flex-1 overflow-y-auto pr-1">
            <div className="space-y-6 pb-4">
              <Form {...linkChildForm}>
                <form onSubmit={linkChildForm.handleSubmit(searchChild)} className="space-y-4">
                  <FormField
                    control={linkChildForm.control}
                    name="searchCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Criança</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              placeholder="Digite o nome da criança" 
                              {...field} 
                            />
                          </FormControl>
                          <Button type="submit" disabled={searching}>
                            {searching ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Busque pelo nome da criança cadastrada pelo terapeuta
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>

              {foundChild && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{foundChild.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {foundChild.age} anos
                      </p>
                      {foundChild.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {foundChild.conditions.map((c) => (
                            <span 
                              key={c} 
                              className="text-xs bg-secondary px-2 py-1 rounded"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      <Button 
                        onClick={linkChild} 
                        className="w-full mt-4"
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Link2 className="mr-2 h-4 w-4" />
                        Vincular ao Meu Perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Invite Tab */}
          <TabsContent value="invite" className="mt-4 flex-1 overflow-y-auto pr-1">
            {generatedCode ? (
              <div className="space-y-6 pb-4">
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Código de Convite
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-mono font-bold tracking-wider text-primary">
                        {generatedCode}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={copyCode}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Compartilhe este código com quem deseja convidar. Válido por 7 dias.
                    </p>
                  </CardContent>
                </Card>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setGeneratedCode(null);
                    inviteForm.reset();
                  }}
                >
                  Criar Novo Convite
                </Button>
              </div>
            ) : (
              <Form {...inviteForm}>
                <form onSubmit={inviteForm.handleSubmit(onSubmitInvite)} className="space-y-6 pb-4">
                  <FormField
                    control={inviteForm.control}
                    name="invite_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Convite</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={field.value === 'child' ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => field.onChange('child')}
                          >
                            Filho(a)
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'parent' ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => field.onChange('parent')}
                          >
                            Responsável
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {field.value === 'child' 
                            ? 'Convide seu filho para usar a plataforma'
                            : 'Convide outro responsável para acompanhar'}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={inviteForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Criança *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João Pedro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={inviteForm.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={inviteForm.control}
                    name="conditions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Condições (opcional)</FormLabel>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {conditions.map((condition) => (
                            <FormField
                              key={condition.id}
                              control={inviteForm.control}
                              name="conditions"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(condition.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, condition.id]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== condition.id));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex-1 text-sm">
                                    {condition.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="mr-2 h-4 w-4" />
                    Gerar Código de Convite
                  </Button>
                </form>
              </Form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
