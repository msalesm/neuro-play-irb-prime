import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ChildData } from '@/pages/StudentHub';

interface Props {
  childData: ChildData;
}

export function StudentHubHeader({ childData }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/student-hub" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-foreground text-lg">NeuroPlay</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground" asChild>
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Link>
          </Button>

          <Link to="/settings">
            <Avatar className="h-9 w-9 border-2 border-primary/30">
              {childData.avatar_url ? (
                <AvatarImage src={childData.avatar_url} alt={childData.name} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                {childData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
