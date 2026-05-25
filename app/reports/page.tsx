import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../actions/auth";

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

    return (
        <main style={{ maxWidth: "1000px", margin: "60px auto", padding: "24px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "8px" }}>
                        보고서 목록
                    </h1>

                    <p style={{ color: "#666" }}>
                        생성된 탄소 배출 보고서를 확인합니다.
                    </p>
                </div>

                <Link
                    href="/reports/new"
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#15803d",
                        color: "white",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "bold",
                    }}
                >
                    보고서 생성
                </Link>
            </div>

            {reports.length === 0 ? (
                <section
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "32px",
                        textAlign: "center",
                    }}
                >
                    <p style={{ color: "#666", marginBottom: "16px" }}>
                        아직 생성된 보고서가 없습니다.
                    </p>

                    <Link
                        href="/reports/new"
                        style={{
                            padding: "10px 16px",
                            backgroundColor: "#15803d",
                            color: "white",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "bold",
                        }}
                    >
                        보고서 생성
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
                            <th style={thStyle}>제목</th>
                            <th style={thStyle}>유형</th>
                            <th style={thStyle}>기간</th>
                            <th style={thStyle}>총 배출량</th>
                            <th style={thStyle}>작성자</th>
                            <th style={thStyle}>생성일</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reports.map((report) => (
                            <tr key={report.id}>
                                <td style={tdStyle}>
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
                                <td style={tdStyle}>
                                    {report.reportType === "MONTHLY"
                                        ? "월간 보고서"
                                        : report.reportType === "YEARLY"
                                            ? "연간 보고서"
                                            : "사용자 지정 보고서"}
                                </td>
                                <td style={tdStyle}>
                                    {report.startDate.toLocaleDateString("ko-KR")} ~{" "}
                                    {report.endDate.toLocaleDateString("ko-KR")}
                                </td>
                                <td style={tdStyle}>
                                    {report.totalEmission.toFixed(2)} kgCO₂e
                                </td>
                                <td style={tdStyle}>{report.createdBy.name}</td>
                                <td style={tdStyle}>
                                    {report.createdAt.toLocaleDateString("ko-KR")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}

const thStyle = {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "left" as const,
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee",
};