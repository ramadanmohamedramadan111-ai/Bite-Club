'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/_cart';
import { useGroupSessionsStore } from '@/stores/group-sessions';
import { useGroupsStore } from '@/stores/groups';
import { useSessionStore } from '@/stores/session';
import {
  createMockGroupMember,
  createMockGroupOrderItems,
} from '@/data/mock-group-order-items';
import type { GroupOrderSessionType } from '@/types/groups/groups';
import type { RestaurantType } from '@/types/restaurant/restaurant';
import { generateGroupOrderCode } from '@/utils/group-order';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: RestaurantType;
};

export default function CreateGroupOrderDialog({
  open,
  onOpenChange,
  restaurant,
}: Props) {
  const router = useRouter();
  const groups = useGroupsStore((state) => state.groups);
  const createGroupCart = useCartStore((state) => state.createGroupCart);
  const addMember = useCartStore((state) => state.addMember);
  const addItem = useCartStore((state) => state.addItem);
  const addSession = useGroupSessionsStore((state) => state.addSession);
  const sessionId = useSessionStore((state) => state.sessionId);
  const guestName = useSessionStore((state) => state.name);

  const [sessionType, setSessionType] =
    useState<GroupOrderSessionType>('anonymous');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  function handleCreate() {
    if (sessionType === 'fixed' && !selectedGroupId) {
      toast.error('Please select a group');
      return;
    }

    const selectedGroup = groups.find((group) => group.id === selectedGroupId);
    const orderSessionId = crypto.randomUUID();
    const code = generateGroupOrderCode();
    const ownerMemberId = crypto.randomUUID();
    const displayName = guestName ?? 'Guest';
    const hostSessionId = sessionId ?? crypto.randomUUID();

    createGroupCart({
      restaurantId: String(restaurant.id),
      restaurantName: restaurant.name,
      restaurantImage: restaurant.logo_url,
      groupCart: {
        id: orderSessionId,
        type: sessionType === 'anonymous' ? 'temporary' : 'fixed',
        code,
        groupId: sessionType === 'fixed' ? selectedGroupId : undefined,
        expiresAt:
          sessionType === 'anonymous'
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : undefined,
      },
      sessionId: hostSessionId,
      owner: {
        id: ownerMemberId,
        sessionId: hostSessionId,
        name: displayName,
        isOwner: true,
      },
    });

    addSession({
      id: orderSessionId,
      restaurantId: String(restaurant.id),
      restaurantName: restaurant.name,
      restaurantImage: restaurant.logo_url,
      code,
      type: sessionType,
      groupId: sessionType === 'fixed' ? selectedGroupId : undefined,
      groupName: selectedGroup?.name,
      ownerSessionId: hostSessionId,
      ownerName: displayName,
      expiresAt:
        sessionType === 'anonymous'
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      createdAt: new Date().toISOString(),
    });

    addMember(createMockGroupMember());
    for (const mockItem of createMockGroupOrderItems()) {
      addItem(mockItem);
    }

    toast.success('Group order created');
    onOpenChange(false);
    router.push(`/group-order/${orderSessionId}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Create group order
          </DialogTitle>
          <DialogDescription>
            Start a group order at {restaurant.name}. Invite others to add items
            to the same cart.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <Label>Session type</Label>
            <RadioGroup
              value={sessionType}
              onValueChange={(value) =>
                setSessionType(value as GroupOrderSessionType)
              }>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <RadioGroupItem value="anonymous" id="anonymous" />
                <div className="space-y-1">
                  <Label htmlFor="anonymous" className="font-medium">
                    Anonymous
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Share a code with anyone. No group required.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <RadioGroupItem value="fixed" id="fixed" />
                <div className="space-y-1">
                  <Label htmlFor="fixed" className="font-medium">
                    Fixed group
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Order with members from one of your groups.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {sessionType === 'fixed' && (
            <div className="space-y-2">
              <Label htmlFor="group-select">Select group</Label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}>
                <SelectTrigger id="group-select">
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create group order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

