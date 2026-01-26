import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import './style.scss';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

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

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Handle beforeinstallprompt event (Chrome/Edge/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a short delay for better UX
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show manual instructions
    if (isIOS && !isInStandaloneMode) {
      setTimeout(() => setShowPrompt(true), 2000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isIOS, isInStandaloneMode]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // For iOS or if prompt not available, show instructions
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);

    if (outcome === 'accepted') {
      console.log('PWA installation accepted');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't render if already installed or dismissed
  if (isInStandaloneMode || !showPrompt) {
    return null;
  }

  // iOS instructions
  if (isIOS && !deferredPrompt) {
    return (
      <div className="install-prompt-container ios">
        <div className="install-prompt-card">
          <button className="install-dismiss" onClick={handleDismiss}>
            <X size={20} />
          </button>

          <div className="install-icon">
            <Smartphone size={32} color="#4A90E2" />
          </div>

          <div className="install-content">
            <h3 className="install-title">Установите приложение</h3>
            <p className="install-description">
              Нажмите кнопку <strong>Поделиться</strong>
              <svg
                width="20"
                height="20"
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
              и выберите <strong>"На экран Домой"</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chrome install button
  return (
    <div className="install-prompt-container">
      <div className="install-prompt-card">
        <button className="install-dismiss" onClick={handleDismiss}>
          <X size={20} />
        </button>

        <div className="install-icon">
          <Download size={32} color="#4A90E2" />
        </div>

        <div className="install-content">
          <h3 className="install-title">Установите на телефон</h3>
          <p className="install-description">
            Установите приложение для быстрого доступа и работы без интернета
          </p>
        </div>

        <button className="install-button" onClick={handleInstall}>
          <Download size={20} />
          <span>Установить</span>
        </button>
      </div>
    </div>
  );
};
