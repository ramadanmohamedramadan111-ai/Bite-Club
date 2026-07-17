import React from 'react';
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';
import { ExternalLink } from 'lucide-react';

export default function GroupHeaderActiveSession() {
  const activeSession = false;
  return (
    <>
      {activeSession && (
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/group-order/${activeSession.id}`}>
            <ExternalLink className="size-4" />
            Active group order
          </Link>
        </Button>
      )}
    </>
  );
}

