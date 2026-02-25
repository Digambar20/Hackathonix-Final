import { RegisterForm } from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register | Hackthonix 2.0",
    description: "Team Registration Portal",
};

export default function RegisterPage() {
    return <RegisterForm />;
}
