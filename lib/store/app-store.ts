import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Problem, AlgorithmSolution, ChatMessage } from '../schemas/visualization';

interface AppState {
  problem: Problem | null;
  solution: AlgorithmSolution | null;
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  currentVisualizationStep: number;
  isVisualizationPlaying: boolean;
  visualizationSpeed: number;
  
  setProblem: (problem: Problem) => void;
  setSolution: (solution: AlgorithmSolution) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setCurrentVisualizationStep: (step: number) => void;
  setVisualizationPlaying: (playing: boolean) => void;
  setVisualizationSpeed: (speed: number) => void;
  nextVisualizationStep: () => void;
  prevVisualizationStep: () => void;
  resetVisualization: () => void;
  
  reset: () => void;
}

const initialState = {
  problem: null,
  solution: null,
  chatMessages: [],
  isLoading: false,
  error: null,
  currentVisualizationStep: 0,
  isVisualizationPlaying: false,
  visualizationSpeed: 1000,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setProblem: (problem) => set({ problem, solution: null, error: null }),
        
        setSolution: (solution) => set({ 
          solution, 
          error: null,
          currentVisualizationStep: 0,
        }),
        
        addChatMessage: (message) => set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
        
        clearChat: () => set({ chatMessages: [] }),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error, isLoading: false }),
        
        setCurrentVisualizationStep: (step) => {
          const state = get();
          const maxStep = state.solution?.visualizationPlan.steps.length ?? 0;
          const clampedStep = Math.max(0, Math.min(step, maxStep - 1));
          set({ currentVisualizationStep: clampedStep });
        },
        
        setVisualizationPlaying: (isVisualizationPlaying) => set({ isVisualizationPlaying }),
        
        setVisualizationSpeed: (visualizationSpeed) => set({ visualizationSpeed }),
        
        nextVisualizationStep: () => {
          const state = get();
          const maxStep = state.solution?.visualizationPlan.steps.length ?? 0;
          if (state.currentVisualizationStep < maxStep - 1) {
            set({ currentVisualizationStep: state.currentVisualizationStep + 1 });
          } else {
            set({ isVisualizationPlaying: false });
          }
        },
        
        prevVisualizationStep: () => {
          const state = get();
          if (state.currentVisualizationStep > 0) {
            set({ currentVisualizationStep: state.currentVisualizationStep - 1 });
          }
        },
        
        resetVisualization: () => set({ 
          currentVisualizationStep: 0,
          isVisualizationPlaying: false,
        }),
        
        reset: () => set(initialState),
      }),
      {
        name: 'algoviz-coach-storage',
        partialize: (state) => ({
          problem: state.problem,
          solution: state.solution,
          chatMessages: state.chatMessages,
          visualizationSpeed: state.visualizationSpeed,
        }),
      }
    ),
    {
      name: 'algoviz-coach-store',
    }
  )
);