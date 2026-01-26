import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import './style.scss';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Check conditions immediately, not in effect
  const isInStandaloneMode =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    // Don't show if already installed
    if (isInStandaloneMode) {
      return;
    }

    // Handle beforeinstallprompt event (Chrome/Edge/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isInStandaloneMode]);

  const handleInstall = async () => {
    // For iOS, show instructions
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    // For Android/Chrome
    if (!deferredPrompt) {
      alert(
        'Извините, установка недоступна в этом браузере. Попробуйте открыть сайт в Chrome.'
      );
      return;
    }

    // Show the native install prompt
    await deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('PWA installation accepted');
      setDeferredPrompt(null);
    }
  };

  // Don't render if already installed
  if (isInStandaloneMode) {
    return null;
  }

  // iOS instructions modal
  if (showIOSInstructions) {
    return (
      <div
        className="install-modal-overlay"
        onClick={() => setShowIOSInstructions(false)}
      >
        <div className="install-modal" onClick={(e) => e.stopPropagation()}>
          <div className="install-modal-icon">
            <Smartphone size={48} color="#4A90E2" />
          </div>
          <h3 className="install-modal-title">Как установить на iPhone</h3>
          <div className="install-modal-steps">
            <div className="install-step">
              <span className="step-number">1</span>
              <p>
                Нажмите кнопку <strong>Поделиться</strong>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    display: 'inline-block',
                    margin: '0 4px',
                    verticalAlign: 'middle',
                  }}
                >
                  <path
                    d="M18 8L12 2L6 8M12 2V15M21 16V21H3V16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                внизу экрана
              </p>
            </div>
            <div className="install-step">
              <span className="step-number">2</span>
              <p>
                Выберите <strong>"На экран Домой"</strong>
              </p>
            </div>
            <div className="install-step">
              <span className="step-number">3</span>
              <p>
                Нажмите <strong>"Добавить"</strong>
              </p>
            </div>
          </div>
          <button
            className="install-modal-close"
            onClick={() => setShowIOSInstructions(false)}
          >
            Понятно
          </button>
        </div>
      </div>
    );
  }

  // Simple install button (always visible)
  return (
    <button className="install-app-button" onClick={handleInstall}>
      {isIOS ? (
        <>
          <Smartphone size={20} />
          <span>Установить на iPhone</span>
        </>
      ) : (
        <>
          <Download size={20} />
          <span>Установить приложение</span>
        </>
      )}
    </button>
  );
};
