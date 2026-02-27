import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Send, Loader2, Lightbulb, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Suggestion {
  id: string;
  text: string;
  action?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  // Generate contextual suggestions based on current route
  useEffect(() => {
    generateContextualSuggestions();
  }, [location.pathname]);

  const generateContextualSuggestions = () => {
    const path = location.pathname;
    let newSuggestions: Suggestion[] = [];

    if (path.includes('dashboard-pais')) {
      newSuggestions = [
        { id: '1', text: 'Como está o progresso do meu filho?' },
        { id: '2', text: 'Quais jogos são recomendados hoje?' },
        { id: '3', text: 'Explique o relatório cognitivo' },
      ];
    } else if (path.includes('sistema-planeta-azul') || path.includes('planeta')) {
      newSuggestions = [
        { id: '1', text: 'Qual planeta devo explorar primeiro?' },
        { id: '2', text: 'Como funcionam as missões diárias?' },
        { id: '3', text: 'O que são os anéis do sistema?' },
      ];
    } else if (path.includes('rotinas') || path.includes('historias')) {
      newSuggestions = [
        { id: '1', text: 'Como criar uma nova rotina?' },
        { id: '2', text: 'Dicas para manter consistência' },
        { id: '3', text: 'Como usar as histórias sociais?' },
      ];
    } else if (path.includes('games') || path.includes('jogo')) {
      newSuggestions = [
        { id: '1', text: 'Como funciona a dificuldade adaptativa?' },
        { id: '2', text: 'Qual jogo treina atenção?' },
        { id: '3', text: 'Como interpretar a pontuação?' },
      ];
    } else if (path.includes('therapist') || path.includes('terapeuta')) {
      newSuggestions = [
        { id: '1', text: 'Como gerar relatório clínico?' },
        { id: '2', text: 'Interpretar indicadores de risco' },
        { id: '3', text: 'Configurar PEI para paciente' },
      ];
    } else {
      newSuggestions = [
        { id: '1', text: 'Como começar a usar a plataforma?' },
        { id: '2', text: 'Quais são os benefícios terapêuticos?' },
        { id: '3', text: 'Como funciona a IA da plataforma?' },
      ];
    }

    setSuggestions(newSuggestions);
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const { data, error } = await supabase.functions.invoke('contextual-ai-assistant', {
        body: { 
          message: messageText,
          context: {
            currentPage: location.pathname,
            userId: user?.id
          },
          history: messages.slice(-10)
        }
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data?.response || 'Desculpe, não consegui processar sua solicitação.' 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      const isRateLimit = error?.message?.includes('429');
      const errorMessage: Message = { 
        role: 'assistant', 
        content: isRateLimit 
          ? '⚠️ Limite de requisições atingido. Aguarde alguns minutos antes de tentar novamente.'
          : '⚠️ Serviço de IA temporariamente indisponível. As demais funcionalidades da plataforma continuam funcionando normalmente. Tente novamente em instantes.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    sendMessage(suggestion.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 left-4 z-[9999] md:bottom-8"
          >
            <motion.button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(194,100%,22%)] shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bot className="h-6 w-6" />
              </motion.div>
            </motion.button>
            
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30 pointer-events-none"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : 'auto'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 left-4 z-[9999] w-[350px] md:bottom-8 md:w-[400px]"
          >
            <Card className="overflow-hidden border-2 border-primary/20 bg-background/95 backdrop-blur-lg shadow-2xl">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(194,100%,22%)] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="h-5 w-5 text-[hsl(var(--accent))]" />
                    </motion.div>
                    <CardTitle className="text-lg text-white">Assistente IA</CardTitle>
                    <Badge variant="secondary" className="text-xs">Beta</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                  >
                    <CardContent className="p-0">
                      {/* Messages Area */}
                      <ScrollArea className="h-[300px] p-4">
                        {messages.length === 0 && showSuggestions ? (
                          <div className="space-y-4">
                            <div className="text-center text-muted-foreground text-sm">
                              <Bot className="h-12 w-12 mx-auto mb-3 text-primary/50" />
                              <p>Olá! Sou o assistente IA do Neuro IRB Prime.</p>
                              <p className="mt-1">Como posso ajudar?</p>
                            </div>
                            
                            {/* Contextual Suggestions */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Lightbulb className="h-3 w-3" />
                                <span>Sugestões para esta página:</span>
                              </div>
                              {suggestions.map((suggestion) => (
                                <motion.button
                                  key={suggestion.id}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-colors border border-transparent hover:border-primary/20"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {suggestion.text}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((message, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                                    message.role === 'user'
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </motion.div>
                            ))}
                            
                            {isLoading && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                              >
                                <div className="bg-muted rounded-2xl px-4 py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </ScrollArea>

                      {/* Input Area */}
                      <div className="border-t p-3">
                        <div className="flex gap-2">
                          <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite sua pergunta..."
                            disabled={isLoading}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="shrink-0"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
