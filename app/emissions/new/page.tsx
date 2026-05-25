import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getCurrentUser } from "../../actions/auth";
import { createEmissionRecord } from "../../actions/emission";

export default async function NewEmissionPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const emissionFactors = await prisma.emissionFactor.findMany({
        orderBy: {
            name: "asc",
    },
    });

    const today = new Date().toISOString().slice(0, 10);

   return (
    <main className="form-container">
      <section className="hero">
        <h1 className="dashboard-title">배출 데이터 등록</h1>

        <p className="dashboard-description">
          배출 데이터의 사용량을 입력하면 탄소 배출량이 자동 계산됩니다.
        </p>

        <div className="leaf-decoration">🌱</div>
      </section>

      <form action={createEmissionRecord} className="form-card">
        <label className="form-label">배출 항목</label>
        <select name="emissionFactorId" required className="form-select">
          <option value="">배출 항목을 선택하세요</option>

          {emissionFactors.map((factor) => (
            <option key={factor.id} value={factor.id}>
              {factor.name} / 단위: {factor.unit} / 계수: {factor.factor}
            </option>
          ))}
        </select>

        <label className="form-label">부서</label>
        <input
          name="department"
          placeholder="배출이 발생한 부서를 입력하세요"
          required
          className="form-input"
        />

        <label className="form-label">사용일</label>
        <input
          name="activityDate"
          type="date"
          defaultValue={today}
          required
          className="form-input"
        />

        <label className="form-label">사용량</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="사용량을 입력하세요"
          required
          className="form-input"
        />

        <label className="form-label">비고</label>
        <textarea
          name="memo"
          placeholder="추가로 남기고 싶은 내용을 입력하세요 (선택)"
          className="form-textarea"
        />

        <button type="submit" className="primary-button">
          등록하기
        </button>
      </form>
    </main>
  );
}