import api from './axios-instance';

export type Payment = {
  paymentId: string;
  yookassaPaymentId: string;
  confirmationUrl: string;
  status: string;
  amount: number;
};

export const createPayment = async (
  subscriptionId: string,
  userId: string,
  userEmail: string,
  redirectUrl: string
) => {
  const res = await api.post<Payment>(`/payments/create`, {
    subscriptionId,
    userId,
    userEmail,
    redirectUrl,
  });

  return res.data;
};
