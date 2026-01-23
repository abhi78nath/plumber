"use client"

import TooltipWrapper from '@/components/TooltipWrapper';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'
import React from 'react'
import SaveButton from './SaveButton';
import ExecuteButton from './ExecuteButton';
import NavigationTabs from './NavigationTabs';
import PublishButton from './PublishButton';
import UnpublishBtn from './UnpublishButton';

interface Props {
    title: string;
    subTitle?: string;
    workflowId: string;
    hideButtons?: boolean;
    isPublished?: boolean;
}
const Topbar = ({ title, subTitle, workflowId, hideButtons = false, isPublished }: Props) => {
    const router = useRouter();
    return (
        <header className='flex p-2 border-b-2 border-separate justify-between w-full h-[60px] sticky top-0 bg-background z-10'>
            <div className='flex gap-1 flex-1'>
                <TooltipWrapper content="Back">
                    <Button variant={"ghost"} size={"icon"} onClick={() => router.back()}>
                        <ChevronLeft size={20} />
                    </Button>
                </TooltipWrapper>
                <div>
                    <p className='font-bold text-ellipsis truncate'>
                        {title}
                    </p>
                    {subTitle && (
                        <p className='text-xs text-muted-foreground truncate text-ellipsis'>
                            {subTitle}
                        </p>
                    )}
                </div>
            </div>
            <NavigationTabs workflowId={workflowId} />
            <div className='flex gap-1 flex-1 justify-end'>
                {!hideButtons && (
                    <>
                        <ExecuteButton workflowId={workflowId} />
                        {isPublished && <UnpublishBtn workflowId={workflowId} />}
                        {!isPublished && (
                            <>

                                <SaveButton workflowId={workflowId} />
                                <PublishButton workflowId={workflowId} />
                            </>
                        )}
                    </>
                )}
            </div>
        </header>
    )
}

export default Topbar