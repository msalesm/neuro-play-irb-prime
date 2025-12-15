import { useState } from 'react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBillingContracts } from '@/hooks/useBillingContracts';
import { 
  DollarSign, FileText, AlertTriangle, CheckCircle, 
  Clock, RefreshCw, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BillingDashboard() {
  const { invoices, contracts, loading, stats, markInvoicePaid, signContract, refresh } = useBillingContracts();

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      draft: 'bg-blue-100 text-blue-800',
      pending_signature: 'bg-orange-100 text-orange-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      cancelled: 'Cancelado',
      active: 'Ativo',
      draft: 'Rascunho',
      pending_signature: 'Aguardando Assinatura',
      expired: 'Expirado'
    };
    return <Badge className={styles[status]}>{labels[status] || status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Faturamento e Contratos</h1>
            <p className="text-muted-foreground">Gestão financeira institucional</p>
          </div>
          <Button variant="outline" onClick={() => refresh()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalPending)}</p>
                  <p className="text-xs text-muted-foreground">A Receber</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalOverdue)}</p>
                  <p className="text-xs text-muted-foreground">Vencido</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-xl font-bold">{stats.activeContracts}</p>
                  <p className="text-xs text-muted-foreground">Contratos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.monthlyRecurring)}</p>
                  <p className="text-xs text-muted-foreground">Receita Mensal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">Faturas</TabsTrigger>
            <TabsTrigger value="contracts">Contratos</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Faturas</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhuma fatura encontrada</p>
                ) : (
                  <div className="space-y-3">
                    {invoices.map(invoice => (
                      <div key={invoice.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{invoice.invoice_number}</span>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Vencimento: {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(invoice.amount)}</p>
                          {invoice.status === 'pending' && (
                            <Button size="sm" onClick={() => markInvoicePaid(invoice.id, 'manual')}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Marcar Pago
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Contratos</CardTitle>
              </CardHeader>
              <CardContent>
                {contracts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum contrato encontrado</p>
                ) : (
                  <div className="space-y-3">
                    {contracts.map(contract => (
                      <div key={contract.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{contract.contract_number}</span>
                            {getStatusBadge(contract.status)}
                            <Badge variant="outline">{contract.contract_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(contract.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                            {contract.end_date && ` - ${format(new Date(contract.end_date), 'dd/MM/yyyy', { locale: ptBR })}`}
                          </p>
                        </div>
                        <div className="text-right">
                          {contract.value_monthly && (
                            <p className="font-bold">{formatCurrency(contract.value_monthly)}/mês</p>
                          )}
                          {contract.status === 'pending_signature' && (
                            <Button size="sm" onClick={() => signContract(contract.id)}>
                              Assinar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernPageLayout>
  );
}
