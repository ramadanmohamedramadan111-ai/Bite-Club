import { serverFetch } from '@/utils/server-fetch';
import type { ApiResponse } from '@/types/api/api-response';
import type { OrderDetails } from '@/types/orders/order';
import OrderDetailPageView from '@/components/orders/OrderDetailPageView';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;

  const response = await serverFetch<ApiResponse<OrderDetails>>(
    `/user/orders/${orderId}`,
  );

  const order = response.data;

  if (!order) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Link href="/orders">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to orders
          </Button>
        </Link>
      </div>
    );
  }

  return <OrderDetailPageView order={order} />;
}
