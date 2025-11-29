import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseTherapeuticChatProps {
  childProfileId?: string;
  contextType?: 'general' | 'emotional_checkin' | 'coaching' | 'progress_review';
  conversationId?: string;
}

export function useTherapeuticChat({ 
  childProfileId, 
  contextType = 'general',
  conversationId: initialConversationId 
}: UseTherapeuticChatProps = {}) {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [childProfile, setChildProfile] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (childProfileId) {
      fetchChildProfile();
    }
  }, [childProfileId]);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setMessages([
        {
          role: 'assistant',
          content: 'Olá! 👋 Sou seu assistente terapêutico do NeuroPlay. Estou aqui para apoiar você no desenvolvimento cognitivo e emocional. Como posso ajudar hoje?',
          timestamp: new Date(),
        },
      ]);
    }
  }, [conversationId]);

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

  const loadConversation = async () => {
    if (!conversationId || !user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = messagesData.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Erro ao carregar conversa');
    }
  };

  const createConversation = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          child_profile_id: childProfileId || null,
          title: `Conversa ${new Date().toLocaleDateString('pt-BR')}`,
          context_type: contextType,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string, currentConversationId: string) => {
    try {
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: currentConversationId,
          role,
          content,
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const analyzeConversation = async (currentConversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('analyze-chat-patterns', {
        body: {
          conversationId: currentConversationId,
          userId: user.id,
          childProfileId: childProfileId || null,
        },
      });

      if (error) {
        console.error('Error analyzing conversation:', error);
      }
    } catch (error) {
      console.error('Error triggering analysis:', error);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create conversation if doesn't exist
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        currentConversationId = await createConversation();
        if (currentConversationId) {
          setConversationId(currentConversationId);
        }
      }

      // Save user message
      if (currentConversationId) {
        await saveMessage('user', input, currentConversationId);
      }

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
          userRole: role,
          conversationId: currentConversationId,
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

      // Save assistant message
      if (currentConversationId && assistantContent) {
        await saveMessage('assistant', assistantContent, currentConversationId);
        
        // Trigger pattern analysis after every 5 messages
        const totalMessages = messages.length + 2; // +2 for user and assistant messages just sent
        if (totalMessages % 10 === 0) {
          analyzeConversation(currentConversationId);
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
  }, [input, isLoading, user, conversationId, messages, childProfile, role, contextType, childProfileId]);

  const clearConversation = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Olá! 👋 Sou seu assistente terapêutico do NeuroPlay. Estou aqui para apoiar você no desenvolvimento cognitivo e emocional. Como posso ajudar hoje?',
        timestamp: new Date(),
      },
    ]);
    setConversationId(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    conversationId,
    clearConversation,
    childProfile,
  };
}
