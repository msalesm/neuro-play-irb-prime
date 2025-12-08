import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, ArrowLeft, Check, CheckCheck, Paperclip } from 'lucide-react';
import { SecureMessage } from '@/hooks/useSecureMessaging';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageThreadProps {
  messages: SecureMessage[];
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  childName?: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onMarkAsRead: (messageId: string) => void;
  onBack: () => void;
}

export function MessageThread({ 
  messages, 
  otherUser, 
  childName,
  onSendMessage, 
  onMarkAsRead,
  onBack 
}: MessageThreadProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.recipient_id === user?.id && !msg.is_read) {
        onMarkAsRead(msg.id);
      }
    });
  }, [messages, user?.id, onMarkAsRead]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: ptBR });
    }
    if (isYesterday(date)) {
      return `Ontem ${format(date, 'HH:mm', { locale: ptBR })}`;
    }
    return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: SecureMessage[] }[] = [];
    let currentDate = '';

    messages.forEach(msg => {
      const msgDate = format(new Date(msg.created_at), 'yyyy-MM-dd');
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const formatGroupDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <CardHeader className="border-b py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {otherUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{otherUser.name}</CardTitle>
            {childName && (
              <p className="text-xs text-muted-foreground">
                Sobre: {childName}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {groupMessagesByDate().map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex justify-center mb-4">
                <Badge variant="secondary" className="text-xs font-normal">
                  {formatGroupDate(group.date)}
                </Badge>
              </div>

              {/* Messages for this date */}
              {group.messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      {msg.subject && (
                        <p className={`text-xs font-medium mb-1 ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {msg.subject}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        <span className="text-[10px]">
                          {formatMessageDate(msg.created_at)}
                        </span>
                        {isOwn && (
                          msg.is_read 
                            ? <CheckCheck className="w-3 h-3" />
                            : <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
