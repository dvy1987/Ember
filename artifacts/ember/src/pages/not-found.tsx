import { Link } from "wouter";
import DragonScene from "@/components/DragonScene";
import { ArrowLeftIcon } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 text-center p-8 max-w-md">
        <div className="flex justify-center mb-6">
          <DragonScene type="drift" stage="adolescent" size={160} />
        </div>
        <p className="font-mono-caps text-[10px] text-ember-text-muted mb-2">404</p>
        <h1 className="font-display text-[40px] text-ember-text leading-tight mb-3">
          The dragons drifted elsewhere.
        </h1>
        <p className="font-serif-body italic text-[15px] text-ember-text-muted mb-8">
          This page flew away on the wind. Let's get you back to the keep.
        </p>
        <Link
          href="/"
          className="cta-ember inline-flex items-center gap-2 px-6 py-3 font-mono-caps text-[11px]"
        >
          <ArrowLeftIcon size={13} /> Back to the Roost
        </Link>
      </div>
    </div>
  );
}
