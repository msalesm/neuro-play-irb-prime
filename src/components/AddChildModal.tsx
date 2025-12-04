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
import { Loader2, UserPlus } from 'lucide-react';

const conditions = [
  { id: 'TEA', label: 'TEA (Transtorno do Espectro Autista)' },
  { id: 'TDAH', label: 'TDAH (Déficit de Atenção e Hiperatividade)' },
  { id: 'Dislexia', label: 'Dislexia' },
  { id: 'Discalculia', label: 'Discalculia' },
  { id: 'DLD', label: 'DLD (Transtorno do Desenvolvimento da Linguagem)' },
];

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  date_of_birth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 18;
  }, 'Idade deve estar entre 0 e 18 anos'),
  conditions: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddChildModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddChildModal({ open, onClose, onSuccess }: AddChildModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      date_of_birth: '',
      conditions: [],
    },
  });

  const onSubmit = async (data: FormData) => {
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
      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding child:', error);
      toast.error(error?.message || 'Erro ao cadastrar filho. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Cadastrar Filho
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do seu filho para começar a acompanhar o desenvolvimento
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
              control={form.control}
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
              control={form.control}
              name="conditions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Condições (opcional)</FormLabel>
                    <p className="text-sm text-muted-foreground mt-1">
                      Selecione se houver diagnóstico confirmado
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {conditions.map((condition) => (
                      <FormField
                        key={condition.id}
                        control={form.control}
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

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
