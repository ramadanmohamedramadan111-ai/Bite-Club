import React from 'react';
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-background to-primary/5 px-6 py-16 text-center sm:px-12 sm:py-20">
      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Order food you&apos;ll love
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover top restaurants near you, order with friends, and earn
          rewards with every meal.
        </p>
        <Button asChild size="lg">
          <Link href="/restaurants">Browse restaurants</Link>
        </Button>
      </div>
    </section>
  );
}

