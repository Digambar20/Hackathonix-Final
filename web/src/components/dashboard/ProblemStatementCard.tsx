"use client";

import { Problem } from "@/hooks/use-hackathon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

interface ProblemStatementCardProps {
    problem: Problem;
    isSelected: boolean;
    isLocked: boolean;
    selectionDisabled?: boolean;
    selectionDisabledMessage?: string;
    onSelect: (id: string) => void | Promise<void>;
    onLock: () => void;
}

export function ProblemStatementCard({
    problem,
    isSelected,
    isLocked,
    selectionDisabled = false,
    selectionDisabledMessage = "Selection not available yet",
    onSelect,
    onLock,
}: ProblemStatementCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn(
                "h-full flex flex-col transition-all duration-200 border-border bg-card/50 hover:border-muted-foreground/20",
                isSelected && "border-primary/50 bg-primary/[0.04] ring-1 ring-primary/30",
                isLocked && !isSelected && "opacity-50 grayscale pointer-events-none",
                selectionDisabled && !isSelected && "opacity-80"
            )}>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                        <Badge variant="outline" className={cn(
                            "font-mono text-[10px] uppercase",
                            problem.difficulty === "Hard" ? "border-destructive/50 text-destructive" :
                                problem.difficulty === "Medium" ? "border-yellow-500/50 text-yellow-500" :
                                    "border-neon-green/50 text-neon-green"
                        )}>
                            {problem.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px]">{problem.category}</Badge>
                    </div>
                    <CardTitle className="text-base font-display leading-tight mt-2 h-12 line-clamp-2 text-foreground">
                        {problem.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {problem.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {problem.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border">
                    {isLocked ? (
                        isSelected ? (
                            <Button className="w-full bg-neon-green/10 text-neon-green hover:bg-neon-green/15 border border-neon-green/30 cursor-default" variant="outline">
                                <Lock className="w-4 h-4 mr-2" /> LOCKED & ACTIVE
                            </Button>
                        ) : (
                            <Button variant="ghost" disabled className="w-full text-muted-foreground">Locked</Button>
                        )
                    ) : selectionDisabled ? (
                        <Button variant="outline" disabled className="w-full border-border text-muted-foreground cursor-not-allowed">
                            {selectionDisabledMessage}
                        </Button>
                    ) : (
                        isSelected ? (
                            <Button className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90" onClick={onLock}>
                                <Lock className="w-4 h-4 mr-2" /> CONFIRM LOCK
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full border-border hover:bg-muted hover:text-primary hover:border-primary/30" onClick={() => onSelect(problem.id)}>
                                SELECT
                            </Button>
                        )
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
