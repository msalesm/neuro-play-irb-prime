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
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Copy, Check, MessageCircle, Link2, UserPlus, MapPin, Phone, Shield } from 'lucide-react';

const conditions = [
  { id: 'TEA', label: 'TEA (Transtorno do Espectro Autista)' },
  { id: 'TDAH', label: 'TDAH (Transtorno do Déficit de Atenção com Hiperatividade)' },
  { id: 'Dislexia', label: 'Dislexia' },
  { id: 'Discalculia', label: 'Discalculia' },
  { id: 'DLD', label: 'DLD (Transtorno do Desenvolvimento da Linguagem)' },
];

const brazilianStates = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
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
  cpf: z.string().max(14, 'CPF inválido').optional(),
  conditions: z.array(z.string()).optional(),
  // Guardian
  guardian_name: z.string().max(100, 'Nome muito longo').optional(),
  guardian_phone: z.string().max(20, 'Telefone muito longo').optional(),
  guardian_email: z.string().email('Email inválido').max(255).optional().or(z.literal('')),
  // Address
  address_zipcode: z.string().max(10, 'CEP inválido').optional(),
  address_street: z.string().max(200, 'Endereço muito longo').optional(),
  address_number: z.string().max(10, 'Número muito longo').optional(),
  address_complement: z.string().max(100, 'Complemento muito longo').optional(),
  address_neighborhood: z.string().max(100, 'Bairro muito longo').optional(),
  address_city: z.string().max(100, 'Cidade muito longa').optional(),
  address_state: z.string().max(2).optional(),
  // Insurance
  insurance_name: z.string().max(100, 'Nome do convênio muito longo').optional(),
  insurance_plan: z.string().max(100, 'Plano muito longo').optional(),
  insurance_number: z.string().max(50, 'Número da carteira muito longo').optional(),
  insurance_expiry: z.string().optional(),
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
      cpf: '',
      conditions: [],
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      address_zipcode: '',
      address_street: '',
      address_number: '',
      address_complement: '',
      address_neighborhood: '',
      address_city: '',
      address_state: '',
      insurance_name: '',
      insurance_plan: '',
      insurance_number: '',
      insurance_expiry: '',
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
          cpf: data.cpf || null,
          guardian_name: data.guardian_name || null,
          guardian_phone: data.guardian_phone || null,
          guardian_email: data.guardian_email || null,
          address_street: data.address_street || null,
          address_number: data.address_number || null,
          address_complement: data.address_complement || null,
          address_neighborhood: data.address_neighborhood || null,
          address_city: data.address_city || null,
          address_state: data.address_state || null,
          address_zipcode: data.address_zipcode || null,
          insurance_name: data.insurance_name || null,
          insurance_plan: data.insurance_plan || null,
          insurance_number: data.insurance_number || null,
          insurance_expiry: data.insurance_expiry || null,
        } as any)
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
              : 'Preencha os dados completos da criança para adicionar ao seu painel clínico'
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Código do convite:</label>
                  <div className="p-3 bg-background rounded-lg border text-center">
                    <code className="text-2xl font-bold tracking-wider text-primary">
                      {inviteData.code.toUpperCase()}
                    </code>
                  </div>
                </div>

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
              {/* ===== DADOS DO PACIENTE ===== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Dados do Paciente
                </h3>

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

                <div className="grid grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
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
                </div>

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF do Paciente</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" maxLength={14} {...field} />
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
                      <div className="mb-2">
                        <FormLabel>Condições Neurodesenvolvimentais</FormLabel>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {conditions.map((condition) => (
                          <FormField
                            key={condition.id}
                            control={form.control}
                            name="conditions"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(condition.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), condition.id])
                                        : field.onChange(field.value?.filter((v) => v !== condition.id));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
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
              </div>

              <Separator />

              {/* ===== RESPONSÁVEL ===== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Responsável
                </h3>

                <FormField
                  control={form.control}
                  name="guardian_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo do responsável" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guardian_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone / WhatsApp</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardian_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email do Responsável</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* ===== ENDEREÇO ===== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address_zipcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" maxLength={9} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="address_street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rua / Logradouro</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua Exemplo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="address_complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt 101, Bloco A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address_neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brazilianStates.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* ===== CONVÊNIO ===== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Convênio / Plano de Saúde
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insurance_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Convênio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Unimed, Amil, SulAmérica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="insurance_plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ouro, Prata, Básico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insurance_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº da Carteirinha</FormLabel>
                        <FormControl>
                          <Input placeholder="Número do cartão" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="insurance_expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validade</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
