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

    if(!user){
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    const canManage = 
        firstMembership.role === "OWNER" || firstMembership.role === "ADMIN";

    if(!canManage) {
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
        <main style={{ maxWidth: "640px", margin: "60px auto", padding: "24px" }}>
            <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "8px"}}>
                감축 목표 수정
            </h1>

            <p style={{ color: "#666", marginBottom: "24px"}}>
                등록된 탄소 배출 감축 목표를 수정합니다.
            </p>

            <form
                action={updateReductionGoal}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "24px",
                }}
            >
                <input type="hidden" name="goalId" value={goal.id} />

                <label style={{ fontWeight: "bold"}}> 목표 연도 </label>
                <input
                    name="targetYear"
                    type="number"
                    defaultValue={goal.targetYear}
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <label style={{ fontWeight: "bold" }}>목표 배출량</label>
                <input
                    name="targetEmission"
                    type="number"
                    step="0.01"
                    defaultValue={goal.targetEmission}
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius:"8px"}}
                />

                <label style={{ fontWeight:"bold"}}>기준 연도</label>
                <input
                    name="baseYear"
                    type="number"
                    defaultValue={goal.baseYear || ""}
                    placeholder="예: 2025"
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px"}}
                />

                <label style={{ fontWeight:"bold"}}>기준 배출량</label>
                <input
                    name="baseEmission"
                    type="number"
                    step="0.01"
                    defaultValue={goal.baseEmission || ""}
                    placeholder="예: 10000"
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px"}}
                />

                <label style={{ fontWeight: "bold" }}>설명</label>
                <textarea
                name="description"
                defaultValue={goal.description || ""}
                placeholder="예: 전년 대비 20% 감축 목표"
                style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    minHeight: "100px",
                    }}
                />

                <button
                    type="submit"
                    style={{
                        marginTop: "12px",
                        padding: "14px",
                        backgroundColor: "#15803d",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    수정하기
                </button>
            </form>
        </main>
    );
}