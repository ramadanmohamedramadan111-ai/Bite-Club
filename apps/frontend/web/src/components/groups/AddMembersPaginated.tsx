'use client';

import { addGroupMemberAction } from '@/actions/groups';
import { clientFetch } from '@/utils/client-fetch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { GroupMember } from '@/types/groups/groups';
import { Checkbox } from '../ui/checkbox';
import DialogPagination from '../shared/DialogPagination';
import { UserPlus } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Spinner } from '../ui/spinner';

type Props = {
  groupId: number;
};

export default function AddMembersPaginatedDialog({ groupId }: Props) {
  // Dialog
  const [open, setOpen] = useState(false);

  // Search
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  // Pagination
  const [page, setPage] = useState(1);

  // Selected users
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Fetch users
  const { data, isPending } = useQuery({
    queryKey: ['group-users', debouncedSearch, page],
    enabled: open,
    queryFn: () =>
      clientFetch<ApiResponse<PaginatedResponse<GroupMember>>>(
        `/api/groups/${groupId}/invitable-friends?search=${debouncedSearch}&page=${page}&per_page=1`,
      ),
  });

  const users = data?.data.items;
  const meta = data?.data.meta;

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAddMembers = async () => {
    await execute({ group_id: groupId, user_id: selectedUserIds[0] });
  };

  const queryClient = useQueryClient();

  const { execute, isExecuting } = useAction(addGroupMemberAction, {
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ['group-users'],
      });
      toast.success(data.message);
      resetDialog();
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message);
    },
  });

  const resetDialog = () => {
    setSearch('');
    setPage(1);
    setSelectedUserIds([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          resetDialog();
        }
      }}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          Add members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>
            Search for users and select the ones you want to add.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between ">
            <span className="text-sm text-muted-foreground">
              {selectedUserIds.length} selected
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUserIds([])}
              disabled={selectedUserIds.length === 0}>
              Clear selection
            </Button>
          </div>

          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <ScrollArea className="h-96">
          {isPending ? (
            <Spinner />
          ) : users?.length === 0 ? (
            <p>No users found.</p>
          ) : (
            users?.map((user) => {
              const checked = selectedUserIds.includes(user.id);

              return (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profile_image ?? undefined} />
                      <AvatarFallback>
                        {user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleUser(user.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );
            })
          )}
        </ScrollArea>

        <DialogPagination
          currentPage={meta?.current_page ?? 1}
          totalPages={meta?.last_page ?? 1}
          onPageChange={setPage}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetDialog();
              setOpen(false);
            }}
            disabled={isExecuting}>
            Cancel
          </Button>
          <Button
            onClick={handleAddMembers}
            disabled={selectedUserIds.length === 0 || isExecuting}>
            Add {selectedUserIds.length || ''} Member
            {selectedUserIds.length === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

