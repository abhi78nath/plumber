"use server";

import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function UnpublishWorkflow(id: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("unauthenticated");
    }

    try {
        const workflow = await prisma.workflow.findUnique({
            where: {
                id,
                userId,
            }
        })

        if (!workflow) {
            throw new Error("workflow is not found");
        }

        if (workflow.status !== WorkflowStatus.PUBLISHED) {
            throw new Error("workflow is not published")
        }

        await prisma.workflow.update({
            where: {
                id,
                userId
            },
            data: {
                status: WorkflowStatus.DRAFT,
                executionPlan: null,
                creditCost: 0,
            }
        })

        revalidatePath(`/workflow/editor/${id}`)
    } catch (error: any) {
        console.error("SERVER: Error unpublishing workflow:", error);
        throw new Error(error.message || "failed to unpublish workflow");
    }
}