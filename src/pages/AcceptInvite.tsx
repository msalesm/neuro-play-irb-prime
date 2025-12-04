import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Gift, Check, UserPlus, ArrowLeft } from 'lucide-react';

const inviteCodeSchema = z.object({
  code: z.string().min(8, 'Código deve ter 8 caracteres').max(8, 'Código deve ter 8 caracteres'),
});

type InviteCodeForm = z.infer<typeof inviteCodeSchema>;

interface InvitationData {
  id: string;
  invite_code: string;
  invite_type: string;
  child_name: string | null;
  child_birth_date: string | null;
  child_conditions: string[];
  inviter_id: string;
}

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [accepted, setAccepted] = useState(false);

  const initialCode = searchParams.get('code') || '';

  const form = useForm<InviteCodeForm>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      code: initialCode,
    },
  });

  const searchInvitation = async (data: InviteCodeForm) => {
    try {
      setLoading(true);
      setInvitation(null);

      const { data: inviteData, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('invite_code', data.code.toLowerCase())
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      if (!inviteData) {
        toast.error('Convite não encontrado, expirado ou já utilizado');
        return;
      }

      const conditions = Array.isArray(inviteData.child_conditions) 
        ? inviteData.child_conditions.filter((c): c is string => typeof c === 'string')
        : [];

      setInvitation({
        ...inviteData,
        child_conditions: conditions,
      });
    } catch (error: any) {
      console.error('Error searching invitation:', error);
      toast.error('Erro ao buscar convite');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!user || !invitation) {
      toast.error('Você precisa estar logado para aceitar o convite');
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);

      // Update invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by: user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // If it's a child invite, create child_profiles entry
      if (invitation.invite_type === 'child' && invitation.child_name && invitation.child_birth_date) {
        const { error: profileError } = await supabase
          .from('child_profiles')
          .insert({
            name: invitation.child_name,
            date_of_birth: invitation.child_birth_date,
            diagnosed_conditions: invitation.child_conditions,
            parent_user_id: user.id,
          });

        if (profileError) throw profileError;
      }

      // If it's a parent invite, link to the same children as inviter
      if (invitation.invite_type === 'parent') {
        // Get inviter's children
        const { data: inviterChildren } = await supabase
          .from('child_profiles')
          .select('*')
          .eq('parent_user_id', invitation.inviter_id);

        if (inviterChildren && inviterChildren.length > 0) {
          // Create copies for the new parent
          for (const child of inviterChildren) {
            await supabase
              .from('child_profiles')
              .insert({
                name: child.name,
                date_of_birth: child.date_of_birth,
                diagnosed_conditions: child.diagnosed_conditions,
                parent_user_id: user.id,
              });
          }
        }
      }

      setAccepted(true);
      toast.success('Convite aceito com sucesso!');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error('Erro ao aceitar convite');
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Convite Aceito!</h2>
            <p className="text-muted-foreground">
              Você agora tem acesso ao perfil vinculado.
            </p>
            <Button onClick={() => navigate('/dashboard-pais')} className="w-full">
              Ir para o Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Aceitar Convite</CardTitle>
          <CardDescription>
            Digite o código de convite que você recebeu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!invitation ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(searchInvitation)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Convite</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ex: abc12345" 
                          {...field}
                          className="text-center text-lg font-mono tracking-wider"
                          maxLength={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Buscar Convite
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {invitation.invite_type === 'child' ? 'Convite de Filho' : 'Convite de Responsável'}
                    </span>
                  </div>
                  
                  {invitation.child_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Criança</p>
                      <p className="font-semibold">{invitation.child_name}</p>
                    </div>
                  )}

                  {invitation.child_conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {invitation.child_conditions.map((c) => (
                        <span 
                          key={c} 
                          className="text-xs bg-secondary px-2 py-1 rounded"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {!user && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                  Você precisa estar logado para aceitar este convite.
                </p>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setInvitation(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={user ? acceptInvitation : () => navigate('/auth')}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {user ? 'Aceitar Convite' : 'Fazer Login'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
