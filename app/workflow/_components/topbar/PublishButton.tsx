'use client';

import { UploadIcon } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import useExecutionPlan from '@/components/hooks/useExecutionPlan';
import { PublishWorkflow } from '@/actions/workflows/publishWorkflow';



export default function PublishButton({ workflowId }: { workflowId: string }) {
  const generate = useExecutionPlan();
  const { toObject } = useReactFlow();

  const mutation = useMutation({
    mutationKey: ["publish-workflow"],
    mutationFn: async (payload: { id: string, flowDefinition: string }) => {
      return await PublishWorkflow(payload);
    },
    onSuccess: () => {
      toast.success('Workflow published', { id: workflowId });
    },
    onError: (error) => {
      console.error("CLIENT: Publish Mutation error:", error);
      toast.error('Something went wrong!', { id: workflowId });
    },
  });

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      disabled={mutation.isPending}
      onClick={() => {
        const plan = generate();
        if (!plan) {
          // Client side validation
          return;
        }

        toast.loading('Publishing workflow...', { id: workflowId });
        mutation.mutate({
          id: workflowId,
          flowDefinition: JSON.stringify(toObject()),
        });
      }}
    >
      <UploadIcon size={16} className="stroke-green-400" />
      Publish
    </Button>
  );
}