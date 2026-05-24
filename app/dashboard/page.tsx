import { redirect } from "next/navigation";
import { getCurrentUser, logout } from "../actions/auth";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const firstMembership = user.memberships[0];

    return (
        <main style={{ maxWidth: "900px", margin: "60px auto", padding: "24px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
                탄소 관리 대시보드
            </h1>

            <p style={{ color: "#666", marginBottom: "24px" }}>
                로그인한 사용자와 회사 정보를 확인할 수 있습니다.
            </p>

            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "20px",
                }}
            >
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>
                    사용자 정보
                </h2>

                <p>이름: {user.name}</p>
                <p>이메일: {user.email}</p>
            </section>

            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "20px",
                }}
            >
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>
                    회사 정보
                </h2>

                {firstMembership ? (
                    <>
                        <p> 회사명: {firstMembership.organization.name}</p>
                        <p> 업종: {firstMembership.organization.industry || "미입력"}</p>
                        <p> 권한: {firstMembership.role}</p>
                    </>
                ) : (
                    <p> 무소속 입니다 </p>
                )}
            </section>

            <form action={logout}>
                <button
                    type="submit"
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    로그아웃
                </button>
            </form>
        </main>
    );
}