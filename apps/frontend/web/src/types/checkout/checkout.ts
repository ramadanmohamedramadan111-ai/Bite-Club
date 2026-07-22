export type CheckoutPreviewResponse = {
  cart_id: number;
  order_type: 'delivery' | 'pickup';
  financials: {
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    total: number;
  };
  deposit_rules: {
    requires_deposit: boolean;
    deposit_percentage: number;
    deposit_amount: number;
    remaining_amount: number;
  };
  internal_data: {
    system_commission: number;
  };
};

export type CheckoutPaymentResponse = {
  order_id: number;
  status: 'pending';
  payment_url: string | null;
  message: string;
};

