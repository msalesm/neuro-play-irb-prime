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
import { Loader2, UserPlus, Link2, Search } from 'lucide-react';
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
  searchCode: z.string().min(1, 'Informe o código ou email'),
});

type NewChildFormData = z.infer<typeof newChildSchema>;
type LinkChildFormData = z.infer<typeof linkChildSchema>;

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

  const onSubmitNewChild = async (data: NewChildFormData) => {
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    try {
      setLoading(true);

      // Create child profile for parent
      const { error } = await supabase
        .from('child_profiles')
        .insert({
          parent_user_id: user.id,
          name: data.name,
          date_of_birth: data.date_of_birth,
          diagnosed_conditions: data.conditions || [],
        });

      if (error) throw error;

      toast.success('Filho cadastrado com sucesso!');
      newChildForm.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding child:', error);
      toast.error(error?.message || 'Erro ao cadastrar filho. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const searchChild = async (data: LinkChildFormData) => {
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    try {
      setSearching(true);
      setFoundChild(null);

      const searchTerm = data.searchCode.trim();

      // Search by ID or by name in children table (therapist-created)
      const { data: childData, error } = await supabase
        .from('children')
        .select('id, name, birth_date, neurodevelopmental_conditions')
        .or(`id.eq.${searchTerm},name.ilike.%${searchTerm}%`)
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
        toast.error('Nenhuma criança encontrada com esse código/nome');
      }
    } catch (error: any) {
      console.error('Error searching child:', error);
      toast.error('Erro ao buscar. Verifique o código e tente novamente.');
    } finally {
      setSearching(false);
    }
  };

  const linkChild = async () => {
    if (!user || !foundChild) return;

    try {
      setLoading(true);

      // Check if already linked
      const { data: existingAccess } = await supabase
        .from('child_access')
        .select('id')
        .eq('child_id', foundChild.id)
        .eq('professional_id', user.id)
        .maybeSingle();

      if (existingAccess) {
        toast.error('Você já tem acesso a este perfil');
        return;
      }

      // Create child_profiles entry for parent
      const { error: profileError } = await supabase
        .from('child_profiles')
        .insert({
          parent_user_id: user.id,
          name: foundChild.name,
          date_of_birth: new Date(new Date().getFullYear() - foundChild.age, 0, 1).toISOString().split('T')[0],
          diagnosed_conditions: foundChild.conditions,
        });

      if (profileError) {
        // Check if profile already exists
        if (profileError.code === '23505') {
          toast.info('Perfil já vinculado à sua conta');
        } else {
          throw profileError;
        }
      }

      // Also update children table to set parent_id
      await supabase
        .from('children')
        .update({ parent_id: user.id })
        .eq('id', foundChild.id);

      toast.success(`${foundChild.name} vinculado com sucesso!`);
      linkChildForm.reset();
      setFoundChild(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error linking child:', error);
      toast.error(error?.message || 'Erro ao vincular. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    newChildForm.reset();
    linkChildForm.reset();
    setFoundChild(null);
    setActiveTab('new');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Adicionar Filho
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo perfil ou vincule uma criança já registrada
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Novo Cadastro
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Vincular Existente
            </TabsTrigger>
          </TabsList>

          {/* New Child Tab */}
          <TabsContent value="new" className="mt-4">
            <Form {...newChildForm}>
              <form onSubmit={newChildForm.handleSubmit(onSubmitNewChild)} className="space-y-6">
                {/* Nome */}
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

                {/* Data de Nascimento */}
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

                {/* Condições */}
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
                              <FormItem
                                className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(condition.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), condition.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== condition.id)
                                          );
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

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cadastrar
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Link Existing Child Tab */}
          <TabsContent value="link" className="mt-4">
            <div className="space-y-6">
              <Form {...linkChildForm}>
                <form onSubmit={linkChildForm.handleSubmit(searchChild)} className="space-y-4">
                  <FormField
                    control={linkChildForm.control}
                    name="searchCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código ou Nome da Criança</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              placeholder="Digite o código fornecido pelo terapeuta ou nome" 
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
                          Use o código ou ID fornecido pelo terapeuta da criança
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>

              {/* Found Child Preview */}
              {foundChild && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{foundChild.name}</h4>
                        <p className="text-sm text-muted-foreground">{foundChild.age} anos</p>
                        {foundChild.conditions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {foundChild.conditions.map((c, idx) => (
                              <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button onClick={linkChild} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Vincular
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!foundChild && (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Busque pelo código ou nome para vincular uma criança já cadastrada por um terapeuta
                  </p>
                </div>
              )}

              {/* Cancel Button */}
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
