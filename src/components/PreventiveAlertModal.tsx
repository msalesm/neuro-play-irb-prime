import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, TrendingDown, TrendingUp, Phone, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PreventiveAlert {
  level: 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  indicators: string[];
  urgentActions: string[];
  timeline: string;
}

interface PreventiveAlertModalProps {
  open: boolean;
  onClose: () => void;
  alert: PreventiveAlert;
}

export function PreventiveAlertModal({ open, onClose, alert }: PreventiveAlertModalProps) {
  const navigate = useNavigate();

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getAlertTextColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const handleEmergencyChat = () => {
    onClose();
    navigate('/chat');
  };

  const handleViewDetails = () => {
    onClose();
    navigate('/dashboard-pais?tab=risk-analysis');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl border-l-4 ${getAlertColor(alert.level)}`}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${getAlertColor(alert.level)}`}>
              <AlertTriangle className={`w-6 h-6 ${getAlertTextColor(alert.level)}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                {alert.title}
                <Badge variant={alert.level === 'critical' ? 'destructive' : 'default'}>
                  {alert.level === 'critical' ? 'Urgente' : alert.level === 'high' ? 'Alta Prioridade' : 'Atenção'}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-1">
                {alert.message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Timeline */}
          <div className={`flex items-center gap-2 p-4 rounded-lg ${getAlertColor(alert.level)}`}>
            <Clock className={`w-5 h-5 ${getAlertTextColor(alert.level)}`} />
            <div>
              <p className="font-semibold text-sm">Timeline de Ação</p>
              <p className={`text-sm ${getAlertTextColor(alert.level)}`}>{alert.timeline}</p>
            </div>
          </div>

          {/* Indicators */}
          {alert.indicators.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
                Sinais Detectados
              </h4>
              <ul className="space-y-2">
                {alert.indicators.map((indicator, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      alert.level === 'critical' ? 'bg-red-500 animate-pulse' :
                      alert.level === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Urgent Actions */}
          {alert.urgentActions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Ações Recomendadas
              </h4>
              <ul className="space-y-2">
                {alert.urgentActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-primary mt-0.5 flex-shrink-0 font-bold">{i + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Emergency Options */}
          {alert.level === 'critical' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800 mb-3">
                ⚠️ Se a situação for urgente:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <Phone className="w-4 h-4" />
                  <span>Ligue para emergência: 192 (SAMU) ou 188 (CVV)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <MessageCircle className="w-4 h-4" />
                  <span>Entre em contato com o terapeuta imediatamente</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="secondary" onClick={handleViewDetails}>
            Ver Análise Detalhada
          </Button>
          <Button 
            onClick={handleEmergencyChat}
            className={
              alert.level === 'critical' 
                ? 'bg-red-600 hover:bg-red-700' 
                : alert.level === 'high'
                ? 'bg-orange-600 hover:bg-orange-700'
                : ''
            }
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Buscar Apoio Agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
