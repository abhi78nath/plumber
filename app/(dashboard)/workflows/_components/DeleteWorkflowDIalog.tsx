"use client";

import { DeleteWorkflow } from '@/actions/workflows/deleteWorkflow';
import { AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import { toast } from 'sonner';

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    workflowName: string;
    workflowId: string;
}
const DeleteWorkflowDialog = ({ open, setOpen, workflowName, workflowId }: Props) => {
    const [confirmText, setConfirmText] = useState("");

    const deleteMutation = useMutation({
        mutationKey: ["delete-workflow"],
        mutationFn: async (id: string) => {
            console.log("CLIENT: Deleting workflow with ID:", id);
            return await DeleteWorkflow(id);
        },
        onSuccess: () => {
            toast.success("Workflow deleted successfully", { id: workflowId });
            setConfirmText("");
        },
        onError: (error) => {
            console.error("CLIENT: Delete Mutation error:", error);
            toast.error("Something went wrong", { id: workflowId })
        },
    })
    return (
        <AlertDialog open={open} onOpenChange={setOpen} >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDescription>
                        If you delete this workflow, you will not be able to recover it.
                        <div className='flex flex-col py-4 gap-2'>
                            <p>
                                If you are sure, enter <b>{workflowName}</b> to confirm
                            </p>
                            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
                        </div>
                    </AlertDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={confirmText !== workflowName || deleteMutation.isPending} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.loading("Deleting workflow...", { id: workflowId });
                            deleteMutation.mutate(workflowId);
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteWorkflowDialog