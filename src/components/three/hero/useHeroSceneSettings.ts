"use client";

import { useEffect, useMemo, useState } from "react";
import {
  heroSceneConfig,
  type HeroQualityLevel,
  type HeroScenePreset,
} from "./sceneConfig";

interface NavigatorWithPerformanceHints extends Navigator {
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
  };
  deviceMemory?: number;
}

export interface HeroSceneSettings extends HeroScenePreset {
  allowParallax: boolean;
  hasWebGL: boolean;
  isCompact: boolean;
  prefersReducedMotion: boolean;
  powerPreference: WebGLPowerPreference;
  quality: HeroQualityLevel;
  sceneOffset: [number, number, number];
  sceneScale: number;
}

const prefersReducedMotionQuery = "(prefers-reduced-motion: reduce)";
const coarsePointerQuery = "(pointer: coarse)";

function getViewport() {
  if (typeof window === "undefined") {
    return { height: 0, width: 0 };
  }

  return { height: window.innerHeight, width: window.innerWidth };
}

function getInitialMatch(query: string) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(query).matches;
}

function supportsWebGL() {
  if (typeof document === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");

    return Boolean(
      canvas.getContext("webgl2", { alpha: true }) ||
        canvas.getContext("webgl", { alpha: true }) ||
        canvas.getContext("experimental-webgl", { alpha: true })
    );
  } catch {
    return false;
  }
}

function bindMediaQuery(
  query: MediaQueryList,
  callback: (event: MediaQueryListEvent) => void
) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", callback);

    return () => query.removeEventListener("change", callback);
  }

  query.addListener(callback);

  return () => query.removeListener(callback);
}

export function useHeroSceneSettings(): HeroSceneSettings {
  const [viewport, setViewport] = useState(getViewport);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    getInitialMatch(prefersReducedMotionQuery)
  );
  const [isCoarsePointer, setIsCoarsePointer] = useState(() =>
    getInitialMatch(coarsePointerQuery)
  );
  const [hasWebGL] = useState(supportsWebGL);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const reducedMotionMedia = window.matchMedia(prefersReducedMotionQuery);
    const coarsePointerMedia = window.matchMedia(coarsePointerQuery);

    const syncViewport = () => setViewport(getViewport());
    const syncReducedMotion = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);
    const syncCoarsePointer = (event: MediaQueryListEvent) =>
      setIsCoarsePointer(event.matches);

    syncViewport();
    setPrefersReducedMotion(reducedMotionMedia.matches);
    setIsCoarsePointer(coarsePointerMedia.matches);

    window.addEventListener("resize", syncViewport, { passive: true });

    const detachReducedMotion = bindMediaQuery(
      reducedMotionMedia,
      syncReducedMotion
    );
    const detachCoarsePointer = bindMediaQuery(
      coarsePointerMedia,
      syncCoarsePointer
    );

    return () => {
      window.removeEventListener("resize", syncViewport);
      detachReducedMotion();
      detachCoarsePointer();
    };
  }, []);

  return useMemo(() => {
    const navigatorHints =
      typeof navigator === "undefined"
        ? null
        : (navigator as NavigatorWithPerformanceHints);

    const deviceMemory = navigatorHints?.deviceMemory ?? 8;
    const hardwareConcurrency = navigatorHints?.hardwareConcurrency ?? 8;
    const saveData = navigatorHints?.connection?.saveData ?? false;
    const effectiveType = navigatorHints?.connection?.effectiveType ?? "4g";
    const isCompact = viewport.width > 0 && viewport.width < 768;
    const isTablet = viewport.width >= 768 && viewport.width < 1280;

    const lowPowerDevice =
      saveData ||
      effectiveType === "2g" ||
      effectiveType === "3g" ||
      deviceMemory <= 4 ||
      hardwareConcurrency <= 4;

    const quality: HeroQualityLevel = prefersReducedMotion || lowPowerDevice
      ? "low"
      : isCompact || isCoarsePointer || isTablet
        ? "medium"
        : "high";

    const preset = heroSceneConfig.presets[quality];

    return {
      ...preset,
      allowParallax:
        !prefersReducedMotion && !isCoarsePointer && viewport.width >= 1024,
      hasWebGL,
      isCompact,
      prefersReducedMotion,
      powerPreference:
        quality === "high"
          ? "high-performance"
          : quality === "medium"
            ? "default"
            : "low-power",
      quality,
      sceneOffset: isCompact
        ? [0, -0.32, 0]
        : isTablet
          ? [1.05, 0.02, 0]
          : [1.72, 0.1, 0],
      sceneScale: isCompact ? 0.76 : isTablet ? 0.88 : 1,
    };
  }, [hasWebGL, isCoarsePointer, prefersReducedMotion, viewport]);
}
