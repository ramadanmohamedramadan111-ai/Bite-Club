'use client';

import Image from 'next/image';
import { Clock, Users } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroupSessionsStore } from '@/lib/const-data';
import { useGroupsStore } from '@/lib/const-data';

export default function ActiveSessionsSection() {
  const groups = useGroupsStore((state) => state.groups);
  const sessions = useGroupSessionsStore((state) => state.sessions);

  const groupIds = groups.map((group) => group.id);
  const relevantSessions = sessions.filter(
    (session) =>
      !session.groupId || groupIds.includes(session.groupId),
  );

  if (relevantSessions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Active group orders</h2>
        <p className="text-sm text-muted-foreground">
          Join an ongoing group order session
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {relevantSessions.map((session) => (
          <Link key={session.id} href={`/group-order/${session.id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                {session.restaurantImage && (
                  <div className="relative size-10 overflow-hidden rounded-lg">
                    <Image
                      src={session.restaurantImage}
                      alt={session.restaurantName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">
                    {session.restaurantName}
                  </CardTitle>
                  {session.groupName && (
                    <p className="text-xs text-muted-foreground">
                      {session.groupName}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" />
                  Code: {session.code}
                </span>
                <span className="inline-flex items-center gap-1 capitalize">
                  {session.type}
                </span>
                {session.expiresAt && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    Expires soon
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
