'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'id' | 'en';
type TInput = string | { id: string; en: string };
type Vars = Record<string, string | number>;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (input: TInput, vars?: Vars) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = 'escape_plan_lang';

function applyVars(text: string, vars?: Vars) {
  if (!vars) return text;
  return Object.entries(vars).reduce((acc, [key, value]) => {
    const safe = String(value);
    return acc.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), safe);
  }, text);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'id' || stored === 'en') {
      setLangState(stored);
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<I18nContextValue>(() => {
    const t = (input: TInput, vars?: Vars) => {
      const raw =
        typeof input === 'string'
          ? input
          : lang === 'id'
            ? input.id
            : input.en;
      return applyVars(raw, vars);
    };
    return { lang, setLang, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
