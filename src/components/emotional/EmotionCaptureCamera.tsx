import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface EmotionResult {
  success: boolean;
  primaryEmotion: string;
  detectedEmotions: string[];
  moodRating: number;
  confidence: number;
  error?: string;
  message?: string;
}

interface EmotionCaptureCameraProps {
  onEmotionCaptured: (result: EmotionResult) => void;
  onClose: () => void;
  childId?: string;
  childName?: string;
}

const moodEmojis: Record<number, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😄',
};

const emotionColors: Record<string, string> = {
  'Feliz': 'bg-green-500',
  'Triste': 'bg-blue-500',
  'Irritado': 'bg-red-500',
  'Surpreso': 'bg-yellow-500',
  'Neutro': 'bg-gray-500',
};

export function EmotionCaptureCamera({ onEmotionCaptured, onClose, childId, childName }: EmotionCaptureCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { t } = useLanguage();

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar a câmera.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    setError(null);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageBase64);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-emotion', {
        body: { imageBase64, childId },
      });
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      if (data.error === 'no_face_detected') {
        setError(data.message);
        setCapturedImage(null);
        setIsCapturing(false);
        return;
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao analisar emoção');
      }
      
      setResult(data);
      stopCamera();
      
    } catch (err) {
      console.error('Error analyzing emotion:', err);
      setError('Erro ao analisar emoção. Tente novamente.');
      setCapturedImage(null);
    } finally {
      setIsCapturing(false);
    }
  }, [childId, stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    startCamera();
  }, [startCamera]);

  const confirmResult = useCallback(() => {
    if (result) {
      onEmotionCaptured(result);
      stopCamera();
      onClose();
    }
  }, [result, onEmotionCaptured, stopCamera, onClose]);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {childName ? `Capturar emoção de ${childName}` : 'Captura de Emoção'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
          {!result && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`}
              />
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}
            </>
          )}
          
          {result && capturedImage && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Analyzed"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{moodEmojis[result.moodRating]}</span>
                  <div>
                    <p className="text-white font-semibold text-lg">{result.primaryEmotion}</p>
                    <p className="text-white/80 text-sm">{result.confidence}% confiança</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
          
          {isCapturing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
          
          {!isStreaming && !capturedImage && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        {result && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {result.detectedEmotions.map((emotion, i) => (
                <Badge
                  key={i}
                  className={`${emotionColors[emotion] || 'bg-gray-500'} text-white`}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={retake} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tirar outra
              </Button>
              <Button onClick={confirmResult} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </div>
        )}
        
        {!result && (
          <div className="flex gap-2">
            <Button
              onClick={capturePhoto}
              disabled={!isStreaming || isCapturing}
              className="flex-1"
            >
              {isCapturing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              Capturar
            </Button>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground text-center">
          Posicione o rosto {childName ? `de ${childName}` : 'da criança'} no centro da câmera
        </p>
      </CardContent>
    </Card>
  );
}
