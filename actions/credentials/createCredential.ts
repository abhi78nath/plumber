"use server";

import { symmetricEncrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { createCredentialSchema, createCredentialSchemaType } from "@/schema/credential";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function CreateCredential(form: createCredentialSchemaType) {
    const { success, data } = createCredentialSchema.safeParse(form);

    if (!success) {
        throw new Error("invalid form data");
    }

    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated")
    }

    try {
        const encryptedValue = symmetricEncrypt(data.value);

        const result = await prisma.credential.create({
            data: {
                userId,
                name: data.name,
                value: encryptedValue
            },
        });

        if (!result) {
            throw new Error("failed to create credential")
        }

        revalidatePath("/credentials")
        return { success: true };
    } catch (error: any) {
        console.error("SERVER: Error creating credential:", error);
        throw new Error(error.message || "failed to create credential");
    }
}