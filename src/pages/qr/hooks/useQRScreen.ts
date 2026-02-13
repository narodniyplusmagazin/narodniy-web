import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayToken, getQrUsages } from '../../../api/qr-services';
import { SecureStorageService } from '../../../services/secure-storage-service';

export interface Subscription {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUsagesPerDay?: number;
}

export interface QRData {
  qrCode: string;
  generatedAt: string;
  expiresAt: string;
  subscriptionId: string;
}

export interface UsageStats {
  totalUsages: number;
  usagesToday: number;
  usagesThisWeek: number;
  usagesThisMonth: number;
  maxUsagesPerDay: number;
  remainingUses: number;
  history: {
    usedAt: string;
    location?: string;
  }[];
}

export const useQRScreen = () => {
  const router = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [qrError, setQrError] = useState<string | null>(null);
  const [showQRFullscreen, setShowQRFullscreen] = useState(false);
  const [qrVisible, setQrVisible] = useState(true);
  const [qrCountdown, setQrCountdown] = useState(10);

  // Check if subscription is active
  const checkSubscriptionActive = (sub: Subscription): boolean => {
    const now = new Date();
    const startDate = new Date(sub.startDate);
    const endDate = new Date(sub.endDate);
    return now >= startDate && now <= endDate;
  };

  // Update time until expiry
  const updateTimeLeft = useCallback(() => {
    if (!subscription) return;

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDaysLeft(days);

    if (days <= 0) {
      setTimeUntilExpiry('Подписка истекла');
    } else if (days === 1) {
      setTimeUntilExpiry('Истекает сегодня');
    } else if (days <= 3) {
      setTimeUntilExpiry(`${days} дня`);
    } else if (days <= 7) {
      setTimeUntilExpiry(`${days} дней`);
    } else {
      setTimeUntilExpiry(`${days} дней`);
    }
  }, [subscription]);

  // Generate local QR code (fallback)
  const generateLocalQR = useCallback(
    (subscriptionId?: string) => {
      const subId = subscriptionId || subscription?.id;
      if (!subId) return;

      const now = new Date();
      const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const randomSalt = Math.random().toString(36).substring(7);

      setQrData({
        qrCode: `${subId}_${now.toDateString()}_${randomSalt}`,
        generatedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        subscriptionId: subId,
      });
    },
    [subscription?.id]
  );

  // Load usage statistics
  const loadUsageStats = useCallback(
    async (subscriptionId: string) => {
      try {
        const apiStats = await getQrUsages(subscriptionId);

        // Calculate time-based stats from usage history
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const usagesToday = apiStats.usages.filter(
          (u) => new Date(u.usedAt) >= today
        ).length;

        const usagesThisWeek = apiStats.usages.filter(
          (u) => new Date(u.usedAt) >= weekAgo
        ).length;

        const usagesThisMonth = apiStats.usages.filter(
          (u) => new Date(u.usedAt) >= monthAgo
        ).length;

        setUsageStats({
          totalUsages: apiStats.usageCount,
          usagesToday: usagesToday,
          usagesThisWeek: usagesThisWeek,
          usagesThisMonth: usagesThisMonth,
          maxUsagesPerDay: apiStats.dailyLimit,
          remainingUses: apiStats.remainingUses,
          history: apiStats.usages,
        });
      } catch {
        setUsageStats({
          totalUsages: 0,
          usagesToday: 0,
          usagesThisWeek: 0,
          usagesThisMonth: 0,
          maxUsagesPerDay: subscription?.maxUsagesPerDay || 5,
          remainingUses: subscription?.maxUsagesPerDay || 5,
          history: [],
        });
      }
    },
    [subscription?.maxUsagesPerDay]
  );

  // Generate QR code
  const generateQRCode = useCallback(
    async (subscriptionId: string) => {
      try {
        if (!subscriptionId) {
          console.error('❌ No subscription ID provided');
          return;
        }

        setQrError(null);

        const userData = SecureStorageService.getUserData();
        if (!userData?.id) {
          throw new Error('User ID not found');
        }

        // Получаем сегодняшний токен
        const response = await getTodayToken(subscriptionId);

        // Загружаем статистику использования
        await loadUsageStats(subscriptionId);

        if (!response.token) {
          console.error('❌ No token in response');
          throw new Error('Token not received from server');
        }

        // Конвертируем токен в строку, если это объект
        let tokenString: string;
        if (typeof response.token === 'object') {
          tokenString = JSON.stringify(response.token);
        } else if (typeof response.token !== 'string') {
          tokenString = String(response.token);
        } else {
          tokenString = response.token;
        }

        const qrDataToSet = {
          qrCode: tokenString.length > 2000 ? subscriptionId : tokenString,
          generatedAt: response.validFrom,
          expiresAt: response.validTo,
          subscriptionId: response.subscriptionId,
        };

        setQrData(qrDataToSet);
      } catch (error) {
        console.log(error, 'Ошибка генерации QR');
        setQrError('Не удалось сгенерировать QR-код');
        generateLocalQR(subscriptionId);
      }
    },
    [generateLocalQR, loadUsageStats]
  );

  // Load all data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setQrError(null);

      const isAuth = SecureStorageService.getAuthToken();
      if (!isAuth) {
        router('/login');
        return;
      }

      const subscriptionData = SecureStorageService.getSubscription();

      if (!subscriptionData || !subscriptionData.id) {
        setLoading(false);
        return;
      }

      const subscription: Subscription = {
        id: subscriptionData.id,
        planName:
          subscriptionData.planName || subscriptionData.name || 'Подписка',
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        isActive:
          subscriptionData.isActive !== undefined
            ? subscriptionData.isActive
            : true,
        maxUsagesPerDay: subscriptionData.maxUsagesPerDay || 5,
      };

      const isActive = checkSubscriptionActive(subscription);
      if (!isActive) {
        setSubscription(subscription);
        setLoading(false);
        return;
      }

      setSubscription(subscription);

      // Generate QR code inline
      try {
        if (subscription.id) {
          const userData = SecureStorageService.getUserData();
          if (!userData?.id) {
            throw new Error('User ID not found');
          }

          const response = await getTodayToken(subscription.id);

          // Загружаем статистику использования
          await loadUsageStats(subscription.id);

          if (response.token) {
            let tokenString: string;
            if (typeof response.token === 'object') {
              tokenString = JSON.stringify(response.token);
            } else if (typeof response.token !== 'string') {
              tokenString = String(response.token);
            } else {
              tokenString = response.token;
            }

            const qrDataToSet = {
              qrCode: tokenString.length > 2000 ? subscription.id : tokenString,
              generatedAt: response.validFrom,
              expiresAt: response.validTo,
              subscriptionId: response.subscriptionId,
            };

            setQrData(qrDataToSet);
          } else {
            console.log('❌ No token in response');
          }
        }
      } catch (error) {
        console.error('❌ QR generation error:', error);
        console.log(error, 'Ошибка генерации QR');
        setQrError('Не удалось сгенерировать QR-код');
        // Fallback to local QR
        if (subscription.id) {
          const now = new Date();
          const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          const randomSalt = Math.random().toString(36).substring(7);
          setQrData({
            qrCode: `${subscription.id}_${now.toDateString()}_${randomSalt}`,
            generatedAt: now.toISOString(),
            expiresAt: expiry.toISOString(),
            subscriptionId: subscription.id,
          });
        }
      }

      // Load usage stats
    } catch (error) {
      console.error('❌ Load initial data error:', error);
      console.log(error, 'Ошибка загрузки данных');
      setQrError('Не удалось загрузить данные');
    } finally {
      console.log('✅ Loading complete');
      setLoading(false);
    }
  };

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Manual QR refresh
  const handleRefreshQR = async () => {
    if (!subscription?.id) {
      window.alert('Ошибка: Данные подписки не найдены');
      return;
    }

    const confirmRefresh = window.confirm(
      'Текущий QR-код станет недействительным. Обновить?'
    );

    if (!confirmRefresh) return;

    try {
      setLoading(true);

      const response = await getTodayToken(subscription.id);

      // Конвертируем токен в строку, если это объект
      let tokenString: string;
      if (typeof response.token === 'object') {
        tokenString = JSON.stringify(response.token);
      } else if (typeof response.token !== 'string') {
        tokenString = String(response.token);
      } else {
        tokenString = response.token;
      }

      setQrData({
        qrCode: tokenString,
        generatedAt: response.validFrom,
        expiresAt: response.validTo,
        subscriptionId: response.subscriptionId,
      });

      window.alert('Готово: QR-код успешно обновлен');
    } catch (error) {
      console.error('QR Refresh Error:', error);
      console.log(error, 'Ошибка обновления QR');
    } finally {
      setLoading(false);
    }
  };

  // Check if usage limit is reached
  const isUsageLimitReached = () => {
    if (!usageStats) return false;
    return usageStats.usagesToday >= usageStats.maxUsagesPerDay;
  };

  // Load data on mount and when screen comes into focus
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Refresh QR on mount
  useEffect(() => {
    if (subscription?.id) {
      generateQRCode(subscription.id);
    }
  }, [subscription?.id, generateQRCode]);

  // Update timer
  useEffect(() => {
    if (subscription) {
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 60000);
      return () => clearInterval(interval);
    }
  }, [subscription, updateTimeLeft]);

  // Auto-refresh QR code
  useEffect(() => {
    if (qrData && subscription?.id) {
      const checkExpiry = setInterval(() => {
        const now = new Date();
        const expiry = new Date(qrData.expiresAt);
        if (now >= expiry && subscription?.id) {
          generateQRCode(subscription.id);
        }
      }, 60000);
      return () => clearInterval(checkExpiry);
    }
  }, [qrData, subscription?.id, generateQRCode]);

  // Auto-hide QR code after 10 seconds with countdown
  useEffect(() => {
    if (qrVisible && qrData && subscription?.id) {
      // Reset countdown when QR becomes visible
      setQrCountdown(10);

      const countdownInterval = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            setQrVisible(false);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [qrVisible, qrData, subscription?.id]);

  return {
    loading,
    refreshing,
    subscription,
    qrData,
    usageStats,
    timeUntilExpiry,
    daysLeft,
    qrError,
    onRefresh,
    handleRefreshQR,
    isUsageLimitReached,
    showQRFullscreen,
    setShowQRFullscreen,
    qrVisible,
    setQrVisible,
    qrCountdown,
  };
};
