import React from 'react';

const EventCardSkeleton = ({ compact = false }) => {
    return (
        <div className={`group relative bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden animate-pulse ${compact ? 'w-full' : ''}`}>
            {/* Poster Image Skeleton */}
            <div className="relative aspect-[4/5] bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                {/* Category Badge Skeleton */}
                <div className="absolute top-4 left-4">
                    <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
                </div>

                {/* Date Badge Skeleton */}
                <div className="absolute top-4 right-4 bg-slate-950/80 p-2 rounded-2xl flex flex-col items-center min-w-[50px] h-12 w-12 border border-white/5">
                    <div className="h-4 w-6 bg-slate-700 rounded mt-1"></div>
                    <div className="h-2 w-8 bg-slate-700 rounded mt-2"></div>
                </div>

                {/* Seats Status Skeleton */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-6 w-24 bg-slate-700/50 rounded-full border border-slate-600/50"></div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="p-6">
                {/* Title */}
                <div className="h-6 w-3/4 bg-slate-800 rounded mb-4"></div>

                {/* Meta Info */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-red-600/50 rounded"></div>
                        <div className="h-3 w-32 bg-slate-800 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-red-600/50 rounded"></div>
                        <div className="h-3 w-40 bg-slate-800 rounded"></div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="h-12 w-full bg-slate-800 rounded-2xl border border-white/5"></div>
            </div>
        </div>
    );
};

export default EventCardSkeleton;
