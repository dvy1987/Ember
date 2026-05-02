/**
 * CinderAnimated
 *
 * The painterly Cinder bitmap (consistent with every other Ember variant)
 * plus a stack of layered overlays that make her feel ALIVE without
 * fighting the bitmap's anatomy:
 *   - cinder-aura-radial: warm halo behind her, slow breathing pulse
 *   - cinder-aura-pulse:  tighter chest-glow ring (her actual breath)
 *   - cinder-painterly-img: the bitmap itself (inherits .dragon-image
 *     filigree-glow + .dragon-image-container breath-cinder)
 *   - cinder-mouth-breath: a small stream of warm embers rising from her
 *     face area — concentrated, not scene-wide
 *
 * Wrapper layers above (cinder-sway / cinder-bobble / cinder-headturn)
 * still add the global body sway, bobble, and occasional head-turn.
 *
 * Note: we previously tried four free LottieFiles dragons (Nick fire,
 * Timir fly, Summer chibi, Rob TV-logo) — all rejected because none
 * matched Cinder's painterly amber-obsidian western-dragon aesthetic.
 * Vector cartoons cannot match a painterly bitmap, so we layer effects
 * onto the bitmap instead. The lottie packages and assets were removed
 * after the pivot; revisit only if a painterly-style Lottie is sourced.
 */
export function CinderAnimated() {
  return (
    <div
      className="cinder-animated-frame"
      style={{ width: 280, height: 280 }}
    >
      <div className="cinder-aura-radial" aria-hidden />
      <div className="cinder-aura-pulse" aria-hidden />

      <img
        src="/__mockup/images/dragons/cinder/adolescent-cinder.webp"
        alt="Cinder"
        className="dragon-image cinder-painterly-img"
      />

      <div className="cinder-mouth-breath" aria-hidden>
        <span className="cinder-ember e1" />
        <span className="cinder-ember e2" />
        <span className="cinder-ember e3" />
        <span className="cinder-ember e4" />
        <span className="cinder-ember e5" />
      </div>
    </div>
  );
}
