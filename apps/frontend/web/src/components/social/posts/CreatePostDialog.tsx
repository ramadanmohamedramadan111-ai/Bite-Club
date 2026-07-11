'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface PostData {
  restaurantId: string;
  caption: string;
  image?: string;
}

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (postData: PostData) => void;
}

const mockRestaurants = [
  {
    id: 'rest-1',
    name: 'The Rustic Grill',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
  },
  {
    id: 'rest-2',
    name: 'Omakase Room',
    image:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
  },
  {
    id: 'rest-3',
    name: 'Pizzeria Napoletana',
    image:
      'https://images.unsplash.com/photo-1595521624481-10ee8944813d?w=200&h=200&fit=crop',
  },
];

export function CreatePostDialog({ open, onOpenChange, onSubmit }: CreatePostDialogProps) {
  const [step, setStep] = useState<'select-order' | 'add-caption'>('select-order');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    setTimeout(() => {
      onSubmit({
        restaurantId: selectedRestaurant,
        caption,
        image: selectedImage,
      });
      // Reset form
      setStep('select-order');
      setSelectedRestaurant('');
      setCaption('');
      setSelectedImage('');
      setIsLoading(false);
      onOpenChange(false);
    }, 500);
  };

  const selectedRestaurantData = mockRestaurants.find((r) => r.id === selectedRestaurant);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'select-order' ? 'Select a Past Order' : 'Create Post'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select-order' ? (
          <div className="space-y-3">
            <Label>Choose a restaurant from your past orders</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockRestaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedRestaurant === restaurant.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => setSelectedRestaurant(restaurant.id)}
                >
                  <div className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                      <Image
                        src={restaurant.image}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{restaurant.name}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep('add-caption')}
                disabled={!selectedRestaurant}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected restaurant preview */}
            <Card className="p-3 flex gap-3 items-center">
              <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                <Image
                  src={selectedRestaurantData?.image || ''}
                  alt={selectedRestaurantData?.name || ''}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{selectedRestaurantData?.name}</p>
              </div>
            </Card>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">Add a caption</Label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share your thoughts about this meal..."
                className="w-full h-24 px-3 py-2 border rounded-md bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {caption.length}/500 characters
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('select-order')}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleComplete}
                disabled={!caption.trim() || isLoading}
              >
                {isLoading ? 'Posting...' : 'Share Post'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
