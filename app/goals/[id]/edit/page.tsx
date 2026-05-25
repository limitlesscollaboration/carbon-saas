import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../../../actions/auth";
import { updateReductionGoal } from "../../../actions/goal";

type EditGoalPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditGoalPage({ params }: EditGoalPageProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    if (!firstMembership) {
        throw new Error("소속된 회사 정보가 없습니다.");
    }

    const canManage =
        firstMembership.role === "OWNER" || firstMembership.role === "ADMIN";

    if (!canManage) {
        throw new Error("수정 권한이 없습니다.")
    }

    const { id } = await params;

    const goal = await prisma.reductionGoal.findUnique({
        where: {
            id,
        },
    });

    if (!goal) {
        throw new Error("감축 목표를 찾을 수 없습니다.");
    }

    if (goal.organizationId !== firstMembership.organizationId) {
        throw new Error("수정 권한이 없습니다.");
    }

    return (
        <main className="form-container">
            <section className="hero">
                <h1 className="dashboard-title">감축 목표 수정</h1>

                <p className="dashboard-description">
                    등록된 탄소 배출 감축 목표를 수정합니다.
                </p>

                <div className="leaf-decoration">🎯</div>
            </section>

            <form action={updateReductionGoal} className="form-card">
                <input type="hidden" name="goalId" value={goal.id} />

                <label className="form-label">목표 연도</label>
                <input
                    name="targetYear"
                    type="number"
                    defaultValue={goal.targetYear}
                    required
                    className="form-input"
                />

                <label className="form-label">목표 배출량</label>
                <input
                    name="targetEmission"
                    type="number"
                    step="0.01"
                    defaultValue={goal.targetEmission}
                    required
                    className="form-input"
                />

                <label className="form-label">기준 연도</label>
                <input
                    name="baseYear"
                    type="number"
                    defaultValue={goal.baseYear || ""}
                    placeholder="예: 2025"
                    className="form-input"
                />

                <label className="form-label">기준 배출량</label>
                <input
                    name="baseEmission"
                    type="number"
                    step="0.01"
                    defaultValue={goal.baseEmission || ""}
                    placeholder="예: 10000"
                    className="form-input"
                />

                <label className="form-label">설명</label>
                <textarea
                    name="description"
                    defaultValue={goal.description || ""}
                    placeholder="예: 전년 대비 20% 감축 목표"
                    className="form-textarea"
                />

                <button type="submit" className="primary-button">
                    수정하기
                </button>
            </form>
        </main>
    );
}