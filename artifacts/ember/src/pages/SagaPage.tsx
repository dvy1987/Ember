import { useEffect, useState, useCallback } from 'react';
import { useRoute, Link } from 'wouter';
import { Project, SagaEntry, SagaKind } from '@/lib/types';
import {
  ArrowLeftIcon,
  FlameIcon,
  CheckIcon,
  FeatherIcon,
  ClockIcon,
  SparkIcon,
  LeafIcon,
} from '@/components/Icons';

const PAGE_SIZE = 20;

const KIND_LABEL: Record<SagaKind, string> = {
  hatch: 'hatch',
  task_completed: 'task completed',
  ritual_logged: 'ritual logged',
  session_completed: 'session completed',
  stage_changed: 'stage changed',
  season_turn: 'season turn',
};

function KindIcon({ kind }: { kind: SagaKind }) {
  const size = 13;
  switch (kind) {
    case 'hatch':
      return <SparkIcon size={size} />;
    case 'task_completed':
      return <CheckIcon size={size} />;
    case 'ritual_logged':
      return <FeatherIcon size={size} />;
    case 'session_completed':
      return <ClockIcon size={size} />;
    case 'stage_changed':
      return <FlameIcon size={size} />;
    case 'season_turn':
      return <LeafIcon size={size} />;
  }
}

function formatDateHeading(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function SagaPage() {
  const [, params] = useRoute('/saga/:projectId');
  const projectId = params?.projectId ?? '';

  const [project, setProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<SagaEntry[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProject)
      .catch(() => {});
  }, [projectId]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/saga/${projectId}?limit=${PAGE_SIZE}&offset=${offset}`);
      if (res.ok) {
        const next: SagaEntry[] = await res.json();
        setEntries((prev) => [...prev, ...next]);
        setOffset((o) => o + next.length);
        if (next.length < PAGE_SIZE) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, offset, hasMore, isLoading]);

  useEffect(() => {
    setEntries([]);
    setOffset(0);
    setHasMore(true);
  }, [projectId]);

  useEffect(() => {
    if (entries.length === 0 && hasMore && !isLoading) {
      loadMore();
    }
  }, [entries.length, hasMore, isLoading, loadMore]);

  const grouped: { date: string; items: SagaEntry[] }[] = [];
  for (const e of entries) {
    const key = dayKey(e.occurred_at ?? e.created_at);
    const last = grouped[grouped.length - 1];
    if (last && dayKey(last.items[0].occurred_at ?? last.items[0].created_at) === key) {
      last.items.push(e);
    } else {
      grouped.push({ date: e.occurred_at ?? e.created_at, items: [e] });
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-24 pt-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/project/${projectId}`}
            className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
          >
            <ArrowLeftIcon size={14} /> Back to dragon
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="font-serif-display text-[28px] text-ember-text mb-1">
            The saga {project ? `of ${project.name}` : ''}
          </h1>
          <p className="body-sm text-ember-text-muted">
            Every hatch, ritual, task, session, and turning of the wheel — in the order it happened.
          </p>
        </div>

        {entries.length === 0 && !isLoading && (
          <div className="parchment-card p-6">
            <p className="body-sm text-ember-text-muted">
              No saga entries yet. Tend to your dragon and the chronicle will begin.
            </p>
          </div>
        )}

        {grouped.map((group) => (
          <section key={group.date} className="mb-8">
            <h2 className="font-mono-caps text-ember-text-muted mb-3">
              {formatDateHeading(group.date)}
            </h2>
            <ol className="parchment-card p-6 space-y-4">
              {group.items.map((e) => (
                <li
                  key={e.id}
                  className="border-l-2 pl-3 py-0.5"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-2 font-mono-caps text-ember-text-muted mb-1">
                    <KindIcon kind={e.kind} />
                    <span>{KIND_LABEL[e.kind]}</span>
                    {e.season_at_time && (
                      <span aria-hidden="true">· {e.season_at_time}</span>
                    )}
                  </div>
                  <p className="body-sm text-ember-text leading-snug">
                    {e.entry_text}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <div className="flex justify-center mt-6">
          {hasMore ? (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors px-4 py-2 disabled:opacity-50"
            >
              {isLoading ? 'turning the page…' : 'Read earlier entries'}
            </button>
          ) : entries.length > 0 ? (
            <p className="font-mono-caps text-ember-text-muted">
              the saga begins here
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
