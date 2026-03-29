import React from 'react';

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-10 w-full gap-6">
            <div className="relative w-16 h-16">
                {/* Outer glowing ring container */}
                <div className="absolute inset-0 rounded-full border-[2px] border-[rgba(212,176,91,0.15)] shadow-[inset_0_0_15px_rgba(212,176,91,0.1),0_0_15px_rgba(212,176,91,0.1)]"></div>

                {/* Fast spinning quarter ring */}
                <div
                    className="absolute inset-0 rounded-full border-[2px] border-t-[rgb(212,176,91)] border-r-[rgb(212,176,91)] border-b-transparent border-l-transparent animate-spin"
                    style={{ animationDuration: '0.8s' }}
                ></div>

                {/* Opposite slow spinning ring */}
                <div
                    className="absolute inset-[4px] rounded-full border-[2px] border-b-[rgba(212,176,91,0.6)] border-l-[rgba(212,176,91,0.6)] border-t-transparent border-r-transparent animate-spin"
                    style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
                ></div>

                {/* Center glowing dot */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[rgb(212,176,91)] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_rgb(212,176,91)] animate-pulse">
                    <div className="absolute inset-0 rounded-full bg-[rgb(212,176,91)] animate-ping blur-[1px]"></div>
                </div>
            </div>

            {text && (
                <span className="text-[rgb(212,176,91)] text-[0.65rem] md:text-xs font-bold tracking-[0.25em] uppercase animate-pulse drop-shadow-[0_0_8px_rgba(212,176,91,0.4)]">
                    {text}
                </span>
            )}
        </div>
    );
};

export default Loader;
