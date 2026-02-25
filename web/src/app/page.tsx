import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Schedule } from "@/components/landing/Schedule";
import { ProblemTeaser } from "@/components/landing/ProblemTeaser";
import { Sponsors } from "@/components/landing/Sponsors";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-black">
      <Navbar />
      <Hero />
      <About />
      <Schedule />
      <ProblemTeaser />
      <Sponsors />
      <Footer />
    </main>
  );
}
