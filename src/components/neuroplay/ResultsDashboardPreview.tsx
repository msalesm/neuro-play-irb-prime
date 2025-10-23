import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResultsDashboardPreview() {
  const dimensions = [
    { name: 'Atenção', value: 85, color: 'hsl(var(--primary))' },
    { name: 'Memória', value: 92, color: 'hsl(var(--secondary))' },
    { name: 'Linguagem', value: 78, color: 'hsl(var(--accent))' },
    { name: 'Lógica', value: 88, color: '#10b981' },
    { name: 'Emoção', value: 82, color: '#f59e0b' },
    { name: 'Coordenação', value: 90, color: '#8b5cf6' },
  ];

  const maxValue = 100;
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  // Calculate radar chart points
  const points = dimensions.map((dim, index) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const value = (dim.value / maxValue) * radius;
    return {
      x: centerX + Math.cos(angle) * value,
      y: centerY + Math.sin(angle) * value,
      labelX: centerX + Math.cos(angle) * (radius + 30),
      labelY: centerY + Math.sin(angle) * (radius + 30),
      name: dim.name,
      value: dim.value,
    };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Dashboard de Resultados</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Visualize seu perfil cognitivo completo e acompanhe sua evolução
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Perfil Cognitivo</h3>
                
                <svg viewBox="0 0 300 300" className="w-full h-auto">
                  {/* Background circles */}
                  {[0.25, 0.5, 0.75, 1].map((scale) => (
                    <circle
                      key={scale}
                      cx={centerX}
                      cy={centerY}
                      r={radius * scale}
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  ))}

                  {/* Axis lines */}
                  {dimensions.map((_, index) => {
                    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    return (
                      <line
                        key={index}
                        x1={centerX}
                        y1={centerY}
                        x2={x}
                        y2={y}
                        stroke="hsl(var(--muted))"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    );
                  })}

                  {/* Data polygon */}
                  <path
                    d={pathData}
                    fill="hsl(var(--primary))"
                    fillOpacity="0.3"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />

                  {/* Data points */}
                  {points.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="hsl(var(--primary))"
                    />
                  ))}

                  {/* Labels */}
                  {points.map((point, index) => (
                    <g key={index}>
                      <text
                        x={point.labelX}
                        y={point.labelY}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-foreground"
                      >
                        {point.name}
                      </text>
                      <text
                        x={point.labelX}
                        y={point.labelY + 12}
                        textAnchor="middle"
                        className="text-xs fill-muted-foreground"
                      >
                        {point.value}%
                      </text>
                    </g>
                  ))}
                </svg>
              </CardContent>
            </Card>

            {/* Stats and Actions */}
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5">
                <CardContent className="p-8 text-center">
                  <Badge className="mb-4" variant="secondary">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Pontuação Geral
                  </Badge>
                  <div className="text-6xl font-bold text-primary mb-2">86</div>
                  <p className="text-muted-foreground">Desempenho Excelente</p>
                </CardContent>
              </Card>

              {/* Dimension Details */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Dimensões Cognitivas</h4>
                  <div className="space-y-3">
                    {dimensions.map((dim) => (
                      <div key={dim.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{dim.name}</span>
                          <span className="font-semibold">{dim.value}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-smooth"
                            style={{
                              width: `${dim.value}%`,
                              backgroundColor: dim.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Link to="/learning-dashboard">
                  <Button className="w-full" size="lg">
                    Ver Dashboard Completo
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Gerar Relatório PDF
                </Button>
              </div>

              {/* Recommendations */}
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Recomendações</h4>
                  <p className="text-sm text-muted-foreground">
                    Com base no seu perfil, recomendamos focar em jogos de linguagem e persistir nos exercícios de atenção.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
