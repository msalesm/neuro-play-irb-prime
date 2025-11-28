import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarData {
  id: string;
  name: string;
  emoji: string;
  category: 'animals' | 'robots' | 'heroes';
}

interface ChildAvatarDisplayProps {
  avatar?: AvatarData | string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-lg',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-16 w-16 text-3xl',
  xl: 'h-24 w-24 text-5xl'
};

export const ChildAvatarDisplay = ({ 
  avatar, 
  name = 'Criança',
  size = 'md',
  className 
}: ChildAvatarDisplayProps) => {
  // Parse avatar if it's a string
  let avatarData: AvatarData | null = null;
  if (typeof avatar === 'string') {
    try {
      avatarData = JSON.parse(avatar);
    } catch {
      avatarData = null;
    }
  } else if (avatar) {
    avatarData = avatar;
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarData ? (
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
          <span>{avatarData.emoji}</span>
        </AvatarFallback>
      ) : (
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
};
