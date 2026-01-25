import { setupUser } from "@/actions/billing/setupUser";


export default async function SetupPage() {
    return await setupUser();
}