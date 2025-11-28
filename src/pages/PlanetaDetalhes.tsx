import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { planetas } from '@/data/planetas';
import { 
  ArrowLeft, Trophy, Target, Clock, Star, 
  Lock, CheckCircle2, Play, Sparkles 
} from 'lucide-react';

export default function PlanetaDetalhes() {
  const { planetaId } = useParams<{ planetaId: string }>();
  const navigate = useNavigate();
  
  const planeta = planetas.find(p => p.id === planetaId);

  if (!planeta) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1e35] to-[#005a70] flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle>Planeta não encontrado</CardTitle>
            <CardDescription>O planeta que você está procurando não existe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/sistema-planeta-azul')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressoPercentual = (planeta.progressoAtual / planeta.totalMissoes) * 100;
  const jogosCompletados = planeta.jogos.filter(j => j.completado).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1e35] via-[#005a70] to-[#0a1e35] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/sistema-planeta-azul')}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Sistema
        </Button>

        {/* Planet Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
            <div 
              className="h-2"
              style={{ backgroundColor: planeta.cor }}
            />
            <CardContent className="p-8">
              <div className="flex items-start gap-6 flex-wrap">
                {/* Planet Icon */}
                <motion.div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 flex-shrink-0"
                  style={{ 
                    backgroundColor: `${planeta.cor}40`,
                    borderColor: planeta.cor 
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                >
                  {planeta.icone}
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">
                        {planeta.nome}
                      </h1>
                      <Badge 
                        className="text-sm"
                        style={{ 
                          backgroundColor: planeta.cor,
                          color: 'white'
                        }}
                      >
                        {planeta.diagnostico}
                      </Badge>
                    </div>
                    {planeta.progressoAtual === planeta.totalMissoes && (
                      <Badge className="bg-[#c7923e] text-white gap-1">
                        <Trophy className="w-4 h-4" />
                        Completo
                      </Badge>
                    )}
                  </div>

                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                    {planeta.descricao}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm text-white">
                      <span>Progresso no Planeta</span>
                      <span className="font-bold">
                        {planeta.progressoAtual}/{planeta.totalMissoes} missões • {Math.round(progressoPercentual)}%
                      </span>
                    </div>
                    <Progress value={progressoPercentual} className="h-3" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Play className="w-4 h-4 text-[#c7923e]" />
                        <span className="text-xs text-white/60">Jogos</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {planeta.jogos.length}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-white/60">Completos</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {jogosCompletados}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-white/60">Focos</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {planeta.focos.length}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-white/60">Duração</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {planeta.jogos.reduce((acc, j) => acc + j.duracao, 0)} min
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Focos Terapêuticos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Focos Terapêuticos
              </CardTitle>
              <CardDescription className="text-white/60">
                Áreas de desenvolvimento trabalhadas neste planeta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {planeta.focos.map((foco, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: planeta.cor }}
                    />
                    <span className="text-white text-sm">{foco}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Jogos Disponíveis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Play className="w-5 h-5" />
                Jogos Disponíveis
              </CardTitle>
              <CardDescription className="text-white/60">
                Complete todos os jogos para desbloquear a recompensa do planeta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planeta.jogos.map((jogo, idx) => (
                  <motion.div
                    key={jogo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
                            style={{ backgroundColor: `${planeta.cor}30` }}
                          >
                            {jogo.icone}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="text-white font-semibold">
                                {jogo.nome}
                              </h3>
                              {jogo.completado && (
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-white/60 text-sm mb-3 line-clamp-2">
                              {jogo.descricao}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {jogo.duracao} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Nível {jogo.dificuldade}
                              </span>
                            </div>
                            <Button
                              className="w-full"
                              size="sm"
                              onClick={() => navigate(jogo.rota)}
                              disabled={!planeta.desbloqueado}
                              style={{
                                backgroundColor: planeta.desbloqueado ? planeta.cor : undefined,
                              }}
                            >
                              {jogo.completado ? 'Jogar Novamente' : 'Começar Jogo'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recompensa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card 
            className="bg-white/10 backdrop-blur-md border-2 overflow-hidden"
            style={{ borderColor: `${planeta.cor}80` }}
          >
            <div 
              className="h-1"
              style={{ backgroundColor: planeta.cor }}
            />
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#c7923e]" />
                Recompensa Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  {planeta.progressoAtual === planeta.totalMissoes ? '✨' : '🔒'}
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-lg mb-2">
                    {planeta.recompensa}
                  </p>
                  {planeta.progressoAtual === planeta.totalMissoes ? (
                    <Badge className="bg-[#c7923e] text-white">
                      Recompensa Desbloqueada!
                    </Badge>
                  ) : (
                    <p className="text-white/60 text-sm">
                      Complete {planeta.totalMissoes - planeta.progressoAtual} missões restantes para desbloquear
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}