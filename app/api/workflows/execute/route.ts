export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, WorkflowExecutionStatus, WorkflowExecutionTrigger } from "@/types/workflow";
import { timingSafeEqual } from "crypto";
import parser, { CronExpressionParser } from 'cron-parser';

function isValidSecret(secret: string) {
    const API_SECRET = process.env.API_SECRET;

    if (!API_SECRET) return false;

    try {
        return timingSafeEqual(Buffer.from(secret), Buffer.from(API_SECRET));
    } catch (error) {
        return false;
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return Response.json({ error: "UNauthorized" }, { status: 401 });
    }

    const secret = authHeader.split(" ")[1];

    if (!isValidSecret(secret)) {
        console.error("@@Unauthorized execution request - Invalid secret");
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get("workflowId") as string;

    if (!workflowId) {
        return Response.json({ error: "bad request" }, { status: 400 })
    }

    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
    });

    if (!workflow) {
        return Response.json({ error: "bad request" }, { status: 400 })
    }

    const executionPlan = JSON.parse(
        workflow.executionPlan!
    ) as WorkflowExecutionPlan;

    if (!executionPlan) {
        console.error(`@@No execution plan found for workflow ${workflowId}`);
        return Response.json({ error: "bad request" }, { status: 400 })
    }

    console.log(`@@Starting execution for workflow ${workflowId}`);

    try {
        const cron = CronExpressionParser.parse(workflow.cron!);
        console.log(`@@Workflow ${workflowId} cron parsed:`, workflow.cron);
        const nextRun = cron.next().toDate();
        console.log(`@@Workflow ${workflowId} next run scheduled for:`, nextRun);

        const execution = await prisma.workflowExecution.create({
            data: {
                workflowId,
                userId: workflow.userId,
                definition: workflow.definition,
                status: WorkflowExecutionStatus.PENDING,
                startedAt: new Date(),
                trigger: WorkflowExecutionTrigger.CRON,
                phases: {
                    create: executionPlan.flatMap((phase) => {
                        return phase.nodes.flatMap((node) => {
                            return {
                                userId: workflow.userId,
                                status: ExecutionPhaseStatus.CREATED,
                                number: phase.phase,
                                node: JSON.stringify(node),
                                name: TaskRegistry[node.data.type].label,
                            };
                        });
                    }),
                },
            },
        });

        ExecuteWorkflow(execution.id, nextRun).catch(err => {
            console.error(`@@Error executing workflow ${workflowId} in background:`, err);
        });

        return new Response(null, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}