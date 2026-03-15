'use client';

import { useEffect, useState } from 'react';
import { ThreadMessage } from '@/lib/supabase';

export default function ThreadPage() {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch('/api/thread')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching thread messages:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });
      if (res.ok) {
        setContent('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch (err) {
      console.error('Error submitting message:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xs text-zinc-600 tracking-widest uppercase">Loading</div>
      </div>
    );
  }

  const VISIBLE_COUNT = 10;
  const count = messages.length;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-6 lg:p-12 pb-0">
        <h1 className="text-2xl lg:text-3xl font-light text-white tracking-wide">Thread</h1>
        <p className="text-zinc-500 text-sm mt-2">Anonymous messages from visitors</p>
      </div>

      {/* 3D Carousel */}
      <div className="flex-1 flex items-center justify-center px-6">
        {count === 0 ? (
          <p className="text-zinc-600 text-sm">No messages yet. Be the first to leave one.</p>
        ) : (
          <div
            className="cylinder-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className={`cylinder ${isPaused ? 'cylinder--paused' : ''}`}
              style={{ '--total': Math.max(count, VISIBLE_COUNT) } as React.CSSProperties}
            >
              {messages.map((msg, i) => {
                const total = Math.max(count, VISIBLE_COUNT);
                const angle = (360 / total) * i;
                return (
                  <div
                    key={msg.id}
                    className="cylinder-item"
                    style={{
                      '--angle': `${angle}deg`,
                    } as React.CSSProperties}
                  >
                    <p className="text-sm text-zinc-300 leading-relaxed">{msg.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Submit Form */}
      <div className="p-6 lg:p-12 pt-0">
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          {submitted && (
            <p className="text-xs text-zinc-500 mb-3">
              Message sent. It will appear once approved.
            </p>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Leave a message..."
              maxLength={500}
              className="flex-1 bg-transparent border border-zinc-800 text-white text-sm px-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-700"
            />
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="px-6 py-3 bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? '...' : 'Send'}
            </button>
          </div>
          <p className="text-xs text-zinc-700 mt-2 text-right">{content.length}/500</p>
        </form>
      </div>

      {/* CSS for 3D Cylinder */}
      <style jsx>{`
        .cylinder-container {
          perspective: 1200px;
          width: 100%;
          max-width: 500px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .cylinder-container {
            height: 300px;
            max-width: 100%;
          }
        }

        .cylinder {
          width: 100%;
          height: 60px;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate-cylinder 30s linear infinite;
        }

        .cylinder--paused {
          animation-play-state: paused;
        }

        @keyframes rotate-cylinder {
          from { transform: rotateX(0deg); }
          to { transform: rotateX(-360deg); }
        }

        .cylinder-item {
          position: absolute;
          width: 100%;
          padding: 12px 20px;
          text-align: center;
          backface-visibility: hidden;
          transform: rotateX(var(--angle)) translateZ(200px);
        }

        @media (max-width: 768px) {
          .cylinder-item {
            transform: rotateX(var(--angle)) translateZ(140px);
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
}
