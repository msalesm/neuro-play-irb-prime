import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Heart, Trophy, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PuzzlePiece {
  id: number;
  x: number;
  y: number;
  color: string;
  placedBy: 'host' | 'guest' | null;
}

export default function CooperativePuzzle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [session, setSession] = useState<any>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [collaborationScore, setCollaborationScore] = useState(100);
  const [isHost, setIsHost] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (sessionId) {
      loadSession();
      initializePuzzle();
    }
  }, [sessionId]);

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Real-time sync
    if (!sessionId) return;

    const channel = supabase
      .channel(`game_${sessionId}`)
      .on('broadcast', { event: 'piece_placed' }, ({ payload }) => {
        updatePiecePosition(payload.pieceId, payload.x, payload.y, payload.placedBy);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from('cooperative_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error loading session:', error);
      toast.error('Erro ao carregar sessão');
      return;
    }

    setSession(data);
    
    // Determine if current user is host
    const { data: profiles } = await supabase
      .from('child_profiles')
      .select('parent_user_id')
      .eq('id', data.host_profile_id)
      .single();

    setIsHost(profiles?.parent_user_id === user?.id);
  };

  const initializePuzzle = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const initialPieces: PuzzlePiece[] = [];

    for (let i = 0; i < 12; i++) {
      initialPieces.push({
        id: i,
        x: -1,
        y: -1,
        color: colors[i % colors.length],
        placedBy: null
      });
    }

    setPieces(initialPieces);
  };

  const updatePiecePosition = (pieceId: number, x: number, y: number, placedBy: 'host' | 'guest') => {
    setPieces(prev => prev.map(p => 
      p.id === pieceId ? { ...p, x, y, placedBy } : p
    ));
  };

  const handlePiecePlacement = async (pieceId: number, x: number, y: number) => {
    const role = isHost ? 'host' : 'guest';
    
    updatePiecePosition(pieceId, x, y, role);
    setSelectedPiece(null);
    setScore(prev => prev + 10);

    // Broadcast to other player
    if (sessionId) {
      await supabase.channel(`game_${sessionId}`).send({
        type: 'broadcast',
        event: 'piece_placed',
        payload: { pieceId, x, y, placedBy: role }
      });
    }

    // Check if puzzle is complete
    const placedPieces = pieces.filter(p => p.x >= 0 && p.y >= 0).length + 1;
    if (placedPieces === pieces.length) {
      completePuzzle();
    }
  };

  const completePuzzle = async () => {
    // Calculate bonding metrics
    const hostPieces = pieces.filter(p => p.placedBy === 'host').length;
    const guestPieces = pieces.filter(p => p.placedBy === 'guest').length;
    const balance = 100 - Math.abs(hostPieces - guestPieces) * 10; // More balanced = higher score

    const bondingQuality = Math.min(100, (collaborationScore + balance) / 2);

    // Update session
    if (sessionId) {
      await supabase
        .from('cooperative_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          session_data: {
            score,
            timeElapsed,
            bondingQuality,
            collaborationScore,
            balanceScore: balance
          }
        })
        .eq('id', sessionId);
    }

    toast.success('Quebra-cabeça completado!', {
      description: `Qualidade do vínculo: ${Math.round(bondingQuality)}%`
    });

    setTimeout(() => {
      navigate('/dashboard-pais');
    }, 3000);
  };

  const unplacedPieces = pieces.filter(p => p.x === -1);
  const progress = ((pieces.length - unplacedPieces.length) / pieces.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard-pais')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">Quebra-Cabeça Cooperativo</h1>
                <p className="text-muted-foreground">Trabalhem juntos para completar!</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-xs text-muted-foreground">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
                  <div className="text-xs text-muted-foreground">Completo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground">Tempo</div>
                </div>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardContent>
        </Card>

        {/* Game Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Puzzle Grid */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-2 aspect-square bg-gray-100 rounded-lg p-4">
                {Array.from({ length: 12 }).map((_, i) => {
                  const x = i % 4;
                  const y = Math.floor(i / 4);
                  const piece = pieces.find(p => p.x === x && p.y === y);

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (selectedPiece !== null && !piece) {
                          handlePiecePlacement(selectedPiece, x, y);
                        }
                      }}
                      className={`
                        aspect-square rounded-lg border-2 transition-all cursor-pointer
                        ${piece ? '' : 'border-dashed border-gray-300 hover:border-blue-400'}
                        ${selectedPiece !== null && !piece ? 'bg-blue-100' : ''}
                      `}
                      style={{ backgroundColor: piece?.color }}
                    >
                      {piece && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {piece.placedBy === 'host' ? '👨‍👩‍👧' : '👧'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Available Pieces */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Peças Disponíveis
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {unplacedPieces.map(piece => (
                    <div
                      key={piece.id}
                      onClick={() => setSelectedPiece(piece.id)}
                      className={`
                        aspect-square rounded-lg cursor-pointer transition-all
                        ${selectedPiece === piece.id ? 'ring-4 ring-blue-400 scale-105' : ''}
                      `}
                      style={{ backgroundColor: piece.color }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Métricas de Vínculo
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Colaboração</span>
                      <span className="font-bold">{collaborationScore}%</span>
                    </div>
                    <Progress value={collaborationScore} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    💡 Trabalhem juntos para encontrar o melhor lugar para cada peça!
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
