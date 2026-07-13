'use client';

import { useRef, useState } from 'react';
import { Copy, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

import GroupImage from '@/components/groups/GroupImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useGroupsStore } from '@/stores/groups';
import type { Group } from '@/types/group/group';
import { getGroupInviteUrl } from '@/utils/group-order';

type Props = {
  group: Group;
};

export default function GroupSettingsTab({ group }: Props) {
  const updateGroup = useGroupsStore((state) => state.updateGroup);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [imagePreview, setImagePreview] = useState<string | null>(
    group.image ?? null,
  );
  const [invitationsOpen, setInvitationsOpen] = useState(group.invitationsOpen);

  const inviteUrl = getGroupInviteUrl(group.inviteToken);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      updateGroup(group.id, { image: result });
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImagePreview(null);
    updateGroup(group.id, { image: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleSave() {
    updateGroup(group.id, {
      name: name.trim(),
      description: description.trim(),
      invitationsOpen,
    });
    toast.success('Group settings saved');
  }

  function handleCopyInviteLink() {
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied');
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="group-name">Group name</Label>
          <Input
            id="group-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="group-description">Description</Label>
          <Input
            id="group-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="group-image">Group image</Label>
          <div className="flex items-center gap-4">
            <GroupImage
              src={imagePreview}
              alt={group.name}
              className="size-20 rounded-lg"
              fallbackClassName="size-20 rounded-lg"
            />
            <div className="space-y-2">
              <Input
                id="group-image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}>
                  Remove image
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <LinkIcon className="size-4 text-muted-foreground" />
          <Label>Invite link</Label>
        </div>
        <div className="flex gap-2">
          <Input readOnly value={inviteUrl} className="text-sm" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopyInviteLink}>
            <Copy className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium">Open invitations</p>
          <p className="text-sm text-muted-foreground">
            Allow new members to join via the invite link
          </p>
        </div>
        <Switch
          checked={invitationsOpen}
          onCheckedChange={setInvitationsOpen}
          aria-label="Toggle open invitations"
        />
      </div>

      <Button onClick={handleSave}>Save changes</Button>
    </div>
  );
}
