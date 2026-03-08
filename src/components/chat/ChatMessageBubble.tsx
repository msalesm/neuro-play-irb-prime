import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface ChatMessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  compact?: boolean;
}

export function ChatMessageBubble({ role, content, timestamp, compact = false }: ChatMessageBubbleProps) {
  const isAssistant = role === 'assistant';
  const avatarSize = compact ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className={`flex gap-3 ${!isAssistant ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className={`${avatarSize} shrink-0`}>
        <AvatarFallback
          className={
            isAssistant
              ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground'
              : 'bg-secondary'
          }
        >
          {isAssistant ? <Bot className={iconSize} /> : <User className={iconSize} />}
        </AvatarFallback>
      </Avatar>
      <div className={`flex-1 ${!isAssistant ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-3 max-w-[85%] shadow-sm text-left ${
            !isAssistant
              ? 'bg-gradient-to-br from-secondary to-primary text-primary-foreground'
              : 'bg-muted border border-border'
          }`}
        >
          {isAssistant ? (
            <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>blockquote]:border-primary/30">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 px-1">
          {timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export function TypingIndicator({ compact = false }: { compact?: boolean }) {
  const avatarSize = compact ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div className="flex gap-3">
      <Avatar className={`${avatarSize} shrink-0`}>
        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <Bot className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl px-5 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
