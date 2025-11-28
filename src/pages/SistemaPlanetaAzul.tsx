import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpaceMap } from '@/components/planeta-azul/SpaceMap';
import { PlanetCard } from '@/components/planeta-azul/PlanetCard';
import { planetas } from '@/data/planetas';
import { Sparkles, Map, Grid3x3, Trophy, Rocket, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Planeta } from '@/types/planeta';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePlanetProgress } from '@/hooks/usePlanetProgress';

type ViewMode = 'mapa' | 'grid';

export default function SistemaPlanetaAzul() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('mapa');
  const [selectedPlanet, setSelectedPlanet] = useState<Planeta | null>(null);
  const [childAvatar, setChildAvatar] = useState<string | null>(null);
  const [childName, setChildName] = useState<string>('Explorador');
  const [childId, setChildId] = useState<string | null>(null);
  const { progress } = usePlanetProgress(childId);

  useEffect(() => {
    if (user) {
      loadChildData();
    }
  }, [user]);

  const loadChildData = async () => {
    try {
      const { data: children, error } = await supabase
        .from('children')
        .select('id, name, avatar_url')
        .eq('parent_id', user?.id)
        .limit(1)
        .single();

      if (error) throw error;

      if (children) {
        setChildId(children.id);
        setChildName(children.name || 'Explorador');
        setChildAvatar(children.avatar_url);
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  // Calculate progress from real data
  const totalMissoes = planetas.reduce((acc, p) => acc + p.totalMissoes, 0);
  const missoesCompletas = Object.values(progress).reduce(
    (acc, p) => acc + p.jogosCompletados.length, 
    0
  );
  const planetasCompletos = planetas.filter(p => {
    const planetProgress = progress[p.id];
    return planetProgress && planetProgress.jogosCompletados.length >= p.totalMissoes;
  }).length;
  const progressoGeral = totalMissoes > 0 ? (missoesCompletas / totalMissoes) * 100 : 0;

  const handlePlanetClick = (planeta: Planeta) => {
    setSelectedPlanet(planeta);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1e35] via-[#005a70] to-[#0a1e35] relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard-pais')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <ChildAvatarDisplay
                avatar={childAvatar}
                name={childName}
                size="md"
              />
              <span className="text-white font-semibold">{childName}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <motion.h1 
                className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-[#c7923e] to-white bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Sistema Planeta Azul
              </motion.h1>
              <p className="text-white/80 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#c7923e]" />
                Explore universos terapêuticos e domine habilidades cognitivas
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'mapa' ? 'default' : 'outline'}
                onClick={() => setViewMode('mapa')}
                className={viewMode === 'mapa' ? 'bg-[#c7923e] hover:bg-[#c7923e]/90' : 'border-white/20 text-white hover:bg-white/10'}
              >
                <Map className="w-4 h-4 mr-2" />
                Mapa Espacial
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-[#c7923e] hover:bg-[#c7923e]/90' : 'border-white/20 text-white hover:bg-white/10'}
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                Visualização em Grade
              </Button>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#c7923e]/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-[#c7923e]" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Progresso Geral</p>
                  <p className="text-white text-2xl font-bold">{Math.round(progressoGeral)}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Missões</p>
                  <p className="text-white text-2xl font-bold">{missoesCompletas}/{totalMissoes}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Planetas Completos</p>
                  <p className="text-white text-2xl font-bold">{planetasCompletos}/{planetas.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">🪐</span>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Planetas Ativos</p>
                  <p className="text-white text-2xl font-bold">{planetas.filter(p => p.desbloqueado).length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'mapa' ? (
            <motion.div
              key="mapa"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <SpaceMap 
                planetas={planetas}
                onPlanetClick={handlePlanetClick}
                selectedPlanetId={selectedPlanet?.id}
              />

              {/* Selected Planet Details */}
              {selectedPlanet && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <PlanetCard 
                    planeta={selectedPlanet}
                    onClick={() => setSelectedPlanet(null)}
                  />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {planetas.map((planeta, index) => (
                <motion.div
                  key={planeta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PlanetCard planeta={planeta} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <Card className="mt-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#c7923e]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#c7923e]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold mb-2">
                  Como funciona o Sistema Planeta Azul?
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-3">
                  Cada planeta representa uma área terapêutica específica com jogos e desafios personalizados. 
                  Complete missões para desbloquear recompensas, revelar novos conteúdos e dominar habilidades cognitivas essenciais.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    🎮 {totalMissoes} Jogos Terapêuticos
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    🎯 Adaptação por IA
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    📊 Análise em Tempo Real
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    🏆 Sistema de Recompensas
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}