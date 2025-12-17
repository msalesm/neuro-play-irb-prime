import React, { useState } from 'react';
import { useClubPartner, ClubService } from '@/hooks/useParentsClub';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Briefcase, Calendar, DollarSign, Clock, Plus, 
  CheckCircle, XCircle, AlertCircle, Users, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ParceiroClube = () => {
  const { partner, myServices, myBookings, loading, createService, updateBookingStatus } = useClubPartner();
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category_id: '',
    duration_minutes: 60,
    price: 0,
    discount_percentage: 0,
    location_type: 'clinic' as const,
    cancellation_policy: ''
  });

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('club_service_categories')
      .select('*')
      .eq('is_active', true);
    setCategories(data || []);
  };

  const handleCreateService = async () => {
    await createService(newService);
    setIsNewServiceOpen(false);
    setNewService({
      name: '',
      description: '',
      category_id: '',
      duration_minutes: 60,
      price: 0,
      discount_percentage: 0,
      location_type: 'clinic',
      cancellation_policy: ''
    });
  };

  const todayBookings = myBookings.filter(b => 
    b.scheduled_date === format(new Date(), 'yyyy-MM-dd')
  );

  const upcomingBookings = myBookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status) &&
    new Date(b.scheduled_date) >= new Date()
  );

  const completedBookings = myBookings.filter(b => b.status === 'completed');

  const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.partner_amount), 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Seja um Parceiro do Clube</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Cadastre-se como parceiro do Clube dos Pais e ofereça seus serviços 
              para os responsáveis dos pacientes da clínica.
            </p>
            <Button size="lg">Solicitar Cadastro</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!partner.is_approved) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Aguardando Aprovação</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Seu cadastro como parceiro está em análise. Você será notificado 
              assim que for aprovado pela clínica.
            </p>
            <Badge variant="secondary" className="text-base py-2 px-4">
              Status: Pendente
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            Portal do Parceiro
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo, {partner.name}
          </p>
        </div>
        <Badge variant="default" className="text-sm py-1 px-3">
          <CheckCircle className="h-4 w-4 mr-1" />
          Parceiro Aprovado
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{todayBookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos</p>
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Serviços Ativos</p>
                <p className="text-2xl font-bold">{myServices.filter(s => s.is_active).length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
          <TabsTrigger value="services">Meus Serviços</TabsTrigger>
          <TabsTrigger value="earnings">Faturamento</TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <h2 className="text-xl font-semibold">Próximos Agendamentos</h2>
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum agendamento</h3>
                <p className="text-muted-foreground">Você não tem agendamentos futuros</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{booking.service?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.scheduled_date), "dd 'de' MMMM", { locale: ptBR })} às {booking.scheduled_time.slice(0, 5)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {booking.duration_minutes} minutos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status === 'pending' ? 'Pendente' : 
                           booking.status === 'confirmed' ? 'Confirmado' : booking.status}
                        </Badge>
                        <span className="font-semibold">
                          R$ {booking.partner_amount.toFixed(2)}
                        </span>
                        {booking.status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                          >
                            Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Meus Serviços</h2>
            <Button onClick={() => setIsNewServiceOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myServices.map(service => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant={service.is_active ? 'default' : 'secondary'}>
                      {service.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <CardDescription>{service.category?.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {service.duration_minutes} min
                    </span>
                    <span className="font-semibold text-primary">
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myServices.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum serviço cadastrado</h3>
                <p className="text-muted-foreground mb-4">Cadastre seus serviços para começar a receber agendamentos</p>
                <Button onClick={() => setIsNewServiceOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Serviço
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <h2 className="text-xl font-semibold">Faturamento</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground">Serviços Realizados</p>
                <p className="text-3xl font-bold">{completedBookings.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-3xl font-bold">
                  R$ {completedBookings.length > 0 
                    ? (totalRevenue / completedBookings.length).toFixed(2) 
                    : '0.00'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {completedBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pagamento registrado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {completedBookings.slice(0, 10).map(booking => (
                    <div key={booking.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{booking.service?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduled_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <span className="font-semibold text-green-600">
                        + R$ {booking.partner_amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Service Dialog */}
      <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome do Serviço</label>
              <Input
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="Ex: Massagem Relaxante"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Descreva seu serviço..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select 
                  value={newService.category_id}
                  onValueChange={(v) => setNewService({ ...newService, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Duração (min)</label>
                <Input
                  type="number"
                  value={newService.duration_minutes}
                  onChange={(e) => setNewService({ ...newService, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Preço (R$)</label>
                <Input
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Desconto (%)</label>
                <Input
                  type="number"
                  value={newService.discount_percentage}
                  onChange={(e) => setNewService({ ...newService, discount_percentage: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Local</label>
              <Select 
                value={newService.location_type}
                onValueChange={(v: 'clinic' | 'external' | 'online') => setNewService({ ...newService, location_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinic">Na Clínica</SelectItem>
                  <SelectItem value="external">Externo</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewServiceOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateService} disabled={!newService.name || !newService.price}>
              Criar Serviço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParceiroClube;
