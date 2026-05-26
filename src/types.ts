export interface TechStackItem {
  category: string;
  tech: string;
  reason: string;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  tasks: TaskItem[];
}

export interface MilestoneItem {
  id: string;
  phaseName: string;
  duration: string;
  deliverables: string[];
  completed: boolean;
}

export interface ProjectBlueprint {
  projectName: string;
  elevatorPitch: string;
  objectives: string[];
  suggestedTechStack: TechStackItem[];
  modules: ModuleItem[];
  milestones: MilestoneItem[];
}

export interface AdvisorPersona {
  id: string;
  name: string;
  role: string;
  tagline: string;
  roleDescription: string;
  gradient: string;
  iconBg: string;
}

export interface ChatMessage {
  id: string;
  isUser: boolean;
  text: string;
  timestamp: string;
}
