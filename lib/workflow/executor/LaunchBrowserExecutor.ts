export const runtime = "nodejs";

import waitFor from "@/lib/helper/waitFor";
import { Environment, ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(
    environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url");

        const browser = await puppeteer.launch({
            headless: true, // REQUIRED for cloud
            executablePath: process.env.CHROME_PATH || "/usr/bin/chromium",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-software-rasterizer"
            ]
        });

        environment.setBrowser(browser);

        const page = await browser.newPage();

        // Prevent Render from hanging forever
        page.setDefaultNavigationTimeout(60_000);

        await page.goto(websiteUrl, {
            waitUntil: "networkidle2"
        });

        environment.setPage(page);

        return true;
    } catch (error: any) {
        environment.log.error(error?.message || "Failed to launch browser");
        return false;
    }
}

// export async function LaunchBrowserExecutor(environment: ExecutionEnvironment<typeof LaunchBrowserTask>): Promise<boolean> {
//     try {
//         const websiteUrl = environment.getInput("Website Url");
//         const browser = await puppeteer.launch({
//             headless: false
//         })
//         environment.setBrowser(browser);
//         const page = await browser.newPage();
//         await page.goto(websiteUrl);
//         environment.setPage(page)
//         return true;
//     } catch (error: any) {
//         environment.log.error(error.message);
//         return false;
//     }
// }
