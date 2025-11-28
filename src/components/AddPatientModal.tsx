import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const conditions = [
  { id: 'TEA', label: 'TEA (Transtorno do Espectro Autista)' },
  { id: 'TDAH', label: 'TDAH (Transtorno do Déficit de Atenção com Hiperatividade)' },
  { id: 'Dislexia', label: 'Dislexia' },
  { id: 'Discalculia', label: 'Discalculia' },
  { id: 'DLD', label: 'DLD (Transtorno do Desenvolvimento da Linguagem)' },
];

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  birth_date: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 18;
  }, 'Idade deve estar entre 0 e 18 anos'),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  conditions: z.array(z.string()).optional(),
  parent_email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPatientModal({ open, onClose, onSuccess }: AddPatientModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      birth_date: '',
      gender: '',
      conditions: [],
      parent_email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    try {
      setLoading(true);

      // Create child profile
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          name: data.name,
          birth_date: data.birth_date,
          gender: data.gender || null,
          neurodevelopmental_conditions: data.conditions || [],
          parent_id: null, // Will be set when parent accepts invite
        })
        .select()
        .single();

      if (childError) throw childError;

      // Grant therapist access to child
      const { error: accessError } = await supabase
        .from('child_access')
        .insert({
          child_id: childData.id,
          professional_id: user.id,
          granted_by: user.id,
          access_level: 'full',
        });

      if (accessError) throw accessError;

      toast.success('Paciente cadastrado com sucesso!');
      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('Erro ao cadastrar paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
          <DialogDescription>
            Preencha os dados da criança para adicionar ao seu painel clínico
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Criança *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Maria Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data de Nascimento */}
            <FormField
              control={form.control}
              name="birth_date"
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

            {/* Gênero */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Condições Neurodevelopmentais */}
            <FormField
              control={form.control}
              name="conditions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Condições Neurodevelopmentais</FormLabel>
                  </div>
                  {conditions.map((condition) => (
                    <FormField
                      key={condition.id}
                      control={form.control}
                      name="conditions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={condition.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
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
                            <FormLabel className="font-normal cursor-pointer">
                              {condition.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email dos Pais (opcional) */}
            <FormField
              control={form.control}
              name="parent_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email dos Pais (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="pais@exemplo.com" 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Os pais receberão um convite para acessar a plataforma (em breve)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar Paciente
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
