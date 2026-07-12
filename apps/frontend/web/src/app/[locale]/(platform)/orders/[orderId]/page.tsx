'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import OrderDetailPageView from '@/components/orders/OrderDetailPageView';
import { getOrderById } from '@/data/mock-orders';

interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((value) => setOrderId(value.orderId));
  }, [params]);

  useEffect(() => {
    if (!orderId) return;
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, [orderId]);

  const order = orderId ? getOrderById(orderId) : undefined;

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto flex items-center justify-center py-12">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return <OrderDetailPageView order={order} />;
}
