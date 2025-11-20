import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, Copy, Check, Loader2, Play, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CooperativeGameLobbyProps {
  childProfileId: string;
  gameId: string;
  gameName: string;
  onStart?: () => void;
}

export function CooperativeGameLobby({
  childProfileId,
  gameId,
  gameName,
  onStart
}: CooperativeGameLobbyProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'menu' | 'host' | 'join'>('menu');
  const [sessionCode, setSessionCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentSession?.id) {
      const channel = supabase
        .channel(`cooperative_session_${currentSession.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cooperative_sessions',
            filter: `id=eq.${currentSession.id}`
          },
          (payload) => {
            console.log('Session updated:', payload);
            if (payload.new && typeof payload.new === 'object') {
              setCurrentSession(payload.new);
              
              // Auto-start when guest joins
              const newSession = payload.new as any;
              if (newSession.status === 'active' && newSession.guest_profile_id) {
                toast.success('Parceiro conectado! Iniciando jogo...');
                setTimeout(() => {
                  onStart?.();
                }, 1500);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentSession?.id]);

  const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createSession = async () => {
    setIsLoading(true);
    try {
      const code = generateSessionCode();
      
      const { data, error } = await supabase
        .from('cooperative_sessions')
        .insert({
          session_code: code,
          game_id: gameId,
          host_profile_id: childProfileId,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);
      setSessionCode(code);
      setMode('host');
      toast.success('Sala criada! Compartilhe o código com seu parceiro.');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Erro ao criar sala cooperativa');
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = async () => {
    if (!joinCode.trim()) {
      toast.error('Digite o código da sala');
      return;
    }

    setIsLoading(true);
    try {
      const { data: session, error: fetchError } = await supabase
        .from('cooperative_sessions')
        .select('*')
        .eq('session_code', joinCode.toUpperCase())
        .eq('status', 'waiting')
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!session) {
        toast.error('Sala não encontrada ou já iniciada');
        return;
      }

      const { error: updateError } = await supabase
        .from('cooperative_sessions')
        .update({
          guest_profile_id: childProfileId,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (updateError) throw updateError;

      setCurrentSession(session);
      setMode('join');
      toast.success('Conectado! Iniciando jogo...');
      
      setTimeout(() => {
        onStart?.();
      }, 1500);
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Erro ao entrar na sala');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSession = async () => {
    if (currentSession?.id) {
      await supabase
        .from('cooperative_sessions')
        .delete()
        .eq('id', currentSession.id);
    }
    setMode('menu');
    setCurrentSession(null);
    setSessionCode('');
    setJoinCode('');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (mode === 'menu') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Modo Cooperativo
          </CardTitle>
          <CardDescription>
            Jogue junto com outra pessoa no {gameName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={createSession}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Users className="w-4 h-4 mr-2" />
            )}
            Criar Sala
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Digite o código da sala"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            <Button
              onClick={joinSession}
              disabled={isLoading || !joinCode.trim()}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Entrar na Sala
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'host') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Aguardando Parceiro
          </CardTitle>
          <CardDescription>
            Compartilhe este código para iniciar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Código da Sala</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-4xl font-bold tracking-widest text-primary">
                {sessionCode}
              </p>
              <Button
                size="icon"
                variant="ghost"
                onClick={copyCode}
                className="text-primary"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Aguardando conexão...</span>
          </div>

          {currentSession?.guest_profile_id && (
            <Badge variant="default" className="w-full justify-center py-2">
              <Users className="w-4 h-4 mr-2" />
              Parceiro conectado!
            </Badge>
          )}

          <Button
            onClick={cancelSession}
            variant="outline"
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
