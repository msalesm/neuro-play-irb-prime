import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, GraduationCap, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Props {
  childId: string;
  childName?: string;
  /** Hint of who is sending; if absent we infer from role. */
  asRole?: 'teacher' | 'parent';
}

/**
 * Lightweight thread of notes/observations between teacher and parents
 * about a specific student. Backed by `school_communications`.
 */
export function ParentTeacherNotes({ childId, childName, asRole }: Props) {
  const { user } = useAuth();
  const { isTeacher, isParent, isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const senderRole: 'teacher' | 'parent' =
    asRole ?? (isTeacher || isAdmin ? 'teacher' : 'parent');
  const recipientRole = senderRole === 'teacher' ? 'parent' : 'teacher';

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['parent-teacher-notes', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_communications')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!childId,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [notes.length]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Não autenticado');
      if (!message.trim()) throw new Error('Escreva uma mensagem');
      const { error } = await supabase.from('school_communications').insert({
        child_id: childId,
        sender_id: user.id,
        sender_role: senderRole,
        recipient_role: recipientRole,
        subject: senderRole === 'teacher' ? 'Observação do professor' : 'Mensagem da família',
        message: message.trim(),
        priority: 'normal',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['parent-teacher-notes', childId] });
      toast.success('Mensagem enviada');
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao enviar'),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Conversa com {senderRole === 'teacher' ? 'a família' : 'o(a) professor(a)'}
          {childName && <span className="text-xs font-normal text-muted-foreground truncate">· {childName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div ref={scrollRef} className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Carregando...</p>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Nenhuma mensagem ainda. Comece a conversa!
            </div>
          ) : (
            notes.map((n: any) => {
              const mine = n.sender_id === user?.id;
              const isTeacherMsg = n.sender_role === 'teacher';
              const Icon = isTeacherMsg ? GraduationCap : Heart;
              return (
                <div
                  key={n.id}
                  className={cn('flex gap-2', mine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                      mine
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 opacity-80">
                      <Icon className="h-3 w-3" />
                      <span className="text-[10px] font-medium uppercase tracking-wide">
                        {isTeacherMsg ? 'Professor(a)' : 'Família'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{n.message}</p>
                    <p className="text-[10px] mt-1 opacity-60">
                      {format(new Date(n.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex gap-2 items-end pt-2 border-t">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={senderRole === 'teacher' ? 'Escreva uma observação para a família...' : 'Escreva para o(a) professor(a)...'}
            rows={2}
            maxLength={1000}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                sendMutation.mutate();
              }
            }}
          />
          <Button
            size="icon"
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending || !message.trim()}
            className="h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Use Ctrl/Cmd + Enter para enviar
        </p>
      </CardContent>
    </Card>
  );
}