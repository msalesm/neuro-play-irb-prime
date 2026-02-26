import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, MapPin, Phone, Shield, Save } from 'lucide-react';

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
  guardian_name: z.string().max(100).optional(),
  guardian_phone: z.string().max(20).optional(),
  guardian_email: z.string().email('Email inválido').max(255).optional().or(z.literal('')),
  address_zipcode: z.string().max(10).optional(),
  address_street: z.string().max(200).optional(),
  address_number: z.string().max(10).optional(),
  address_complement: z.string().max(100).optional(),
  address_neighborhood: z.string().max(100).optional(),
  address_city: z.string().max(100).optional(),
  address_state: z.string().max(2).optional(),
  insurance_name: z.string().max(100).optional(),
  insurance_plan: z.string().max(100).optional(),
  insurance_number: z.string().max(50).optional(),
  insurance_expiry: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditPatientModalProps {
  open: boolean;
  patientId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPatientModal({ open, patientId, onClose, onSuccess }: EditPatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', birth_date: '', gender: '', cpf: '', conditions: [],
      guardian_name: '', guardian_phone: '', guardian_email: '',
      address_zipcode: '', address_street: '', address_number: '',
      address_complement: '', address_neighborhood: '', address_city: '', address_state: '',
      insurance_name: '', insurance_plan: '', insurance_number: '', insurance_expiry: '',
    },
  });

  useEffect(() => {
    if (open && patientId) {
      loadPatientData();
    }
  }, [open, patientId]);

  const loadPatientData = async () => {
    if (!patientId) return;
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;

      const conditionsArray = Array.isArray(data.neurodevelopmental_conditions)
        ? (data.neurodevelopmental_conditions as string[])
        : [];

      form.reset({
        name: data.name || '',
        birth_date: data.birth_date || '',
        gender: (data.gender as 'male' | 'female' | 'other' | '') || '',
        cpf: data.cpf || '',
        conditions: conditionsArray,
        guardian_name: data.guardian_name || '',
        guardian_phone: data.guardian_phone || '',
        guardian_email: data.guardian_email || '',
        address_zipcode: data.address_zipcode || '',
        address_street: data.address_street || '',
        address_number: data.address_number || '',
        address_complement: data.address_complement || '',
        address_neighborhood: data.address_neighborhood || '',
        address_city: data.address_city || '',
        address_state: data.address_state || '',
        insurance_name: data.insurance_name || '',
        insurance_plan: data.insurance_plan || '',
        insurance_number: data.insurance_number || '',
        insurance_expiry: data.insurance_expiry || '',
      });
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast.error('Erro ao carregar dados do paciente');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!patientId) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('children')
        .update({
          name: data.name,
          birth_date: data.birth_date,
          gender: data.gender || null,
          cpf: data.cpf || null,
          neurodevelopmental_conditions: data.conditions || [],
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
        .eq('id', patientId);

      if (error) throw error;

      toast.success('Dados do paciente atualizados com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Erro ao atualizar dados do paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Dados do Paciente</DialogTitle>
          <DialogDescription>
            Atualize os dados cadastrais da criança
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* ===== DADOS DO PACIENTE ===== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Dados do Paciente
                </h3>

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Criança *</FormLabel>
                    <FormControl><Input placeholder="Ex: Maria Silva" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="birth_date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="cpf" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF do Paciente</FormLabel>
                    <FormControl><Input placeholder="000.000.000-00" maxLength={14} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="conditions" render={() => (
                  <FormItem>
                    <div className="mb-2"><FormLabel>Condições Neurodesenvolvimentais</FormLabel></div>
                    <div className="grid grid-cols-1 gap-2">
                      {conditions.map((condition) => (
                        <FormField key={condition.id} control={form.control} name="conditions" render={({ field }) => (
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
                            <FormLabel className="font-normal cursor-pointer">{condition.label}</FormLabel>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Separator />

              {/* ===== RESPONSÁVEL ===== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Responsável
                </h3>

                <FormField control={form.control} name="guardian_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Responsável</FormLabel>
                    <FormControl><Input placeholder="Nome completo do responsável" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="guardian_phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone / WhatsApp</FormLabel>
                      <FormControl><Input type="tel" placeholder="(11) 99999-9999" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="guardian_email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Responsável</FormLabel>
                      <FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* ===== ENDEREÇO ===== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Endereço
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="address_zipcode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl><Input placeholder="00000-000" maxLength={9} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="col-span-2">
                    <FormField control={form.control} name="address_street" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua / Logradouro</FormLabel>
                        <FormControl><Input placeholder="Rua Exemplo" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="address_number" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl><Input placeholder="123" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="col-span-2">
                    <FormField control={form.control} name="address_complement" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl><Input placeholder="Apt 101, Bloco A" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="address_neighborhood" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl><Input placeholder="Bairro" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="address_city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl><Input placeholder="Cidade" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="address_state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brazilianStates.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* ===== CONVÊNIO ===== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Convênio / Plano de Saúde
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="insurance_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Convênio</FormLabel>
                      <FormControl><Input placeholder="Ex: Unimed, Amil" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="insurance_plan" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano</FormLabel>
                      <FormControl><Input placeholder="Ex: Ouro, Prata" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="insurance_number" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº da Carteirinha</FormLabel>
                      <FormControl><Input placeholder="Número do cartão" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="insurance_expiry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validade</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
