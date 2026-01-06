import React from 'react';
import { useAnimatorStore } from '../../store/animatorStore';

export const BannerAd: React.FC = () => {
    return (
        <div className="w-full flex justify-center py-4 bg-[#0F172A] border-t border-slate-700/50">
            <div className="w-[728px] h-[90px] bg-slate-800 border border-slate-700 rounded flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
                {/* Visual Flair */}
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold z-10">Advertisement</span>
                <span className="text-slate-600 text-[10px] mt-1 z-10">728x90 Banner Placeholder</span>

                {/* Decor */}
                <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                </div>
            </div>
        </div>
    );
};

export const InterstitialAd: React.FC = () => {
    const { isInterstitialOpen, setIsInterstitialOpen } = useAnimatorStore();

    if (!isInterstitialOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-4xl aspect-video bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-2xl shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                <button
                    onClick={() => setIsInterstitialOpen(false)}
                    className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur"
                >
                    Skip Ad in 5s
                </button>

                <div className="text-center z-10 space-y-4 p-12">
                    <span className="text-sky-500 text-sm uppercase tracking-[0.3em] font-bold">Sponsored Content</span>
                    <h2 className="text-5xl font-black text-white tracking-tight">
                        Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400">Pro Features</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Unlock unlimited exports, 4K rendering, and premium templates with Kinetix Pro.
                    </p>

                    <div className="pt-8">
                        <button className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
                            Learn More
                        </button>
                    </div>
                </div>

                {/* Background FX */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 header-texture" />
                <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-sky-600/20 rounded-full blur-[120px]" />
                <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>
            <div className="mt-8 text-slate-500 text-sm">
                Advertisement • <button onClick={() => setIsInterstitialOpen(false)} className="hover:text-white underline">Close for now</button>
            </div>
        </div>
    );
};
