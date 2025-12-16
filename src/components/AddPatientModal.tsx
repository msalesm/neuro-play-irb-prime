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
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Copy, Check, MessageCircle, Link2, UserPlus } from 'lucide-react';

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
  parent_phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface InviteData {
  code: string;
  childName: string;
  link: string;
}

export function AddPatientModal({ open, onClose, onSuccess }: AddPatientModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      birth_date: '',
      gender: '',
      conditions: [],
      parent_phone: '',
    },
  });

  const generateInviteLink = (code: string) => {
    return `${window.location.origin}/aceitar-convite?code=${code}`;
  };

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
          parent_id: null,
        })
        .select()
        .single();

      if (childError) throw childError;

      // Also create in child_profiles for game sessions
      const { error: profileError } = await supabase
        .from('child_profiles')
        .insert({
          parent_user_id: user.id,
          name: data.name,
          date_of_birth: data.birth_date,
          diagnosed_conditions: data.conditions || [],
        });

      if (profileError) {
        console.warn('Could not create child_profiles entry:', profileError);
      }

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

      // Create invitation for parents
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          inviter_id: user.id,
          invite_type: 'child',
          child_name: data.name,
          child_birth_date: data.birth_date,
          child_conditions: data.conditions || [],
        })
        .select('invite_code')
        .single();

      if (inviteError) {
        console.warn('Could not create invitation:', inviteError);
      }

      if (invitation) {
        const link = generateInviteLink(invitation.invite_code);
        setInviteData({
          code: invitation.invite_code,
          childName: data.name,
          link,
        });
      }

      toast.success('Paciente cadastrado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('Erro ao cadastrar paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (inviteData) {
      await navigator.clipboard.writeText(inviteData.link);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWhatsApp = () => {
    if (inviteData) {
      const message = encodeURIComponent(
        `Olá! Você foi convidado(a) para acompanhar o progresso de ${inviteData.childName} na plataforma Neuro IRB Prime.\n\nClique no link para aceitar o convite e criar sua conta:\n${inviteData.link}\n\nCódigo de convite: ${inviteData.code}`
      );
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  const handleClose = () => {
    form.reset();
    setInviteData(null);
    setCopied(false);
    onClose();
  };

  const handleNewPatient = () => {
    form.reset();
    setInviteData(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {inviteData ? 'Convite para os Pais' : 'Cadastrar Novo Paciente'}
          </DialogTitle>
          <DialogDescription>
            {inviteData 
              ? 'Compartilhe o link abaixo com os pais para que eles possam acompanhar o progresso'
              : 'Preencha os dados da criança para adicionar ao seu painel clínico'
            }
          </DialogDescription>
        </DialogHeader>

        {inviteData ? (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {inviteData.childName} cadastrado(a)!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Envie o convite para os pais
                  </p>
                </div>

                {/* Link de convite */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link de convite:</label>
                  <div className="flex gap-2">
                    <Input 
                      value={inviteData.link} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Código manual */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código do convite:</label>
                  <div className="p-3 bg-background rounded-lg border text-center">
                    <code className="text-2xl font-bold tracking-wider text-primary">
                      {inviteData.code.toUpperCase()}
                    </code>
                  </div>
                </div>

                {/* Botões de compartilhamento */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={copyToClipboard}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Copiar Link
                  </Button>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={shareViaWhatsApp}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={handleNewPatient}>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
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

              {/* Telefone dos Pais (opcional) */}
              <FormField
                control={form.control}
                name="parent_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp dos Pais (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="(11) 99999-9999" 
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Após cadastrar, você receberá um link para enviar via WhatsApp
                    </p>
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
                  Cadastrar Paciente
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
