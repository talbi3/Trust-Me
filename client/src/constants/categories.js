import { Image, MessageCircleWarning, BrainCircuit, Video } from "lucide-react"; 

export const CATEGORIES = [
  { 
    id: "Pictures", 
    label: "Safe Photo Sharing", 
    icon: Image 
  },
  { 
    id: "Bullying", 
    label: "Cyberbullying", 
    icon: MessageCircleWarning 
  },
  { 
    id: "Focus", 
    label: "Focus & Habits", 
    icon: BrainCircuit 
  },
  {
    id: "YouTube",
    label: "YouTube Insights",
    icon: Video
  }
];