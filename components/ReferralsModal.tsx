
import React, { useState } from 'react';
import { UsersIcon } from './icons/UsersIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { MailIcon } from './icons/MailIcon';
import { CogIcon } from './icons/CogIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { safeFetch } from '../lib/network';

interface ReferralsModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralLink: string;
}

const ReferralsModal: React.FC<ReferralsModalProps> = ({ isOpen, onClose, referralLink }) => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
        const data = await safeFetch<{ ok: boolean, message?: string, error?: string }>('/api/referral/send-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, referralLink }),
        });

        if (!data.ok) {
            throw new Error(data.error || 'Failed to send invite.');
        }

        setSuccess(data.message || 'Invite sent successfully!');
        setEmail('');

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" 
        onClick={onClose} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="referrals-title"
    >
      <div 
        className="bg-dark-bg border-2 border-cyan shadow-neon-cyan rounded-xl p-8 max-w-lg w-full mx-4 relative" 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-3xl leading-none" aria-label="Close">
          &times;
        </button>
        
        <div className="flex flex-col items-center text-center">
            <UsersIcon className="h-12 w-12 text-cyan mb-3" />
            <h2 id="referrals-title" className="text-3xl font-orbitron font-bold text-cyan">Invite Your Friends</h2>
            <p className="text-gray-300 mt-2 mb-6">
                Invite friends and get a free month of Pro when they sign up!
            </p>

            <div className="w-full space-y-4">
                <div>
                    <label htmlFor="referral-link" className="text-sm font-semibold text-gray-400">Your unique referral link</label>
                    <div className="mt-2 flex items-center gap-2">
                        <input
                            id="referral-link"
                            type="text"
                            readOnly
                            value={referralLink}
                            className="w-full px-4 py-2 bg-dark-secondary border border-glass-border rounded-md text-gray-200 placeholder-gray-500 focus:outline-none"
                        />
                        <button 
                            onClick={handleCopyLink}
                            className="flex-shrink-0 px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors"
                        >
                            {isCopied ? 'Copied!' : <ClipboardIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-glass-border"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow border-t border-glass-border"></div>
                </div>

                <form onSubmit={handleSendInvite} className="w-full">
                    <label htmlFor="email-invite" className="text-sm font-semibold text-gray-400">Send an email invite</label>
                    <div className="mt-2 flex items-center gap-2">
                        <input
                            id="email-invite"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="friend@example.com"
                            className="w-full px-4 py-2 bg-dark-secondary border border-glass-border rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-magenta"
                            aria-label="Friend's Email"
                        />
                         <button
                            type="submit"
                            disabled={isSending || !email.trim()}
                            className="flex-shrink-0 w-28 h-[42px] flex items-center justify-center px-4 py-2 bg-cyan text-dark-bg font-bold rounded-md hover:bg-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isSending ? <CogIcon className="h-5 w-5 animate-spin"/> : 'Send'}
                        </button>
                    </div>
                </form>

                <div className="min-h-[24px] text-sm">
                    {success && <p className="text-green-400 flex items-center justify-center gap-2"><CheckIcon className="h-4 w-4" />{success}</p>}
                    {error && <p className="text-red-400 flex items-center justify-center gap-2"><ErrorIcon className="h-4 w-4" />{error}</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsModal;