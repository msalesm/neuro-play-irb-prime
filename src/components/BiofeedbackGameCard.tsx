import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Brain, Heart, Target, Zap } from 'lucide-react';

export function BiofeedbackGameCard() {
  return (
    <Card className="group hover:shadow-glow transition-all duration-300 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary-glow/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Sistema de Biofeedback</CardTitle>
              <CardDescription>
                Regulação emocional em tempo real
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-blue-100">
            NOVO
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sistema inteligente que monitora padrões de comportamento e ativa exercícios de respiração 
          guiada quando detecta impulsividade ou frustração.
        </p>
        
        {/* Features */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-3 w-3 text-red-500" />
            <span>Detecção automática</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-3 w-3 text-blue-500" />
            <span>Exercícios guiados</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Brain className="h-3 w-3 text-purple-500" />
            <span>Análise comportamental</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="h-3 w-3 text-orange-500" />
            <span>Regulação emocional</span>
          </div>
        </div>
        
        {/* Energy Bar Preview */}
        <div className="bg-muted/50 rounded-lg p-3 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Energia Emocional</span>
            <span className="text-xs">45%</span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-500" 
                 style={{ width: '45%' }} />
          </div>
        </div>
        
        <Button asChild className="w-full group-hover:shadow-md transition-shadow">
          <Link to="/games/biofeedback-demo">
            Experimentar Demo
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}