"use client";

import TooltipWrapper from '@/components/TooltipWrapper';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { WorkflowExecutionStatus, WorkflowStatus } from '@/types/workflow';

import { Workflow } from '@prisma/client';
import { ChevronRightIcon, ClockIcon, CoinsIcon, CornerDownRightIcon, FileTextIcon, MoreVerticalIcon, MoveRightIcon, PlayIcon, ShuffleIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'

import RunButton from './RunButton';
import SchedulerDialog from './SchedulerDialog';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { ExecutionStatusIndicator, ExecutionStatusLabel } from '@/app/workflow/runs/[workflowId]/_components/ExecutionStatusIndicator';

import { formatInTimeZone } from "date-fns-tz"
import DuplicateWorkflowDialog from './DuplicateWorkflowDialog';
import DeleteWorkflowDialog from './DeleteWorkflowDialogg';

const statusColors = {
    [WorkflowStatus.DRAFT]: "text-white bg-yellow-600",
    [WorkflowStatus.PUBLISHED]: "bg-primary-foreground",

}

function StatusBadge({ status }: { status: WorkflowExecutionStatus }) {
    return (
        <Badge variant="secondary" className='text-xs flex items-center gap-1.5'>
            <ExecutionStatusIndicator status={status} />
            <ExecutionStatusLabel status={status} />
        </Badge>
    );
}
function WorkflowCard({ workflow }: { workflow: Workflow }) {
    const isDraft = workflow.status === WorkflowStatus.DRAFT;

    return (
        <Card className='border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30 group/card flex flex-col min-h-[280px]'>
            <CardContent className='p-4 flex flex-col flex-1 gap-4'>
                {/* Header Section - Workflow Name and Status */}
                <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                        <TooltipWrapper content={workflow.description}>
                            <Link href={`/workflow/editor/${workflow.id}`} className='hover:underline'>
                                <h3 className='text-lg font-bold text-foreground truncate'>{workflow.name}</h3>
                            </Link>
                        </TooltipWrapper>
                    </div>
                    <div className='flex items-center gap-2 flex-shrink-0'>
                        {isDraft && (
                            <Badge variant="secondary" className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
                                DRAFT
                            </Badge>
                        )}
                        {!isDraft && workflow.lastRunStatus && (
                            <StatusBadge status={workflow.lastRunStatus as WorkflowExecutionStatus} />
                        )}
                    </div>
                </div>

                {/* Status Indicator */}
                <div className='flex items-center gap-3'>
                    {/* <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        statusColors[workflow.status as WorkflowStatus]
                    )}>
                        {isDraft ? (
                            <FileTextIcon className='h-5 w-5' />
                        ) : (
                            <PlayIcon className='h-5 w-5 text-primary' />
                        )}
                    </div> */}
                    <div className='flex-1 min-w-0'>
                        <ScheduleSection
                            isDraft={isDraft}
                            workflowId={workflow.id}
                            creditsCost={workflow.creditCost}
                            cron={workflow.cron}
                        />
                    </div>
                </div>

                {/* Last Run Info */}
                <LastRunDetailsInline workflow={workflow} />

                {/* Spacer to push buttons to bottom */}
                <div className='flex-1' />

                {/* Action Buttons at Bottom */}
                <div className='flex items-center gap-2 pt-2 border-t'>
                    <div className='flex items-center gap-2'>
                        {!isDraft && <RunButton workflowId={workflow.id} />}
                        <Link href={`/workflow/editor/${workflow?.id}`} className={cn(buttonVariants({
                            variant: "outline",
                            size: "default"
                        }), "flex items-center gap-2 justify-center")}>
                            <ShuffleIcon size={16} />Edit
                        </Link>
                    </div>
                    <div className='flex-1' />
                    <WorkflowActions workflowName={workflow?.name} workflowId={workflow?.id} />
                </div>
            </CardContent>
        </Card>
    )
}

const WorkflowActions = ({ workflowName, workflowId }: { workflowName: string, workflowId: string }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    return (
        <>
            <DeleteWorkflowDialog
                open={showDeleteDialog}
                setOpen={setShowDeleteDialog}
                workflowName={workflowName}
                workflowId={workflowId}
            />
            <DropdownMenu>
                <TooltipWrapper content="More actions">
                    <DropdownMenuTrigger asChild>
                        <Button variant={"outline"} size={"sm"}>
                            <div className='flex items-center justify-center w-full h-full'>
                                <MoreVerticalIcon size={18} />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipWrapper>
                <DropdownMenuContent align='end'>
                    {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                    <DropdownMenuSeparator />
                    <DuplicateWorkflowDialog workflowId={workflowId} triggerInDropdown />
                    <DropdownMenuItem
                        className='text-destructive flex items-center gap-2 cursor-pointer text-base'
                        onSelect={() => {
                            setShowDeleteDialog((prev) => !prev);
                        }}
                    >
                        <TrashIcon size={16} />Delete</DropdownMenuItem>
                </DropdownMenuContent>

            </DropdownMenu>
        </>
    )
}


function ScheduleSection({
    isDraft,
    creditsCost,
    workflowId,
    cron,
}: {
    isDraft: boolean;
    creditsCost: number;
    workflowId: string;
    cron: string | null;
}) {
    if (isDraft) return null;

    return (
        <div className="flex items-center gap-2">
            <CornerDownRightIcon className="h-4 w-4 text-muted-foreground" />
            <SchedulerDialog workflowId={workflowId} cron={cron} key={`${cron}-${workflowId}`} />
            {/* <MoveRightIcon className="h-4 w-4 text-muted-foreground" />
            <TooltipWrapper content="Credit consumption for full run">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="space-x-2 text-muted-foreground rounded-sm">
                        <CoinsIcon className="h-4 w-4" />
                        <span className="text-sm">{creditsCost}</span>
                    </Badge>
                </div>
            </TooltipWrapper> */}
        </div>
    );
};


function LastRunDetailsInline({ workflow }: { workflow: Workflow }) {
    const isDraft = workflow.status === WorkflowStatus.DRAFT;
    if (isDraft) {
        return null;
    }

    const { lastRunAt, lastRunStatus, lastRunId, nextRunAt } = workflow;
    const formattedStartedAt = lastRunAt && formatDistanceToNow(lastRunAt, { addSuffix: true });
    const nextSchedule = nextRunAt && format(nextRunAt, 'yyyy-MM-dd HH:mm');

    return (
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between gap-2">
                <span className="font-medium">Last run:</span>
                {lastRunAt ? (
                    <Link href={`/workflow/runs/${workflow.id}/${lastRunId}`} className="flex items-center gap-1 hover:text-foreground transition">
                        {/* <ExecutionStatusIndicator status={lastRunStatus as WorkflowExecutionStatus} /> */}
                        {/* <ExecutionStatusLabel status={lastRunStatus as WorkflowExecutionStatus} /> */}
                        <span className="text-xs">{formattedStartedAt}</span>
                    </Link>
                ) : (
                    <span>No runs yet</span>
                )}
            </div>
            {nextRunAt && (
                <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">Next run:</span>
                    <div className="flex items-center gap-1">
                        <ClockIcon size={12} />
                        <span>{nextSchedule}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function LastRunDetails({ workflow }: { workflow: Workflow }) {
    const isDraft = workflow.status === WorkflowStatus.DRAFT;
    if (isDraft) {
        return null;
    }

    const { lastRunAt, lastRunStatus, lastRunId, nextRunAt } = workflow;
    const formattedStartedAt = lastRunAt && formatDistanceToNow(lastRunAt, { addSuffix: true });

    const nextSchedule = nextRunAt && format(nextRunAt, 'yyyy-MM-dd HH:mm');
    const nextScheduleUTC = nextRunAt && formatInTimeZone(nextRunAt, 'UTC', 'HH:mm');

    return (
        <div className="bg-primary/5 px-4 py-1 flex justify-between items-center text-muted-foreground">
            <div className="flex items-center text-sm gap-2">
                {lastRunAt && (
                    <Link href={`/workflow/runs/${workflow.id}/${lastRunId}`} className="flex items-center text-sm gap-2 group">
                        <span>Last run:</span>
                        <ExecutionStatusIndicator status={lastRunStatus as WorkflowExecutionStatus} />
                        <ExecutionStatusLabel status={lastRunStatus as WorkflowExecutionStatus} />
                        <span>{formattedStartedAt}</span>
                        <ChevronRightIcon size={14} className="-translate-x-[2px] group-hover:translate-x-0 transition" />
                    </Link>
                )}
                {!lastRunAt && <p>No runs yet</p>}
            </div>
            {nextRunAt && (
                <div className="flex items-center text-sm gap-2">
                    <ClockIcon size={12} />
                    <span>Next run at:</span>
                    <span>{nextSchedule}</span>
                    <span className="text-xs">({nextScheduleUTC} UTC)</span>
                </div>
            )}
        </div>
    );
}
export default WorkflowCard;
