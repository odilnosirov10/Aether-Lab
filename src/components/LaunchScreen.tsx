import React, { useState } from "react";
import { ADVISOR_PERSONAS } from "../data/personas";
import { AdvisorPersona } from "../types";
import { Sparkles, Terminal, Compass, Zap, Flame, Cpu } from "lucide-react";

interface LaunchScreenProps {
  onGenerate: (projectIdea: string, persona: AdvisorPersona) => void;
  isLoading: boolean;
}

const SAMPLE_PROJECTS = [
  {
    title: "Meditation App & Synth",
    desc: "An offline breathing timer with an interactive visualizer and synthesizer",
    idea: "A single-screen offline meditation timer with a responsive SVG canvas breathing guide that translates into low-frequency ambient synthesizer loops.",
  },
  {
    title: "AI Study Planner",
    desc: "A personalized Pomodoro dashboard with visual bento progress elements",
    idea: "A high-fidelity studying canvas grouping customizable Pomodoro sprint blocks with interactive local stats, visual achievement cards, and drag-and-drop notes.",
  },
  {
    title: "Interactive Sandbox",
    desc: "A modern CSS visual layout playground with copyable properties",
    idea: "A visual grid visualizer where developers can interact with layout attributes (flex, grid, gap, offsets) and immediately preview it while copying optimized clean tailwind classes.",
  },
];

const LOADING_STEPS = [
  "Provisioning sandboxed advisory environment...",
  "Contextualizing project requirements...",
  "Dissecting scope boundaries & parameters...",
  "Formulating structured module checklists...",
  "Assembling timeline roadmap milestones...",
  "Optimizing architectural dependencies...",
];

export default function LaunchScreen({ onGenerate, isLoading }: LaunchScreenProps) {
  const [projectIdea, setProjectIdea] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<AdvisorPersona>(ADVISOR_PERSONAS[0]);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  // Cycle through loading steps during generation
  React.useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectIdea.trim()) return;
    onGenerate(projectIdea, selectedPersona);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-indigo-900/15 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center" id="loading-state">
          <div className="relative mb-8">
            {/* Spinning/pulsing loader rings */}
            <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-b-2 border-l-2 border-purple-500/30 animate-ping opacity-55"></div>
            <Sparkles className="absolute inset-0 m-auto text-indigo-400 w-6 h-6 animate-pulse" />
          </div>
          
          <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-wide mb-3">
            Engaging {selectedPersona.name}
          </h3>
          
          <div className="max-w-md px-4 py-3 bg-slate-900/40 border border-slate-800/60 rounded-xl backdrop-blur-md">
            <p className="text-slate-400 text-sm font-mono leading-relaxed transition-all duration-300">
              {LOADING_STEPS[loadingStepIdx]}
            </p>
          </div>
          
          <p className="text-slate-500 text-xs mt-6 max-w-sm font-mono">
            Consulting Gemini to architect a precise technical outline. This typically takes 8-15 seconds.
          </p>
        </div>
      ) : (
        <div className="space-y-12" id="launch-form">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-505/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-mono">
              <Sparkles size={12} className="text-indigo-400 animate-pulse" />
              <span>Gemini 3.5 AI Copilot Workspace</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-none">
              AI Project <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Workspace</span>
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans">
              Enter any software concept or product idea. Select an elite expert persona, and receive a comprehensive, actionable interactive plan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-slate-950/40 border border-slate-900/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
            {/* Project Idea Input */}
            <div className="space-y-3">
              <label htmlFor="idea-input" className="block text-sm font-medium text-slate-300 font-display">
                What are you building?
              </label>
              
              <div className="relative">
                <textarea
                  id="idea-input"
                  className="w-full h-32 px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all duration-200 resize-none font-sans"
                  placeholder="Describe your project goals, features, tech preferences, or visual style in as much detail as you like..."
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-600">
                  {projectIdea.length} characters
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Or select an inspiration seed:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SAMPLE_PROJECTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProjectIdea(sample.idea)}
                      className="text-left p-3 rounded-lg bg-slate-900/30 border border-slate-800/40 hover:bg-slate-900/70 hover:border-slate-700/60 transition-all duration-200 group"
                    >
                      <h4 className="text-xs font-bold text-slate-300 font-display group-hover:text-indigo-400 flex items-center gap-1.5 mb-1">
                        <Zap size={10} className="text-indigo-500" />
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                        {sample.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Persona Selector */}
            <div className="space-y-4 pt-4 border-t border-slate-900">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300 font-display">
                  Select Advisory Expert Persona
                </label>
                <span className="text-xs font-mono text-indigo-400">Affects timeline priorities & chat companion</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ADVISOR_PERSONAS.map((persona) => {
                  const isSelected = selectedPersona.id === persona.id;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setSelectedPersona(persona)}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 backdrop-blur-sm relative overflow-hidden group ${
                        isSelected
                          ? `bg-slate-900/80 border-indigo-500/70 shadow-lg shadow-indigo-500/5`
                          : "bg-slate-900/30 border-slate-800/50 hover:bg-slate-900/55 hover:border-slate-700/60"
                      }`}
                    >
                      {/* Left colored border line on select */}
                      {isSelected && (
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${persona.gradient}`} />
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border ${persona.iconBg} shrink-0`}>
                          {persona.id === "architect" && <Cpu size={18} />}
                          {persona.id === "product" && <Compass size={18} />}
                          {persona.id === "growth" && <Flame size={18} />}
                          {persona.id === "research" && <Terminal size={18} />}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-extrabold text-sm text-white">
                              {persona.name}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded">
                              {persona.role}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-indigo-300 font-mono">
                            {persona.tagline}
                          </p>
                          
                          <p className="text-xs text-slate-400 leading-normal font-sans pt-1">
                            {persona.roleDescription}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!projectIdea.trim() || isLoading}
                className={`w-full py-4 px-6 rounded-xl font-display font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  projectIdea.trim()
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 shadow-indigo-500/10 active:scale-[0.99]"
                    : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Sparkles size={16} className={`${projectIdea.trim() ? "animate-pulse" : ""}`} />
                <span>Blueprint New Workspace</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
