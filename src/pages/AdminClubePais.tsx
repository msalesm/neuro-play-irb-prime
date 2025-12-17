import React, { useState } from 'react';
import { useClubAdmin } from '@/hooks/useParentsClub';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, DollarSign, TrendingUp, Clock, CheckCircle, XCircle,
  Search, Filter, Download, BarChart3, Briefcase, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminClubePais = () => {
  const { user } = useAuth();
  const { partners, allBookings, stats, loading, approvePartner, togglePartnerStatus } = useClubAdmin();
  const [searchPartner, setSearchPartner] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');

  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchPartner.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && !p.is_approved) ||
      (filterStatus === 'approved' && p.is_approved);
    return matchesSearch && matchesStatus;
  });

  const pendingPartners = partners.filter(p => !p.is_approved);

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Gestão do Clube dos Pais
          </h1>
          <p className="text-muted-foreground mt-1">
            Administração de parceiros, serviços e faturamento
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agendamentos</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Parceiros Ativos</p>
                <p className="text-2xl font-bold">{stats.activePartners}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className={stats.pendingApprovals > 0 ? 'border-yellow-500/50 bg-yellow-500/5' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Aprovação</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {pendingPartners.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">
                  {pendingPartners.length} parceiro(s) aguardando aprovação
                </span>
              </div>
              <Button size="sm" variant="outline">
                Revisar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="partners" className="space-y-6">
        <TabsList>
          <TabsTrigger value="partners">Parceiros</TabsTrigger>
          <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar parceiros..."
                value={searchPartner}
                onChange={(e) => setSearchPartner(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button 
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                Pendentes
              </Button>
              <Button 
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('approved')}
              >
                Aprovados
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredPartners.map(partner => (
              <Card key={partner.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{partner.name}</h4>
                        <p className="text-sm text-muted-foreground">{partner.specialty}</p>
                        <p className="text-xs text-muted-foreground">
                          Comissão: {partner.commission_rate}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={partner.is_approved ? 'default' : 'secondary'}>
                        {partner.is_approved ? 'Aprovado' : 'Pendente'}
                      </Badge>
                      <Badge variant={partner.is_active ? 'outline' : 'destructive'}>
                        {partner.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {!partner.is_approved && (
                        <Button 
                          size="sm"
                          onClick={() => user && approvePartner(partner.id, user.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      )}
                      {partner.is_approved && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => togglePartnerStatus(partner.id, !partner.is_active)}
                        >
                          {partner.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPartners.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum parceiro encontrado</h3>
                <p className="text-muted-foreground">Tente ajustar os filtros</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <h2 className="text-xl font-semibold">Últimos Agendamentos</h2>
          
          <div className="space-y-3">
            {allBookings.slice(0, 20).map(booking => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-medium">{booking.service?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Parceiro: {booking.partner?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.scheduled_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {booking.scheduled_time.slice(0, 5)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={
                        booking.status === 'completed' ? 'default' :
                        booking.status === 'confirmed' ? 'secondary' :
                        booking.status === 'cancelled' ? 'destructive' : 'outline'
                      }>
                        {booking.status === 'pending' ? 'Pendente' :
                         booking.status === 'confirmed' ? 'Confirmado' :
                         booking.status === 'completed' ? 'Concluído' :
                         booking.status === 'cancelled' ? 'Cancelado' : booking.status}
                      </Badge>
                      <div className="text-right">
                        <p className="font-semibold">R$ {booking.final_price.toFixed(2)}</p>
                        <p className="text-xs text-green-600">
                          Comissão: R$ {booking.clinic_commission.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {allBookings.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum agendamento</h3>
                <p className="text-muted-foreground">Os agendamentos aparecerão aqui</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <h2 className="text-xl font-semibold">Relatórios e Métricas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receita por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Este mês</span>
                    <span className="font-semibold text-green-600">
                      R$ {stats.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Mês anterior</span>
                    <span className="font-semibold">R$ 0.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Total acumulado</span>
                    <span className="font-bold text-xl">
                      R$ {stats.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Serviços Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Dados serão exibidos conforme os agendamentos aumentem</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance dos Parceiros</CardTitle>
              </CardHeader>
              <CardContent>
                {partners.filter(p => p.is_approved).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhum parceiro aprovado ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {partners.filter(p => p.is_approved).slice(0, 5).map(partner => (
                      <div key={partner.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span>{partner.name}</span>
                        <Badge variant="outline">{partner.specialty}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Agendamentos confirmados</span>
                    <span className="font-semibold">
                      {allBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Agendamentos cancelados</span>
                    <span className="font-semibold text-red-500">
                      {allBookings.filter(b => b.status === 'cancelled').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Taxa de sucesso</span>
                    <span className="font-bold text-green-600">
                      {allBookings.length > 0 
                        ? ((allBookings.filter(b => b.status === 'completed').length / allBookings.length) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminClubePais;
