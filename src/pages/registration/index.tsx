import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, User, CheckCircle2 } from 'lucide-react';
// import { Loading } from "@/components/ui/loading/loading";
import './style.scss';
import { registration } from '../../api/auth-api';
import { SecureStorageService } from '../../services/secure-storage-service';
import { useAuthStore } from '../../shared/stores/auth-store';

export type RegistrationForm = {
  fullName: string;
  phone: string;
  email?: string | null;
  gender: 'male' | 'female';
  password: string;
  code: string;
  acceptTerms: boolean;
};

export const RegistrationScreen: React.FC = () => {
  const [form, setForm] = useState<RegistrationForm>({
    fullName: '',
    phone: '+7',
    email: null,
    gender: 'male',
    password: '',
    code: '',
    acceptTerms: false,
  });
  const [, setLoading] = useState(false);
  const { setAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex =
      /^(8|\+7)(\s|\(|-)?(\d{3})(\s|\)|-)?(\d{3})(\s|-)?(\d{2})(\s|-)?(\d{2})$/;
    return phoneRegex.test(phone);
  };

  const handleRegistration = async () => {
    if (!form.fullName.trim()) {
      alert('Ошибка валидации - Введите полное имя');
      return;
    }

    const hasPhone = form.phone.trim() && form.phone.trim() !== '+7';

    if (!hasPhone) {
      alert('Ошибка валидации - Введите номер телефона');
      return;
    }

    if (!validatePhoneNumber(form.phone.trim())) {
      alert(
        ' Неверный формат телефона. Используйте формат: +7XXXXXXXXXX или 8XXXXXXXXXX'
      );

      return;
    }

    if (!form.password.trim() || form.password.trim().length < 6) {
      alert('Ошибка валидации - Пароль должен быть не менее 6 символов');
      return;
    }

    if (!form.acceptTerms) {
      alert('Ошибка валидации - Примите условия использования');
      return;
    }

    try {
      const res = await registration(form);

      await SecureStorageService.saveAuthToken(res.access_token);
      if (res.user) {
        await SecureStorageService.saveUserData(res.user);
      }

      alert('Регистрация прошла успешно!');
      setAuthenticated(true);
      navigate('/profile');
    } catch (error) {
      console.log('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      {/* <Loading visible={loading} text="Регистрация..." /> */}

      <div className="registration-wrapper">
        <form
          className="registration-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleRegistration();
          }}
        >
          {/* Header Section */}
          <div className="registration-header">
            <div className="icon-container">
              <span className="icon-text">👤</span>
            </div>
            <h1 className="registration-title">Народный +</h1>
            <p className="registration-subtitle">
              Создайте аккаунт для продолжения
            </p>
          </div>

          {/* Form Section */}
          <div className="form-card">
            {/* Full Name */}
            <div className="input-group">
              <label className="input-label">
                <User size={18} className="label-icon" />
                Полное имя *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Введите ваше имя"
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value.trim() })
                }
                required
              />
            </div>

            {/* Phone Number */}
            <div className="input-group">
              <label className="input-label">
                <Phone size={18} className="label-icon" />
                Телефон *
              </label>
              <div className="phone-input-container">
                <span className="phone-prefix">+7</span>
                <input
                  type="tel"
                  className="phone-input"
                  placeholder="(999) 123-45-67"
                  value={form.phone.replace(/^\+7/, '')}
                  onChange={(e) => {
                    const phone = e.target.value;
                    // Remove all non-digit characters except spaces, hyphens, and parentheses
                    const cleaned = phone.replace(/[^\d\s\-()]/g, '');
                    setForm({ ...form, phone: '+7' + cleaned });
                  }}
                  maxLength={17}
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="divider-container">
              <div className="divider-line" />
              <span className="divider-text">или</span>
              <div className="divider-line" />
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label">
                <Mail size={18} className="label-icon" />
                Email
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="example@mail.com"
                value={form.email || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value.toLowerCase().trim(),
                  })
                }
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label">
                <Lock size={18} className="label-icon" />
                Пароль *
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Минимум 6 символов"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {/* Gender Selection */}
            <div className="input-group">
              <label className="input-label">Пол</label>
              <div className="gender-container">
                <button
                  type="button"
                  className={`gender-button ${form.gender === 'male' ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, gender: 'male' })}
                >
                  👨 Мужской
                </button>
                <button
                  type="button"
                  className={`gender-button ${form.gender === 'female' ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, gender: 'female' })}
                >
                  👩 Женский
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="terms-container">
              <div className="terms-checkbox-wrapper">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  className="terms-checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      acceptTerms: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="acceptTerms" className="terms-label">
                  <CheckCircle2 size={20} className="checkbox-icon" />
                  <span className="terms-text">
                    Согласен с условиями использования и{' '}
                    <Link to="/privacy-policy" className="terms-link">
                      политикой конфиденциальности
                    </Link>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button type="submit" className="primary-button">
            ✨ Зарегистрироваться
          </button>

          {/* Footer */}
          <div className="registration-footer">
            <span className="footer-text">Уже есть аккаунт? </span>
            <Link to="/login" className="login-link">
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationScreen;
