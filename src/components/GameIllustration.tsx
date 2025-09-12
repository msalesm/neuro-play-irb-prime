import React from 'react';

interface GameIllustrationProps {
  gameId: string;
  className?: string;
  animated?: boolean;
}

// SVG Illustrations for each game
const MemoriaColorida = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="memoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <circle cx="30" cy="30" r="12" fill="#FF6B6B" className={animated ? "animate-pulse" : ""} />
    <circle cx="60" cy="30" r="12" fill="#4ECDC4" className={animated ? "animate-pulse animation-delay-100" : ""} />
    <circle cx="90" cy="30" r="12" fill="#45B7D1" className={animated ? "animate-pulse animation-delay-200" : ""} />
    <circle cx="30" cy="60" r="12" fill="#F9CA24" className={animated ? "animate-pulse animation-delay-300" : ""} />
    <circle cx="60" cy="60" r="12" fill="#6C5CE7" className={animated ? "animate-pulse animation-delay-400" : ""} />
    <circle cx="90" cy="60" r="12" fill="#FD79A8" className={animated ? "animate-pulse animation-delay-500" : ""} />
    <circle cx="45" cy="90" r="8" fill="url(#memoryGrad)" className={animated ? "animate-ping" : ""} />
    <circle cx="75" cy="90" r="8" fill="url(#memoryGrad)" className={animated ? "animate-ping animation-delay-300" : ""} />
  </svg>
);

const CacaFoco = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <radialGradient id="searchGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFD93D" />
        <stop offset="100%" stopColor="#FF6B6B" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="25" fill="none" stroke="url(#searchGrad)" strokeWidth="3" className={animated ? "animate-pulse" : ""} />
    <circle cx="50" cy="50" r="15" fill="url(#searchGrad)" opacity="0.3" />
    <line x1="70" y1="70" x2="85" y2="85" stroke="url(#searchGrad)" strokeWidth="4" strokeLinecap="round" className={animated ? "animate-pulse" : ""} />
    <circle cx="25" cy="25" r="4" fill="#4ECDC4" opacity="0.6" />
    <circle cx="85" cy="30" r="3" fill="#45B7D1" opacity="0.6" />
    <circle cx="90" cy="80" r="5" fill="#6C5CE7" opacity="0.6" />
    <circle cx="20" cy="80" r="3" fill="#FD79A8" opacity="0.6" />
    <path d="M45,45 L55,45 M45,50 L55,50 M45,55 L55,55" stroke="#fff" strokeWidth="2" opacity="0.8" />
  </svg>
);

const LogicaRapida = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="logicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <path d="M30,30 L50,30 L50,50 L30,50 Z" fill="url(#logicGrad)" className={animated ? "animate-bounce" : ""} />
    <path d="M70,30 L90,30 L90,50 L70,50 Z" fill="#FF6B6B" opacity="0.8" className={animated ? "animate-bounce animation-delay-100" : ""} />
    <path d="M30,70 L50,70 L50,90 L30,90 Z" fill="#4ECDC4" opacity="0.8" className={animated ? "animate-bounce animation-delay-200" : ""} />
    <path d="M70,70 L90,70 L90,90 L70,90 Z" fill="url(#logicGrad)" className={animated ? "animate-bounce animation-delay-300" : ""} />
    <path d="M55,20 L65,40 L45,40 Z" fill="#FFD93D" className={animated ? "animate-pulse" : ""} />
    <circle cx="60" cy="60" r="8" fill="#FD79A8" opacity="0.7" className={animated ? "animate-ping" : ""} />
  </svg>
);

