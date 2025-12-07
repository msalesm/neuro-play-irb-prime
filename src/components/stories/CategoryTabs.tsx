import { BookOpen, Users, Heart, Ear, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

export type StoryCategory = 'all' | 'rotinas' | 'habilidades_sociais' | 'emocoes' | 'sensorial';

interface CategoryTabsProps {
  selected: StoryCategory;
  onChange: (category: StoryCategory) => void;
}

const categories = [
  { id: 'all' as const, label: 'Todas', icon: LayoutGrid },
  { id: 'rotinas' as const, label: 'Rotinas', icon: BookOpen },
  { id: 'habilidades_sociais' as const, label: 'Social', icon: Users },
  { id: 'emocoes' as const, label: 'Emoções', icon: Heart },
  { id: 'sensorial' as const, label: 'Sensorial', icon: Ear },
];

export function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selected === cat.id;
        
        return (
          <motion.button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary/30 text-secondary-foreground hover:bg-secondary/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="h-4 w-4" />
            <span>{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
