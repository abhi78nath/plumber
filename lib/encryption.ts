import crypto from "crypto";
import "server-only"

const ALGO = "aes-256-cbc";


export const symmetricEncrypt = (data: string) => {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error("encryption key not found");
    }

    const intializationVector = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGO, Buffer.from(key, "hex"), intializationVector);

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return intializationVector.toString("hex") + ":" + encrypted.toString("hex");
}

export const symmetricDecrypt = (encrypted: string) => {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error("encryption key not found");
    }

    const textParts = encrypted.split(":");
    const intializationVector = Buffer.from(textParts.shift() as string, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");

    const decipher = crypto.createDecipheriv(ALGO, Buffer.from(key, "hex"), intializationVector);

    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString()
}


