/**
 * CinderAnimated
 *
 * Painterly Cinder bitmap with three layered overlays so she reads as alive
 * without fighting the bitmap's anatomy:
 *   - cinder-aura-radial: warm halo behind her, slow breathing pulse
 *   - cinder-aura-pulse:  tighter chest-glow ring (her actual breath)
 *   - cinder-mouth-breath: small stream of warm embers rising from the face
 *
 * Outer wrappers (cinder-sway / cinder-bobble / cinder-headturn) add the
 * global body sway, bobble, and occasional head-turn.
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
