import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Clock, Users, GitBranch, Shield, AlertTriangle, Trophy, BookOpen, HelpCircle, CheckCircle } from "lucide-react";

const rules = [
    { icon: Clock, title: "10-Hour Sprint", desc: "The hackathon runs for exactly 10 hours. All code must be committed before the final deadline at 5:00 PM." },
    { icon: Users, title: "Team Size", desc: "Teams must consist of 2-4 members. Each member must register with a valid email address." },
    { icon: GitBranch, title: "GitHub Mandatory", desc: "All code must be pushed to a public GitHub repository. Commit frequency is tracked and scored." },
    { icon: Shield, title: "Original Work Only", desc: "All code must be written during the hackathon. Pre-existing code, boilerplates, and templates are not allowed." },
    { icon: AlertTriangle, title: "Problem Lock-In", desc: "Once you lock your problem statement, it cannot be changed. You have a 10-minute window to finalize your choice." },
    { icon: Trophy, title: "Judging Criteria", desc: "Teams are scored on 4 criteria (25 points each): Commit Frequency, Code Quality, Problem Relevance, and Innovation." },
];

const faqs = [
    { q: "Can I use external libraries and frameworks?", a: "Yes, you can use any open-source library, framework, or API. However, the core logic must be your own." },
    { q: "What if my team has connectivity issues?", a: "Inform the admin immediately. An extension may be granted at the admin's discretion." },
    { q: "Can I change my problem statement after locking?", a: "No. Once locked, it is permanent. Use the 10-minute window wisely." },
    { q: "How is commit frequency scored?", a: "The system tracks your GitHub commits every 5 minutes. Regular, meaningful commits score higher than bulk pushes." },
    { q: "What happens if two teams pick the same problem?", a: "Multiple teams can work on the same problem statement. Judging is independent." },
    { q: "Do we need to deploy our project?", a: "A working demo is preferred but not mandatory. A clear README with setup instructions is required." },
];

export default function RulesPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Navbar />

            <section className="pt-28 pb-20 px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/[0.06] border border-primary/20 mb-6">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span className="text-xs font-mono uppercase text-primary tracking-wider">Official Rulebook</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold uppercase tracking-tighter text-balance">
                            Rules & <span className="text-primary">Guidelines</span>
                        </h1>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-sm md:text-base">
                            Read carefully before the event. Violations may lead to disqualification.
                        </p>
                    </div>

                    {/* Rules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
                        {rules.map((rule, i) => (
                            <div key={i} className="group p-6 rounded-xl border border-border bg-card/30 hover:bg-card/60 hover:border-primary/20 transition-all">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                                    <rule.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-base font-bold font-display uppercase tracking-wide mb-2 text-foreground">{rule.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{rule.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Scoring Breakdown */}
                    <div className="mb-20">
                        <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-center mb-8 text-foreground">
                            Scoring <span className="text-primary">Breakdown</span>
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Commit Frequency", pts: 25, desc: "Consistent, meaningful pushes" },
                                { label: "Code Quality", pts: 25, desc: "Clean, readable, well-structured" },
                                { label: "Problem Relevance", pts: 25, desc: "Solution fits the chosen PS" },
                                { label: "Innovation", pts: 25, desc: "Creative, unique approach" },
                            ].map((c, i) => (
                                <div key={i} className="p-5 rounded-xl border border-border bg-card/30 text-center">
                                    <div className="text-3xl md:text-4xl font-bold font-mono text-primary mb-1">{c.pts}</div>
                                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-foreground">{c.label}</div>
                                    <div className="text-xs text-muted-foreground">{c.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQs */}
                    <div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-center mb-8 text-foreground">
                            <HelpCircle className="inline w-5 h-5 text-primary mr-2 -mt-0.5" />
                            Frequently Asked <span className="text-primary">Questions</span>
                        </h2>
                        <div className="space-y-3 max-w-3xl mx-auto">
                            {faqs.map((faq, i) => (
                                <div key={i} className="p-5 rounded-xl border border-border bg-card/30">
                                    <h4 className="font-bold text-sm mb-2 flex items-start gap-2 text-foreground">
                                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                        {faq.q}
                                    </h4>
                                    <p className="text-sm text-muted-foreground pl-6">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
