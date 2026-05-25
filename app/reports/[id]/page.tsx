import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logout } from "../../actions/auth";

type ReportDetailPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    if (!firstMembership) {
        throw new Error("소속된 회사 정보가 없습니다.");
    }

    const roleText =
    firstMembership.role === "OWNER"
      ? "소유자"
      : firstMembership.role === "ADMIN"
        ? "관리자"
        : "일반 사용자";

    const { id } = await params;

    const report = await prisma.report.findUnique({
        where: {
            id,
        },
        include: {
            organization: true,
            createdBy: true,
        },
    });

    if (!report) {
        throw new Error("보고서를 찾을 수 없습니다.");
    }

    if (report.organizationId !== firstMembership.organizationId) {
        throw new Error("보고서 조회 권한이 없습니다.");
    }

    const records = await prisma.emissionRecord.findMany({
        where: {
            organizationId: firstMembership.organizationId,
            activityDate: {
                gte: report.startDate,
                lte: report.endDate,
            },
        },
        include: {
            emissionFactor: true,
            createdBy: true,
        },
    });

    const reportTypeText =
        report.reportType === "MONTHLY"
            ? "월간 보고서"
            : report.reportType === "YEARLY"
                ? "연간 보고서"
                : "사용자 지정 보고서";

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
          <p className="sidebar-card-title">보고서 상세</p>
          <p className="sidebar-card-text">
            기간별 배출량과 포함된 배출 데이터를 상세히 확인하세요.
          </p>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-button" type="button">
              ☰
            </button>
            <span className="topbar-title">보고서 상세</span>
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
            <Link href="/reports" className="secondary-link">
              ← 보고서 목록으로
            </Link>

            <h1 className="dashboard-title" style={{ marginTop: "18px" }}>
              {report.title}
            </h1>

            <p className="dashboard-description">
              {report.organization.name}의 탄소 배출 보고서입니다.
            </p>

            <div className="leaf-decoration">📊</div>
          </section>

          <section className="summary-grid">
            <div className="metric-card">
              <div className="metric-icon">📄</div>
              <div>
                <p className="metric-label">보고서 유형</p>
                <p className="metric-value">{reportTypeText}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🌿</div>
              <div>
                <p className="metric-label">총 배출량</p>
                <p className="metric-value">
                  {report.totalEmission.toFixed(2)} kgCO₂e
                </p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📋</div>
              <div>
                <p className="metric-label">포함된 기록 수</p>
                <p className="metric-value">{records.length}건</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">👤</div>
              <div>
                <p className="metric-label">작성자</p>
                <p className="metric-value">{report.createdBy.name}</p>
              </div>
            </div>
          </section>

          <section className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="dashboard-card">
              <h2 className="card-title">보고서 정보</h2>

              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">보고서 유형</span>
                  <span className="info-value">{reportTypeText}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">기간</span>
                  <span className="info-value">
                    {report.startDate.toLocaleDateString("ko-KR")} ~{" "}
                    {report.endDate.toLocaleDateString("ko-KR")}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">생성일</span>
                  <span className="info-value">
                    {report.createdAt.toLocaleDateString("ko-KR")}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">작성자</span>
                  <span className="info-value">{report.createdBy.name}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h2 className="card-title">요약</h2>

              <p className="dashboard-description">
                {report.summary || "등록된 요약 내용이 없습니다."}
              </p>
            </div>
          </section>

          <section className="table-card">
            <div className="table-header">
              <div>
                <h2 className="table-title">포함된 배출 데이터</h2>
                <p className="table-description">
                  보고서 기간에 해당하는 배출 기록입니다.
                </p>
              </div>

              <div className="action-row">
                <Link href="/reports" className="secondary-link">
                  전체 보고서 보기
                </Link>
              </div>
            </div>

            {records.length === 0 ? (
              <section className="empty-box">
                <p className="table-description">
                  해당 기간에 포함된 배출 데이터가 없습니다.
                </p>
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
                  {records.map((record) => (
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