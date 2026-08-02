import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser";

const SPINES = [
  { color: "bg-shelf-green", label: "Reading" },
  { color: "bg-shelf-gold", label: "Reading" },
  { color: "bg-shelf-rust", label: "Want to read" },
  { color: "bg-shelf-green-dark", label: "Completed" },
  { color: "bg-ink-soft", label: "Completed" },
  { color: "bg-shelf-gold-dark", label: "Want to read" },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 py-8">
        <span className="font-display text-xl font-semibold tracking-tight">Shelfwise</span>
        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="grid flex-1 grid-cols-1 items-center gap-12 py-12 md:grid-cols-2 md:py-20">
        <div className="animate-fade-in">
          <p className="mb-4 font-body text-sm font-semibold uppercase tracking-[0.2em] text-shelf-green">
            A shelf that remembers
          </p>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Your reading life,
            <br />
            <span className="italic text-shelf-green">quietly organized.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
            Shelfwise is a calm home for what you&rsquo;re reading, what&rsquo;s next, and what you&rsquo;ve
            finished. No noise, no ratings pressure — just your shelf, exactly as you keep it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Start your shelf
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              I already have one
            </Link>
          </div>
        </div>

        <div className="flex items-end justify-center gap-2 overflow-x-hidden sm:gap-3 md:justify-end" aria-hidden="true">
          {SPINES.map((spine, i) => (
            <div
              key={i}
              className={`${spine.color} w-8 animate-slide-up rounded-t-sm shadow-card sm:w-10 md:w-11`}
              style={{
                height: `${9 + ((i * 37) % 6)}rem`,
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 border-t border-ink/10 py-12 sm:grid-cols-3">
        {[
          {
            title: "One shelf, three shelves",
            body: "Want to read, reading, and completed — sorted the way you actually think about books.",
          },
          {
            title: "Tag it your way",
            body: "Group by mood, genre, or that book club you keep meaning to follow up with.",
          },
          {
            title: "Yours alone",
            body: "Every account is private by default. Your shelf is never anyone else's business.",
          },
        ].map((f) => (
          <div key={f.title} className="card p-5">
            <h3 className="mb-1.5 text-base font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-ink-soft">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="py-8 text-center text-xs text-ink-faint">
        Built with Next.js, MongoDB, and a genuine love of bookshelves.
      </footer>
    </main>
  );
}
