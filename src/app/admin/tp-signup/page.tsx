// /app/admin/tp-signup/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type NumberItem = {
  id: string;                    // phone_number_id
  display_phone_number: string;  // +91xxxx...
  verified_name?: string;
};

type EventItem = {
  _id: string;
  createdAt: string;
  eventType: string;
  wabaId?: string;
  phoneNumberId?: string;
  raw: any;
};

type UserOption = {
  id: string;
  name: string;
  email: string;
  wabas: { wabaId: string; phoneNumberId: string; status: string }[];
};

const SOLUTION_ID = process.env.NEXT_PUBLIC_SOLUTION_ID || '';

export default function AdminTpSignupPage() {
  const [userId, setUserId] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const [wabaId, setWabaId] = useState('');
  const [solutionId] = useState(SOLUTION_ID); // locked from env
  const [businessName, setBusinessName] = useState('');

  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [selectedPnId, setSelectedPnId] = useState<string>('');
  const [selectedMsisdn, setSelectedMsisdn] = useState<string>('');
  const [loadingNums, setLoadingNums] = useState(false);

  const [callingSignup, setCallingSignup] = useState(false);
  const [signupResult, setSignupResult] = useState<any>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = !!userId && !!wabaId;
  const canSignup = !!userId && !!wabaId && !!solutionId;

  // ─────────────────────────────────────────────────────────────
  // Debounced user search
  // ─────────────────────────────────────────────────────────────
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // open dropdown whenever typing
    if (userQuery && !userId) setUserOpen(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!userQuery) {
      setUserOptions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setUserLoading(true);
        const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(userQuery)}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        setUserOptions(json?.results || []);
      } catch (e) {
        // ignore; you can toast here
      } finally {
        setUserLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [userQuery, userId]);

  function pickUser(u: UserOption) {
    setUserId(u.id);
    setUserQuery(`${u.name} <${u.email}>`);
    setUserOpen(false);
  }

  // ─────────────────────────────────────────────────────────────
  // Fetch WABA phone numbers
  // ─────────────────────────────────────────────────────────────
  async function fetchNumbers() {
    if (!canFetch) return;
    setLoadingNums(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/interakt/waba-numbers?wabaId=${encodeURIComponent(wabaId)}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      const items: NumberItem[] = data?.data || [];
      setNumbers(items);
      if (items.length) {
        setSelectedPnId(items[0].id);
        setSelectedMsisdn(items[0].display_phone_number);
      } else {
        setSelectedPnId('');
        setSelectedMsisdn('');
      }
    } catch (e: any) {
      setError(`Failed to fetch numbers: ${e.message}`);
    } finally {
      setLoadingNums(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Call TP signup
  // ─────────────────────────────────────────────────────────────
  async function callSignup() {
    if (!canSignup) return;
    setCallingSignup(true);
    setSignupResult(null);
    setError(null);
    try {
      const body: any = {
        userId,
        wabaId,
        solutionId,                 // comes from env
        businessName: businessName || undefined,
        phoneNumber: selectedMsisdn || undefined, // optional MSISDN
      };

      const res = await fetch('/api/interakt/tp-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setSignupResult(json);
      if (!res.ok) setError(json?.error || 'TP-signup failed');
      setPolling(true); // start event polling
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCallingSignup(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Events polling
  // ─────────────────────────────────────────────────────────────
  async function loadEvents() {
    if (!userId && !wabaId) return;
    try {
      const qs = new URLSearchParams();
      if (userId) qs.set('userId', userId);
      if (wabaId) qs.set('wabaId', wabaId);
      const res = await fetch(`/api/admin/interakt/events?${qs.toString()}`);
      if (!res.ok) return;
      const json = await res.json();
      setEvents(json?.events || []);
    } catch { /* ignore */ }
  }

  useEffect(() => { loadEvents(); }, [userId, wabaId]);

  useEffect(() => {
    if (!polling) return;
    const t = setInterval(loadEvents, 3000);
    const stop = setTimeout(() => setPolling(false), 120000); // stop after 2 minutes
    return () => { clearInterval(t); clearTimeout(stop); };
  }, [polling]);

  const eventStatus = useMemo(() => {
    const latest = events[0];
    if (!latest) return '—';
    if (latest.eventType === 'WABA_ONBOARDED') return '✅ Onboarded';
    if (latest.eventType === 'WABA_ONBOARDING_FAILED') return '❌ Failed';
    if (latest.eventType === 'PARTNER_ADDED') return '⏳ Pending';
    return latest.eventType;
  }, [events]);

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Interakt TP Onboarding</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="font-medium">1) Pick user & WABA</h2>

          {/* Searchable User Combobox */}
          <label className="block text-sm">User</label>
          <div className="relative">
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="Search by name or email…"
              value={userQuery}
              onChange={e => {
                setUserQuery(e.target.value);
                setUserId(''); // clear until a row is picked
              }}
              onFocus={() => userOptions.length && setUserOpen(true)}
            />
            {userLoading && (
              <span className="absolute right-2 top-2 text-xs text-gray-500">loading…</span>
            )}
            {userOpen && userOptions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-auto">
                {userOptions.map(u => (
                  <button
                    key={u.id}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    onClick={() => pickUser(u)}
                    type="button"
                  >
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-gray-600">{u.email}</div>
                    {u.wabas?.length > 0 && (
                      <div className="text-[11px] text-gray-500 mt-1">
                        {u.wabas.slice(0, 2).map(w => `${w.wabaId} (${w.status})`).join(' • ')}
                        {u.wabas.length > 2 ? ' …' : ''}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WABA input */}
          <label className="block text-sm mt-2">WABA (Asset) ID</label>
          <input className="w-full border rounded-md px-3 py-2"
                 placeholder="e.g. 6785..." value={wabaId}
                 onChange={e => setWabaId(e.target.value)} />

          <div className="flex items-center gap-3">
            <button onClick={fetchNumbers} disabled={!canFetch || loadingNums}
                    className="px-3 py-2 rounded-md bg-black text-white disabled:opacity-50">
              {loadingNums ? 'Fetching…' : 'Fetch phone numbers'}
            </button>
            <span className="text-sm text-gray-500">{numbers.length ? `${numbers.length} numbers` : '—'}</span>
          </div>

          {!!numbers.length && (
            <>
              <label className="block text-sm mt-2">Pick number (optional)</label>
              <select className="w-full border rounded-md px-3 py-2"
                      value={selectedPnId}
                      onChange={e => {
                        const pn = numbers.find(n => n.id === e.target.value);
                        setSelectedPnId(e.target.value);
                        setSelectedMsisdn(pn?.display_phone_number || '');
                      }}>
                {numbers.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.display_phone_number}  •  id: {n.id.slice(0,6)}…
                  </option>
                ))}
              </select>

              <label className="block text-xs text-gray-500 mt-2">
                MSISDN (sent to Interakt’s tp-signup as <code>phoneNumber</code>) — you can edit if needed
              </label>
              <input className="w-full border rounded-md px-3 py-2"
                     placeholder="+91xxxxxxxxxx" value={selectedMsisdn}
                     onChange={e => setSelectedMsisdn(e.target.value)} />
            </>
          )}
        </div>

        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="font-medium">2) Configure signup</h2>

          {/* Solution ID shown read-only (comes from env) */}
          <label className="block text-sm">Solution ID</label>
          <input
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
            value={solutionId}
            readOnly
            title="Loaded from NEXT_PUBLIC_SOLUTION_ID"
          />

          <label className="block text-sm mt-2">Business Name (optional)</label>
          <input className="w-full border rounded-md px-3 py-2"
                 placeholder="Shown in your DB only" value={businessName}
                 onChange={e => setBusinessName(e.target.value)} />

          <button onClick={callSignup} disabled={!canSignup || callingSignup}
                  className="px-3 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-50">
            {callingSignup ? 'Calling Interakt…' : 'Call TP-Signup'}
          </button>

          {signupResult && (
            <div className="mt-2 text-xs bg-gray-50 border rounded-md p-3 overflow-auto">
              <pre>{JSON.stringify(signupResult, null, 2)}</pre>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <div className="border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">3) Webhook events (latest first)</h2>
          <div className="text-sm">
            Status: <span className="font-medium">{eventStatus}</span>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          {events.length === 0 && <p className="text-sm text-gray-500">No events yet.</p>}
          {events.map(ev => (
            <div key={ev._id} className="border rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium">{ev.eventType}</span>
                <span className="text-gray-500"> • {new Date(ev.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                wabaId: {ev.wabaId || '—'} · phoneNumberId: {ev.phoneNumberId || '—'}
              </div>
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">raw</summary>
                <pre className="text-xs overflow-auto mt-1 bg-gray-50 p-2 rounded">
                  {JSON.stringify(ev.raw, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
