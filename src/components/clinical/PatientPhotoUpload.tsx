import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientAvatar } from './PatientAvatar';
import { cn } from '@/lib/utils';

interface PatientPhotoUploadProps {
  patientId: string;
  currentPhotoUrl?: string | null;
  patientName: string;
  size?: 'md' | 'lg' | 'xl';
  onPhotoUpdated?: (url: string) => void;
}

export function PatientPhotoUpload({
  patientId,
  currentPhotoUrl,
  patientName,
  size = 'xl',
  onPhotoUpdated,
}: PatientPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${patientId}/photo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('patient-photos')
        .getPublicUrl(path);

      const photoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('children')
        .update({ avatar_url: photoUrl })
        .eq('id', patientId);

      if (updateError) throw updateError;

      toast.success('Foto atualizada');
      onPhotoUpdated?.(photoUrl);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <PatientAvatar
        photoUrl={currentPhotoUrl}
        name={patientName}
        size={size}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full",
          "bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity",
          "cursor-pointer"
        )}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Camera className="h-5 w-5 text-white" />
        )}
      </button>
    </div>
  );
}
