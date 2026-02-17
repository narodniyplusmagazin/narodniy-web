import api from './axios-instance';

// Response from POST /qr/generate
export interface QRGenerateResponse {
  token: string;
  validFrom: string;
  validTo: string;
  isUsed: boolean;
  subscriptionId: string;
}

// Response from GET /qr/today/:subscriptionId
export interface QRTodayTokenResponse {
  dailyLimit: number;
  isUsed: boolean;
  remainingUses: number;
  subscriptionId: string;
  token: string;
  usageCount: number;
  validFrom: string;
  validTo: string;
  qrWithPrefix: string;
  avalibleUsageCount: number;
}

// Response from GET /qr/usages/:subscriptionId
export interface QRUsageStats {
  avalibleUsageCount: number;
  usages: Array<{
    usedAt: string;
    location?: string;
  }>;
  usageCount: number;
  remainingUses: number;
  dailyLimit: number;
}

// POST /qr/generate - Генерирует ежедневный QR код
export const generateQR = async (
  subscriptionId: string,
  userId: string
): Promise<QRGenerateResponse> => {
  const response = await api.post(`qr-code/generate`, {
    userId,
    subscriptionId,
  });

  return response.data;
};

// GET /qr/today/:subscriptionId - Получить сегодняшний токен
export const getTodayToken = async (
  subscriptionId: string
): Promise<QRTodayTokenResponse> => {
  console.log(subscriptionId);

  const response = await api.get(`qr-code/today/${subscriptionId}`);

  return response.data;
};

// POST /qr/use/:subscriptionId - Отметить использование QR кода
// export const markQrUsage = async (subscriptionId: string) => {
//   const response = await api.post(`qr/use/${subscriptionId}`);
//   return response.data;
// };

// GET /qr/usages/:subscriptionId - Получить статистику использования
export const getQrUsages = async (
  subscriptionId: string
): Promise<QRUsageStats> => {
  const response = await api.get(`qr-code/usages/${subscriptionId}`);

  return response.data;
};
