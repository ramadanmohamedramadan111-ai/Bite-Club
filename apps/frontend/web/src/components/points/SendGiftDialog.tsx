'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RewardOffer } from '@/types/points/points';
import { usePointsStore } from '@/lib/const-data';
import { useSocialStore } from '@/stores/social';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: RewardOffer;
};

export default function SendGiftDialog({ open, onOpenChange, offer }: Props) {
  const profile = useSocialStore((state) => state.profile);
  const users = useSocialStore((state) => state.users);
  const sendGift = usePointsStore((state) => state.sendGift);

  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  function resetForm() {
    setUsername('');
    setMessage('');
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  function handleSend() {
    const normalizedUsername = username.trim().replace(/^@/, '');

    if (!normalizedUsername) {
      toast.error('Username is required');
      return;
    }

    const recipient = users.find(
      (user) => user.username.toLowerCase() === normalizedUsername.toLowerCase(),
    );

    if (!recipient) {
      toast.error('User not found');
      return;
    }

    if (recipient.id === profile.id) {
      toast.error('You cannot send a gift to yourself');
      return;
    }

    const result = sendGift({
      offerId: offer.id,
      toUsername: recipient.username,
      toName: recipient.name,
      toUserId: recipient.id,
      fromUserId: profile.id,
      fromUsername: profile.username,
      fromName: profile.name,
      message: message.trim() || undefined,
    });

    if (!result.success) {
      toast.error(result.error ?? 'Failed to send gift');
      return;
    }

    toast.success(`Gift sent to @${recipient.username}!`);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a gift</DialogTitle>
          <DialogDescription>
            Send &quot;{offer.title}&quot; ({offer.pointsCost.toLocaleString()}{' '}
            points) to a friend.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gift-username">Username</Label>
            <Input
              id="gift-username"
              placeholder="@username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gift-message">Message (optional)</Label>
            <Input
              id="gift-message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>Send gift</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
