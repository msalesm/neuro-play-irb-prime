import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, PenLine, Eraser, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export interface PEISignature {
  id: string;
  type: 'signature';
  date: string;
  signer_name: string;
  signer_role?: string;
  attested: boolean;
  signature_image?: string; // dataURL opcional
  evolution_summary?: string;
}

interface PEISignaturePanelProps {
  signatures: PEISignature[];
  isEditing: boolean;
  defaultSignerName: string;
  defaultSignerRole?: string;
  onSign: (s: Omit<PEISignature, 'id' | 'type'>) => void;
}

export function PEISignaturePanel({
  signatures,
  isEditing,
  defaultSignerName,
  defaultSignerRole,
  onSign,
}: PEISignaturePanelProps) {
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [evolutionSummary, setEvolutionSummary] = useState('');
  const [attested, setAttested] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setSignerName(defaultSignerName);
  }, [defaultSignerName]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  };

  useEffect(() => {
    setupCanvas();
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    lastPoint.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !lastPoint.current) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPoint.current = p;
    setHasInk(true);
  };

  const endDraw = () => {
    setDrawing(false);
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    setupCanvas();
    setHasInk(false);
  };

  const handleSign = () => {
    if (!attested) {
      toast.error('Marque o atesto da evolução antes de assinar.');
      return;
    }
    if (!signerName.trim()) {
      toast.error('Informe o nome de quem está assinando.');
      return;
    }
    let signature_image: string | undefined;
    if (hasInk && canvasRef.current) {
      signature_image = canvasRef.current.toDataURL('image/png');
    }
    onSign({
      date: new Date().toISOString(),
      signer_name: signerName.trim(),
      signer_role: defaultSignerRole,
      attested: true,
      signature_image,
      evolution_summary: evolutionSummary.trim() || undefined,
    });
    setAttested(false);
    setEvolutionSummary('');
    clearCanvas();
    toast.success('Evolução do PEI assinada.');
  };

  const sorted = [...signatures].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Histórico de assinaturas
          </CardTitle>
          <CardDescription>
            Cada assinatura registra que o(a) responsável atestou a evolução do plano em uma
            data específica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma assinatura registrada ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {sorted.map((s) => (
                <div key={s.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-medium">{s.signer_name}</p>
                      {s.signer_role && (
                        <p className="text-xs text-muted-foreground">{s.signer_role}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(s.date).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </Badge>
                  </div>
                  {s.evolution_summary && (
                    <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
                      {s.evolution_summary}
                    </p>
                  )}
                  {s.signature_image && (
                    <img
                      src={s.signature_image}
                      alt={`Assinatura de ${s.signer_name}`}
                      className="h-20 bg-white border rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" />
              Atestar e assinar evolução
            </CardTitle>
            <CardDescription>
              O atesto via checkbox é obrigatório. A assinatura desenhada é opcional, útil
              quando a escola exige documento físico.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="signer-name">Nome do responsável</Label>
                <Input
                  id="signer-name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                />
              </div>
              <div>
                <Label>Função</Label>
                <Input value={defaultSignerRole || 'Professor(a)'} disabled />
              </div>
            </div>

            <div>
              <Label htmlFor="evolution-summary">Resumo da evolução (opcional)</Label>
              <Input
                id="evolution-summary"
                placeholder="Ex.: Fechamento do bimestre — meta de leitura consolidada"
                value={evolutionSummary}
                onChange={(e) => setEvolutionSummary(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
              <Checkbox
                id="attest"
                checked={attested}
                onCheckedChange={(v) => setAttested(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="attest" className="text-sm leading-snug cursor-pointer">
                Atesto, sob minha responsabilidade pedagógica, que as informações de evolução
                registradas neste PEI refletem o desempenho real do aluno na data de hoje.
              </Label>
            </div>

            <div>
              <Label className="block mb-2">Assinatura desenhada (opcional)</Label>
              <div className="border rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={160}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  Desenhe com o mouse ou o dedo. Use "Limpar" para refazer.
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={clearCanvas}>
                  <Eraser className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>

            <Button onClick={handleSign} className="w-full" disabled={!attested}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Registrar assinatura
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}