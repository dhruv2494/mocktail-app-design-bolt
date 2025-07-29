export interface APIError {
  data?: {
    message: string;
    errors?: string[];
  };
  message?: string;
  status?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotificationData {
  type: 'test_reminder' | 'result' | 'subscription' | 'general';
  test_id?: string;
  result_id?: string;
  route?: string;
  [key: string]: any;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  payment_id?: string;
  order_id?: string;
  status: 'pending' | 'completed' | 'failed';
  gateway: 'razorpay' | 'stripe' | 'other';
  transaction_date?: string;
}