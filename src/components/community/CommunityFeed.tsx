import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Heart, MessageCircle, Share2, Trophy, Gamepad2, BookOpen, CheckCircle, Star, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useCommunity } from '@/hooks/useCommunity';
import { cn } from '@/lib/utils';

const postTypeIcons: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  achievement: { icon: Trophy, color: 'text-yellow-500', label: 'Conquista' },
  milestone: { icon: Star, color: 'text-purple-500', label: 'Marco' },
  story_complete: { icon: BookOpen, color: 'text-blue-500', label: 'História' },
  game_complete: { icon: Gamepad2, color: 'text-green-500', label: 'Jogo' },
  routine_complete: { icon: CheckCircle, color: 'text-teal-500', label: 'Rotina' },
  badge_earned: { icon: Star, color: 'text-amber-500', label: 'Badge' },
  level_up: { icon: Flame, color: 'text-orange-500', label: 'Level Up' },
  streak: { icon: Flame, color: 'text-red-500', label: 'Sequência' },
  custom: { icon: MessageCircle, color: 'text-muted-foreground', label: 'Post' }
};

export function CommunityFeed() {
  const { posts, toggleLike, addComment, fetchComments, loading } = useCommunity();
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

  const handleToggleComments = async (postId: string) => {
    if (expandedComments.has(postId)) {
      setExpandedComments(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      setExpandedComments(prev => new Set(prev).add(postId));
      
      if (!comments[postId]) {
        setLoadingComments(prev => new Set(prev).add(postId));
        const postComments = await fetchComments(postId);
        setComments(prev => ({ ...prev, [postId]: postComments }));
        setLoadingComments(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    const comment = await addComment(postId, content);
    if (comment) {
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhuma atividade ainda</h3>
          <p className="text-muted-foreground">
            Complete jogos e atividades para compartilhar suas conquistas com a comunidade!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => {
        const typeInfo = postTypeIcons[post.post_type] || postTypeIcons.custom;
        const TypeIcon = typeInfo.icon;

        return (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.profiles?.name || 'Usuário'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <TypeIcon className={cn("w-3 h-3", typeInfo.color)} />
                  {typeInfo.label}
                </Badge>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h4 className="font-semibold mb-1">{post.title}</h4>
                {post.content && (
                  <p className="text-muted-foreground text-sm">{post.content}</p>
                )}
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="mt-3 rounded-lg max-h-64 object-cover w-full"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => toggleLike(post.id)}
                >
                  <Heart 
                    className={cn(
                      "w-4 h-4",
                      post.user_liked && "fill-red-500 text-red-500"
                    )} 
                  />
                  <span>{post.likes_count}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleToggleComments(post.id)}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments_count}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Comments Section */}
              {expandedComments.has(post.id) && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  {loadingComments.has(post.id) ? (
                    <p className="text-sm text-muted-foreground">Carregando comentários...</p>
                  ) : (
                    <>
                      {comments[post.id]?.map(comment => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.profiles?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {comment.profiles?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted rounded-lg p-2">
                            <p className="text-sm font-medium">{comment.profiles?.name}</p>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Escreva um comentário..."
                          value={newComment[post.id] || ''}
                          onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="min-h-[60px] text-sm"
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                        >
                          Enviar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
