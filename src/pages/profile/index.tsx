import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  Users,
  Lock,
  Home,
  CreditCard,
  QrCode,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';

import './style.scss';
import {
  SecureStorageService,
  type UserDataType,
} from '../../services/secure-storage-service';
import { useAuthStore } from '../../shared/stores/auth-store';
import {  resetPassword } from '../../api/auth-api';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore();
  const [, setLoading] = useState(false);
  const [user, setUser] = useState<UserDataType | null>(null);
  const [form, setForm] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    const loadUser = () => {
      const storedUser = SecureStorageService.getUserData();
      if (storedUser) setUser(storedUser);
    };
    loadUser();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (form.newPassword.length < 6) {
      alert('Новый пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(
        user?.email || user?.phone || '',
        form.newPassword,
        ''
      );
      alert('Пароль успешно изменён');
      setForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      console.log(err, 'Ошибка смены пароля');
    } finally {
      setLoading(false);
    }
  };

  // const handleDeleteAccount = async (userId: string) => {
  //   if (!user?.id) return;

  //   const confirmToDelete = confirm(
  //     'Подтверждение: Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.'
  //   );

  //   if (confirmToDelete) {
  //     try {
  //       await deleteAccount(userId);
  //       SecureStorageService.clearAll();
  //       setAuthenticated(false);
  //       navigate('/registration');
  //       alert('Ваш аккаунт был удалён.');
  //     } catch (error) {
  //       console.log(error, 'Ошибка удаления аккаунта');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  const handleLogout = async () => {
    setLoading(true);
    try {
      SecureStorageService.clearAll();
      setAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.log(error, 'Ошибка выхода');
    } finally {
      setLoading(false);
    }
  };

  const getGenderLabel = (gender?: string): string => {
    switch (gender) {
      case 'male':
        return 'Мужской';
      case 'female':
        return 'Женский';
      default:
        return 'Не указан';
    }
  };

  // const handleResetPassword = async () => {
  //   try {
  //     const response = await resetPassword(
  //       user?.email || user?.phone || '',
  //       form.newPassword,
  //       ''
  //     );

  //     console.log(response);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header */}
        <section className="profile-header">
          <div className="avatar-container">
            <span className="avatar-text">
              {user?.fullName?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <h1 className="profile-title">Народный +</h1>
          <p className="profile-subtitle">{user?.fullName || 'Пользователь'}</p>
        </section>

        {/* User Info Card */}
        <section className="profile-section">
          <h2 className="section-title">
            <Users size={20} className="section-icon" />
            Личная информация
          </h2>
          <div className="info-card">
            <div className="info-row">
              <div className="info-icon">
                <Mail size={24} />
              </div>
              <div className="info-content">
                <p className="info-label">Email</p>
                <p className="info-value">{user?.email || 'Не указан'}</p>
              </div>
            </div>

            <div className="divider" />

            <div className="info-row">
              <div className="info-icon">
                <Phone size={24} />
              </div>
              <div className="info-content">
                <p className="info-label">Телефон</p>
                <p className="info-value">{user?.phone || 'Не указан'}</p>
              </div>
            </div>

            <div className="divider" />

            <div className="info-row">
              <div className="info-icon">
                <Users size={24} />
              </div>
              <div className="info-content">
                <p className="info-label">Пол</p>
                <p className="info-value">{getGenderLabel(user?.gender)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="profile-section">
          <h2 className="section-title">
            <Zap size={20} className="section-icon" />
            Быстрые действия
          </h2>
          <div className="actions-grid">
            <button
              className="action-card"
              onClick={() => navigate('/')}
              type="button"
            >
              <div className="action-icon">
                <Home size={32} />
              </div>
              <span className="action-text">Главная</span>
            </button>

            <button
              className="action-card"
              onClick={() => navigate('/subscription')}
              type="button"
            >
              <div className="action-icon">
                <CreditCard size={32} />
              </div>
              <span className="action-text">Подписки</span>
            </button>

            <button
              className="action-card"
              onClick={() => navigate('/scan')}
              type="button"
            >
              <div className="action-icon">
                <QrCode size={32} />
              </div>
              <span className="action-text">QR-код</span>
            </button>
          </div>
        </section>

        {/* Change Password Section */}
        <section className="profile-section">
          <h2 className="section-title">
            <Lock size={20} className="section-icon" />
            Безопасность
          </h2>
          <form onSubmit={handleChangePassword} className="password-card">
            <h3 className="password-title">Сменить пароль</h3>
            <input
              type="password"
              className="form-input"
              placeholder="Старый пароль"
              value={form.oldPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, oldPassword: e.target.value }))
              }
              required
            />
            <input
              type="password"
              className="form-input"
              placeholder="Новый пароль (мин. 6 символов)"
              value={form.newPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              required
              minLength={6}
            />
            <button type="submit" className="primary-button">
              Изменить пароль
            </button>
          </form>
        </section>

        {/* Account Actions */}
        <section className="profile-section">
          <h2 className="section-title">
            <Settings size={20} className="section-icon" />
            Управление аккаунтом
          </h2>

          <div className="logout-delete">
            <button
              className="logout-button"
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={24} className="logout-icon" />
              <span className="logout-text">Выйти из аккаунта</span>
            </button>

            {/* <button
              className="delete-button"
              onClick={() => handleDeleteAccount(user?.id as string)}
              type="button"
            >
              <Trash2 size={24} className="delete-icon" />
              <span className="delete-text">Удалить аккаунт</span>
            </button> */}
          </div>
        </section>

        {/* App Info */}
        {/* <footer className="profile-footer">
          <p className="footer-text">Версия приложения 1.0.0</p>
        </footer> */}
      </div>
    </div>
  );
};

export default ProfileScreen;
