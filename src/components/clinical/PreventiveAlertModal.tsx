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
      case 'critical': return 'border-destructive bg-destructive/5';
      case 'high': return 'border-warning bg-warning/5';
      case 'medium': return 'border-accent bg-accent/5';
      default: return 'border-muted-foreground bg-muted';
    }
  };

  const getAlertTextColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'medium': return 'text-accent';
      default: return 'text-muted-foreground';
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
                      alert.level === 'critical' ? 'bg-destructive animate-pulse' :
                      alert.level === 'high' ? 'bg-warning' :
                      'bg-warning/70'
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
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-destructive mb-3">
                ⚠️ Se a situação for urgente:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <Phone className="w-4 h-4" />
                  <span>Ligue para emergência: 192 (SAMU) ou 188 (CVV)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-destructive">
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
                ? 'bg-destructive hover:bg-destructive/90' 
                : alert.level === 'high'
                ? 'bg-warning hover:bg-warning/90 text-warning-foreground'
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
