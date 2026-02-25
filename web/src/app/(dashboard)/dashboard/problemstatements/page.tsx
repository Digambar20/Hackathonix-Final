"use client";

import { useHackathon } from "@/hooks/use-hackathon";
import { ProblemStatementCard } from "@/components/dashboard/ProblemStatementCard";
import { AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProblemStatementsPage() {
    const {
        problems, problemsLoading, status, selectedProblemId, timerPhase, canSelectProblems, selectionError, isTestingMode, eventConfig,
        selectProblem, lockProblem
    } = useHackathon();
    const [localSelectedProblemId, setLocalSelectedProblemId] = useState<string | null>(null);

    const selectionDisabled = !isTestingMode && status === "CHOOSING" && !canSelectProblems;
    const forceUnlocked = isTestingMode;
    const activeSelectedProblemId = localSelectedProblemId ?? selectedProblemId;
    const selectionStartLabel = new Date(eventConfig.problemSelectionStartAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    useEffect(() => {
        if (selectedProblemId) {
            setLocalSelectedProblemId(selectedProblemId);
        }
    }, [selectedProblemId]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-foreground">
                            Problem <span className="text-primary">Statements</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {selectionDisabled
                                ? `All problem statements are visible now. Selection opens on ${selectionStartLabel}.`
                                : status === "CHOOSING"
                                ? "Select one problem statement to begin. Once locked, it cannot be changed."
                                : status === "LOCKED"
                                    ? "Your problem statement is locked. Proceed to submit your repository."
                                    : "Problem statement locked and repo submitted."}
                        </p>
                    </div>
                    {(status === "CHOOSING" || forceUnlocked) && (
                        <div className="bg-destructive/[0.06] border border-destructive/20 px-3 py-2 rounded-lg flex items-center gap-2 text-destructive text-xs font-mono shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>
                                {forceUnlocked
                                    ? "Testing mode enabled — selection is unlocked."
                                    : timerPhase === "PRE_EVENT"
                                    ? `Selection is locked until ${selectionStartLabel}`
                                    : "Lock is permanent — choose wisely"}
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

            {selectionError && (
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/[0.06] text-destructive text-xs font-mono">
                    {selectionError}
                </div>
            )}

            {problemsLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading problem statements...</span>
                </div>
            ) : problems.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg font-bold">No problem statements available</p>
                    <p className="text-sm mt-1">Check back later or contact the organizers.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {problems.map(problem => (
                        <ProblemStatementCard
                            key={problem.id}
                            problem={problem}
                            isSelected={activeSelectedProblemId === problem.id}
                            isLocked={forceUnlocked ? false : status !== "CHOOSING"}
                            selectionDisabled={selectionDisabled}
                            selectionDisabledMessage={`Selection opens at ${selectionStartLabel}`}
                            onSelect={async (id) => {
                                setLocalSelectedProblemId(id);
                                await selectProblem(id);
                            }}
                            onLock={() => lockProblem(activeSelectedProblemId ?? undefined)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
