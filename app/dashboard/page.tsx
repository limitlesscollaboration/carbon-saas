import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, logout } from "../actions/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    if (!firstMembership) {
        throw new Error("소속된 회사 정보가 없습니다.");
    }

    const organization = firstMembership.organization;
    const organizationId = firstMembership.organizationId;

    const records = await prisma.emissionRecord.findMany({
        where: {
            organizationId,
        },
        include: {
            emissionFactor: true,
            createdBy: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const latestGoal = await prisma.reductionGoal.findFirst({
        where: {
            organizationId,
        },
        orderBy: {
            targetYear: "desc",
        },
    });

    const recentRecords = records.slice(0, 5);

    const totalEmission = records.reduce((sum, record) => {
        return sum + record.emissionAmount;
    }, 0);

    const goalUsageRate = latestGoal
        ? (totalEmission / latestGoal.targetEmission) * 100
        : 0;

    const remainingEmission = latestGoal
        ? latestGoal.targetEmission - totalEmission
        : 0;

    const totalRecordCount = records.length;

    const emissionByFactor = records.reduce<Record<string, number>>((acc, record) => {
        const factorName = record.emissionFactor.name;

        if (!acc[factorName]) {
            acc[factorName] = 0;
        }

        acc[factorName] += record.emissionAmount;

        return acc;
    }, {});

    const topEmissionFactor = Object.entries(emissionByFactor).sort(
        (a, b) => b[1] - a[1]
    )[0];

    const monthlyEmissions = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;

        const total = records
            .filter((record) => record.activityDate.getMonth() + 1 === month)
            .reduce((sum, record) => sum + record.emissionAmount, 0);

        return {
            month,
            total,
        };
    });

    const maxMonthlyEmission = Math.max(
        ...monthlyEmissions.map((item) => item.total),
        1
    );

    const roleText =
        firstMembership.role === "OWNER"
            ? "소유자"
            : firstMembership.role === "ADMIN"
                ? "관리자"
                : "일반 사용자";

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div>
                    <Link href="/dashboard" className="sidebar-brand">
                        <div className="sidebar-logo">🌿</div>
                        <div>
                            <p className="sidebar-title">EcoTrack</p>
                            <p className="sidebar-subtitle">대시보드</p>
                        </div>
                    </Link>

                    <nav className="sidebar-nav">
                        <Link href="/dashboard" className="sidebar-link active">
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
                        <Link href="/reports" className="sidebar-link">
                            <span>▥</span>
                            분석 리포트
                        </Link>
                    </nav>
                </div>

                <div className="sidebar-card">
                    <p className="sidebar-card-title">지속 가능한 미래</p>
                    <p className="sidebar-card-text">
                        기업의 탄소 배출 데이터를 기록하고 목표 대비 현황을 관리하세요.
                    </p>
                </div>
            </aside>

            <div className="main-area">
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="menu-button" type="button">
                            ☰
                        </button>
                        <span className="topbar-title">대시보드</span>
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
                        <h1 className="dashboard-title">탄소 관리 대시보드</h1>
                        <p className="dashboard-description">
                            {organization.name}의 탄소 배출 현황을 한눈에 확인하세요.
                        </p>
                        <div className="leaf-decoration">🌿</div>
                    </section>

                    <section className="summary-grid">
                        <div className="metric-card">
                            <div className="metric-icon">🌱</div>
                            <div>
                                <p className="metric-label">총 배출량</p>
                                <p className="metric-value">
                                    {totalEmission.toLocaleString()} kgCO₂e
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">📋</div>
                            <div>
                                <p className="metric-label">등록 데이터 수</p>
                                <p className="metric-value">{totalRecordCount}건</p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">⚡</div>
                            <div>
                                <p className="metric-label">주요 배출 항목</p>
                                <p className="metric-value">
                                    {topEmissionFactor ? topEmissionFactor[0] : "데이터 없음"}
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">🎯</div>
                            <div>
                                <p className="metric-label">목표 대비 사용률</p>
                                <p className="metric-value">
                                    {latestGoal ? `${goalUsageRate.toFixed(2)}%` : "목표 없음"}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-grid">
                        <div className="dashboard-card">
                            <h2 className="card-title">회사 및 사용자 정보</h2>

                            <div className="info-list">
                                <div className="info-row">
                                    <span className="info-label">회사명</span>
                                    <span className="info-value">{organization.name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">업종</span>
                                    <span className="info-value">
                                        {organization.industry || "미입력"}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">사용자</span>
                                    <span className="info-value">{user.name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">권한</span>
                                    <span className="info-value">{roleText}</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h2 className="card-title">감축 목표 현황</h2>

                            {latestGoal ? (
                                <div className="info-list">
                                    <div className="info-row">
                                        <span className="info-label">목표 연도</span>
                                        <span className="info-value">{latestGoal.targetYear}년</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">목표 배출량</span>
                                        <span className="info-value">
                                            {latestGoal.targetEmission.toFixed(2)} kgCO₂e
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">현재 배출량</span>
                                        <span className="info-value">
                                            {totalEmission.toFixed(2)} kgCO₂e
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">사용률</span>
                                        <span className="info-value warning-text">
                                            {goalUsageRate.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">
                                            {remainingEmission >= 0 ? "남은 배출량" : "목표 초과량"}
                                        </span>
                                        <span className="info-value warning-text">
                                            {Math.abs(remainingEmission).toFixed(2)} kgCO₂e
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">설명</span>
                                        <span className="info-value">
                                            {latestGoal.description || "-"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="dashboard-description" style={{ marginBottom: "16px" }}>
                                        현재 등록된 감축 목표가 없습니다.
                                    </p>
                                    <Link href="/goals/new" className="primary-link">
                                        감축 목표 등록하기
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="dashboard-card">
                            <h2 className="card-title">월별 배출량 추이 (kgCO₂e)</h2>

                            <div className="chart-box">
                                {monthlyEmissions.map((item) => (
                                    <div key={item.month} className="chart-item">
                                        <span className="chart-value">
                                            {item.total > 0 ? item.total.toFixed(0) : ""}
                                        </span>

                                        <div
                                            className="chart-bar"
                                            style={{
                                                height: `${Math.max(
                                                    (item.total / maxMonthlyEmission) * 100,
                                                    6
                                                )}%`,
                                            }}
                                            title={`${item.month}월: ${item.total.toFixed(2)} kgCO₂e`}
                                        />

                                        <span className="chart-label">{item.month}월</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="table-card">
                        <div className="table-header">
                            <div>
                                <h2 className="table-title">최근 배출 기록</h2>
                                <p className="table-description">
                                    최근 등록된 배출 데이터를 확인하세요.
                                </p>
                            </div>

                            <div className="action-row">
                                <Link href="/emissions/new" className="primary-link">
                                    + 배출 데이터 등록
                                </Link>

                                <Link href="/emissions" className="secondary-link">
                                    전체 기록 보기
                                </Link>
                            </div>
                        </div>

                        {recentRecords.length === 0 ? (
                            <section className="empty-box">
                                <p className="table-description" style={{ marginBottom: "16px" }}>
                                    최근 배출 데이터가 없습니다.
                                </p>

                                <Link href="/emissions/new" className="primary-link">
                                    배출 데이터 등록하기
                                </Link>
                            </section>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>사용일</th>
                                        <th>항목</th>
                                        <th>부서</th>
                                        <th>사용량</th>
                                        <th>배출량</th>
                                        <th>등록자</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentRecords.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.activityDate.toLocaleDateString("ko-KR")}</td>
                                            <td>{record.emissionFactor.name}</td>
                                            <td>{record.department || "-"}</td>
                                            <td>
                                                {record.amount.toLocaleString()} {record.unit}
                                            </td>
                                            <td>{record.emissionAmount.toFixed(2)} kgCO₂e</td>
                                            <td>{record.createdBy.name}</td>
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