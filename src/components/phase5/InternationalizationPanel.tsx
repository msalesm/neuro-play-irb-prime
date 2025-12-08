import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe, Check, Languages, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const languages: { 
  code: Language; 
  name: string; 
  nativeName: string;
  flag: string;
  region: string;
}[] = [
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', region: 'Brasil' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'United States' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'España' },
];

export function InternationalizationPanel() {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    toast.success(t('phase5.internationalization.languageChanged'));
  };

  return (
    <div className="space-y-6">
      {/* Current Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t('phase5.internationalization.currentLanguage')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
            <span className="text-4xl">
              {languages.find(l => l.code === language)?.flag}
            </span>
            <div>
              <p className="font-semibold text-lg">
                {languages.find(l => l.code === language)?.nativeName}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {languages.find(l => l.code === language)?.region}
              </p>
            </div>
            <Badge variant="default" className="ml-auto">
              <Check className="h-3 w-3 mr-1" />
              {t('phase5.wearables.connected')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Available Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            {t('phase5.internationalization.availableLanguages')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  language === lang.code
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{lang.flag}</span>
                  {language === lang.code && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="mt-3">
                  <p className="font-semibold">{lang.nativeName}</p>
                  <p className="text-sm text-muted-foreground">{lang.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {lang.region}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language Features */}
      <Card>
        <CardHeader>
          <CardTitle>{t('phase5.internationalization.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">🎮 {t('games.dailyGame.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {language === 'pt' && 'Todos os jogos traduzidos para português'}
                {language === 'en' && 'All games translated to English'}
                {language === 'es' && 'Todos los juegos traducidos al español'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">📚 {t('phase5.marketplace.socialStories')}</h4>
              <p className="text-sm text-muted-foreground">
                {language === 'pt' && 'Histórias sociais em português brasileiro'}
                {language === 'en' && 'Social stories in American English'}
                {language === 'es' && 'Historias sociales en español'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">📊 {t('clinical.automaticReports')}</h4>
              <p className="text-sm text-muted-foreground">
                {language === 'pt' && 'Relatórios clínicos em português'}
                {language === 'en' && 'Clinical reports in English'}
                {language === 'es' && 'Informes clínicos en español'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">💬 {t('phase5.teleorientation.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {language === 'pt' && 'Suporte em português'}
                {language === 'en' && 'Support in English'}
                {language === 'es' && 'Soporte en español'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
