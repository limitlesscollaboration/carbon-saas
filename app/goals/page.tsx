import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../actions/auth";
import { prisma } from "@/lib/prisma";

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

    const goals = await prisma.reductionGoal.findMany({
        where: {
            organizationId,
        },
        orderBy: {
            targetYear: "desc",
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
                    감축 목표 목록
                </h1>
                
                <p style={{ color: "#666" }}>
                    감축 목표 목록
                </p>
            </div>

            <Link
                href="/goals/new"
                style={{
                    padding: "10px 16px",
                    backgroundColor: "#15803d",
                    color: "white",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "bold",
                }}
            >
                목표 등록
            </Link>
        </div>

        {goals.length === 0 ? (
            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "24px",
                    textAlign: "center",
                }}
            >
                <p style={{ color: "#666" , marginBottom: "16px" }}>
                    등록된 감축 목표가 없습니다.
                </p>

                <Link
                    href="/goals/new"
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#15803d",
                        color: "white",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "bold",
                    }}
                >
                    목표 등록
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
                        <th style={thStyle}>목표 연도</th>
                        <th style={thStyle}>목표 배출량 (톤)</th>
                        <th style={thStyle}>기준 연도</th>
                        <th style={thStyle}>기준 배출량 (톤)</th>
                        <th style={thStyle}>설명</th>
                    </tr>
                </thead>

                <tbody>
                    {goals.map((goal) => (
                        <tr key={goal.id}>
                            <td style={tdStyle}>{goal.targetYear}</td>
                            <td style={tdStyle}>{goal.targetEmission.toFixed(2)} kgCO₂e</td>
                            <td style={tdStyle}>{goal.baseYear || "-"}</td>
                            <td style={tdStyle}>{goal.baseEmission ? goal.baseEmission.toFixed(2) + " kgCO₂e" : "-"}</td>
                            <td style={tdStyle}>{goal.description || "-"}</td>
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