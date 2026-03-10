import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PatientAvatarProps {
  photoUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base',
  xl: 'h-24 w-24 text-xl'
};

export function PatientAvatar({ photoUrl, name, size = 'md', className }: PatientAvatarProps) {
  const isValidUrl = photoUrl && typeof photoUrl === 'string' && (
    photoUrl.startsWith('http') || photoUrl.startsWith('/')
  );

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {isValidUrl && (
        <AvatarImage src={photoUrl} alt={name} className="object-cover" />
      )}
      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
