/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './axios-instance';

export type SubscriptionType = {
  createdAt: string;
  description: string;
  discount: any;
  durationDays: number;
  features: string[];
  id: string;
  isActive: boolean;
  maxUsagesPerDay: number;
  name: string;
  price: string;
};

export const createSubscription = async (userId: string) => {
  const res = await api.post(`/subscriptions/create`, { userId });

  return res.data;
};

export const getSubscriptionPlan = async () => {
  const res = await api.get<SubscriptionType>(`/subscriptions/plan`);
  return res.data;
};

export const getAllSubscriptionPlans = async () => {
  const res = await api.get<SubscriptionType[]>(`/subscriptions/plans`);
  return res.data;
};

export const getSubscriptions = async (userId: string) => {
  const res = await api.get(`/subscriptions/${userId}`);
  return res.data;
};

export const getMySubscriptions = async (userId: string) => {
  const res = await api.get(`/subscriptions/my-subscriptions/${userId}`);

  return res.data;
};
