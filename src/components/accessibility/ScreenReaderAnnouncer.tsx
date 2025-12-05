import { useEffect, useState } from 'react';

interface Announcement {
  message: string;
  priority: 'polite' | 'assertive';
}

// Global announcer for screen readers (WCAG 2.2 compliant)
let announceCallback: ((announcement: Announcement) => void) | null = null;

export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (announceCallback) {
    announceCallback({ message, priority });
  }
};

export function ScreenReaderAnnouncer() {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  useEffect(() => {
    announceCallback = (announcement: Announcement) => {
      if (announcement.priority === 'assertive') {
        setAssertiveMessage('');
        setTimeout(() => setAssertiveMessage(announcement.message), 100);
      } else {
        setPoliteMessage('');
        setTimeout(() => setPoliteMessage(announcement.message), 100);
      }
    };

    return () => {
      announceCallback = null;
    };
  }, []);

  return (
    <>
      {/* Polite announcements - read when user is idle */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      
      {/* Assertive announcements - interrupt current reading */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </>
  );
}
