import waitFor from "@/lib/helper/waitFor"
import { ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(
    environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url");
        const isServerless = !!process.env.VERCEL;

        const browser = await puppeteer.launch({
            args: isServerless ? chromium.args : [],
            executablePath: isServerless
                ? await chromium.executablePath()
                : undefined,
            channel: isServerless ? undefined : "chrome",
            headless: isServerless ? (chromium.headless as any) : false,
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
