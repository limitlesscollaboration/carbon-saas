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
    });

    const recentRecords = records.slice(0, 5);

    const totalEmission = records.reduce((sum, record) => {
        return sum + record.emissionAmount;
    }, 0);

    const totalRecordCount = records.length;

    const emissionByFactor =  records.reduce<Record<string, number>>((acc, record) => {
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

    return (
        <main style={{ maxWidth: "1100px", margin: "60px auto", padding: "24px" }}>
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "32px",
                    gap: "16px",
                }}
            >
                <div>
                    <p style={{ color: "#15803d", fontWeight: "bold", marginBottom: "8px" }}>
                        carbon Saas Dashboard
                    </p>

                    <h1 style={{ fontSize: "34px", fontWeight: "bold", marginBottom: "8px" }}>
                        탄소 관리 대시보드
                    </h1>

                    <p style={{ color: "#666" }}>
                        {organization.name}의 탄소 배출 현황을 한눈에 확인하세요.
                    </p>
                </div>

                <form action={logout}>
                    <button
                        type="submit"
                        style={{
                            padding: "10px 16px",
                            backgroundColor: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        로그아웃
                    </button>
                </form>
            </header>

            <section
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "16px",
                    marginBottom: "32px",
                }}
            >
                <div style = {cardStyle}>
                    <p style = {cardLabelStyle}>총 배출량</p>
                    <p style = {cardValueStyle}>{totalEmission.toFixed(2)} kgCO₂e</p>
                </div>

                <div style = {cardStyle}>
                    <p style = {cardLabelStyle}>등록 데이터 수</p>
                    <p style = {cardValueStyle}>{totalRecordCount} 건</p>
                </div>

                <div style = {cardStyle}>
                    <p style = {cardLabelStyle}>주요 배출 항목</p>
                    <p style = {cardValueStyle}>
                        {topEmissionFactor ? topEmissionFactor[0] : "데이터 없음"}
                    </p>
                </div>
            </section>

            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "32px",
                }}
            >
                
                <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
                    회사 및 사용자 정보
                </h2>

                <div style = {{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <p> 회사명: {organization.name}</p>
                    <p> 업종: {organization.industry || "미입력"}</p>
                    <p> 사용자: {user.name}</p>
                    <p> 권한: {firstMembership?.role}</p>
                </div>
            </section>

            <section
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                <div>
                    <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "6px" }}>
                        최근 배출 기록
                    </h2>
                    <p style={{ color: "#666" }}>
                        최근 등록된 5건의 배출 기록을 확인하세요.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                        href="/emissions/new" style={primaryLinkStyle}>
                            배출 데이터 등록
                        </Link>

                    <Link href="/emissions" style={secondaryLinkStyle}>
                        전체 기록 보기
                    </Link>
                </div>
            </section>

            {recentRecords.length === 0 ? (
                <section
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "32px",
                        textAlign: "center",
                    }}
                >
                    <p style={{ color: "#666", marginBottom: "16px" }}>
                        최근 배출 데이터가 없습니다.
                    </p>

                    <Link href="/emissions/new" style={primaryLinkStyle}>
                        배출 데이터 등록하기
                    </Link>
                </section>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: "1px solid #ddd",
                    }}
                >
                    <thead>
                        <tr style={{ backgroundColor: "#f9fafb" }}>
                            <th style={thStyle}> 사용일 </th>
                            <th style={thStyle}> 항목   </th>
                            <th style={thStyle}> 부서   </th>
                            <th style={thStyle}> 사용량 </th>
                            <th style={thStyle}> 배출량 </th>
                            <th style={thStyle}> 등록자 </th>
                        </tr>
                    </thead>

                    <tbody>
                        {recentRecords.map((record) => (
                            <tr key={record.id}>
                                <td style={tdStyle}>
                                    {record.activityDate.toLocaleDateString("ko-KR")}
                                </td>
                                <td style={tdStyle}>{record.emissionFactor.name}</td>
                                <td style={tdStyle}>{record.department || "-"}</td>
                                <td style={tdStyle}>
                                    {record.amount} {record.unit}
                                </td>
                                <td style={tdStyle}>
                                    {record.emissionAmount.toFixed(2)} kgCO₂e
                                </td>
                                <td style={tdStyle}>{record.createdBy.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}

const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "20px",
    backgroundColor: "#fff",
};

const cardLabelStyle = {
    color: "#666",
    fontSize: "14px",
    marginBottom: "8px",
};

const cardValueStyle = {
    fontSize: "26px",
    fontWeight: "bold",
};

const primaryLinkStyle = {
    padding: "10px 16px",
    backgroundColor: "#15803d",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
};

const secondaryLinkStyle = {
    padding: "10px 16px",
    backgroundColor: "#15803d",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
};

const thStyle = {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "left" as const,
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee",
};