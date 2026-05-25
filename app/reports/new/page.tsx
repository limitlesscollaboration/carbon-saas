import { redirect } from "next/navigation";
import { getCurrentUser } from "../../actions/auth";
import { createReport } from "../../actions/report";

export default async function NewReportPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const today = new Date().toISOString().slice(0, 10);

    return (
        <main style={{ maxWidth: "640px", margin: "60px auto", padding: "24px" }}>
            <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "8px" }}>
                보고서 생성
            </h1>

            <p style={{ color: "#666", marginBottom: "24px" }}>
                선택한 기간의 배출 데이터를 기준으로 탄소 배출 보고서를 생성합니다.
            </p>
            <form
                action={createReport}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "24px",
                }}
            >
                <label style={{ fontWeight: "bold" }}>제목</label>
                <input
                    name="title"
                    placeholder="예: 2026년 5월 탄소 배출 보고서"
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <label style={{ fontWeight: "bold" }}>유형</label>
                <select
                    name="reportType"
                    defaultValue="MONTHLY"
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                >
                    <option value="MONTHLY">월간 보고서</option>
                    <option value="YEARLY">연간 보고서</option>
                    <option value="CUSTOM">사용자 지정 보고서</option>
                </select>

                <label style={{ fontWeight: "bold" }}>시작일</label>
                <input
                    name="startDate"
                    type="date"
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <label style={{ fontWeight: "bold" }}>종료일</label>
                <input
                    name="endDate"
                    type="date"
                    defaultValue={today}
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <label style={{ fontWeight: "bold" }}>요약</label>
                <textarea
                    name="summary"
                    placeholder="예: 전기 사용량이 전체 배출량의 대부분을 차지했습니다."
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
                    생성
                </button>
            </form>
        </main>
    );
}