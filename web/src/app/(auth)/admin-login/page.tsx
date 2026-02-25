import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Login | Hackthonix 2.0",
    description: "Admin Access Portal",
};

export default function AdminLoginPage() {
    return <AdminLoginForm />;
}
