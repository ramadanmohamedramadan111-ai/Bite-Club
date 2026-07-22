'use client';

import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { GroupType } from '@/types/groups/groups';
import { UserPlus } from 'lucide-react';

export default function AddMemberDialog({ group }: { group: GroupType }) {
  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        className="gap-2"
        onClick={() => setAddDialogOpen(true)}>
        <UserPlus className="size-4" />
        {t('addMember')}
      </Button>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addMember')}</DialogTitle>
            <DialogDescription>{t('addMemberDesc', { name: group.name })}</DialogDescription>
          </DialogHeader>

          {/* <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableFriends.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No friends available to add
              </p>
            ) : (
              availableFriends.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                  onClick={() => handleAddMember(user)}>
                  <Avatar>
                    <AvatarImage src={user.avatar ?? undefined} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div> */}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              {tc('cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

