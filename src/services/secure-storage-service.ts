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
 * Advanced SecureStorageService using IndexedDB
 *
 * Advantages over localStorage:
 * - Larger storage capacity (typically 50MB+)
 * - Asynchronous API (doesn't block main thread)
 * - Better for storing complex data structures
 * - Isolated per domain (better security)
 * - Supports indexing and queries
 *
 * Usage: Use this for production applications requiring enhanced security
 */
export class SecureStorageService {
  private static readonly DB_NAME = 'secure_storage';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'data';
  private static db: IDBDatabase | null = null;

  private static readonly KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_ID: 'user_id',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    SUBSCRIPTION_DATA: 'subscription_data',
    BIOMETRIC_ENABLED: 'biometric_enabled',
  };

  /**
   * Initialize IndexedDB
   */
  private static async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });
  }

  /**
   * Check if IndexedDB is available
   */
  private static isIndexedDBAvailable(): boolean {
    try {
      return typeof indexedDB !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Save data to IndexedDB
   */
  private static async setData(key: string, value: any): Promise<boolean> {
    try {
      if (!this.isIndexedDBAvailable()) {
        throw new Error('IndexedDB is not available');
      }

      const db = await this.initDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.put(
          {
            value,
            timestamp: Date.now(),
          },
          key
        );

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(new Error('Failed to save data'));
      });
    } catch (error) {
      console.error('Error saving data to IndexedDB:', error);
      return false;
    }
  }

  /**
   * Get data from IndexedDB
   */
  private static async getData(key: string): Promise<any | null> {
    try {
      if (!this.isIndexedDBAvailable()) {
        return null;
      }

      const db = await this.initDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result?.value || null);
        };

        request.onerror = () => reject(new Error('Failed to get data'));
      });
    } catch (error) {
      console.error('Error getting data from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Delete data from IndexedDB
   */
  private static async deleteData(key: string): Promise<boolean> {
    try {
      if (!this.isIndexedDBAvailable()) {
        return false;
      }

      const db = await this.initDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.delete(key);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(new Error('Failed to delete data'));
      });
    } catch (error) {
      console.error('Error deleting data from IndexedDB:', error);
      return false;
    }
  }

  /**
   * Save authentication token
   */
  static async saveAuthToken(token: any): Promise<boolean> {
    try {
      return await this.setData(this.KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      return false;
    }
  }

  /**
   * Get authentication token
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      return await this.getData(this.KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Remove authentication token (logout)
   */
  static async removeAuthToken(): Promise<boolean> {
    try {
      return await this.deleteData(this.KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
      return false;
    }
  }

  /**
   * Save user data
   */
  static async saveUserData(userData: UserDataType): Promise<boolean> {
    try {
      return await this.setData(this.KEYS.USER_DATA, userData);
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  /**
   * Get user data
   */
  static async getUserData(): Promise<UserDataType | null> {
    try {
      return await this.getData(this.KEYS.USER_DATA);
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Save subscription data
   */
  static async saveSubscription(subscriptionData: any): Promise<boolean> {
    try {
      return await this.setData(this.KEYS.SUBSCRIPTION_DATA, subscriptionData);
    } catch (error) {
      console.error('Error saving subscription:', error);
      return false;
    }
  }

  /**
   * Get subscription data
   */
  static async getSubscription(): Promise<any | null> {
    try {
      const data = await this.getData(this.KEYS.SUBSCRIPTION_DATA);
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
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      return token !== null;
    } catch {
      return false;
    }
  }

  /**
   * Clear all stored data (logout)
   */
  static async clearAll(): Promise<boolean> {
    try {
      if (!this.isIndexedDBAvailable()) {
        return false;
      }

      const db = await this.initDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const keysToDelete = Object.values(this.KEYS);

      return new Promise((resolve) => {
        let completed = 0;

        keysToDelete.forEach((key) => {
          const request = store.delete(key);
          request.onsuccess = () => {
            completed++;
            if (completed === keysToDelete.length) {
              resolve(true);
            }
          };
        });
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * Save with custom options (supports expiration)
   */
  static async saveWithOptions(
    key: string,
    value: string,
    options?: { expiresIn?: number; [key: string]: any }
  ): Promise<boolean> {
    try {
      const data = {
        value,
        expiresAt: options?.expiresIn
          ? Date.now() + options.expiresIn
          : undefined,
      };

      return await this.setData(key, data);
    } catch (error) {
      console.error('Error saving with options:', error);
      return false;
    }
  }

  /**
   * Get item by custom key
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      const data = await this.getData(key);
      if (!data) return null;

      // Check expiration if present
      if (data.expiresAt && data.expiresAt < Date.now()) {
        await this.deleteData(key);
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
  static async removeItem(key: string): Promise<boolean> {
    try {
      return await this.deleteData(key);
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }

  /**
   * Close the database connection
   */
  static closeDatabase(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
