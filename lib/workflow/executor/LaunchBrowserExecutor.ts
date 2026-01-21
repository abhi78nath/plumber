import waitFor from "@/lib/helper/waitFor"
import { Environment, ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer"
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(environment: ExecutionEnvironment<typeof LaunchBrowserTask>): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url");
        console.log("@@@WEBSITE URL", websiteUrl)
        console.log("#ENV", JSON.stringify(environment, null, 4))
        const browser = await puppeteer.launch({
            headless: false
        })
        await waitFor(3000);
        await browser.close();

        return true;
    } catch (error) {
        console.error("Something went wrong", error);
        return false;
    }
}