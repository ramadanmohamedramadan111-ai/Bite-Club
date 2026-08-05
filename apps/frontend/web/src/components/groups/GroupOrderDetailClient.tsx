'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Receipt, Calendar, Store, Copy, Check, Info } from 'lucide-react';
import { cn, getMediaUrl } from '@/lib/utils';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GroupOrderCartSession } from '@/types/group-order';

type Props = {
  sessionCart: GroupOrderCartSession;
};

export default function GroupOrderDetailClient({ sessionCart }: Props) {
  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const { restaurant, host, members_summary, status, total_amount, created_at } = sessionCart;
  const totalItems = members_summary.reduce((sum, m) => sum + m.items.length, 0);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(t('linkCopied') || 'Group order link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusLabel = (orderStatus: string) => {
    switch (orderStatus) {
      case 'completed':
        return t('groupOrderCompleted') || 'Group Order Completed';
      case 'cancelled':
        return t('groupOrderCancelled') || 'Group Order Cancelled';
      case 'locked':
        return t('locked') || 'Locked';
      case 'open':
        return t('open') || 'Open';
      default:
        return orderStatus;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8 px-4">
      {/* Header Info Panel */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-accent/30 via-background to-background p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            {restaurant.image_url && (
              <div className="relative size-20 md:size-24 overflow-hidden rounded-2xl border border-border/30 shadow-md shrink-0 select-none bg-muted-foreground/5">
                <Image
                  src={getMediaUrl(restaurant.image_url)!}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {restaurant.name}
                </h1>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-xs',
                    status === 'completed' && 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                    status === 'cancelled' && 'bg-destructive/10 border border-destructive/20 text-destructive',
                    status === 'locked' && 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400',
                    status === 'open' && 'bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400'
                  )}
                >
                  {getStatusLabel(status)}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Store className="size-4 text-primary/75" />
                  <span className="font-medium text-foreground">{t('host')}:</span> {host.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary/75" />
                  <span className="font-medium text-foreground">Date:</span> {new Date(created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl h-9 px-4 border-border/60 hover:bg-accent/40 cursor-pointer font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center shrink-0"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="size-3 text-muted-foreground" />
                  <span>{t('copyLink')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Participants & Items list */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="size-5.5 text-primary" />
            <span>Order Carts by Member</span>
          </h2>

          {members_summary.length > 0 ? (
            <div className="space-y-5">
              {members_summary.map((member) => (
                <Card key={member.user.id} className="overflow-hidden border-border/40 bg-card hover:border-border/80 transition-colors shadow-xs">
                  <CardHeader className="bg-muted/30 border-b border-border/30 px-6 py-4 flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-full border border-border/20 shadow-xs shrink-0 select-none">
                        <AvatarImage src={getMediaUrl(member.user.profile_image)} className="object-cover" />
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                          {member.user.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-foreground flex items-center gap-2 flex-wrap">
                          {member.user.name}
                          {member.user.is_guest && (
                            <span className="rounded-full bg-accent/70 px-2 py-0.5 text-[9px] font-bold text-accent-foreground uppercase tracking-wider border border-border/20">
                              Guest
                            </span>
                          )}
                          {member.user.id === host.id && !member.user.is_guest && (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Host
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0 bg-muted/65 px-3 py-1 rounded-lg">
                      {member.user_total.toFixed(2)} EGP
                    </span>
                  </CardHeader>
                  <CardContent className="px-6 py-2 divide-y divide-border/25">
                    {member.items.map((cartItem) => (
                      <div key={cartItem.id} className="py-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm text-foreground">
                            {cartItem.item.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-sm">
                              Qty: {cartItem.quantity}
                            </span>
                            <span>•</span>
                            <span>Unit Price: {cartItem.unit_price.toFixed(2)} EGP</span>
                          </div>
                          {cartItem.notes && (
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border/10 mt-2">
                              <Info className="size-3.5 text-primary/70 mt-0.5 shrink-0" />
                              <p className="italic leading-normal">
                                <span className="font-medium text-foreground not-italic">{tc('note') || 'Note'}:</span> {cartItem.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-sm text-foreground shrink-0 mt-0.5">
                          {cartItem.total_price.toFixed(2)} EGP
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-border/50">
              <p className="text-muted-foreground text-sm">No items were added to this group order.</p>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="size-5.5 text-primary" />
            <span>Summary</span>
          </h2>

          <Card className="border-border/40 shadow-sm sticky top-6 bg-card">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-lg font-bold">Billing Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-bold uppercase text-primary tracking-wide text-xs">{status}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Participants</span>
                <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md">{members_summary.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Items Ordered</span>
                <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md">{totalItems}</span>
              </div>

              <div className="border-t border-border/30 pt-4 flex justify-between items-baseline">
                <span className="font-bold text-base text-foreground">Grand Total</span>
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  {total_amount.toFixed(2)} EGP
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
