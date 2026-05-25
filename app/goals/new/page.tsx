import {redirect} from 'next/navigation'
import { getCurrentUser } from '../../actions/auth'
import { createReductionGoal } from '../../actions/goal'

export default async function NewGoalPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const currentYear = new Date().getFullYear();

    return (
        <main style={{ maxWidth: "640px", margin: "60px auto", padding: "24px" }}>
            <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "8px" }}>
                새 감축 목표 설정
            </h1>

            <p style={{ color: "#666", marginBottom: "24px" }}>
                감축 목표를 설정하여 탄소 배출량 감소를 위한 계획을 세워보세요.
            </p>

            <form
                action={createReductionGoal}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "24px"
                }}
            >
                <label style={{ fontWeight: "bold" }}> 목표 연도 </label>
                <input
                    name="targetYear"
                    type="number"
                    defaultValue={currentYear}
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <label style={{ fontWeight: "bold" }}> 목표 배출량 </label>
                <input
                    name="targetEmission"
                    type="number"
                    step="0.01"
                    placeholder="톤 단위로 입력"
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <label style={{ fontWeight: "bold" }}> 기준 연도 (선택) </label>
                <input
                    name="baseYear"
                    type="number"
                    placeholder="과거 연도 입력"
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <label style={{ fontWeight: "bold" }}> 기준 배출량 (선택) </label>
                <input
                    name="baseEmission"
                    type="number"
                    step="0.01"
                    placeholder="톤 단위로 입력"
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <label style={{ fontWeight: "bold" }}> 설명 (선택) </label>
                <textarea
                    name="description"
                    placeholder="목표에 대한 추가 설명을 입력하세요."
                    style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        minHeight: "100px"
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
                        fontWeight: "bold"
                    }}
                >
                    목표 생성
                </button>
            </form>
        </main>
    );
}