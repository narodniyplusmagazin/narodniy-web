/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import './style.scss';
import { SecureStorageService } from '../../services/secure-storage-service';
import { useAuthStore } from '../../shared/stores/auth-store';
import { login } from '../../api/auth-api';

interface FieldErrors {
  emailOrPhone?: string;
  password?: string;
}

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    emailOrPhone: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    if (!form.emailOrPhone.trim()) {
      errors.emailOrPhone = 'Введите email или номер телефона';
      isValid = false;
    }

    if (!form.password.trim()) {
      errors.password = 'Введите пароль';
      isValid = false;
    } else if (form.password.length < 4) {
      errors.password = 'Пароль должен содержать минимум 4 символа';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const getErrorMessage = (error: any): string => {
    const message = error?.response?.data?.message?.toLowerCase() || '';
    const status = error?.response?.status;

    // Network errors
    if (!error?.response) {
      return 'Ошибка подключения. Проверьте интернет-соединение';
    }

    // Server errors
    if (status >= 500) {
      return 'Ошибка сервера. Попробуйте позже';
    }

    // Authentication errors
    if (status === 401 || message.includes('invalid') || message.includes('incorrect')) {
      return 'Неверный email/телефон или пароль';
    }

    if (status === 404 || message.includes('not found')) {
      return 'Пользователь не найден';
    }

    if (status === 403) {
      return 'Доступ запрещен. Проверьте ваши данные';
    }

    // Rate limiting
    if (status === 429) {
      return 'Слишком много попыток. Подождите немного';
    }

    return error?.response?.data?.message || 'Произошла ошибка при входе';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setGeneralError('');
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await login(
        form.emailOrPhone.toLowerCase().trim(),
        form.password
      );

      if (!res?.access_token) {
        setGeneralError('Неверный формат ответа от сервера');
        setLoading(false);
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
      setGeneralError(getErrorMessage(error));
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
            {/* General Error Message */}
            {generalError && (
              <div className="error-container">
                <AlertCircle size={20} className="error-icon" />
                <span className="error-text">{generalError}</span>
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
                className={`form-input ${
                  fieldErrors.emailOrPhone ? 'input-error' : ''
                } ${form.emailOrPhone && !fieldErrors.emailOrPhone ? 'input-valid' : ''}`}
                placeholder="example@mail.com или +7 XXX XXX XX XX"
                value={form.emailOrPhone}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    emailOrPhone: e.target.value.toLowerCase(),
                  }));
                  // Clear error on change
                  if (fieldErrors.emailOrPhone) {
                    setFieldErrors((prev) => ({ ...prev, emailOrPhone: undefined }));
                  }
                  setGeneralError('');
                }}
                disabled={loading}
              />
              {fieldErrors.emailOrPhone && (
                <span className="field-error-text">{fieldErrors.emailOrPhone}</span>
              )}
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="password-header">
                <label className="input-label">
                  <Lock size={18} className="label-icon" />
                  Пароль
                </label>
                <Link to="/forgot-password" className="forgot-link" tabIndex={loading ? -1 : 0}>
                  Забыли пароль?
                </Link>
              </div>
              <input
                type="password"
                className={`form-input ${
                  fieldErrors.password ? 'input-error' : ''
                } ${form.password && !fieldErrors.password ? 'input-valid' : ''}`}
                placeholder="Введите ваш пароль"
                value={form.password}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, password: e.target.value }));
                  // Clear error on change
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                  setGeneralError('');
                }}
                disabled={loading}
              />
              {fieldErrors.password && (
                <span className="field-error-text">{fieldErrors.password}</span>
              )}
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Вход...
              </>
            ) : (
              <>🔓 Войти</>
            )}
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
