import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getCurrentUser } from "../../../actions/auth";
import { updateEmissionRecord } from "../../../actions/emission";

type EditEmissionPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditEmissionPage({ params }: EditEmissionPageProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    if (!firstMembership) {
        throw new Error("소속된 회사의 정보가 없습니다.")
    }

    const canManage =
        firstMembership.role === "OWNER" || firstMembership.role === "ADMIN";

    if(!canManage) {
        throw new Error("수정 권한이 없습니다.");
    }

    const { id } = await params;

    const record = await prisma.emissionRecord.findUnique({
        where: {
            id,
        },
    });

    if(!record) {
        throw new Error("배출 데이터를 찾을 수 없습니다.");
    }

    if (record.organizationId !== firstMembership.organizationId) {
        throw new Error("수정 권한이 없습니다.")
    }

    const emissionFactors = await prisma.emissionFactor.findMany({
        orderBy: {
            name: "asc",
        },
    });

    const activityDate = record.activityDate.toISOString().slice(0,10);

    return(
        <main style={{ maxWidth: "640px", margin: "60px auto", padding: "24px" }}>
            <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "8px"}}>
                배출 데이터 수정
            </h1>

            <p style={{ color: "#666", marginBottom: "24px"}}>
                등록된 배출 데이터를 수정합니다. 사용량이나 항목이 바뀌면 배출량도 다시 계산됩니다.
            </p>

            <form
                action={updateEmissionRecord}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "24px",
                }}
                >
                    <input type="hidden" name="recordId" value={record.id} />

                    <label style={{ fontWeight: "bold"}}> 배출 항목</label>
                    <select
                        name="emissionFactorId"
                        defaultValue={record.emissionFactorId}
                        required
                        style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px"}}
                    >
                        {emissionFactors.map((factor) => (
                            <option key={factor.id} value={factor.id}>
                                {factor.name} / 단위: {factor.unit} / 계수: {factor.factor}
                            </option>
                        ))}
                    </select>

                    <label style={{ fontWeight: "bold" }}>부서</label>
                    <input
                        name="department"
                        defaultValue={record.department || ""}
                        placeholder="배출이 발생한 부서를 입력하세요."
                        style={{ padding: "12px", border: "1px solid $ddd", borderRadius: "8px"}}
                    />

                    <label style={{ fontWeight: "bold" }}>사용일</label>
                    <input
                        name="activityDate"
                        type="date"
                        defaultValue={activityDate}
                        required
                        style={{ padding: "12px", border: "1px solid $ddd", borderRadius: "8px"}}
                    />

                     <label style={{ fontWeight: "bold" }}>사용량</label>
                     <input
                        name="amount"
                        type="number"
                        step="0.01"
                        defaultValue={record.amount}
                        required
                        style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                        />

                    <label style={{ fontWeight: "bold" }}>비고</label>
                    <textarea
                        name="memo"
                        defaultValue={record.memo || ""}
                        placeholder="예: 5월 사무실 전기 사용량"
                        style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        minHeight: "100px",
                        }}
                        />

        <button
            type="submit"
            style={{
             marginTop: "12px",
            padding: "14px",
            backgroundColor: "#15803d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
        }}
        >
            수정하기
        </button>
    </form>
</main>
    )
    
}