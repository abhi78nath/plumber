import { useContext } from "react";
import { FlowValidationContext } from "../context/FlowValidationContext";

export default function useFlowValidation() {
    const context = useContext(FlowValidationContext);

    if (!context) {
        throw new Error("useflowvalidation must be used within a flowvalidationcontext")
    }

    return context;
}