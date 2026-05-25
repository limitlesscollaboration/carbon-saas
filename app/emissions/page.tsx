import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, logout } from "../actions/auth";
import { prisma } from "@/lib/prisma";
import { deleteEmissionRecord } from "../actions/emission";

export default async function EmissionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
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

  const records = await prisma.emissionRecord.findMany({
    where: {
      organizationId,
    },
    include: {
      emissionFactor: true,
      createdBy: true,
    },
    orderBy: {
      activityDate: "desc",
    },
  });

  const totalEmissions = records.reduce((sum, record) => {
    return sum + record.emissionAmount;
  }, 0);

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

            <Link href="/emissions" className="sidebar-link active">
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
          <p className="sidebar-card-title">배출 데이터 관리</p>
          <p className="sidebar-card-text">
            전기, 도시가스, 연료 사용량을 등록하고 탄소 배출량을 관리하세요.
          </p>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-button" type="button">
              ☰
            </button>
            <span className="topbar-title">배출 데이터</span>
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
            <h1 className="dashboard-title">배출 데이터 목록</h1>
            <p className="dashboard-description">
              회사별로 등록된 탄소 배출 데이터를 확인하고 관리합니다.
            </p>
            <div className="leaf-decoration">🌱</div>
          </section>

          <section className="summary-grid">
            <div className="metric-card">
              <div className="metric-icon">🌿</div>
              <div>
                <p className="metric-label">총 배출량</p>
                <p className="metric-value">
                  {totalEmissions.toFixed(2)} kgCO₂e
                </p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📋</div>
              <div>
                <p className="metric-label">등록 데이터 수</p>
                <p className="metric-value">{records.length}건</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🔐</div>
              <div>
                <p className="metric-label">관리 권한</p>
                <p className="metric-value">
                  {canManage ? "가능" : "조회만"}
                </p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🏢</div>
              <div>
                <p className="metric-label">현재 권한</p>
                <p className="metric-value">
                  {firstMembership.role === "OWNER"
                    ? "소유자"
                    : firstMembership.role === "ADMIN"
                      ? "관리자"
                      : "일반 사용자"}
                </p>
              </div>
            </div>
          </section>

          <section className="table-card">
            <div className="table-header">
              <div>
                <h2 className="table-title">배출 기록</h2>
                <p className="table-description">
                  등록된 배출 데이터를 최신순으로 확인합니다.
                </p>
              </div>

              <div className="action-row">
                <Link href="/emissions/new" className="primary-link">
                  + 배출 데이터 등록
                </Link>
              </div>
            </div>

            {records.length === 0 ? (
              <section className="empty-box">
                <p className="table-description" style={{ marginBottom: "16px" }}>
                  등록된 배출 데이터가 없습니다.
                </p>

                <Link href="/emissions/new" className="primary-link">
                  첫 배출 데이터 등록하기
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
                    {canManage && <th>관리</th>}
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

                      {canManage && (
                        <td>
                          <div className="action-row">
                            <Link
                              href={`/emissions/${record.id}/edit`}
                              className="edit-link"
                            >
                              수정
                            </Link>

                            <form action={deleteEmissionRecord}>
                              <input
                                type="hidden"
                                name="recordId"
                                value={record.id}
                              />

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