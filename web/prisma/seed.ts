import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/hackathonix?schema=public";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const problemStatements = [
    { title: "Decentralized Identity Verification", category: "Web3", difficulty: "HARD", description: "Build a privacy-preserving identity system using ZK-proofs for secure, decentralized authentication.", tags: '["Blockchain","ZK-Rollups","Identity"]' },
    { title: "AI-Powered Code Reviewer", category: "AI/ML", difficulty: "MEDIUM", description: "An intelligent agent that reviews pull requests, detects bugs, and suggests optimizations using LLMs.", tags: '["LLM","DevTools","NLP"]' },
    { title: "Smart City Traffic Management", category: "IoT", difficulty: "HARD", description: "Optimize urban traffic flow using real-time sensor data, AI predictions, and smart signal control.", tags: '["IoT","Data Science","Smart City"]' },
    { title: "Sustainable Supply Chain Tracker", category: "FinTech", difficulty: "MEDIUM", description: "Track and visualize carbon footprint across supply chains using blockchain-based transparency.", tags: '["Sustainability","Supply Chain","GreenTech"]' },
    { title: "AR-Based Education Platform", category: "AR/VR", difficulty: "MEDIUM", description: "Create interactive 3D learning experiences using Augmented Reality for STEM education.", tags: '["AR","EdTech","3D"]' },
    { title: "Predictive Healthcare Analytics", category: "HealthTech", difficulty: "HARD", description: "Predict patient readmission risks and optimize hospital resource allocation using ML models.", tags: '["Healthcare","ML","Predictive Analytics"]' },
    { title: "Real-Time Language Translator", category: "AI/ML", difficulty: "MEDIUM", description: "Build a real-time speech-to-speech translation system supporting Indian regional languages.", tags: '["NLP","Speech","Translation"]' },
    { title: "Decentralized Voting System", category: "Web3", difficulty: "HARD", description: "A tamper-proof, transparent electronic voting platform using blockchain smart contracts.", tags: '["Blockchain","Governance","Security"]' },
    { title: "Mental Health Companion Bot", category: "HealthTech", difficulty: "EASY", description: "An empathetic AI chatbot that provides mental health support, mood tracking, and CBT exercises.", tags: '["Chatbot","Mental Health","AI"]' },
    { title: "Smart Waste Management", category: "IoT", difficulty: "EASY", description: "IoT-based waste bin monitoring system with route optimization for collection vehicles.", tags: '["IoT","Sustainability","Routing"]' },
    { title: "Freelancer Payment Gateway", category: "FinTech", difficulty: "MEDIUM", description: "A milestone-based escrow payment system for freelancers with dispute resolution.", tags: '["Payments","Escrow","FinTech"]' },
    { title: "Campus Security Dashboard", category: "CyberSec", difficulty: "HARD", description: "Real-time network monitoring dashboard for campus IT infrastructure with threat detection.", tags: '["Cybersecurity","Monitoring","Dashboard"]' },
];

function makeId(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
}

async function main() {
    console.log("Seeding database...");

    for (const ps of problemStatements) {
        await prisma.problemStatement.upsert({
            where: { id: makeId(ps.title) },
            update: {},
            create: { id: makeId(ps.title), ...ps },
        });
    }
    console.log(`Seeded ${problemStatements.length} problem statements`);

    const hashedAdmin = await bcrypt.hash("admin123", 10);
    await prisma.user.upsert({
        where: { email: "admin@hackthonix.in" },
        update: {},
        create: { name: "Admin", email: "admin@hackthonix.in", password: hashedAdmin, role: "ADMIN" },
    });
    console.log("Created admin user (admin@hackthonix.in / admin123)");

    const hashedJudge = await bcrypt.hash("judge123", 10);
    await prisma.user.upsert({
        where: { email: "judge@hackthonix.in" },
        update: {},
        create: { name: "Judge 1", email: "judge@hackthonix.in", password: hashedJudge, role: "JUDGE" },
    });
    console.log("Created judge user (judge@hackthonix.in / judge123)");

    console.log("Seeding complete!");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
