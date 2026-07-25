'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Copy, Gift } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReferralLinkSectionProps {
  referralCode: string;
}

export default function ReferralLinkSection({
  referralCode,
}: ReferralLinkSectionProps) {
  const t = useTranslations('profile');
  const locale = useLocale();
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/register?referrer_code=${referralCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success(t('linkCopied'));
    } catch {
      toast.error(t('linkCopyFailed'));
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold">{t('referralLink')}</p>
          <p className="text-sm text-muted-foreground">
            {t('referralLinkDesc')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={referralLink} className="font-mono text-sm" />
        <Button type="button" className="shrink-0" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          {t('copyLink')}
        </Button>
      </div>
    </div>
  );
}

