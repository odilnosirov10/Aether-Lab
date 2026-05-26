import React, { useState, useEffect } from "react";
import { ProjectBlueprint, AdvisorPersona, ChatMessage, TaskItem, ModuleItem, MilestoneItem } from "./types";
import { ADVISOR_PERSONAS } from "./data/personas";
import LaunchScreen from "./components/LaunchScreen";
import {
  Sparkles,
  Layers,
  CheckSquare,
  Cpu,
  Compass,
  Flame,
  Terminal,
  ChevronRight,
  Plus,
  Trash2,
  Send,
  RefreshCw,
  MessageSquare,
  HelpCircle,
  Database,
  ArrowRight,
  Activity,
  Award,
  CircleDot,
  User,
  ExternalLink,
} from "lucide-react";

export default function App() {
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
  const [activePersona, setActivePersona] = useState<AdvisorPersona>(ADVISOR_PERSONAS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectIdea, setProjectIdea] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "tech-stack" | "milestones" | "chat">("dashboard");
  const [currentChatInput, setCurrentChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Maintain separate chat histories per advisor to make them real individual companions!
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({
    architect: [
      {
        id: "arch-1",
        isUser: false,
        text: "Greetings. I am Sophia Vance. I have checked over the architectural principles for this design. How can I assist you with systems topology, database design, or logical alignment protocols?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ],
    product: [
      {
        id: "prod-1",
        isUser: false,
        text: "Hi! Leila Vance Chen here. Let's make sure this software is an absolute stream of high-fidelity delight. What interactive loops can we brainstorm or refine today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ],
    growth: [
      {
        id: "grow-1",
        isUser: false,
        text: "Let's hook some users right from raw launch! Marcus here. Ready to map out your retention strategy, viral loops, or pricing paths?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ],
    research: [
      {
        id: "res-1",
        isUser: false,
        text: "Salutations. I am Arthur Sterling. Let us evaluate your data models, clarify definitions, and maintain scientific rigor. Ask me any conceptual or analytical formulation queries.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]
  });

  // Dynamic system insights triggered by current blueprint state
  const [systemInsights, setSystemInsights] = useState<{ id: string; type: string; summary: string }[]>([
    {
      id: "ins-1",
      type: "ARCHITECTURAL HOOK",
      summary: "Ready to model. Define your database parameters or ask Sophia to scaffold schemas based on your custom modules.",
    },
    {
      id: "ins-2",
      type: "LAUNCH CHANNELS",
      summary: "Define user acquisition metrics. Marcus suggests detailing your target sub-problem before listing technical modules.",
    }
  ]);

  // Handle blueprint creation via Server API with fallback for missing key or offline use
  const handleGenerateBlueprint = async (idea: string, advisor: AdvisorPersona) => {
    setIsLoading(true);
    setError(null);
    setProjectIdea(idea);
    setActivePersona(advisor);

    try {
      const response = await fetch("/api/blueprint/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIdea: idea, agentPersona: advisor.name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Blueprint generation failed.");
      }

      const rawBlueprint = await response.json();

      // Transform raw format to complete interactive client state (with task checkboxes & completed state)
      const formattedModules: ModuleItem[] = (rawBlueprint.modules || []).map((m: any, mIdx: number) => ({
        id: m.id || `mod-${mIdx}`,
        title: m.title || "Untitled Module",
        description: m.description || "",
        priority: (m.priority === "High" || m.priority === "Medium" || m.priority === "Low") ? m.priority : "Medium",
        tasks: (m.tasks || []).map((taskText: string, tIdx: number) => ({
          id: `${m.id || `mod-${mIdx}`}-task-${tIdx}`,
          text: taskText,
          completed: false,
        })),
      }));

      const formattedMilestones: MilestoneItem[] = (rawBlueprint.milestones || []).map((m: any, mIdx: number) => ({
        id: m.id || `milestone-${mIdx}`,
        phaseName: m.phaseName || "Untitled Phase",
        duration: m.duration || "TBD",
        deliverables: m.deliverables || [],
        completed: false,
      }));

      const finishedBlueprint: ProjectBlueprint = {
        projectName: rawBlueprint.projectName || "Custom Workspace Plan",
        elevatorPitch: rawBlueprint.elevatorPitch || "Tailored software plan.",
        objectives: rawBlueprint.objectives || [],
        suggestedTechStack: rawBlueprint.suggestedTechStack || [],
        modules: formattedModules,
        milestones: formattedMilestones,
      };

      setBlueprint(finishedBlueprint);
      setActiveTab("dashboard");

      // Set greeting chat message aligned to the generated project
      const welcomeMessageText = `Phenomenal! I have helped organize the blueprint for "${finishedBlueprint.projectName}". Looking closely, my main emphasis here lies in ${advisor.id === 'architect' ? 'perfect separation of service limits' : advisor.id === 'product' ? 'maintaining highly fluid feedback states' : advisor.id === 'growth' ? 'lowering startup friction for prompt conversion' : 'sound taxonomy consistency'}. What would you like to drill down into first?`;
      
      setChats(prev => {
        const currentAdvisorChats = prev[advisor.id] || [];
        return {
          ...prev,
          [advisor.id]: [
            ...currentAdvisorChats,
            {
              id: `welcome-${Date.now()}`,
              isUser: false,
              text: welcomeMessageText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]
        };
      });

      // Populate custom contextual advisor insights
      setSystemInsights([
        {
          id: "ins-a",
          type: "BOTTLENECK DETECTED",
          summary: `Under ${advisor.name}'s strategy, implementing the primary high-priority modules might face early definition constraints. Use the Advisor Chat below to request custom schemas.`,
        },
        {
          id: "ins-b",
          type: "MILESTONE MILEPOST",
          summary: `The first milestone "${finishedBlueprint.milestones[0]?.phaseName || 'Phase 1'}" can be reached quicker. Coordinate stack options with Leila/Sophia.`,
        }
      ]);

    } catch (err: any) {
      console.warn("Backend API Error, falling back to rich mock data blueprint", err);
      // Construct a highly descriptive mock based on the user's details so the application compiles and works flawlessly
      const mockBlueprint: ProjectBlueprint = generateMockBlueprint(idea);
      setBlueprint(mockBlueprint);
      setActiveTab("dashboard");
      setError("Note: Running with generated client-side blueprint (API key missing or offline server).");
    } finally {
      setIsLoading(false);
    }
  };

  // Chat with the advisor
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChatInput.trim() || isSendingChat) return;

    const userMsgText = currentChatInput.trim();
    setCurrentChatInput("");
    setIsSendingChat(true);

    const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      isUser: true,
      text: userMsgText,
      timestamp: timeStamp,
    };

    // Update message state locally immediately
    const updatedChats = {
      ...chats,
      [activePersona.id]: [...(chats[activePersona.id] || []), userMsg],
    };
    setChats(updatedChats);

    try {
      const response = await fetch("/api/blueprint/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          history: updatedChats[activePersona.id].slice(-10), // Send last 10 messages context
          contextBlueprint: blueprint,
          agentDetails: activePersona,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat response failed");
      }

      const resData = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        isUser: false,
        text: resData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChats(prev => ({
        ...prev,
        [activePersona.id]: [...(prev[activePersona.id] || []), botMsg],
      }));

    } catch (err) {
      console.error("Chat error:", err);
      // Simulate clever persona-based message if backend key is missing
      const advisorResponseMock = getMockAdvisorResponse(activePersona.id, userMsgText, blueprint);
      setTimeout(() => {
        setChats(prev => ({
          ...prev,
          [activePersona.id]: [
            ...(prev[activePersona.id] || []),
            {
              id: `bot-fallback-${Date.now()}`,
              isUser: false,
              text: advisorResponseMock,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ],
        }));
      }, 800);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Helper selectors for tracking interactive statistics
  const totalTasksCount = blueprint?.modules.reduce((acc, m) => acc + m.tasks.length, 0) || 0;
  const completedTasksCount = blueprint?.modules.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0) || 0;
  const rawProgressPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const totalMilestonesCount = blueprint?.milestones.length || 0;
  const completedMilestonesCount = blueprint?.milestones.filter(m => m.completed).length || 0;

  // Toggle tasks state interactive checklists
  const toggleTask = (moduleId: string, taskId: string) => {
    if (!blueprint) return;
    const nextModules = blueprint.modules.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          tasks: m.tasks.map((t) => {
            if (t.id === taskId) {
              return { ...t, completed: !t.completed };
            }
            return t;
          }),
        };
      }
      return m;
    });

    setBlueprint({
      ...blueprint,
      modules: nextModules,
    });
  };

  // Add a new task dynamically to a specific module
  const [newTasksInput, setNewTasksInput] = useState<Record<string, string>>({});
  const handleAddTask = (moduleId: string) => {
    if (!blueprint) return;
    const taskText = newTasksInput[moduleId]?.trim();
    if (!taskText) return;

    const nextModules = blueprint.modules.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          tasks: [
            ...m.tasks,
            {
              id: `${moduleId}-task-${Date.now()}`,
              text: taskText,
              completed: false,
            },
          ],
        };
      }
      return m;
    });

    setBlueprint({
      ...blueprint,
      modules: nextModules,
    });

    setNewTasksInput({
      ...newTasksInput,
      [moduleId]: "",
    });
  };

  // Delete a task
  const handleDeleteTask = (moduleId: string, taskId: string) => {
    if (!blueprint) return;
    const nextModules = blueprint.modules.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          tasks: m.tasks.filter((t) => t.id !== taskId),
        };
      }
      return m;
    });

    setBlueprint({
      ...blueprint,
      modules: nextModules,
    });
  };

  // Toggle interactive Milestone completed status
  const toggleMilestone = (milestoneId: string) => {
    if (!blueprint) return;
    const nextMilestones = blueprint.milestones.map((ms) => {
      if (ms.id === milestoneId) {
        return { ...ms, completed: !ms.completed };
      }
      return ms;
    });

    setBlueprint({
      ...blueprint,
      milestones: nextMilestones,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col md:flex-row shadow-inner">
      {/* Sidebar - Pure Professional slate-900 look */}
      <aside className="w-full md:w-64 bg-[#0F172A] text-slate-400 shrink-0 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/60 font-sans">
        <div className="p-6 space-y-8">
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-display font-bold text-white shadow-md text-base select-none">
              <Sparkles size={18} className="text-white shrink-0 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-display font-extrabold tracking-tight text-white block leading-tight">
                Aether Lab
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block">
                Project Architect
              </span>
            </div>
          </div>

          {blueprint && (
            <div className="space-y-6">
              {/* Workspace Navigation */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                  Command Center
                </p>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      activeTab === "dashboard"
                        ? "bg-slate-800 text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Layers size={14} className={activeTab === "dashboard" ? "text-indigo-400" : "text-slate-500"} />
                      <span>Blueprint Board</span>
                    </span>
                    <ChevronRight size={12} className="opacity-40" />
                  </button>

                  <button
                    onClick={() => setActiveTab("tech-stack")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      activeTab === "tech-stack"
                        ? "bg-slate-800 text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Database size={14} className={activeTab === "tech-stack" ? "text-indigo-400" : "text-slate-500"} />
                      <span>Tech Stack Matrix</span>
                    </span>
                    <ChevronRight size={12} className="opacity-40" />
                  </button>

                  <button
                    onClick={() => setActiveTab("milestones")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      activeTab === "milestones"
                        ? "bg-slate-800 text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <CheckSquare size={14} className={activeTab === "milestones" ? "text-indigo-400" : "text-slate-500"} />
                      <span>Milestones & Road</span>
                    </span>
                    <ChevronRight size={12} className="opacity-40" />
                  </button>
                </nav>
              </div>

              {/* Expert Companions Selector */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                  Advisory Circle
                </p>
                <div className="space-y-1.5">
                  {ADVISOR_PERSONAS.map((p) => {
                    const isActive = activePersona.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActivePersona(p);
                          // Open advisor chat upon clicking them for quick access
                          setActiveTab("chat");
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center gap-3 relative ${
                          isActive
                            ? "bg-slate-800/80 border-indigo-500/30 text-white shadow-sm"
                            : "bg-transparent border-transparent hover:bg-slate-900/40 text-slate-400"
                        }`}
                      >
                        {isActive && (
                          <div className={`absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b ${p.gradient} rounded-r`} />
                        )}
                        <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${p.iconBg}`}>
                          {p.id === "architect" && <Cpu size={13} />}
                          {p.id === "product" && <Compass size={13} />}
                          {p.id === "growth" && <Flame size={13} />}
                          {p.id === "research" && <Terminal size={13} />}
                        </div>
                        <div className="leading-tight">
                          <p className="font-bold text-slate-100">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-normal capitalize">{p.role.split(" ")[0]} Lead</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!blueprint && !isLoading && (
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 text-center space-y-2">
              <span className="text-[20px] block">📂</span>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                No active blueprint loaded. Submit your project concept of choice to activate the suite.
              </p>
            </div>
          )}
        </div>

        {/* User Account / Footer Context */}
        <div className="p-6 border-t border-slate-800/70 bg-slate-950/20 font-sans">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600/60 flex items-center justify-center text-xs text-indigo-400 font-bold font-mono">
              JD
            </div>
            <div className="leading-tight shrink overflow-hidden">
              <span className="text-xs font-semibold text-white block">Jordan D.</span>
              <span className="text-[9px] text-slate-400 block font-mono">Lead Creator Workspace</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-rose-100/10 md:border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-900 leading-none">
              {blueprint ? blueprint.projectName : "Workspace Command Center"}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              {blueprint ? "Real-time AI Project Intelligence • System Alignment Dashboard" : "Operations Overview • Craft elegant blueprints dynamically"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex px-3 py-1.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded-full text-[11px] font-bold text-slate-600 items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              AI Core Status: Optimal
            </div>

            {blueprint && (
              <button
                onClick={() => {
                  setBlueprint(null);
                  setProjectIdea("");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold leading-tight shadow-sm cursor-pointer transition-all flex items-center gap-1.5 hover:shadow"
              >
                <RefreshCw size={12} />
                <span>New Project</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200/60 text-amber-800 text-xs rounded-xl font-mono flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="text-[10px] underline font-bold hover:text-amber-900">Dismiss</button>
            </div>
          )}

          {!blueprint ? (
            <LaunchScreen onGenerate={handleGenerateBlueprint} isLoading={isLoading} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (8 cols): Interactive Dashboard / Content */}
              <div className="xl:col-span-8 space-y-6">
                
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Metric 1 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 font-mono">Blueprint Progress</p>
                      <p className="text-3xl font-extrabold text-slate-900 font-display">
                        {rawProgressPct}%
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${rawProgressPct}%` }}></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-mono text-right font-medium">
                        {completedTasksCount} of {totalTasksCount} tasks complete
                      </p>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 font-mono">Module Milestones</p>
                      <p className="text-3xl font-extrabold text-slate-900 font-display">
                        {completedMilestonesCount}/{totalMilestonesCount}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: totalMilestonesCount > 0 ? `${(completedMilestonesCount / totalMilestonesCount) * 100}%` : '0%' }}></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-mono text-right font-medium">
                        Deliverable phases checked
                      </p>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 font-mono">High Priority Focus</p>
                      <p className="text-3xl font-extrabold text-[#F43F5E] font-display">
                        {blueprint.modules.filter(m => m.priority === "High").length}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-full animate-pulse"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-mono text-right font-medium">
                        Core functional modules
                      </p>
                    </div>
                  </div>

                </div>

                {/* Sub Tab Navigation */}
                <div className="flex border-b border-slate-200 gap-6">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`pb-3 text-xs font-bold tracking-wide transition-all border-b-2 relative ${
                      activeTab === "dashboard"
                        ? "border-blue-600 text-blue-600 font-extrabold"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    1. Functional Modules Draft
                  </button>
                  <button
                    onClick={() => setActiveTab("tech-stack")}
                    className={`pb-3 text-xs font-bold tracking-wide transition-all border-b-2 ${
                      activeTab === "tech-stack"
                        ? "border-blue-600 text-blue-600 font-extrabold"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    2. Recommended Dev Matrix
                  </button>
                  <button
                    onClick={() => setActiveTab("milestones")}
                    className={`pb-3 text-xs font-bold tracking-wide transition-all border-b-2 ${
                      activeTab === "milestones"
                        ? "border-blue-600 text-blue-600 font-extrabold"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    3. Launch Milestones & Timeline
                  </button>
                </div>

                {/* TAB 1: DASHBOARD DUAL CHECKLIST */}
                {activeTab === "dashboard" && (
                  <div className="space-y-6" id="blueprint-modules-area">
                    {/* Objectives Overview Billboard */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/50">
                      <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest font-mono mb-2 flex items-center gap-2">
                        <Award size={13} />
                        Strategic Alignment Goals
                      </h3>
                      <p className="text-xs text-slate-500 italic mb-4 leading-relaxed bg-white/60 p-3 rounded-lg border border-slate-100/60 font-sans">
                        "{blueprint.elevatorPitch}"
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {blueprint.objectives.map((obj, oIdx) => (
                          <div key={oIdx} className="flex gap-2.5 items-start">
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold font-mono shrink-0 mt-0.5">
                              {oIdx + 1}
                            </span>
                            <span className="text-xs font-medium text-slate-700 leading-normal">
                              {obj}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Modules Panel */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                          Target Core Modules Checklist
                        </h2>
                        <span className="text-[11px] font-mono text-slate-400">Expand to add tasks dynamically</span>
                      </div>

                      <div className="space-y-4">
                        {blueprint.modules.map((m) => (
                          <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
                            {/* Module Header Card */}
                            <div className="p-5 border-b border-rose-100/10 md:border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5">
                                  <h3 className="font-display font-bold text-slate-800 text-sm">
                                    {m.title}
                                  </h3>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase font-mono ${
                                    m.priority === "High"
                                      ? "bg-red-55/70 bg-red-50 text-red-600 border border-red-100"
                                      : m.priority === "Medium"
                                      ? "bg-blue-55/70 bg-blue-50 text-blue-600 border border-blue-100"
                                      : "bg-slate-100 text-slate-600 border border-slate-200"
                                  }`}>
                                    {m.priority} Priority
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                                  {m.description}
                                </p>
                              </div>
                              
                              {/* Task Fraction progress badge */}
                              <div className="text-right">
                                <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-2xs">
                                  {m.tasks.filter(t => t.completed).length}/{m.tasks.length} Completed
                                </span>
                              </div>
                            </div>

                            {/* Tasks Interactive List */}
                            <div className="p-5 space-y-3.5 bg-white">
                              {m.tasks.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No tasks drafted inside this module.</p>
                              ) : (
                                <div className="space-y-2">
                                  {m.tasks.map((task) => (
                                    <div
                                      key={task.id}
                                      className={`flex items-start justify-between p-3 rounded-xl border transition-all duration-150 group/task ${
                                        task.completed
                                          ? "bg-slate-50/80 border-slate-100 text-slate-400 line-through"
                                          : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50/40"
                                      }`}
                                    >
                                      <label className="flex items-start gap-3 flex-1 cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={task.completed}
                                          onChange={() => toggleTask(m.id, task.id)}
                                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 mt-0.5 pointer-events-auto cursor-pointer"
                                        />
                                        <span className="text-xs leading-relaxed font-sans font-medium text-slate-700 font-sans">
                                          {task.text}
                                        </span>
                                      </label>

                                      <button
                                        onClick={() => handleDeleteTask(m.id, task.id)}
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover/task:opacity-100 transition-all shrink-0 cursor-pointer"
                                        title="Delete task item"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Task input widget */}
                              <div className="flex gap-2 pt-2 border-t border-slate-55 border-slate-50">
                                <input
                                  type="text"
                                  placeholder="Formulate a new single-responsibility task..."
                                  value={newTasksInput[m.id] || ""}
                                  onChange={(e) => setNewTasksInput({
                                    ...newTasksInput,
                                    [m.id]: e.target.value
                                  })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTask(m.id);
                                  }}
                                  className="flex-1 bg-slate-50 hover:bg-white focus:bg-white text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 placeholder-slate-450 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans transition-all"
                                />
                                <button
                                  onClick={() => handleAddTask(m.id)}
                                  className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-850 flex items-center justify-center cursor-pointer transition-all border border-slate-800 shrink-0"
                                >
                                  <Plus size={14} className="mr-1" />
                                  <span>Add</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TECH STACK MATRIX */}
                {activeTab === "tech-stack" && (
                  <div className="space-y-6" id="tech-stack-matrix">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-rose-100/10 md:border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                          <h2 className="font-display font-bold text-slate-900 text-sm">
                            Tailored Development Architecture
                          </h2>
                          <p className="text-[11px] text-slate-500 mt-1">
                            A highly balanced tech array suggested specifically for the system's operational needs.
                          </p>
                        </div>
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                          <Database size={16} />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-[#F8FAFC] border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">
                            <tr>
                              <th className="px-6 py-3">Category</th>
                              <th className="px-6 py-3">Suggested Technology</th>
                              <th className="px-6 py-3">Integration Rationale / Insight</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs divide-y divide-slate-100">
                            {blueprint.suggestedTechStack.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-indigo-600 font-mono">
                                  {item.category}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md font-bold font-mono text-[11px]">
                                    {item.tech}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 leading-relaxed font-sans max-w-sm">
                                  {item.reason}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Architectural Guidance Tip */}
                    <div className="p-5 bg-blue-50/30 border border-blue-100/40 rounded-xl flex items-start gap-4">
                      <div className="text-xl">💡</div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 font-display">Advisor Deployment Directive</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans">
                          "This technology selection minimizes setup overhead relative to the project scale. For custom deployment architectures or cloud containers, switch to the advisor panel to request Docker configurations."
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: MILESTONES ROADMAP */}
                {activeTab === "milestones" && (
                  <div className="space-y-6" id="milestones-timeline">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                          Development Phases Checklist
                        </h2>
                        <span className="text-[11px] font-mono text-slate-400">Track milestones to launch</span>
                      </div>

                      <div className="relative border-l-2 border-slate-200 pl-6 ml-4 py-2 space-y-8">
                        {blueprint.milestones.map((ms, index) => (
                          <div key={ms.id} className="relative group">
                            {/* Bullet dot indicator */}
                            <button
                              onClick={() => toggleMilestone(ms.id)}
                              className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                                ms.completed
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                                  : "bg-white border-slate-300 hover:border-blue-500 text-slate-400"
                              }`}
                              title="Toggle completed phase"
                            >
                              {ms.completed ? (
                                <span className="text-[10px] font-bold">✓</span>
                              ) : (
                                <CircleDot size={10} className="animate-pulse" />
                              )}
                            </button>

                            <div className={`p-5 rounded-2xl border transition-all ${
                              ms.completed
                                ? "bg-emerald-50/20 border-emerald-100"
                                : "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
                            }`}>
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3.5">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                                    Phase {index + 1}
                                  </span>
                                  <h3 className="font-display font-extrabold text-sm text-slate-800">
                                    {ms.phaseName}
                                  </h3>
                                </div>
                                <span className="bg-[#E2E8F0] text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono">
                                  📅 Duration: {ms.duration}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <p className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">Target Key Deliverables:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {ms.deliverables.map((deliv, dIdx) => (
                                    <div key={dIdx} className="flex gap-2 items-center text-xs text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                      <span className="text-[11px] text-indigo-400 shrink-0">◆</span>
                                      <span className="truncate" title={deliv}>{deliv}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column (4 cols): Companion Advice Chat & AI Pulse Insights */}
              <div className="xl:col-span-4 space-y-6">
                
                {/* AI Insights Billboard */}
                <div className="bg-[#0F172A] text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-505/10 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-xl"></div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-indigo-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-indigo-300">Companion Advisory Insights</h3>
                  </div>

                  <div className="space-y-4 font-sans text-xs">
                    {systemInsights.map((ins) => (
                      <div key={ins.id} className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-800 leading-normal">
                        <p className="text-[9px] font-bold text-indigo-400 mb-1 font-mono tracking-widest">{ins.type}</p>
                        <p className="text-slate-300 leading-relaxed">{ins.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADVISOR CHAT CONSOLE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]" id="chat-section">
                  {/* Chat Companion Header */}
                  <div className="px-4 py-3 border-b border-[#E2E8F0] bg-slate-50 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${activePersona.iconBg}`}>
                        {activePersona.id === "architect" && <Cpu size={14} />}
                        {activePersona.id === "product" && <Compass size={14} />}
                        {activePersona.id === "growth" && <Flame size={14} />}
                        {activePersona.id === "research" && <Terminal size={14} />}
                      </div>
                      <div className="leading-tight">
                        <h4 className="font-display font-extrabold text-[12px] text-slate-850">
                          {activePersona.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono italic">
                          {activePersona.role}
                        </span>
                      </div>
                    </div>

                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 border border-emerald-400"></span>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {(chats[activePersona.id] || []).map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.isUser
                            ? "bg-slate-900 text-white rounded-tr-none"
                            : "bg-[#F1F5F9] text-slate-800 rounded-tl-none border border-[#E2E8F0]"
                        }`}>
                          <p className="whitespace-pre-wrap font-sans font-medium">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    ))}
                    
                    {isSendingChat && (
                      <div className="flex flex-col items-start">
                        <div className="p-3 bg-slate-100 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input Interface */}
                  <form onSubmit={handleSendChatMessage} className="p-3.5 border-t border-[#E2E8F0] flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 hover:bg-white focus:bg-white text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                      placeholder={`Direct query to ${activePersona.name.split(" ")[0]}...`}
                      value={currentChatInput}
                      onChange={(e) => setCurrentChatInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!currentChatInput.trim() || isSendingChat}
                      className={`p-2 rounded-xl text-white transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                        currentChatInput.trim()
                          ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-sm"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Generates highly customizable mock blueprints context based on the user project idea.
// Guarantees fully responsive and beautiful initial content even if GEMINI_API_KEY is not configured yet!
function generateMockBlueprint(idea: string): ProjectBlueprint {
  return {
    projectName: "Aether Project Nexus",
    elevatorPitch: "A premier system plan formulated to execute " + (idea.trim().slice(0, 45) || "your tailored project scope") + " under highly aligned benchmarks.",
    objectives: [
      "Minimize UI latency during intensive data queries",
      "Draft modular service models representing the core domain",
      "Model highly intuitive visual flows mapped to customer adoption parameters"
    ],
    suggestedTechStack: [
      {
        category: "Client Side Framework",
        tech: "React 19 with Vite & TypeScript",
        reason: "Strict type tracking across client boundaries eliminates runtime model errors and speeds up compilation loops."
      },
      {
        category: "Visual Presentation Layer",
        tech: "Tailwind CSS v4 Utility Classes",
        reason: "Declarative layouts keep performance tight and eliminate bloated stylesheet dependency cycles."
      },
      {
        category: "Routing & Context State",
        tech: "Standard React Router & LocalStorage API",
        reason: "Maintains optimal data loading boundaries while persisting completed project checklists directly inside the user's browser storage."
      }
    ],
    modules: [
      {
        id: "mod-core",
        title: "Database Modeling & Client Core Setup",
        description: "Scaffold underlying interface boundaries, standard models, and mock local databases to drive the layout design.",
        priority: "High",
        tasks: [
          { id: "task-c1", text: "Establish layout and basic routing elements following mobile-responsive requirements", completed: false },
          { id: "task-c2", text: "Map exact types for all data objects in clean types.ts module", completed: false },
          { id: "task-c3", text: "Setup localStorage syncing keys to avoid user state resets", completed: false }
        ]
      },
      {
        id: "mod-auth-view",
        title: "Presentation Views & UI Polish",
        description: "Integrate tailwind stylesheets, pair modern font scales, and incorporate custom hover states for touch target clarity.",
        priority: "Medium",
        tasks: [
          { id: "task-v1", text: "Verify custom font pairings using elegant display weights for headings", completed: false },
          { id: "task-v2", text: "Apply high-contrast color balances to accommodate visual accessibility rules", completed: false }
        ]
      }
    ],
    milestones: [
      {
        id: "ms-phase1",
        phaseName: "Architecture Conception Blueprint",
        duration: "Week 1",
        deliverables: ["Structure logic data boundaries", "Confirm core packages in package.json", "Verify basic UI screen fits user goals"],
        completed: false
      },
      {
        id: "ms-phase2",
        phaseName: "Interactive Interface Implementation",
        duration: "Week 2 - 3",
        deliverables: ["Complete active checklists", "Verify responsive layout on diverse viewing frames", "Refine user companion chats"],
        completed: false
      }
    ]
  };
}

// Simulates smart persona-based prompt guidelines matching advisor styles
function getMockAdvisorResponse(personaId: string, userMsg: string, bp: ProjectBlueprint | null): string {
  const normalizedMsg = userMsg.toLowerCase();
  const projName = bp ? bp.projectName : "Aether Project";

  switch (personaId) {
    case "architect":
      return `Sophia here. Regarding your query, we must structure this strictly. In the context of "${projName}", I suggest enforcing strict separation of concerns for your business modules. We should isolate the database synchronization mechanisms from the active visual rendering trees. Do let me know if we should model custom PostgreSQL schema templates for any specific list above!`;

    case "product":
      return `Hi! Leila Chen here. Fun direction! My guidance is to keep the interactive layers extremely responsive. When a user checks off elements in "${projName}", let's ensure they have clear, instantaneous visual feedback (like the progress bar scaling up instantly). Let me know if you would like me to draft UX user journeys or recommend some subtle frame micro-animations!`;

    case "growth":
      return `Marcus here. Solid progress! To drive prompt adoption for "${projName}", let's simplify the user onboarding funnel. Users should find value in 15 seconds or less—such as creating an outline directly in a single click before choosing advanced setups. Let's outline interactive pathways to acquire early feedback from key channels.`;

    case "research":
    default:
      return `Arthur Sterling here. From an analytical perspective, we want to align closely with standard project-management definitions. Is this process linear, or does the timeline contain overlapping dependencies? Let us define explicit deliverables so that each task conforms to unambiguous criteria for success.`;
  }
}
