export const runtime = "nodejs";

import { ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(
    environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url");

        const isServerless =
            !!process.env.VERCEL ||
            !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
            !!process.env.LAMBDA_TASK_ROOT;

        const browser = await puppeteer.launch({
            args: isServerless
                ? [
                    ...chromium.args,
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--no-zygote",
                    "--single-process",
                ]
                : [],

            executablePath: isServerless
                ? await chromium.executablePath()
                : undefined,

            headless: isServerless ? true : false,

            defaultViewport: isServerless
                ? chromium.defaultViewport
                : null,
        });

        environment.setBrowser(browser);

        const page = await browser.newPage();
        await page.goto(websiteUrl, { waitUntil: "networkidle2" });
        environment.setPage(page);

        return true;
    } catch (error: any) {
        environment.log.error(error.stack || error.message);
        return false;
    }
}
