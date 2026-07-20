import { notFound } from 'next/navigation';
import RestaurantLocationMap from '@/components/restaurants/RestaurantLocationMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone } from 'lucide-react';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import { RestaurantType } from '@/types/restaurant/restaurant';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantInfoPage({ params }: PageProps) {
  const { id } = await params;

  const data = await serverFetch<ApiResponse<RestaurantType>>(
    `/user/restaurants/${id}`,
  );

  const restaurant = data.data;

  if (!restaurant) {
    notFound();
  }

  const days = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Restaurant Info</h2>
        <p className="text-sm text-muted-foreground">
          Contact details, hours, and location
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {restaurant.description}
            </p>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                <span>{restaurant.phone_number}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {days.map((day) => {
                const hours = restaurant.opening_hours?.find(
                  (h) => h.day_of_week === day.value,
                );

                return (
                  <div
                    key={day.value}
                    className="flex items-center justify-between gap-4 text-sm">
                    <dt className="font-medium">{day.label}</dt>

                    <dd className="text-muted-foreground">
                      {!hours || hours.is_closed
                        ? 'Closed'
                        : `${hours.opens_at} - ${hours.closes_at}`}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{restaurant.address}</p>
          <RestaurantLocationMap
            lat={restaurant.latitude}
            lng={restaurant.longitude}
          />
        </CardContent>
      </Card>
    </div>
  );
}

