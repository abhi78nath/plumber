"use server";

import prisma from "@/lib/prisma";
import { FlowExecutionPlan } from "@/lib/workflow/executionPlan";
import { CalculateWorkflowCost } from "@/lib/workflow/helpers";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function PublishWorkflow({
    id,
    flowDefinition,
}: {
    id: string;
    flowDefinition: string;
}) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    try {
        const workflow = await prisma.workflow.findUnique({
            where: {
                id,
                userId
            }
        })

        if (!workflow) {
            throw new Error("workflow not found");
        }

        if (workflow.status !== WorkflowStatus.DRAFT) {
            throw new Error("workflow is not a draft")
        }

        const flow = JSON.parse(flowDefinition);
        const result = FlowExecutionPlan(flow.nodes, flow.edges);

        if (result.error) {
            throw new Error("flow definition not valid");
        }

        if (!result.executionPlan) {
            throw new Error("no execution plan guaranteed")
        }

        const creditsCost = CalculateWorkflowCost(flow.nodes)
        await prisma.workflow.update({
            where: {
                id,
                userId
            },
            data: {
                definition: flowDefinition,
                executionPlan: JSON.stringify(result.executionPlan),
                creditCost: creditsCost,
                status: WorkflowStatus.PUBLISHED
            }
        })

        revalidatePath(`/workflow/editor/${id}`)
    } catch (error: any) {
        console.error("SERVER: Error publishing workflow:", error);
        throw new Error(error.message || "failed to publish workflow");
    }
}