import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ARUN SPD-30 MOBILE OCTAPAD",
  description:
    "How the ARUN SPD-30 MOBILE OCTAPAD Android app collects and handles data.",
};

const COMPANY = "Inphora Pvt Ltd";
const DEVELOPER = "Inphora Developers";
const CONTACT_EMAIL = "contact@inphora.in";
const LAST_UPDATED = "2 September 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-[15px] leading-7 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        Privacy Policy — ARUN SPD-30 MOBILE OCTAPAD
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Last updated: {LAST_UPDATED}
      </p>

      <p className="mt-6">
        This policy explains what information the{" "}
        <strong>ARUN SPD-30 MOBILE OCTAPAD</strong> Android app (&ldquo;the
        app&rdquo;, &ldquo;we&rdquo;) collects, why, and how it is handled.
      </p>

      <Section title="Who we are">
        <p>
          The app is published by <strong>{COMPANY}</strong>. Developer:{" "}
          {DEVELOPER}.
        </p>
        <p className="mt-2">
          Contact:{" "}
          <a
            className="text-blue-600 underline dark:text-blue-400"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>

      <Section title="Summary">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            The app is an offline drum-pad sampler. Your sounds, recordings,
            kits and edits <strong>never leave your device</strong> — they are
            stored only in the app&apos;s private storage.
          </li>
          <li>
            The app requires a one-time <strong>activation code</strong> to
            unlock. To validate that code and enforce one-device-per-code
            licensing, the app sends a <strong>device identifier</strong> and
            the activation code to our licensing server.
          </li>
          <li>
            We do <strong>not</strong> show ads, we do <strong>not</strong> use
            analytics or tracking SDKs, and we do <strong>not</strong> sell or
            share personal data.
          </li>
        </ul>
      </Section>

      <Section title="What we collect and why">
        <div className="overflow-x-auto">
          <table className="mt-1 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-left dark:border-neutral-700">
                <th className="py-2 pr-3 font-semibold">Data</th>
                <th className="py-2 pr-3 font-semibold">When</th>
                <th className="py-2 pr-3 font-semibold">Why</th>
                <th className="py-2 font-semibold">Sent off device?</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <Row
                d="Activation code"
                w="When you activate"
                y="Unlock the app; bind the code to one device"
                s="Yes — to our licensing server"
              />
              <Row
                d="Device identifier (Android ANDROID_ID, or a random ID if unavailable)"
                w="On activation and on periodic re-checks"
                y={`Enforce "one activation code = one device"; detect if a code was moved to a new device`}
                s="Yes — to our licensing server"
              />
              <Row
                d="Email address / name"
                w="Only if you enter it on the sign-up screen"
                y="Let the code issuer contact you / provide support"
                s="Yes — to our licensing server"
              />
              <Row
                d="Licensing status (active / deactivated, MIDI unlock)"
                w="Periodic background check while the app is open (about every 30 minutes)"
                y="Reflect remote deactivation or a purchased feature unlock"
                s="Request goes out; status comes back"
              />
              <Row
                d="Microphone audio"
                w="Only while you actively record a pad sound"
                y="Let you sample sounds directly into a pad"
                s="No — stays in the app's private storage on your device"
              />
              <Row
                d="Imported audio files"
                w="Only files you pick"
                y="Assign your own sounds to pads"
                s="No — stays on device"
              />
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          The app also stores, <strong>only on your device</strong>: your kits,
          pad settings, recordings, edits, MIDI mappings, and cached activation
          state.
        </p>
      </Section>

      <Section title="Permissions the app requests">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Microphone (RECORD_AUDIO)</strong> — used solely to record a
            sound into a pad when you tap record. Recordings are stored locally.
            Audio is not streamed, uploaded, or used for any other purpose.
          </li>
          <li>
            <strong>Read audio / media files</strong> — so you can import your
            own sound files and assign them to pads. Files are read locally
            only.
          </li>
          <li>
            <strong>Internet / network state</strong> — used only to reach the
            licensing server for activation and periodic license checks.
          </li>
        </ul>
      </Section>

      <Section title="Where data goes">
        <p>
          License and sign-up data is transmitted to our activation service,
          which runs on:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Vercel</strong> (application hosting) —{" "}
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://vercel.com/legal/privacy-policy"
            >
              vercel.com/legal/privacy-policy
            </a>
          </li>
          <li>
            <strong>MongoDB Atlas</strong> (database) —{" "}
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href="https://www.mongodb.com/legal/privacy-policy"
            >
              mongodb.com/legal/privacy-policy
            </a>
          </li>
        </ul>
        <p className="mt-2">
          These providers process the data on our behalf to operate the
          licensing system. No other third parties receive your data.
        </p>
      </Section>

      <Section title="Data retention">
        <p>
          Activation records (activation code, device identifier, and any
          email/name you provided) are retained for as long as the licensing
          system operates, so that a code stays bound to its device and support
          requests can be handled. You can request deletion of your activation
          record (see below); note that deleting it may deactivate the app on
          your device.
        </p>
      </Section>

      <Section title="Children">
        <p>
          The app is a music tool and is not directed at children under 13. We
          do not knowingly collect personal information from children.
        </p>
      </Section>

      <Section title="Your choices and rights">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            You can uninstall the app at any time; this removes all locally
            stored data (kits, recordings, cached license state).
          </li>
          <li>
            You can request access to, correction of, or deletion of the
            activation data associated with your device or email by contacting{" "}
            <a
              className="text-blue-600 underline dark:text-blue-400"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </li>
        </ul>
      </Section>

      <Section title="Security">
        <p>
          Data in transit to the licensing server uses HTTPS. Local data is kept
          in the app&apos;s private, sandboxed storage. Cached activation state
          is excluded from Android&apos;s cloud backup so it cannot be restored
          onto a different device.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If this policy changes materially, we will update the &ldquo;Last
          updated&rdquo; date above and, where appropriate, note it in the
          app&apos;s store listing.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          <strong>{COMPANY}</strong> — {DEVELOPER} —{" "}
          <a
            className="text-blue-600 underline dark:text-blue-400"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Row({
  d,
  w,
  y,
  s,
}: {
  d: string;
  w: string;
  y: string;
  s: string;
}) {
  return (
    <tr className="border-b border-neutral-200 dark:border-neutral-800">
      <td className="py-2 pr-3">{d}</td>
      <td className="py-2 pr-3">{w}</td>
      <td className="py-2 pr-3">{y}</td>
      <td className="py-2">{s}</td>
    </tr>
  );
}
