import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SecureMessage {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  child_id: string | null;
  subject: string | null;
  content: string;
  message_type: 'text' | 'feedback' | 'alert' | 'recommendation';
  is_read: boolean;
  read_at: string | null;
  is_archived: boolean;
  parent_message_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  sender?: {
    full_name: string | null;
    email: string | null;
  };
  recipient?: {
    full_name: string | null;
    email: string | null;
  };
  child?: {
    name: string | null;
  };
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  childName: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function useSecureMessaging() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadMessages = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch messages where user is sender or recipient
      const { data, error } = await supabase
        .from('secure_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get unique user IDs for profiles
      const userIds = new Set<string>();
      const childIds = new Set<string>();
      
      data?.forEach(msg => {
        if (msg.sender_id) userIds.add(msg.sender_id);
        if (msg.recipient_id) userIds.add(msg.recipient_id);
        if (msg.child_id) childIds.add(msg.child_id);
      });

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Fetch children
      const { data: children } = await supabase
        .from('children')
        .select('id, name')
        .in('id', Array.from(childIds));

      const childMap = new Map(children?.map(c => [c.id, c]) || []);

      // Enrich messages
      const enrichedMessages: SecureMessage[] = (data || []).map(msg => ({
        ...msg,
        message_type: (msg.message_type || 'text') as 'text' | 'feedback' | 'alert' | 'recommendation',
        metadata: typeof msg.metadata === 'object' && msg.metadata !== null ? msg.metadata as Record<string, any> : {},
        sender: profileMap.get(msg.sender_id) || null,
        recipient: msg.recipient_id ? profileMap.get(msg.recipient_id) || null : null,
        child: msg.child_id ? childMap.get(msg.child_id) || null : null
      }));

      setMessages(enrichedMessages);

      // Calculate unread count
      const unread = enrichedMessages.filter(
        msg => msg.recipient_id === user.id && !msg.is_read
      ).length;
      setUnreadCount(unread);

      // Build conversations
      const convMap = new Map<string, Conversation>();
      
      enrichedMessages.forEach(msg => {
        const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        if (!otherId) return;

        const key = otherId;
        if (!convMap.has(key)) {
          const otherProfile = profileMap.get(otherId);
          convMap.set(key, {
            id: key,
            otherUser: {
              id: otherId,
              name: otherProfile?.full_name || 'Usuário',
              email: otherProfile?.email || ''
            },
            childName: msg.child?.name || null,
            lastMessage: msg.content.substring(0, 100),
            lastMessageAt: msg.created_at,
            unreadCount: 0
          });
        }

        if (msg.recipient_id === user.id && !msg.is_read) {
          const conv = convMap.get(key)!;
          conv.unreadCount++;
        }
      });

      setConversations(Array.from(convMap.values()));

    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('secure-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'secure_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          loadMessages();
          toast.info('Nova mensagem recebida');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadMessages]);

  const sendMessage = async (params: {
    recipientId: string;
    childId?: string;
    subject?: string;
    content: string;
    messageType?: 'text' | 'feedback' | 'alert' | 'recommendation';
    parentMessageId?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('secure_messages')
        .insert({
          sender_id: user.id,
          recipient_id: params.recipientId,
          child_id: params.childId || null,
          subject: params.subject || null,
          content: params.content,
          message_type: params.messageType || 'text',
          parent_message_id: params.parentMessageId || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Mensagem enviada');
      await loadMessages();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
      return null;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('secure_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('secure_messages')
        .update({ is_archived: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Mensagem arquivada');
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Erro ao arquivar mensagem');
    }
  };

  const getConversation = (userId: string) => {
    return messages.filter(
      msg => msg.sender_id === userId || msg.recipient_id === userId
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  return {
    messages,
    conversations,
    loading,
    unreadCount,
    sendMessage,
    markAsRead,
    archiveMessage,
    getConversation,
    reload: loadMessages
  };
}
