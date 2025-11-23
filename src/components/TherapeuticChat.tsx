import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, User, Sparkles, Heart, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TherapeuticChatProps {
  childProfileId?: string;
  variant?: 'full' | 'compact';
}

export default function TherapeuticChat({ childProfileId, variant = 'full' }: TherapeuticChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! 👋 Sou seu assistente terapêutico do NeuroPlay. Estou aqui para apoiar você no desenvolvimento cognitivo e emocional. Como posso ajudar hoje?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [childProfile, setChildProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (childProfileId) {
      fetchChildProfile();
    }
    fetchUserRole();
  }, [childProfileId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChildProfile = async () => {
    if (!childProfileId || !user) return;

    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('id', childProfileId)
        .eq('parent_user_id', user.id)
        .single();

      if (error) throw error;
      setChildProfile(data);
    } catch (error) {
      console.error('Error fetching child profile:', error);
    }
  };

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!error && data?.role) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/therapeutic-chat`;
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([
            { role: userMessage.role, content: userMessage.content }
          ]),
          childProfile,
          userRole,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (response.status === 429) {
        toast.error('Limite de requisições atingido. Tente novamente em alguns instantes.');
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (response.status === 402) {
        toast.error('Créditos insuficientes. Entre em contato com o suporte.');
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch (error) {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Chat error:', error);
        toast.error('Erro ao enviar mensagem. Tente novamente.');
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { icon: Heart, label: 'Check-in Emocional', prompt: 'Como está se sentindo hoje? Vamos fazer um check-in emocional.' },
    { icon: Brain, label: 'Interpretar Resultados', prompt: 'Pode me ajudar a entender os últimos resultados dos jogos?' },
    { icon: Sparkles, label: 'Sugestão de Atividade', prompt: 'Que atividades você sugere para trabalhar hoje?' },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  if (variant === 'compact') {
    return (
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Assistente Terapêutico
            </CardTitle>
            <Badge variant="outline" className="gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Online
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3 p-4 pt-0">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                      {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">Assistente Terapêutico IA</span>
          <Badge variant="outline" className="gap-1 ml-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {userRole === 'parent' && 'Apoio especializado para pais e responsáveis'}
          {userRole === 'therapist' && 'Suporte clínico para profissionais de saúde mental'}
          {!userRole || (userRole !== 'parent' && userRole !== 'therapist') && 'Orientação sobre desenvolvimento cognitivo e neurociência infantil'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary transition-all"
            onClick={() => handleQuickAction(action.prompt)}
          >
            <action.icon className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-1 flex flex-col gap-4 p-6">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={message.role === 'assistant' ? 'bg-gradient-to-br from-irb-petrol to-irb-blue text-white' : 'bg-secondary'}>
                      {message.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block rounded-2xl px-5 py-3 max-w-[85%] shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-irb-blue to-irb-petrol text-white'
                          : 'bg-muted border border-border'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 px-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-irb-petrol to-irb-blue text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-5 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-irb-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2.5 w-2.5 rounded-full bg-irb-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2.5 w-2.5 rounded-full bg-irb-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-3 items-end">
            <Input
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 h-12"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()} 
              size="lg"
              className="bg-gradient-to-r from-irb-petrol to-irb-blue hover:opacity-90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
