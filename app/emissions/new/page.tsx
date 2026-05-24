import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getCurrentUser } from "../../actions/auth";
import { createEmissionRecord } from "../../actions/emission";

export default async function NewEmissionPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const emisionFactors = await prisma.emissionFactor.findMany({
        orderBy: {
            name: "asc",
    },
    });

    const today = new Date().toISOString().slice(0, 10);

    return (
        <main style={{ maxWidth: '640px', margin: '60px auto', padding: '24px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>
                배출 데이터 등록
            </h1>

            <p style={{ color: '#666', marginBottom: '24px' }}>
                배출 데이터의 사용량을 입력하면 탄소 배출량이 자동 계산됩니다.
            </p>

            <form
                action={ createEmissionRecord }
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '12px',
                    padding: '24px',
                }}
            >
                <label style = {{ fontWeight: 'bold' }}>
                    배출 항목
                </label>
                <select
                    name="emissionFactorId"
                    required
                    style={{ padding: "12px", border: '1px solid #ddd', borderRadius: '8px' }}
                >
                    <option value="">배출 항목을 선택하세요</option>
                    {emisionFactors.map((factor) => (
                        <option key={factor.id} value={factor.id}>
                            {factor.name} / 단위: {factor.unit} / 계수 : {factor.factor}
                        </option>
                    ))}
                </select>

                <label style = {{ fontWeight: 'bold' }}>
                    부서
                </label>
                <input
                    name="department"
                    placeholder="배출이 발생한 부서를 입력하세요"
                    required
                    style={{ padding: "12px", border: '1px solid #ddd', borderRadius: '8px' }}
                /> 

                <label style = {{ fontWeight: 'bold' }}>
                    사용일
                </label>
                <input
                    name="activityDate"
                    type="date"
                    defaultValue={today}
                    required
                    style={{ padding: "12px", border: '1px solid #ddd', borderRadius: '8px' }}
                />

                <label style = {{ fontWeight: 'bold' }}>
                    사용량
                </label>
                <input
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="사용량을 입력하세요"
                    required
                    style={{ padding: "12px", border: '1px solid #ddd', borderRadius: '8px' }}
                />

                <label style = {{ fontWeight: 'bold' }}>
                    비고
                </label>
                <textarea                    name="notes"
                    placeholder="추가로 남기고 싶은 내용을 입력하세요 (선택)"
                    style={{
                        padding: "12px",
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        minHeight: '100px',
                    }}
                />

                <button
                    type="submit"
                    style={{
                        marginTop: '12px',
                        padding: '14px',
                        backgroundColor: '#15803d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    등록하기
                </button>
            </form>
        </main>
    ); 
}
