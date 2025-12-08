import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Conversation } from '@/hooks/useSecureMessaging';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedId?: string;
}

export function ConversationList({ conversations, onSelectConversation, selectedId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma conversa ainda</p>
          <p className="text-sm mt-2">Suas mensagens aparecerão aqui</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedId === conv.id ? 'bg-muted/50' : ''
              }`}
            >
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {conv.otherUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{conv.otherUser.name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(conv.lastMessageAt), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground rounded-full h-5 min-w-5 flex items-center justify-center text-xs">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
                {conv.childName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Sobre: {conv.childName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
