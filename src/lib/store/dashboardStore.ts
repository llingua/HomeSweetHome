import { create } from 'zustand';

type DashboardState = {
  editMode: boolean;
  toggleEditMode: () => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  editMode: false,
  toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),
}));