const RitmoMusical = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="musicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EF4444" />
      </linearGradient>
    </defs>
    <ellipse cx="25" cy="80" rx="8" ry="6" fill="url(#musicGrad)" className={animated ? "animate-bounce" : ""} />
    <ellipse cx="45" cy="70" rx="8" ry="6" fill="url(#musicGrad)" className={animated ? "animate-bounce animation-delay-100" : ""} />
    <ellipse cx="65" cy="60" rx="8" ry="6" fill="url(#musicGrad)" className={animated ? "animate-bounce animation-delay-200" : ""} />
    <ellipse cx="85" cy="50" rx="8" ry="6" fill="url(#musicGrad)" className={animated ? "animate-bounce animation-delay-300" : ""} />
    <line x1="33" y1="80" x2="33" y2="50" stroke="url(#musicGrad)" strokeWidth="2" />
    <line x1="53" y1="70" x2="53" y2="40" stroke="url(#musicGrad)" strokeWidth="2" />
    <line x1="73" y1="60" x2="73" y2="30" stroke="url(#musicGrad)" strokeWidth="2" />
    <line x1="93" y1="50" x2="93" y2="20" stroke="url(#musicGrad)" strokeWidth="2" />
    <path d="M20,30 Q35,25 50,30 Q65,35 80,30 Q95,25 110,30" stroke="#4ECDC4" strokeWidth="2" fill="none" opacity="0.6" className={animated ? "animate-pulse" : ""} />
  </svg>
);

const CacaLetras = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="letterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <text x="25" y="40" fontSize="18" fontWeight="bold" fill="url(#letterGrad)" className={animated ? "animate-pulse" : ""}>A</text>
    <text x="55" y="40" fontSize="18" fontWeight="bold" fill="#6B7280" opacity="0.5">B</text>
    <text x="85" y="40" fontSize="18" fontWeight="bold" fill="#6B7280" opacity="0.3">C</text>
    <text x="25" y="70" fontSize="18" fontWeight="bold" fill="#6B7280" opacity="0.4">D</text>
    <text x="55" y="70" fontSize="18" fontWeight="bold" fill="url(#letterGrad)" className={animated ? "animate-pulse animation-delay-200" : ""}>E</text>
    <text x="85" y="70" fontSize="18" fontWeight="bold" fill="#6B7280" opacity="0.5">F</text>
    <text x="25" y="100" fontSize="18" fontWeight="bold" fill="#6B7280" opacity="0.3">G</text>
    <text x="55" y="100" fontSize="18" fontWeight="bold" fill="#6B7280" opacity="0.4">H</text>
    <text x="85" y="100" fontSize="18" fontWeight="bold" fill="url(#letterGrad)" className={animated ? "animate-pulse animation-delay-400" : ""}>I</text>
    <circle cx="25" cy="25" r="15" fill="none" stroke="url(#letterGrad)" strokeWidth="2" className={animated ? "animate-ping" : ""} />
  </svg>
);

const SilabaMagica = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="syllableGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <rect x="15" y="40" width="25" height="20" rx="4" fill="url(#syllableGrad)" className={animated ? "animate-bounce" : ""} />
    <text x="27" y="54" fontSize="10" fontWeight="bold" fill="white">CA</text>
    <rect x="50" y="40" width="25" height="20" rx="4" fill="#FF6B6B" className={animated ? "animate-bounce animation-delay-100" : ""} />
    <text x="62" y="54" fontSize="10" fontWeight="bold" fill="white">SA</text>
    <rect x="85" y="40" width="25" height="20" rx="4" fill="#4ECDC4" className={animated ? "animate-bounce animation-delay-200" : ""} />
    <text x="97" y="54" fontSize="10" fontWeight="bold" fill="white">DA</text>
    <path d="M27,70 Q35,75 43,70" stroke="url(#syllableGrad)" strokeWidth="2" fill="none" />
    <path d="M62,70 Q70,75 78,70" stroke="#FF6B6B" strokeWidth="2" fill="none" />
    <circle cx="60" cy="90" r="8" fill="#FFD93D" className={animated ? "animate-ping" : ""} />
    <path d="M55,85 L65,85 M60,80 L60,90" stroke="white" strokeWidth="2" />
  </svg>
);

const QuebraCabecaMagico = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="magicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <path d="M60,20 L70,40 L60,45 L50,40 Z" fill="url(#magicGrad)" />
    <ellipse cx="60" cy="50" rx="15" ry="8" fill="#1F2937" />
    <rect x="55" y="58" width="10" height="20" fill="url(#magicGrad)" />
    <circle cx="45" cy="35" r="3" fill="#FFD93D" className={animated ? "animate-bounce" : ""} />
    <circle cx="75" cy="30" r="2" fill="#4ECDC4" className={animated ? "animate-bounce animation-delay-100" : ""} />
    <circle cx="35" cy="50" r="2" fill="#FF6B6B" className={animated ? "animate-bounce animation-delay-200" : ""} />
    <path d="M30,80 L40,70 L50,80 L40,90 Z" fill="#4ECDC4" opacity="0.8" />
    <path d="M70,80 L80,70 L90,80 L80,90 Z" fill="#FF6B6B" opacity="0.8" />
    <path d="M50,95 L60,85 L70,95 L60,105 Z" fill="url(#magicGrad)" opacity="0.8" />
    <path d="M55,25 Q60,15 65,25" stroke="#FFD93D" strokeWidth="2" fill="none" className={animated ? "animate-pulse" : ""} />
  </svg>
);

