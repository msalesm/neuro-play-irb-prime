import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpaceMap } from '@/components/planeta-azul/SpaceMap';
import { planetas as planetasData } from '@/data/planetas';
import type { Planeta } from '@/types/planeta';
import { Rocket, ArrowLeft, Sparkles } from 'lucide-react';

export default function SistemaPlanetaAzul() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Planeta | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground p-6">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-3 -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="h-7 w-7" />
            <h1 className="text-2xl md:text-3xl font-bold">Sistema Planeta Azul</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm md:text-base max-w-2xl">
            Explore planetas temáticos com jogos e missões pedagógicas. Cada planeta
            trabalha um conjunto de habilidades cognitivas e sensoriais.
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <SpaceMap
          planetas={planetasData}
          selectedPlanetId={selected?.id}
          onPlanetClick={(p) => setSelected(p)}
        />
      </div>

      {/* Selected planet detail */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-4"
        >
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md flex-shrink-0"
                  style={{ backgroundColor: `${selected.cor}40`, border: `2px solid ${selected.cor}` }}
                >
                  {selected.icone}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{selected.nome}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selected.descricao}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Focos pedagógicos</p>
                <div className="flex flex-wrap gap-2">
                  {selected.focos.map((f) => (
                    <Badge key={f} variant="secondary">{f}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Jogos disponíveis
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selected.jogos.map((j) => (
                    <button
                      key={j.id}
                      onClick={() => navigate(j.rota)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-muted/40 transition text-left"
                    >
                      <span className="text-2xl">{j.icone}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{j.nome}</p>
                        <p className="text-xs text-muted-foreground">{j.duracao} min · Nível {j.dificuldade}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => navigate(`/planeta/${selected.id}`)}
              >
                Abrir planeta
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
