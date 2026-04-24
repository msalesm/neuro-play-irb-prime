import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  Icon: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaTo?: string;
  onCta?: () => void;
  className?: string;
}

/** Padrão de empty state amigável usado em Educação/Dashboard. */
export function EmptyState({ Icon, title, description, ctaLabel, ctaTo, onCta, className }: Props) {
  const button =
    ctaLabel ? (
      ctaTo ? (
        <Button asChild size="sm" className="mt-3">
          <Link to={ctaTo}>{ctaLabel}</Link>
        </Button>
      ) : (
        <Button size="sm" className="mt-3" onClick={onCta}>
          {ctaLabel}
        </Button>
      )
    ) : null;

  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="py-10 sm:py-14 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-semibold text-base sm:text-lg text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        )}
        {button}
      </CardContent>
    </Card>
  );
}