import { SheetIcon } from 'lucide-react';

import { TaskParamType, TaskType } from '@/types/task';
import { WorkflowTask } from '@/types/workflow';

export const WriteToGoogleSheetTask = {
    type: TaskType.WRITE_TO_GOOGLE_SHEET,
    label: 'Write to Google Sheet',
    icon: (props) => <SheetIcon className="stroke-green-400" {...props} />,
    isEntryPoint: false,
    credits: 2,
    inputs: [
        {
            name: 'Spreadsheet Link',
            type: TaskParamType.STRING,
            required: true,
            helperText: 'Paste the full URL of your Google Sheet',
        },
        {
            name: 'Sheet Name',
            type: TaskParamType.STRING,
            required: true,
            helperText: 'e.g. Sheet1',
        },
        {
            name: 'Values',
            type: TaskParamType.STRING,
            required: true,
            helperText: 'Data to append (JSON or text)',
        },
    ] as const,
    outputs: [] as const,
} satisfies WorkflowTask;
