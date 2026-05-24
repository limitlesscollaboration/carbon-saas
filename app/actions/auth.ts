"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function signup(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const organizationName = formData.get("organizationName") as string;
    const industry = formData.get("industry") as string;

    if (!name) {
        throw new Error("이름을 입력해주세요.");
    }
    if (!email) {
        throw new Error("이메일을 입력해주세요.");
    }
    if (!password) {
        throw new Error("비밀번호를 입력해주세요.");
    }
    if (!organizationName) {
        throw new Error("회사명을 입력해주세요.");
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("이미 사용 중인 이메일입니다.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    const organization = await prisma.organization.create({
        data: {
            name: organizationName,
            industry,
            description: "기능 시연을 위해 생성한 가상 회사입니다.",
        },
    });

    await prisma.membership.create({
        data: {
            userId: user.id,
            organizationId: organization.id,
            role: "OWNER",
        },
    });

    const cookieStore = await cookies();

    cookieStore.set("userId",user.id, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24,
    });

    redirect("/dashboard");    
}

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    if (!email) {
        throw new Error("이메일을 입력해주세요.");
    }

    if (!password) {
        throw new Error("비밀번호를 입력해주세요.");
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const cookieStore = await cookies();

    cookieStore.set("userId", user.id, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24,
    });

    redirect("/dashboard");
}

export async function logout() {
    const cookieStore = await cookies();
    
    cookieStore.delete("userId");

    redirect("/login");
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            memberships: {
                include: {
                    organization: true,
                },
            },
        },
    });

    return user;
}