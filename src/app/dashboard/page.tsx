"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type License = {
  code: string;
  deviceId: string | null;
  active: boolean;
  midiPurchased: boolean;
  note: string;
  createdAt: string;
  redeemedAt: string | null;
  lastCheckInAt: string | null;
};

type Signup = {
  deviceId: string;
  name: string;
  phone: string;
  installedAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"licenses" | "signups">("licenses");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [genNote, setGenNote] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [licRes, suRes] = await Promise.all([
      fetch("/api/licenses"),
      fetch("/api/signups"),
    ]);
    if (licRes.status === 401 || suRes.status === 401) {
      router.push("/login");
      return;
    }
    const licData = await licRes.json();
    const suData = await suRes.json();
    setLicenses(licData.licenses ?? []);
    setSignups(suData.signups ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  async function generateCodes() {
    setGenerating(true);
    await fetch("/api/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: genCount, note: genNote }),
    });
    setGenerating(false);
    setGenNote("");
    loadAll();
  }

  async function patchLicense(code: string, patch: Record<string, unknown>) {
    setLicenses((prev) =>
      prev.map((l) => (l.code === code ? { ...l, ...patch } as License : l))
    );
    await fetch(`/api/licenses/${encodeURIComponent(code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    loadAll();
  }

  async function deleteLicense(code: string) {
    if (!confirm(`Delete code ${code}? This can't be undone.`)) return;
    await fetch(`/api/licenses/${encodeURIComponent(code)}`, { method: "DELETE" });
    loadAll();
  }

  const filteredLicenses = licenses.filter((l) =>
    `${l.code} ${l.deviceId ?? ""} ${l.note}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSignups = signups.filter((s) =>
    `${s.name} ${s.phone} ${s.deviceId}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Octapad Admin</h1>
          <p className="text-xs text-neutral-500">Activations, devices &amp; signups</p>
        </div>
        <button
          onClick={logout}
          className="text-sm px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
        >
          Log out
        </button>
      </header>

      <main className="px-6 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <TabButton active={tab === "licenses"} onClick={() => setTab("licenses")}>
            Licenses ({licenses.length})
          </TabButton>
          <TabButton active={tab === "signups"} onClick={() => setTab("signups")}>
            Signups ({signups.length})
          </TabButton>
          <div className="flex-1" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-sm outline-none focus:border-cyan-500 w-56"
          />
        </div>

        {tab === "licenses" && (
          <>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-5 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">How many</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-20 rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm outline-none"
                />
              </div>
              <div className="flex-1 min-w-40">
                <label className="block text-xs text-neutral-500 mb-1">Note (optional)</label>
                <input
                  value={genNote}
                  onChange={(e) => setGenNote(e.target.value)}
                  placeholder="e.g. dealer batch #3"
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm outline-none"
                />
              </div>
              <button
                onClick={generateCodes}
                disabled={generating}
                className="rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-medium px-4 py-1.5 text-sm transition-colors"
              >
                {generating ? "Generating…" : "Generate activation code(s)"}
              </button>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500 border-b border-neutral-800">
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium">Active</th>
                    <th className="px-4 py-3 font-medium">MIDI</th>
                    <th className="px-4 py-3 font-medium">Note</th>
                    <th className="px-4 py-3 font-medium">Last check-in</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-neutral-500">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loading && filteredLicenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-neutral-500">
                        No licenses yet — generate one above.
                      </td>
                    </tr>
                  )}
                  {filteredLicenses.map((l) => (
                    <tr key={l.code} className="border-b border-neutral-800/60 last:border-0">
                      <td className="px-4 py-3 font-mono text-cyan-400">{l.code}</td>
                      <td className="px-4 py-3 text-neutral-400 max-w-40 truncate" title={l.deviceId ?? ""}>
                        {l.deviceId ? l.deviceId : <span className="text-neutral-600">unbound</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Toggle
                          checked={l.active}
                          onChange={(v) => patchLicense(l.code, { active: v })}
                          onColor="bg-emerald-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Toggle
                          checked={l.midiPurchased}
                          onChange={(v) => patchLicense(l.code, { midiPurchased: v })}
                          onColor="bg-cyan-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-neutral-400 max-w-40 truncate">{l.note}</td>
                      <td className="px-4 py-3 text-neutral-500 text-xs">
                        {l.lastCheckInAt ? new Date(l.lastCheckInAt).toLocaleString() : "never"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {l.deviceId && (
                          <button
                            onClick={() => patchLicense(l.code, { unbindDevice: true })}
                            className="text-xs text-neutral-400 hover:text-white mr-3"
                          >
                            Unbind
                          </button>
                        )}
                        <button
                          onClick={() => deleteLicense(l.code)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "signups" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-800">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Device ID</th>
                  <th className="px-4 py-3 font-medium">Installed</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && filteredSignups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                      No signups yet — these appear automatically when the app is installed and opened.
                    </td>
                  </tr>
                )}
                {filteredSignups.map((s) => (
                  <tr key={s.deviceId} className="border-b border-neutral-800/60 last:border-0">
                    <td className="px-4 py-3">{s.name || <span className="text-neutral-600">—</span>}</td>
                    <td className="px-4 py-3">{s.phone || <span className="text-neutral-600">—</span>}</td>
                    <td className="px-4 py-3 text-neutral-500 font-mono text-xs max-w-48 truncate">
                      {s.deviceId}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {new Date(s.installedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
        active ? "bg-cyan-500 text-black font-medium" : "text-neutral-400 hover:bg-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  onColor,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  onColor: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5.5 rounded-full relative transition-colors ${
        checked ? onColor : "bg-neutral-700"
      }`}
      style={{ height: 22, width: 40 }}
    >
      <span
        className="absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-transform"
        style={{
          height: 18,
          width: 18,
          transform: checked ? "translateX(20px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}
