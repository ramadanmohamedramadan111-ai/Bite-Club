'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSocialStore } from '@/stores/social';

export default function ReferralsSection() {
  const t = useTranslations('points');
  const profile = useSocialStore((state) => state.profile);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    setReferralLink(
      `${window.location.origin}/register?ref=${profile.username}`,
    );
  }, [profile.username]);

  async function handleCopy() {
    if (!referralLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success(t('referralCopied'));
    } catch {
      toast.error(t('referralCopyFailed'));
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t('referrals')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('referralsDesc')}
        </p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t('referralLink')}</p>
              <p className="text-sm text-muted-foreground">
                {t('referralInvite')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              readOnly
              value={referralLink}
              className="font-mono text-sm"
            />
            <Button
              type="button"
              className="shrink-0"
              onClick={handleCopy}
              disabled={!referralLink}
            >
              <Copy className="mr-2 h-4 w-4" />
              {t('copyLink')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
