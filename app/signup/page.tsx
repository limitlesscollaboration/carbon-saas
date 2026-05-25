import Link from "next/link";
import { signup } from "../actions/auth";

export default function SignupPage() {
    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-logo">🌿</div>

                <h1 className="auth-title">회원가입</h1>

                <p className="auth-description">
                    계정과 회사를 함께 생성하고, EcoTrack에서 탄소 배출 데이터를 관리하세요.
                </p>

                <form action={signup} className="form-card">
                    <label className="form-label">이름</label>
                    <input
                        name="name"
                        placeholder="이름을 입력하세요"
                        required
                        className="form-input"
                    />

                    <label className="form-label">이메일</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        required
                        className="form-input"
                    />

                    <label className="form-label">비밀번호</label>
                    <input
                        name="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        required
                        className="form-input"
                    />

                    <label className="form-label">회사명</label>
                    <input
                        name="organizationName"
                        placeholder="회사명을 입력하세요"
                        required
                        className="form-input"
                    />

                    <label className="form-label">업종</label>
                    <input
                        name="industry"
                        placeholder="예: 철강, 제조, 물류"
                        className="form-input"
                    />

                    <button type="submit" className="primary-button">
                        회원가입
                    </button>
                </form>

                <p className="auth-link-row">
                    이미 계정이 있나요?{" "}
                    <Link href="/login" className="auth-link">
                        로그인
                    </Link>
                </p>
            </section>
        </main>
    );
}