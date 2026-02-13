/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import './style.scss';
import { SecureStorageService } from '../../services/secure-storage-service';
import { useAuthStore } from '../../shared/stores/auth-store';
import { login } from '../../api/auth-api';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore();
  const [, setLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<{
    isError: boolean;
    msg: string;
  } | null>(null);
  const [form, setForm] = useState({
    emailOrPhone: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.emailOrPhone.trim() || !form.password.trim()) {
      alert('Заполните все поля');
      return;
    }

    setHasError(null);
    setLoading(true);

    try {
      const res = await login(
        form.emailOrPhone.toLowerCase().trim(),
        form.password
      );

      if (!res?.access_token) {
        setLoading(false);
        alert('Неверный формат ответа от сервера');
        return;
      }

      SecureStorageService.saveAuthToken(res.access_token);
      if (res.user) {
        SecureStorageService.saveUserData(res.user);
      }
      if (res.subscription) {
        SecureStorageService.saveSubscription(res.subscription);
      }

      setAuthenticated(true);
      navigate('/');
    } catch (error: any) {
      setHasError({
        isError: true,
        msg: error?.response?.data?.message || 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <form className="login-form" onSubmit={handleLogin}>
          {/* Header Section */}
          <div className="login-header">
            <div className="icon-container">
              <span className="icon-text">👋</span>
            </div>
            <h1 className="login-title">Народный +</h1>
            <p className="login-subtitle">
              Войдите в свой аккаунт для продолжения
            </p>
          </div>

          {/* Form Card */}
          <div className="form-card">
            {/* Error Message */}
            {hasError?.isError && (
              <div className="error-container">
                <AlertCircle size={20} className="error-icon" />
                <span className="error-text">{hasError.msg}</span>
              </div>
            )}

            {/* Email/Phone Input */}
            <div className="input-group">
              <label className="input-label">
                <Mail size={18} className="label-icon" />
                Email или телефон
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Введите email или телефон"
                value={form.emailOrPhone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    emailOrPhone: e.target.value.toLowerCase(),
                  }))
                }
                required
              />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="password-header">
                <label className="input-label">
                  <Lock size={18} className="label-icon" />
                  Пароль
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Забыли пароль?
                </Link>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="Введите ваш пароль"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" className="login-button">
            🔓 Войти
          </button>

          {/* Footer */}
          <div className="login-footer">
            <span className="footer-text">Нет аккаунта? </span>
            <Link to="/registration" className="signup-link">
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
