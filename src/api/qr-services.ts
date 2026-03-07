import api from './axios-instance';

// Response from POST /qr-code/generate (NEW 30-second QR)
export interface QRGenerateResponse {
  token: string; // Prefixed token like "QR_xxx"
  rawToken: string; // Actual token
  validFrom: string;
  validTo: string;
  usageCount: number;
  remainingUses: number;
  avalibleUsageCount: number;
  dailyLimit: number;
  isUsed: boolean;
  subscriptionId: string;
  qrWithPrefix?: string;
}

// Response from GET /qr/scan/:token
export interface QRScanResponse {
  status: 'success' | 'QR_EXPIRED' | 'QR_ALREADY_USED' | 'QR_INVALID';
  message?: string;
}

// Legacy response from GET /qr/today/:subscriptionId
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

// ===== NEW 30-SECOND QR ENDPOINTS =====

/**
 * POST /qr-code/generate
 * Generates a new daily QR code (valid for 30 seconds display)
 */
export const generateQRCode = async (
  userId: string,
  subscriptionId: string
): Promise<QRGenerateResponse> => {
  const response = await api.post('qr-code/generate', {
    userId,
    subscriptionId,
  });
  return response.data;
};

/**
 * POST /qr-code/regenerate
 * Regenerates a new QR code (doesn't affect daily usage)
 */
export const regenerateQRCode = async (
  userId: string,
  subscriptionId: string
): Promise<QRGenerateResponse> => {
  console.log();
  
  const response = await api.post('qr-code/regenerate-session', {
    userId,
    // subscriptionId,
  });
  return response.data;
};

/**
 * GET /qr/scan/:token
 * Scans and validates a QR token (backend only)
 */
export const scanQRCode = async (
  token: string
): Promise<QRScanResponse> => {
  const response = await api.get(`qr/scan/${token}`);
  return response.data;
};

/**
 * Build QR URL for encoding
 */
export const buildQRCodeURL = (token: string): string => {
  // Token is already prefixed (e.g., "QR_xxx")
  return token;
};

// ===== LEGACY ENDPOINTS =====

// POST /qr-code/generate - Legacy daily QR code (DEPRECATED)
export const generateQR = async (
  subscriptionId: string,
  userId: string
): Promise<QRGenerateResponse> => {
  const response = await api.post(`qr-code/generate`, {
    userId,
    subscriptionId,
  });

  return response.data as QRGenerateResponse;
};

// GET /qr-code/today/:subscriptionId - Legacy get today token
export const getTodayToken = async (
  subscriptionId: string
): Promise<QRTodayTokenResponse> => {
  const response = await api.get(`qr-code/today/${subscriptionId}`);
  return response.data;
};

// GET /qr-code/usages/:subscriptionId - Legacy usage statistics
export const getQrUsages = async (
  subscriptionId: string
): Promise<QRUsageStats> => {
  const response = await api.get(`qr-code/usages/${subscriptionId}`);
  return response.data;
};
