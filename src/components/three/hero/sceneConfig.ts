export type HeroQualityLevel = "low" | "medium" | "high";

export interface HeroScenePreset {
  antialias: boolean;
  dpr: [number, number];
  icosahedronDetail: number;
  orbitNodeCount: number;
  panelCount: number;
  particleCount: number;
  ringSegments: number;
}

export const heroSceneConfig = {
  camera: {
    desktopPosition: [0, 0, 8.6] as [number, number, number],
    mobilePosition: [0, 0, 9.4] as [number, number, number],
  },
  colors: {
    accent: "#DBD4CC",
    accentSoft: "#EDEAE5",
    backdrop: "#161616",
    primary: "#6F6251",
    primaryLight: "#938470",
    surface: "#1F211C",
    surfaceSoft: "#474237",
    text: "#EDEAE5",
  },
  panelLayouts: [
    {
      position: [2.85, 1.4, -1.15] as [number, number, number],
      rotation: [-0.18, -0.58, 0.24] as [number, number, number],
      scale: 1,
    },
    {
      position: [3.2, -1.05, -1.55] as [number, number, number],
      rotation: [0.34, -0.82, -0.22] as [number, number, number],
      scale: 0.82,
    },
    {
      position: [-2.15, 1.75, -2.1] as [number, number, number],
      rotation: [0.2, 0.54, -0.1] as [number, number, number],
      scale: 0.72,
    },
  ],
  presets: {
    low: {
      antialias: false,
      dpr: [1, 1.15] as [number, number],
      icosahedronDetail: 1,
      orbitNodeCount: 6,
      panelCount: 1,
      particleCount: 30,
      ringSegments: 56,
    },
    medium: {
      antialias: true,
      dpr: [1, 1.5] as [number, number],
      icosahedronDetail: 1,
      orbitNodeCount: 10,
      panelCount: 2,
      particleCount: 54,
      ringSegments: 80,
    },
    high: {
      antialias: true,
      dpr: [1, 2] as [number, number],
      icosahedronDetail: 2,
      orbitNodeCount: 14,
      panelCount: 3,
      particleCount: 84,
      ringSegments: 112,
    },
  } satisfies Record<HeroQualityLevel, HeroScenePreset>,
} as const;
