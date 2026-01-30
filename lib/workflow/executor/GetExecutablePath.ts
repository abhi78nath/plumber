import chromium from "@sparticuz/chromium-min";

let cachedExecutablePath: string | null = null;

export async function GetExecutablePath(): Promise<string> {
    if (cachedExecutablePath) {
        return cachedExecutablePath;
    }

    let executablePath: string;

    if (process.env.VERCEL) {
        // In Vercel, use the bundled tar file from the public directory
        // VERCEL_URL is the deployment URL (e.g., project-name-abc.vercel.app)
        const host = process.env.VERCEL_URL;
        const packUrl = `https://${host}/chromium-pack.tar`;
        executablePath = await chromium.executablePath(packUrl);
    } else {
        // Local development
        // If we have a local chromium-pack.tar in public, we could technically use it via a local URL
        // but often developers have a local chrome or want to use the default sparticuz logic
        // For now, let's try the default which might require a local /bin folder or specific setup
        executablePath = await chromium.executablePath();
    }

    cachedExecutablePath = executablePath;
    return executablePath;
}
