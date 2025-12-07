import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MessageSquare, Send, Plus, Loader2, Clock, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const messageSchema = z.object({
  subject: z.string().min(3, 'Assunto muito curto').max(100),
  message: z.string().min(10, 'Mensagem muito curta').max(2000),
  priority: z.enum(['low', 'normal', 'high']),
  child_id: z.string().uuid('Selecione um aluno'),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface Communication {
  id: string;
  subject: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  child_id: string;
  child_name?: string;
}

interface Student {
  id: string;
  name: string;
}

interface ParentCommunicationPanelProps {
  classId?: string;
  students?: Student[];
}

export function ParentCommunicationPanel({ classId, students = [] }: ParentCommunicationPanelProps) {
  const { user } = useAuth();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      subject: '',
      message: '',
      priority: 'normal',
      child_id: '',
    },
  });

  useEffect(() => {
    if (user) {
      loadCommunications();
    }
  }, [user, classId]);

  const loadCommunications = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('school_communications')
        .select('*')
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with child names
      const enriched = await Promise.all(
        (data || []).map(async (comm) => {
          const { data: childData } = await supabase
            .from('children')
            .select('name')
            .eq('id', comm.child_id)
            .single();

          return {
            ...comm,
            child_name: childData?.name || 'Aluno',
          };
        })
      );

      setCommunications(enriched);
    } catch (error) {
      console.error('Error loading communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MessageFormData) => {
    if (!user) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('school_communications')
        .insert({
          sender_id: user.id,
          sender_role: 'teacher',
          recipient_role: 'parent',
          child_id: data.child_id,
          subject: data.subject,
          message: data.message,
          priority: data.priority,
        });

      if (error) throw error;

      toast.success('Mensagem enviada para os pais!');
      setShowModal(false);
      form.reset();
      loadCommunications();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorities: Record<string, { label: string; className: string }> = {
      low: { label: 'Baixa', className: 'bg-gray-500/10 text-gray-700' },
      normal: { label: 'Normal', className: 'bg-blue-500/10 text-blue-700' },
      high: { label: 'Urgente', className: 'bg-red-500/10 text-red-700' },
    };
    const p = priorities[priority] || priorities.normal;
    return <Badge className={p.className}>{p.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comunicação com Pais
            </CardTitle>
            <CardDescription>Envie mensagens para responsáveis dos alunos</CardDescription>
          </div>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Enviar Mensagem aos Pais</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="child_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aluno *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o aluno" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assunto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Assunto da mensagem" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escreva sua mensagem..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Enviar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : communications.length > 0 ? (
          <div className="space-y-3">
            {communications.map((comm) => (
              <div key={comm.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{comm.child_name}</span>
                    {getPriorityBadge(comm.priority)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(comm.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <h4 className="font-medium text-sm">{comm.subject}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{comm.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma mensagem enviada ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
