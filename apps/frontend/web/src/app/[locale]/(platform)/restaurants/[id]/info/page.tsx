import { notFound } from 'next/navigation';
import { getRestaurantById } from '@/data/restaurant-details';
import RestaurantLocationMap from '@/components/restaurants/RestaurantLocationMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone } from 'lucide-react';
import { capitalize } from '@/utils/format';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantInfoPage({ params }: PageProps) {
  const { id } = await params;
  const restaurantId = Number(id);
  const restaurant = getRestaurantById(restaurantId);

  if (!restaurant) {
    notFound();
  }

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
                <span>{restaurant.location.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                <span>{restaurant.phoneNumber}</span>
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
              {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                <div
                  key={day}
                  className="flex items-center justify-between gap-4 text-sm">
                  <dt className="font-medium">{capitalize(day)}</dt>
                  <dd className="text-muted-foreground">{hours}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {restaurant.location.address}
          </p>
          <RestaurantLocationMap location={restaurant.location} />
        </CardContent>
      </Card>
    </div>
  );
}
