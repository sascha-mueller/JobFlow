import { create } from "zustand";

interface PageMeta {
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
}

interface UiStore {
  pageMeta: PageMeta;
  setPageMeta: (meta: Partial<PageMeta>) => void;
}

const defaults: PageMeta = {
  title: "",
  subtitle: "",
  metaTitle: "JobFlow",
  metaDescription: "",
};

export const useUiStore = create<UiStore>((set) => ({
  pageMeta: defaults,
  setPageMeta: (meta) =>
    set((state) => ({ pageMeta: { ...state.pageMeta, ...meta } })),
}));
