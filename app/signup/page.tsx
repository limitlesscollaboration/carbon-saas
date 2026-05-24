import {signup} from "../actions/auth";

export default function SignupPage() {
    return (
        <main style ={{ maxWidth: "420px", margin: "88px auto", padding: "24px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
                회원가입
            </h1>

            <p style={{ color: "#666", marginBottom: "24px" }}>
                계정과 회사를 함께 생성합니다.
            </p>

            <form action={signup} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                    name = "name"
                    placeholder="이름"
                    required
                    style={{ padding: "12px", border: "1px solid #bbb", borderRadius: "8px" }}
                />

                <input
                    name = "email"
                    type="email"
                    placeholder="이메일"
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <input
                    name = "password"
                    type="password"
                    placeholder="비밀번호"
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <input
                    name = "organizationName"
                    placeholder="회사명"
                    required
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <input
                    name = "industry"
                    placeholder="업종"
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                />

                <button
                    type="submit"
                    style={{
                        padding: "12px",
                        backgroundColor: "#15803d",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    회원가입
                </button>
            </form>
        </main>
        );
    }