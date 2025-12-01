/**
 * Browser Compatibility Detection and Polyfills
 * Ensures games work across all modern browsers
 */

export interface BrowserCapabilities {
  webgl: boolean;
  webgl2: boolean;
  audio: boolean;
  touch: boolean;
  pointerEvents: boolean;
  vibration: boolean;
  localStorage: boolean;
  requestAnimationFrame: boolean;
  devicePixelRatio: boolean;
}

/**
 * Detect browser capabilities
 */
export function detectBrowserCapabilities(): BrowserCapabilities {
  return {
    webgl: checkWebGLSupport(),
    webgl2: checkWebGL2Support(),
    audio: checkAudioSupport(),
    touch: checkTouchSupport(),
    pointerEvents: checkPointerEventsSupport(),
    vibration: checkVibrationSupport(),
    localStorage: checkLocalStorageSupport(),
    requestAnimationFrame: checkRAFSupport(),
    devicePixelRatio: checkDevicePixelRatioSupport(),
  };
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

function checkWebGL2Support(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch (e) {
    return false;
  }
}

function checkAudioSupport(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

function checkTouchSupport(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function checkPointerEventsSupport(): boolean {
  return 'PointerEvent' in window;
}

function checkVibrationSupport(): boolean {
  return 'vibrate' in navigator;
}

function checkLocalStorageSupport(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function checkRAFSupport(): boolean {
  return 'requestAnimationFrame' in window;
}

function checkDevicePixelRatioSupport(): boolean {
  return 'devicePixelRatio' in window;
}

/**
 * Install polyfills for missing features
 */
export function installPolyfills() {
  // requestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback: FrameRequestCallback) {
      return window.setTimeout(function() {
        callback(Date.now());
      }, 1000 / 60);
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id: number) {
      clearTimeout(id);
    };
  }

  // Performance.now polyfill
  if (!window.performance || !window.performance.now) {
    const startTime = Date.now();
    if (!window.performance) {
      (window as any).performance = {};
    }
    window.performance.now = function() {
      return Date.now() - startTime;
    };
  }

  // devicePixelRatio fallback
  if (!window.devicePixelRatio) {
    (window as any).devicePixelRatio = 1;
  }
}

/**
 * Get user-friendly error message for missing capability
 */
export function getCapabilityErrorMessage(capability: keyof BrowserCapabilities): string {
  const messages: Record<keyof BrowserCapabilities, string> = {
    webgl: 'Seu navegador não suporta WebGL. Por favor, atualize seu navegador ou tente outro navegador moderno (Chrome, Firefox, Safari, Edge).',
    webgl2: 'Alguns recursos avançados podem não funcionar. Por favor, atualize seu navegador para obter a melhor experiência.',
    audio: 'Áudio não está disponível. Alguns jogos podem ter funcionalidade limitada.',
    touch: 'Controles de toque não disponíveis. Use mouse ou trackpad.',
    pointerEvents: 'Eventos de ponteiro não suportados. Usando eventos de mouse alternativos.',
    vibration: 'Feedback tátil não disponível neste navegador.',
    localStorage: 'Armazenamento local não disponível. O progresso não será salvo entre sessões.',
    requestAnimationFrame: 'Animações podem ter performance reduzida.',
    devicePixelRatio: 'A qualidade visual pode ser afetada em telas de alta resolução.',
  };

  return messages[capability];
}

/**
 * Check if browser is supported for games
 */
export function isGameCompatible(): { compatible: boolean; missing: string[] } {
  const capabilities = detectBrowserCapabilities();
  const missing: string[] = [];

  // Critical capabilities required for games
  if (!capabilities.webgl) {
    missing.push('webgl');
  }

  if (!capabilities.requestAnimationFrame) {
    missing.push('requestAnimationFrame');
  }

  return {
    compatible: missing.length === 0,
    missing,
  };
}

/**
 * Setup cross-browser event listeners
 * Handles pointer, mouse, and touch events appropriately
 */
export function addUniversalEventListener(
  element: HTMLElement | HTMLCanvasElement,
  eventType: 'down' | 'move' | 'up',
  handler: (event: PointerEvent | MouseEvent | TouchEvent) => void
) {
  const capabilities = detectBrowserCapabilities();

  if (capabilities.pointerEvents) {
    // Use pointer events (best option - works with mouse, touch, pen)
    const pointerEventMap = {
      down: 'pointerdown',
      move: 'pointermove',
      up: 'pointerup',
    };
    element.addEventListener(pointerEventMap[eventType], handler as EventListener);
  } else if (capabilities.touch) {
    // Use touch events
    const touchEventMap = {
      down: 'touchstart',
      move: 'touchmove',
      up: 'touchend',
    };
    const touchHandler = (e: Event) => {
      e.preventDefault();
      handler(e as TouchEvent);
    };
    element.addEventListener(touchEventMap[eventType], touchHandler as EventListener);
  } else {
    // Fallback to mouse events
    const mouseEventMap = {
      down: 'mousedown',
      move: 'mousemove',
      up: 'mouseup',
    };
    element.addEventListener(mouseEventMap[eventType], handler as EventListener);
  }
}

/**
 * Get normalized coordinates from any pointer event
 */
export function getEventCoordinates(
  event: PointerEvent | MouseEvent | TouchEvent,
  element: HTMLElement | HTMLCanvasElement
): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  
  let clientX: number, clientY: number;

  if ('touches' in event && event.touches.length > 0) {
    // Touch event
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if ('clientX' in event) {
    // Mouse or pointer event
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    return { x: 0, y: 0 };
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

/**
 * Safe localStorage wrapper with fallback to memory storage
 */
class SafeStorage {
  private memoryStorage: Map<string, string> = new Map();
  private useLocalStorage: boolean;

  constructor() {
    this.useLocalStorage = checkLocalStorageSupport();
  }

  getItem(key: string): string | null {
    if (this.useLocalStorage) {
      try {
        return localStorage.getItem(key);
      } catch {
        return this.memoryStorage.get(key) || null;
      }
    }
    return this.memoryStorage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (this.useLocalStorage) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        // Fall through to memory storage
      }
    }
    this.memoryStorage.set(key, value);
  }

  removeItem(key: string): void {
    if (this.useLocalStorage) {
      try {
        localStorage.removeItem(key);
        return;
      } catch {
        // Fall through to memory storage
      }
    }
    this.memoryStorage.delete(key);
  }
}

export const safeStorage = new SafeStorage();

// Install polyfills on module load
installPolyfills();
