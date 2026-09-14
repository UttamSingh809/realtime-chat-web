/**
 * NewChatDialog — modal for creating a DM or group.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewDmTab } from './NewDmTab';
import { NewGroupTab } from './NewGroupTab';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewChatDialog({ open, onOpenChange }: Props) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Start a new conversation</DialogTitle>
          <DialogDescription>Message someone directly or create a group chat.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dm" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dm">Direct message</TabsTrigger>
            <TabsTrigger value="group">New group</TabsTrigger>
          </TabsList>

          <TabsContent value="dm" className="mt-4">
            <NewDmTab onDone={close} />
          </TabsContent>

          <TabsContent value="group" className="mt-4">
            <NewGroupTab onDone={close} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
