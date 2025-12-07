import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, Send, Paperclip, Search, Archive, Star,
  MessageSquare, AlertCircle, CheckCheck, Clock,
  Plus, ArrowLeft, User
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string | null;
  content: string;
  message_type: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: { full_name: string | null; email: string | null };
  recipient?: { full_name: string | null; email: string | null };
}

export default function SecureMessaging() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);

  // Compose state
  const [newMessage, setNewMessage] = useState({
    recipient_id: '',
    subject: '',
    content: '',
    message_type: 'text' as const
  });

  useEffect(() => {
    if (user) {
      loadMessages();
      loadRecipients();
    }
  }, [user, filter]);

  const loadMessages = async () => {
    try {
      let query = supabase
        .from('secure_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'inbox') {
        query = query.eq('recipient_id', user?.id).eq('is_archived', false);
      } else if (filter === 'sent') {
        query = query.eq('sender_id', user?.id);
      } else {
        query = query.eq('recipient_id', user?.id).eq('is_archived', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Load sender/recipient profiles
      const messagesWithProfiles = await Promise.all((data || []).map(async (msg) => {
        const { data: sender } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', msg.sender_id)
          .single();

        const { data: recipient } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', msg.recipient_id)
          .single();

        return { ...msg, sender, recipient };
      }));

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async () => {
    try {
      // Load users this person can message (patients, parents, therapists)
      const { data: accessData } = await supabase
        .from('child_access')
        .select(`
          children:child_id (parent_id)
        `)
        .eq('professional_id', user?.id)
        .eq('is_active', true);

      const parentIds = accessData?.map(a => (a.children as any)?.parent_id).filter(Boolean) || [];

      if (parentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', parentIds);

        setRecipients(profiles || []);
      }
    } catch (error) {
      console.error('Error loading recipients:', error);
    }
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);

    // Mark as read
    if (!message.is_read && message.recipient_id === user?.id) {
      await supabase
        .from('secure_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', message.id);

      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, is_read: true } : m
      ));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.recipient_id || !newMessage.content) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { error } = await supabase
        .from('secure_messages')
        .insert({
          sender_id: user?.id,
          recipient_id: newMessage.recipient_id,
          subject: newMessage.subject || null,
          content: newMessage.content,
          message_type: newMessage.message_type
        });

      if (error) throw error;

      toast.success('Mensagem enviada com sucesso!');
      setShowComposeDialog(false);
      setNewMessage({ recipient_id: '', subject: '', content: '', message_type: 'text' });
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await supabase
        .from('secure_messages')
        .update({ is_archived: true })
        .eq('id', messageId);

      toast.success('Mensagem arquivada');
      loadMessages();
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Erro ao arquivar mensagem');
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'feedback': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'recommendation': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredMessages = messages.filter(m =>
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.sender?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.is_read && m.recipient_id === user?.id).length;

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Mensagens Seguras</h1>
          <p className="text-white/70">Comunicação entre terapeutas e famílias</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Message List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Mensagens
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
              <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Nova Mensagem</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Destinatário</Label>
                      <Select 
                        value={newMessage.recipient_id}
                        onValueChange={(v) => setNewMessage(prev => ({ ...prev, recipient_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="z-[200] bg-background">
                          {recipients.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              Nenhum destinatário disponível
                            </div>
                          ) : (
                            recipients.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.full_name || r.email}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Mensagem</Label>
                      <Select 
                        value={newMessage.message_type}
                        onValueChange={(v: any) => setNewMessage(prev => ({ ...prev, message_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[200] bg-background">
                          <SelectItem value="text">Mensagem</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="recommendation">Recomendação</SelectItem>
                          <SelectItem value="alert">Alerta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Assunto</Label>
                      <Input 
                        placeholder="Assunto da mensagem"
                        value={newMessage.subject}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mensagem</Label>
                      <Textarea 
                        placeholder="Digite sua mensagem..."
                        rows={5}
                        value={newMessage.content}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Anexar
                      </Button>
                      <Button className="flex-1" onClick={handleSendMessage}>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-1">
                <Button 
                  variant={filter === 'inbox' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setFilter('inbox')}
                >
                  Entrada
                </Button>
                <Button 
                  variant={filter === 'sent' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setFilter('sent')}
                >
                  Enviadas
                </Button>
                <Button 
                  variant={filter === 'archived' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setFilter('archived')}
                >
                  <Archive className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="divide-y">
                {filteredMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-muted' : ''
                    } ${!message.is_read && filter === 'inbox' ? 'bg-primary/5' : ''}`}
                    onClick={() => handleSelectMessage(message)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getMessageTypeIcon(message.message_type)}
                          <span className={`text-sm truncate ${!message.is_read ? 'font-semibold' : ''}`}>
                            {filter === 'sent' 
                              ? message.recipient?.full_name || 'Destinatário'
                              : message.sender?.full_name || 'Remetente'
                            }
                          </span>
                        </div>
                        <p className={`text-sm truncate ${!message.is_read ? 'font-medium' : 'text-muted-foreground'}`}>
                          {message.subject || 'Sem assunto'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {message.content.substring(0, 50)}...
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          {message.is_read && filter === 'sent' && (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredMessages.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhuma mensagem encontrada
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="lg:hidden"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleArchiveMessage(selectedMessage.id)}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Arquivar
                    </Button>
                    <Button size="sm">
                      <Send className="w-4 h-4 mr-2" />
                      Responder
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Message Header */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {selectedMessage.sender?.full_name || 'Remetente'}
                        </h3>
                        {getMessageTypeIcon(selectedMessage.message_type)}
                        <Badge variant="outline" className="text-xs">
                          {selectedMessage.message_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Para: {selectedMessage.recipient?.full_name || 'Destinatário'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedMessage.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Subject */}
                  {selectedMessage.subject && (
                    <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                  )}

                  {/* Content */}
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma mensagem para visualizar</p>
              </div>
            </CardContent>
          )}
        </Card>
        </div>
      </div>
    </ModernPageLayout>
  );
}
