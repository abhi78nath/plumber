"use client";

import { DownloadInvoice } from '@/actions/billing/downloadInvoice';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

const InvoiceButton = ({ id }: { id: string }) => {
  const mutation = useMutation({
    mutationKey: ['download-invoice', id],
    mutationFn: async (id: string) => {
      return await DownloadInvoice(id);
    },
    onSuccess: (data) => (window.location.href = data as string),
    onError: (error) => {
      console.error("CLIENT: Download Invoice Mutation error:", error);
      toast.error('Something went wrong!');
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs gap-2 text-muted-foreground px-1"
      onClick={() => mutation.mutate(id)}
    >
      Invoice
      {mutation.isPending && <Loader2Icon className="h-4 w-4 animate-spin" />}
    </Button>
  );
}

export default InvoiceButton