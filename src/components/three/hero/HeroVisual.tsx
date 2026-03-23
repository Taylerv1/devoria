"use client";

import HeroSceneCanvas from "./HeroSceneCanvas";
import HeroVisualFallback from "./HeroVisualFallback";
import { useHeroSceneSettings } from "./useHeroSceneSettings";

export default function HeroVisual() {
  const settings = useHeroSceneSettings();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <HeroVisualFallback reducedMotion={settings.prefersReducedMotion} />

      {settings.hasWebGL ? <HeroSceneCanvas settings={settings} /> : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(219,212,204,0.05)_0%,rgba(22,22,22,0.18)_42%,rgba(22,22,22,0.78)_100%)]" />
    </div>
  );
}
