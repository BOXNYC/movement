import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'; // Disabled to reduce texture units

// Type Definitions
interface Config {
  fogColor: number;
  fogNear: number;
  fogFar: number;
  groundColor: number;
  fov: number;
  cameraHeight: number;
  viewOffset: number;
  scrollSensitivity: number;
  touchScrollSensitivity: number;
  parallaxAmpX: number;
  parallaxAmpY: number;
  lerpSpeed: number;
  scrollLerp: number;
  itemCount: number;
  itemSpacing: number;
  gridSize: number;
  zoneRadius: number;
  showMarkers: boolean;
}

interface PostConfig {
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  rgbShiftAmount: number;
  noiseAmount: number;
  noiseSpeed: number;
}

interface Vector3Config {
  x: number;
  y: number;
  z: number;
}

interface PoseConfig {
  position: Vector3Config;
  rotationDeg: Vector3Config;
  scale: Vector3Config;
}

interface StackConfig {
  boxDimensions: { width: number; height: number; depth: number };
  groupSettings: { position: Vector3Config; scale: number };
  lerpFactor: number;
  outsideColors: number[];
  insideImages: string[];
  poses: PoseConfig[];
}

interface NavConfigItem {
  label: string;
  targetIndex: number;
  activeIndices: number[];
}

interface SharedMaterials {
  white: THREE.MeshStandardMaterial;
  yellowText: THREE.MeshStandardMaterial;
  treeTrunk: THREE.MeshStandardMaterial;
  treeCanopy: THREE.MeshStandardMaterial;
  bulletDefault: THREE.MeshStandardMaterial;
  bulletActive: THREE.MeshStandardMaterial;
  arrow: THREE.MeshStandardMaterial;
  hitbox: THREE.MeshBasicMaterial;
}

interface SharedGeometries {
  box: THREE.BoxGeometry;
  sphereUI: THREE.SphereGeometry;
  bulletHit: THREE.SphereGeometry;
  arrowHit: THREE.BoxGeometry;
}

interface SharedResources {
  mats: SharedMaterials;
  geos: SharedGeometries;
}

interface AppState {
  loaded: boolean;
  canScroll: boolean;
  videosUnlocked: boolean;
  scrollPos: number;
  targetScrollPos: number;
  lastTouchY: number;
  touchX: number;
  isDragging: boolean;
  isInteracting: boolean;
  hasScrolled: boolean;
  mouse: THREE.Vector2;
  activeIndex: number;
  enableParallax: boolean;
}

interface SlideData {
  id: number;
  src: string;
  domElement: HTMLElement | null;
}

interface SliderInstance {
  group: THREE.Group;
  markerId: number;
  update: (time: number) => void;
  onPointerDown: (event: PointerEvent, camera: THREE.PerspectiveCamera) => void;
  onPointerMove: (event: PointerEvent, camera: THREE.PerspectiveCamera) => void;
  onPointerUp: () => void;
  dispose: () => void;
}

interface NavDotItem {
  container: HTMLDivElement;
  dot: HTMLDivElement;
  label: HTMLSpanElement;
  activeIndices: number[];
}

interface TextDataItem {
  index: number;
  content: string;
  y: number;
  zOffset: number;
  xOffset?: number;
  yRotate?: number;
  size?: number;
}

interface ExtendedGroup extends THREE.Group {
  targetPosition?: THREE.Vector3;
  targetRotation?: THREE.Euler;
  targetScale?: THREE.Vector3;
}

type MaterialCache = Record<string, THREE.MeshStandardMaterial>;

// Guard against double initialization (React Strict Mode)
let isInitialized = false;
let cleanupFn: (() => void) | null = null;

