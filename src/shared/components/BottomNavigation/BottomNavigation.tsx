import { useLocation, useNavigate } from 'react-router-dom';
import { Home, QrCode, CreditCard, User, LogIn, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SecureStorageService } from '../../../services/secure-storage-service';
import './style.scss';

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStorageService.getAuthToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        console.log(error, 'Error checking auth in BottomNavigation');

        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  const publicNavItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/login', icon: LogIn, label: 'Вход' },
    { path: '/registration', icon: UserPlus, label: 'Регистрация' },
  ];

  const protectedNavItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/scan', icon: QrCode, label: 'QR Код' },
    { path: '/subscription', icon: CreditCard, label: 'Подписка' },
    { path: '/profile', icon: User, label: 'Профиль' },
  ];

  const navItems = isAuthenticated ? protectedNavItems : publicNavItems;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={24} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
