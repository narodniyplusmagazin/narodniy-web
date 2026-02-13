/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
  createSubscription,
  getMySubscriptions,
  getSubscriptionPlan,
  type SubscriptionType,
} from '../../../api/subscription-api';
import { SecureStorageService } from '../../../services/secure-storage-service';
import { generateQR } from '../../../api/qr-services';
import { useNavigate } from 'react-router-dom';

// Custom alert/confirm system
const showConfirm = async (title: string, message: string) => {
  return window.confirm(`${title}\n\n${message}`);
};

export const useSubscriptionScreen = () => {
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [plan, setPlan] = useState<SubscriptionType | null>(null);
  const navigate = useNavigate();
  const [activeSubscription, setActiveSubscription] = useState<any | null>(
    null
  );
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    await loadUserData();
    await loadSubscriptionPlan();
    await loadActiveSubscription();
  };

  const loadUserData = async () => {
    try {
      const data = SecureStorageService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSubscriptionPlan = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionPlan();
      setPlan(data);
    } catch (error) {
      console.log(error, 'Ошибка загрузки плана подписки');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSubscription = async () => {
    try {
      const userData = SecureStorageService.getUserData();
      if (!userData?.id) return;

      const subscriptions = await getMySubscriptions(userData.id);
      const now = new Date();

      const active = subscriptions?.find(
        (sub: any) => new Date(sub.endDate) > now && sub.isActive
      );

      if (active) {
        setActiveSubscription(active);
        SecureStorageService.saveSubscription(active);
      }
    } catch (error) {
      console.error('Ошибка загрузки подписки:', error);
      try {
        const subscription = SecureStorageService.getSubscription();
        if (subscription && new Date(subscription.endDate) > new Date()) {
          setActiveSubscription(subscription);
        }
      } catch (storageError) {
        console.error('Ошибка загрузки из хранилища:', storageError);
      }
    }
  };

  const handleSubscribe = async () => {
    if (!plan) return;

    if (activeSubscription) {
      alert(
        'Активная подписка\nУ вас уже есть активная подписка. Дождитесь её окончания перед оформлением новой.'
      );
      return;
    }

    const confirmed = await showConfirm(
      'Оформить подписку',
      `Подтвердите оформление подписки "${plan.name}" за ${plan.price} ₽`
    );

    if (!confirmed) return;

    try {
      setSubscribing(true);
      const userData = SecureStorageService.getUserData();
      if (!userData?.id) {
        alert('Ошибка\nНе удалось получить данные пользователя');
        return;
      }

      const subscriptionData = await createSubscription(userData.id);
      SecureStorageService.saveSubscription(subscriptionData);

      try {
        await generateQR(subscriptionData.id, userData.id);
      } catch (qrError) {
        console.warn('QR generation failed, will retry on QR screen:', qrError);
      }

      alert('Успех\nПодписка успешно оформлена!');
      // window.location.href = '/qrPage';
      navigate('/qrPage');
    } catch (error) {
      console.log(error, 'Ошибка оформления подписки');
    } finally {
      setSubscribing(false);
    }
  };

  const handleTestSubscription = async () => {
    if (activeSubscription) {
      alert(
        'Активная подписка\nУ вас уже есть активная подписка. Дождитесь её окончания перед оформлением новой.'
      );
      return;
    }

    const confirmed = await showConfirm(
      'Тестовая подписка',
      'Создать бесплатную тестовую подписку?'
    );

    if (!confirmed) return;

    try {
      setSubscribing(true);
      const userData = SecureStorageService.getUserData();
      if (!userData?.id) {
        alert('Ошибка\nНе удалось получить данные пользователя');
        return;
      }

      const subscriptionData = await createSubscription(userData.id);
      SecureStorageService.saveSubscription(subscriptionData);

      try {
        await generateQR(subscriptionData.id, userData.id);
      } catch (qrError) {
        console.warn('QR generation failed, will retry on QR screen:', qrError);
      }

      alert('Успех\nТестовая подписка создана!');
      // window.location.href = '/qrPage';
      navigate('/qrPage');
    } catch (error) {
      console.log(error, 'Ошибка создания тестовой подписки');
    } finally {
      setSubscribing(false);
    }
  };

  return {
    loading,
    subscribing,
    plan,
    activeSubscription,
    userData,
    loadSubscriptionPlan,
    handleSubscribe,
    handleTestSubscription,
  };
};
