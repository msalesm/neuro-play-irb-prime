import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParentsClub, ClubService } from '@/hooks/useParentsClub';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, Scissors, Heart, Apple, Brain, Sun, Users,
  Clock, MapPin, Calendar as CalendarIcon, Search, Star,
  CreditCard, History, Gift
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconMap: Record<string, React.ReactNode> = {
  'Sparkles': <Sparkles className="h-5 w-5" />,
  'Scissors': <Scissors className="h-5 w-5" />,
  'Heart': <Heart className="h-5 w-5" />,
  'Apple': <Apple className="h-5 w-5" />,
  'Brain': <Brain className="h-5 w-5" />,
  'Sun': <Sun className="h-5 w-5" />,
  'Users': <Users className="h-5 w-5" />
};

const ClubePais = () => {
  const { t } = useLanguage();
  const { categories, services, bookings, loading, createBooking, cancelBooking } = useParentsClub();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ClubService | null>(null);
  const [bookingDate, setBookingDate] = useState<Date | undefined>();
  const [bookingTime, setBookingTime] = useState<string>('');
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const upcomingBookings = bookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status) && 
    new Date(b.scheduled_date) >= new Date()
  );

  const pastBookings = bookings.filter(b => 
    ['completed', 'cancelled', 'no_show'].includes(b.status) ||
    new Date(b.scheduled_date) < new Date()
  );

  const handleBookService = (service: ClubService) => {
    setSelectedService(service);
    setBookingDate(undefined);
    setBookingTime('');
    setIsBookingDialogOpen(true);
  };

  const confirmBooking = async () => {
    if (!selectedService || !bookingDate || !bookingTime) return;
    
    await createBooking(
      selectedService.id,
      selectedService.partner_id,
      format(bookingDate, 'yyyy-MM-dd'),
      bookingTime,
      selectedService
    );
    
    setIsBookingDialogOpen(false);
    setSelectedService(null);
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64" />
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
            <Gift className="h-8 w-8 text-primary" />
            Clube dos Pais
          </h1>
          <p className="text-muted-foreground mt-1">
            Serviços exclusivos de bem-estar para responsáveis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            <Star className="h-4 w-4 mr-1" />
            Membro Ativo
          </Badge>
        </div>
      </div>

      {/* Benefits Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Benefícios Exclusivos</h3>
              <p className="text-muted-foreground text-sm">
                Descontos especiais em todos os serviços • Agendamento prioritário • Acesso a eventos
              </p>
            </div>
            <Button variant="outline" className="whitespace-nowrap">
              Ver Todos os Benefícios
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Meus Agendamentos
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar serviços..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="flex items-center gap-2"
              >
                {cat.icon && iconMap[cat.icon]}
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {service.partner?.name}
                      </CardDescription>
                    </div>
                    {service.discount_percentage > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{service.discount_percentage}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {service.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {service.location_type === 'clinic' ? 'Na clínica' : 
                       service.location_type === 'online' ? 'Online' : 'Externo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.discount_percentage > 0 && (
                      <span className="text-muted-foreground line-through text-sm">
                        R$ {service.price.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xl font-bold text-primary">
                      R$ {(service.price * (1 - service.discount_percentage / 100)).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleBookService(service)}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Agendar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">Nenhum serviço encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros ou busca</p>
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <h2 className="text-xl font-semibold">Próximos Agendamentos</h2>
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum agendamento</h3>
                <p className="text-muted-foreground mb-4">Você não tem agendamentos futuros</p>
                <Button onClick={() => {}}>Explorar Serviços</Button>
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
                          <CalendarIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{booking.service?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {booking.partner?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.scheduled_date), "dd 'de' MMMM", { locale: ptBR })} às {booking.scheduled_time.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status === 'pending' ? 'Pendente' : 
                           booking.status === 'confirmed' ? 'Confirmado' : booking.status}
                        </Badge>
                        <span className="font-semibold text-primary">
                          R$ {booking.final_price.toFixed(2)}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => cancelBooking(booking.id, 'Cancelado pelo usuário')}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico de Serviços</h2>
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Sem histórico</h3>
                <p className="text-muted-foreground">Você ainda não utilizou nenhum serviço</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastBookings.map(booking => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{booking.service?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduled_date), "dd/MM/yyyy")} - {booking.partner?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                          {booking.status === 'completed' ? 'Concluído' : 
                           booking.status === 'cancelled' ? 'Cancelado' : booking.status}
                        </Badge>
                        <span className="text-muted-foreground">
                          R$ {booking.final_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Serviço</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedService.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedService.partner?.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedService.duration_minutes} minutos</span>
                </div>
                <p className="text-lg font-bold text-primary mt-2">
                  R$ {(selectedService.price * (1 - selectedService.discount_percentage / 100)).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Data</label>
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={setBookingDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Horário</label>
                <Select value={bookingTime} onValueChange={setBookingTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmBooking}
              disabled={!bookingDate || !bookingTime}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubePais;