const AventuraNumeros = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="treasureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect x="45" y="60" width="30" height="20" rx="4" fill="url(#treasureGrad)" />
    <rect x="50" y="55" width="20" height="10" rx="2" fill="#92400E" />
    <circle cx="55" cy="65" r="2" fill="#FCD34D" />
    <text x="30" y="35" fontSize="16" fontWeight="bold" fill="url(#treasureGrad)" className={animated ? "animate-bounce" : ""}>1</text>
    <text x="85" y="35" fontSize="16" fontWeight="bold" fill="#4ECDC4" className={animated ? "animate-bounce animation-delay-100" : ""}>2</text>
    <text x="25" y="95" fontSize="16" fontWeight="bold" fill="#FF6B6B" className={animated ? "animate-bounce animation-delay-200" : ""}>3</text>
    <text x="85" y="95" fontSize="16" fontWeight="bold" fill="#10B981" className={animated ? "animate-bounce animation-delay-300" : ""}>4</text>
    <path d="M30,40 Q45,50 60,40 Q75,30 90,40" stroke="url(#treasureGrad)" strokeWidth="2" fill="none" strokeDasharray="3,3" />
    <circle cx="60" cy="30" r="4" fill="#FFD93D" className={animated ? "animate-ping" : ""} />
    <path d="M58,26 L62,26 M60,24 L60,28" stroke="white" strokeWidth="1" />
  </svg>
);

const ContadorHistorias = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="storyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <rect x="40" y="30" width="40" height="50" rx="4" fill="url(#storyGrad)" />
    <rect x="42" y="32" width="36" height="46" rx="2" fill="white" opacity="0.9" />
    <line x1="45" y1="40" x2="75" y2="40" stroke="url(#storyGrad)" strokeWidth="2" />
    <line x1="45" y1="48" x2="70" y2="48" stroke="#6B7280" strokeWidth="1" />
    <line x1="45" y1="54" x2="72" y2="54" stroke="#6B7280" strokeWidth="1" />
    <line x1="45" y1="60" x2="68" y2="60" stroke="#6B7280" strokeWidth="1" />
    <circle cx="30" cy="25" r="6" fill="#FFD93D" className={animated ? "animate-bounce" : ""} />
    <circle cx="32" cy="23" r="1" fill="#1F2937" />
    <circle cx="28" cy="23" r="1" fill="#1F2937" />
    <path d="M26,27 Q30,29 34,27" stroke="#1F2937" strokeWidth="1" fill="none" />
    <circle cx="90" cy="70" r="5" fill="#4ECDC4" className={animated ? "animate-bounce animation-delay-200" : ""} />
    <path d="M86,68 L90,65 L94,68 L90,72 Z" fill="white" />
    <path d="M35,85 Q45,90 55,85 Q65,80 75,85" stroke="url(#storyGrad)" strokeWidth="2" fill="none" opacity="0.6" className={animated ? "animate-pulse" : ""} />
  </svg>
);

// Diagnostic Games
const AttentionSustained = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="attentionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="25" fill="none" stroke="url(#attentionGrad)" strokeWidth="3" />
    <circle cx="60" cy="60" r="15" fill="none" stroke="url(#attentionGrad)" strokeWidth="2" />
    <circle cx="60" cy="60" r="8" fill="url(#attentionGrad)" className={animated ? "animate-pulse" : ""} />
    <path d="M60,20 L65,35 L60,40 L55,35 Z" fill="#FFD93D" />
    <circle cx="95" cy="60" r="3" fill="#4ECDC4" className={animated ? "animate-ping" : ""} />
    <circle cx="25" cy="60" r="3" fill="#4ECDC4" className={animated ? "animate-ping animation-delay-300" : ""} />
    <circle cx="60" cy="25" r="3" fill="#4ECDC4" className={animated ? "animate-ping animation-delay-600" : ""} />
    <circle cx="60" cy="95" r="3" fill="#4ECDC4" className={animated ? "animate-ping animation-delay-900" : ""} />
    <path d="M80,40 L85,30 L90,40 L85,45 Z" fill="#10B981" opacity="0.6" />
    <path d="M30,80 L35,70 L40,80 L35,85 Z" fill="#8B5CF6" opacity="0.6" />
  </svg>
);

