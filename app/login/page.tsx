import Link from "next/link";
import {login} from "../actions/auth";

export default function LoginPage() {
     return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">🌿</div>

        <h1 className="auth-title">로그인</h1>

        <p className="auth-description">
          EcoTrack에 로그인하여 회사의 탄소 배출 현황을 관리하세요.
        </p>

        <form action={login} className="form-card">
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

          <button type="submit" className="primary-button">
            로그인
          </button>
        </form>

        <p className="auth-link-row">
          아직 계정이 없나요?{" "}
          <Link href="/signup" className="auth-link">
            회원가입
          </Link>
        </p>
      </section>
    </main>
  );
}