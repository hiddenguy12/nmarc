/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
  }