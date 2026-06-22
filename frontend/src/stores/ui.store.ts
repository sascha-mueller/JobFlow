import { create } from "zustand";

export interface PageAction {
  label: string;
  onClick: () => void;
}

export interface PageBackLink {
  label: string;
  href: string;
}

interface PageMeta {
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  action?: PageAction;
  secondaryAction?: PageAction;
  backLink?: PageBackLink;
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
    set((state) => ({
      pageMeta: { ...state.pageMeta, action: undefined, backLink: undefined, ...meta },
    })),
}));
