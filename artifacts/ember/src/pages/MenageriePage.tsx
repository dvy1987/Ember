import { Link } from 'wouter';
import DragonScene from '@/components/DragonScene';
import { DRAGON_STAGES, DragonType, DragonStage } from '@/lib/types';

const TYPES: DragonType[] = ['cinder', 'moss', 'drift'];
const TYPE_LABEL: Record<DragonType, string> = {
  cinder: 'Cinder',
  moss: 'Moss',
  drift: 'Drift',
};
const TYPE_BLURB: Record<DragonType, string> = {
  cinder: 'Forge-born — fire, embers, restless flame.',
  moss: 'Earth-born — slow, rooted, patient growth.',
  drift: 'Sky-born — quick, ethereal, wandering.',
};

function stageLabel(s: DragonStage) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function MenageriePage() {
  return (
    <div className="min-h-screen relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24 pt-12">
        <header className="flex flex-col items-center text-center mb-10">
          <div className="font-mono-caps text-[10px] text-ember-text-muted opacity-80 mb-2">
            Ember Keep <span className="mx-2">·</span> Developer <span className="mx-2">·</span> Menagerie
          </div>
          <h1 className="font-display text-[40px] text-ember-text mb-3">The Menagerie</h1>
          <p className="font-serif-body italic text-ember-text-muted max-w-xl">
            Every dragon, every stage. A keeper's gallery for verifying that each one breathes,
            sways, and glows the way it ought to.
          </p>
          <Link
            href="/"
            className="font-mono-caps text-[10px] text-ember-text-muted mt-4 hover:text-ember-text"
          >
            ← back to the roost
          </Link>
        </header>

        <div className="space-y-12">
          {TYPES.map(type => (
            <section key={type}>
              <div className="mb-5 pl-2">
                <div className="font-mono-caps text-[10px] text-ember-text-muted">
                  {TYPE_LABEL[type]}
                </div>
                <p className="font-serif-body italic text-ember-text-muted text-[13px]">
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
                      <div className="font-mono-caps text-[10px] text-ember-text">
                        {stageLabel(stage)} <span className="mx-1.5 text-ember-text-muted">•</span> {TYPE_LABEL[type]}
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
