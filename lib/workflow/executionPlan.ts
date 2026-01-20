import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/types/workflow";
import { Edge } from "@xyflow/react";
import { TaskRegistry } from "./task/registry";

export enum FlowToExecutionPlanValidationError {
    "NO_ENTRY_POINT",
    "INVALID_INPUTS"
}
type FlowToExecutionPlanType = {
    executionPlan?: WorkflowExecutionPlan;
    error?: {
        type: FlowToExecutionPlanValidationError;
        invalidElements?: AppNodeMissingInputs[];
    }
}
export function FlowExecutionPlan(
    nodes: AppNode[],
    edges: Edge[]
): FlowToExecutionPlanType {
    const entryPoint = nodes.find((node) => TaskRegistry[node.data.type].isEntryPoint);

    if (!entryPoint) {
        return {
            error: {
                type: FlowToExecutionPlanValidationError.NO_ENTRY_POINT,
            }
        }
    }

    const inputsWithErrors: AppNodeMissingInputs[] = [];
    const planned = new Set<string>();

    const invalidInputs = getInvalidInputs(entryPoint, edges, planned);
    if (invalidInputs.length > 0) {
        inputsWithErrors.push({ nodeId: entryPoint.id, inputs: invalidInputs });
    }
    const executionPlan: WorkflowExecutionPlan = [
        {
            phase: 1,
            nodes: [entryPoint]
        }
    ];

    planned.add(entryPoint.id)

    for (let phase = 2;
        phase <= nodes.length && planned.size < nodes.length; phase++
    ) {
        const nextPhase: WorkflowExecutionPlanPhase = { phase, nodes: [] };

        for (const currentNode of nodes) {
            if (planned.has(currentNode.id)) {
                // node already put in execution
                continue;
            }

            const invalidInputs = getInvalidInputs(currentNode, edges, planned);

            if (invalidInputs.length > 0) {
                const incomingConnections = getIncomers(currentNode, nodes, edges);

                if (incomingConnections.every((inConnect: { id: string; }) => planned.has(inConnect.id))) {
                    // if all the incoming edges are planned and there are still invalid inputs
                    // this means that this particualr node has invalid input thus workflow is invalid

                    console.error("Invalid inputs", currentNode.id, invalidInputs);
                    inputsWithErrors.push({
                        nodeId: currentNode.id,
                        inputs: invalidInputs,
                    })
                } else {
                    //  skip this node for now
                    continue;
                }
            }

            nextPhase.nodes.push(currentNode);
        }

        for (const node of nextPhase.nodes) {

            planned.add(node.id)
        }

        executionPlan.push(nextPhase)
    }

    if (inputsWithErrors.length > 0) {
        return {
            error: {
                type: FlowToExecutionPlanValidationError.INVALID_INPUTS,
                invalidElements: inputsWithErrors
            }
        }
    }

    return { executionPlan }
}


const getInvalidInputs = (node: AppNode, edges: Edge[], planned: Set<string>) => {
    const invalidInputs = [];

    const inputs = TaskRegistry[node.data.type].inputs;
    for (const input of inputs) {
        const inputValue = node.data.inputs[input.name];
        const inputValueProvided = inputValue?.length > 0;

        if (inputValueProvided) {
            // input fine
            continue;
        }

        // if a value is not provided by the user then we need to check
        //  if there is an output linked to the curretn task

        const incomingEdges = edges.filter((edge) => edge.target === node.id);

        const inputLinkedToOutput = incomingEdges.find((edge) => edge.targetHandle === input.name)

        const requiredInputProvidedByVisitedOutput = input.required && inputLinkedToOutput && planned.has(inputLinkedToOutput.source);

        if (requiredInputProvidedByVisitedOutput) {
            // the inputs are required and we have a valid value for it
            // provided by a task that is already planned

            continue;
        } else if (!input.required) {
            // if input is not required but there is an output is linked to it
            // then we need to make sure that the output is planned

            if (!inputLinkedToOutput) continue;

            if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
                // the output is providing a value to input : input is fine
                continue;
            }
        }

        invalidInputs.push(input.name);


    }
    return invalidInputs;
}

const getIncomers = (node: AppNode, nodes: AppNode[], edges: Edge[]) => {
    if (!node.id) {
        return [];
    }

    const incomingConnectionIds = new Set();
    edges.forEach((edge) => {
        if (edge.target === node.id) {
            incomingConnectionIds.add(edge.source);
        }
    });

    return nodes.filter((n) => incomingConnectionIds.has(n.id));
}