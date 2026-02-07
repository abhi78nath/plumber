"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskRegistry } from '@/lib/workflow/task/registry';
import { TaskType } from '@/types/task';
import { CoinsIcon } from 'lucide-react';
import React from 'react'

const TaskMenu = () => {
    return (
        <aside className='w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate h-full p-2 px-4 overflow-auto'>
            <Accordion type='multiple' className='w-full'
                defaultValue={
                    ["extraction", "interactions", "timing", "result-delivery", "storage"]
                }>
                <AccordionItem value='interactions'>
                    <AccordionTrigger className='font-bold'>
                        User Interactions
                    </AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-1'>
                        <TaskMenuButton taskType={TaskType.NAVIGATE_URL} />
                        <TaskMenuButton taskType={TaskType.FILL_INPUT} />
                        <TaskMenuButton taskType={TaskType.CLICK_ELEMENT} />
                        <TaskMenuButton taskType={TaskType.SCROLL_TO_ELEMENT} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='extraction'>
                    <AccordionTrigger className='font-bold'>
                        Data Extraction
                    </AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-1'>
                        <TaskMenuButton taskType={TaskType.PAGE_TO_HTML} />
                        <TaskMenuButton taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT} />
                        <TaskMenuButton taskType={TaskType.EXTRACT_DATA_WITH_AI} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='storage'>
                    <AccordionTrigger className='font-bold'>
                        Data Storage
                    </AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-1'>
                        <TaskMenuButton taskType={TaskType.READ_PROPERTY_FROM_JSON} />
                        <TaskMenuButton taskType={TaskType.ADD_PROPERTY_TO_JSON} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='timing'>
                    <AccordionTrigger className='font-bold'>
                        Timing controls
                    </AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-1'>
                        <TaskMenuButton taskType={TaskType.WAIT_FOR_ELEMENT} />
                        {/* can add another task called DELAY to slow things and watch behaiviour of webpage */}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='result-delivery'>
                    <AccordionTrigger className='font-bold'>
                        Result Delivery
                    </AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-1'>
                        <TaskMenuButton taskType={TaskType.DELIVER_VIA_WEBHOOK} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </aside>
    )
}

const TaskMenuButton = ({ taskType }: { taskType: TaskType }) => {
    const task = TaskRegistry[taskType];

    const onDragStart = (event: React.DragEvent, type: TaskType) => {
        event.dataTransfer.setData("application/reactflow", type);
        event.dataTransfer.effectAllowed = "move"
    }
    return (
        <Button
            variant={"secondary"}
            className='flex justify-between items-center gap-2 border w-full'
            draggable
            onDragStart={(event) => onDragStart(event, taskType)}
        >
            <div className="flex gap-2">
                <task.icon size={20} />
                {task.label}
            </div>
            {/* <Badge className='gap-2 flex items-center' variant={"outline"}>
                <CoinsIcon size={16} />
                {task.credits}
            </Badge> */}
        </Button>
    )
}
export default TaskMenu