'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { ThreadMessage } from '@/lib/supabase';

export default function AdminThread() {
  const router = useRouter();
  const [pendingMessages, setPendingMessages] = useState<ThreadMessage[]>([]);
  const [approvedMessages, setApprovedMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  const fetchMessages = async () => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch('/api/thread?status=pending'),
        fetch('/api/thread'),
      ]);

      if (pendingRes.status === 401) {
        router.push('/admin/login');
        return;
      }

      const pending = await pendingRes.json();
      const approved = await approvedRes.json();

      setPendingMessages(Array.isArray(pending) ? pending : []);
      setApprovedMessages(Array.isArray(approved) ? approved : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      router.push('/admin/login');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/thread/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      fetchMessages();
    } catch (error) {
      console.error('Error approving message:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/thread/${id}`, { method: 'DELETE' });
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xs text-zinc-600 tracking-widest uppercase">Loading</div>
      </div>
    );
  }

  const currentMessages = activeTab === 'pending' ? pendingMessages : approvedMessages;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-900">
        <div className="px-6 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-zinc-600 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-lg font-light text-white tracking-wide">Thread Messages</h1>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-12 py-8">
        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-zinc-900">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-sm transition-colors ${
              activeTab === 'pending'
                ? 'text-white border-b border-white'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Pending ({pendingMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-3 text-sm transition-colors ${
              activeTab === 'approved'
                ? 'text-white border-b border-white'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Approved ({approvedMessages.length})
          </button>
        </div>

        {/* Messages */}
        {currentMessages.length === 0 ? (
          <p className="text-zinc-600 text-sm">
            {activeTab === 'pending' ? 'No pending messages' : 'No approved messages'}
          </p>
        ) : (
          <div className="space-y-3">
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start justify-between gap-4 p-4 border border-zinc-900"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 break-words">{msg.content}</p>
                  <p className="text-xs text-zinc-700 mt-2">{formatDate(msg.created_at)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {activeTab === 'pending' && (
                    <button
                      onClick={() => handleApprove(msg.id)}
                      className="p-2 text-green-600 hover:text-green-400 hover:bg-zinc-900 transition-colors"
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 text-red-600 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
