import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logout } from "../actions/auth";

export default async function ReportsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    if (!firstMembership) {
        throw new Error("소속된 회사 정보가 없습니다.")
    }

    const organizationId = firstMembership.organizationId;

    const roleText =
        firstMembership.role === "OWNER"
            ? "소유자"
            : firstMembership.role === "ADMIN"
                ? "관리자"
                : "일반 사용자";

    const reports = await prisma.report.findMany({
        where: {
            organizationId,
        },
        include: {
            createdBy: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const latestReport = reports[0];

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div>
                    <div className="sidebar-brand">
                        <div className="sidebar-logo">🌿</div>
                        <div>
                            <p className="sidebar-title">Carbon SaaS</p>
                            <p className="sidebar-subtitle">Dashboard</p>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <Link href="/dashboard" className="sidebar-link">
                            <span>▦</span>
                            대시보드
                        </Link>

                        <Link href="/emissions" className="sidebar-link">
                            <span>▤</span>
                            배출 데이터
                        </Link>

                        <Link href="/goals" className="sidebar-link">
                            <span>◎</span>
                            목표 관리
                        </Link>

                        <Link href="/reports" className="sidebar-link active">
                            <span>▥</span>
                            분석 리포트
                        </Link>
                    </nav>
                </div>

                <div className="sidebar-card">
                    <p className="sidebar-card-title">분석 리포트</p>
                    <p className="sidebar-card-text">
                        기간별 탄소 배출 데이터를 보고서로 생성하고 관리하세요.
                    </p>
                </div>
            </aside>

            <div className="main-area">
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="menu-button" type="button">
                            ☰
                        </button>
                        <span className="topbar-title">분석 리포트</span>
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
                        <h1 className="dashboard-title">보고서 목록</h1>
                        <p className="dashboard-description">
                            생성된 탄소 배출 보고서를 확인하고 상세 내용을 조회합니다.
                        </p>
                        <div className="leaf-decoration">📊</div>
                    </section>

                    <section className="summary-grid">
                        <div className="metric-card">
                            <div className="metric-icon">📄</div>
                            <div>
                                <p className="metric-label">생성 보고서 수</p>
                                <p className="metric-value">{reports.length}건</p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">🌿</div>
                            <div>
                                <p className="metric-label">최근 보고서 배출량</p>
                                <p className="metric-value">
                                    {latestReport
                                        ? `${latestReport.totalEmission.toFixed(2)}`
                                        : "0"}
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">📅</div>
                            <div>
                                <p className="metric-label">최근 생성일</p>
                                <p className="metric-value">
                                    {latestReport
                                        ? `${latestReport.createdAt.getFullYear()}.${latestReport.createdAt.getMonth() + 1}.${latestReport.createdAt.getDate()}`
                                        : "없음"}
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
                                <h2 className="table-title">보고서 기록</h2>
                                <p className="table-description">
                                    생성된 보고서를 최신순으로 확인합니다.
                                </p>
                            </div>

                            <div className="action-row">
                                <Link href="/reports/new" className="primary-link">
                                    + 보고서 생성
                                </Link>
                            </div>
                        </div>

                        {reports.length === 0 ? (
                            <section className="empty-box">
                                <p className="table-description" style={{ marginBottom: "16px" }}>
                                    아직 생성된 보고서가 없습니다.
                                </p>

                                <Link href="/reports/new" className="primary-link">
                                    첫 보고서 생성하기
                                </Link>
                            </section>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>제목</th>
                                        <th>유형</th>
                                        <th>기간</th>
                                        <th>총 배출량</th>
                                        <th>작성자</th>
                                        <th>생성일</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {reports.map((report) => {
                                        const reportTypeText =
                                            report.reportType === "MONTHLY"
                                                ? "월간 보고서"
                                                : report.reportType === "YEARLY"
                                                    ? "연간 보고서"
                                                    : "사용자 지정 보고서";

                                        return (
                                            <tr key={report.id}>
                                                <td>
                                                    <Link
                                                        href={`/reports/${report.id}`}
                                                        style={{
                                                            color: "#15803d",
                                                            fontWeight: "bold",
                                                            textDecoration: "none",
                                                        }}
                                                    >
                                                        {report.title}
                                                    </Link>
                                                </td>
                                                <td>{reportTypeText}</td>
                                                <td>
                                                    {report.startDate.toLocaleDateString("ko-KR")} ~{" "}
                                                    {report.endDate.toLocaleDateString("ko-KR")}
                                                </td>
                                                <td>{report.totalEmission.toFixed(2)} kgCO₂e</td>
                                                <td>{report.createdBy.name}</td>
                                                <td>{report.createdAt.toLocaleDateString("ko-KR")}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}