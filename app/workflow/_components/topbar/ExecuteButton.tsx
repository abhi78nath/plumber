"use client";

import { RunWorkFlow } from '@/actions/workflows/runWorkflow';
import useExecutionPlan from '@/components/hooks/useExecutionPlan';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useReactFlow } from '@xyflow/react';
import { PlayIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { TaskType } from '@/types/task';
import GSheetWarningDialog from './GSheetWarningDialog';

const ExecuteButton = ({ workflowId }: { workflowId: string }) => {
    const generate = useExecutionPlan();
    const { toObject } = useReactFlow();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const onExecute = () => {
        const plan = generate();
        if (!plan) {
            return;
        }

        mutation.mutate({
            workflowId: workflowId,
            flowDefinition: JSON.stringify(toObject()),
        })
    }

    const mutation = useMutation({
        mutationKey: ["execute-workflow"],
        mutationFn: async (payload: { workflowId: string, flowDefinition: string }) => {
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
        <>
            <GSheetWarningDialog
                open={open}
                setOpen={setOpen}
                onConfirm={onExecute}
            />
            <Button
                variant={"outline"}
                className='flex items-center gap-2'
                disabled={mutation.isPending}
                onClick={() => {
                    const plan = generate();
                    if (!plan) {
                        return;
                    }

                    const hasGSheetTask = plan.some(phase =>
                        phase.nodes.some(node => node.data.type === TaskType.WRITE_TO_GOOGLE_SHEET)
                    );

                    if (hasGSheetTask) {
                        setOpen(true);
                    } else {
                        onExecute();
                    }
                }}
            >
                <PlayIcon size={16} className='stroke-orange-400' />
                ExecuteButton
            </Button>
        </>
    )
}

export default ExecuteButton