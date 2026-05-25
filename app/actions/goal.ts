"use server";

import {prisma} from "@/lib/prisma";
import {redirect} from "next/navigation";
import { revalidatePath } from "next/cache";
import {getCurrentUser} from "./auth";

export async function createReductionGoal(formData: FormData) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    if (!firstMembership) {
        throw new Error("소속된 회사 정보가 없습니다.");
    }

    const organizationId = firstMembership.organizationId;

    const targetYearValue = formData.get("targetYear") as string;
    const targetEmissionValue = formData.get("targetEmission") as string;
    const baseYearValue = formData.get("baseYear") as string;
    const baseEmissionValue = formData.get("baseEmission") as string;
    const description = formData.get("description") as string;

    if (!targetYearValue) {
        throw new Error("목표 연도를 입력해주세요.");
    }

    if (!targetEmissionValue) {
        throw new Error("목표 배출량을 입력해주세요.");
    }

    const targetYear = Number(targetYearValue);
    const targetEmission = Number(targetEmissionValue);

    if (Number.isNaN(targetYear) || targetYear < 2000) {
        throw new Error("목표 연도를 올바르게 입력해주세요.");
    }

    if (Number.isNaN(targetEmission) || targetEmission <= 0) {
        throw new Error("목표 배출량을 올바르게 입력해주세요.");
    }

    const baseYear = baseYearValue ? Number(baseYearValue) : null;
    const baseEmission = baseEmissionValue ? Number(baseEmissionValue) : null;

    if (baseYearValue && (Number.isNaN(baseYear))) {
        throw new Error("기준 연도를 올바르게 입력해주세요.");
    }

    if (baseEmissionValue && (Number.isNaN(baseEmission) || baseEmission! <= 0)) {
        throw new Error("기준 배출량을 올바르게 입력해주세요.");
    }

    await prisma.reductionGoal.create({
        data: {
            organizationId,
            targetYear,
            targetEmission,
            baseYear,
            baseEmission,
            description: description || null,
        },
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");

    redirect("/goals");
}

export async function deleteReductionGoal(formData: FormData){
    const user = await getCurrentUser();

    if(!user) {
        redirect("/login")
    }

    const firstMembership = user.memberships[0];

    if(!firstMembership) {
        throw new Error("소속된 회사 정보가 없습니다.")
    }

    const canDelete = 
        firstMembership.role === "OWNER" || firstMembership.role === "ADMIN";

    if(!canDelete) {
        throw new Error("삭제 권한이 없습니다.")
    }

    const goalId = formData.get("goalId") as string;

    if(!goalId) {
        throw new Error("삭제할 감축 목표가 없습니다.")
    }

    const goal = await prisma.reductionGoal.findUnique({
        where: {
            id: goalId,
        },
    });

    if(!goal) {
        throw new Error("감축 목표를 찾을 수 없습니다.");
    }

    if (goal.organizationId !== firstMembership.organizationId) {
        throw new Error("삭제 권한이 없습니다.");
    }

    await prisma.reductionGoal.delete({
        where: {
            id: goalId,
        },
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");

    redirect("/goals");
}

export async function updateReductionGoal(formData: FormData) {
    const user = await getCurrentUser();

    if(!user) {
       redirect("/login");
    }

    const firstMembership = user.memberships[0];

    if(!firstMembership) {
        throw new Error("소속된 회사 정보가 없습니다.")
    }

    const canUpdate =
        firstMembership.role === "OWNER" || firstMembership.role === "ADMIN";
    
        if (!canUpdate) {
            throw new Error("수정 권한이 없습니다.");
        }

        const goalId = formData.get("goalId") as string;
        const targetYearValue = formData.get("targetYear") as string;
        const targetEmissionValue = formData.get("targetEmission") as string;
        const baseYearValue = formData.get("baseYear") as string;
        const baseEmissionValue = formData.get("baseEmission") as string;
        const description = formData.get("description") as string;

        if(!goalId) {
            throw new Error("수정할 감축 목표가 없습니다.")
        }

        if(!targetYearValue){
            throw new Error("목표 연도를 입력해주세요.")
        }

         if(!targetEmissionValue){
            throw new Error("목표 배출량을 입력해주세요.")
        }

        const targetYear = Number(targetYearValue);
        const targetEmission = Number(targetEmissionValue);

        if(Number.isNaN(targetYear) || targetYear < 2000) {
            throw new Error("목표 연도를 올바르게 입력해주세요.")
        }

        if (Number.isNaN(targetEmission) || targetEmission <= 0) {
            throw new Error("목표 배출량은 0보다 큰 숫자로 입력해주세요.");
        }

        const baseYear = baseYearValue ? Number(baseYearValue) : null;
        const baseEmission = baseEmissionValue ? Number(baseEmissionValue) : null;

        if (baseYearValue && Number.isNaN(baseYear)){
            throw new Error("기준 연도를 올바르게 입력해주세요.")
        }

        if (baseEmissionValue && (Number.isNaN(baseEmission) || baseEmission! <=0)){
            throw new Error("기준 배출량은 0보다 큰 숫자로 입력해주세요.")
        }

        const goal = await prisma.reductionGoal.findUnique({
            where: {
                id: goalId,
            },
        });

        if(!goal) {
            throw new Error("감축 목표를 찾을 수 없습니다.");
        }

        if(goal.organizationId !== firstMembership.organizationId) {
            throw new Error("수정 권한이 없습니다.");
        }

        await prisma.reductionGoal.update({
            where: {
                id:goalId,
            },
            data: {
                targetYear,
                targetEmission,
                baseYear,
                baseEmission,
                description: description || null,
            },
        });

        revalidatePath("/goals");
        revalidatePath("/dashboard");

        redirect("/goals");
}
