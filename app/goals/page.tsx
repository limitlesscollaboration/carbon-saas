import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, logout } from "../actions/auth";
import { prisma } from "@/lib/prisma";
import { deleteReductionGoal } from "../actions/goal";

export default async function GoalsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    if (!firstMembership) {
        throw new Error("소속된 회사의 정보가 없습니다.");
    }

    const organizationId = firstMembership.organizationId;
    const canManage =
        firstMembership.role === "OWNER" || firstMembership.role === "ADMIN";

    const roleText =
        firstMembership.role === "OWNER"
            ? "소유자"
            : firstMembership.role === "ADMIN"
                ? "관리자"
                : "일반 사용자";

    const goals = await prisma.reductionGoal.findMany({
        where: {
            organizationId,
        },
        orderBy: {
            targetYear: "desc",
        },
    });

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div>
                    <Link href="/dashboard" className="sidebar-brand">
                        <div className="sidebar-logo">🌿</div>
                        <div>
                            <p className="sidebar-title">EcoTrack</p>
                            <p className="sidebar-subtitle">목표 관리</p>
                        </div>
                    </Link>

                    <nav className="sidebar-nav">
                        <Link href="/dashboard" className="sidebar-link">
                            <span>▦</span>
                            대시보드
                        </Link>

                        <Link href="/emissions" className="sidebar-link">
                            <span>▤</span>
                            배출 데이터
                        </Link>

                        <Link href="/goals" className="sidebar-link active">
                            <span>◎</span>
                            목표 관리
                        </Link>

                        <Link href="/reports" className="sidebar-link">
                            <span>▥</span>
                            분석 리포트
                        </Link>
                    </nav>
                </div>

                <div className="sidebar-card">
                    <p className="sidebar-card-title">감축 목표 관리</p>
                    <p className="sidebar-card-text">
                        연도별 탄소 감축 목표를 설정하고 목표 대비 현황을 관리하세요.
                    </p>
                </div>
            </aside>

            <div className="main-area">
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="menu-button" type="button">
                            ☰
                        </button>
                        <span className="topbar-title">목표 관리</span>
                    </div>

                    <div className="topbar-actions">
                        <div className="notification">🔔</div>

                        <details className="profile-menu">
                            <summary className="profile-summary">
                                <span className="profile-avatar">👤</span>
                                <span className="profile-name">{user.name}</span>
                            </summary>

                            <div className="profile-dropdown">
                                <div className="profile-info">
                                    <p className="profile-user-name">{user.name}</p>
                                    <p className="profile-user-role">{roleText}</p>
                                </div>

                                <form action={logout}>
                                    <button type="submit" className="profile-logout-button">
                                        로그아웃
                                    </button>
                                </form>
                            </div>
                        </details>
                    </div>
                </header>

                <main className="content">
                    <section className="hero">
                        <h1 className="dashboard-title">감축 목표 목록</h1>
                        <p className="dashboard-description">
                            회사의 탄소 배출 감축 목표를 등록하고 관리합니다.
                        </p>
                        <div className="leaf-decoration">🎯</div>
                    </section>

                    <section className="summary-grid">
                        <div className="metric-card">
                            <div className="metric-icon">🎯</div>
                            <div>
                                <p className="metric-label">등록 목표 수</p>
                                <p className="metric-value">{goals.length}건</p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">📅</div>
                            <div>
                                <p className="metric-label">최근 목표 연도</p>
                                <p className="metric-value">
                                    {goals[0] ? `${goals[0].targetYear}년` : "없음"}
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">🌱</div>
                            <div>
                                <p className="metric-label">최근 목표 배출량</p>
                                <p className="metric-value">
                                    {goals[0] ? `${goals[0].targetEmission.toFixed(2)}` : "0"}
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">🔐</div>
                            <div>
                                <p className="metric-label">현재 권한</p>
                                <p className="metric-value">{roleText}</p>
                            </div>
                        </div>
                    </section>

                    <section className="table-card">
                        <div className="table-header">
                            <div>
                                <h2 className="table-title">감축 목표</h2>
                                <p className="table-description">
                                    등록된 감축 목표를 목표 연도 기준으로 확인합니다.
                                </p>
                            </div>

                            <div className="action-row">
                                <Link href="/goals/new" className="primary-link">
                                    + 목표 등록
                                </Link>
                            </div>
                        </div>

                        {goals.length === 0 ? (
                            <section className="empty-box">
                                <p className="table-description" style={{ marginBottom: "16px" }}>
                                    등록된 감축 목표가 없습니다.
                                </p>

                                <Link href="/goals/new" className="primary-link">
                                    첫 목표 등록하기
                                </Link>
                            </section>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>목표 연도</th>
                                        <th>목표 배출량</th>
                                        <th>기준 연도</th>
                                        <th>기준 배출량</th>
                                        <th>설명</th>
                                        {canManage && <th>관리</th>}
                                    </tr>
                                </thead>

                                <tbody>
                                    {goals.map((goal) => (
                                        <tr key={goal.id}>
                                            <td>{goal.targetYear}</td>
                                            <td>{goal.targetEmission.toFixed(2)} kgCO₂e</td>
                                            <td>{goal.baseYear || "-"}</td>
                                            <td>
                                                {goal.baseEmission
                                                    ? `${goal.baseEmission.toFixed(2)} kgCO₂e`
                                                    : "-"}
                                            </td>
                                            <td>{goal.description || "-"}</td>

                                            {canManage && (
                                                <td>
                                                    <div className="action-row">
                                                        <Link
                                                            href={`/goals/${goal.id}/edit`}
                                                            className="edit-link"
                                                        >
                                                            수정
                                                        </Link>

                                                        <form action={deleteReductionGoal}>
                                                            <input type="hidden" name="goalId" value={goal.id} />

                                                            <button type="submit" className="danger-button">
                                                                삭제
                                                            </button>
                                                        </form>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}