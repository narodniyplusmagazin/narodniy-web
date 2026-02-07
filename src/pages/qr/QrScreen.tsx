import { useEffect, useState } from 'react';
import { useQRScreen } from './hooks/useQRScreen';
import './styles.scss'; // Import your SCSS
import { useNavigate } from 'react-router-dom';
import { QRHeader } from './components/QrHeader/QrHeader';
import { NoSubscriptionView } from './components/NoSubscriptionView/NoSubscriptionView';
import { SubscriptionStatusCard } from './components/SubscriptionStatusCard/SubscriptionStatusCard';
import { AvailableUsagesCard } from './components/AvailableUsagesCard/AvailableUsagesCard';
import { QRCodeCard } from './components/QRCodeCard/QRCodeCard';

export default function QRScreen() {
  const router = useNavigate();
  const [progressValue, setProgressValue] = useState(0);

  const {
    // refreshing,
    subscription,
    qrData,
    usageStats,
    timeUntilExpiry,
    daysLeft,
    loading,
    // onRefresh,
    handleRefreshQR,
    // isUsageLimitReached,
    // showQRFullscreen,
    setShowQRFullscreen,
    qrVisible,
    setQrVisible,
    qrCountdown,
  } = useQRScreen();

  const getStatusColor = () => {
    if (daysLeft <= 0) return 'error';
    if (daysLeft <= 3) return 'warning';
    return 'success';
  };

  // CSS-based progress animation
  useEffect(() => {
    if (qrVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgressValue(0);
      const start = Date.now();
      const duration = 10000;
      let frameId: number;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - start) / duration, 1);
        setProgressValue(progress);

        if (progress < 1) {
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
  }, [qrVisible]);

  const progressColor = () => {
    if (progressValue < 0.7) return '#4CAF50'; // green
    if (progressValue < 1) return '#FF9800'; // orange
    return '#F44336'; // red
  };

  const progressWidth = () => `${progressValue * 100}%`;
  console.log(usageStats);

  return (
    <div className="qr-screen-container">
      {/* QR Fullscreen Modal */}
      {/* {qrData && getQRValue() && (
        <QRFullscreen
          visible={showQRFullscreen}
          onClose={() => setShowQRFullscreen(false)}
          qrValue={getQRValue()!}
          expiresAt={qrData.expiresAt}
        />
      )} */}

      <div className="qr-scroll-container">
        {/* Header */}
        <QRHeader
          planName={subscription?.planName}
          usagesToday={usageStats?.usagesToday}
          maxUsagesPerDay={usageStats?.maxUsagesPerDay}
        />

        {/* No Subscription */}
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
                usagesToday={usageStats.usagesToday}
                maxUsagesPerDay={usageStats.maxUsagesPerDay}
                remainingUses={usageStats.remainingUses}
              />
            )}

            {qrVisible ? (
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
                    loading={loading}
                    onRefreshQR={handleRefreshQR}
                    onRenewPress={() => router('/subscription')}
                    onOpenFullscreen={() => setShowQRFullscreen(true)}
                  />
                </div>

                <div className="qr-time-badge">
                  <span className="qr-time-icon">⏱️</span>
                  <span>Скроется через {qrCountdown} сек</span>
                </div>
              </div>
            ) : (
              <div className="qr-show-container">
                <button
                  className="qr-show-button"
                  onClick={() => setQrVisible(true)}
                >
                  <span className="qr-icon">🔲</span>
                  <span>Показать QR-код</span>
                </button>
                <p className="qr-show-hint">QR-код скрыт для безопасности</p>
              </div>
            )}

            {daysLeft <= 7 && (
              <button
                className="renew-button"
                onClick={() => router('/subscription')}
              >
                <span className="renew-icon">⭐</span>
                <span>Продлить подписку</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
