'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from '@/i18n/navigation';
import { clientFetch } from '@/utils/client-fetch';
import type { GroupOrderSessionType } from '@/types/groups/groups';
import type { GroupTypeSimplified } from '@/types/groups/groups';
import type { RestaurantType } from '@/types/restaurant/restaurant';
import type { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import DialogPagination from '@/components/shared/DialogPagination';
import { createGroupOrderSessionAction } from '@/actions/group-order';
import { useAction } from 'next-safe-action/hooks';

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

  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const [sessionType, setSessionType] =
    useState<GroupOrderSessionType>('anonymous');
  const [selectedGroupId, setSelectedGroupId] = useState<number>();

  // Search & pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isFetching } = useQuery({
    queryKey: ['groups-select', debouncedSearch, page],
    enabled: open && sessionType === 'fixed',
    queryFn: () =>
      clientFetch<ApiResponse<PaginatedResponse<GroupTypeSimplified>>>(
        `/api/groups?search=${debouncedSearch}&page=${page}&per_page=10`,
      ),
  });

  const groups = data?.data?.items ?? [];
  const meta = data?.data?.meta;

  function resetState() {
    setSearch('');
    setPage(1);
    setSelectedGroupId(undefined);
  }

  const { execute, isExecuting } = useAction(createGroupOrderSessionAction, {
    onSuccess: ({ data }) => {
      console.log('Group order session created:', data);
      toast.success(t('groupOrderCreated'));
      onOpenChange(false);
      router.push(`/group-order/${data.data.group_order_id}`);
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message);
    },
  });

  function handleCreate() {
    if (sessionType === 'fixed' && !selectedGroupId) {
      toast.error(t('noGroupToSelect'));
      return;
    }

    if (sessionType === 'fixed' && selectedGroupId) {
      execute({
        group_id: selectedGroupId,
        restaurant_id: restaurant.id,
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetState();
        }
        onOpenChange(isOpen);
      }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            {t('groupOrder')}
          </DialogTitle>
          <DialogDescription>
            Start a group order at {restaurant.name}. Invite others to add items
            to the same cart.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <Label>{t('sessionType')}</Label>
            <RadioGroup
              value={sessionType}
              onValueChange={(value) => {
                const newType = value as GroupOrderSessionType;
                setSessionType(newType);
                if (newType === 'anonymous') {
                  resetState();
                }
              }}>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <RadioGroupItem value="anonymous" id="anonymous" />
                <div className="space-y-1">
                  <Label htmlFor="anonymous" className="font-medium">
                    {t('anonymous')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('anonymousDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <RadioGroupItem value="fixed" id="fixed" />
                <div className="space-y-1">
                  <Label htmlFor="fixed" className="font-medium">
                    {t('fixedGroup')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('fixedGroupDesc')}
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {sessionType === 'fixed' && (
            <div className="space-y-2">
              <Label htmlFor="group-search">{t('selectGroup')}</Label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="group-search"
                  placeholder={t('searchGroups')}
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                    setSelectedGroupId(undefined);
                  }}
                />
              </div>

              {isFetching ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : groups.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">
                  {t('noGroupsFound')}
                </p>
              ) : (
                <ScrollArea className="max-h-48">
                  <div className="space-y-1">
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                          selectedGroupId === group.id
                            ? 'border-primary bg-primary/5'
                            : ''
                        }`}
                        onClick={() => setSelectedGroupId(group.id)}>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {group.members_count} members
                        </p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {meta && (
                <DialogPagination
                  currentPage={meta.current_page}
                  totalPages={meta.last_page}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc('cancel')}
          </Button>
          <Button
            disabled={
              isExecuting || (sessionType === 'fixed' && !selectedGroupId)
            }
            onClick={handleCreate}>
            {t('groupOrder')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

