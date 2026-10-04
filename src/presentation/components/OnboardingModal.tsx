import React, { useState } from 'react';
import { Logo } from './Logo';
import { Sparkles, ArrowRight, User } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onSaveName: (name: string) => void;
  onLoadSamples?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onSaveName,
  onLoadSamples
}) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveName(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#18181B] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#2F2F33] text-center space-y-6">
        
        {/* Logo */}
        <div className="flex items-center justify-center pt-2">
          <Logo size={48} showText={true} />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome to Orbit 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            What should we call you?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 active-touch transition-all flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          {onLoadSamples && (
            <button
              type="button"
              onClick={() => {
                onSaveName(name.trim());
                onLoadSamples();
              }}
              className="w-full py-2.5 px-4 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Or load sample routine with 5 habits
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
