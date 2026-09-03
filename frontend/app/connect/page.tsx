const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "localhost";

export default function ConnectPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-extrabold">
        How to connect<span className="text-osupink">.</span>
      </h1>
      <p className="mt-2 text-neutral-400">
        Three steps to get playing on this server with your own osu! client.
      </p>

      <ol className="mt-8 space-y-6">
        <Step number={1} title="Create an account">
          <p>
            Use the <a href="/register" className="text-osupink hover:underline">sign up page</a> to
            register a username and password. This is the same account you&apos;ll use to log into the
            game.
          </p>
        </Step>

        <Step number={2} title="Launch osu! with -devserver">
          <p>Close osu! if it&apos;s running, then start it from a terminal or a shortcut with:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-950 p-4 text-sm text-osupink">
            <code>osu!.exe -devserver {DOMAIN}</code>
          </pre>
          <p className="mt-2 text-sm text-neutral-500">
            Tip: right-click your osu! shortcut → Properties → append{" "}
            <code className="rounded bg-neutral-800 px-1 py-0.5">-devserver {DOMAIN}</code> to the
            Target field to make this permanent.
          </p>
        </Step>

        <Step number={3} title="Log in with your website credentials">
          <p>
            Enter the same username and password you registered with. You&apos;ll land in-game and
            start submitting scores to this server&apos;s leaderboard immediately.
          </p>
        </Step>
      </ol>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-osupink font-bold text-neutral-950">
        {number}
      </span>
      <div className="flex-1">
        <h2 className="font-semibold">{title}</h2>
        <div className="mt-1 text-sm text-neutral-300">{children}</div>
      </div>
    </li>
  );
}
