import {login} from "../actions/auth";

export default function LoginPage() {
    return (
        <main style={{ maxWidth: "420px", margin: "80px auto", padding: "24px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
                로그인
            </h1>

                <form
                action={login}
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                    <input
                        name="email"
                        type="email"
                        placeholder="이메일"
                        required
                        style={{
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                        }}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="비밀번호"
                        required
                        style={{
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            padding: "12px",
                            backgroundColor: "#111827",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        로그인
                    </button>
                </form>
            </main>
    );
}