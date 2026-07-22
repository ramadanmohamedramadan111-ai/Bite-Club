'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { joinGroupByLinkAction } from '@/actions/groups';
import { useRouter } from '@/i18n/navigation';

type Props = {
  token: string;
};

export default function JoinGroup({ token }: Props) {
  const router = useRouter();

  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const { execute, isExecuting } = useAction(joinGroupByLinkAction, {
    onSuccess: ({ data }) => {
      toast.success(data.message);
      router.push(`/groups/${data.data.id}`);
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message);
    },
  });

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={() => router.back()}
        disabled={isExecuting}>
        {tc('cancel')}
      </Button>

      <Button
        onClick={() => execute({ invite_token: token })}
        disabled={isExecuting}>
        {t('acceptInvitation')}
      </Button>
    </div>
  );
}

