"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

export async function createReport(formData: FormData){
    const user = await getCurrentUser();

    if(!user) {
        redirect("/login")
    }

    const firstFriendship = user.memberships[0];

    if (!firstFriendship) {
        throw new Error("소속된 회사 정보가 없습니다.");
    }

    const organizationId = firstFriendship.organizationId;

    const title = formData.get("title") as string;
    const reportType = formData.get("reportType") as string;
    const startDateValue = formData.get("startDate") as string;
    const endDateValue = formData.get("endDate") as string;
    const summary = formData.get("summary") as string;

    if (!title) {
        throw new Error("보고서 제목을 입력해주세요.");
    }

    if (!reportType) {
        throw new Error("보고서 유형을 선택해주세요.");
    }

    if (!startDateValue) {
        throw new Error("시작일을 입력해주세요.");
    }

    if (!endDateValue) {
        throw new Error("종료일을 입력해주세요.");
    }

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    if (startDate > endDate) {
        throw new Error("시작일은 종료일보다 늦을 수 없습니다.");
    }

    const records = await prisma.emissionRecord.findMany({
        where: {
            organizationId,
            activityDate: {
                gte: startDate,
                lte: endDate,
            },
        },
    });

    const totalEmission = records.reduce((sum, record) => {
        return sum + record.emissionAmount;        
    }, 0);

    await prisma.report.create({
        data: {
            organizationId,
            title,
            reportType,
            startDate,
            endDate,
            totalEmission,
            summary: summary || null,
            createdById: user.id,
        },
    });

    revalidatePath("/reports");
    revalidatePath("/dashboard");

    redirect("/reports");
}