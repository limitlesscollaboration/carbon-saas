import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../actions/auth'
import { createReductionGoal } from '../../actions/goal'

export default async function NewGoalPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const currentYear = new Date().getFullYear();

    return (
        <main className="form-container">
            <section className="hero">
                <h1 className="dashboard-title">새 감축 목표 설정</h1>

                <p className="dashboard-description">
                    감축 목표를 설정하여 탄소 배출량 감소를 위한 계획을 세워보세요.
                </p>

                <div className="leaf-decoration">🎯</div>
            </section>

            <form action={createReductionGoal} className="form-card">
                <label className="form-label">목표 연도</label>
                <input
                    name="targetYear"
                    type="number"
                    defaultValue={currentYear}
                    required
                    className="form-input"
                />

                <label className="form-label">목표 배출량</label>
                <input
                    name="targetEmission"
                    type="number"
                    step="0.01"
                    placeholder="예: 8000"
                    required
                    className="form-input"
                />

                <label className="form-label">기준 연도</label>
                <input
                    name="baseYear"
                    type="number"
                    placeholder="예: 2025"
                    className="form-input"
                />

                <label className="form-label">기준 배출량</label>
                <input
                    name="baseEmission"
                    type="number"
                    step="0.01"
                    placeholder="예: 10000"
                    className="form-input"
                />

                <label className="form-label">설명</label>
                <textarea
                    name="description"
                    placeholder="목표에 대한 추가 설명을 입력하세요."
                    className="form-textarea"
                />

                <button type="submit" className="primary-button">
                    목표 생성
                </button>
            </form>
        </main>
    );
}