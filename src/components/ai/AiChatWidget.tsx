'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useI18n } from '@/i18n/I18nProvider';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Recommendation[];
};

type Recommendation = {
  id: number;
  slug: string;
  name: string;
  location: string;
  price?: number | null;
  rating?: number | null;
  thumbnail?: string | null;
};

const quickPrompts = [
  { id: 'reco', text: { id: 'Rekomendasi glamping terbaik', en: 'Recommend the best glamping stays' } },
  { id: 'beach', text: { id: 'Cari glamping dekat pantai', en: 'Find glamping near the beach' } },
  { id: 'family', text: { id: 'Pilihan untuk keluarga 4 orang', en: 'Options for a family of 4' } },
];

export default function AiChatWidget() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: t({
        id: 'Halo! Aku siap bantu cari rekomendasi glamping. Ceritakan lokasi, tanggal, budget, atau vibe favoritmu.',
        en: 'Hi! I can help with glamping recommendations. Tell me your location, dates, budget, or preferred vibe.',
      }),
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const storageBase = (process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage/').replace(/\/+$/, '/');
  const batikPattern = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Crect width='180' height='180' fill='%23fff3e5'/%3E%3Cg fill='none' stroke='%235a8fa1' stroke-width='4' opacity='0.55'%3E%3Cpath d='M-10 60c30-30 70-30 100 0s70 30 100 0'/%3E%3Cpath d='M-10 120c30-30 70-30 100 0s70 30 100 0'/%3E%3C/g%3E%3Cg fill='none' stroke='%2387b8c7' stroke-width='2.5' opacity='0.65'%3E%3Cpath d='M-20 80c35-28 85-28 120 0s85 28 120 0'/%3E%3Cpath d='M-20 140c35-28 85-28 120 0s85 28 120 0'/%3E%3C/g%3E%3Cg fill='none' stroke='%23b8d7e3' stroke-width='2' opacity='0.7'%3E%3Cpath d='M-30 40c40-24 100-24 140 0s100 24 140 0'/%3E%3Cpath d='M-30 100c40-24 100-24 140 0s100 24 140 0'/%3E%3Cpath d='M-30 160c40-24 100-24 140 0s100 24 140 0'/%3E%3C/g%3E%3C/svg%3E\")";

  const resolveImage = (src?: string | null) => {
    if (!src) return 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80';
    if (src.startsWith('http')) return src;
    return `${storageBase}${src.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const handleSend = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post<{ message: string; recommendations?: Recommendation[] }>(
        '/ai/recommendations',
        {
          message: trimmed,
          lang,
        }
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        recommendations: data.recommendations || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: t({
          id: 'Maaf, aku belum bisa mengambil data rekomendasi. Coba lagi sebentar ya.',
          en: 'Sorry, I could not fetch recommendations right now. Please try again soon.',
        }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value?: number | null) => {
    if (value == null || Number.isNaN(value)) return '-';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const renderRecommendations = (recommendations: Recommendation[] = []) => {
    if (!recommendations.length) return null;
    return (
      <div className="mt-3 space-y-3">
        {recommendations.map((item) => (
          <Link
            href={`/glamping/${item.slug}`}
            key={item.id}
            className="flex gap-3 rounded-2xl border border-primary/10 bg-white p-2 hover:shadow-md transition"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImage(item.thumbnail)} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-primary line-clamp-1">{item.name}</p>
              <p className="text-[11px] text-primary/60 line-clamp-1">{item.location}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] uppercase tracking-[0.2em] text-primary/50">
                <span>{t({ id: 'Mulai', en: 'From' })} Rp {formatPrice(item.price)}</span>
                <span>★ {item.rating?.toFixed(1) ?? '4.8'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const chatTitle = useMemo(
    () =>
      t({
        id: 'Escape AI',
        en: 'Escape AI',
      }),
    [t]
  );

  return (
    <div className="fixed bottom-4 right-4 z-[80] isolate">
      {open && (
        <div
          className="w-[320px] sm:w-[360px] shadow-2xl border border-primary/10 rounded-2xl overflow-hidden bg-[#fff4ea]"
          style={{ backgroundImage: batikPattern, backgroundSize: '180px 180px' }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-primary/95 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <div>
                <p className="text-sm font-black tracking-tight">{chatTitle}</p>
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-80">
                  {t({ id: 'Asisten Glamping', en: 'Glamping Assistant' })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 transition"
              aria-label={t({ id: 'Tutup chat', en: 'Close chat' })}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={listRef}
            className="max-h-[360px] overflow-y-auto px-4 py-3 space-y-3 bg-white/70"
          >
            {messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'ml-auto' : 'mr-auto'}>
                <div
                  className={
                    message.role === 'user'
                      ? 'w-fit max-w-[85%] rounded-2xl bg-primary text-primary-foreground px-3 py-2 text-sm whitespace-pre-wrap'
                      : 'w-fit max-w-[85%] rounded-2xl bg-primary/5 text-primary px-3 py-2 text-sm whitespace-pre-wrap'
                  }
                >
                  {message.content}
                </div>
                {message.role === 'assistant' && renderRecommendations(message.recommendations)}
              </div>
            ))}
            {loading && (
              <div className="mr-auto w-fit max-w-[85%] rounded-2xl bg-primary/5 text-primary px-3 py-2 text-sm">
                {t({ id: 'Sedang memikirkan...', en: 'Thinking...' })}
              </div>
            )}
          </div>

          <div className="px-4 pt-2 pb-3 bg-white/75 border-t border-primary/10">
            <div className="flex flex-wrap gap-2 mb-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition"
                  onClick={() => handleSend(t(prompt.text))}
                >
                  {t(prompt.text)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t({ id: 'Tulis pertanyaanmu...', en: 'Type your question...' })}
                className="flex-1 rounded-full border border-primary/30 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition disabled:opacity-50 shadow-md"
                disabled={loading}
                aria-label={t({ id: 'Kirim pesan', en: 'Send message' })}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(0,0,0,0.25)] ring-1 ring-black/10 flex items-center justify-center hover:opacity-90 transition"
          aria-label={t({ id: 'Buka chat AI', en: 'Open AI chat' })}
        >
          <span className="absolute -inset-0.5 rounded-full bg-primary/30 animate-ping" aria-hidden="true" />
          <span className="absolute -inset-1 rounded-full border border-primary/30 opacity-70" aria-hidden="true" />
          <MessageCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
