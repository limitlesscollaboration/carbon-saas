import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../../actions/auth";

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
        <main style={{ maxWidth: "1000px", margin: "60px auto", padding: "24px" }}>
            <div style={{ marginBottom: "24px" }}>
                <Link
                    href="/reports"
                    style={{
                        color: "#15803d",
                        textDecoration: "none",
                        fontWeight: "bold",
                    }}
                >
                    ← 보고서 목록으로
                </Link>
            </div>

            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "24px",
                }}
            >
                <p style={{ color: "#15803d", fontWeight: "bold", marginBottom: "8px" }}>
                    Carbon Emission Report
                </p>

                <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "12px" }}>
                    {report.title}
                </h1>

                <p style={{ color: "#666", marginBottom: "24px" }}>
                    {report.organization.name}의 탄소 배출 보고서입니다.
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                    }}
                >
                    <p>보고서 유형: {reportTypeText}</p>
                    <p>작성자: {report.createdBy.name}</p>
                    <p>
                        기간: {report.startDate.toLocaleDateString("ko-KR")} ~{" "}
                        {report.endDate.toLocaleDateString("ko-KR")}
                    </p>
                    <p>생성일: {report.createdAt.toLocaleDateString("ko-KR")}</p>
                    <p>총 배출량: {report.totalEmission.toFixed(2)} kgCO₂e</p>
                    <p>포함된 기록 수: {records.length}건</p>
                </div>

                {report.summary && (
                    <div
                        style={{
                            marginTop: "24px",
                            padding: "16px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                        }}
                    >
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>
                            요약
                        </h2>
                        <p>{report.summary}</p>
                    </div>
                )}
            </section>

            <section>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
                    포함된 배출 데이터
                </h2>

                <p style={{ color: "#666", marginBottom: "16px" }}>
                    보고서 기간에 해당하는 배출 기록입니다.
                </p>

                {records.length === 0 ? (
                    <section
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            padding: "32px",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ color: "#666" }}>
                            해당 기간에 포함된 배출 데이터가 없습니다.
                        </p>
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
                                <th style={thStyle}>사용일</th>
                                <th style={thStyle}>항목</th>
                                <th style={thStyle}>부서</th>
                                <th style={thStyle}>사용량</th>
                                <th style={thStyle}>배출량</th>
                                <th style={thStyle}>등록자</th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.map((record) => (
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
            </section>
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