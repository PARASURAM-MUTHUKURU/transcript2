import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn("skeleton h-4 w-full", className)} />
    );
}

export function AgentSkeleton() {
    return (
        <div className="p-4 border-b border-brand-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-24 h-3" />
                </div>
            </div>
            <Skeleton className="w-12 h-6 rounded-full" />
        </div>
    );
}

export function AuditSkeleton() {
    return (
        <div className="p-4 border-b border-brand-border/30">
            <div className="flex justify-between items-start mb-2">
                <div className="space-y-2">
                    <Skeleton className="w-48 h-5" />
                    <Skeleton className="w-32 h-3" />
                </div>
                <Skeleton className="w-16 h-8 rounded-lg" />
            </div>
            <div className="flex gap-2 mt-4">
                <Skeleton className="w-20 h-4 rounded-full" />
                <Skeleton className="w-20 h-4 rounded-full" />
                <Skeleton className="w-20 h-4 rounded-full" />
            </div>
        </div>
    );
}
