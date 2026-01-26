/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UserDataType } from '../services/secure-storage-service';
import api from './axios-instance';

export type LoginResponse = {
  subscription: any;
  access_token: string;
  user: UserDataType;
};

export type RegistrationResponse = {
  access_token: string;
  user: UserDataType;
};

export const login = async (emailOrPhone: string, password: string) => {
  const res = await api.post<LoginResponse>('/auth/login', {
    emailOrPhone,
    password,
  });
  return res.data;
};

export const registration = async (registerDto: RegisterDto) => {
  const res = await api.post<RegistrationResponse>(
    '/auth/register',
    registerDto
  );
  return res.data;
};

export const changePassword = async () => {};

export type RegisterDto = {
  fullName: string;
  phone: string;
  email: string;
  gender: 'male' | 'female';
  password: string;
  acceptTerms: boolean;
  code?: string;
};

export const deleteAccount = async (id: string) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

export const getVerificationCode = async (
  emailOrPhone: string,
  method: 'sms' | 'mail'
) => {
  const res = await api.post('/auth/verification-otp', {
    emailOrPhone,
    method,
  });
  return res.data;
};

export const verifyOtp = async (target: string, otp: string) => {
  const res = await api.post('/auth/verify-otp', { target, otp });
  return res.data;
};

export const forgotPassword = async (emailOrPhone: string) => {
  const res = await api.post('/users/forgot-password', {
    emailOrPhone,
  });
  return res.data;
};

export const resetPassword = async (
  emailOrPhone: string,
  otp: string,
  newPassword: string
) => {
  const res = await api.post('/users/reset-password', {
    emailOrPhone,
    otp,
    newPassword,
  });
  return res.data;
};