export function init(): (() => void) | undefined {
  // Prevent double initialization in React Strict Mode
  if (isInitialized) {
    return cleanupFn || undefined;
  }

  const container = document.getElementById('canvas-container');
  const navContainer = document.getElementById('nav-container');
  // const overlayContainer = document.getElementById('overlay-container');
  const scrollHint = document.getElementById('scroll-hint');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const introVideo = document.getElementById('intro-video') as HTMLVideoElement | null;
  const introOverlay = document.getElementById('intro-overlay') as HTMLElement | null;

  if (!container || !navContainer || !scrollHint || !prevBtn || !nextBtn || !introVideo || !introOverlay) return undefined;

  isInitialized = true;

  // const navBtns = [prevBtn, nextBtn]; // For easier event binding

  const manager = new THREE.LoadingManager();
  const textureLoader = new THREE.TextureLoader(manager);
  textureLoader.setCrossOrigin('anonymous');
  // const gltfLoader = new GLTFLoader(manager);
  const fontLoader = new FontLoader(manager);
  const svgLoader = new SVGLoader(manager);

  const CONFIG: Config = {
    fogColor: 0x5447f4,
    fogNear: 40,
    fogFar: 550,
    groundColor: 0xfb93f2,
    fov: 80,
    cameraHeight: 45,
    viewOffset: 90,
    scrollSensitivity: 0.08,
    touchScrollSensitivity: 0.6,
    parallaxAmpX: window.innerWidth >= 768 ? 30 : 18,
    parallaxAmpY: 2,
    lerpSpeed: 0.02,
    scrollLerp: 0.08,
    itemCount: 10,
    itemSpacing: 275,
    gridSize: 50,
    zoneRadius: 60,
    showMarkers: false
  };

  const postConfig: PostConfig = {
    bloomStrength: 0.33,
    bloomRadius: 0.25,
    bloomThreshold: 1,
    rgbShiftAmount: 0.004,
    noiseAmount: 0.12,
    noiseSpeed: 0.0
  };

  const STACK_CONFIG: StackConfig = {
    boxDimensions: { width: 21, height: 3.5, depth: 21 },
    groupSettings: { position: { x: 0, y: CONFIG.cameraHeight, z: 0 }, scale: 0.75 },
    lerpFactor: 0.025,
    outsideColors: [0x41a422, 0xe8fd73, 0xfd6b30, 0xc3dfdf, 0xfaa4f3, 0x605ff0],
    insideImages: [
      "https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-logo-1.jpg",
      "https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-logo-2.jpg",
      "https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-logo-3.jpg",
      "https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-logo-4.jpg",
      "https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-logo-5.jpg",
      "https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-logo.jpg"
    ],
    poses: [
      { position: { x: 0, y: -60, z: -20 }, rotationDeg: { x: 10, y: 15, z: 0 }, scale: { x: 5, y: 5, z: 5 } },
      { position: { x: 0, y: -30, z: -50 }, rotationDeg: { x: -30, y: -40, z: 30 }, scale: { x: 3.5, y: 3.5, z: 3.5 } },
      { position: { x: -8, y: 30, z: -70 }, rotationDeg: { x: -15, y: 30, z: 0 }, scale: { x: 1.3, y: 1.3, z: 1.3 } },
      { position: { x: 0, y: 25, z: -90 }, rotationDeg: { x: -10, y: -30, z: 30 }, scale: { x: 2, y: 2, z: 2 } },
      { position: { x: 0, y: 25, z: -100 }, rotationDeg: { x: -20, y: 25, z: 0 }, scale: { x: 4, y: 4, z: 4 } },
      { position: { x: 0, y: 20, z: -120 }, rotationDeg: { x: -55, y: -15, z: 0 }, scale: { x: 6, y: 6, z: 6 } }
    ]
  };

  const navConfig: NavConfigItem[] = [
    { label: "ABOUT US", targetIndex: 0, activeIndices: [0, 1, 2, 3, 4] },
    { label: "WORK", targetIndex: 5, activeIndices: [5] },
    { label: "SERVICES", targetIndex: 6, activeIndices: [6] },
    { label: "FEED", targetIndex: 7, activeIndices: [7] },
    { label: "CULTURE", targetIndex: 8, activeIndices: [8] },
    { label: "CONTACT", targetIndex: 9, activeIndices: [9] }
  ];

  const SHARED: SharedResources = {
    mats: {
      white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1 }),
      yellowText: new THREE.MeshStandardMaterial({ color: 0xE5E500, roughness: 0.3, metalness: 0.1 }),
      treeTrunk: new THREE.MeshStandardMaterial({ color: 0xD2B48C, roughness: 1.0, flatShading: true }),
      treeCanopy: new THREE.MeshStandardMaterial({ color: 0xDDEE44, roughness: 0.8, flatShading: true }),
      bulletDefault: new THREE.MeshStandardMaterial({ color: 0x5447f4, roughness: 0.3, metalness: 0.1 }),
      bulletActive: new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 }),
      arrow: new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.5, roughness: 0.4 }),
      hitbox: new THREE.MeshBasicMaterial({ visible: false })
    },
    geos: {
      box: new THREE.BoxGeometry(4, 4, 4),
      sphereUI: new THREE.SphereGeometry(0.08, 16, 16),
      bulletHit: new THREE.SphereGeometry(0.25, 8, 8),
      arrowHit: new THREE.BoxGeometry(0.5, 0.8, 0.5)
    }
  };

  const state: AppState = {
    loaded: false,
    canScroll: false,
    videosUnlocked: false,
    scrollPos: CONFIG.viewOffset,
    targetScrollPos: CONFIG.viewOffset,
    lastTouchY: 0,
    touchX: 0,
    isDragging: false,
    isInteracting: false,
    hasScrolled: false,
    mouse: new THREE.Vector2(0, 0),
    activeIndex: -1,
    enableParallax: false
  };

  const activeSliders: SliderInstance[] = [];
  const markers: THREE.Group[] = [];
  const navDots: NavDotItem[] = [];
  const overlays: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>('#overlay-container > div'));
  const videoPromises: Promise<void>[] = [];
  const allVideos: HTMLVideoElement[] = [];
  const matCache: MaterialCache = {};

  let videoSphereMesh: THREE.Mesh | null = null;
  let blobMeshRef: THREE.Mesh | null = null;
  let roomStack: RoomStack | null = null;
  let lolTextRef: THREE.Group | null = null; 

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.fogColor);
  scene.fog = new THREE.Fog(CONFIG.fogColor, CONFIG.fogNear, CONFIG.fogFar);

  const camera = new THREE.PerspectiveCamera(CONFIG.fov, window.innerWidth / window.innerHeight, 0.1, 20000);
  camera.position.set(0, CONFIG.cameraHeight, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Bloom pass disabled to reduce texture unit usage - was causing "Trying to use 20 texture units" warnings
  // const bloomPass = new UnrealBloomPass(...)
  // composer.addPass(bloomPass);

  const CustomEffectsShader = {
    uniforms: {
      "tDiffuse": { value: null as THREE.Texture | null },
      "amount": { value: postConfig.rgbShiftAmount },
      "noiseAmount": { value: postConfig.noiseAmount },
      "time": { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float amount;
      uniform float noiseAmount;
      uniform float time;
      varying vec2 vUv;
      float random(vec2 p) {
        return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }
      void main() {
        vec2 center = vec2(0.5);
        float dist = distance(vUv, center);
        float offset = amount * dist * 2.0; 
        vec2 rUv = vUv + vec2(offset, 0.0);
        vec2 gUv = vUv;
        vec2 bUv = vUv - vec2(offset, 0.0);
        vec4 cr = texture2D(tDiffuse, rUv);
        vec4 cg = texture2D(tDiffuse, gUv);
        vec4 cb = texture2D(tDiffuse, bUv);
        vec3 color = vec3(cr.r, cg.g, cb.b);
        float noise = random(vUv + time) * noiseAmount;
        color += noise;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  };

  const customEffectsPass = new ShaderPass(CustomEffectsShader);
  composer.addPass(customEffectsPass);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2); 
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const camSpotLight = new THREE.SpotLight(0xffffff, 1000); 
  camSpotLight.position.set(0, 350, 0); 
  camSpotLight.angle = Math.PI / 3; 
  camSpotLight.penumbra = 0.4; 
  camSpotLight.decay = 1.0; 
  camSpotLight.distance = 1500;
  camSpotLight.castShadow = true;
  camSpotLight.shadow.mapSize.width = 1024;
  camSpotLight.shadow.mapSize.height = 1024;
  camSpotLight.shadow.camera.near = 10;
  camSpotLight.shadow.camera.far = 1000;
  camSpotLight.shadow.bias = -0.0005; 
  camSpotLight.shadow.normalBias = 0.05;
  scene.add(camSpotLight);
  scene.add(camSpotLight.target); 

  const gridHelper = new THREE.GridHelper(4000, 80, 0xffffff, 0xffffff);
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  gridHelper.position.y = -0.5;
  scene.add(gridHelper);

  const planeGeo = new THREE.PlaneGeometry(4000, 4000);
  const planeMat = new THREE.MeshStandardMaterial({ 
    color: CONFIG.groundColor, 
    roughness: 0.5, 
    metalness: 0.1 
  });
  const floor = new THREE.Mesh(planeGeo, planeMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.6;
  floor.receiveShadow = true;
  scene.add(floor);

  interface RoomGroup extends THREE.Group {
    targetPosition: THREE.Vector3;
    targetRotation: THREE.Euler;
    targetScale: THREE.Vector3;
  }

  interface WallSpec {
    pos: [number, number, number];
    rot: [number, number, number];
  }

  class RoomStack {
    private config: StackConfig;
    private loader: THREE.TextureLoader;
    private anisotropy: number;
    public container: THREE.Group;
    private rooms: RoomGroup[];

    constructor(config: StackConfig, loader: THREE.TextureLoader, anisotropy: number) {
      this.config = config;
      this.loader = loader;
      this.anisotropy = anisotropy;
      this.container = new THREE.Group();
      this.rooms = [];
      this._init();
    }

    private _init(): void {
      const { position, scale } = this.config.groupSettings;
      this.container.position.set(position.x, position.y, position.z);
      this.container.scale.set(scale, scale, scale);
      const { width, height, depth } = this.config.boxDimensions;
      const boxCount = this.config.insideImages.length;
      const totalHeight = boxCount * height;
      const startY = -totalHeight / 2 + height / 2;
      const wallGeo = new THREE.PlaneGeometry(width, height);
      for (let i = 0; i < boxCount; i++) {
        const room = new THREE.Group() as RoomGroup;
        room.position.set(0, startY + i * height, 0);
        room.targetPosition = room.position.clone();
        room.targetRotation = room.rotation.clone();
        room.targetScale = room.scale.clone();
        this._buildRoomWalls(room, wallGeo, i);
        this.container.add(room);
        this.rooms.push(room);
      }
    }

    private _buildRoomWalls(room: RoomGroup, geo: THREE.PlaneGeometry, index: number): void {
      const { width, depth } = this.config.boxDimensions;
      const url = this.config.insideImages[index];
      const color = this.config.outsideColors[index % this.config.outsideColors.length];
      const wallSpecs: WallSpec[] = [
        { pos: [0, 0, -depth / 2], rot: [0, 0, 0] },
        { pos: [0, 0, depth / 2], rot: [0, Math.PI, 0] },
        { pos: [width / 2, 0, 0], rot: [0, -Math.PI / 2, 0] },
        { pos: [-width / 2, 0, 0], rot: [0, Math.PI / 2, 0] }
      ];
      // Load texture once per room and share across all walls
      this.loader.load(url, (texture: THREE.Texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = this.anisotropy;
        // Create shared materials for this room
        const insideMat = new THREE.MeshStandardMaterial({ map: texture, side: THREE.FrontSide, roughness: 0.4 });
        const outsideMat = new THREE.MeshStandardMaterial({ color: color, side: THREE.BackSide, roughness: 0.5 });
        wallSpecs.forEach(spec => {
          const insideMesh = new THREE.Mesh(geo, insideMat);
          const outsideMesh = new THREE.Mesh(geo, outsideMat);
          [insideMesh, outsideMesh].forEach(m => {
            m.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
            m.rotation.set(spec.rot[0], spec.rot[1], spec.rot[2]);
            m.castShadow = true;
            m.receiveShadow = true;
            room.add(m);
          });
        });
      });
    }

    public split(): void {
      this.rooms.forEach((room, i) => {
        const pose = this.config.poses[i] || this.config.poses[0];
        setTimeout(() => {
          room.targetPosition.set(pose.position.x, pose.position.y, pose.position.z);
          room.targetRotation.set(
            THREE.MathUtils.degToRad(pose.rotationDeg.x),
            THREE.MathUtils.degToRad(pose.rotationDeg.y),
            THREE.MathUtils.degToRad(pose.rotationDeg.z)
          );
          room.targetScale.set(pose.scale.x, pose.scale.y, pose.scale.z);
        }, i * 80);
      });
    }

    public update(): void {
      const factor = this.config.lerpFactor;
      this.rooms.forEach(room => {
        room.position.lerp(room.targetPosition, factor);
        room.scale.lerp(room.targetScale, factor);
        room.rotation.x = THREE.MathUtils.lerp(room.rotation.x, room.targetRotation.x, factor);
        room.rotation.y = THREE.MathUtils.lerp(room.rotation.y, room.targetRotation.y, factor);
        room.rotation.z = THREE.MathUtils.lerp(room.rotation.z, room.targetRotation.z, factor);
      });
    }
  }

  const preloadVideoEx = (videoEl: HTMLVideoElement): Promise<void> => {
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.setAttribute('muted', '');
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', '');
    allVideos.push(videoEl);
    videoEl.load();
    return new Promise<void>((resolve) => {
      if (videoEl.readyState >= 3) {
        resolve();
      } else {
        videoEl.addEventListener('canplay', () => resolve(), { once: true });
        videoEl.addEventListener('error', () => resolve(), { once: true });
      }
    });
  };

  const getSVGMat = (colorStr: string): THREE.MeshStandardMaterial => {
    if (!matCache[colorStr]) {
      matCache[colorStr] = new THREE.MeshStandardMaterial({ color: colorStr, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide });
    }
    return matCache[colorStr];
  };

  function getSliderDataFromDOMEx(overlayIndex: number): SlideData[] {
    const containerEl = document.getElementById(`marker-${overlayIndex}`);
    if (!containerEl) return [];
    const slides: SlideData[] = [];
    const items = containerEl.querySelectorAll<HTMLElement>('div[class^="slide-"]');
    items.forEach((item, index) => {
      const img = item.querySelector('img');
      if (img) {
        slides.push({ id: index, src: img.src, domElement: item });
      }
    });
    return slides;
  }

  /* function createRoundedRectShapeEx(width: number, height: number, radius: number): THREE.Shape {
    const x = -width / 2;
    const y = -height / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);
    return shape;
  } */

  function createLowPolyTreeEx(): THREE.Group {
    const treeGroup = new THREE.Group();
    function createBranch(points: THREE.Vector3[], radius: number): THREE.Mesh {
      const path = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(path, 8, radius, 5, false);
      const mesh = new THREE.Mesh(geometry, SHARED.mats.treeTrunk);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }
    function createTaperedCurvyTrunk(): THREE.Mesh {
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0), 
        new THREE.Vector3(0, 0.6, 0),
        new THREE.Vector3(0.2, 1.5, 0.1), 
        new THREE.Vector3(-0.1, 2.5, -0.1),
        new THREE.Vector3(0, 3.5, 0)
      ]);
      const geometry = new THREE.TubeGeometry(path, 20, 1, 7, false);
      const pos = geometry.attributes.position; 
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i); 
        if (v.y < 0.1) v.y = 0;
        const t = Math.max(0, Math.min(1, v.y / 3.5));
        const scale = (1 - t) * (0.4 - 0.15) + 0.15;
        v.x *= scale; 
        v.z *= scale; 
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, SHARED.mats.treeTrunk);
      mesh.castShadow = true; 
      mesh.receiveShadow = true;
      return mesh;
    }
    treeGroup.add(createTaperedCurvyTrunk());
    treeGroup.add(createBranch([new THREE.Vector3(0, 2.0, 0), new THREE.Vector3(0.8, 2.5, 0.5), new THREE.Vector3(1.2, 2.8, 0.8)], 0.1));
    treeGroup.add(createBranch([new THREE.Vector3(0, 2.2, 0), new THREE.Vector3(-0.6, 2.6, -0.4), new THREE.Vector3(-1.0, 3.0, -0.6)], 0.09));
    
    const mainCanopy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), SHARED.mats.treeCanopy);
    mainCanopy.position.set(0, 4.2, 0); 
    mainCanopy.scale.set(1, 1.5, 1); 
    mainCanopy.castShadow = true; 
    mainCanopy.receiveShadow = true;
    treeGroup.add(mainCanopy);
    
    const sub1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), SHARED.mats.treeCanopy);
    sub1.position.set(1.2, 2.8, 0.8); 
    sub1.castShadow = true; 
    sub1.receiveShadow = true;
    treeGroup.add(sub1);
    
    const sub2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), SHARED.mats.treeCanopy);
    sub2.position.set(-1.0, 3.0, -0.6); 
    sub2.castShadow = true; 
    sub2.receiveShadow = true;
    treeGroup.add(sub2);
    
    return treeGroup;
  }

  function createExtrudedSVGEx(svgString: string, scale: number = 0.2): THREE.Group {
    const svgData = svgLoader.parse(svgString);
    const group = new THREE.Group();
    // REVERTED: Bevels disabled
    const extrudeSettings = { depth: 20, bevelEnabled: false };
    svgData.paths.forEach((path, i) => {
      const fillColor = path?.userData?.style.fill || '#333333';
      const colorVal = (fillColor && fillColor !== 'none') ? fillColor : '#333333';
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const mesh = new THREE.Mesh(geometry, getSVGMat(colorVal));
        mesh.position.z = i * 0.1;
        mesh.castShadow = true; 
        mesh.receiveShadow = true; 
        group.add(mesh);
      });
    });
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.children.forEach(child => child.position.sub(center));
    group.scale.set(scale, -scale, scale); 
    group.userData.isIcon = true;
    return group;
  }

  function createArchesEx(): THREE.Mesh {
    const numSegments = 7;
    const segmentWidth = 5;
    const wallDepth = 1.5;
    const totalWidth = numSegments * segmentWidth;
    const archWidth = 3;
    const curveStartHeight = 7;
    const radius = archWidth / 2;
    const pillarWidth = (segmentWidth - archWidth) / 2;
    const wallHeight = curveStartHeight + radius + (pillarWidth * 2);
    
    const shape = new THREE.Shape(); 
    shape.moveTo(0, 0);
    for (let i = 0; i < numSegments; i++) {
      const offsetX = i * segmentWidth;
      shape.lineTo(offsetX + pillarWidth, 0); 
      shape.lineTo(offsetX + pillarWidth, curveStartHeight);
      shape.absarc(offsetX + pillarWidth + radius, curveStartHeight, radius, Math.PI, 0, true);
      shape.lineTo(offsetX + segmentWidth - pillarWidth, 0); 
      shape.lineTo(offsetX + segmentWidth, 0);
    }
    shape.lineTo(totalWidth, wallHeight); 
    shape.lineTo(0, wallHeight); 
    shape.lineTo(0, 0);
    
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: wallDepth, bevelEnabled: false, curveSegments: 24 });
    const count = geometry.attributes.position.count; 
    const colors = new Float32Array(count * 3); 
    const pos = geometry.attributes.position;
    const colorStart = new THREE.Color(0xFF69B4);
    const colorEnd = new THREE.Color(0xFFD700);
    const colorTemp = new THREE.Color();
    
    geometry.computeBoundingBox(); 
    const minX = geometry?.boundingBox?.min.x || 0;
    const rangeX = (geometry?.boundingBox?.max.x || 0) - minX;
    
    for (let i = 0; i < count; i++) {
      let alpha = (pos.getX(i) - minX) / rangeX; 
      alpha = Math.max(0, Math.min(1, alpha));
      colorTemp.copy(colorStart).lerp(colorEnd, alpha);
      colors[i * 3] = colorTemp.r; 
      colors[i * 3 + 1] = colorTemp.g; 
      colors[i * 3 + 2] = colorTemp.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.2, metalness: 0.1, side: THREE.DoubleSide });
    const archesMesh = new THREE.Mesh(geometry, material);
    const scale = 15; 
    archesMesh.scale.set(scale, scale, scale);
    geometry.center(); 
    geometry.computeBoundingBox();
    archesMesh.position.y = -0.6 - ((geometry?.boundingBox?.min.y || 0) * scale);
    archesMesh.position.z = -50;
    archesMesh.castShadow = true; 
    archesMesh.receiveShadow = true;
    return archesMesh;
  }

  function createLOLGradientTextureEx(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0.2, '#ffff00'); 
    gradient.addColorStop(0.8, '#5447f4');
    ctx.fillStyle = gradient; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas); 
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function createLOLWallEx(): THREE.Mesh {
    const width = 4;
    const height = 8;
    const radius = 2; 
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0); 
    shape.lineTo(width / 2, 0); 
    shape.lineTo(width / 2, height - radius);
    shape.absarc(0, height - radius, radius, 0, Math.PI, false); 
    shape.lineTo(-width / 2, 0);
    const hole = new THREE.Path(); 
    hole.absarc(0, 6, 1.2, 0, Math.PI * 2, true); 
    shape.holes.push(hole);
    const lolwallgeometry = new THREE.ExtrudeGeometry(shape, { steps: 2, depth: 0.5, bevelEnabled: false, curveSegments: 32 });
    lolwallgeometry.computeBoundingBox(); 
    const min = lolwallgeometry?.boundingBox?.min.y || 0;
    const range = (lolwallgeometry?.boundingBox?.max.y || 0) - min;
    const pos = lolwallgeometry.attributes.position; 
    const uv = lolwallgeometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setY(i, (pos.getY(i) - min) / range);
    }
    uv.needsUpdate = true; 
    lolwallgeometry.center(); 
    lolwallgeometry.translate(0, height / 2, 0);
    const lolwallmaterial = new THREE.MeshStandardMaterial({ map: createLOLGradientTextureEx(), roughness: 1, metalness: 0, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(lolwallgeometry, lolwallmaterial); 
    mesh.castShadow = true; 
    mesh.receiveShadow = true; 
    return mesh;
  }

  function createTextGroup(): THREE.Group {
    const lolgroup = new THREE.Group();
    const lolmaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 1, metalness: 0 });
    // REVERTED: Bevels disabled
    const settings = { depth: 0.2, bevelEnabled: false, curveSegments: 12 };
    function getL(): THREE.Mesh {
      const s = new THREE.Shape();
      s.moveTo(0, 0);
      s.lineTo(0.6, 0.25);
      s.lineTo(0.6, 0.25);
      s.lineTo(0.25, 0.25);
      s.lineTo(0.25, 1.0);
      s.lineTo(0, 1.0);
      s.lineTo(0, 0);
      const g = new THREE.ExtrudeGeometry(s, settings);
      g.center();
      const m = new THREE.Mesh(g, lolmaterial);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function getO(): THREE.Mesh {
      const s = new THREE.Shape();
      s.absarc(0, 0, 0.5, 0, Math.PI * 2);
      const h = new THREE.Path();
      h.absarc(0, 0, 0.25, 0, Math.PI * 2, true);
      s.holes.push(h);
      const g = new THREE.ExtrudeGeometry(s, settings);
      g.center();
      const m = new THREE.Mesh(g, lolmaterial);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    const l1 = getL(); 
    l1.position.x = -0.75; 
    lolgroup.add(l1);
    const o = getO(); 
    o.position.x = 0; 
    lolgroup.add(o);
    const l2 = getL(); 
    l2.position.x = 0.85; 
    lolgroup.add(l2);
    lolgroup.position.set(0, 6, 0);
    lolgroup.scale.set(0.8, 0.8, 0.8);
    return lolgroup;
  }

  function createTwistedArchGradientTextureEx(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0.2, '#5447f4'); 
    gradient.addColorStop(0.8, '#fb93f2');
    context.fillStyle = gradient; 
    context.fillRect(0, 0, 32, 256);
    const twistedArchTexture = new THREE.CanvasTexture(canvas); 
    twistedArchTexture.colorSpace = THREE.SRGBColorSpace;
    return twistedArchTexture;
  }

  function createTwistedArchGeometryEx(): THREE.BufferGeometry {
    const positions: number[] = [];
    const indices: number[] = [];
    const segments = 200;
    const radialSegments = 3;
    const mainRadius = 12;
    const tubeRadius = 2.5;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const theta = Math.PI * (1 - t);
      const px = mainRadius * Math.cos(theta);
      const py = mainRadius * Math.sin(theta);
      const pz = 0;
      const bx = 0;
      const by = 0;
      const bz = 1;
      const nx = -Math.cos(theta);
      const ny = -Math.sin(theta);
      const nz = 0;
      const twistAngle = t * Math.PI * 4;
      for (let j = 0; j < radialSegments; j++) {
        const angle = (j / radialSegments) * Math.PI * 2 + twistAngle;
        const cx = Math.cos(angle) * tubeRadius;
        const cy = Math.sin(angle) * tubeRadius;
        const vx = px + cx * nx + cy * bx;
        const vy = py + cx * ny + cy * by;
        const vz = pz + cx * nz + cy * bz;
        positions.push(vx, vy, vz);
      }
    }
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const nextJ = (j + 1) % radialSegments;
        const a = i * radialSegments + j;
        const b = i * radialSegments + nextJ;
        const c = (i + 1) * radialSegments + j;
        const d = (i + 1) * radialSegments + j + radialSegments;
        const e = (i + 1) * radialSegments + nextJ;
        indices.push(a, c, nextJ + i * radialSegments); 
        indices.push(nextJ + i * radialSegments, c, e);
      }
    }
    const twistedArchGeometry = new THREE.BufferGeometry();
    twistedArchGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    twistedArchGeometry.setIndex(indices); 
    twistedArchGeometry.computeVertexNormals();
    twistedArchGeometry.computeBoundingBox(); 
    const min = twistedArchGeometry?.boundingBox?.min || new THREE.Vector3();
    const max = twistedArchGeometry?.boundingBox?.max || new THREE.Vector3();
    const rangeY = max.y - min.y;
    const posAttr = twistedArchGeometry.attributes.position;
    const count = posAttr.count;
    const uvData = [];
    for (let i = 0; i < count; i++) {
      const y = posAttr.getY(i);
      const effectiveY = Math.max(0, y);
      const normalizedY = (effectiveY - min.y) / rangeY;
      uvData.push(0, 1 - normalizedY);
    }
    twistedArchGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvData, 2));
    return twistedArchGeometry;
  }

  function createNumberTextureEx(num: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#333'; 
    ctx.lineWidth = 20; 
    ctx.strokeRect(10, 10, 492, 492);
    ctx.fillStyle = '#333'; 
    ctx.font = 'bold 280px Arial'; 
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle'; 
    ctx.fillText(String(num), 256, 256);
    return new THREE.CanvasTexture(canvas);
  }

  function create3DTextEx(font: Font, textString: string, customSize: number = 5.4): THREE.Group {
    const lines = textString.split('<br />');
    const textGroup = new THREE.Group();
    const size = customSize;
    const depth = 1;
    const lineHeight = size * 1.3;
    const mat = SHARED.mats.yellowText;
    const totalTextHeight = (lines.length - 1) * lineHeight;
    lines.forEach((lineStr: string, lineIndex: number) => {
      const lineGroup = new THREE.Group();
      const chars: string[] = lineStr.split('');
      let currentX = 0;
      chars.forEach((char: string, charIdx: number) => {
        if (char === ' ') {
          currentX += size * 0.4;
          return;
        }
        const geo = new TextGeometry(char, { font, size, depth, curveSegments: 3, bevelEnabled: false });
        geo.computeBoundingBox();
        const charWidth = geo.boundingBox!.max.x - geo.boundingBox!.min.x;
        geo.translate(-charWidth / 2, 0, 0);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(currentX + charWidth / 2, 0, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { initialY: 150, targetY: 0, delayIndex: (chars.length - 1 - charIdx) };
        mesh.position.y = mesh.userData.initialY;
        mesh.scale.set(0, 0, 0);
        mesh.visible = false;
        lineGroup.add(mesh);
        currentX += charWidth + size * 0.1;
      });
      lineGroup.position.x = -currentX / 2;
      lineGroup.position.y = (totalTextHeight / 2) - (lineIndex * lineHeight);
      textGroup.add(lineGroup);
    });
    textGroup.userData = { isTextGroup: true, triggered: false, startTime: 0 };
    return textGroup;
  }

  function create3DSliderEx(slidesData: SlideData[], markerId: number): SliderInstance | null {
    // Return null if no slides to display
    if (!slidesData || slidesData.length === 0) {
      return null;
    }

    const sliderConfig = {
      curveDepth: -0.10,
      tvSize: { w: 4, h: 2.25 },
      hoverSpeed: 0.8,
      hoverAmp: 0.1,
      slideSnapSpeed: 0.1
    };
    const stateLocal = {
      targetScroll: 0,
      actualScroll: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartScroll: 0,
      touchStartX: 0,
      touchStartY: 0,
      isTouchJudging: false
    };

    // Lazy texture loading - only keep 3 textures loaded at a time
    const textureCache: Map<number, THREE.Texture> = new Map();
    const maxCachedTextures = 3;

    const getTexture = (index: number): THREE.Texture | null => {
      // Guard against empty or out-of-bounds access
      if (slidesData.length === 0 || index < 0 || index >= slidesData.length) {
        return null;
      }

      if (textureCache.has(index)) {
        return textureCache.get(index)!;
      }

      // Dispose oldest texture if cache is full
      if (textureCache.size >= maxCachedTextures) {
        const oldestKey = textureCache.keys().next().value;
        if (oldestKey !== undefined) {
          textureCache.get(oldestKey)?.dispose();
          textureCache.delete(oldestKey);
        }
      }

      const tex = textureLoader.load(slidesData[index].src);
      tex.colorSpace = THREE.SRGBColorSpace;
      textureCache.set(index, tex);
      return tex;
    };

    // Preload first two textures (if available)
    const defaultTexture = slidesData.length > 0 ? getTexture(0) : null;
    if (slidesData.length > 1) getTexture(1);
    
    const vertexShader = `
      varying vec2 vUv; 
      varying vec3 vPos; 
      uniform float uCurve; 
      #include <fog_pars_vertex> 
      void main() { 
        vUv = uv; 
        vec3 pos = position; 
        pos.z -= pow(pos.x, 2.0) * uCurve; 
        vPos = pos; 
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0); 
        gl_Position = projectionMatrix * mvPosition; 
        #include <fog_vertex> 
      }`;
    const fragmentShader = `
      uniform sampler2D uTexCurrent; 
      uniform sampler2D uTexNext; 
      uniform float uProgress; 
      uniform vec2 uRes; 
      uniform vec2 uImgRes; 
      uniform float uRadius; 
      varying vec2 vUv; 
      #include <fog_pars_fragment> 
      float sdRoundedBox(in vec2 p, in vec2 b, in float r) { 
        vec2 q = abs(p) - b + r; 
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r; 
      } 
      vec2 getCoverUV(vec2 uv, vec2 resolution, vec2 texResolution) { 
        vec2 s = resolution; 
        vec2 i = texResolution; 
        float rs = s.x / s.y; 
        float ri = i.x / i.y; 
        vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); 
        vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new; 
        return uv * s / new + offset; 
      } 
      void main() { 
        float aspect = uRes.x / uRes.y; 
        vec2 centerUV = (vUv - 0.5) * 2.0; 
        centerUV.x *= aspect; 
        float dist = sdRoundedBox(centerUV, vec2(aspect, 1.0), uRadius); 
        float alpha = 1.0 - smoothstep(0.0, 0.02, dist); 
        if (alpha < 0.01) discard; 
        vec2 uvC = getCoverUV(vUv + vec2(uProgress, 0.0), uRes, uImgRes); 
        vec2 uvN = getCoverUV(vUv + vec2(uProgress - 1.0, 0.0), uRes, uImgRes); 
        vec4 colC = texture2D(uTexCurrent, uvC); 
        vec4 colN = texture2D(uTexNext, uvN); 
        float slideX = vUv.x + uProgress; 
        vec3 finalColor = (slideX < 1.0) ? colC.rgb * (1.0 - smoothstep(0.95, 1.0, slideX) * 0.5) : colN.rgb; 
        gl_FragColor = vec4(pow(finalColor, vec3(1.0/2.2)), alpha); 
        #include <fog_fragment> 
      }`;
      
    const rootGroup = new THREE.Group();
    const tvMat = new THREE.ShaderMaterial({ 
      vertexShader, 
      fragmentShader, 
      uniforms: { 
        ...THREE.UniformsUtils.merge([
          THREE.UniformsLib['fog'], 
          { 
            uTexCurrent: { value: defaultTexture },
            uTexNext: { value: getTexture(1) }, 
            uProgress: { value: 0.0 }, 
            uCurve: { value: sliderConfig.curveDepth }, 
            uRes: { value: new THREE.Vector2(sliderConfig.tvSize.w, sliderConfig.tvSize.h) }, 
            uImgRes: { value: new THREE.Vector2(1024, 768) }, 
            uRadius: { value: 0.2 } 
          }
        ]) 
      }, 
      transparent: true, 
      side: THREE.DoubleSide, 
      fog: true 
    });
    const tvMesh = new THREE.Mesh(new THREE.PlaneGeometry(sliderConfig.tvSize.w, sliderConfig.tvSize.h, 64, 64), tvMat);
    tvMesh.castShadow = true; 
    rootGroup.add(tvMesh);
    
    const bulletsGroup = new THREE.Group();
    bulletsGroup.position.set(0, -1.5, 0.2);
    rootGroup.add(bulletsGroup);
    const bullets: THREE.Mesh[] = [];
    const hitboxes: THREE.Mesh[] = [];
    const bulletCenterOffset = (slidesData.length - 1) / 2;
    slidesData.forEach((_, i) => {
      const bullet = new THREE.Mesh(SHARED.geos.sphereUI, i === 0 ? SHARED.mats.bulletActive : SHARED.mats.bulletDefault.clone());
      bullet.position.x = (i - bulletCenterOffset) * 0.3; 
      bullet.castShadow = true; 
      bullet.receiveShadow = true;
      bullets.push(bullet); 
      bulletsGroup.add(bullet);
      const hit = new THREE.Mesh(SHARED.geos.bulletHit, SHARED.mats.hitbox); 
      hit.position.x = bullet.position.x; 
      hit.userData = { id: i, type: 'bullet' }; 
      bulletsGroup.add(hit); 
      hitboxes.push(hit);
    });
    
    const arrowShape = new THREE.Shape(); 
    arrowShape.moveTo(0, 0.4); 
    arrowShape.lineTo(0.3, 0); 
    arrowShape.lineTo(0, -0.4); 
    arrowShape.lineTo(-0.1, -0.4); 
    arrowShape.lineTo(0.2, 0); 
    arrowShape.lineTo(-0.1, 0.4);
    const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    const createArrow = (dir: number, xPos: number): void => {
      const mesh = new THREE.Mesh(arrowGeo, SHARED.mats.arrow); 
      mesh.position.set(xPos, 0, 0.6); 
      mesh.scale.set(0.7, 0.7, 0.7); 
      if (dir === -1) {
        mesh.rotation.z = Math.PI; 
      }
      mesh.castShadow = true; 
      rootGroup.add(mesh);
      const hit = new THREE.Mesh(SHARED.geos.arrowHit, SHARED.mats.hitbox); 
      hit.position.copy(mesh.position); 
      hit.userData = { type: 'arrow', dir }; 
      rootGroup.add(hit); 
      hitboxes.push(hit);
    };
    createArrow(1, 2.3); 
    createArrow(-1, -2.3);
    
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const posMod = (n: number, m: number): number => ((n % m) + m) % m;

    const updateBulletsVisuals = (visualIndex: number): void => {
      bullets.forEach((b, i) => {
        const isActive = (i === visualIndex);
        b.material = isActive ? SHARED.mats.bulletActive : SHARED.mats.bulletDefault;
        b.scale.setScalar(isActive ? 1.5 : 1.0);
      });
    };

    const goToSlide = (index: number): void => {
      const currentMod = posMod(Math.round(stateLocal.actualScroll), slidesData.length);
      let move = index - currentMod;
      const len = slidesData.length;
      if (move > len / 2) move -= len;
      if (move < -len / 2) move += len;
      stateLocal.targetScroll = Math.round(stateLocal.actualScroll) + move;
    };
    
    return {
      group: rootGroup,
      markerId: markerId,
      update: (time: number): void => {
        if (!stateLocal.isDragging) {
          stateLocal.actualScroll += (stateLocal.targetScroll - stateLocal.actualScroll) * sliderConfig.slideSnapSpeed;
        }
        const scroll = stateLocal.actualScroll;
        const len = slidesData.length;
        const idxCurrent = Math.floor(scroll);
        const progress = scroll - idxCurrent;
        const realIdxCurrent = posMod(idxCurrent, len);
        const realIdxNext = posMod(idxCurrent + 1, len);
        const visualIndex = posMod(Math.round(scroll), len);
        
        slidesData.forEach((item, idx) => { 
          if (item.domElement) { 
            if (idx === visualIndex) { 
              item.domElement.style.display = 'block'; 
            } else { 
              item.domElement.style.display = 'none'; 
            } 
          } 
        });
        
        if (tvMesh) { 
          tvMesh.position.y = Math.sin(time * sliderConfig.hoverSpeed) * sliderConfig.hoverAmp; 
          tvMesh.material.uniforms.uTexCurrent.value = getTexture(realIdxCurrent);
          tvMesh.material.uniforms.uTexNext.value = getTexture(realIdxNext); 
          tvMesh.material.uniforms.uProgress.value = progress; 
        }
        updateBulletsVisuals(visualIndex);
      },
      onPointerDown: (event, camera) => {
        if (!state.canScroll) return;
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1; 
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera); 
        const intersectsUI = raycaster.intersectObjects(hitboxes);
        
        // If mouse, immediately interact. If touch, wait to judge direction
        if (raycaster.intersectObject(tvMesh).length > 0) { 
          if (event.pointerType === 'touch') {
            stateLocal.isTouchJudging = true;
            stateLocal.touchStartX = event.clientX;
            stateLocal.touchStartY = event.clientY;
          } else {
            state.isInteracting = true;
            stateLocal.isDragging = true; 
            stateLocal.dragStartX = event.clientX; 
            stateLocal.dragStartScroll = stateLocal.actualScroll; 
            document.body.style.cursor = 'grabbing'; 
          }
        }
        
        // UI elements (buttons/bullets) always trigger interaction
        if (intersectsUI.length > 0) { 
          state.isInteracting = true;
          const { type, id, dir } = intersectsUI[0].object.userData; 
          if (type === 'bullet') goToSlide(id); 
          if (type === 'arrow') stateLocal.targetScroll += dir; 
          return; 
        }
      },
      onPointerMove: (event, camera) => {
        if (!state.canScroll) return;
        
        // Touch Direction Judging
        if (stateLocal.isTouchJudging) {
          const dx = event.clientX - stateLocal.touchStartX;
          const dy = event.clientY - stateLocal.touchStartY;
          // Check if moved enough to judge (5px threshold)
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            if (Math.abs(dx) > Math.abs(dy)) {
              // Horizontal -> Slider Drag
              state.isInteracting = true;
              stateLocal.isDragging = true;
              stateLocal.dragStartX = event.clientX; // Reset start to current to avoid jump
              stateLocal.dragStartScroll = stateLocal.actualScroll;
              stateLocal.isTouchJudging = false;
            } else {
              // Vertical -> Scroll (ignore slider)
              stateLocal.isTouchJudging = false;
              // isInteracting remains false, allowing window scroll to happen
            }
          }
          return; // Wait for judgment
        }
        
        if (stateLocal.isDragging) { 
          stateLocal.actualScroll = stateLocal.dragStartScroll - (event.clientX - stateLocal.dragStartX) * 0.003; 
          stateLocal.targetScroll = stateLocal.actualScroll; 
          return; 
        }
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1; 
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera); 
        const hits = raycaster.intersectObjects(hitboxes);
        if (hits.length > 0) { 
          document.body.style.cursor = 'pointer'; 
        } else { 
          if(raycaster.intersectObject(tvMesh).length > 0) document.body.style.cursor = 'grab'; 
        }
      },
      onPointerUp: () => { 
        stateLocal.isTouchJudging = false;
        if (stateLocal.isDragging) { 
          stateLocal.isDragging = false; 
          state.isInteracting = false; // Release global lock
          document.body.style.cursor = 'default'; 
          stateLocal.targetScroll = Math.round(stateLocal.actualScroll); 
        }
        // Also release lock if it was a UI click that finished
        if(state.isInteracting) state.isInteracting = false; 
      },
      dispose: () => {
        tvMesh.geometry.dispose();
        tvMat.dispose();
        textureCache.forEach((tex: THREE.Texture) => tex.dispose());
        textureCache.clear();
      }
    };
  }

  function createElements(): void {
    navConfig.forEach((item) => {
      const navDiv = document.createElement('div'); 
      navDiv.className = "group flex items-center gap-3 cursor-pointer transition-all duration-300 opacity-60 hover:opacity-100";
      const dot = document.createElement('div'); 
      dot.className = "w-3 h-3 rounded-full bg-white group-hover:bg-[#e3ff9f] shadow-sm transition-all duration-300 transform group-hover:scale-150";
      const lbl = document.createElement('span'); 
      lbl.innerText = item.label; 
      lbl.className = "text-sm font-bold text-[#e3ff9f] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300";
      navDiv.appendChild(dot); 
      navDiv.appendChild(lbl); 
      navDiv.onclick = () => jumpToMarker(item.targetIndex); 
      if (navContainer) navContainer.appendChild(navDiv); 
      navDots.push({ container: navDiv, dot, label: lbl, activeIndices: item.activeIndices });
    });
    const markerRoot = new THREE.Group(); 
    scene.add(markerRoot);
    // Pass specific indices now that we have data-index logic
    const workSliderData = getSliderDataFromDOMEx(6); // id="marker-6"
    const feedSliderData = getSliderDataFromDOMEx(8); // id="marker-8"
    
    // Detect Mobile State
    const isMobile = window.innerWidth < 768;

    // Cache shared arch geometry and texture to reduce texture unit usage
    const sharedArchGeo = createTwistedArchGeometryEx();
    const sharedArchTexture = createTwistedArchGradientTextureEx();
    const sharedArchMaterial = new THREE.MeshStandardMaterial({ map: sharedArchTexture, side: THREE.DoubleSide, roughness: 1.0, metalness: 0.0 });

    for (let i = 0; i < CONFIG.itemCount; i++) {
      const group = new THREE.Group();
      const spotLight = new THREE.SpotLight(0xffffff, 2500);
      spotLight.position.set(0, 150, CONFIG.viewOffset / 2);
      spotLight.angle = Math.PI / 5;
      spotLight.penumbra = 0.5;
      spotLight.decay = 1.5;
      spotLight.distance = 500;
      // Disabled per-marker shadows to reduce texture units (was 10+ shadow maps)
      spotLight.castShadow = false;
      spotLight.target.position.set(0, 0, 0);
      group.add(spotLight);
      group.add(spotLight.target);
      
      // Only create numbered texture if markers are visible to save texture units
      const cubeMaterial = CONFIG.showMarkers
        ? new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1, map: createNumberTextureEx(i + 1) })
        : SHARED.mats.white;
      const cube = new THREE.Mesh(SHARED.geos.box, cubeMaterial);
      cube.visible = CONFIG.showMarkers;
      
      if (i === 0) { 
        roomStack = new RoomStack(STACK_CONFIG, textureLoader, renderer.capabilities.getMaxAnisotropy()); 
        group.add(roomStack.container); 
      }
      if (i === 1) {
        const video = document.createElement('video'); 
        video.src = 'https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-social-2.mp4'; 
        video.crossOrigin = 'anonymous'; 
        videoPromises.push(preloadVideoEx(video));
        
        const videoTexture = new THREE.VideoTexture(video); 
        videoTexture.colorSpace = THREE.SRGBColorSpace; 
        videoTexture.wrapS = THREE.RepeatWrapping; 
        videoTexture.wrapT = THREE.RepeatWrapping; 
        videoTexture.repeat.set(4, 1);
        
        // Enlarged sphere by 30% (29 * 1.3 ≈ 37.7)
        // Raised y from 45 to 60 (was previously overriding to 30 in animate loop)
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(37.7, 64, 64), new THREE.MeshStandardMaterial({ map: videoTexture, roughness: 0.2, metalness: 0.1 })); 
        sphere.userData.video = video; 
        sphere.position.set(55, 60, 0); 
        sphere.castShadow = true; 
        sphere.receiveShadow = true; 
        group.add(sphere); 
        videoSphereMesh = sphere;
        
        const treePositions = [
          { x: 100, z: 20, s: 10 }, // Moved right (+20)
          { x: -60, z: -50, s: 15.4 }, // Back left, enlarged by 40% (11 * 1.4 = 15.4)
          { x: 90, z: 60, s: 9 } // Moved right (+20)
        ];
        treePositions.forEach(d => { 
          const tr = createLowPolyTreeEx(); 
          tr.position.set(d.x, -0.6, d.z); 
          tr.rotation.y = Math.random() * Math.PI * 2; 
          tr.scale.set(d.s, d.s, d.s); 
          group.add(tr); 
        });
      }
      if (i === 2) {
        group.add(createArchesEx()); 
        // Enlarged TV by 30% (0.26 * 1.3 = 0.338 -> 0.34)
        // REVERTED: Restored original SVG code
        const svgTV = createExtrudedSVGEx(`<svg viewBox="0 0 170 170"><polygon points="137.63 52.11 137.63 45.53 124.47 45.53 124.47 25.79 104.73 25.79 104.73 32.37 98.15 32.37 98.15 38.95 91.57 38.95 91.57 45.53 84.99 45.53 84.99 38.95 78.41 38.95 78.41 32.37 71.83 32.37 71.83 25.79 52.09 25.79 52.09 45.53 45.51 45.53 45.51 52.11 38.93 52.11 38.93 58.69 32.35 58.69 32.35 65.27 25.77 65.27 25.77 137.64 32.35 137.64 32.35 144.22 124.46 144.22 124.46 137.64 131.04 137.64 131.04 131.06 137.62 131.06 137.62 124.48 144.2 124.48 144.2 52.11 137.63 52.11" fill="#e3ff4f"/><g>  <rect x="58.68" y="32.37" width="6.58" height="6.58"/>  <rect x="111.32" y="32.37" width="6.58" height="6.58"/>  <rect x="104.74" y="38.95" width="6.58" height="6.58"/>  <path d="M131.05,58.68v-6.58h-26.32v-6.58h-6.58v6.58h-19.74v-6.58h-6.57v-6.57h-6.58v6.58h6.57v6.57h-19.74v6.58h-6.56v6.58h6.58v-6.58h26.3v6.58h13.16v-6.58h32.89v6.58h-6.57v6.58H45.53v-6.58h-6.58v6.58h-6.58v59.21h6.58v-52.63h72.37v52.63H38.95v6.58h78.95v-6.58h6.58v-6.58h6.57v-6.58h6.57v-59.21h-6.57ZM131.04,117.89h-6.57v6.58h-6.57v-6.58h-.01s0-46.05,0-46.05h6.58v-6.58h6.57v52.63Z"/>  <rect x="98.16" y="85" width="6.58" height="6.58"/>  <rect x="98.16" y="98.16" width="6.58" height="6.58"/>  <polygon points="85 84.99 52.11 84.99 52.11 91.57 45.53 91.57 45.53 117.89 52.11 117.89 52.11 124.47 85 124.47 85 117.89 91.58 117.89 91.58 91.57 85 91.57 85 84.99"/></g></svg>`, 0.34); 
        // Raised TV slightly from 60 to 75
        svgTV.position.set(0, 75, 0); 
        svgTV.userData.baseY = 75; 
        group.add(svgTV);
        const svgStar = createExtrudedSVGEx(`<svg width="170" height="170" viewBox="0 0 170 170"><path d="M141.53,58.4h-33.25v-13.3h-6.65v-13.3h-6.65v-6.65h-19.95v6.65h-6.65v13.3h-6.65v13.3H21.82v19.95h6.65v6.65h6.65v6.65h6.65v13.3h-6.65v13.3h-6.65v26.6h33.25v-6.65h13.3v-6.65h19.95v6.65h13.3v6.65h33.25v-26.6h-6.65v-13.3h-6.65v-13.3h6.65v-6.65h6.65v-6.65h6.65v-19.95h-6.65Z" fill="#73dcec"/><g><path d="M81.67,45.1v-6.65h-6.65v13.3h6.65v-6.65Z" fill="#03030f"/><path d="M88.33,51.75h6.65v-13.3h-6.65v13.3Z" fill="#03030f"/><rect x="81.67" y="31.79" width="6.65" height="6.65" fill="#03030f"/><rect x="68.37" y="51.75" width="6.65" height="13.3" fill="#03030f"/><path d="M94.98,65.05h6.65v-13.3h-6.65v13.3Z" fill="#03030f"/><path d="M48.42,71.7h19.95v-6.65H28.47v6.65h6.65v6.65h6.65v-6.65h6.65Z" fill="#03030f"/><path d="M134.88,65.05h-33.25v6.65h26.6v6.65h6.65v-6.65h6.65v-6.65h-6.65Z" fill="#03030f"/><rect x="41.77" y="78.35" width="6.65" height="6.65" fill="#03030f"/><rect x="121.58" y="78.35" width="6.65" height="6.65" fill="#03030f"/><rect x="48.42" y="85" width="6.65" height="6.65" fill="#03030f"/><rect x="114.93" y="85" width="6.65" height="6.65" fill="#03030f"/><rect x="55.07" y="91.65" width="6.65" height="6.65" fill="#03030f"/><rect x="108.28" y="91.65" width="6.65" height="6.65" fill="#03030f"/><path d="M55.07,98.3h-6.65v13.3h6.65v-13.3Z" fill="#03030f"/><path d="M114.93,111.6h6.65v-13.3h-6.65v13.3Z" fill="#03030f"/><rect x="81.67" y="111.6" width="6.65" height="6.65" fill="#03030f"/><path d="M48.42,111.6h-6.65v13.3h6.65v-13.3Z" fill="#03030f"/><path d="M68.37,118.25v6.65h13.3v-6.65h-13.3Z" fill="#03030f"/><path d="M88.33,118.25v6.65h13.3v-6.65h-13.3Z" fill="#03030f"/><path d="M121.58,124.9h6.65v-13.3h-6.65v13.3Z" fill="#03030f"/><path d="M55.07,124.9v6.65h13.3v-6.65h-13.3Z" fill="#03030f"/><path d="M101.63,124.9v6.65h13.3v-6.65h-13.3Z" fill="#03030f"/><path d="M41.77,131.56v-6.65h-6.65v13.3h19.95v-6.65h-13.3Z" fill="#03030f"/><path d="M114.93,131.56v6.65h19.95v-13.3h-6.65v6.65h-13.3Z" fill="#03030f"/></g></svg>`, 0.2); 
        svgStar.position.set(-75, 40, 0); 
        svgStar.userData.baseY = 40; 
        group.add(svgStar);
        const archLight = new THREE.PointLight(0xffffff, 2000, 200); 
        archLight.position.set(0, 100, 0); 
        group.add(archLight);
        
        // Added single tree to the right, enlarged by 50% (approx s=15-18)
        const tr = createLowPolyTreeEx(); 
        tr.position.set(100, -0.6, 20); 
        tr.rotation.y = Math.random() * Math.PI * 2; 
        tr.scale.set(18, 18, 18); 
        group.add(tr);
      }
      if (i === 3) {
        const svgCool = createExtrudedSVGEx(`<svg width="170" height="170" viewBox="0 0 170 170"><path d="M140.92,65.3v-13.16h-6.58v-6.58h-6.58v-6.58h-6.58v-6.58h-13.16v-6.58h-46.05v6.58h-13.16v6.58h-6.58v6.58h-6.58v6.58h-6.58v13.16h-6.58v46.05h6.58v6.58h6.58v6.58h6.58v6.58h6.58v6.58h13.16v6.5h46.05v-6.5h13.16v-6.58h6.58v-6.58h6.58v-6.58h6.58v-6.58h6.58v-46.05h-6.58Z" fill="#d88f00"/><g><path d="M81.71,38.99h19.74v-6.58h-32.89v6.58h13.16Z" fill="#03030f"/><path d="M68.55,45.57v-6.58h-13.16v6.58h13.16Z" fill="#03030f"/><path d="M108.03,45.57h6.58v-6.58h-13.16v6.58h6.58Z" fill="#03030f"/><path d="M42.24,78.46h6.58v6.58h19.74v-6.58h6.58v-6.58h19.74v6.58h6.58v6.58h19.74v-6.58h6.58v-6.58h6.58v-13.16h-6.58v-6.58h-6.58v-6.58h-6.58v6.58h-19.74v6.58h-6.58v6.58h-6.58v-6.58h-6.58v-6.58h-19.74v-6.58h-6.58v6.58h-6.58v6.58h-6.58v13.16h6.58v6.58Z" fill="#03030f"/><path d="M134.34,71.88v32.89h6.58v-32.89h-6.58Z" fill="#03030f"/><path d="M35.66,91.62v-19.74h-6.58v32.89h6.58v-13.16Z" fill="#03030f"/><rect x="61.97" y="98.2" width="6.58" height="6.58" fill="#03030f"/><rect x="101.45" y="98.2" width="6.58" height="6.58" fill="#03030f"/><rect x="35.66" y="104.78" width="6.58" height="6.58" fill="#03030f"/><path d="M88.29,104.78h-19.74v6.58h32.89v-6.58h-13.16Z" fill="#03030f"/><rect x="127.76" y="104.78" width="6.58" height="6.58" fill="#03030f"/><rect x="42.24" y="111.36" width="6.58" height="6.58" fill="#03030f"/><rect x="121.18" y="111.36" width="6.58" height="6.58" fill="#03030f"/><rect x="48.82" y="117.93" width="6.58" height="6.58" fill="#03030f"/><rect x="114.61" y="117.93" width="6.58" height="6.58" fill="#03030f"/><path d="M61.97,124.51h-6.58v6.58h13.16v-6.58h-6.58Z" fill="#03030f"/><path d="M101.45,124.51v6.58h13.16v-6.58h-13.16Z" fill="#03030f"/><path d="M88.29,131.09h-19.74v6.58h32.89v-6.58h-13.16Z" fill="#03030f"/></g></svg>`, 0.4); 
        // FIX: Reverse logic: Move LEFT on mobile (-50), CENTER on desktop (-25)
        // Initialization logic (will be overridden by animate loop, but good for start)
        svgCool.position.set(-25, 55, -20); 
        svgCool.rotation.y = 0.5; 
        svgCool.userData.baseY = 55; 
        svgCool.name = 'svgCool';
        group.add(svgCool);
        
        // Added framing trees
        const tL = createLowPolyTreeEx(); 
        tL.position.set(-90, -0.6, 20); 
        tL.rotation.y = Math.random() * Math.PI * 2; 
        tL.scale.set(14, 14, 14); 
        group.add(tL);
        
        const tR = createLowPolyTreeEx(); 
        tR.position.set(90, -0.6, -10); 
        tR.rotation.y = Math.random() * Math.PI * 2; 
        tR.scale.set(13, 13, 13); 
        group.add(tR);

        const videoPhone = document.getElementById('video-source') as HTMLVideoElement;
        if (videoPhone) {
          videoPromises.push(preloadVideoEx(videoPhone));
        }
        const vidTex = new THREE.VideoTexture(videoPhone); 
        vidTex.colorSpace = THREE.SRGBColorSpace; 
        vidTex.minFilter = THREE.LinearFilter; 
        vidTex.magFilter = THREE.LinearFilter; 
        vidTex.generateMipmaps = false;
        const phoneGroup = new THREE.Group(); 
        phoneGroup.scale.set(0.3, -0.3, 0.3);
        
        svgLoader.parse(`<svg width="170" height="170" viewBox="0 0 170 170"><path d="M114.61,29.08v-6.58h-59.21v6.58h-6.58v111.84h6.58v6.58h59.21v-6.58h6.58V29.08h-6.58Z" fill="#73dcec"/><g><path d="M108.03,35.66v85.53h-46.05V35.66h-6.58v98.68h6.58v6.58h46.05v-6.58h6.58V35.66h-6.58ZM81.71,134.34v-6.58h6.58v6.58h-6.58Z"/><path d="M75.13,35.66h32.89v-6.58h-46.05v6.58h13.16Z"/></g></svg>`).paths.forEach((path) => {
          const shapes = SVGLoader.createShapes(path); 
          const fillColor = path?.userData?.style.fill || '#000000'; 
          const isBody = (fillColor && fillColor.toLowerCase() === '#73dcec');
          const geo = new THREE.ExtrudeGeometry(shapes, { depth: isBody ? 10 : 14, bevelEnabled: false }); 
          const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: isBody ? 0x73dcec : 0x111111, roughness: 0.2, metalness: 0.3 }));
          if (!isBody) m.position.z = -2; 
          phoneGroup.add(m);
        });
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(46.05, 85.53), new THREE.MeshBasicMaterial({ map: vidTex, color: 0xffffff, side: THREE.DoubleSide })); 
        screen.position.set(85.005, 78.425, 12.1); 
        screen.scale.y = -1; 
        phoneGroup.add(screen);
        const pivot = new THREE.Group(); 
        const box = new THREE.Box3().setFromObject(phoneGroup); 
        const center = box.getCenter(new THREE.Vector3()); 
        phoneGroup.position.sub(center); 
        pivot.add(phoneGroup); 
        pivot.scale.set(1.4, 1.4, 1.4); 
        
        // Initialize responsive position logic for video phone
        const phoneBaseY = isMobile ? 65 : 40;
        pivot.position.set(isMobile ? 0 : 25, phoneBaseY, isMobile ? -40 : 10);
        pivot.userData.baseY = phoneBaseY;
        
        pivot.rotation.y = -Math.PI / 6; 
        pivot.rotation.x = -Math.PI / 12; 
        pivot.userData.isIcon = true; 
        pivot.userData.video = videoPhone; 
        group.add(pivot);
      }
      if (i === 4) {
        const treePositions = [
          { x: 85, z: 50, s: 12.7 }, // Farthest right, enlarged 30%
          { x: -90, z: 75, s: 11.2 }, 
          { x: 65, z: -100, s: 12.6 }
        ];
        treePositions.forEach(d => { 
          const tr = createLowPolyTreeEx(); 
          tr.position.set(d.x, -0.6, d.z); 
          tr.rotation.y = Math.random() * Math.PI * 3; 
          tr.scale.set(d.s, d.s, d.s); 
          group.add(tr); 
        });
        // Enlarged Bubble by 30% (scale 0.2 -> 0.26)
        const svgBubble = createExtrudedSVGEx(`<svg width="170" height="170" viewBox="0 0 170 170"><g><path d="M147.58,45.53v-6.58h-6.58v-6.58H29.16v6.58h-6.58v72.37h6.58v6.58h19.74v6.58h6.58v6.58h6.58v6.58h19.74v-19.74h59.21v-6.58h6.58v-6.58h6.58v-59.21h-6.58Z" fill="#f73"/><path d="M15.84,52.11v52.63h6.58v-59.21h-6.58v6.58Z" fill="#f73"/></g><g><path d="M48.89,45.53h85.53v-6.58H35.74v6.58h13.16Z"/><rect x="29.16" y="45.53" width="6.58" height="6.58"/><rect x="134.42" y="45.53" width="6.58" height="6.58"/><path d="M141,52.11v46.05h6.58v-46.05h-6.58Z"/><path d="M29.16,85v-32.89h-6.58v46.05h6.58v-13.16Z"/><rect x="29.16" y="98.16" width="6.58" height="6.58"/><rect x="134.42" y="98.16" width="6.58" height="6.58"/><path d="M48.89,104.74h-13.16v6.58h19.74v-6.58h-6.58Z"/><path d="M121.26,104.74h-52.63v13.16h-6.58v6.58h6.58v6.58h6.58v-19.74h59.21v-6.58h-13.16Z"/><rect x="55.47" y="111.32" width="6.58" height="6.58"/></g></svg>`, 0.26); 
        svgBubble.position.set(-30, 45, -20); 
        svgBubble.userData.baseY = 45; 
        group.add(svgBubble);
        // FIX: Restored original SVG for svgLook (Eye/Shapes)
        const svgLook = createExtrudedSVGEx(`<svg width="170" height="170" viewBox="0 0 170 170"><path d="M138.38,53.58v-6.28h-6.28v-6.28h-37.7v6.28h-6.28v6.28h-6.22v-6.28h-6.28v-6.28h-37.7v6.28h-6.28v6.28h-6.28v62.84h6.28v6.28h6.28v6.28h37.7v-6.28h6.28v-6.28h6.22v6.28h6.28v6.28h37.7v-6.28h6.28v-6.28h6.28v-62.84h-6.28Z" fill="#badbda"/><g><path d="M56.75,53.58h12.57v-6.28h-25.14v6.28h12.57Z" fill="#03030f"/><rect x="37.9" y="53.58" width="6.28" height="6.28" fill="#03030f"/><rect x="69.32" y="53.58" width="6.28" height="6.28" fill="#03030f"/><path d="M75.6,66.15v43.99h6.28v-50.27h-6.28v6.28Z" fill="#03030f"/><path d="M37.9,97.57v-6.28h12.57v-12.57h-12.57v-18.85h-6.28v50.27h6.28v-12.57Z" fill="#03030f"/><rect x="37.9" y="110.14" width="6.28" height="6.28" fill="#03030f"/><rect x="69.32" y="110.14" width="6.28" height="6.28" fill="#03030f"/><path d="M56.75,116.42h-12.57v6.28h25.14v-6.28h-12.57Z" fill="#03030f"/><path d="M113.25,53.58h12.57v-6.28h-25.14v6.28h12.57Z" fill="#03030f"/><rect x="94.4" y="53.58" width="6.28" height="6.28" fill="#03030f"/><rect x="125.81" y="53.58" width="6.28" height="6.28" fill="#03030f"/><path d="M132.1,59.86v50.27h6.28v-50.27h-6.28Z" fill="#03030f"/><path d="M94.4,97.57v-6.28h12.57v-12.57h-12.57v-18.85h-6.28v50.27h6.28v-12.57Z" fill="#03030f"/><rect x="94.4" y="110.14" width="6.28" height="6.28" fill="#03030f"/><rect x="125.81" y="110.14" width="6.28" height="6.28" fill="#03030f"/><path d="M113.25,116.42h-12.57v6.28h25.14v-6.28h-12.57Z" fill="#03030f"/></g></svg>`, 0.2); 
        svgLook.position.set(25, 10, 20); 
        svgLook.userData.baseY = 10; 
        group.add(svgLook);
        
        const lolNode = new THREE.Group(); 
        lolNode.add(createLOLWallEx()); 
        const lolText = createTextGroup(); 
        lolTextRef = lolText; 
        lolNode.add(lolText); 
        lolNode.scale.set(15, 15, 15); 
        lolNode.position.set(-60, 0, -40); 
        group.add(lolNode);
      }
      if (i === 5) {
        // FIX: Pass CORRECT markerId (5) not DOM ID (6)
        const s = create3DSliderEx(workSliderData, 5);
        if (s) {
          const sc = window.innerWidth >= 768 ? 24 : 16;
          s.group.scale.set(sc, sc, sc);
          s.group.position.set(0, 35, 0);
          group.add(s.group);
          activeSliders.push(s);
        }

        const arch = new THREE.Mesh(sharedArchGeo, sharedArchMaterial);
        arch.scale.set(12, 12, 12);
        arch.position.set(0, -0.6, 0);
        group.add(arch);
      }
      if (i === 6) {
        const bg = new THREE.IcosahedronGeometry(23, 3); 
        const pos = bg.attributes.position;
        const op = new Float32Array(pos.count * 3); 
        for(let k=0; k<pos.count; k++){ 
          op[k*3] = pos.getX(k); 
          op[k*3+1] = pos.getY(k); 
          op[k*3+2] = pos.getZ(k); 
        } 
        bg.userData.originalPositions = op;
        const bm = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ color: 0x23f660, roughness: 0.4, metalness: 0.1, emissive: 0x004400, emissiveIntensity: 0.2 })); 
        // Reverted size and position: default scale 1, y=35
        bm.position.set(0, 35, 0); 
        bm.castShadow = true; 
        bm.receiveShadow = true; 
        bm.frustumCulled = false; 
        group.add(bm); 
        blobMeshRef = bm;
      }
      if (i === 7) {
        // FIX: Pass CORRECT markerId (7) not DOM ID (8)
        const s = create3DSliderEx(feedSliderData, 7);
        if (s) {
          const sc = window.innerWidth >= 768 ? 24 : 16;
          s.group.scale.set(sc, sc, sc);
          s.group.position.set(0, 35, 0);
          group.add(s.group);
          activeSliders.push(s);
        }

        const arch = new THREE.Mesh(sharedArchGeo, sharedArchMaterial);
        arch.scale.set(12, 12, 12);
        arch.position.set(0, -0.6, 0);
        group.add(arch);
      }
      if (i === 8) {
        const svgLike = createExtrudedSVGEx(`<svg width="170" height="170" viewBox="0 0 170 170"><path d="M135.24,78.67v-6.28h-6.28v-6.28h-31.42v-25.14h-6.28v-6.28h-25.07v31.42h-6.28v6.28h-31.42v62.93h94.2v-6.38h6.28v-12.57h6.28v-12.57h6.28v-25.14h-6.28Z" fill="#a0a038"/><g><path d="M78.75,66.1v-18.85h6.22v31.42h37.7v-6.28h-31.42v-25.14h-6.22v-6.28h-12.57v31.42h6.28v-6.28Z" fill="#03030f"/><rect x="66.18" y="72.39" width="6.28" height="6.28" fill="#03030f"/><path d="M128.96,84.95v-6.28h-6.28v6.28h-12.57v6.28h18.85v6.28h6.28v-12.57h-6.28Z" fill="#03030f"/><path d="M116.39,97.52h-6.28v6.28h12.57v6.28h6.28v-12.57h-12.57Z" fill="#03030f"/><path d="M110.1,110.09h-6.28v6.28h12.57v6.28h6.28v-12.57h-12.57Z" fill="#03030f"/><path d="M103.82,122.66h-62.78v-37.7h25.14v-6.28h-31.42v50.27h81.63v-6.28h-12.57Z" fill="#03030f"/></g></svg>`, 0.4); 
        // Swapped position with Hashtag (was left, now right at 55, 40, -30)
        // Inverted Rotation Y to -0.5 to face center from the right
        svgLike.position.set(55, 40, -30); 
        svgLike.rotation.y = -0.5;
        svgLike.rotation.x = -0.3;
        svgLike.userData.baseY = 40; 
        group.add(svgLike);
        
        const treePositions = [
          { x: 40, z: -90, s: 16.8 }, 
          { x: -100, z: -30, s: 14 }, 
          { x: 100, z: 30, s: 12.6 }
        ];
        treePositions.forEach(d => { 
          const tr = createLowPolyTreeEx(); 
          tr.position.set(d.x, -0.6, d.z); 
          tr.rotation.y = Math.random() * Math.PI * 2; 
          tr.scale.set(d.s, d.s, d.s); 
          group.add(tr); 
        });

        const svgHashtag = createExtrudedSVGEx(`<svg width="170" height="170" viewBox="0 0 170 170"><path d="M118.25,61.72v-19.95h-19.95v19.95h-6.65v-19.95h-19.95v19.95h-26.6v19.95h19.95v6.65h-26.6v19.95h19.95v19.95h19.95v-19.95h6.65v19.95h19.95v-19.95h26.6v-19.95h-19.95v-6.65h19.95v-19.95h-13.3ZM91.65,88.33h-6.65v-6.65h6.65v6.65Z" fill="#a0a038"/><path d="M104.95,75.02h19.95v-6.65h-13.3v-19.95h-6.65v19.95h-19.95v-19.95h-6.65v19.95h-26.6v6.65h19.95v19.95h-26.6v6.65h19.95v19.95h6.65v-19.95h19.95v19.95h6.65v-19.95h26.6v-6.65h-19.95v-19.95ZM98.3,94.98h-19.95v-19.95h19.95v19.95Z" fill="#03030f"/></svg>`, 0.4); 
        // Swapped position with Like (was right, now left at -45, 45, 20)
        // Inverted Rotation Y to 0.5 to face center from the left
        svgHashtag.position.set(-45, 45, 20); 
        svgHashtag.rotation.y = 0.5;
        svgHashtag.rotation.x = -0.3;
        svgHashtag.userData.baseY = 45; 
        group.add(svgHashtag);
      }
      if (i === 9) {
        // Enlarged right trees by 30% (x:70 and x:20 are right-ish)
        [{x:70,z:40,s:14.3}, {x:-70,z:20,s:10}, {x:20,z:-80,s:15.6}].forEach(d => { const tr = createLowPolyTreeEx(); tr.position.set(d.x, -0.6, d.z); tr.rotation.y = Math.random()*Math.PI*2; tr.scale.set(d.s,d.s,d.s); group.add(tr); });
        
        // FIX: Restored corrected SVG markup for svgIdea to fix corruption/distortion
        const svgIdea = createExtrudedSVGEx(`<svg width="170" height="170" viewBox="0 0 170 170"><path d="M134.88,51.7v-13.3h-6.65v-6.65h-6.65v-6.65h-6.65v-6.65h-13.3v-6.65h-33.25v6.65h-13.3v6.65h-6.65v6.65h-6.65v6.65h-6.65v13.3h-6.65v33.25h6.65v13.3h6.65v6.65h6.65v6.65h6.65v33.25h6.65v6.65h6.65v6.75h33.25v-6.75h6.65v-6.65h6.65v-33.25h6.65v-6.65h6.65v-6.65h6.65v-13.3h6.65v-33.25h-6.65Z" fill="#e3ff4f"/><g><rect x="55.07" y="31.74" width="6.65" height="6.65" fill="#03030f"/><rect x="108.28" y="31.74" width="6.65" height="6.65" fill="#03030f"/><path d="M75.02,31.74v-6.65h-13.3v6.65h13.3Z" fill="#03030f"/><path d="M101.63,31.74h6.65v-6.65h-13.3v6.65h6.65Z" fill="#03030f"/><path d="M88.33,25.09h6.65v-6.65h-19.95v6.65h13.3Z" fill="#03030f"/><rect x="48.42" y="38.4" width="6.65" height="6.65" fill="#03030f"/><rect x="114.93" y="38.4" width="6.65" height="6.65" fill="#03030f"/><path d="M48.42,45.05h-6.65v13.3h6.65v-13.3Z" fill="#03030f"/><path d="M121.58,58.35h6.65v-13.3h-6.65v13.3Z" fill="#03030f"/><path d="M128.23,58.35v19.95h6.65v-19.95h-6.65Z" fill="#03030f"/><path d="M41.77,58.35h-6.65v19.95h6.65v-19.95Z" fill="#03030f"/><path d="M68.37,65h-6.65v13.3h6.65v-13.3Z" fill="#03030f"/><path d="M108.28,65h-6.65v13.3h6.65v-13.3Z" fill="#03030f"/><path d="M48.42,78.3h-6.65v13.3h6.65v-13.3Z" fill="#03030f"/><rect x="68.37" y="78.3" width="6.65" height="6.65" fill="#03030f"/><rect x="94.98" y="78.3" width="6.65" height="6.65" fill="#03030f"/><path d="M121.58,91.6h6.65v-13.3h-6.65v13.3Z" fill="#03030f"/><rect x="48.42" y="91.6" width="6.65" height="6.65" fill="#03030f"/><rect x="114.93" y="91.6" width="6.65" height="6.65" fill="#03030f"/><rect x="55.07" y="98.25" width="6.65" height="6.65" fill="#03030f"/><rect x="108.28" y="98.25" width="6.65" height="6.65" fill="#03030f"/><path d="M101.63,111.55h-6.65v-26.6h-6.65v26.6h-6.65v-26.6h-6.65v26.6h-6.65v-6.65h-6.65v33.25h6.65v-6.65h33.25v6.65h6.65v-33.25h-6.65v6.65ZM101.63,124.86h-33.25v-6.65h33.25v6.65Z" fill="#03030f"/><rect x="68.37" y="138.16" width="6.65" height="6.65" fill="#03030f"/><rect x="94.98" y="138.16" width="6.65" height="6.65" fill="#03030f"/><path d="M81.67,144.81h-6.65v6.65h19.95v-6.65h-13.3Z" fill="#03030f"/></g></svg>`, 0.4); 
        
        svgIdea.position.set(-60, 60, -20); 
        svgIdea.userData.baseY = 60; 
        group.add(svgIdea);
        
        // Enlarged Love SVG by 30% (scale 0.28 -> 0.36)
        const svgLove = createExtrudedSVGEx(`<svg viewBox="0 0 170 170"><polygon points="140.92 65.29 140.92 52.13 134.34 52.13 134.34 45.55 127.76 45.55 127.76 38.97 121.18 38.97 121.18 32.39 108.02 32.39 108.02 25.81 61.97 25.81 61.97 32.39 48.81 32.39 48.81 38.97 42.23 38.97 42.23 45.55 35.65 45.55 35.65 52.13 29.07 52.13 29.07 65.29 22.49 65.29 22.49 111.34 29.07 111.34 29.07 117.92 35.65 117.92 35.65 124.5 42.23 124.5 42.23 131.08 48.81 131.08 48.81 137.66 61.97 137.66 61.97 144.19 108.02 144.19 108.02 137.66 121.18 137.66 121.18 131.08 127.76 131.08 127.76 124.5 134.34 124.5 134.34 117.92 140.92 117.92 140.92 111.34 147.5 111.34 147.5 65.29 140.92 65.29" fill="#fb93f2"/><g>  <rect x="68.56" y="32.39" width="32.89" height="6.58" fill="#03030f"/>  <rect x="101.45" y="38.97" width="13.16" height="6.58" fill="#03030f"/>  <polygon points="42.24 78.44 48.82 78.44 48.82 85.02 55.4 85.02 55.4 91.6 61.98 91.6 61.98 85.02 68.56 85.02 68.56 78.44 75.14 78.44 75.14 71.86 81.72 71.86 81.72 58.7 75.14 58.7 75.14 52.12 61.98 52.12 61.98 58.7 55.4 58.7 55.4 45.55 68.55 45.55 68.55 38.97 55.39 38.97 55.39 45.54 48.82 45.54 48.82 52.12 42.24 52.12 42.24 58.7 35.66 58.7 35.66 71.86 42.24 71.86 42.24 78.44" fill="#03030f"/>  <polygon points="134.35 71.87 134.35 58.71 127.77 58.71 127.77 52.13 121.19 52.13 121.19 45.55 114.61 45.55 114.61 58.71 108.03 58.71 108.03 52.13 94.87 52.13 94.87 58.71 88.29 58.71 88.29 71.87 94.87 71.87 94.87 78.45 101.45 78.45 101.45 85.03 108.03 85.03 108.03 91.61 114.61 91.61 114.61 85.03 121.19 85.03 121.19 78.45 127.77 78.45 127.77 71.87 134.34 71.87 134.34 104.76 140.92 104.76 140.92 71.87 134.35 71.87" fill="#03030f"/>  <polygon points="35.66 91.6 35.66 91.59 35.66 71.86 29.08 71.86 29.08 104.75 35.66 104.75 35.66 91.6" fill="#03030f"/>  <rect x="55.39" y="98.18" width="6.58" height="6.58" fill="#03030f"/>  <rect x="108.03" y="98.18" width="6.58" height="6.58" fill="#03030f"/>  <polygon points="108.02 104.76 61.97 104.76 61.97 111.34 68.55 111.34 68.55 117.92 101.44 117.92 101.44 111.34 108.02 111.34 108.02 104.76" fill="#03030f"/>  <polygon points="127.76 111.34 121.18 111.34 121.18 117.92 114.61 117.92 114.61 124.5 121.19 124.5 121.19 117.92 127.76 117.92 127.76 111.34 134.34 111.34 134.34 104.76 127.76 104.76 127.76 111.34" fill="#03030f"/>  <polygon points="42.24 111.34 42.24 104.76 35.66 104.76 35.66 111.34 42.24 111.34 42.24 117.92 48.82 117.92 48.82 111.34 42.24 111.34" fill="#03030f"/>  <polygon points="61.97 124.5 55.4 124.5 55.4 117.92 48.82 117.92 48.82 124.5 55.39 124.5 55.39 131.08 68.55 131.08 68.55 124.5 61.97 124.5" fill="#03030f"/>  <rect x="101.45" y="124.5" width="13.16" height="6.58" fill="#03030f"/>  <polygon points="88.28 131.08 68.55 131.08 68.55 137.66 101.44 137.66 101.44 131.08 88.29 131.08 88.28 131.08" fill="#03030f"/></g></svg>`, 0.36); svgLove.position.set(0, 30, -30); svgLove.userData.baseY = 30; group.add(svgLove);
      }
      group.position.set(0, 0, -i * CONFIG.itemSpacing); 
      group.userData.id = i; 
      markers.push(group); 
      markerRoot.add(group);
    }
  }

  function jumpToMarker(index: number): void {
    if (!state.canScroll) return;
    const target = markers.find(m => m.userData.id === index);
    if (target) {
      state.targetScrollPos = target.position.z + CONFIG.viewOffset;
      hideScrollHint();
    }
  }

  function updateUI(): void {
    let activeIndex = -1; 
    const camZ = camera.position.z;
    const viewTarget = camZ - CONFIG.viewOffset; 
    let minDistance = Infinity;
    for (const group of markers) { 
      const d = Math.abs(group.position.z - viewTarget); 
      if (d < minDistance) { 
        minDistance = d; 
        if (d < CONFIG.itemSpacing / 2) activeIndex = group.userData.id; 
      } 
    }
    if (activeIndex === -1) { 
      let absoluteClosest = Infinity; 
      for (const group of markers) { 
        const d = Math.abs(group.position.z - viewTarget); 
        if (d < absoluteClosest) { 
          absoluteClosest = d; 
          activeIndex = group.userData.id; 
        } 
      } 
    }
    if (activeIndex !== state.activeIndex) {
      state.activeIndex = activeIndex;
      navDots.forEach((item) => {
        const isActive = item.activeIndices.includes(activeIndex);
        item.container.classList.toggle('opacity-100', isActive); 
        item.container.classList.toggle('opacity-60', !isActive);
        item.dot.classList.toggle('bg-[#e3ff9f]', isActive); 
        item.dot.classList.toggle('scale-150', isActive); 
        item.dot.classList.toggle('bg-white', !isActive);
        item.label.classList.toggle('opacity-100', isActive); 
        item.label.classList.toggle('translate-x-0', isActive); 
        item.label.classList.toggle('opacity-0', !isActive); 
        item.label.classList.toggle('-translate-x-2', !isActive);
      });
      // Updated logic: Match id="marker-{index+1}"
      overlays.forEach((ov) => {
        if(!ov.id || !ov.id.startsWith('marker-')) return;
        const targetIndex = parseInt(ov.id.replace('marker-', '')) - 1; // ID is 1-based, index is 0-based
        const isActive = (activeIndex === targetIndex);
        
        // Toggle active/inactive classes for pointer event control
        if (isActive) {
          ov.classList.add('overlay-active');
          ov.classList.remove('overlay-inactive');
        } else {
          ov.classList.add('overlay-inactive');
          ov.classList.remove('overlay-active');
        }
        
        // Pause ticker if not active (Marker 7 is index 6)
        if (targetIndex === 6) { 
          const ticker = ov.querySelector('.ticker-track'); 
          if (ticker) { 
            if (isActive) ticker.classList.remove('ticker-paused'); 
            else ticker.classList.add('ticker-paused'); 
          } 
        }
        // Hide slides if not active
        if (!isActive) {
          ov.querySelectorAll<HTMLElement>('div[class^="slide-"]').forEach(child => child.style.display = 'none');
        }
      });
    }
  }

  const unlockVideos = (): void => {
    if (state.videosUnlocked) return;
    state.videosUnlocked = true;
    allVideos.forEach(v => {
      v.play()
        .then(() => v.pause())
        .catch(() => {});
    });
  };

  function hideScrollHint(): void {
    if (!state.hasScrolled && state.canScroll) {
      state.hasScrolled = true;
      scrollHint?.classList.add('opacity-0');
      state.enableParallax = true;
      if (roomStack) roomStack.split();
    }
  }

  function handleScroll(delta: number): void {
    if (!state.canScroll) return;
    // FIX: Prevent scroll if interacting with sliders or nav
    if (state.isInteracting) return;
    unlockVideos();
    hideScrollHint();
    if (state.isDragging) state.enableParallax = false;
    state.targetScrollPos -= delta * (('ontouchstart' in window) ? CONFIG.touchScrollSensitivity : CONFIG.scrollSensitivity);
  }

  createElements();

  fontLoader.load('https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/Barlow%20Condensed%20ExtraBold_Regular.json', function (font) {
    const textData = [
      { index: 1, content: "SOCIAL MOVES THE WORLD.<br />MOVEMENT HELPS BRANDS<br />MOVE WITH IT.", y: 25, zOffset: 0, xOffset: -20, yRotate: Math.PI / 7 },
      { index: 2, content: "FROM SOCIAL AS A CHANNEL,<br />TO SOCIAL AS THE CORE OF<br />BRAND STRATEGY.", y: 20, zOffset: 0 },
      { index: 3, content: "FROM TARGETING PEOPLE,<br />TO CREATING WITH THEM.", y: 25, zOffset: 0, xOffset: -20, yRotate: Math.PI / 7 },
      { index: 4, content: "FROM TALKING ABOUT YOURSELF,<br />TO DOING THINGS WORTH<br />TALKING ABOUT.", y: 25, zOffset: 0 },
      { index: 5, content: "FEATURED<br />WORK", y: 78, zOffset: 0, size: 8 },
      { index: 6, content: "OUR SERVICES", y: 70, zOffset: 0, size: 8 },
      { index: 7, content: "LATEST FROM<br />OUR FEED", y: 78, zOffset: 0, size: 8 },
      { index: 8, content: "OUR<br />CULTURE", y: 50, zOffset: 0, size: 10 },
      { index: 9, content: "LET'S<br />CONNECT", y: 50, zOffset: 0, size: 10 }
    ];
    const isMobile = window.innerWidth < 768; // Detect mobile state here
    textData.forEach(item => { 
      if (markers[item.index]) { 
        // FIX: Scale down text by 15% on mobile (< 768px)
        let finalSize = item.size || 5.4;
        if (isMobile) {
          finalSize *= 0.85; 
        }
        const textMesh = create3DTextEx(font, item.content, finalSize); 
        textMesh.position.y = item.y; 
        if (item.zOffset) textMesh.position.z = item.zOffset; 
        if (item.xOffset) textMesh.position.x = item.xOffset; 
        if (item.yRotate) textMesh.rotation.y = item.yRotate; 
        textMesh.name = `text-marker-${item.index}`; // Name it for referencing later
        markers[item.index].add(textMesh); 
      } 
    });
  });

  window.addEventListener('wheel', (e) => handleScroll(e.deltaY), { passive: false });
  window.addEventListener('mousemove', (e) => { 
    state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1; 
    state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; 
  });
  window.addEventListener('touchstart', (e: TouchEvent) => {
    if (!state.canScroll) return;
    unlockVideos();
    const target = e.target as Element;
    if (!target.closest('button') && !target.closest('#nav-container')) {
      hideScrollHint();
      state.enableParallax = false;
      state.isDragging = true;
      state.lastTouchY = e.touches[0].clientY;
      state.touchX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    }
  }, { passive: false });
  window.addEventListener('touchmove', (e) => { 
    if (state.isDragging && state.canScroll) { 
      handleScroll((state.lastTouchY - e.touches[0].clientY) * 2); 
      state.lastTouchY = e.touches[0].clientY; 
      state.touchX = (e.touches[0].clientX / window.innerWidth) * 2 - 1; 
    } 
  }, { passive: false });
  window.addEventListener('touchend', () => { 
    state.isDragging = false; 
  });
  window.addEventListener('click', unlockVideos);

  // Handle button interactions to prevent camera sway/scroll
  const handleBtnInteractionStart = () => { state.isInteracting = true; };
  const handleBtnInteractionEnd = () => { state.isInteracting = false; };

  [prevBtn, nextBtn].forEach(btn => {
    if(btn) {
      btn.addEventListener('mouseenter', handleBtnInteractionStart);
      btn.addEventListener('touchstart', handleBtnInteractionStart, {passive: true});
      btn.addEventListener('mouseleave', handleBtnInteractionEnd);
      btn.addEventListener('touchend', handleBtnInteractionEnd);
      
      btn.addEventListener('click', () => { 
        if (!state.canScroll) return; 
        unlockVideos(); 
        let refIdx = state.activeIndex; 
        if (refIdx === -1) { 
          const relativeDist = CONFIG.viewOffset - camera.position.z; 
          const closestRawIndex = Math.round(relativeDist / CONFIG.itemSpacing); 
          refIdx = ((closestRawIndex % CONFIG.itemCount) + CONFIG.itemCount) % CONFIG.itemCount; 
        } 
        const dir = btn.id === 'next-btn' ? -1 : 1; // Logic inverted relative to original
        // Actually original logic:
        // prev -> (refIdx + 1)
        // next -> (refIdx - 1)
        // Wait, that's moving BACKWARDS in index to go forwards in space?
        // Z goes negative. Index 0 is at 0. Index 1 is at -275.
        // So "Next" should be Index + 1 (more negative Z).
        // Prev should be Index - 1 (less negative Z).
        
        // Let's keep original logic for consistency unless asked to change
        if (btn.id === 'prev-btn') jumpToMarker((refIdx + 1) % CONFIG.itemCount); 
        else jumpToMarker((refIdx - 1 + CONFIG.itemCount) % CONFIG.itemCount); 
      });
    }
  });


  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    // ViewOffset fixed to 90, so not updating here
    CONFIG.parallaxAmpX = w >= 768 ? 30 : 18;
    const s = w >= 768 ? 24 : 16;
    activeSliders.forEach(slider => slider.group.scale.set(s, s, s));
    if (isTouch) adjustHeight();
  });

  renderer.domElement.addEventListener('pointerdown', (e) => activeSliders.forEach(slider => slider.onPointerDown(e, camera)));
  renderer.domElement.addEventListener('pointermove', (e) => activeSliders.forEach(slider => slider.onPointerMove(e, camera)));
  window.addEventListener('pointerup', () => activeSliders.forEach(slider => slider.onPointerUp()));

  const clock = new THREE.Clock();
  const totalLength = CONFIG.itemCount * CONFIG.itemSpacing;
  function easeOutBack(x: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  const loadAssets = async (): Promise<void> => {
    // RoomStack already loads textures via textureLoader, no need to preload here
    await new Promise<void>(resolve => {
      // Check if loading is already complete
      let hasItems = false;
      const originalOnStart = manager.onStart;
      manager.onStart = (url, loaded, total) => {
        hasItems = true;
        if (originalOnStart) originalOnStart(url, loaded, total);
      };
      manager.onLoad = () => resolve();
      // Give time to check if any items were queued
      setTimeout(() => {
        if (!hasItems) resolve();
      }, 100);
    });
    await Promise.all(videoPromises);
    state.loaded = true;
    document.body.classList.add('loaded');
  };

  const checkLoadedAndPlay = (): void => {
    if (state.loaded && introVideo && introOverlay) {
      introVideo.play().catch(() => {});
      introVideo.onended = () => {
        introOverlay.style.opacity = '0';
        setTimeout(() => {
          introOverlay.style.display = 'none';
          state.canScroll = true;
          const scrollHintEl = document.getElementById('scroll-hint');
          if (scrollHintEl) scrollHintEl.classList.remove('opacity-0');
        }, 1000);
      };
    } else {
      requestAnimationFrame(checkLoadedAndPlay);
    }
  };

  // TOUCH OPTIMIZATION LOGIC
  const isTouch: boolean = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  function adjustHeight(): void {
    if (isTouch) {
      document.body.style.height = window.innerHeight + 'px';
    }
  }
  if (isTouch) {
    document.body.classList.add('overflow-hidden', 'overscroll-none');
    adjustHeight();
  }

  loadAssets();
  checkLoadedAndPlay();

  function animate(): void {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
    
    state.scrollPos += (state.targetScrollPos - state.scrollPos) * CONFIG.scrollLerp; 
    camera.position.z = state.scrollPos;
    
    let tx = 0;
    let ty = 0;
    let ry = 0;
    let rx = 0;
    
    // FIX: Disable parallax calculation if interacting with UI/Sliders
    if (state.enableParallax && !state.isInteracting) { 
      tx = state.mouse.x * CONFIG.parallaxAmpX; 
      ty = state.mouse.y * CONFIG.parallaxAmpY; 
      ry = -state.mouse.x * 0.15; 
      rx += state.mouse.y * 0.08; 
    } else if (state.isDragging) {
      ry = -state.touchX * 0.4;
    }
    
    // If interacting, we want camera to stabilize to 0 offsets relative to base
    // The lerp below handles returning to 0 if tx/ty are 0
    camera.position.x += (tx - camera.position.x) * CONFIG.lerpSpeed; 
    camera.position.y += ((CONFIG.cameraHeight + ty) - camera.position.y) * CONFIG.lerpSpeed; 
    camera.rotation.y += (ry - camera.rotation.y) * CONFIG.lerpSpeed; 
    camera.rotation.x += (rx - camera.rotation.x) * CONFIG.lerpSpeed;
    
    camSpotLight.position.z = camera.position.z + 10; 
    camSpotLight.target.position.z = camera.position.z - 200; 
    camSpotLight.target.updateMatrixWorld();
    
    const snap = Math.floor(camera.position.z / CONFIG.gridSize) * CONFIG.gridSize; 
    gridHelper.position.z = snap; 
    floor.position.z = snap;
    
    // Mobile Layout Logic
    const isMobile = window.innerWidth < 768;
    
    // Marker 2 (Index 1) Adjustments
    if (markers[1]) {
      const text = markers[1].getObjectByName('text-marker-1');
      if (text) {
        if (isMobile) {
          text.position.x = 0;
          text.rotation.y = 0;
          text.rotation.x = 0;
        } else {
          text.position.x = -20;
          text.rotation.y = Math.PI / 7;
          text.rotation.x = 0;
        }
      }
      if (videoSphereMesh) {
        if (isMobile) {
          videoSphereMesh.position.x = 0;
          videoSphereMesh.position.y = 55; // Lowered to be just above text
          videoSphereMesh.position.z = -50;
        } else {
          videoSphereMesh.position.set(55, 60, 0); // Original desktop pos
        }
      }
    }

    // Marker 4 (Index 3) Adjustments
    if (markers[3]) {
      const text = markers[3].getObjectByName('text-marker-3');
      if (text) {
        if (isMobile) {
          text.position.x = 0;
          text.rotation.y = 0;
          text.rotation.x = 0;
        } else {
          text.position.x = -20;
          text.rotation.y = Math.PI / 7;
          text.rotation.x = 0;
        }
      }
      const phone = markers[3].children.find(c => c.userData.video && c.userData.isIcon);
      if (phone) {
        // Set base Y based on device
        // FIX: Animation now respects the base set by createElements or this logic
        // We don't set userData.baseY here repeatedly, we trust the logic used the correct baseY
        const currentBase = phone.userData.baseY || (isMobile ? 65 : 40);
        
        if (isMobile) {
          phone.position.x = 0;
          phone.position.z = -40; 
        } else {
          phone.position.x = 25; 
        }
        phone.position.y = currentBase + Math.sin(time) * 1.5;
      }
      
      // Handle svgCool desktop adjustment
      const svgCool = markers[3].getObjectByName('svgCool');
      if (svgCool) {
        if (isMobile) {
          // Mobile: Move Left to avoid phone
          svgCool.position.x = -65; 
          svgCool.rotation.y = 0.5;
        } else {
          // Desktop: Centered (Original)
          svgCool.position.x = -25;
          svgCool.rotation.y = 0.5; 
        }
      }
    }

    let blobActive = false;
    let slideActive = false;
    let vidActive = false; 
    const activeSld = new Set();
    
    markers.forEach((g) => {
      const dist = g.position.z - camera.position.z;
      if (dist > CONFIG.itemSpacing) { 
        g.position.z -= totalLength; 
        g.children.forEach(child => { 
          if (child.userData.isTextGroup) { 
            child.userData.triggered = false; 
            child.children.forEach(line => line.children.forEach(char => { 
              char.visible = false; 
              char.position.y = char.userData.initialY; 
              char.scale.set(0, 0, 0); 
            })); 
          } 
        }); 
      } else if (dist < -totalLength + CONFIG.itemSpacing) { 
        g.position.z += totalLength; 
        g.children.forEach(child => { 
          if (child.userData.isTextGroup) { 
            child.userData.triggered = false; 
            child.children.forEach(line => line.children.forEach(char => { 
              char.visible = false; 
              char.position.y = char.userData.initialY; 
              char.scale.set(0, 0, 0); 
            })); 
          } 
        }); 
      }
      
      g.children.forEach(child => { 
        if (child.userData.isTextGroup) { 
          if (!child.userData.triggered && dist > -350 && dist < 100) { 
            child.userData.triggered = true; 
            child.userData.startTime = time; 
          } 
          if (child.userData.triggered) { 
            const elapsed = time - child.userData.startTime; 
            child.children.forEach(line => { 
              line.children.forEach(charMesh => { 
                const delay = charMesh.userData.delayIndex * 0.05;
                const animT = elapsed - delay; 
                if (animT > 0) { 
                  charMesh.visible = true; 
                  const duration = 0.8;
                  const progress = Math.min(animT / duration, 1);
                  const easeVal = easeOutBack(progress); 
                  charMesh.position.y = THREE.MathUtils.lerp(charMesh.userData.initialY, charMesh.userData.targetY, easeVal); 
                  const s = THREE.MathUtils.lerp(0, 1, easeVal); 
                  charMesh.scale.set(s, s, s); 
                  // Only rotate text if NOT mobile or if it's supposed to rotate
                  if (!isMobile) {
                    charMesh.rotation.y = THREE.MathUtils.lerp(Math.PI, 0, easeVal); 
                  } else {
                    charMesh.rotation.y = 0;
                  }
                } 
              }); 
            }); 
          } 
        } 
      });
      
      const nearby = Math.abs(dist) < CONFIG.itemSpacing;
      if (nearby) { 
        g.children.forEach(c => { 
          if(c.userData.isIcon) { 
            c.position.y = c.userData.baseY + Math.sin(time * 2 + c.id) * 2; 
            c.rotation.y = (c.userData.baseRotY || 0) + Math.sin(time * 1.5) * 0.2; 
          }
        }); 
        const phone = g.children.find(c => c.userData.video && c.userData.isIcon); 
        if (phone) { 
          const vid = phone.userData.video; 
          if (state.videosUnlocked && vid.paused) vid.play().catch(() => {}); 
          phone.rotation.y = -Math.PI / 6 + Math.sin(time * 0.5) * 0.05; 
          // Updated to assume baseY is set correctly by logic above
          // Note: animation base logic is handled in the mobile-specific block above for marker 4 specifically
          // For other potential video phones, this default line runs:
          if(g.userData.id !== 3) {
            phone.position.y = (phone.userData.baseY || 40) + Math.sin(time) * 1.5; 
          }
        } 
      } else { 
        const phone = g.children.find(c => c.userData.video && c.userData.isIcon); 
        if(phone && !phone.userData.video.paused) phone.userData.video.pause(); 
      }
      
      if (g.userData.id === 1) { 
        vidActive = nearby; 
        const v = g.children.find(c => c.userData.video && !c.userData.isIcon); 
        if(v && v.userData.video) { 
          if(nearby && state.videosUnlocked && v.userData.video.paused) v.userData.video.play().catch(() => {}); 
          else if(!nearby && !v.userData.video.paused) v.userData.video.pause(); 
        } 
      }
      if (g.userData.id === 6) blobActive = nearby; 
      if ((g.userData.id === 5 || g.userData.id === 7) && nearby) activeSld.add(g.userData.id);
    });
    
    activeSliders.forEach(s => { 
      if (activeSld.has(s.markerId)) s.update(time); 
    });
    if (roomStack) roomStack.update();
    if (videoSphereMesh && vidActive) { 
      videoSphereMesh.rotation.y -= 0.005; 
      // Position handled by mobile logic above, but needs bobbing
      const base = isMobile ? 55 : 60; // Adjusted base for mobile
      videoSphereMesh.position.y = base + Math.sin(time * 0.8) * 2; 
    }
    if (blobMeshRef && blobActive) {
      const pos = blobMeshRef.geometry.attributes.position;
      const orig = blobMeshRef.geometry.userData.originalPositions; 
      if (blobMeshRef.material) {
        const h = (time * 0.1) % 1;
        const mat = blobMeshRef.material as THREE.MeshStandardMaterial;
        mat.emissive.setHSL(h, 0.8, 0.2);
        mat.color.setHSL(h, 0.8, 0.5);
      } 
      const t = time * 2.5; 
      for (let i = 0; i < pos.count; i++) { 
        const ox = orig[i*3];
        const oy = orig[i*3+1];
        const oz = orig[i*3+2];
        const w1 = Math.sin(ox * 0.15 + t);
        const w2 = Math.cos(oy * 0.12 + t * 1.1);
        const w3 = Math.sin(oz * 0.18 + t * 0.8);
        const sc = 1.0 + 0.35 * (w1 * 0.33 + w2 * 0.33 + w3 * 0.33); 
        pos.setXYZ(i, ox * sc, oy * sc, oz * sc); 
      }
      pos.needsUpdate = true; 
      blobMeshRef.geometry.computeVertexNormals(); 
      blobMeshRef.rotation.y += 0.002; 
      blobMeshRef.rotation.z += 0.001;
    }
    if (lolTextRef) {
      lolTextRef.rotation.y += 0.02;
    }
    updateUI();
    if (postConfig.noiseSpeed > 0) {
      customEffectsPass.uniforms["time"].value += 0.01;
    }
    composer.render();
  }
  animate();

  // Cleanup function for React useEffect
  cleanupFn = () => {
    isInitialized = false;
    // Stop animation loop
    clock.stop();
    // Dispose of Three.js resources
    renderer.dispose();
    composer.dispose();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        }
      }
    });
    // Clean up sliders
    activeSliders.forEach(s => s.dispose());
    // Remove canvas from DOM
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
    // Stop all videos
    allVideos.forEach(v => {
      v.pause();
      v.src = '';
      v.load();
    });
  };

  return cleanupFn;
}