'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={cn('flex items-center gap-1 rounded-full border border-primary/10 bg-white/70 p-1', className)}>
      <button
        type="button"
        onClick={() => setLang('id')}
        className={cn(
          'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors',
          lang === 'id'
            ? 'bg-primary text-primary-foreground'
            : 'text-primary/60 hover:text-primary'
        )}
        aria-pressed={lang === 'id'}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={cn(
          'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors',
          lang === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'text-primary/60 hover:text-primary'
        )}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  );
}
