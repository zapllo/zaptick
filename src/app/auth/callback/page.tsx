'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Instagram } from 'lucide-react';

function InstagramCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Instagram connection...');
  const [accountInfo, setAccountInfo] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Instagram OAuth error: ${error}`);
        }

        if (!code || state !== 'instagram_connect') {
          throw new Error('Invalid OAuth response');
        }

        setMessage('Exchanging code for access token...');

        // Exchange code for access token and connect account
        const response = await fetch('/api/instagram/oauth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to connect Instagram account');
        }

        setAccountInfo(data.account);
        setStatus('success');
        setMessage('Instagram account connected successfully!');

        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push('/home');
        }, 3000);

      } catch (error) {
        console.error('Instagram callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to connect Instagram account');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Instagram className="h-16 w-16 text-pink-500" />
                <Loader2 className="h-8 w-8 text-pink-600 animate-spin absolute -top-2 -right-2" />
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Instagram className="h-16 w-16 text-pink-500" />
                <CheckCircle className="h-8 w-8 text-green-500 absolute -top-2 -right-2" />
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Instagram className="h-16 w-16 text-gray-400" />
                <XCircle className="h-8 w-8 text-red-500 absolute -top-2 -right-2" />
              </div>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'processing' && 'Connecting Instagram'}
          {status === 'success' && 'Connection Successful!'}
          {status === 'error' && 'Connection Failed'}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'success' && accountInfo && (
          <div className="bg-pink-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 justify-center">
              <img
                src={accountInfo.profilePictureUrl}
                alt={accountInfo.username}
                className="w-12 h-12 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
              <div className="text-left">
                <p className="font-semibold text-gray-900">@{accountInfo.username}</p>
                <p className="text-sm text-gray-600">{accountInfo.followersCount?.toLocaleString()} followers</p>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-sm text-gray-500">
            Redirecting to home in a few seconds...
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => router.push('/home')}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Instagram className="h-16 w-16 text-pink-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        <p className="text-gray-600">Please wait while we process your request.</p>
      </div>
    </div>
  );
}

export default function InstagramCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InstagramCallbackContent />
    </Suspense>
  );
}