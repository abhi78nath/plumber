"use server";

import prisma from "@/lib/prisma";
import { createWorkflowSchema } from "@/schema/workflow";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import z from "zod";

export async function CreateWorkflow(
  form: z.infer<typeof createWorkflowSchema>
) {
  const { success, data } = createWorkflowSchema.safeParse(form);
  console.log(data, "data");

  if (!success) {
    throw new Error("invalid form data");
  }

  const { userId } = auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }

  try {
    const result = await prisma.workflow.create({
      data: {
        userId,
        status: WorkflowStatus.DRAFT,
        definition: "TODO",
        ...data,
      },
    });

    console.log("SERVER: Workflow created successfully with ID:", result.id);
    return result.id;
  } catch (error: any) {
    console.error("SERVER: Error creating workflow:", error);
    if (error.code === "P2002") {
      throw new Error("A workflow with this name already exists");
    }
    throw new Error("failed to create workflow");
  }
}
