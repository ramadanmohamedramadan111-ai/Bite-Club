'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import GroupForm from './GroupForm';

export default function CreateGroupDialog() {
  const [open, setOpen] = useState(false);

  const t = useTranslations('forms.createGroup');

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {t('trigger')}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {t('title')}
            </DialogTitle>

            <DialogDescription>{t('subtitle')}</DialogDescription>
          </DialogHeader>

          <GroupForm setOpen={setOpen} type="new" />
        </DialogContent>
      </Dialog>
    </>
  );
}

