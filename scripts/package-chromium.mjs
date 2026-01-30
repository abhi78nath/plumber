import fs from "fs";
import path from "path";
import { https } from "follow-redirects";

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
const chromiumMinVersion = pkg.dependencies["@sparticuz/chromium-min"]?.replace("^", "").replace("~", "");

if (!chromiumMinVersion) {
    console.error("Error: @sparticuz/chromium-min not found in package.json");
    process.exit(1);
}

const CHROMIUM_VERSION = chromiumMinVersion;
const DOWNLOAD_URL = `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_VERSION}/chromium-v${CHROMIUM_VERSION}-pack.tar`;
const OUTPUT_DIR = path.join(process.cwd(), "public");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "chromium-pack.tar");

async function downloadPack() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Skip if file already exists to save time in dev
    if (fs.existsSync(OUTPUT_FILE)) {
        console.log("Chromium pack already exists, skipping download.");
        return;
    }

    console.log(`Downloading Chromium pack v${CHROMIUM_VERSION}...`);
    console.log(`URL: ${DOWNLOAD_URL}`);

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(OUTPUT_FILE);
        https.get(DOWNLOAD_URL, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
                return;
            }
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log(`Successfully downloaded to ${OUTPUT_FILE}`);
                resolve();
            });
        }).on("error", (err) => {
            fs.unlink(OUTPUT_FILE, () => { });
            reject(err);
        });
    });
}

downloadPack().catch((err) => {
    console.error("Error downloading Chromium pack:", err.message);
    // Don't fail the build if download fails in non-production? 
    // Actually, better to fail so we know something is wrong.
    process.exit(1);
});
