/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useQRScreen } from './hooks/useQRScreen';
import './styles.scss'; // Import your SCSS
import { useNavigate } from 'react-router-dom';
import { QRHeader } from './components/QrHeader/QrHeader';
import { NoSubscriptionView } from './components/NoSubscriptionView/NoSubscriptionView';
import { SubscriptionStatusCard } from './components/SubscriptionStatusCard/SubscriptionStatusCard';
import { AvailableUsagesCard } from './components/AvailableUsagesCard/AvailableUsagesCard';
import { QRCodeCard } from './components/QRCodeCard/QRCodeCard';

export function QRScreen() {
  const router = useNavigate();
  const [progressValue, setProgressValue] = useState(0);

  const {
    subscription,
    qrData,
    usageStats,
    timeUntilExpiry,
    daysLeft,
    loading,
    handleRefreshQR,
    handleShowQR,
    setShowQRFullscreen,
    qrVisible,
    qrCountdown,
    isGenerating,
    qrError,
    isUsageLimitReached,
  } = useQRScreen();

  const getStatusColor = () => {
    if (daysLeft <= 0) return 'error';
    if (daysLeft <= 3) return 'warning';
    return 'success';
  };

  // CSS-based progress animation for 30-second countdown
  useEffect(() => {
    if (qrVisible && qrCountdown > 0) {
      setProgressValue(0);
      const duration = 30000; // 30 seconds
      const start = Date.now();
      let frameId: number;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        setProgressValue(progress);

        if (progress < 1 && qrVisible) {
          frameId = requestAnimationFrame(animate);
        }
      };

      frameId = requestAnimationFrame(animate);

      return () => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      };
    } else {
      setProgressValue(0);
    }
  }, [qrVisible, qrCountdown]);

  const progressColor = () => {
    if (progressValue < 0.6) return '#4CAF50'; // green - 0-18 seconds
    if (progressValue < 0.9) return '#FF9800'; // orange - 18-27 seconds
    return '#F44336'; // red - 27-30 seconds
  };

  const progressWidth = () => `${progressValue * 100}%`;

  const hasNoAvailableUsages =
    usageStats?.avalibleUsageCount === 0 || isUsageLimitReached();

  if (loading) {
    return (
      <div className="qr-screen-container">
        <div className="qr-loading">
          <div className="spinner"></div>
          <p>Загрузка QR-кода...</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="qr-screen-container">
      <div className="qr-scroll-container">
        {/* Header */}
        <QRHeader
          planName={subscription?.planName}
          usagesToday={usageStats?.usagesToday}
          maxUsagesPerDay={usageStats?.maxUsagesPerDay}
        />

        {!subscription ? (
          <NoSubscriptionView
            onSubscribePress={() => router('/subscription')}
          />
        ) : (
          <>
            <SubscriptionStatusCard
              daysLeft={daysLeft}
              timeUntilExpiry={timeUntilExpiry}
              startDate={subscription.startDate}
              endDate={subscription.endDate}
              getStatusColor={getStatusColor}
            />

            {usageStats && (
              <AvailableUsagesCard
                usagesToday={usageStats.history.length}
                maxUsagesPerDay={usageStats.maxUsagesPerDay}
                remainingUses={usageStats.remainingUses}
                hasNoAvailableUsages={hasNoAvailableUsages}
              />
            )}

            {qrVisible && !hasNoAvailableUsages ? (
              <div className="qr-progress-container">
                <div className="qr-progress-bar-bg">
                  <div
                    className="qr-progress-bar"
                    style={{
                      width: progressWidth(),
                      backgroundColor: progressColor(),
                    }}
                  />
                </div>

                <div className="qr-card-wrapper">
                  <QRCodeCard
                    qrData={qrData}
                    daysLeft={daysLeft}
                    loading={isGenerating}
                    onRefreshQR={handleRefreshQR}
                    onRenewPress={() => router('/subscription')}
                    onOpenFullscreen={() => setShowQRFullscreen(true)}
                    hasNoAvailableUsages={hasNoAvailableUsages}
                  />
                </div>

                <div className="qr-time-badge">
                  <span className="qr-time-icon">⏱️</span>
                  <span>
                    QR-код скроется через {qrCountdown} сек
                  </span>
                </div>
              </div>
            ) : !hasNoAvailableUsages ? (
              <div className="qr-show-container">
                {qrError && (
                  <div className="qr-error-message">
                    <span>⚠️ {qrError}</span>
                  </div>
                )}
                <button
                  className="qr-show-button"
                  onClick={handleShowQR}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-small"></span>
                      <span>Генерация...</span>
                    </>
                  ) : (
                    <>
                      <span className="qr-icon">🔲</span>
                      <span>Показать QR-код</span>
                    </>
                  )}
                </button>
                <p className="qr-show-hint">
                  {qrData
                    ? 'QR-код истёк. Нажмите, чтобы получить новый'
                    : 'QR-код скрыт для безопасности'}
                </p>
              </div>
            ) : (
              <div className="qr-show-container">
                <div className="qr-limit-message">
                  <span>⚠️ Лимит использований исчерпан</span>
                  <p>Новый QR-код будет доступен завтра</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
