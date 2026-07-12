'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useSocialStore } from '@/stores/social';

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profile = useSocialStore((state) => state.profile);
  const updateProfile = useSocialStore((state) => state.updateProfile);

  const [formData, setFormData] = useState({
    name: profile.name,
    username: profile.username,
    email: profile.email,
    bio: profile.bio,
    phone: profile.phone,
    avatar: profile.avatar ?? '',
    privateProfile: profile.privateProfile,
    showInSearch: profile.showInSearch,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setTimeout(() => {
      updateProfile({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        phone: formData.phone,
        avatar: formData.avatar || null,
        privateProfile: formData.privateProfile,
        showInSearch: formData.showInSearch,
      });
      setIsLoading(false);
      router.push('/profile');
    }, 400);
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Update your personal information
          </p>
        </div>
      </div>

      <Card className="mx-auto max-w-lg space-y-6 p-6">
        <div className="space-y-3">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.avatar} />
              <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="email@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself"
            className="h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {formData.bio.length}/160 characters
          </p>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="private-profile">Private Profile</Label>
              <p className="text-xs text-muted-foreground">
                Only friends can see your posts and profile details
              </p>
            </div>
            <Switch
              id="private-profile"
              checked={formData.privateProfile}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, privateProfile: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="show-in-search">Show in Search</Label>
              <p className="text-xs text-muted-foreground">
                Allow others to find you in user search
              </p>
            </div>
            <Switch
              id="show-in-search"
              checked={formData.showInSearch}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, showInSearch: checked }))
              }
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/profile" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
