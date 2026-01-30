export const runtime = "nodejs";

import { ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(
    environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url");

        const browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-zygote",
                "--single-process",
            ],
            executablePath: await chromium.executablePath(),
            headless: true,
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
