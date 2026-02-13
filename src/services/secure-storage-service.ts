/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserDataType = {
  createdAt: string;
  email: string;
  fullName: string;
  gender: string;
  id: string;
  passwordHash: string;
  phone: string;
  resetOtp: string;
  resetOtpExpires: string;
  resetToken: string;
  resetTokenExpires: string;
  updatedAt: string;
};

/**
 * SecureStorageService using localStorage
 *
 * Simple and straightforward storage for authentication and user data
 *
 * Usage: Use this for storing auth tokens, user data, and subscription info
 */
export class SecureStorageService {
  private static readonly KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_ID: 'user_id',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    SUBSCRIPTION_DATA: 'subscription_data',
    BIOMETRIC_ENABLED: 'biometric_enabled',
  };

  /**
   * Check if localStorage is available
   */
  private static isLocalStorageAvailable(): boolean {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Save data to localStorage
   */
  private static setData(key: string, value: any): boolean {
    try {
      if (!this.isLocalStorageAvailable()) {
        throw new Error('localStorage is not available');
      }

      const dataToStore = {
        value,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(dataToStore));
      return true;
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      return false;
    }
  }

  /**
   * Get data from localStorage
   */
  private static getData(key: string): any | null {
    try {
      if (!this.isLocalStorageAvailable()) {
        return null;
      }

      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return parsed?.value || null;
    } catch (error) {
      console.error('Error getting data from localStorage:', error);
      return null;
    }
  }

  /**
   * Delete data from localStorage
   */
  private static deleteData(key: string): boolean {
    try {
      if (!this.isLocalStorageAvailable()) {
        return false;
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting data from localStorage:', error);
      return false;
    }
  }

  /**
   * Save authentication token
   */
  static saveAuthToken(token: any): boolean {
    try {
      return this.setData(this.KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      return false;
    }
  }

  /**
   * Get authentication token
   */
  static getAuthToken(): string | null {
    try {
      return this.getData(this.KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Remove authentication token (logout)
   */
  static removeAuthToken(): boolean {
    try {
      return this.deleteData(this.KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
      return false;
    }
  }

  /**
   * Save user data
   */
  static saveUserData(userData: UserDataType): boolean {
    try {
      return this.setData(this.KEYS.USER_DATA, userData);
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  /**
   * Get user data
   */
  static getUserData(): UserDataType | null {
    try {
      return this.getData(this.KEYS.USER_DATA);
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Save subscription data
   */
  static saveSubscription(subscriptionData: any): boolean {
    try {
      return this.setData(this.KEYS.SUBSCRIPTION_DATA, subscriptionData);
    } catch (error) {
      console.error('Error saving subscription:', error);
      return false;
    }
  }

  /**
   * Get subscription data
   */
  static getSubscription(): any | null {
    try {
      const data = this.getData(this.KEYS.SUBSCRIPTION_DATA);
      if (!data) return null;

      // Return nested subscription object if it exists, otherwise return the data itself
      return data?.subscription || data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    try {
      const token = this.getAuthToken();
      return token !== null;
    } catch {
      return false;
    }
  }

  /**
   * Clear all stored data (logout)
   */
  static clearAll(): boolean {
    try {
      if (!this.isLocalStorageAvailable()) {
        return false;
      }

      const keysToDelete = Object.values(this.KEYS);
      keysToDelete.forEach((key) => {
        localStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * Save with custom options (supports expiration)
   */
  static saveWithOptions(
    key: string,
    value: string,
    options?: { expiresIn?: number; [key: string]: any }
  ): boolean {
    try {
      const data = {
        value,
        expiresAt: options?.expiresIn
          ? Date.now() + options.expiresIn
          : undefined,
      };

      return this.setData(key, data);
    } catch (error) {
      console.error('Error saving with options:', error);
      return false;
    }
  }

  /**
   * Get item by custom key
   */
  static getItem(key: string): string | null {
    try {
      const data = this.getData(key);
      if (!data) return null;

      // Check expiration if present
      if (data.expiresAt && data.expiresAt < Date.now()) {
        this.deleteData(key);
        return null;
      }

      return data.value || data;
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  /**
   * Remove item by custom key
   */
  static removeItem(key: string): boolean {
    try {
      return this.deleteData(key);
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }
}
