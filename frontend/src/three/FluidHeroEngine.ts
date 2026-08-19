import * as THREE from 'three';
import type { Theme } from '../types';

/**
 * Cosmic Purple, Blue & Orange Gradient Space Fluid Simulation Engine
 * 
 * Creates a luminous, organic multi-gradient cosmic fluid & stardust animation
 * that flows continuously like interstellar space nebulas, blending purple,
 * deep space blue, and radiant solar orange currents.
 * 
 * Features:
 * - Continuous autonomous fluid motion & space advection (always active even when idle)
 * - Rich chromatic spectrum: Galactic Purple, Electric Ultraviolet, Deep Space Blue,
 *   Radiant Electric Cyan, Solar Orange, and Golden Celestial Sheen
 * - Multi-orbit gravitational space nodes with Lissajous harmonic drift
 * - Domain-warped FBM and curl-noise turbulence simulating cosmic fluid in zero gravity
 * - Interactive cursor gravitational pull, velocity ribbon distortion & shockwaves
 * - Swirling multi-color stardust & ember particle system (purple, blue, orange)
 * - Seamless theme adaptation (deep space dark mode & refined celestial light mode)
 */

interface TrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  size: number;
}

const TRAIL_LENGTH = 16;

export class FluidHeroEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  // Fullscreen Fluid Quad & Material
  private fluidMesh: THREE.Mesh;
  private fluidMaterial: THREE.ShaderMaterial;

  // Cosmic Stardust & Ember Particle System
  private particleCount: number;
  private particleGeometry: THREE.BufferGeometry;
  private particleMaterial: THREE.PointsMaterial;
  private particlePoints: THREE.Points;
  private particlePositions: Float32Array;
  private particleVelocities: Float32Array;
  private particleOriginalAngles: Float32Array;
  private particleRadii: Float32Array;
  private particleSpeeds: Float32Array;
  private particleColors: Float32Array;

  // Trail buffer for shader uniform
  private trail: TrailPoint[] = [];
  private trailUniformPositions: Float32Array;
  private trailUniformVelocities: Float32Array;
  private trailUniformAges: Float32Array;

  // Mouse & Physics State
  private mouse = new THREE.Vector2(0.65, 0.5); // Screen UV [0, 1]
  private smoothMouse = new THREE.Vector2(0.65, 0.5);
  private glowCenter = new THREE.Vector2(0.62, 0.5);
  private lastMouse = new THREE.Vector2(0.65, 0.5);
  private mouseVelocity = new THREE.Vector2(0.0, 0.0);
  private smoothVelocity = new THREE.Vector2(0.0, 0.0);
  private activityIntensity = 0.5;
  private lastMoveTime = 0;
  private clickRipple = 0.0;
  private clickRippleCenter = new THREE.Vector2(0.65, 0.5);

  // Engine state
  private scrollProgress: number = 0;
  private theme: Theme = 'dark';
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();
  private isDestroyed = false;

  constructor(container: HTMLElement, theme: Theme = 'dark') {
    this.container = container;
    this.theme = theme;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    this.particleCount = isMobile ? 45 : 95;

    // Initial mouse positioned off-center
    const initialX = isMobile ? 0.5 : 0.65;
    const initialY = 0.52;
    this.mouse.set(initialX, initialY);
    this.smoothMouse.set(initialX, initialY);
    this.glowCenter.set(initialX, initialY);
    this.lastMouse.set(initialX, initialY);

    // Initialize trail points
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      this.trail.push({
        x: initialX,
        y: initialY,
        vx: 0,
        vy: 0,
        age: (i / TRAIL_LENGTH) * 1.5,
        size: 1.0 - (i / TRAIL_LENGTH) * 0.6,
      });
    }

    this.trailUniformPositions = new Float32Array(TRAIL_LENGTH * 2);
    this.trailUniformVelocities = new Float32Array(TRAIL_LENGTH * 2);
    this.trailUniformAges = new Float32Array(TRAIL_LENGTH);

    // 1. Scene & 2D Orthographic Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // 3. Fullscreen Cosmic Fluid Shader
    const planeGeo = new THREE.PlaneGeometry(2, 2);

    this.fluidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(initialX, initialY) },
        uSmoothMouse: { value: new THREE.Vector2(initialX, initialY) },
        uGlowCenter: { value: new THREE.Vector2(initialX, initialY) },
        uVelocity: { value: new THREE.Vector2(0.0, 0.0) },
        uActivity: { value: 0.5 },
        uScroll: { value: 0.0 },
        uThemeDark: { value: theme === 'dark' ? 1.0 : 0.0 },
        uTrailPositions: { value: this.trailUniformPositions },
        uTrailVelocities: { value: this.trailUniformVelocities },
        uTrailAges: { value: this.trailUniformAges },
        uTrailCount: { value: TRAIL_LENGTH },
        uClickRipple: { value: 0.0 },
        uClickRippleCenter: { value: new THREE.Vector2(initialX, initialY) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        #define TRAIL_LEN 16

        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform vec2 uSmoothMouse;
        uniform vec2 uGlowCenter;
        uniform vec2 uVelocity;
        uniform float uActivity;
        uniform float uScroll;
        uniform float uThemeDark;
        uniform vec2 uTrailPositions[TRAIL_LEN];
        uniform vec2 uTrailVelocities[TRAIL_LEN];
        uniform float uTrailAges[TRAIL_LEN];
        uniform int uTrailCount;
        uniform float uClickRipple;
        uniform vec2 uClickRippleCenter;

        varying vec2 vUv;

        // --- Fast Simplex 2D Noise ---
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        // Fractional Brownian Motion (FBM) with 4 octaves
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * snoise(p);
            p = p * 2.04 + vec2(1.7, 9.2);
            a *= 0.48;
          }
          return v;
        }

        // Curl Noise vector for liquid space turbulence swirls
        vec2 curlNoise(vec2 p) {
          float eps = 0.01;
          float n1 = snoise(p + vec2(eps, 0.0));
          float n2 = snoise(p - vec2(eps, 0.0));
          float n3 = snoise(p + vec2(0.0, eps));
          float n4 = snoise(p - vec2(0.0, eps));
          return vec2((n3 - n4) / (2.0 * eps), -(n1 - n2) / (2.0 * eps));
        }

        void main() {
          vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
          vec2 uv = vUv;
          vec2 uvAspect = uv * aspect;

          // Continuous celestial time (drives non-stop fluid movement in space even when idle)
          float t = uTime * 0.38;

          // 1. Continuous Multi-Scale Space Fluid Turbulence & Domain Warping
          // Dual fluid advection vectors creating zero-g interstellar current drifts
          vec2 p = uv * 2.4;
          vec2 spaceDrift = vec2(
            sin(t * 0.25 + uv.y * 1.5) * 0.12 + t * 0.06,
            cos(t * 0.22 + uv.x * 1.8) * 0.10 - t * 0.05
          );
          vec2 ambientCurl = curlNoise(p * 0.8 + spaceDrift) * 0.45;
          
          vec2 q = vec2(
            fbm(p + ambientCurl + vec2(t * 0.16, -t * 0.08)),
            fbm(p + ambientCurl + vec2(-t * 0.06, t * 0.14) + vec2(5.2, 1.3))
          );

          vec2 r = vec2(
            fbm(p + 2.2 * q + vec2(t * 0.14, -t * 0.12) + vec2(1.7, 9.2)),
            fbm(p + 2.2 * q + vec2(-t * 0.10, t * 0.18) + vec2(8.3, 2.8))
          );

          // Living space fluid density with undulating filaments
          float cosmicDensity = fbm(p + 2.5 * r + spaceDrift * 0.5);

          // 2. Autonomous Space Orbital Drift Nodes
          // Blue is the dominant core; Purple and Orange are subtle drifting accent currents
          vec2 orbitCenterAspect = (uGlowCenter * 0.60 + vec2(0.20, 0.20)) * aspect;

          // Dominant Node: Deep Space Blue & Electric Azure Core (Broadest, most luminous)
          vec2 orbitBlue = orbitCenterAspect + vec2(cos(t * 0.35) * 0.15, sin(t * 0.42) * 0.14);
          vec2 warpBlue = (uvAspect - orbitBlue) * 0.95 + (q * 0.20 - ambientCurl * 0.18);
          float dBlue = length(warpBlue);
          float radBlue = 0.85 + cos(t * 0.55) * 0.09;
          float glowBlue = pow(smoothstep(radBlue, 0.0, dBlue), 1.5) * 0.65;

          // Secondary Node: Electric Cyan Wave Stream
          vec2 orbitCyan = orbitCenterAspect + vec2(sin(t * 0.48 + 1.8) * 0.18, -cos(t * 0.38 + 1.2) * 0.16);
          vec2 warpCyan = (uvAspect - orbitCyan) * 1.05 + (r * 0.18 + ambientCurl * 0.14);
          float dCyan = length(warpCyan);
          float radCyan = 0.72 + sin(t * 0.60) * 0.08;
          float glowCyan = pow(smoothstep(radCyan, 0.0, dCyan), 1.6) * 0.52;

          // Accent Node 1: Subtle Purple / Ultraviolet Nebular Wisp (Little gradient movement)
          vec2 orbitPurple = orbitCenterAspect + vec2(sin(t * 0.32 + 3.2) * 0.22, cos(t * 0.28 + 2.1) * 0.20);
          vec2 warpPurple = (uvAspect - orbitPurple) * 1.35 + (ambientCurl * 0.28 + r * 0.15);
          float dPurple = length(warpPurple);
          float radPurple = 0.55 + sin(t * 0.50) * 0.06;
          float glowPurple = pow(smoothstep(radPurple, 0.0, dPurple), 2.2) * 0.28;

          // Accent Node 2: Delicate Solar Orange / Amber Filament (Little subtle gradient edge)
          vec2 orbitOrange = orbitCenterAspect + vec2(-cos(t * 0.36 + 4.5) * 0.20, sin(t * 0.44 + 3.7) * 0.18);
          vec2 warpOrange = (uvAspect - orbitOrange) * vec2(1.2, 1.5) + (r * 0.22 + q * 0.15);
          float dOrange = length(warpOrange);
          float radOrange = 0.48 + sin(t * 0.65 + 1.0) * 0.05;
          float glowOrange = pow(smoothstep(radOrange, 0.0, dOrange), 2.4) * 0.22;

          // Combined autonomous space atmosphere (Dominantly Blue/Cyan with Purple/Orange accents)
          float autonomousAtmosphere = (glowBlue * 0.55 + glowCyan * 0.45) + (glowPurple + glowOrange) * 0.40;

          // 3. Interactive Cursor & Fluid Trail Disturbance
          float trailField = 0.0;
          vec2 mouseAspect = uSmoothMouse * aspect;
          float headDist = length(uvAspect - mouseAspect + ambientCurl * 0.08);
          float headRadius = 0.46 + length(uVelocity) * 0.18;
          float headDensity = pow(smoothstep(headRadius, 0.0, headDist), 1.8) * 0.35;
          trailField += headDensity;

          for (int i = 0; i < TRAIL_LEN; i++) {
            vec2 tPos = uTrailPositions[i] * aspect;
            float tAge = uTrailAges[i];
            float nodeDist = length(uvAspect - tPos + ambientCurl * 0.06);
            float decay = clamp(1.0 - tAge * 0.7, 0.0, 1.0);
            float rad = (0.38 - float(i) * 0.018) * decay;
            if (rad > 0.02) {
              float nodeDensity = pow(smoothstep(rad, 0.0, nodeDist), 2.0) * decay * 0.22;
              trailField += nodeDensity;
            }
          }

          // 4. Click Shockwave Wave
          float clickField = 0.0;
          if (uClickRipple > 0.01 && uClickRipple < 2.6) {
            vec2 rCenter = uClickRippleCenter * aspect;
            float rDist = length(uvAspect - rCenter);
            float ringPhase = abs(rDist - uClickRipple * 0.45);
            clickField = smoothstep(0.18, 0.0, ringPhase) * clamp(1.0 - uClickRipple * 0.38, 0.0, 1.0) * 0.45;
          }

          // Total blended fluid density
          float totalDensity = clamp(autonomousAtmosphere * 0.75 + trailField * 0.65 + clickField * 0.75, 0.0, 0.95);

          // Silky cosmic space folds & ribbons (continually rippling in space)
          float folds = pow(sin((cosmicDensity + r.x * 0.85 + q.y * 0.6) * 5.2 + t * 0.9) * 0.5 + 0.5, 3.0);

          // 5. Rich Color Hierarchy: Dominant Blue with Subtle Purple & Orange Gradients
          // Deep Space Dark Palette:
          vec3 cCosmicVoid    = vec3(0.01, 0.02, 0.06);   // Deep interstellar midnight void
          vec3 cCobaltNavy    = vec3(0.02, 0.08, 0.26);   // Rich cosmic cobalt navy
          vec3 cDeepSpaceBlue = vec3(0.05, 0.32, 0.88);   // Vibrant royal space blue (#1D4ED8 / #2563EB)
          vec3 cVividAzure    = vec3(0.0, 0.58, 0.96);    // Radiant electric azure (#0091FF)
          vec3 cElectricCyan  = vec3(0.0, 0.84, 0.98);    // Luminous bright electric cyan (#00D2FF)
          vec3 cIceHighlight  = vec3(0.70, 0.94, 1.0);    // Silky celestial cyan sheen
          
          // Subtle Accent Colors (Purple & Orange):
          vec3 cNebulaPurple  = vec3(0.58, 0.12, 0.88);   // Mysterious cosmic purple (#9333EA)
          vec3 cElectricAmethyst = vec3(0.72, 0.22, 0.98);// Soft ultraviolet wisp (#C084FC)
          vec3 cSolarOrange   = vec3(1.0, 0.42, 0.08);    // Warm solar flare orange (#F97316)
          vec3 cGoldenAmber   = vec3(1.0, 0.70, 0.18);    // Luminous golden rim highlight (#FBBF24)

          // Light Mode Palettes:
          vec3 lVoid    = vec3(0.04, 0.12, 0.28);
          vec3 lBlue    = vec3(0.08, 0.45, 0.88);
          vec3 lCyan    = vec3(0.02, 0.68, 0.92);
          vec3 lPurple  = vec3(0.48, 0.15, 0.72);
          vec3 lOrange  = vec3(0.92, 0.38, 0.06);

          vec3 baseVoid   = mix(lVoid, cCosmicVoid, uThemeDark);
          vec3 colCobalt  = mix(lVoid * 1.5, cCobaltNavy, uThemeDark);
          vec3 colBlue    = mix(lBlue, cDeepSpaceBlue, uThemeDark);
          vec3 colAzure   = mix(lCyan, cVividAzure, uThemeDark);
          vec3 colPurple  = mix(lPurple, cNebulaPurple, uThemeDark);
          vec3 colOrange  = mix(lOrange, cSolarOrange, uThemeDark);

          // BASE FIELD: Dominantly Rich Space Blues & Navy
          vec3 col = mix(baseVoid, colCobalt, smoothstep(0.04, 0.24, totalDensity));
          col = mix(col, colBlue, smoothstep(0.18, 0.48, totalDensity + glowBlue * 0.25));
          col = mix(col, colAzure, smoothstep(0.42, 0.72, totalDensity + glowCyan * 0.30));
          col = mix(col, cElectricCyan, smoothstep(0.65, 0.88, totalDensity));

          // ACCENT GRADIENT 1: Subtle Purple Interstellar Nebular Current
          // Gently weaves into the space density without dominating
          float purpleMask = pow(glowPurple, 1.4) * 1.8 + smoothstep(0.35, 0.70, r.y + q.x * 0.5) * 0.25;
          purpleMask = clamp(purpleMask, 0.0, 0.65);
          vec3 purpleBlend = mix(colPurple, cElectricAmethyst, 0.4);
          col = mix(col, purpleBlend, purpleMask * smoothstep(0.15, 0.65, totalDensity));

          // ACCENT GRADIENT 2: Subtle Solar Orange Rim & Filament Highlights
          // Delicate golden-orange gradient ripples along the flowing wave crests
          float orangeFilament = pow(sin((cosmicDensity * 4.5 + r.x * 3.0) + t * 0.7) * 0.5 + 0.5, 3.5);
          float orangeMask = (glowOrange * 1.6 + orangeFilament * 0.35) * smoothstep(0.40, 0.85, totalDensity);
          orangeMask = clamp(orangeMask, 0.0, 0.45);
          vec3 orangeBlend = mix(colOrange, cGoldenAmber, 0.5);
          col = mix(col, orangeBlend, orangeMask);

          // Silky Ice-Cyan & Celestial Sheen Highlights
          col += cIceHighlight * folds * totalDensity * (uThemeDark > 0.5 ? 0.32 : 0.18);

          // 6. Background Micro Dot Matrix (Subtle tech grid reacting to space currents)
          vec2 gridCoord = uvAspect * 32.0;
          vec2 gridCell = fract(gridCoord) - 0.5;
          float dotDist = length(gridCell);
          float dotMask = smoothstep(0.11, 0.03, dotDist);
          float gridProximity = smoothstep(0.85, 0.15, dBlue);
          float gridAlpha = dotMask * gridProximity * (uThemeDark > 0.5 ? 0.14 : 0.06);
          col += cVividAzure * gridAlpha * 0.5;

          // 7. Space Fluid Alpha Blending
          float alpha = totalDensity * (uThemeDark > 0.5 ? 0.82 : 0.62);
          alpha = max(alpha, gridAlpha);

          // Scroll fade for subsequent sections
          float scrollFade = clamp(1.0 - uScroll * 0.45, 0.18, 1.0);
          alpha *= scrollFade;

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    this.fluidMesh = new THREE.Mesh(planeGeo, this.fluidMaterial);
    this.scene.add(this.fluidMesh);

    // 4. Cosmic Purple, Blue & Orange Stardust Particles
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = new Float32Array(this.particleCount * 3);
    this.particleOriginalAngles = new Float32Array(this.particleCount);
    this.particleRadii = new Float32Array(this.particleCount);
    this.particleSpeeds = new Float32Array(this.particleCount);
    this.particleColors = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.08 + Math.pow(Math.random(), 0.75) * 0.65;
      const speed = 0.4 + Math.random() * 0.8;

      this.particleOriginalAngles[i] = angle;
      this.particleRadii[i] = radius;
      this.particleSpeeds[i] = speed;

      // Position in normalized screen space [-1, 1]
      const px = (initialX * 2 - 1) + Math.cos(angle) * radius;
      const py = (initialY * 2 - 1) + Math.sin(angle) * radius;

      this.particlePositions[i3] = px;
      this.particlePositions[i3 + 1] = py;
      this.particlePositions[i3 + 2] = 0;

      this.particleVelocities[i3] = 0;
      this.particleVelocities[i3 + 1] = 0;
      this.particleVelocities[i3 + 2] = 0;
    }

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));

    this.updateParticleColors(this.theme);

    const softParticleTex = this.createSoftParticleTexture();
    this.particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.026 : 0.034,
      vertexColors: true,
      map: softParticleTex,
      transparent: true,
      opacity: theme === 'dark' ? 0.85 : 0.65,
      blending: theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      sizeAttenuation: false,
    });

    this.particlePoints = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particlePoints);

    // Window & Pointer Event Listeners
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });

    this.animate();
  }

  private createSoftParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      g.addColorStop(0.25, 'rgba(220, 180, 255, 0.85)');
      g.addColorStop(0.55, 'rgba(100, 180, 255, 0.45)');
      g.addColorStop(0.8, 'rgba(255, 140, 40, 0.20)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  private updateParticleColors(theme: Theme) {
    // Dominantly Space Blues & Cyans with subtle Purple and Orange stardust accents
    const darkPalette = [
      new THREE.Color(0x00d2ff), // Radiant Electric Cyan (#00D2FF)
      new THREE.Color(0x2563eb), // Deep Space Blue (#2563EB)
      new THREE.Color(0x0ea5e9), // Vibrant Ocean Azure (#0EA5E9)
      new THREE.Color(0x38bdf8), // Sky Azure (#38BDF8)
      new THREE.Color(0xa855f7), // Subtle Ultraviolet Purple (#A855F7)
      new THREE.Color(0x1d4ed8), // Royal Space Sapphire (#1D4ED8)
      new THREE.Color(0xf97316), // Subtle Solar Orange Sparkle (#F97316)
      new THREE.Color(0x00f0ff), // Luminous Hyper Cyan
      new THREE.Color(0xfbbf24), // Celestial Amber Gold
    ];

    const lightPalette = [
      new THREE.Color(0x0284c7),
      new THREE.Color(0x2563eb),
      new THREE.Color(0x0369a1),
      new THREE.Color(0x7e22ce),
      new THREE.Color(0x0284c7),
      new THREE.Color(0xea580c),
    ];

    const palette = theme === 'dark' ? darkPalette : lightPalette;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const col = palette[i % palette.length];
      this.particleColors[i3] = col.r;
      this.particleColors[i3 + 1] = col.g;
      this.particleColors[i3 + 2] = col.b;
    }

    if (this.particleGeometry && this.particleGeometry.attributes.color) {
      this.particleGeometry.attributes.color.needsUpdate = true;
    }
  }

  private onWindowResize = () => {
    if (this.isDestroyed) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));

    if (this.fluidMaterial.uniforms.uResolution) {
      this.fluidMaterial.uniforms.uResolution.value.set(width, height);
    }
  };

  private handlePointerInput(clientX: number, clientY: number) {
    const now = performance.now();
    const dt = Math.max(16, now - this.lastMoveTime);
    this.lastMoveTime = now;

    // Normalizing mouse to UV coordinates [0, 1]
    const normX = clientX / window.innerWidth;
    const normY = 1.0 - clientY / window.innerHeight;

    this.mouse.set(normX, normY);

    // Instantaneous velocity
    const vx = (normX - this.lastMouse.x) / (dt * 0.001);
    const vy = (normY - this.lastMouse.y) / (dt * 0.001);

    this.mouseVelocity.set(
      THREE.MathUtils.clamp(vx * 0.12, -3.0, 3.0),
      THREE.MathUtils.clamp(vy * 0.12, -3.0, 3.0)
    );

    this.lastMouse.copy(this.mouse);

    const speed = Math.sqrt(vx * vx + vy * vy);
    this.activityIntensity = Math.min(1.0, this.activityIntensity + speed * 0.08 + 0.15);
  }

  private onPointerMove = (e: PointerEvent) => {
    this.handlePointerInput(e.clientX, e.clientY);
  };

  private onPointerDown = (e: PointerEvent) => {
    this.clickRipple = 0.05;
    const normX = e.clientX / window.innerWidth;
    const normY = 1.0 - e.clientY / window.innerHeight;
    this.clickRippleCenter.set(normX, normY);
    this.activityIntensity = 1.0;
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.handlePointerInput(touch.clientX, touch.clientY);
    }
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.clickRipple = 0.05;
      const normX = touch.clientX / window.innerWidth;
      const normY = 1.0 - touch.clientY / window.innerHeight;
      this.clickRippleCenter.set(normX, normY);
      this.handlePointerInput(touch.clientX, touch.clientY);
      this.activityIntensity = 1.0;
    }
  };

  public setScrollProgress(progress: number) {
    this.scrollProgress = Math.max(0, Math.min(6, progress));
    if (this.fluidMaterial.uniforms.uScroll) {
      this.fluidMaterial.uniforms.uScroll.value = this.scrollProgress;
    }
  }

  public setTheme(theme: Theme) {
    this.theme = theme;
    if (this.fluidMaterial.uniforms.uThemeDark) {
      this.fluidMaterial.uniforms.uThemeDark.value = theme === 'dark' ? 1.0 : 0.0;
    }
    this.fluidMaterial.blending = theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.updateParticleColors(theme);
    if (this.particleMaterial) {
      this.particleMaterial.opacity = theme === 'dark' ? 0.85 : 0.65;
      this.particleMaterial.blending = theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending;
    }
  }

  private updateTrail(delta: number) {
    // Lead trail point chases mouse directly
    const head = this.trail[0];
    head.vx = (this.mouse.x - head.x) * 18.0;
    head.vy = (this.mouse.y - head.y) * 18.0;
    head.x += head.vx * delta;
    head.y += head.vy * delta;
    head.age = 0.0;

    // Subsequent trail points follow previous point with smooth spring-chain inertia
    for (let i = 1; i < TRAIL_LENGTH; i++) {
      const prev = this.trail[i - 1];
      const curr = this.trail[i];

      const spring = 12.0 - i * 0.4;
      curr.vx = (prev.x - curr.x) * spring;
      curr.vy = (prev.y - curr.y) * spring;
      curr.x += curr.vx * delta;
      curr.y += curr.vy * delta;
      curr.age = (i / TRAIL_LENGTH) * 1.2;
    }

    // Pack into Float32Array uniforms
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      this.trailUniformPositions[i * 2] = this.trail[i].x;
      this.trailUniformPositions[i * 2 + 1] = this.trail[i].y;
      this.trailUniformVelocities[i * 2] = this.trail[i].vx * 0.05;
      this.trailUniformVelocities[i * 2 + 1] = this.trail[i].vy * 0.05;
      this.trailUniformAges[i] = this.trail[i].age;
    }
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.getElapsedTime();

    // 1. Smooth Mouse Cursor Lerp (Fluid head physics)
    const lerpSpeed = 0.12;
    this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * lerpSpeed;
    this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * lerpSpeed;

    // 1b. Cursor & Space Orbital Center Lag
    const isMobile = window.innerWidth < 768;
    const baseGlowX = isMobile ? 0.50 : 0.62;
    const baseGlowY = 0.52;
    const shiftScaleX = 55.0 / Math.max(window.innerWidth, 800);
    const shiftScaleY = 55.0 / Math.max(window.innerHeight, 600);
    const targetGlowX = baseGlowX + (this.mouse.x - 0.5) * shiftScaleX * 1.5;
    const targetGlowY = baseGlowY + (this.mouse.y - 0.5) * shiftScaleY * 1.5;

    this.glowCenter.x += (targetGlowX - this.glowCenter.x) * 0.04;
    this.glowCenter.y += (targetGlowY - this.glowCenter.y) * 0.04;

    // Smooth Velocity Decay
    this.smoothVelocity.x = THREE.MathUtils.lerp(this.smoothVelocity.x, this.mouseVelocity.x, 0.1);
    this.smoothVelocity.y = THREE.MathUtils.lerp(this.smoothVelocity.y, this.mouseVelocity.y, 0.1);
    this.mouseVelocity.multiplyScalar(0.9);

    this.activityIntensity = Math.max(0.2, this.activityIntensity - delta * 0.5);

    // Update Expanding Click Shockwave
    if (this.clickRipple > 0.0) {
      this.clickRipple += delta * 2.2;
      if (this.clickRipple > 2.6) this.clickRipple = 0.0;
    }

    // 2. Update Multi-Point Fluid Trail
    this.updateTrail(delta);

    // 3. Update Fluid Shader Uniforms (time drives continuous space movement)
    this.fluidMaterial.uniforms.uTime.value = time;
    this.fluidMaterial.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    this.fluidMaterial.uniforms.uSmoothMouse.value.set(this.smoothMouse.x, this.smoothMouse.y);
    this.fluidMaterial.uniforms.uGlowCenter.value.set(this.glowCenter.x, this.glowCenter.y);
    this.fluidMaterial.uniforms.uVelocity.value.set(this.smoothVelocity.x, this.smoothVelocity.y);
    this.fluidMaterial.uniforms.uActivity.value = this.activityIntensity;
    this.fluidMaterial.uniforms.uClickRipple.value = this.clickRipple;
    this.fluidMaterial.uniforms.uClickRippleCenter.value.set(this.clickRippleCenter.x, this.clickRippleCenter.y);

    // 4. Update Swirling Cosmic Stardust Particles (Continuous space orbit even when idle)
    const posAttr = this.particleGeometry.attributes.position as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    // Target orbit center in [-1, 1] screen space, with harmonic space drift
    const targetCenterX = (this.smoothMouse.x * 2.0 - 1.0) * 0.75 + Math.sin(time * 0.35) * 0.15;
    const targetCenterY = (this.smoothMouse.y * 2.0 - 1.0) * 0.75 + Math.cos(time * 0.28) * 0.15;

    const vSpeed = this.smoothVelocity.length();

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const baseAngle = this.particleOriginalAngles[i];
      const baseRadius = this.particleRadii[i];
      const speedMult = this.particleSpeeds[i];

      // Non-stop celestial swirl rotation
      const rotSpeed = (0.6 + (i % 6) * 0.25) * speedMult + this.activityIntensity * 1.2;
      const angle = baseAngle + time * rotSpeed;

      // Dynamic cosmic orbit breathing and multi-frequency turbulence
      const rad = baseRadius * (1.0 + Math.sin(time * 1.8 + i * 0.8) * 0.3) + vSpeed * 0.18;
      const ox = Math.cos(angle) * rad + Math.sin(time * 0.8 + i) * 0.05;
      const oy = Math.sin(angle) * rad + Math.cos(time * 0.7 + i) * 0.05;

      // Trail behind mouse velocity
      const trailX = -this.smoothVelocity.x * 0.08 * (i % 4 + 1);
      const trailY = -this.smoothVelocity.y * 0.08 * (i % 4 + 1);

      const targetX = targetCenterX + ox + trailX;
      const targetY = targetCenterY + oy + trailY;

      // Continuously chase the evolving space orbit
      positions[i3] = THREE.MathUtils.lerp(positions[i3], targetX, 0.06);
      positions[i3 + 1] = THREE.MathUtils.lerp(positions[i3 + 1], targetY, 0.06);
      positions[i3 + 2] = 0;
    }

    posAttr.needsUpdate = true;

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchstart', this.onTouchStart);

    if (this.fluidMesh) {
      this.scene.remove(this.fluidMesh);
      this.fluidMesh.geometry.dispose();
      this.fluidMaterial.dispose();
    }
    if (this.particlePoints) {
      this.scene.remove(this.particlePoints);
      this.particleGeometry.dispose();
      this.particleMaterial.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}

