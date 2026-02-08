export const runtime = "nodejs";

import { chromium } from "playwright";
import { ExecutionEnvironment } from "@/types/executor";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutorPlaywright(
    environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url");

        const browser = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
            ],
        });

        const context = await browser.newContext({
            viewport: { width: 1280, height: 800 },
        });

        const page = await context.newPage();

        // Timeouts (Playwright auto-waits, but still good to cap)
        page.setDefaultNavigationTimeout(60_000);
        page.setDefaultTimeout(60_000);

        await page.goto(websiteUrl, {
            waitUntil: "networkidle",
        });

        environment.setBrowser(browser);
        environment.setPage(page);

        // OPTIONAL but recommended
        environment.set("context", context);

        return true;
    } catch (error: any) {
        console.error(error, "Launch Browser Error");
        environment.log.error(error?.message || "Failed to launch browser");
        return false;
    }
}



// export async function LaunchBrowserExecutorPlaywright(
//     environment: ExecutionEnvironment<typeof LaunchBrowserTask>
// ): Promise<boolean> {
//     try {
//         const websiteUrl = environment.getInput("Website Url");

//         const browser = await chromium.launch({
//             headless: false,
//         });

//         const context = await browser.newContext();
//         const page = await context.newPage();

//         await page.goto(websiteUrl);

//         environment.setBrowser(browser);
//         environment.setPage(page);

//         return true;
//     } catch (error: any) {
//         environment.log.error(error.message);
//         return false;
//     }
// }