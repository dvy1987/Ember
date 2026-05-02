import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-ember-bg">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🐉</div>
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-ember-text-muted mb-6">This page flew away with the dragons.</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-ember-cinder text-ember-bg font-semibold hover:scale-[1.02] transition-all inline-block"
        >
          Back to Dragon Roost
        </Link>
      </div>
    </div>
  );
}
