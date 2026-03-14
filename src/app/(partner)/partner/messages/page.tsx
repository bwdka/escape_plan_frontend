'use client';

import { useEffect, useRef, useState } from 'react';
import { useMessageThreads, useThreadMessages, useSendMessage } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PartnerMessagesPage() {
  const { user } = useAuthStore();
  const { data: threads = [] } = useMessageThreads();
  const [activeId, setActiveId] = useState<number | null>(threads[0]?.id ?? null);
  const { data: messages = [] } = useThreadMessages(activeId ?? undefined);
  const [draft, setDraft] = useState('');
  const { mutate: sendMessage, isPending } = useSendMessage(activeId ?? undefined);
  const listRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!draft.trim() || !activeId) return;
    sendMessage(draft.trim());
    setDraft('');
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, activeId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-3">Threads</p>
        <div className="space-y-2">
          {threads.map((t) => (
            <button
              key={t.id}
              className={`w-full text-left rounded-2xl px-4 py-3 border transition-all ${activeId === t.id ? 'border-primary/30 bg-primary/5' : 'border-white/70 bg-white/60 hover:bg-white'}`}
              onClick={() => setActiveId(t.id)}
            >
              <div className="font-black text-sm text-primary">{t.other_user?.name || 'Guest'}</div>
              <div className="text-[10px] text-primary/50">{t.glamping_name || 'Glamping'}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-xl flex flex-col min-h-[500px]">
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto">
          {messages.map((m) => {
            const isMine = user?.id === m.sender_id;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-primary text-white' : 'bg-white border border-primary/10 text-primary'}`}>
                  <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">{m.sender_name || 'User'}</div>
                  <div>{m.body}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pt-4 border-t border-primary/10 flex gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." className="rounded-2xl" />
          <Button onClick={handleSend} disabled={isPending || !activeId} className="rounded-2xl">Send</Button>
        </div>
      </div>
    </div>
  );
}
