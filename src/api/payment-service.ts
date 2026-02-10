import api from './axios-instance';

export type Payment = {
  paymentId: string;
  yookassaPaymentId: string;
  confirmationUrl: string;
  status: string;
  amount: number;
};

export type CreatePaymentRequest = {
  contactInfo: string;
  userId: string;
  redirectUrl: string;
};

export const createPayment = async (
  contactInfo: string,
  userId: string,
  redirectUrl: string
) => {
  const res = await api.post<Payment>(`/payments/create`, {
    contactInfo,
    userId,
    redirectUrl,
  });

  return res.data;
};
