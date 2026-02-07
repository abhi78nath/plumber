'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlayIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RunWorkFlow } from '@/actions/workflows/runWorkflow';
import { useRouter } from 'next/navigation';



const RunButton = ({ workflowId }: { workflowId: string }) => {
    const router = useRouter();
    const mutation = useMutation({
        mutationKey: ["execute-workflow"],
        mutationFn: async (payload: { workflowId: string }) => {
            return await RunWorkFlow(payload);
        },
        onSuccess: (data) => {
            toast.success("Execution started", { id: "flow-execution" })
            router.push(`/workflow/runs/${workflowId}/${data.executionId}`);
        },
        onError: (error) => {
            console.error("CLIENT: Execute Mutation error:", error);
            toast.error("Something went wrong", { id: "flow-execution" });
        }
    })

    return (
        <Button
            variant="outline"
            size="default"
            className="flex items-center gap-2 justify-center"
            disabled={mutation.isPending}
            onClick={() => {
                toast.loading('Scheduling run...', { id: workflowId });
                mutation.mutate({ workflowId });
            }}
        >
            <PlayIcon size={16} />
            Run
        </Button>
    );
}

export default RunButton;