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
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <Button
        variant="outline"
        onClick={() => router.back()}
        disabled={isExecuting}
        className="w-full sm:flex-1 rounded-xl cursor-pointer order-2 sm:order-1">
        {tc('cancel')}
      </Button>

      <Button
        onClick={() => execute({ invite_token: token })}
        disabled={isExecuting}
        className="w-full sm:flex-1 bg-gradient-to-r from-primary to-orange-600 hover:opacity-95 text-white font-semibold rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all order-1 sm:order-2">
        {t('acceptInvitation')}
      </Button>
    </div>
  );
}

