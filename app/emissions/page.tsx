import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../actions/auth";
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
        <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '24px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                }}
            >
                <div>
                    <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>
                        배출 데이터 목록
                    </h1>
                    <p style={{ color: '#666' }}>
                        회사별로 등록된 탄소 배출 데이터
                    </p>
                </div>
                
                <Link
                    href="/emissions/new"
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#15803d',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                    }}
                >
                    배출 데이터 등록
                </Link>
            </div>

            <section
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                }}
            >
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                    총 배출량
                </h2>
                <p style={{ fontSize: '28px', color: '#15803d', fontWeight: 'bold' }}>
                    {totalEmissions.toFixed(2)} kgCO₂e
                </p>
            </section>

            {records.length === 0 ? (
                <p> 등록된 배출 데이터가 없습니다. </p>
            ) : (
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1px solid #ddd',
                    }}
                >
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                            <th style={thStyle}>사용일</th>
                            <th style={thStyle}>배출 항목</th>
                            <th style={thStyle}>부서</th>
                            <th style={thStyle}>사용량</th>
                            <th style={thStyle}>배출량</th>
                            <th style={thStyle}>등록자</th>
                            {canManage && <th style={thStyle}>관리</th>}
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
                                <td style={tdStyle}>
                                    {record.createdBy.name}
                                </td>

                                {canManage && (
                                    <td style={tdStyle}>
                                        <form action={deleteEmissionRecord}>
                                            <input type="hidden" name="recordId" value={record.id} />

                                            <button
                                                type="submit"
                                                style={{
                                                    padding: "6px 10px",
                                                    backgroundColor: "#dc2626",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </form>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}

const thStyle = {
    padding: '12px',
    borderBottom: '1px solid #ddd',
    textAlign: 'left' as const,
};

const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #eee',
};