import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Hackthonix 2.0",
    description: "Team Login Portal",
};

export default function LoginPage() {
    return <LoginForm />;
}
