'use client';

import { useRef, useState } from 'react';
import { Plus, Users } from 'lucide-react';
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
import { useGroupsStore } from '@/stores/groups';
import type { GroupMember } from '@/types/group/group';

export default function CreateGroupDialog() {
  const createGroup = useGroupsStore((state) => state.createGroup);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setName('');
    setDescription('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImagePreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    const owner: GroupMember = {
      id: crypto.randomUUID(),
      userId: '1',
      name: 'John Smith',
      username: 'johnsmith',
      avatar: null,
      isOwner: true,
    };

    createGroup({
      name,
      description,
      image: imagePreview,
      owner,
    });

    toast.success('Group created');
    resetForm();
    setOpen(false);
  }

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Create group
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            resetForm();
          }
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Create a group
            </DialogTitle>
            <DialogDescription>
              Create a new group to order together with friends.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-group-name">Group name</Label>
              <Input
                id="new-group-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Office Lunch Crew"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-group-description">Description</Label>
              <Input
                id="new-group-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Daily lunch orders from the team"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-group-image">Group image</Label>
              <Input
                id="new-group-image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Group preview"
                  className="mt-2 size-20 rounded-lg object-cover"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
