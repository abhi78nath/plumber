"use client";

import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    onConfirm: () => void;
}

const GSheetWarningDialog = ({ open, setOpen, onConfirm }: Props) => {
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Google Sheets Permission Required</AlertDialogTitle>
                    <AlertDialogDescription>
                        This workflow contains a <b>Write to Google Sheet</b> task.
                        Before proceeding, please ensure you have shared your target Google Sheet with the following service account email:
                        <br /><br />
                        <code className="bg-muted p-1 rounded font-mono text-sm block break-all">
                            service-account-data-extractor@data-extractor-477019.iam.gserviceaccount.com
                        </code>
                        <br />
                        Give it <b>Editor</b> access so the workflow can append data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpen(false)}>No, let me check</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            setOpen(false);
                            onConfirm();
                        }}
                    >
                        Yes, I've shared it
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default GSheetWarningDialog;