const CognitiveFlexibility = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="flexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <path d="M60,20 Q40,40 60,60 Q80,40 60,20 Z" fill="url(#flexGrad)" className={animated ? "animate-pulse" : ""} />
    <circle cx="45" cy="45" r="4" fill="#FFD93D" />
    <circle cx="75" cy="45" r="4" fill="#4ECDC4" />
    <path d="M30,70 L50,70 L50,90 L30,90 Z" fill="#FF6B6B" className={animated ? "animate-bounce" : ""} />
    <path d="M70,70 L90,70 L90,90 L70,90 Z" fill="#10B981" className={animated ? "animate-bounce animation-delay-200" : ""} />
    <path d="M45,75 Q60,65 75,75" stroke="url(#flexGrad)" strokeWidth="2" fill="none" strokeDasharray="2,2" />
    <path d="M45,85 Q60,95 75,85" stroke="url(#flexGrad)" strokeWidth="2" fill="none" strokeDasharray="2,2" />
    <circle cx="60" cy="80" r="3" fill="#EC4899" className={animated ? "animate-ping" : ""} />
  </svg>
);

const PhonologicalProcessing = ({ className, animated }: { className?: string; animated?: boolean }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <defs>
      <linearGradient id="phonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14B8A6" />
        <stop offset="100%" stopColor="#0D9488" />
      </linearGradient>
    </defs>
    <path d="M20,60 Q30,40 40,60 Q50,40 60,60 Q70,40 80,60 Q90,40 100,60" stroke="url(#phonGrad)" strokeWidth="4" fill="none" className={animated ? "animate-pulse" : ""} />
    <path d="M15,70 Q25,55 35,70 Q45,55 55,70 Q65,55 75,70 Q85,55 95,70" stroke="#4ECDC4" strokeWidth="3" fill="none" opacity="0.7" className={animated ? "animate-pulse animation-delay-200" : ""} />
    <path d="M25,80 Q35,65 45,80 Q55,65 65,80 Q75,65 85,80" stroke="#FFD93D" strokeWidth="2" fill="none" opacity="0.6" className={animated ? "animate-pulse animation-delay-400" : ""} />
    <circle cx="20" cy="60" r="3" fill="url(#phonGrad)" />
    <circle cx="60" cy="60" r="3" fill="url(#phonGrad)" />
    <circle cx="100" cy="60" r="3" fill="url(#phonGrad)" />
    <text x="55" y="35" fontSize="12" fontWeight="bold" fill="url(#phonGrad)">♪</text>
    <text x="35" y="25" fontSize="10" fontWeight="bold" fill="#4ECDC4">♫</text>
    <text x="75" y="25" fontSize="10" fontWeight="bold" fill="#FFD93D">♪</text>
  </svg>
);

const illustrations = {
  'memoria-colorida': MemoriaColorida,
  'caca-foco': CacaFoco,
  'logica-rapida': LogicaRapida,
  'ritmo-musical': RitmoMusical,
  'caca-letras': CacaLetras,
  'silaba-magica': SilabaMagica,
  'quebra-cabeca-magico': QuebraCabecaMagico,
  'aventura-numeros': AventuraNumeros,
  'contador-historias': ContadorHistorias,
  'attention-sustained': AttentionSustained,
  'cognitive-flexibility': CognitiveFlexibility,
  'phonological-processing': PhonologicalProcessing,
  'focus-forest': CacaFoco, // fallback
};

export function GameIllustration({ gameId, className = "w-16 h-16", animated = false }: GameIllustrationProps) {
  const IllustrationComponent = illustrations[gameId as keyof typeof illustrations];
  
  if (!IllustrationComponent) {
    return null;
  }

  return <IllustrationComponent className={className} animated={animated} />;
}