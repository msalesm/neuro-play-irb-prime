import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

interface LanguageSelectorProps {
  variant?: 'icon' | 'full' | 'minimal';
  showFlag?: boolean;
}

export function LanguageSelector({ variant = 'icon', showFlag = true }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  
  const currentLang = languages.find(l => l.code === language);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    toast.success(t('phase5.internationalization.languageChanged'));
  };

  if (variant === 'minimal') {
    return (
      <div className="flex gap-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLanguageChange(lang.code)}
            className="px-2"
          >
            {lang.flag}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={variant === 'icon' ? 'icon' : 'default'} className="gap-2">
          {variant === 'icon' ? (
            <>
              <Globe className="h-4 w-4" />
              {showFlag && <span>{currentLang?.flag}</span>}
            </>
          ) : (
            <>
              {showFlag && <span>{currentLang?.flag}</span>}
              <Globe className="h-4 w-4" />
              <span>{currentLang?.name}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-50 bg-background border shadow-lg">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
