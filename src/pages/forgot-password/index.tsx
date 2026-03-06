/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import './style.scss';
import { forgotPassword, resetPassword } from '../../api/auth-api';

type Step = 'request-otp' | 'reset-password';

export const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request-otp');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<{
    isError: boolean;
    msg: string;
  } | null>(null);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (step === 'reset-password' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOrPhone.trim()) {
      setHasError({
        isError: true,
        msg: 'Введите email или телефон',
      });
      return;
    }

    setHasError(null);
    setLoading(true);

    try {
      await forgotPassword(emailOrPhone.toLowerCase().trim());
      
      // Success - move to reset password step
      setStep('reset-password');
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      setHasError(null);
    } catch (error: any) {
      setHasError({
        isError: true,
        msg: error?.response?.data?.message || 'Не удалось отправить код',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!otp.trim() || !newPassword.trim()) {
      setHasError({
        isError: true,
        msg: 'Заполните все поля',
      });
      return;
    }

    if (otp.length !== 6) {
      setHasError({
        isError: true,
        msg: 'OTP код должен содержать 6 цифр',
      });
      return;
    }

    if (newPassword.length < 6) {
      setHasError({
        isError: true,
        msg: 'Пароль должен содержать минимум 6 символов',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setHasError({
        isError: true,
        msg: 'Пароли не совпадают',
      });
      return;
    }

    setHasError(null);
    setLoading(true);

    try {
      await resetPassword(
        emailOrPhone.toLowerCase().trim(),
        newPassword,
        otp
      );

      // Success - navigate to login
      alert('Пароль успешно сброшен! Войдите с новым паролем.');
      navigate('/login');
    } catch (error: any) {
      setHasError({
        isError: true,
        msg: error?.response?.data?.message || 'Неверный или истекший код',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setHasError(null);
    
    try {
      await forgotPassword(emailOrPhone.toLowerCase().trim());
      setTimeLeft(300);
      setCanResend(false);
      alert('Новый код отправлен!');
    } catch (error: any) {
      setHasError({
        isError: true,
        msg: error?.response?.data?.message || 'Не удалось отправить код',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        {step === 'request-otp' ? (
          <form className="forgot-password-form" onSubmit={handleRequestOtp}>
            {/* Header Section */}
            <div className="forgot-password-header">
              <Link to="/login" className="back-button">
                <ArrowLeft size={24} />
              </Link>
              <div className="icon-container">
                <span className="icon-text">🔐</span>
              </div>
              <h1 className="forgot-password-title">Забыли пароль?</h1>
              <p className="forgot-password-subtitle">
                Введите ваш email или телефон, и мы отправим вам код для сброса
                пароля
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
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value.toLowerCase())}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? '⏳ Отправка...' : '📧 Отправить код'}
            </button>

            {/* Footer */}
            <div className="forgot-password-footer">
              <Link to="/login" className="back-to-login-link">
                ← Вернуться к входу
              </Link>
            </div>
          </form>
        ) : (
          <form className="forgot-password-form" onSubmit={handleResetPassword}>
            {/* Header Section */}
            <div className="forgot-password-header">
              <button
                type="button"
                className="back-button"
                onClick={() => setStep('request-otp')}
              >
                <ArrowLeft size={24} />
              </button>
              <div className="icon-container">
                <span className="icon-text">🔑</span>
              </div>
              <h1 className="forgot-password-title">Сброс пароля</h1>
              <p className="forgot-password-subtitle">
                Введите 6-значный код, отправленный на
                <br />
                <strong>{emailOrPhone}</strong>
              </p>
            </div>

            {/* Timer */}
            {timeLeft > 0 ? (
              <div className="timer-container">
                <Clock size={16} />
                <span>Код действителен: {formatTime(timeLeft)}</span>
              </div>
            ) : (
              <div className="timer-container expired">
                <AlertCircle size={16} />
                <span>Код истек</span>
              </div>
            )}

            {/* Form Card */}
            <div className="form-card">
              {/* Error Message */}
              {hasError?.isError && (
                <div className="error-container">
                  <AlertCircle size={20} className="error-icon" />
                  <span className="error-text">{hasError.msg}</span>
                </div>
              )}

              {/* OTP Input */}
              <div className="input-group">
                <label className="input-label">
                  <Mail size={18} className="label-icon" />
                  Код подтверждения
                </label>
                <input
                  type="text"
                  className="form-input otp-input"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>

              {/* New Password Input */}
              <div className="input-group">
                <label className="input-label">
                  <Lock size={18} className="label-icon" />
                  Новый пароль
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Минимум 6 символов"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Confirm Password Input */}
              <div className="input-group">
                <label className="input-label">
                  <Lock size={18} className="label-icon" />
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Resend OTP Link */}
              <div className="resend-container">
                <span className="resend-text">Не получили код? </span>
                <button
                  type="button"
                  className={`resend-button ${canResend ? 'active' : 'disabled'}`}
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                >
                  Отправить снова
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? '⏳ Сброс...' : '✅ Сбросить пароль'}
            </button>

            {/* Footer */}
            <div className="forgot-password-footer">
              <Link to="/login" className="back-to-login-link">
                ← Вернуться к входу
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
