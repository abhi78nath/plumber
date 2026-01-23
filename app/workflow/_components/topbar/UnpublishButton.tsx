'use client';

import { DownloadIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { UnpublishWorkflow } from '@/actions/workflows/unpublishWorkflow';



export default function UnpublishBtn({ workflowId }: { workflowId: string }) {
  const mutation = useMutation({
    mutationKey: ["unpublish-workflow"],
    mutationFn: async (id: string) => {
      return await UnpublishWorkflow(id);
    },
    onSuccess: () => {
      toast.success('Workflow unpublished', { id: workflowId });
    },
    onError: (error) => {
      console.error("CLIENT: Unpublish Mutation error:", error);
      toast.error('Something went wrong!', { id: workflowId });
    },
  });

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      disabled={mutation.isPending}
      onClick={() => {
        toast.loading('Unpublishing workflow...', { id: workflowId });
        mutation.mutate(workflowId);
      }}
    >
      <DownloadIcon size={16} className="stroke-orange-500" />
      Unpublish
    </Button>
  );
}