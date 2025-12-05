import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VisualNotificationProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
}

// Visual notification component for deaf/hard of hearing users (WCAG 2.2)
export function VisualNotification({ 
  message, 
  type, 
  duration = 5000, 
  onClose 
}: VisualNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: Bell,
  };

  const colors = {
    info: 'bg-blue-500/10 border-blue-500 text-blue-700',
    success: 'bg-green-500/10 border-green-500 text-green-700',
    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-700',
    error: 'bg-red-500/10 border-red-500 text-red-700',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-lg border-2 shadow-lg max-w-sm ${colors[type]}`}
          role="alert"
          aria-live="assertive"
        >
          {/* Visual indicator - flashing for urgency */}
          {type === 'error' && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute -left-1 -top-1 w-3 h-3 bg-red-500 rounded-full"
            />
          )}
          
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium">{message}</span>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-black/10"
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            aria-label="Fechar notificação"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Global notification manager
let showNotificationCallback: ((props: Omit<VisualNotificationProps, 'onClose'>) => void) | null = null;

export const showVisualNotification = (props: Omit<VisualNotificationProps, 'onClose'>) => {
  showNotificationCallback?.(props);
};

export function VisualNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Array<VisualNotificationProps & { id: string }>>([]);

  useEffect(() => {
    showNotificationCallback = (props) => {
      const id = Math.random().toString(36).substr(2, 9);
      setNotifications(prev => [...prev, { ...props, id }]);
    };
    return () => {
      showNotificationCallback = null;
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {children}
      {notifications.map(notification => (
        <VisualNotification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
}
