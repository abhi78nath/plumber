"use client";

import { UpdateWorkflow } from '@/actions/workflows/updateWorkflow';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useReactFlow } from '@xyflow/react';
import { CheckIcon } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

const SaveButton = ({ workflowId }: { workflowId: string }) => {
    const { toObject } = useReactFlow();

    const saveMutation = useMutation({
        mutationKey: ["save-workflow"],
        mutationFn: async ({ id, definition }: { id: string, definition: string }) => {
            return await UpdateWorkflow({ id, definition });
        },
        onSuccess: () => {
            toast.success("Flow saved successfully", { id: "save-workflow" });
        },
        onError: () => {
            toast.error("Something went wrong", { id: "save-workflow" });
        }
    })
    return (
        <Button
            variant={"outline"}
            disabled={saveMutation.isPending}
            className='flex items-center gap-2'
            onClick={() => {
                const workflowDefinition = JSON.stringify(toObject());
                toast.loading("Saving workflow...", { id: "save-workflow" });
                saveMutation.mutate({
                    id: workflowId,
                    definition: workflowDefinition
                })
            }}
        >
            <CheckIcon size={16} className='stroke-green-400' />
            Save
        </Button>
    )
}

export default SaveButton