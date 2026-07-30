'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  SendHorizontal, 
  Sparkles, 
  Check, 
  Plus, 
  UtensilsCrossed,
  RotateCcw
} from 'lucide-react';
import { getCookie } from 'cookies-next';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useAction } from 'next-safe-action/hooks';
import { smartWaiterSendChatAction, smartWaiterAddToCartAction } from '@/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const hiddenRoutes = [
  /^\/group-order\/[^/]+$/,
  /^\/group-order\/[^/]+\/checkout$/,
  /^\/cart$/,
  /^\/checkout$/,
];

interface SuggestionItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  why: string;
}

interface Suggestion {
  restaurant_id: number;
  restaurant_name: string;
  items: SuggestionItem[];
  total_price: number;
  status: 'pending' | 'accepted' | 'declined';
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestion?: Suggestion;
}

export default function AIChat() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const direction = getLangDir(locale);
  const isRtl = direction === 'rtl';

  const route = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  const shouldHide = hiddenRoutes.some((pattern) => pattern.test(route));

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addItem = useCartStore((state) => state.addItem);

  const { execute: sendChat, isExecuting: isSending } = useAction(smartWaiterSendChatAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        const result = data.data; // SmartWaiterResponse
        
        // Save the conversation ID returned from the server
        if (result.conversation_id) {
          setConversationId(result.conversation_id);
        }

        const rawItems = (result.items || []) as any[];
        const mappedItems: SuggestionItem[] = rawItems.map((item) => ({
          id: Number(item.id),
          name: String(item.name || ''),
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          why: String(item.why || ''),
        }));

        const hasItems = mappedItems.length > 0;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: result.reply,
            suggestion: hasItems
              ? {
                  restaurant_id: Number(result.recommended_restaurant_id || 0),
                  restaurant_name: String(result.restaurant_name || ''),
                  items: mappedItems,
                  total_price: Number(result.total_price || 0),
                  status: 'pending',
                }
              : undefined,
          },
        ]);
      } else {
        toast.error(data?.message || 'Failed to get a response');
      }
    },
    onError: ({ error }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text:
            locale === 'ar'
              ? 'عذراً، أواجه مشكلة في الاتصال بالخادم حالياً.'
              : 'Sorry, I am having trouble connecting to the server right now.',
        },
      ]);
    },
  });

  const { execute: addToCartAction } = useAction(smartWaiterAddToCartAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || 'Added to cart successfully!');
        router.refresh();
      } else {
        toast.error(data?.message || 'Failed to update cart');
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message || 'Failed to add to cart');
    },
  });

  // Auto-scroll messages list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Listen for open-ai-chat custom event to open the panel programmatically
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpen);
    return () => window.removeEventListener('open-ai-chat', handleOpen);
  }, []);

  // Set default greetings on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text:
            locale === 'ar'
              ? 'مرحباً! أنا مساعدك الذكي لتوصيل الطعام. هل ترغب في اقتراح لبعض الأطباق الشهية اليوم؟'
              : 'Hi there! I am your AI Food Assistant. Would you like me to recommend some delicious meals for you today?',
        },
      ]);
    }
  }, [locale, messages.length]);

  if (shouldHide) {
    return null;
  }

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // 1. Declare any previous 'pending' suggestions as 'declined'
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.suggestion && msg.suggestion.status === 'pending') {
          return {
            ...msg,
            suggestion: {
              ...msg.suggestion,
              status: 'declined',
            },
          };
        }
        return msg;
      })
    );

    // 2. Add the user message
    const userMessageId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        sender: 'user',
        text,
      },
    ]);

    setInputValue('');

    // 3. Get latitude and longitude from location cookies or default
    const latVal = getCookie('lat');
    const lngVal = getCookie('lng');
    const latitude = latVal ? Number(latVal) : 30.0444;
    const longitude = lngVal ? Number(lngVal) : 31.2357;

    // 4. Trigger the server action with dynamic locale and location details
    sendChat({
      conversation_id: conversationId,
      message: text,
      locale: (locale === 'ar' || locale === 'en' ? locale : 'en') as 'ar' | 'en',
      latitude,
      longitude,
    });
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setInputValue('');
    toast.success(locale === 'ar' ? 'تم بدء محادثة جديدة' : 'Started a new conversation');
  };

  const handleAccept = (msgId: string, suggestion: Suggestion) => {
    // 1. Mark status as accepted
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.suggestion) {
          return {
            ...msg,
            suggestion: {
              ...msg.suggestion,
              status: 'accepted',
            },
          };
        }
        return msg;
      })
    );

    // 2. Add to cart
    if (isAuthenticated) {
      addToCartAction({
        restaurant_id: suggestion.restaurant_id,
        items: suggestion.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })) as [{ id: number; quantity: number }, ...{ id: number; quantity: number }[]],
      });
    } else {
      suggestion.items.forEach((item) => {
        addItem(
          {
            id: suggestion.restaurant_id,
            name: suggestion.restaurant_name,
          },
          {
            id: item.id,
            item_id: item.id,
            quantity: item.quantity,
            notes: item.why,
            item_name: item.name,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          }
        );
      });
      toast.success(
        locale === 'ar'
          ? 'تمت إضافة الأطباق المقترحة إلى السلة!'
          : 'Added recommended dishes to cart!'
      );
    }
  };

  const handleDecline = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.suggestion) {
          return {
            ...msg,
            suggestion: {
              ...msg.suggestion,
              status: 'declined',
            },
          };
        }
        return msg;
      })
    );
    toast.info(locale === 'ar' ? 'تم رفض الاقتراح' : 'Suggestion declined');
  };


  return (
    <div className={cn('fixed bottom-6 z-50 transition-all duration-300', isRtl ? 'left-6' : 'right-6')}>
      {/* 1. Launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center size-14 rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
          <Bot className="size-6 transition-transform duration-300 group-hover:rotate-12" />
          <span className="absolute -inset-1 rounded-full bg-primary/25 animate-ping opacity-60 pointer-events-none" />
        </button>
      )}

      {/* 2. Chat window */}
      {isOpen && (
        <Card className="w-[320px] sm:w-[380px] h-[520px] rounded-3xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 select-none">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-primary to-orange-500 text-white border-b border-border/10">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center size-9.5 rounded-full bg-white/10 text-white border border-white/20">
                <Bot className="size-5" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border border-white" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold leading-tight">
                  {locale === 'ar' ? 'المساعد الذكي' : 'Bite AI'}
                </h4>
                <p className="text-3xs text-white/80 font-medium">
                  {locale === 'ar' ? 'نشط الآن' : 'Always Online'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleNewChat}
                title={locale === 'ar' ? 'محادثة جديدة' : 'New Chat'}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div key={msg.id} className="space-y-3.5 animate-in fade-in duration-200">
                  <div className={cn('flex gap-2.5', isAi ? 'justify-start' : 'justify-end')}>
                    {isAi && (
                      <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                        <Sparkles className="size-3.5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-3.5 py-2.5 max-w-[82%] text-sm font-medium leading-relaxed shadow-3xs',
                        isAi
                          ? 'bg-muted/70 text-foreground border border-border/40 rounded-tl-3xs'
                          : 'bg-primary text-primary-foreground rounded-tr-3xs',
                      )}>
                      {msg.text}
                    </div>
                  </div>

                  {/* Suggestion Card */}
                  {msg.suggestion && (
                    <div className={cn('flex gap-2.5 pl-9.5')}>
                      <Card className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-3xs">
                        <CardContent className="p-3.5 space-y-3">
                          {/* Item Info */}
                          <div className="space-y-2.5">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                              {msg.suggestion.restaurant_name}
                            </span>
                            <div className="space-y-2">
                              {msg.suggestion.items.map((item) => (
                                <div key={item.id} className="flex gap-3 border-b border-border/10 pb-2 last:border-0 last:pb-0">
                                  <div className="size-9 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center shrink-0 text-muted-foreground">
                                    <UtensilsCrossed className="size-4" />
                                  </div>
                                  <div className="min-w-0 flex-1 text-left">
                                    <h5 className="font-bold text-xs text-foreground truncate">
                                      {item.name}
                                    </h5>
                                    <p className="text-3xs text-muted-foreground font-semibold">
                                      {item.quantity}x @ {item.price.toFixed(2)} EGP
                                    </p>
                                    <p className="text-4xs text-muted-foreground italic truncate mt-0.5">
                                      {item.why}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-border/10">
                            <span className="text-3xs font-bold text-muted-foreground uppercase">{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                            <span className="text-xs font-bold text-foreground">{msg.suggestion.total_price.toFixed(2)} EGP</span>
                          </div>

                          {/* Options / Action status */}
                          <div className="border-t border-border/40 pt-2.5">
                            {msg.suggestion.status === 'pending' ? (
                              <div className="flex gap-2 w-full">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDecline(msg.id)}
                                  className="flex-1 rounded-xl h-8 text-xs font-bold shadow-3xs cursor-pointer">
                                  {locale === 'ar' ? 'رفض' : 'Decline'}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAccept(msg.id, msg.suggestion!)}
                                  className="flex-1 rounded-xl h-8 text-xs font-bold shadow-3xs cursor-pointer bg-emerald-500 hover:bg-emerald-600 border border-emerald-600/10 text-white">
                                  <Plus className="size-3.5 mr-1" />
                                  {locale === 'ar' ? 'قبول' : 'Accept'}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5 py-1 text-xs font-bold">
                                {msg.suggestion.status === 'accepted' ? (
                                  <span className="text-emerald-500 flex items-center gap-1">
                                    <Check className="size-3.5" />
                                    {locale === 'ar' ? 'تمت الإضافة' : 'Added to Cart'}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {locale === 'ar' ? 'تم الرفض' : 'Declined'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-2.5 justify-start animate-in fade-in duration-200">
                <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                  <Sparkles className="size-3.5 animate-pulse" />
                </div>
                <div className="rounded-2xl px-3.5 py-3 bg-muted/70 text-foreground border border-border/40 rounded-tl-3xs flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-foreground/45 animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-1.5 rounded-full bg-foreground/45 animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-1.5 rounded-full bg-foreground/45 animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>


          {/* Chat input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 border-t border-border/60 flex items-center gap-2 bg-background">
            <Input
              type="text"
              placeholder={locale === 'ar' ? 'اكتب رسالة...' : 'Ask for suggestions...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="rounded-xl flex-1 text-xs border-border/80 h-9"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim()}
              className="size-9 shrink-0 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-3xs cursor-pointer">
              <SendHorizontal className="size-4" />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
