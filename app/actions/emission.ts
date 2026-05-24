"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

export async function createEmissionRecord(formData: FormData) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    if (!firstMembership) {
        throw new Error(" 소속된 회사 정보가 없습니다 ");
    }

    const organizationId = firstMembership.organizationId;

    const emissionFactorId = formData.get("emissionFactorId") as string;
    const department = formData.get("department") as string;
    const activityDate = formData.get("activityDate") as string;
    const amountValue = formData.get("amount") as string;
    const memo = formData.get("memo") as string;

    if (!emissionFactorId) {
        throw new Error(" 배출 항목을 선택해주세요 ");
    }

    if (!activityDate) {
        throw new Error(" 사용일을 입력해주세요 ");
    }

    if (!amountValue) {
        throw new Error(" 사용량을 입력해주세요 ");
    }

    const amount = Number(amountValue);

    if (isNaN(amount) || amount <= 0) {
        throw new Error(" 사용량은 0보다 큰 숫자로 입력해주세요. ");
    }

    const emissionFactor = await prisma.emissionFactor.findUnique({
        where: {
            id: emissionFactorId,
        },
    });

    if (!emissionFactor) {
        throw new Error(" 배출계수 정보를 찾을 수 없습니다. ");
    }

    const emissionAmount = amount * emissionFactor.factor;

    await prisma.emissionRecord.create({
        data: {
            organizationId,
            emissionFactorId,
            department: department || null,
            activityDate: new Date(activityDate),
            amount,
            unit: emissionFactor.unit,
            emissionAmount,
            memo: memo || null,
            createdById: user.id,
        },
    });

    revalidatePath("/emissions");
    revalidatePath("/dashboard");

    redirect("/emissions");
}
