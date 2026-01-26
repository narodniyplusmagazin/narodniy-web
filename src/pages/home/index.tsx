import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  Star,
  DollarSign,
  Users,
  QrCode,
  CreditCard,
  User,
  ChevronRight,
  UserPlus,
  LogIn,
  Rocket,
} from 'lucide-react';
import './style.scss';
import { colors } from '../../shared/constants/theme';
import { SecureStorageService } from '../../services/secure-storage-service';
import { InstallPrompt } from '../../shared/components/InstallPrompt';

interface QuickActionCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  route: string;
  color: string;
}

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  const quickActions: QuickActionCard[] = [
    {
      id: '1',
      title: 'QR Код',
      icon: <QrCode size={32} color="white" />,
      description: 'Мой QR код для скидок',
      route: '/qr',
      color: colors.primary,
    },
    {
      id: '2',
      title: 'Подписки',
      icon: <CreditCard size={32} color="white" />,
      description: 'Управление подпиской',
      route: '/subscriptions',
      color: '#34C759',
    },
    {
      id: '3',
      title: 'Профиль',
      icon: <User size={32} color="white" />,
      description: 'Личные данные',
      route: '/profile',
      color: '#FF9500',
    },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await SecureStorageService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Trigger animation on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFadeIn(true);
  }, []);

  const renderQuickAction = (action: QuickActionCard) => (
    <button
      key={action.id}
      className="action-card"
      onClick={() => navigate(action.route)}
    >
      <div
        className="action-icon-container"
        style={{ backgroundColor: action.color }}
      >
        {action.icon}
      </div>
      <div className="action-content">
        <h3 className="action-title">{action.title}</h3>
        <p className="action-description">{action.description}</p>
      </div>
      <ChevronRight size={24} className="chevron" />
    </button>
  );

  return (
    <div className="home-screen-container">
      <div className={`home-screen-wrapper ${fadeIn ? 'fade-in' : ''}`}>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="image-wrapper">
            <div className="image-glow">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3063/3063828.png"
                alt="Народный +"
                className="hero-image"
              />
            </div>
          </div>

          <h1 className="hero-title">Народный +asdf</h1>
          <p className="hero-subtitle">
            Получайте эксклюзивные предложения, скидки и привилегии с нашей
            подпиской
          </p>

          {/* Stats badges */}
          <div className="stats-container">
            <div className="stat-badge">
              <Users size={20} color={colors.primary} />
              <span className="stat-text">1000+ клиентов</span>
            </div>
            <div className="stat-badge">
              <Star size={20} color={colors.warning} />
              <span className="stat-text">4.9 рейтинг</span>
            </div>
          </div>
        </section>

        {/* Quick Actions - Only for authenticated users */}
        {isAuthenticated && (
          <section className="quick-actions-section">
            <h2 className="section-title">Быстрый доступ</h2>
            <div className="actions-list">
              {quickActions.map((action) => renderQuickAction(action))}
            </div>
          </section>
        )}

        {/* Features Card */}
        <section className="features-section">
          <h2 className="section-title">
            <span className="section-title-icon">✨</span>
            Преимущества подписки
          </h2>
          <div className="features-card">
            <div className="feature-row">
              <div
                className="feature-icon-container"
                style={{ backgroundColor: '#FFF3E6' }}
              >
                <Gift size={28} color={colors.secondary} />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Ежедневные купоны</h3>
                <p className="feature-text">
                  Уникальные предложения каждый день
                </p>
              </div>
            </div>
            <div className="feature-row">
              <div
                className="feature-icon-container"
                style={{ backgroundColor: '#FFF9E6' }}
              >
                <Star size={28} color={colors.warning} />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">VIP предложения</h3>
                <p className="feature-text">Доступ к эксклюзивным акциям</p>
              </div>
            </div>
            <div className="feature-row">
              <div
                className="feature-icon-container"
                style={{ backgroundColor: '#E6F9F0' }}
              >
                <DollarSign size={28} color={colors.success} />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Экономия до 40%</h3>
                <p className="feature-text">
                  Реальная выгода на каждой покупке
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Install App Button */}
        <InstallPrompt />

        {/* CTA Buttons */}
        <div className="buttons-container">
          {!isAuthenticated ? (
            <>
              <button
                className="primary-button"
                onClick={() => navigate('/registration')}
              >
                <UserPlus size={20} />
                <span>Создать аккаунт</span>
              </button>
              <button
                className="secondary-button"
                onClick={() => navigate('/login')}
              >
                <LogIn size={20} />
                <span>Войти</span>
              </button>
            </>
          ) : (
            <button
              className="subscribe-button"
              onClick={() => navigate('/subscriptions')}
            >
              <Rocket size={22} />
              <span>Оформить подписку</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
