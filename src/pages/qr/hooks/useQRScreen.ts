import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  generateQRCode as generateQRCodeAPI,
  regenerateQRCode,
  getQrUsages,
  buildQRCodeURL,
} from '../../../api/qr-services';
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
  qrCode: string; // Full URL to encode in QR
  qrToken: string; // Backend token
  generatedAt: string;
  expiresAt: string; // ISO timestamp
  subscriptionId?: string;
}

export interface UsageStats {
  avalibleUsageCount: number;
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

  // QR visibility and countdown (30 seconds)
  const [qrVisible, setQrVisible] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);

  // Refs for intervals
  const countdownIntervalRef = useRef<number | null>(null);
  const expiryCheckIntervalRef = useRef<number | null>(null);

  // Generate QR Code (30 seconds validity)
  const generateNewQR = useCallback(async () => {
    if (!subscription?.id) return;

    setIsGenerating(true);
    setQrError(null);

    try {
      const userData = SecureStorageService.getUserData();
      if (!userData?.id) {
        throw new Error('User ID not found');
      }

      const response = await generateQRCodeAPI(userData.id, subscription.id);
      const qrURL = buildQRCodeURL(response.token);

      // Calculate 30 seconds from now for UI countdown
      const displayExpiresAt = new Date(Date.now() + 30000).toISOString();

      setQrData({
        qrCode: qrURL,
        qrToken: response.token,
        generatedAt: new Date().toISOString(),
        expiresAt: response.validTo, // Backend expiry (e.g., 3 hours)
        subscriptionId: subscription.id,
      });

      setQrVisible(true);
      setQrCountdown(30);
      startCountdown(displayExpiresAt); // Use 30-second countdown for display
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || 'Не удалось сгенерировать QR-код';
      setQrError(errorMsg);
      console.error('Error generating QR:', error);
    } finally {
      setIsGenerating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription?.id]);

  // Regenerate QR Code
  const regenerateQR = useCallback(async () => {
    if (!subscription?.id) return;

    setIsGenerating(true);
    setQrError(null);

    try {
      const userData = SecureStorageService.getUserData();
      if (!userData?.id) {
        throw new Error('User ID not found');
      }

      const response = await regenerateQRCode(userData.id, subscription.id);
      const qrURL = buildQRCodeURL(response.token);

      // Calculate 30 seconds from now for UI countdown
      const displayExpiresAt = new Date(Date.now() + 30000).toISOString();

      setQrData({
        qrCode: qrURL,
        qrToken: response.token,
        generatedAt: new Date().toISOString(),
        expiresAt: response.validTo, // Backend expiry (e.g., 3 hours)
        subscriptionId: subscription.id,
      });

      setQrVisible(true);
      setQrCountdown(30);
      startCountdown(displayExpiresAt); // Use 30-second countdown for display

      // Reload usage stats after regeneration
      await loadUsageStats(subscription.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || 'Не удалось обновить QR-код';
      setQrError(errorMsg);
      console.error('Error regenerating QR:', error);
    } finally {
      setIsGenerating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription?.id]);

  // Start countdown timer
  const startCountdown = useCallback(
    (expiresAt: string) => {
      // Clear existing intervals
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (expiryCheckIntervalRef.current) {
        clearInterval(expiryCheckIntervalRef.current);
        expiryCheckIntervalRef.current = null;
      }

      const updateCountdown = () => {
        const now = Date.now();
        const expiry = new Date(expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

        setQrCountdown(remaining);

        if (remaining <= 0) {
          setQrVisible(false);
          // Clear intervals
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }
      };

      // Initial update
      updateCountdown();

      // Update every second
      countdownIntervalRef.current = setInterval(updateCountdown, 1000);
    },
    []
  );

  // Handle show QR button click
  const handleShowQR = useCallback(() => {
    regenerateQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          avalibleUsageCount: apiStats.avalibleUsageCount,
          history: apiStats.usages,
        });
      } catch {
        setUsageStats({
          totalUsages: 0,
          usagesToday: 0,
          usagesThisWeek: 0,
          usagesThisMonth: 0,
          maxUsagesPerDay: subscription?.maxUsagesPerDay || 3,
          remainingUses: subscription?.maxUsagesPerDay || 3,
          avalibleUsageCount: subscription?.maxUsagesPerDay || 3,
          history: [],
        });
      }
    },
    [subscription?.maxUsagesPerDay]
  );


  // Load all data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setQrError(null);

      const isAuth = SecureStorageService.getAuthToken();
      if (!isAuth) {
        router('/login');
        return;
      }

      const subscriptionData = SecureStorageService.getSubscription();

      if (!subscriptionData?.id) {
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
          subscriptionData.isActive === undefined || subscriptionData.isActive,
        maxUsagesPerDay: subscriptionData.maxUsagesPerDay || 5,
      };

      const isActive = checkSubscriptionActive(subscription);
      setSubscription(subscription);

      if (!isActive) {
        setLoading(false);
        return;
      }

      // Load usage stats
      if (subscription.id) {
        await loadUsageStats(subscription.id);
      }
    } catch (error) {
      console.error('❌ Load initial data error:', error);
      setQrError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [router, loadUsageStats]);


  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Manual QR refresh (regenerate)
  const handleRefreshQR = async () => {
    if (isGenerating) return;
    await regenerateQR();
  };

  // Check if usage limit is reached
  const isUsageLimitReached = () => {
    if (!usageStats) return false;
    return usageStats.avalibleUsageCount <= 0;
  };

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Auto-generate QR when subscription is loaded (only once)
  useEffect(() => {
    if (subscription?.id && !qrData && !isGenerating && !loading) {
      generateNewQR();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription?.id]);

  // Update subscription timer
  useEffect(() => {
    if (subscription) {
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 60000);
      return () => clearInterval(interval);
    }
  }, [subscription, updateTimeLeft]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (expiryCheckIntervalRef.current) {
        clearInterval(expiryCheckIntervalRef.current);
      }
    };
  }, []);

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
    handleShowQR,
    isUsageLimitReached,
    showQRFullscreen,
    setShowQRFullscreen,
    qrVisible,
    setQrVisible,
    qrCountdown,
    isGenerating,
  };
};
