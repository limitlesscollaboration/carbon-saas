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

    if (!canManage) {
        throw new Error("수정 권한이 없습니다.");
    }

    const { id } = await params;

    const record = await prisma.emissionRecord.findUnique({
        where: {
            id,
        },
    });

    if (!record) {
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

    const activityDate = record.activityDate.toISOString().slice(0, 10);

    return (
        <main className="form-container">
            <section className="hero">
                <h1 className="dashboard-title">배출 데이터 수정</h1>

                <p className="dashboard-description">
                    등록된 배출 데이터를 수정합니다. 사용량이나 항목이 바뀌면 배출량도 다시 계산됩니다.
                </p>

                <div className="leaf-decoration">🌱</div>
            </section>

            <form action={updateEmissionRecord} className="form-card">
                <input type="hidden" name="recordId" value={record.id} />

                <label className="form-label">배출 항목</label>
                <select
                    name="emissionFactorId"
                    defaultValue={record.emissionFactorId}
                    required
                    className="form-select"
                >
                    {emissionFactors.map((factor) => (
                        <option key={factor.id} value={factor.id}>
                            {factor.name} / 단위: {factor.unit} / 계수: {factor.factor}
                        </option>
                    ))}
                </select>

                <label className="form-label">부서</label>
                <input
                    name="department"
                    defaultValue={record.department || ""}
                    placeholder="배출이 발생한 부서를 입력하세요."
                    className="form-input"
                />

                <label className="form-label">사용일</label>
                <input
                    name="activityDate"
                    type="date"
                    defaultValue={activityDate}
                    required
                    className="form-input"
                />

                <label className="form-label">사용량</label>
                <input
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={record.amount}
                    required
                    className="form-input"
                />

                <label className="form-label">비고</label>
                <textarea
                    name="memo"
                    defaultValue={record.memo || ""}
                    placeholder="예: 5월 사무실 전기 사용량"
                    className="form-textarea"
                />

                <button type="submit" className="primary-button">
                    수정하기
                </button>
            </form>
        </main>
    );
}