"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DeleteWorkflow(id: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("unauthenticated");
    }

    try {
        await prisma.workflow.delete({
            where: {
                id,
                userId
            },
        });
        revalidatePath("/workflows")
    } catch (error: any) {
        console.error("SERVER: Error deleting workflow:", error);
        throw new Error("failed to delete workflow");
    }
}
