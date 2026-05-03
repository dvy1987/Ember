import { Link } from 'wouter';
import DragonScene from '@/components/DragonScene';
import { DRAGON_STAGES, DragonType, DragonStage } from '@/lib/types';

const TYPES: DragonType[] = ['cinder', 'moss', 'drift', 'frost'];
const TYPE_LABEL: Record<DragonType, string> = {
  cinder: 'Cinder',
  moss: 'Moss',
  drift: 'Drift',
  frost: 'Frost',
};
const TYPE_BLURB: Record<DragonType, string> = {
  cinder: 'Forge-born — fire, embers, restless flame.',
  moss: 'Earth-born — slow, rooted, patient growth.',
  drift: 'Sky-born — quick, ethereal, wandering.',
  frost: 'Winter-born — patient, exact, kept by the cold.',
};

// Kind > Stage hierarchy: kind name leads, stage is a soft modifier.
const STAGE_PHRASE: Record<DragonStage, string> = {
  egg: 'just an egg',
  hatchling: 'a hatchling',
  adolescent: 'a teen',
  adult: 'an adult',
  ancient: 'ancient',
};

export default function MenageriePage() {
  return (
    <div className="min-h-screen relative menagerie-page">
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24 pt-12">
        <header className="flex flex-col items-center text-center mb-10">
          <div className="font-mono-caps text-ember-text-muted opacity-80 mb-2">
            Roost <span className="mx-2">·</span> Developer <span className="mx-2">·</span> Menagerie
          </div>
          <h1 className="font-display text-[40px] text-ember-text mb-3">The Menagerie</h1>
          <p className="body text-ember-text-muted max-w-xl">
            Every dragon, every stage. A keeper's gallery for verifying that each one breathes,
            sways, and glows the way it ought to.
          </p>
          <Link
            href="/"
            className="font-mono-caps text-ember-text-muted mt-4 hover:text-ember-text"
          >
            ← back to the keep
          </Link>
        </header>

        <div className="space-y-12">
          {TYPES.map(type => (
            <section key={type}>
              <div className="mb-5 pl-2">
                <div className="font-mono-caps text-ember-text-muted">
                  {TYPE_LABEL[type]}
                </div>
                <p className="body-sm text-ember-text-muted">
                  {TYPE_BLURB[type]}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {DRAGON_STAGES.map(({ stage }) => (
                  <div
                    key={`${type}-${stage}`}
                    className="parchment-card flex flex-col items-center p-4"
                  >
                    <div
                      style={{ width: 200, height: 200, overflow: 'hidden', borderRadius: 8 }}
                      className="flex items-center justify-center"
                    >
                      <DragonScene type={type} stage={stage} size={200} />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="body-sm text-ember-text">
                        {TYPE_LABEL[type]}, {STAGE_PHRASE[stage]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
