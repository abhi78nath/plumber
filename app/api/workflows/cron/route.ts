import { getAppUrl } from "@/lib/helper/appUrl";
import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";

async function isValidSecret(secret: string) {
    const API_SECRET = process.env.API_SECRET;
    if (!API_SECRET) return false;
    return secret === API_SECRET;
}

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = authHeader.split(" ")[1];
    if (!(await isValidSecret(secret))) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const workflows = await prisma.workflow.findMany({
        select: { id: true, nextRunAt: true, cron: true },
        where: {
            status: WorkflowStatus.PUBLISHED,
            cron: { not: null },
            nextRunAt: { lte: now },
        }
    })

    console.log("@@WORKFLOWS to run", workflows.length, workflows.map(w => ({ id: w.id, nextRunAt: w.nextRunAt, cron: w.cron })));

    const triggerResults = await Promise.allSettled(
        workflows.map((workflow) => triggerWorkflow(workflow.id))
    );

    triggerResults.forEach((result, index) => {
        if (result.status === "rejected") {
            console.error(`@@Error triggering workflow ${workflows[index].id}:`, result.reason);
        }
    });

    return Response.json({ workflowsToRun: workflows.length }, { status: 200 });
}

async function triggerWorkflow(workflowId: string) {
    const triggerApiUrl = getAppUrl(`api/workflows/execute?workflowId=${workflowId}`)

    console.log("@@Triggering workflow", workflowId, "at", triggerApiUrl);
    return fetch(triggerApiUrl, {
        headers: {
            Authorization: `Bearer ${process.env.API_SECRET!}`
        },
        cache: "no-store",
    }).then(async (res) => {
        if (!res.ok) {
            const body = await res.text();
            console.error(`@@Workflow ${workflowId} trigger failed with status ${res.status}: ${body}`);
        } else {
            console.log(`@@Workflow ${workflowId} triggered successfully`);
        }
    }).catch((error) => {
        console.error("@@Error triggering workflow with id", workflowId, "error", error.message)
    })
}