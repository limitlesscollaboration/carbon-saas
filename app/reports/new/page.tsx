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
        <main className="form-container">
            <section className="hero">
                <h1 className="dashboard-title">보고서 생성</h1>

                <p className="dashboard-description">
                    선택한 기간의 배출 데이터를 기준으로 탄소 배출 보고서를 생성합니다.
                </p>

                <div className="leaf-decoration">📊</div>
            </section>

            <form action={createReport} className="form-card">
                <label className="form-label">제목</label>
                <input
                    name="title"
                    placeholder="예: 2026년 5월 탄소 배출 보고서"
                    required
                    className="form-input"
                />

                <label className="form-label">유형</label>
                <select
                    name="reportType"
                    defaultValue="MONTHLY"
                    required
                    className="form-select"
                >
                    <option value="MONTHLY">월간 보고서</option>
                    <option value="YEARLY">연간 보고서</option>
                    <option value="CUSTOM">사용자 지정 보고서</option>
                </select>

                <label className="form-label">시작일</label>
                <input
                    name="startDate"
                    type="date"
                    required
                    className="form-input"
                />

                <label className="form-label">종료일</label>
                <input
                    name="endDate"
                    type="date"
                    defaultValue={today}
                    required
                    className="form-input"
                />

                <label className="form-label">요약</label>
                <textarea
                    name="summary"
                    placeholder="예: 전기 사용량이 전체 배출량의 대부분을 차지했습니다."
                    className="form-textarea"
                />

                <button type="submit" className="primary-button">
                    생성
                </button>
            </form>
        </main>
    );
}