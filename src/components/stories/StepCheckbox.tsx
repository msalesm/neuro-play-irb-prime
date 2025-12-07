import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface StepCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function StepCheckbox({ checked, onChange, disabled = false }: StepCheckboxProps) {
  const { profile } = useAccessibility();

  return (
    <motion.button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex-shrink-0 rounded-full border-4 flex items-center justify-center transition-all ${
        checked
          ? 'bg-green-500 border-green-500 text-white'
          : 'bg-background border-muted-foreground/30 hover:border-primary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        width: `${profile.touchTargetSizePx}px`,
        height: `${profile.touchTargetSizePx}px`,
      }}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      animate={checked ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Check className="h-6 w-6" />
        </motion.div>
      )}
    </motion.button>
  );
}
