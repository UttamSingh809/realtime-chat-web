/**
 * ProfileSettings — name, bio, phone, status message.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth';
import { useUpdateProfile } from './useUpdateProfile';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  bio: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  statusMessage: z.string().max(100).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export function ProfileSettings() {
  const { user } = useAuth();
  const update = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      bio: user?.bio ?? '',
      phone: user?.phone ?? '',
      statusMessage: user?.statusMessage ?? '',
    },
  });

  if (!user) return null;

  const onSubmit = handleSubmit((values) => {
    update.mutate({
      name: values.name,
      bio: values.bio || '',
      phone: values.phone || null,
      statusMessage: values.statusMessage || '',
    });
  });

  const busy = isSubmitting || update.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">This is how others see you in the app.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={3}
            maxLength={200}
            placeholder="A short sentence about you"
            {...register('bio')}
          />
          <p className="text-xs text-muted-foreground">{user.bio?.length ?? 0}/200</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="statusMessage">Status message</Label>
          <Input
            id="statusMessage"
            maxLength={100}
            placeholder="What are you up to?"
            {...register('statusMessage')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
