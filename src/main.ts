import "./style.css";
import heroCapybaraSheetUrl from "./assets/hero-capybara-sheet.png";
import lobsterGuideSheetUrl from "./assets/lobster-guide-sheet-strip.png";
import clawLibrarySceneFloorUrl from "./assets/clawlibrary-scene-floor.png";
import clawLibrarySceneObjectsUrl from "./assets/clawlibrary-scene-objects.png";
import officeLayoutConfig from "./office-layouts.json";
import {
  departments as chineseDepartments,
  thesisPoints as chineseThesisPoints,
  uniqueSources as chineseUniqueSources,
  type Department,
  type Scenario,
  type SourceItem,
} from "./data";
import {
  departments as englishDepartments,
  thesisPoints as englishThesisPoints,
  uniqueSources as englishUniqueSources,
} from "./data-en";

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`UI 初始化失败：缺少节点 ${selector}`);
  }
  return element;
}

type ControlKey = "forward" | "backward" | "left" | "right" | "turn-left" | "turn-right";

type Point = {
  x: number;
  y: number;
};

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Polygon = Point[];

type RoomApproachSide = "up" | "down" | "left" | "right";

type RoomLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  doorWidth: number;
  approachSide: RoomApproachSide;
  corridorPoint?: Point;
};

type IdentifiedRoomLayout = RoomLayout & {
  id: string;
};

type FacingDirection = "up" | "down" | "left" | "right";
type PlayerSpriteFacing = FacingDirection | "up-left" | "up-right" | "down-left" | "down-right";

type ScenarioTerminal = {
  kind: "scenario";
  id: string;
  department: SceneDepartment;
  scenario: Scenario;
  position: Point;
  pulseOffset: number;
};

type ExternalTerminal = {
  kind: "external";
  id: string;
  department: SceneDepartment;
  label: string;
  url: string;
  position: Point;
  pulseOffset: number;
};

type OfficeTerminal = ScenarioTerminal | ExternalTerminal;

type InsightNode = {
  id: string;
  department: SceneDepartment;
  fact: string;
  position: Point;
  pulseOffset: number;
};

type SceneDepartment = Department & {
  npcRoles: string[];
  sourceRoomId: string;
  sourceRoomLabel: string;
  roomRect: Rect;
  walkwayRect: Rect;
  frontageRect: Rect;
  deskRect: Rect;
  entryPoint: Point;
  corridorLanePoint: Point;
  workSpots: Point[];
  terminals: OfficeTerminal[];
  insight: InsightNode;
  decorSeed: number;
  approachSide: RoomApproachSide;
};

type MinimapHit = {
  department: SceneDepartment;
  x: number;
  y: number;
  width: number;
  height: number;
};

type PlayerState = {
  x: number;
  y: number;
  facing: number;
  step: number;
};

type Star = {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
};

type UiLanguage = "zh-CN" | "en";

type TitleScreenPhase = "language" | "intro";

type TitleScreenHero = {
  position: Point;
  target: Point;
  facing: number;
  speed: number;
  retargetTimer: number;
  step: number;
};

type TitleScreenLobster = {
  position: Point;
  target: Point;
  retargetTimer: number;
  speed: number;
  panic: number;
  facing: number;
};

type DataCatalog = {
  departments: Department[];
  thesisPoints: string[];
  uniqueSources: SourceItem[];
};

const UI_TEXT = {
  "zh-CN": {
    documentTitle: "小龙虾在商业上的叠加态 | OpenClaw Agent Office",
    start: {
      badge: "像素开场",
      title: "小龙虾在商业上的叠加态",
      subtitle: "4月26日活动",
      copy: "已切换到中文界面。点击开始，进入像素风商业场景。",
      button: "开始进入",
      languageLabel: "切换界面语言",
      languageZh: "中文",
      languageEn: "English",
    },
    uiToggle: {
      ariaLabel: "切换界面显示",
      show: "显示 UI",
      hide: "隐藏 UI",
    },
    dashboard: {
      session: "本地办公室会话",
      lastEventPrefix: "最近动作：",
      waiting: "等待指令",
      locale: "zh-CN",
    },
    brand: {
      eyebrow: "像素商业演示",
      title: "小龙虾在商业上的叠加态",
      subtitle: "4月26日活动",
      body: "作为办公室里的主角在工位间穿梭，追逐小龙虾导览员，把各部门商业场景连成一条可漫游的执行路线。",
    },
    controls: {
      title: "场景操作",
      move: "桌面端用 <code>WASD</code> / 方向键移动；拖拽调整朝向，滚轮缩放镜头。",
      interact:
        "桌面端靠近工位按 <code>E</code> 互动、按 <code>F</code> 记录洞察；手机端点地面移动，点互动物体直接触发。",
      jump: "也可直接点击右侧座位清单或小地图，快速切换到指定部门。",
    },
    thesis: {
      title: "核心论点",
    },
    map: {
      title: "办公室地图",
      floorIndicator: "L1 Agent Office",
    },
    metrics: {
      title: "演示进度",
      completed: "已完成场景",
      impact: "执行力分数",
      zone: "当前区域",
      stage: "当前阶段",
      insights: "洞察数",
      target: "当前目标",
      meeting: "会议状态",
      hotspot: "热点部门",
      seats: "会议席位",
      traffic: "办公节奏",
      focus: "导航聚焦",
      defaults: {
        currentZone: "中央办公区",
        targetIdle: "自由漫游",
        meetingInactive: "未开启",
        hotspotWaiting: "等待热点",
        trafficWaiting: "等待流动",
        focusRoom: "中央办公区",
      },
    },
    executionStages: {
      assist: "辅助执行",
      orchestrate: "编排执行",
      collaborate: "协同自治",
      network: "多 Agent 网络",
    },
    route: {
      title: "场景导航",
    },
    sources: {
      title: "参考来源",
    },
    mobile: {
      zoomOut: "缩小",
      zoomIn: "放大",
    },
    common: {
      close: "关闭",
    },
  },
  en: {
    documentTitle: "Lobster Superposition in Business | OpenClaw Agent Office",
    start: {
      badge: "Pixel Opening",
      title: "Lobster Superposition in Business",
      subtitle: "April 26 Event",
      copy: "English UI is selected. Press Start to enter the pixel-art business scene.",
      button: "START",
      languageLabel: "Switch UI Language",
      languageZh: "中文",
      languageEn: "English",
    },
    uiToggle: {
      ariaLabel: "Toggle interface visibility",
      show: "SHOW UI",
      hide: "HIDE UI",
    },
    dashboard: {
      session: "Local office session",
      lastEventPrefix: "Latest event: ",
      waiting: "Waiting for input",
      locale: "en-US",
    },
    brand: {
      eyebrow: "Pixel Business Demo",
      title: "Lobster Superposition in Business",
      subtitle: "April 26 Event",
      body: "Roam the office as the main character, chase the lobster guide, and connect each department's commercial scenario into one explorable execution route.",
    },
    controls: {
      title: "In-World Controls",
      move: "Desktop: use <code>WASD</code> / arrow keys to move; drag to turn; scroll to zoom.",
      interact:
        "Desktop: press <code>E</code> to interact and <code>F</code> to capture insights; on mobile, tap the floor to move and tap interactive props to trigger them.",
      jump: "You can also click the seat list or minimap on the right to jump to a department.",
    },
    thesis: {
      title: "Core Thesis",
    },
    map: {
      title: "Office Map",
      floorIndicator: "L1 Agent Office",
    },
    metrics: {
      title: "Progress",
      completed: "Completed Scenes",
      impact: "Execution Score",
      zone: "Current Zone",
      stage: "Current Stage",
      insights: "Insights",
      target: "Current Target",
      meeting: "Meeting Status",
      hotspot: "Hotspot Dept",
      seats: "Meeting Seats",
      traffic: "Office Flow",
      focus: "Navigation Focus",
      defaults: {
        currentZone: "Central Office",
        targetIdle: "Free roam",
        meetingInactive: "Not started",
        hotspotWaiting: "Awaiting hotspot",
        trafficWaiting: "Waiting for flow",
        focusRoom: "Central Office",
      },
    },
    executionStages: {
      assist: "Assistive Ops",
      orchestrate: "Orchestrated Ops",
      collaborate: "Coordinated Autonomy",
      network: "Multi-Agent Network",
    },
    route: {
      title: "Scene Navigation",
    },
    sources: {
      title: "Sources",
    },
    mobile: {
      zoomOut: "Zoom Out",
      zoomIn: "Zoom In",
    },
    common: {
      close: "Close",
    },
  },
} as const;

const dataCatalogByLanguage: Record<UiLanguage, DataCatalog> = {
  "zh-CN": {
    departments: chineseDepartments,
    thesisPoints: chineseThesisPoints,
    uniqueSources: chineseUniqueSources,
  },
  en: {
    departments: englishDepartments,
    thesisPoints: englishThesisPoints,
    uniqueSources: englishUniqueSources,
  },
};

let currentUiLanguage: UiLanguage = "zh-CN";
let baseDepartments = dataCatalogByLanguage["zh-CN"].departments;
let currentThesisPoints = dataCatalogByLanguage["zh-CN"].thesisPoints;
let currentUniqueSources = dataCatalogByLanguage["zh-CN"].uniqueSources;

type DepartmentSeed = Department & {
  npcRoles: string[];
};

type DepartmentVisualState = "busy" | "online" | "idle" | "done";

type OfficeProp = {
  rect: Rect;
  kind:
    | "meeting"
    | "podium"
    | "plant"
    | "cabinet"
    | "printer"
    | "coffee"
    | "microwave"
    | "cooler"
    | "sofa"
    | "bookshelf"
    | "whiteboard"
    | "receptionDesk"
    | "diningTable"
    | "servingCounter";
};

type SurfaceDrawTransform = {
  scale: number;
  drawLeft: number;
  drawTop: number;
};

type SharedZone = {
  id: string;
  label: string;
  sourceRoomId: string;
  sourceRoomLabel: string;
  accent: string;
  kind: "reception" | "cafeteria";
  roomRect: Rect;
  walkwayRect: Rect;
  frontageRect: Rect;
  approachSide: RoomApproachSide;
};

const departmentRoomLayoutById = new Map(
  (officeLayoutConfig.departments as IdentifiedRoomLayout[]).map((layout) => [layout.id, layout] as const)
);
const sharedZoneLayoutById = new Map(
  (officeLayoutConfig.sharedZones as IdentifiedRoomLayout[]).map((layout) => [layout.id, layout] as const)
);

type AreaGuideTarget =
  | { type: "department"; department: SceneDepartment }
  | { type: "shared-zone"; zone: SharedZone };

type AreaGuide = {
  id: string;
  label: string;
  accent: string;
  position: Point;
  preview: string;
  target: AreaGuideTarget;
  facing: PlayerSpriteFacing;
};

type CharacterPalette = {
  clothes: string;
  hair: string;
};

type MeetingSeatGroup = "upper" | "lower";

type MeetingSeat = {
  id: string;
  group: MeetingSeatGroup;
  position: Point;
  approachPoint: Point;
  facing: FacingDirection;
};

type MeetingPodium = {
  rect: Rect;
  interactionPoint: Point;
  label: string;
};

type InteractionTarget =
  | { type: "podium"; value: MeetingPodium }
  | { type: "guide"; value: AreaGuide }
  | { type: "terminal"; value: OfficeTerminal }
  | { type: "insight"; value: InsightNode };

type OffscreenIndicatorSide = "left" | "right" | "top" | "bottom";

type OffscreenInteractionIndicator = {
  id: string;
  title: string;
  accent: string;
  anchor: Point;
  distanceLabel: string;
  priority: number;
  highlighted: boolean;
};

type MinimapInteractionMarker = {
  id: string;
  target: InteractionTarget;
  accent: string;
  priority: number;
  highlighted: boolean;
};

type GroundInteractionMarker = {
  id: string;
  target: InteractionTarget;
  accent: string;
  highlighted: boolean;
};

type MeetingTimelineEntry = {
  id: string;
  round: number;
  stage: "ask" | "response";
  speakerName: string;
  counterpartName: string;
  speakerDepartment: string;
  accent: string;
  summary: string;
};

type GoalRelayState = {
  pulse: number;
  fromTarget: InteractionTarget | null;
  toTarget: InteractionTarget | null;
  fromAccent: string;
  toAccent: string;
  headline: string;
  detail: string;
};

type DepartmentMilestoneState = {
  pulse: number;
  departmentId: string;
  accent: string;
  title: string;
  detail: string;
  completedScenarios: number;
  totalScenarios: number;
  impactScore: number;
};

type DepartmentOutcomeRecord = {
  id: string;
  departmentId: string;
  accent: string;
  title: string;
  impactScore: number;
  highlights: string[];
};

type MeetingStageCueState = {
  pulse: number;
  accent: string;
  phaseKind: "idle" | "seating" | "ready" | "ask" | "response";
  title: string;
  detail: string;
  speakerId: string;
  counterpartId: string;
};

type AreaTransitionState = {
  areaKey: string;
  pulse: number;
  accent: string;
  label: string;
};

type NpcActor = {
  id: string;
  department: SceneDepartment;
  name: string;
  role: string;
  x: number;
  y: number;
  home: Point;
  target: Point;
  route: Point[];
  workSpots: Point[];
  speed: number;
  facing: FacingDirection;
  step: number;
  action: "walking" | "working";
  actionTimer: number;
  bubbleText: string;
  bubbleTimer: number;
  bubbleCooldown: number;
  stationary: boolean;
  palette: CharacterPalette;
  meetingSeat: MeetingSeat;
  meetingStatus: "office" | "queued" | "walking-to-seat" | "seated" | "walking-home";
  meetingDelay: number;
  flowSeed: number;
  socialCooldown: number;
};

const WALL_HEIGHT = 18;
const FLOOR_PADDING = 12;
const OFFICE_WIDTH = 960;
const OFFICE_HEIGHT = 540;
const CLAW_LIBRARY_SOURCE_WIDTH = 1920;
const CLAW_LIBRARY_SOURCE_HEIGHT = 1080;
const CLAW_LIBRARY_SCALE_X = OFFICE_WIDTH / CLAW_LIBRARY_SOURCE_WIDTH;
const CLAW_LIBRARY_SCALE_Y = OFFICE_HEIGHT / CLAW_LIBRARY_SOURCE_HEIGHT;
const INTERACTION_DISTANCE = 10;
const LED_SERVICE_DISCOVERY_DISTANCE = 22;
const GUIDE_INTERACTION_DISTANCE = 14;
const INSIGHT_DISTANCE = 8;
const PODIUM_INTERACTION_DISTANCE = 12;
const PROMPT_TARGET_ARROW_DISTANCE = 20;
const PLAYER_RADIUS = 1.4;
const PLAYER_SPEED = 90 * 1.3;
const NPC_BASE_SPEED = 8;
const NPC_MEETING_SUMMON_SPEED_MULTIPLIER = 3;
const NPC_BUBBLE_MAX_CHARS_PER_LINE = 10;
const NPC_BUBBLE_FONT_SIZE = 14;
const NPC_BUBBLE_LINE_HEIGHT = 18;
const MAX_VISIBLE_NPC_BUBBLES = 3;
const MAX_VISIBLE_NPC_NAME_TAGS = 10;
const MAX_OFFSCREEN_INTERACTION_INDICATORS = 3;
const MAX_GROUND_INTERACTION_MARKERS = 3;
const MAX_MINIMAP_INTERACTION_MARKERS = 5;
const NPC_BUBBLE_TRIGGER_CHANCE = 0.0035;
const NPC_AMBIENT_CONVERSATION_CHANCE = 0.0022;
const NPC_AMBIENT_CONVERSATION_DISTANCE = 18;
const NPC_INITIAL_POSITION_ATTEMPTS = 36;
const NPC_INITIAL_MIN_SEPARATION = 20;
const NPC_INITIAL_INTERACTION_PADDING = 14;
const NPC_OVERLAY_FULL_FADE_DISTANCE = 40;
const NPC_OVERLAY_FADE_START_DISTANCE = 100;
const NPC_OVERLAY_FADE_ALPHA = 0;
const NPC_LABEL_PRIORITY_DISTANCE = 84;
const NPC_LABEL_ROLE_DISTANCE = 42;
const NPC_NAME_FONT_SIZE = 7;
const DEPARTMENT_BANNER_HEIGHT = 14;
const DEPARTMENT_BANNER_FONT_SIZE = 10;
const DEPARTMENT_BANNER_WALKWAY_PADDING = 22;
const DEPARTMENT_BANNER_TEXT_PADDING = 28;
const PLAYER_SPRITE_BACKGROUND_TOLERANCE = 18;
const PLAYER_SPRITE_COMPONENT_MIN_PIXELS = 1000;
const PLAYER_SPRITE_FRAME_PADDING = 4;
const PLAYER_SPRITE_TARGET_HEIGHT = 34;
const PLAYER_SPRITE_MIN_WIDTH = 20;
const PLAYER_SPRITE_BASELINE_OFFSET = 2;
const PLAYER_MARKER_OFFSET = 30;
const LOBSTER_SPRITE_FRAME_SIZE = 32;
const LOBSTER_SPRITE_ANCHOR_X = 16;
const LOBSTER_SPRITE_ANCHOR_Y = 21;
const LOBSTER_SPRITE_BACKGROUND_TOLERANCE = 54;
const LOBSTER_SPRITE_SOURCE_TILE_SIZE = 192;
const LOBSTER_SPRITE_SOURCE_CROP_TOP = 8;
const LOBSTER_SPRITE_SOURCE_CROP_INSET_X = 2;
const LOBSTER_SPRITE_SOURCE_CROP_SIZE = 188;
const CAMERA_LOOK_AHEAD_PIXELS_DESKTOP = 42;
const CAMERA_LOOK_AHEAD_PIXELS_MOBILE = 20;
const CAMERA_LOOK_AHEAD_STRENGTH_RISE_DAMPING = 0.01;
const CAMERA_LOOK_AHEAD_STRENGTH_RELEASE_DAMPING = 0.16;
const CAMERA_LOOK_AHEAD_POSITION_RISE_DAMPING = 0.00015;
const CAMERA_LOOK_AHEAD_POSITION_RELEASE_DAMPING = 0.06;
const CAMERA_NAVIGATION_BIAS_PIXELS_DESKTOP = 30;
const CAMERA_NAVIGATION_BIAS_PIXELS_MOBILE = 20;
const CAMERA_NAVIGATION_BIAS_NEAR_DISTANCE = 28;
const CAMERA_NAVIGATION_BIAS_FAR_DISTANCE = 300;
const CAMERA_FOCUS_ZOOM_NEAR_DISTANCE = 84;
const CAMERA_FOCUS_ZOOM_FAR_DISTANCE = 220;
const CAMERA_FOCUS_ZOOM_BIAS_DESKTOP = 0.16;
const CAMERA_FOCUS_ZOOM_BIAS_MOBILE = 0.12;
const FOCUS_ARRIVAL_TRANSITION_DURATION = 1.22;
const FOCUS_ARRIVAL_ZOOM_BIAS = 0.12;
const FOCUS_ARRIVAL_CENTER_PULL = 0.18;
const GOAL_RELAY_TRANSITION_DURATION = 1.8;
const DEPARTMENT_MILESTONE_DURATION = 2.4;
const MEETING_STAGE_CUE_DURATION = 1.6;
const NAVIGATION_FOCUS_TRANSITION_DURATION = 1.35;
const ACTIVE_AREA_TRANSITION_DURATION = 1.05;
const CAMERA_MEETING_STAGE_BIAS_PIXELS_DESKTOP = 28;
const CAMERA_MEETING_STAGE_BIAS_PIXELS_MOBILE = 18;
const CAMERA_MEETING_STAGE_ZOOM_BIAS_DESKTOP = 0.08;
const CAMERA_MEETING_STAGE_ZOOM_BIAS_MOBILE = 0.06;
const MIN_ZOOM = 0.9;
const MAX_ZOOM = 3.4;
const MOBILE_MIN_ZOOM = 1.28;
const DEFAULT_ZOOM_DESKTOP = 0.98;
const DEFAULT_ZOOM_MOBILE = 1.28;
const TAP_MOVE_REACHED_DISTANCE = 2.4;
const TAP_MOVE_STALL_TIMEOUT = 0.28;
const CANVAS_TAP_THRESHOLD = 10;
const OFFICE_FLOW_CYCLE_SPEED = 0.52;
const NPC_SHARED_ZONE_VISIT_CHANCE = 0.12;
const NPC_HOTSPOT_ROUTE_CHANCE = 0.24;
const SHARED_ZONE_ACTIVE_CAPACITY = 4;
const CORRIDOR_TOP = 150;
const CORRIDOR_HEIGHT = 230;
const CORRIDOR_LANE_PADDING = 24;
// Presentation mode keeps free exploration while removing explicit objective prompts.
const SHOW_TASK_PROMPTS = false;

function shouldShowTaskPrompts(): boolean {
  return SHOW_TASK_PROMPTS;
}

function getUiNavigationTarget(): InteractionTarget | null {
  return shouldShowTaskPrompts() ? getNavigationTarget() : null;
}

function getUiNavigationFollowUpTarget(): InteractionTarget | null {
  return shouldShowTaskPrompts() ? getNavigationFollowUpTarget() : null;
}

function getUiStrategicDepartmentCandidate(): SceneDepartment | null {
  return shouldShowTaskPrompts() ? getStrategicDepartmentCandidate() : null;
}

function getUiPromptTargetDepartment(): SceneDepartment | null {
  return shouldShowTaskPrompts() ? getPromptTargetDepartment() : null;
}

function getUiPromptTargetSharedZone(): SharedZone | null {
  return shouldShowTaskPrompts() ? getPromptTargetSharedZone() : null;
}

function scaleClawLibraryPoint(x: number, y: number): Point {
  return {
    x: Math.round(x * CLAW_LIBRARY_SCALE_X),
    y: Math.round(y * CLAW_LIBRARY_SCALE_Y),
  };
}

function scaleClawLibraryRect(left: number, top: number, width: number, height: number): Rect {
  return {
    left: Math.round(left * CLAW_LIBRARY_SCALE_X),
    top: Math.round(top * CLAW_LIBRARY_SCALE_Y),
    width: Math.round(width * CLAW_LIBRARY_SCALE_X),
    height: Math.round(height * CLAW_LIBRARY_SCALE_Y),
  };
}

function scaleClawLibraryPolygon(points: Array<[number, number]>): Polygon {
  return points.map(([x, y]) => scaleClawLibraryPoint(x, y));
}

const canvas = requireElement<HTMLCanvasElement>("#scene");
const startScreen = requireElement<HTMLElement>("#start-screen");
const startBadge = requireElement<HTMLElement>("#start-badge");
const startTitle = requireElement<HTMLElement>("#start-title");
const startSubtitle = requireElement<HTMLElement>("#start-subtitle");
const startCopy = requireElement<HTMLElement>("#start-copy");
const startButton = requireElement<HTMLButtonElement>("#start-button");
const startLanguagePanel = requireElement<HTMLDivElement>("#start-language-panel");
const startLanguageLabel = requireElement<HTMLElement>("#start-language-label");
const startLanguageZhButton = requireElement<HTMLButtonElement>("#start-language-zh");
const startLanguageEnButton = requireElement<HTMLButtonElement>("#start-language-en");
const thesisList = requireElement<HTMLUListElement>("#thesis-list");
const departmentList = requireElement<HTMLDivElement>("#department-list");
const sourceList = requireElement<HTMLDivElement>("#source-list");
const prompt = requireElement<HTMLDivElement>("#prompt");
const modal = requireElement<HTMLElement>("#modal");
const modalContent = requireElement<HTMLDivElement>("#modal-content");
const closeModalButton = requireElement<HTMLButtonElement>("#close-modal");
const minimap = requireElement<HTMLCanvasElement>("#minimap");
const mapHint = requireElement<HTMLElement>(".map-hint");
const mapLegend = requireElement<HTMLDivElement>("#map-legend");
const mapFloorIndicator = requireElement<HTMLElement>("#map-floor-indicator");
const uiToggleButton = requireElement<HTMLButtonElement>("#ui-toggle");
const completedCountElement = requireElement<HTMLElement>("#completed-count");
const impactScoreElement = requireElement<HTMLElement>("#impact-score");
const currentZoneElement = requireElement<HTMLElement>("#current-zone");
const executionStageElement = requireElement<HTMLElement>("#execution-stage");
const insightCountElement = requireElement<HTMLElement>("#insight-count");
const currentTargetElement = requireElement<HTMLElement>("#current-target");
const meetingStatusElement = requireElement<HTMLElement>("#meeting-status");
const hotspotDepartmentElement = requireElement<HTMLElement>("#hotspot-department");
const meetingSeatProgressElement = requireElement<HTMLElement>("#meeting-seat-progress");
const officeTrafficElement = requireElement<HTMLElement>("#office-traffic");
const focusRoomElement = requireElement<HTMLElement>("#focus-room");
const mobileControls = requireElement<HTMLDivElement>("#mobile-controls");
const toast = requireElement<HTMLDivElement>("#toast");
const dashboardTime = requireElement<HTMLElement>("#dashboard-time");
const dashboardDate = requireElement<HTMLElement>("#dashboard-date");
const dashboardSessionLabel = requireElement<HTMLElement>("#dashboard-session-label");
const dashboardLastEvent = requireElement<HTMLElement>("#dashboard-last-event");
const textI18nElements = Array.from(document.querySelectorAll<HTMLElement>("[data-i18n-text]"));
const htmlI18nElements = Array.from(document.querySelectorAll<HTMLElement>("[data-i18n-html]"));
const ariaI18nElements = Array.from(document.querySelectorAll<HTMLElement>("[data-i18n-aria-label]"));
const showLabelI18nElements = Array.from(document.querySelectorAll<HTMLElement>("[data-i18n-show-label]"));
const hideLabelI18nElements = Array.from(document.querySelectorAll<HTMLElement>("[data-i18n-hide-label]"));

const sceneContextMaybe = canvas.getContext("2d");
if (!sceneContextMaybe) {
  throw new Error("无法初始化 2D 场景画布。");
}
const sceneContext = sceneContextMaybe;
sceneContext.imageSmoothingEnabled = false;

const minimapContextMaybe = minimap.getContext("2d");
if (!minimapContextMaybe) {
  throw new Error("无法初始化地图画布。");
}
const minimapContext = minimapContextMaybe;

const surface = document.createElement("canvas");
const surfaceContextMaybe = surface.getContext("2d");
if (!surfaceContextMaybe) {
  throw new Error("无法初始化像素渲染层。");
}
const surfaceContext = surfaceContextMaybe;
surfaceContext.imageSmoothingEnabled = false;

type PreparedPlayerSpriteSheet = {
  canvas: HTMLCanvasElement;
  frames: Record<PlayerSpriteFacing, Rect>;
};

type SceneLayerState = {
  floorImage: HTMLImageElement | null;
  objectsImage: HTMLImageElement | null;
};

const playerSpriteSheetState: { sheet: PreparedPlayerSpriteSheet | null } = {
  sheet: null,
};

const lobsterSpriteSheetState: { sheet: PreparedPlayerSpriteSheet | null } = {
  sheet: null,
};

const sceneLayerState: SceneLayerState = {
  floorImage: null,
  objectsImage: null,
};

// `hero-capybara-sheet.png` is not laid out in a strict clockwise 8-direction order.
// Keep this mapping aligned to the actual sheet so movement uses the intended frame.
const PLAYER_SPRITE_FACING_ORDER: PlayerSpriteFacing[] = [
  "down",
  "up-right",
  "left",
  "down-left",
  "down-right",
  "right",
  "up-left",
  "up",
];

const LOBSTER_SPRITE_FACING_ORDER: PlayerSpriteFacing[] = [
  "right",
  "down-right",
  "down",
  "down-left",
  "left",
  "up-left",
  "up",
  "up-right",
];

preparePlayerSpriteSheet(heroCapybaraSheetUrl);
prepareLobsterSpriteSheet(lobsterGuideSheetUrl);
prepareSceneLayer("floorImage", clawLibrarySceneFloorUrl);
prepareSceneLayer("objectsImage", clawLibrarySceneObjectsUrl);

function getLocalizedString(path: string): string {
  let current: unknown = UI_TEXT[currentUiLanguage];
  for (const segment of path.split(".")) {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return path;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === "string" ? current : path;
}

function getDefaultZoneLabel(): string {
  return getLocalizedString("metrics.defaults.currentZone");
}

function getIdleTargetLabel(): string {
  return getLocalizedString("metrics.defaults.targetIdle");
}

function getInactiveMeetingLabel(): string {
  return getLocalizedString("metrics.defaults.meetingInactive");
}

function getWaitingHotspotLabel(): string {
  return getLocalizedString("metrics.defaults.hotspotWaiting");
}

function getWaitingTrafficLabel(): string {
  return getLocalizedString("metrics.defaults.trafficWaiting");
}

function getFocusRoomFallbackLabel(): string {
  return getLocalizedString("metrics.defaults.focusRoom");
}

function getExecutionStageLabel(stage: "assist" | "orchestrate" | "collaborate" | "network"): string {
  return getLocalizedString(`executionStages.${stage}`);
}

function isEnglishUi(): boolean {
  return currentUiLanguage === "en";
}

function pickUiText<T>(zh: T, en: T): T {
  return isEnglishUi() ? en : zh;
}

const RUNTIME_TEXT_REPLACEMENTS = [
  ["当前导航", "Current Route"],
  ["推荐导航", "Recommended Route"],
  ["自由漫游", "Free Roam"],
  ["无目标", "No Target"],
  ["点击右侧列表可快速切换", "Use the list on the right to jump quickly"],
  ["部门工位", "Departments"],
  ["公共区", "Shared Zones"],
  ["目标区域", "Target Zone"],
  ["当前位置", "Current Zone"],
  ["热度 ", "Heat "],
  ["面对面对话", "Face to Face"],
  ["小龙虾导览", "Lobster Guide"],
  ["讲述重点：", "Talk Track: "],
  ["业务痛点：", "Business Need: "],
  ["产出物：", "Deliverables: "],
  ["演示结果", "Demo Result"],
  ["查看参考", "View Source"],
  ["重播场景", "Replay Scene"],
  ["开始演示", "Start Demo"],
  ["执行力分", "Execution Points"],
  ["区域说明", "Zone Notes"],
  ["点击看详情", "Tap for details"],
  ["按 E 看详情", "Press E for details"],
  ["待执行", "Pending"],
  ["已执行", "Done"],
  ["已记录", "Captured"],
  ["可记录", "Available"],
  ["未开启", "Not started"],
  ["当前目标", "Current Target"],
  ["当前节奏", "Current Flow"],
  ["下一闭环", "Next Closed Loop"],
  ["最新成果", "Latest Result"],
  ["待分配", "Unassigned"],
  ["等待新目标", "Waiting for a new target"],
  ["暂无", "None yet"],
  ["成果已回流", "Result synced back"],
  ["完成部门闭环后会出现在这里", "This appears after a department closes the loop"],
  ["切换", "Shift"],
  ["进入", "Enter"],
  ["到达", "Arrive"],
  ["热点", "Hot"],
  ["后续", "Next"],
  ["候选", "Candidates"],
  ["提问", "Ask"],
  ["回应", "Reply"],
  ["接力", "Relay"],
  ["闭环", "Closed Loop"],
  ["进度", "Progress"],
  ["洞察", "Insights"],
  ["切镜", "Focus Cut"],
  ["成果", "Result"],
  ["目标 ", "Target "],
  ["会议 ", "Meeting "],
  ["席位 ", "Seats "],
  ["节奏 ", "Flow "],
  ["聚焦 ", "Focus "],
  ["目标 空闲", "Target Idle"],
  ["会议 未开启", "Meeting Off"],
  ["热点 无", "Hot None"],
  ["目标 · ", "Target · "],
  ["冲刺 · ", "Sprint · "],
  ["下一站 · ", "Next · "],
  ["当前位置", "Current Zone"],
  ["接待区", "Reception"],
  ["餐厅", "Cafeteria"],
  ["演讲台", "Podium"],
  ["中央会议区", "Central Meeting Zone"],
  ["记忆芯片", "Insight Chip"],
  ["已记录芯片", "Captured Insight Chip"],
  ["市场部重点入口", "Marketing Priority Gate"],
  ["点击打开网站", "Tap to open site"],
  ["按 E 打开网站", "Press E to open site"],
  ["点击解散会议", "Tap to dismiss meeting"],
  ["按 E 解散会议", "Press E to dismiss meeting"],
  ["点击召集入座", "Tap to gather seats"],
  ["按 E 召集入座", "Press E to gather seats"],
  ["点击召集所有 NPC 入座", "Tap to gather all NPCs"],
  ["按 E 召集所有 NPC 入座", "Press E to gather all NPCs"],
  ["点击查看完整导览", "Tap to open full guide"],
  ["按 E 查看完整导览", "Press E to open full guide"],
  ["点击弹窗打开网站", "Tap to open site"],
  ["按 E 弹窗打开网站", "Press E to open site"],
  ["点击继续查看", "Tap to review"],
  ["按 E 继续查看", "Press E to review"],
  ["点击开始演示", "Tap to start demo"],
  ["按 E 开始演示", "Press E to start demo"],
  ["点击复看洞察", "Tap to review insight"],
  ["按 F 复看洞察", "Press F to review insight"],
  ["点击保存洞察", "Tap to save insight"],
  ["按 F 保存洞察", "Press F to save insight"],
  ["会议中", "Live"],
  ["待开始", "Ready"],
  ["部门导览", "Department Guide"],
  ["公共区导览", "Shared Guide"],
  ["重点入口", "Priority Gate"],
  ["网页终端", "Web Terminal"],
  ["可执行", "Ready"],
  ["会议召集", "Meeting Call"],
  ["会议收拢中", "Meeting gathering"],
  ["会议发言中", "Meeting live"],
  ["下一位待命", "next speaker queued"],
  ["等待下一位", "awaiting next speaker"],
  ["办公室正在串联沟通", "Office sync in motion"],
  ["走廊联动高峰", "Hallway surge"],
  ["办公室节奏平稳", "Office flow is calm"],
  ["公共区较安静", "shared zones are quiet"],
  ["最近闭环：", "Recent closed loop: "],
  ["最新闭环：", "Latest closed loop: "],
  ["下一闭环：", "Next closed loop: "],
  ["完成后将衔接 ", "Then hand off to "],
  ["导演切镜：", "Focus cut: "],
  ["状态：", "Status: "],
  ["重点外部入口", "priority external gate"],
  ["已进入", "Entered"],
  ["当前目标 · ", "Target · "],
  ["4月26日活动", "April 26 Event"],
  ["快速切换", "Quick Jump"],
  ["人流动", " moving"],
  ["未入会", "Not seated"],
  ["目标区域", "Target Zone"],
  ["公共区导览", "Shared Guide"],
  ["区域导览", "Zone Guide"],
  ["当前目标", "Current Target"],
  ["当前节奏", "Current Flow"],
  ["最新成果", "Latest Result"],
  ["冲刺 ", "Sprint "],
  ["闭环 ", "Closed Loop "],
  ["就座 ", "Seated "],
  ["在位 ", "On floor "],
  ["完成部门闭环后会出现在这里", "This will appear after a department closes the loop"],
  ["交互导航图", "Interaction Map"],
  ["推荐目标", "Recommended Target"],
  ["附近目标", "Nearby Target"],
  ["目标接管 ", "Target Handoff "],
  ["会议切镜 ", "Meeting Focus "],
  ["公共区", "Shared Zone"],
  ["Agent Office", "Agent Office"],
  ["OpenClaw Agent Office", "OpenClaw Agent Office"],
].sort((left, right) => right[0].length - left[0].length);

const RUNTIME_TEXT_REGEX_REPLACEMENTS: Array<{
  pattern: RegExp;
  replace: (...args: string[]) => string;
}> = [
  {
    pattern: /第\s*(\d+)轮/g,
    replace: (_match, round) => `R${round}`,
  },
  {
    pattern: /(\d+)\s*人流动/g,
    replace: (_match, count) => `${count} moving`,
  },
  {
    pattern: /(\d+)\/(\d+)\s*已入座/g,
    replace: (_match, seated, total) => `${seated}/${total} seated`,
  },
  {
    pattern: /(\d+)\s*人在同步/g,
    replace: (_match, count) => `${count} active`,
  },
  {
    pattern: /(\d+)\s*人在移动/g,
    replace: (_match, count) => `${count} moving`,
  },
  {
    pattern: /^前往 (.+) 工位$/,
    replace: (_match, zone) => `Heading to ${zone} desk`,
  },
  {
    pattern: /^前往 (.+)$/,
    replace: (_match, zone) => `Heading to ${zone}`,
  },
  {
    pattern: /^靠近 (.+)$/,
    replace: (_match, target) => `Near ${target}`,
  },
  {
    pattern: /^(.+) 记录洞察$/,
    replace: (_match, dept) => `${dept} logged insight`,
  },
  {
    pattern: /^(.+) 执行 (.+)$/,
    replace: (_match, dept, scenario) => `${dept} ran ${scenario}`,
  },
  {
    pattern: /^(.+) 打开 (.+)$/,
    replace: (_match, dept, label) => `${dept} opened ${label}`,
  },
  {
    pattern: /^(.+) 网页终端被拦截$/,
    replace: (_match, dept) => `${dept} web terminal was blocked`,
  },
  {
    pattern: /^第(\d+)轮 (.+)$/,
    replace: (_match, round, stage) => `Round ${round} ${stage}`,
  },
];

function translateRuntimeCopy(text: string): string {
  if (!isEnglishUi() || !text) {
    return text;
  }

  let translated = text;
  for (const replacement of RUNTIME_TEXT_REGEX_REPLACEMENTS) {
    translated = translated.replace(replacement.pattern, replacement.replace as never);
  }
  for (const [source, target] of RUNTIME_TEXT_REPLACEMENTS) {
    translated = translated.split(source).join(target);
  }
  return translated;
}

function translateRuntimeMarkup(markup: string): string {
  return translateRuntimeCopy(markup);
}

function getDepartmentUiLabel(department: SceneDepartment): string {
  return isEnglishUi() ? department.name : department.shortName;
}

function getSharedZoneUiLabel(zone: SharedZone): string {
  if (!isEnglishUi()) {
    return zone.label;
  }
  return zone.kind === "reception" ? "Reception" : "Cafeteria";
}

function cloneSource(source: SourceItem): SourceItem {
  return { ...source };
}

function requireCanvasContext(
  canvasElement: HTMLCanvasElement,
  label: string,
  imageSmoothingEnabled = false
): CanvasRenderingContext2D {
  const context = canvasElement.getContext("2d");
  if (!context) {
    throw new Error(`无法初始化 ${label} 画布。`);
  }
  context.imageSmoothingEnabled = imageSmoothingEnabled;
  return context;
}

function removeUniformBackground(context: CanvasRenderingContext2D, tolerance: number): ImageData {
  const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  const { data } = imageData;
  const background = [data[0], data[1], data[2]];
  for (let index = 0; index < data.length; index += 4) {
    const distance =
      Math.abs(data[index] - background[0]) +
      Math.abs(data[index + 1] - background[1]) +
      Math.abs(data[index + 2] - background[2]);
    if (distance <= tolerance) {
      data[index + 3] = 0;
    }
  }
  context.putImageData(imageData, 0, 0);
  return imageData;
}

function preparePlayerSpriteSheet(sourceUrl: string): void {
  const image = new Image();
  image.addEventListener("load", () => {
    playerSpriteSheetState.sheet = buildPlayerSpriteSheet(image);
  });
  image.addEventListener("error", () => {
    console.warn("主角精灵图加载失败，继续使用默认主角绘制。");
  });
  image.src = sourceUrl;
}

function prepareLobsterSpriteSheet(sourceUrl: string): void {
  const image = new Image();
  image.addEventListener("load", () => {
    lobsterSpriteSheetState.sheet = buildLobsterSpriteSheet(image);
  });
  image.addEventListener("error", () => {
    console.warn("小龙虾精灵图加载失败，继续使用默认小龙虾绘制。");
  });
  image.src = sourceUrl;
}

function prepareSceneLayer(layerKey: keyof SceneLayerState, sourceUrl: string): void {
  const image = new Image();
  image.addEventListener("load", () => {
    sceneLayerState[layerKey] = image;
  });
  image.addEventListener("error", () => {
    console.warn(`场景图层加载失败：${layerKey}`);
  });
  image.src = sourceUrl;
}

function buildPlayerSpriteSheet(image: HTMLImageElement): PreparedPlayerSpriteSheet {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = image.width;
  canvasElement.height = image.height;
  const context = requireCanvasContext(canvasElement, "主角精灵");
  context.drawImage(image, 0, 0);

  const imageData = removeUniformBackground(context, PLAYER_SPRITE_BACKGROUND_TOLERANCE);
  const { data } = imageData;

  const components: Array<{ left: number; top: number; right: number; bottom: number; pixels: number }> = [];
  const visited = new Uint8Array(canvasElement.width * canvasElement.height);
  const queue = new Int32Array(canvasElement.width * canvasElement.height);

  for (let startY = 0; startY < canvasElement.height; startY += 1) {
    for (let startX = 0; startX < canvasElement.width; startX += 1) {
      const startIndex = startY * canvasElement.width + startX;
      if (visited[startIndex] || data[startIndex * 4 + 3] === 0) {
        continue;
      }

      let head = 0;
      let tail = 0;
      queue[tail] = startIndex;
      tail += 1;
      visited[startIndex] = 1;

      let left = startX;
      let right = startX;
      let top = startY;
      let bottom = startY;
      let pixels = 0;

      while (head < tail) {
        const currentIndex = queue[head];
        head += 1;
        const y = Math.floor(currentIndex / canvasElement.width);
        const x = currentIndex - y * canvasElement.width;
        pixels += 1;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);

        const neighbors = [
          currentIndex - 1,
          currentIndex + 1,
          currentIndex - canvasElement.width,
          currentIndex + canvasElement.width,
        ];

        for (const neighborIndex of neighbors) {
          if (
            neighborIndex < 0 ||
            neighborIndex >= visited.length ||
            visited[neighborIndex] ||
            data[neighborIndex * 4 + 3] === 0
          ) {
            continue;
          }

          const neighborY = Math.floor(neighborIndex / canvasElement.width);
          const neighborX = neighborIndex - neighborY * canvasElement.width;
          if (Math.abs(neighborX - x) + Math.abs(neighborY - y) !== 1) {
            continue;
          }

          visited[neighborIndex] = 1;
          queue[tail] = neighborIndex;
          tail += 1;
        }
      }

      if (pixels >= PLAYER_SPRITE_COMPONENT_MIN_PIXELS) {
        components.push({ left, top, right, bottom, pixels });
      }
    }
  }

  const sortedComponents = components
    .sort((left, right) => right.pixels - left.pixels)
    .slice(0, PLAYER_SPRITE_FACING_ORDER.length)
    .sort((left, right) => {
      const topDelta = left.top - right.top;
      if (Math.abs(topDelta) > 80) {
        return topDelta;
      }
      return left.left - right.left;
    });

  const frames = {} as Record<PlayerSpriteFacing, Rect>;

  for (let frameIndex = 0; frameIndex < PLAYER_SPRITE_FACING_ORDER.length; frameIndex += 1) {
    const facing = PLAYER_SPRITE_FACING_ORDER[frameIndex];
    const component = sortedComponents[frameIndex];
    if (!component) {
      throw new Error("主角精灵切图失败：未找到完整的 8 个朝向。");
    }

    const left = Math.max(0, component.left - PLAYER_SPRITE_FRAME_PADDING);
    const top = Math.max(0, component.top - PLAYER_SPRITE_FRAME_PADDING);
    const right = Math.min(canvasElement.width - 1, component.right + PLAYER_SPRITE_FRAME_PADDING);
    const bottom = Math.min(canvasElement.height - 1, component.bottom + PLAYER_SPRITE_FRAME_PADDING);
    frames[facing] = {
      left,
      top,
      width: right - left + 1,
      height: bottom - top + 1,
    };
  }

  return {
    canvas: canvasElement,
    frames,
  };
}

function buildLobsterSpriteSheet(image: HTMLImageElement): PreparedPlayerSpriteSheet {
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.width;
  sourceCanvas.height = image.height;
  const sourceContext = requireCanvasContext(sourceCanvas, "小龙虾源精灵");
  sourceContext.drawImage(image, 0, 0);
  removeUniformBackground(sourceContext, LOBSTER_SPRITE_BACKGROUND_TOLERANCE);

  const canvasElement = document.createElement("canvas");
  canvasElement.width = LOBSTER_SPRITE_FRAME_SIZE * LOBSTER_SPRITE_FACING_ORDER.length;
  canvasElement.height = LOBSTER_SPRITE_FRAME_SIZE;
  const context = requireCanvasContext(canvasElement, "小龙虾精灵", true);
  const frames = {} as Record<PlayerSpriteFacing, Rect>;
  LOBSTER_SPRITE_FACING_ORDER.forEach((facing, index) => {
    const sourceLeft = index * LOBSTER_SPRITE_SOURCE_TILE_SIZE + LOBSTER_SPRITE_SOURCE_CROP_INSET_X;
    const drawLeft = index * LOBSTER_SPRITE_FRAME_SIZE;
    context.drawImage(
      sourceCanvas,
      sourceLeft,
      LOBSTER_SPRITE_SOURCE_CROP_TOP,
      LOBSTER_SPRITE_SOURCE_CROP_SIZE,
      LOBSTER_SPRITE_SOURCE_CROP_SIZE,
      drawLeft,
      0,
      LOBSTER_SPRITE_FRAME_SIZE,
      LOBSTER_SPRITE_FRAME_SIZE
    );
    frames[facing] = {
      left: drawLeft,
      top: 0,
      width: LOBSTER_SPRITE_FRAME_SIZE,
      height: LOBSTER_SPRITE_FRAME_SIZE,
    };
  });

  return {
    canvas: canvasElement,
    frames,
  };
}

function cloneScenario(scenario: Scenario, overrides: Partial<Scenario> = {}): Scenario {
  return {
    ...scenario,
    workflow: [...scenario.workflow],
    outputs: [...scenario.outputs],
    kpis: [...scenario.kpis],
    source: cloneSource(scenario.source),
    ...overrides,
  };
}

function requireBaseDepartment(id: string): Department {
  const department = baseDepartments.find((item) => item.id === id);
  if (!department) {
    throw new Error(`缺少部门配置：${id}`);
  }
  return department;
}

function resolveCorridorPoint(layout: RoomLayout): Point {
  const centerX = layout.left + layout.width / 2;
  const centerY = layout.top + layout.height / 2;

  switch (layout.approachSide) {
    case "down":
      return { x: centerX, y: CORRIDOR_TOP + CORRIDOR_LANE_PADDING };
    case "up":
      return { x: centerX, y: CORRIDOR_TOP + CORRIDOR_HEIGHT - CORRIDOR_LANE_PADDING };
    case "left":
      return { x: FLOOR_PADDING + CORRIDOR_LANE_PADDING, y: centerY };
    case "right":
      return { x: OFFICE_WIDTH - FLOOR_PADDING - CORRIDOR_LANE_PADDING, y: centerY };
  }
}

function createRoomGeometry(layout: RoomLayout): {
  roomRect: Rect;
  walkwayRect: Rect;
  frontageRect: Rect;
  entryPoint: Point;
  corridorLanePoint: Point;
  deskRect: Rect;
} {
  const roomRect: Rect = {
    left: layout.left,
    top: layout.top,
    width: layout.width,
    height: layout.height,
  };
  const corridorLanePoint = { ...(layout.corridorPoint ?? resolveCorridorPoint(layout)) };
  const doorwayLeft = roomRect.left + Math.round((roomRect.width - layout.doorWidth) / 2);
  const doorwayTop = roomRect.top + Math.round((roomRect.height - layout.doorWidth) / 2);
  const entryInset = Math.min(24, Math.max(18, Math.min(roomRect.width, roomRect.height) * 0.18));
  const deskDepth = Math.max(
    14,
    Math.round((layout.approachSide === "left" || layout.approachSide === "right" ? roomRect.width : roomRect.height) * 0.18)
  );

  let walkwayRect: Rect;
  let entryPoint: Point;
  let deskRect: Rect;
  let frontageRect: Rect;

  switch (layout.approachSide) {
    case "down":
      walkwayRect = {
        left: doorwayLeft,
        top: roomRect.top + roomRect.height,
        width: layout.doorWidth,
        height: Math.max(10, corridorLanePoint.y - (roomRect.top + roomRect.height)),
      };
      entryPoint = {
        x: roomRect.left + roomRect.width / 2,
        y: roomRect.top + roomRect.height - entryInset,
      };
      deskRect = {
        left: roomRect.left + 10,
        top: roomRect.top + 10,
        width: roomRect.width - 20,
        height: deskDepth,
      };
      frontageRect = {
        left: walkwayRect.left - 10,
        top: walkwayRect.top - 6,
        width: walkwayRect.width + 20,
        height: walkwayRect.height + 24,
      };
      break;
    case "up":
      walkwayRect = {
        left: doorwayLeft,
        top: corridorLanePoint.y,
        width: layout.doorWidth,
        height: Math.max(10, roomRect.top - corridorLanePoint.y),
      };
      entryPoint = {
        x: roomRect.left + roomRect.width / 2,
        y: roomRect.top + entryInset,
      };
      deskRect = {
        left: roomRect.left + 10,
        top: roomRect.top + roomRect.height - 10 - deskDepth,
        width: roomRect.width - 20,
        height: deskDepth,
      };
      frontageRect = {
        left: walkwayRect.left - 10,
        top: walkwayRect.top - 18,
        width: walkwayRect.width + 20,
        height: walkwayRect.height + 24,
      };
      break;
    case "left":
      walkwayRect = {
        left: corridorLanePoint.x,
        top: doorwayTop,
        width: Math.max(10, roomRect.left - corridorLanePoint.x),
        height: layout.doorWidth,
      };
      entryPoint = {
        x: roomRect.left + entryInset,
        y: roomRect.top + roomRect.height / 2,
      };
      deskRect = {
        left: roomRect.left + roomRect.width - 10 - deskDepth,
        top: roomRect.top + 10,
        width: deskDepth,
        height: roomRect.height - 20,
      };
      frontageRect = {
        left: walkwayRect.left - 18,
        top: walkwayRect.top - 10,
        width: walkwayRect.width + 24,
        height: walkwayRect.height + 20,
      };
      break;
    case "right":
      walkwayRect = {
        left: roomRect.left + roomRect.width,
        top: doorwayTop,
        width: Math.max(10, corridorLanePoint.x - (roomRect.left + roomRect.width)),
        height: layout.doorWidth,
      };
      entryPoint = {
        x: roomRect.left + roomRect.width - entryInset,
        y: roomRect.top + roomRect.height / 2,
      };
      deskRect = {
        left: roomRect.left + 10,
        top: roomRect.top + 10,
        width: deskDepth,
        height: roomRect.height - 20,
      };
      frontageRect = {
        left: walkwayRect.left - 6,
        top: walkwayRect.top - 10,
        width: walkwayRect.width + 24,
        height: walkwayRect.height + 20,
      };
      break;
    default:
      throw new Error(`不支持的入口方向：${String(layout.approachSide)}`);
  }

  return {
    roomRect,
    walkwayRect,
    frontageRect,
    entryPoint,
    corridorLanePoint,
    deskRect,
  };
}

function projectRoomAnchor(roomRect: Rect, approachSide: RoomApproachSide, depth: number, lateral: number): Point {
  switch (approachSide) {
    case "down":
      return {
        x: roomRect.left + roomRect.width * lateral,
        y: roomRect.top + roomRect.height * (1 - depth),
      };
    case "up":
      return {
        x: roomRect.left + roomRect.width * lateral,
        y: roomRect.top + roomRect.height * depth,
      };
    case "left":
      return {
        x: roomRect.left + roomRect.width * depth,
        y: roomRect.top + roomRect.height * lateral,
      };
    case "right":
      return {
        x: roomRect.left + roomRect.width * (1 - depth),
        y: roomRect.top + roomRect.height * lateral,
      };
    default:
      return rectCenter(roomRect);
  }
}

function createSceneDepartments(): SceneDepartment[] {
  const marketing = requireBaseDepartment("marketing");
  const sales = requireBaseDepartment("sales");
  const support = requireBaseDepartment("support");
  const finance = requireBaseDepartment("finance");
  const hr = requireBaseDepartment("hr");
  const production = requireBaseDepartment("production");
  const productDesign = requireBaseDepartment("product-design");
  const warehouse = requireBaseDepartment("warehouse");

  const sequence: Array<{ department: DepartmentSeed; sourceRoomId: string; sourceRoomLabel: string }> = [
    {
      department: {
        ...marketing,
        size: { width: 34, depth: 26 },
        level: 0,
        npcRoles: ["情报分析", "内容运营", "活动策划"],
      },
      sourceRoomId: "images",
      sourceRoomLabel: "Images",
    },
    {
      department: {
        ...sales,
        size: { width: 32, depth: 28 },
        level: 0,
        npcRoles: ["客户拓展", "方案顾问", "续约经理"],
      },
      sourceRoomId: "schedule",
      sourceRoomLabel: "Schedule",
    },
    {
      department: {
        ...productDesign,
        id: "development",
        name: "Development Bay",
        shortName: "开发部",
        intro: "开发办公室展示 OpenClaw 如何把需求理解、代码执行、测试与发布说明串成一条工程流水线。",
        speakerNote:
          "这里强调工程团队不再只是用 AI 查资料，而是让它承担上下文整理、代码建议、测试与发布跟进。",
        scenarios: [
          {
            id: "dev-context",
            title: "代码上下文代理",
            hook: "进入一个任务前，自动把 issue、PR、文档和相邻模块变成可执行 briefing。",
            problem: "开发者切入需求时，经常要在代码、工单、PR 和文档间来回跳转，理解成本高。",
            workflow: [
              "读取 issue、提交历史、相关模块和最近变更。",
              "整理依赖关系、风险点和需要补的测试清单。",
              "输出一份可直接开始编码的任务说明。",
            ],
            outputs: ["任务 briefing", "受影响模块图", "测试建议"],
            kpis: ["减少切任务时间", "降低改错位置的概率", "让新人更快进入上下文"],
            stat: "McKinsey 2025：software engineering 仍是生成式 AI 最具价值的高频函数之一。",
            impactScore: 18,
            source: cloneSource(marketing.scenarios[1].source),
            demoResult: "OpenClaw 已为本次功能改动整理出 6 个相关文件、2 个风险分支和一份测试待办。",
          },
          {
            id: "dev-implementation",
            title: "实现协同代理",
            hook: "把重复性的样板代码、接口拼接和日志埋点自动推进到可 review 状态。",
            problem: "很多开发时间消耗在模板代码、接口联调和重复校验上，影响交付节奏。",
            workflow: [
              "按需求和现有模式生成实现草稿与注释。",
              "自动补齐日志、监控点与边界条件处理。",
              "提交 review 前给出差异摘要和潜在回归提醒。",
            ],
            outputs: ["实现草稿", "变更摘要", "回归风险提示"],
            kpis: ["缩短编码准备时间", "提高提交一致性", "减少遗漏监控和日志"],
            stat: "Microsoft Work Trend Index 2025：越来越多团队开始把 agents 当作执行层，而不是单纯问答工具。",
            impactScore: 17,
            source: cloneSource(hr.scenarios[1].source),
            demoResult: "OpenClaw 已生成接口封装、埋点和错误处理框架，并给出 review 说明。",
          },
          {
            id: "dev-release",
            title: "测试与发布代理",
            hook: "从代码改动直接生成测试计划、发布说明和回滚提示。",
            problem: "开发和测试常在发布前临时补文档、补 checklist，导致质量与节奏都受影响。",
            workflow: [
              "根据 diff 自动归纳风险路径和覆盖缺口。",
              "生成测试用例、发布说明和回滚要点。",
              "同步通知 QA、产品和支持团队。",
            ],
            outputs: ["测试计划", "发布说明", "跨团队通知"],
            kpis: ["减少发布前沟通断层", "更早暴露测试缺口", "提升上线可追溯性"],
            stat: "McKinsey 2025：领先组织已经把 AI 从开发辅助推进到更靠近执行与交付的环节。",
            impactScore: 16,
            source: cloneSource(marketing.scenarios[1].source),
            demoResult: "OpenClaw 已输出本次版本的 12 条测试建议、发布摘要和 3 条回滚提醒。",
          },
        ],
        size: { width: 38, depth: 30 },
        level: 0,
        npcRoles: ["后端开发", "前端开发", "测试联调"],
      },
      sourceRoomId: "skills",
      sourceRoomLabel: "Skills",
    },
    {
      department: {
        ...production,
        scenarios: [
          cloneScenario(production.scenarios[0]),
          cloneScenario(production.scenarios[2]),
          cloneScenario(requireBaseDepartment("ops").scenarios[0], {
            id: "production-capacity",
            title: "产能协同代理",
            hook: "把订单变化和设备状态即时翻译成班次与物料动作。",
            demoResult: "OpenClaw 已根据本周订单波动重算产能占用，并同步建议一个班次调整方案。",
          }),
        ],
        size: { width: 36, depth: 30 },
        level: 0,
        npcRoles: ["排产主管", "线长", "工艺工程师"],
      },
      sourceRoomId: "gateway-west",
      sourceRoomLabel: "Gateway West",
    },
    {
      department: {
        ...production,
        id: "quality",
        name: "Quality Assurance",
        shortName: "品质部",
        accent: "#7dd3fc",
        intro: "品质办公室聚焦来料、制程和出货三类质量判断，让 OpenClaw 从抽查辅助走到异常闭环。",
        speakerNote: "这一间用来讲 AI 不只发现异常，而是联动复检、隔离、追责和知识沉淀。",
        scenarios: [
          cloneScenario(production.scenarios[1], {
            id: "quality-watch",
            title: "制程异常代理",
          }),
          {
            id: "quality-incoming",
            title: "来料检验代理",
            hook: "把供应商报告、抽检记录和历史异常自动串成一份放行建议。",
            problem: "品质团队要在来料环节快速判断放行、复检或退料，资料往往不在一个地方。",
            workflow: [
              "读取来料批次、抽检结果、供应商历史表现和偏差记录。",
              "生成放行 / 复检 / 退料建议，并附上依据。",
              "把异常批次同步给采购和生产。",
            ],
            outputs: ["放行建议", "异常批次清单", "供应商复盘摘要"],
            kpis: ["缩短来料判断时间", "减少批次争议", "提升跨部门追溯速度"],
            stat: "PwC 2026 Industrial Manufacturing Outlook：先进技术正在更深入进入制造现场与质量控制流程。",
            impactScore: 17,
            source: cloneSource(production.scenarios[1].source),
            demoResult: "OpenClaw 已识别出 2 个需要复检的来料批次，并附上退料证据链。",
          },
          {
            id: "quality-release",
            title: "出货放行代理",
            hook: "出货前自动核对缺陷、返工和客户要求，避免问题流到市场端。",
            problem: "出货放行常依赖人工翻检记录和客户要求，既慢又容易漏项。",
            workflow: [
              "汇总终检结果、返工记录、客户规格和特采说明。",
              "识别仍未关闭的风险点与放行条件。",
              "同步给仓库、客服和客户经理。",
            ],
            outputs: ["放行结论", "未闭环问题清单", "客户侧说明摘要"],
            kpis: ["减少带病出货", "提高出货前决策速度", "减少售后争议"],
            stat: "McKinsey 2025：AI 在 operations 里的价值来自把判断和执行联动，而不只是生成报告。",
            impactScore: 16,
            source: cloneSource(marketing.scenarios[1].source),
            demoResult: "OpenClaw 已在出货前拦截 1 个高风险批次，并自动通知仓库与客户成功团队。",
          },
        ],
        size: { width: 30, depth: 26 },
        level: 0,
        npcRoles: ["来料检验", "QA 工程师", "终检专员"],
      },
      sourceRoomId: "alarm",
      sourceRoomLabel: "Alarm",
    },
    {
      department: {
        ...warehouse,
        size: { width: 40, depth: 30 },
        level: 0,
        npcRoles: ["拣货员", "调度员", "包装专员"],
      },
      sourceRoomId: "gateway-east",
      sourceRoomLabel: "Gateway East",
    },
    {
      department: {
        ...support,
        size: { width: 34, depth: 28 },
        level: 0,
        npcRoles: ["客服坐席", "升级协调", "知识库编辑"],
      },
      sourceRoomId: "log",
      sourceRoomLabel: "Log",
    },
    {
      department: {
        ...hr,
        size: { width: 32, depth: 26 },
        level: 0,
        npcRoles: ["招聘专员", "HRBP", "培训协调"],
      },
      sourceRoomId: "document",
      sourceRoomLabel: "Document",
    },
    {
      department: {
        ...finance,
        size: { width: 32, depth: 26 },
        level: 0,
        npcRoles: ["出纳", "FP&A", "审计协调"],
      },
      sourceRoomId: "mcp",
      sourceRoomLabel: "MCP",
    },
    {
      department: {
        ...finance,
        id: "management",
        name: "Executive Office",
        shortName: "管理层",
        accent: "#f9c74f",
        intro: "最后一间是管理层办公室，用来讲 OpenClaw 如何汇总跨部门执行信号，推动经营决策和 agent 治理。",
        speakerNote: "结尾在这里收束：所有部门不是各自用 AI，而是被统一拉进一个执行系统。",
        scenarios: [
          {
            id: "exec-cockpit",
            title: "经营驾驶舱代理",
            hook: "把各部门实时动作压缩成管理层能直接判断的经营面板。",
            problem: "管理层拿到的数据常分散、滞后，难以快速看见哪里已经执行、哪里还停留在分析。",
            workflow: [
              "汇总销售、生产、仓库、客服和财务关键信号。",
              "生成跨部门例外事项和需要拍板的清单。",
              "把经营风险按紧急度排序。",
            ],
            outputs: ["经营驾驶舱", "例外事项板", "拍板清单"],
            kpis: ["缩短例会准备时间", "更快定位执行瓶颈", "提升跨部门协同透明度"],
            stat: "Microsoft Work Trend Index 2025：管理者越来越需要直接管理 agents 与人机混合执行。",
            impactScore: 18,
            source: cloneSource(hr.scenarios[1].source),
            demoResult: "OpenClaw 已将 9 个部门动作汇总成 1 个经营 cockpit，并标出 4 个待拍板事项。",
          },
          {
            id: "exec-planning",
            title: "战略节奏代理",
            hook: "把季度目标拆成跨部门的连续动作，而不是 PPT 口号。",
            problem: "战略目标落地时，往往缺少跨部门同步机制和明确的责任动作。",
            workflow: [
              "读取季度 OKR、预算与重点项目状态。",
              "拆出跨部门依赖、时间节点和负责人。",
              "自动跟踪延误项并生成提醒与调整建议。",
            ],
            outputs: ["季度行动板", "跨部门依赖图", "风险调整建议"],
            kpis: ["减少战略落地断层", "让管理层看到真实推进状态", "提高项目节奏可控性"],
            stat: "McKinsey 2025：真正的价值不在单个用例，而在跨函数规模化部署。",
            impactScore: 17,
            source: cloneSource(marketing.scenarios[1].source),
            demoResult: "OpenClaw 已把季度目标拆成 27 个跨部门动作，并标记 3 个关键依赖风险。",
          },
          {
            id: "exec-governance",
            title: "Agent 治理代理",
            hook: "当 AI 开始执行工作后，管理层需要看得见权限、风险和审计轨迹。",
            problem: "多个部门同时运行 agent 时，权限边界、审批链和审计责任会迅速复杂化。",
            workflow: [
              "汇总各 agent 的动作记录、异常和人工介入节点。",
              "输出权限、审批和回滚建议。",
              "形成对内审计和治理复盘材料。",
            ],
            outputs: ["治理日报", "权限风险清单", "审计复盘包"],
            kpis: ["保证可追溯性", "降低误操作风险", "让 agent 执行可管可审"],
            stat: "Salesforce 2025：随着 agents 进入核心流程，治理与安全预算会同步提升。",
            impactScore: 16,
            source: cloneSource(requireBaseDepartment("it").scenarios[0].source),
            demoResult: "OpenClaw 已生成本周 agent 执行治理摘要，并标出 2 个需要收紧权限的流程。",
          },
        ],
        size: { width: 42, depth: 32 },
        level: 0,
        npcRoles: ["总经理", "运营助理", "战略分析"],
      },
      sourceRoomId: "agent",
      sourceRoomLabel: "Agent",
    },
  ];

  return sequence.map(({ department, sourceRoomId, sourceRoomLabel }, index) => {
    const layout = departmentRoomLayoutById.get(department.id);
    if (!layout) {
      throw new Error(`缺少部门房间布局：${department.id}`);
    }
    const geometry = createRoomGeometry(layout);
    const { roomRect, deskRect } = geometry;
    const position = {
      x: layout.left + layout.width / 2,
      z: layout.top + layout.height / 2,
    };

    const sceneDepartment = {
      ...department,
      sourceRoomId,
      sourceRoomLabel,
      position,
      roomRect: geometry.roomRect,
      walkwayRect: geometry.walkwayRect,
      frontageRect: geometry.frontageRect,
      deskRect: geometry.deskRect,
      entryPoint: geometry.entryPoint,
      corridorLanePoint: geometry.corridorLanePoint,
      workSpots: [] as Point[],
      terminals: [] as OfficeTerminal[],
      insight: null as unknown as InsightNode,
      decorSeed: index,
      approachSide: layout.approachSide,
    } satisfies Omit<SceneDepartment, "terminals" | "insight"> & {
      terminals: OfficeTerminal[];
      insight: InsightNode;
    };

    sceneDepartment.workSpots = [
      {
        x: roomRect.left + 24,
        y: layout.approachSide === "down" ? roomRect.top + roomRect.height - 30 : roomRect.top + 30,
      },
      {
        x: roomRect.left + roomRect.width / 2,
        y: roomRect.top + roomRect.height / 2 + (layout.approachSide === "down" ? 10 : -10),
      },
      {
        x: roomRect.left + roomRect.width - 24,
        y: layout.approachSide === "down" ? roomRect.top + roomRect.height - 30 : roomRect.top + 30,
      },
    ];

    sceneDepartment.terminals = department.scenarios.map((scenario, scenarioIndex) => ({
      kind: "scenario",
      id: scenario.id,
      department: sceneDepartment,
      scenario,
      position: {
        x: roomRect.left + ((scenarioIndex + 1) * roomRect.width) / (department.scenarios.length + 1),
        y: layout.approachSide === "down" ? deskRect.top + deskRect.height + 12 : deskRect.top - 10,
      },
      pulseOffset: index * 0.8 + scenarioIndex * 0.65,
    }));

    if (department.id === "marketing") {
      sceneDepartment.terminals.push({
        kind: "external",
        id: "marketing-ledservice-terminal",
        department: sceneDepartment,
        label: "LED Service 网站",
        url: "https://www.ledservice.com.au/zhglxt/cms/index.html",
        position: {
          x: roomRect.left + roomRect.width - 18,
          y: layout.approachSide === "down" ? roomRect.top + roomRect.height - 26 : roomRect.top + 26,
        },
        pulseOffset: index * 0.8 + department.scenarios.length * 0.65 + 0.35,
      });
    }

    sceneDepartment.insight = {
      id: `${department.id}-insight`,
      department: sceneDepartment,
      fact: department.speakerNote,
      position: {
        x: roomRect.left + roomRect.width - 16,
        y: layout.approachSide === "down" ? roomRect.top + 24 : roomRect.top + roomRect.height - 24,
      },
      pulseOffset: index * 1.13 + 0.4,
    };

    return sceneDepartment;
  });
}

function createSharedZones(): SharedZone[] {
  const zoneSpecs: Array<{
    id: string;
    label: string;
    sourceRoomId: string;
    sourceRoomLabel: string;
    accent: string;
    kind: SharedZone["kind"];
  }> = [
    {
      id: "reception",
      label: "前台接待",
      sourceRoomId: "front-desk",
      sourceRoomLabel: "Front Desk",
      accent: "#9ac6ff",
      kind: "reception",
    },
    {
      id: "cafeteria",
      label: "员工餐厅",
      sourceRoomId: "break-room",
      sourceRoomLabel: "Break Room",
      accent: "#f6d27a",
      kind: "cafeteria",
    },
  ];

  return zoneSpecs.map((zoneSpec) => {
    const layout = sharedZoneLayoutById.get(zoneSpec.id);
    if (!layout) {
      throw new Error(`缺少公共区布局：${zoneSpec.id}`);
    }
    const geometry = createRoomGeometry(layout);
    return {
      id: zoneSpec.id,
      label: zoneSpec.label,
      sourceRoomId: zoneSpec.sourceRoomId,
      sourceRoomLabel: zoneSpec.sourceRoomLabel,
      accent: zoneSpec.accent,
      kind: zoneSpec.kind,
      roomRect: geometry.roomRect,
      walkwayRect: geometry.walkwayRect,
      frontageRect: geometry.frontageRect,
      approachSide: layout.approachSide,
    };
  });
}

const departments = createSceneDepartments();
const sharedZones = createSharedZones();
const terminals = departments.flatMap((department) => department.terminals);
const insightNodes = departments.map((department) => department.insight);
const allScenarios = departments.flatMap((department) => department.scenarios);

const officeRect: Rect = {
  left: 0,
  top: 0,
  width: OFFICE_WIDTH,
  height: OFFICE_HEIGHT,
};

const corridorRect: Rect = {
  left: FLOOR_PADDING,
  top: CORRIDOR_TOP,
  width: OFFICE_WIDTH - FLOOR_PADDING * 2,
  height: CORRIDOR_HEIGHT,
};

function createConcourseRects(items: Array<{ roomRect: Rect; walkwayRect: Rect; approachSide: RoomApproachSide }>): Rect[] {
  const grouped = [
    items.filter((department) => department.approachSide === "down"),
    items.filter((department) => department.approachSide === "up"),
  ];

  const createConcourseRect = (
    group: Array<{ roomRect: Rect; walkwayRect: Rect }>,
    corridorAnchorY: number
  ): Rect => {
    const left = Math.min(...group.map((department) => department.roomRect.left));
    const right = Math.max(...group.map((department) => department.roomRect.left + department.roomRect.width));
    const top = Math.min(corridorAnchorY, ...group.map((department) => department.walkwayRect.top)) - 8;
    const bottom = Math.max(
      corridorAnchorY,
      ...group.map((department) => department.walkwayRect.top + department.walkwayRect.height)
    ) + 8;

    return {
      left,
      top,
      width: right - left,
      height: bottom - top,
    };
  };

  return grouped
    .filter((group) => group.length > 0)
    .map((group) =>
      createConcourseRect(
        group,
        group[0]?.approachSide === "down"
          ? corridorRect.top + 24
          : corridorRect.top + corridorRect.height - 24
      )
    );
}

const corridorCenterX = Math.round(corridorRect.left + corridorRect.width / 2);
const corridorCenterY = Math.round(corridorRect.top + corridorRect.height / 2);
const departmentConcourseRects = createConcourseRects([...departments, ...sharedZones]);
const resourceHubRect: Rect = {
  left: corridorRect.left + 124,
  top: corridorCenterY - 38,
  width: 98,
  height: 82,
};
const centralMeetingTableRect: Rect = {
  left: corridorCenterX - 132,
  top: corridorCenterY - 24,
  width: 264,
  height: 48,
};
const centralMeetingPodiumRect: Rect = {
  left: centralMeetingTableRect.left - 28,
  top: corridorCenterY - 13,
  width: 16,
  height: 26,
};
const centralLoungeRect: Rect = {
  left: centralMeetingPodiumRect.left - 18,
  top: corridorCenterY - 42,
  width: centralMeetingTableRect.width + 74,
  height: 104,
};
const refreshHubRect: Rect = {
  left: corridorRect.left + corridorRect.width - 194,
  top: corridorCenterY - 40,
  width: 102,
  height: 86,
};
const corridorTickerRect: Rect = {
  left: corridorCenterX - 92,
  top: WALL_HEIGHT + 24,
  width: 184,
  height: 16,
};
const receptionZone = sharedZones.find((zone) => zone.id === "reception");
const cafeteriaZone = sharedZones.find((zone) => zone.id === "cafeteria");

if (!receptionZone || !cafeteriaZone) {
  throw new Error("公共区域布局初始化失败。");
}

const centralMeetingPodium: MeetingPodium = {
  rect: centralMeetingPodiumRect,
  interactionPoint: {
    x: centralMeetingPodiumRect.left - 12,
    y: centralMeetingPodiumRect.top + centralMeetingPodiumRect.height / 2,
  },
  label: "中央会议区演讲台",
};

const officeProps: OfficeProp[] = [
  { kind: "whiteboard", rect: { left: corridorCenterX - 88, top: WALL_HEIGHT + 10, width: 176, height: 12 } },
  { kind: "plant", rect: { left: resourceHubRect.left + 8, top: resourceHubRect.top + 12, width: 16, height: 18 } },
  { kind: "plant", rect: { left: resourceHubRect.left + resourceHubRect.width - 24, top: resourceHubRect.top + 12, width: 16, height: 18 } },
  { kind: "bookshelf", rect: { left: corridorRect.left + 134, top: corridorCenterY - 24, width: 24, height: 42 } },
  { kind: "plant", rect: { left: corridorRect.left + 166, top: corridorCenterY - 12, width: 14, height: 18 } },
  { kind: "printer", rect: { left: corridorRect.left + 188, top: corridorCenterY + 24, width: 18, height: 16 } },
  { kind: "meeting", rect: centralMeetingTableRect },
  { kind: "podium", rect: centralMeetingPodium.rect },
  { kind: "plant", rect: { left: refreshHubRect.left + 8, top: refreshHubRect.top + refreshHubRect.height - 24, width: 16, height: 18 } },
  { kind: "cabinet", rect: { left: corridorRect.left + corridorRect.width - 176, top: corridorCenterY - 24, width: 24, height: 38 } },
  { kind: "plant", rect: { left: refreshHubRect.left + refreshHubRect.width - 24, top: refreshHubRect.top + 12, width: 16, height: 18 } },
  { kind: "coffee", rect: { left: corridorRect.left + corridorRect.width - 142, top: corridorCenterY + 22, width: 18, height: 18 } },
  { kind: "microwave", rect: { left: corridorRect.left + corridorRect.width - 170, top: corridorCenterY + 23, width: 22, height: 15 } },
  { kind: "cooler", rect: { left: corridorRect.left + corridorRect.width - 112, top: corridorCenterY + 12, width: 14, height: 24 } },
  { kind: "plant", rect: { left: corridorRect.left + corridorRect.width - 150, top: corridorCenterY - 22, width: 16, height: 18 } },
  {
    kind: "receptionDesk",
    rect: {
      left: receptionZone.roomRect.left + 12,
      top: receptionZone.roomRect.top + 18,
      width: receptionZone.roomRect.width - 24,
      height: 18,
    },
  },
  {
    kind: "sofa",
    rect: {
      left: receptionZone.roomRect.left + 14,
      top: receptionZone.roomRect.top + 58,
      width: 34,
      height: 16,
    },
  },
  {
    kind: "bookshelf",
    rect: {
      left: receptionZone.roomRect.left + receptionZone.roomRect.width - 28,
      top: receptionZone.roomRect.top + 52,
      width: 16,
      height: 30,
    },
  },
  {
    kind: "plant",
    rect: {
      left: receptionZone.roomRect.left + receptionZone.roomRect.width - 26,
      top: receptionZone.roomRect.top + 18,
      width: 14,
      height: 14,
    },
  },
  {
    kind: "servingCounter",
    rect: {
      left: cafeteriaZone.roomRect.left + 14,
      top: cafeteriaZone.roomRect.top + 22,
      width: 28,
      height: cafeteriaZone.roomRect.height - 44,
    },
  },
  {
    kind: "coffee",
    rect: {
      left: cafeteriaZone.roomRect.left + 50,
      top: cafeteriaZone.roomRect.top + 28,
      width: 16,
      height: 18,
    },
  },
  {
    kind: "microwave",
    rect: {
      left: cafeteriaZone.roomRect.left + 72,
      top: cafeteriaZone.roomRect.top + 30,
      width: 22,
      height: 15,
    },
  },
  {
    kind: "diningTable",
    rect: {
      left: cafeteriaZone.roomRect.left + 62,
      top: cafeteriaZone.roomRect.top + 48,
      width: 34,
      height: 34,
    },
  },
  {
    kind: "diningTable",
    rect: {
      left: cafeteriaZone.roomRect.left + 114,
      top: cafeteriaZone.roomRect.top + 48,
      width: 34,
      height: 34,
    },
  },
  {
    kind: "diningTable",
    rect: {
      left: cafeteriaZone.roomRect.left + 62,
      top: cafeteriaZone.roomRect.top + 100,
      width: 34,
      height: 34,
    },
  },
  {
    kind: "diningTable",
    rect: {
      left: cafeteriaZone.roomRect.left + 114,
      top: cafeteriaZone.roomRect.top + 100,
      width: 34,
      height: 34,
    },
  },
  {
    kind: "coffee",
    rect: {
      left: cafeteriaZone.roomRect.left + cafeteriaZone.roomRect.width - 28,
      top: cafeteriaZone.roomRect.top + 24,
      width: 14,
      height: 14,
    },
  },
  {
    kind: "plant",
    rect: {
      left: cafeteriaZone.roomRect.left + cafeteriaZone.roomRect.width - 28,
      top: cafeteriaZone.roomRect.top + cafeteriaZone.roomRect.height - 34,
      width: 16,
      height: 16,
    },
  },
];

function getOfficePropCollisionRect(item: OfficeProp): Rect {
  switch (item.kind) {
    case "meeting":
      return {
        left: item.rect.left + 18,
        top: item.rect.top + 10,
        width: item.rect.width - 36,
        height: item.rect.height - 18,
      };
    case "podium":
      return {
        left: item.rect.left + 2,
        top: item.rect.top + 4,
        width: Math.max(8, item.rect.width - 4),
        height: Math.max(10, item.rect.height - 6),
      };
    case "sofa":
      return {
        left: item.rect.left + 8,
        top: item.rect.top + 6,
        width: item.rect.width - 16,
        height: item.rect.height - 8,
      };
    case "plant":
      return {
        left: item.rect.left + 2,
        top: item.rect.top + 4,
        width: Math.max(6, item.rect.width - 4),
        height: Math.max(6, item.rect.height - 6),
      };
    case "coffee":
    case "microwave":
    case "printer":
      return {
        left: item.rect.left + 3,
        top: item.rect.top + 3,
        width: Math.max(6, item.rect.width - 6),
        height: Math.max(6, item.rect.height - 6),
      };
    case "cooler":
      return {
        left: item.rect.left + 2,
        top: item.rect.top + 4,
        width: item.rect.width - 4,
        height: item.rect.height - 8,
      };
    default:
      return item.rect;
  }
}

const walkableRects = [
  corridorRect,
  ...departmentConcourseRects,
  ...sharedZones.flatMap((zone) => [zone.roomRect, zone.walkwayRect]),
  ...departments.flatMap((department) => [department.roomRect, department.walkwayRect]),
];

const obstacleRects = [
  ...departments.map((department) => department.deskRect),
  ...officeProps.map((item) => getOfficePropCollisionRect(item)),
];

function canStandAt(x: number, y: number): boolean {
  const sampleOffsets = [
    { x: 0, y: 0 },
    { x: PLAYER_RADIUS, y: 0 },
    { x: -PLAYER_RADIUS, y: 0 },
    { x: 0, y: PLAYER_RADIUS },
    { x: 0, y: -PLAYER_RADIUS },
  ];

  return sampleOffsets.every((offset) => {
    const point = { x: x + offset.x, y: y + offset.y };
    return (
      walkableRects.some((rect) => pointInRect(point, rect)) &&
      !obstacleRects.some((rect) => pointInRect(point, rect))
    );
  });
}

function getSharedZoneGuidePreview(zone: SharedZone): string {
  switch (zone.kind) {
    case "reception":
      return pickUiText("欢迎进入办公室导览", "Welcome to the office walkthrough");
    case "cafeteria":
      return pickUiText("员工餐厅与交流补能区", "Cafeteria and recharge exchange zone");
    default:
      return pickUiText("区域导览", "Zone Guide");
  }
}

function resolveAreaGuidePosition(roomRect: Rect, approachSide: RoomApproachSide, seed: number): Point {
  const horizontalInset = Math.min(22, Math.max(14, roomRect.width * 0.18));
  const topInset = approachSide === "up" ? Math.min(42, Math.max(26, roomRect.height * 0.34)) : 18;
  const bottomInset = approachSide === "down" ? Math.min(42, Math.max(26, roomRect.height * 0.34)) : 18;
  const minX = roomRect.left + horizontalInset;
  const maxX = roomRect.left + roomRect.width - horizontalInset;
  const minY = roomRect.top + topInset;
  const maxY = roomRect.top + roomRect.height - bottomInset;

  for (let attempt = 0; attempt < 28; attempt += 1) {
    const point = {
      x: lerp(minX, maxX, hashUnit(seed * 13 + attempt * 17 + 1)),
      y: lerp(minY, maxY, hashUnit(seed * 29 + attempt * 11 + 3)),
    };
    if (canStandAt(point.x, point.y)) {
      return point;
    }
  }

  for (let y = minY; y <= maxY; y += 8) {
    for (let x = minX; x <= maxX; x += 8) {
      if (canStandAt(x, y)) {
        return { x, y };
      }
    }
  }

  return rectCenter(roomRect);
}

function pickRandomSpriteFacing(seed: number): PlayerSpriteFacing {
  const facingIndex = Math.floor(hashUnit(seed * 19 + 7) * LOBSTER_SPRITE_FACING_ORDER.length);
  return LOBSTER_SPRITE_FACING_ORDER[facingIndex] ?? "down";
}

function getNpcPlacementBounds(department: SceneDepartment): { minX: number; maxX: number; minY: number; maxY: number } {
  const { roomRect, approachSide } = department;
  const horizontalInset = Math.min(22, Math.max(14, roomRect.width * 0.18));
  const topInset = approachSide === "up" ? Math.min(42, Math.max(26, roomRect.height * 0.34)) : 18;
  const bottomInset = approachSide === "down" ? Math.min(42, Math.max(26, roomRect.height * 0.34)) : 18;

  return {
    minX: roomRect.left + horizontalInset,
    maxX: roomRect.left + roomRect.width - horizontalInset,
    minY: roomRect.top + topInset,
    maxY: roomRect.top + roomRect.height - bottomInset,
  };
}

function canUseNpcHomePoint(department: SceneDepartment, point: Point): boolean {
  if (!canStandAt(point.x, point.y)) {
    return false;
  }

  const reservedPoints = [...department.terminals.map((terminal) => terminal.position), department.insight.position];
  return reservedPoints.every(
    (reservedPoint) =>
      distanceSquared(point, reservedPoint) >= NPC_INITIAL_INTERACTION_PADDING * NPC_INITIAL_INTERACTION_PADDING
  );
}

function resolveNpcHomePositions(department: SceneDepartment, count: number): Point[] {
  const bounds = getNpcPlacementBounds(department);
  const homes: Point[] = [];
  const minSeparationSquared = NPC_INITIAL_MIN_SEPARATION * NPC_INITIAL_MIN_SEPARATION;

  while (homes.length < count) {
    let bestCandidate: Point | null = null;
    let bestDistance = -1;

    for (let attempt = 0; attempt < NPC_INITIAL_POSITION_ATTEMPTS; attempt += 1) {
      const candidate = {
        x: randomBetween(bounds.minX, bounds.maxX),
        y: randomBetween(bounds.minY, bounds.maxY),
      };

      if (!canUseNpcHomePoint(department, candidate)) {
        continue;
      }

      if (homes.length === 0) {
        bestCandidate = candidate;
        break;
      }

      const nearestDistance = Math.min(...homes.map((home) => distanceSquared(home, candidate)));
      if (nearestDistance > bestDistance) {
        bestDistance = nearestDistance;
        bestCandidate = candidate;
      }

      if (nearestDistance >= minSeparationSquared) {
        break;
      }
    }

    if (!bestCandidate) {
      const fallbackCandidates = [
        ...department.workSpots,
        rectCenter(department.roomRect),
      ].filter((candidate) => canUseNpcHomePoint(department, candidate));

      bestCandidate = fallbackCandidates.find(
        (candidate) =>
          homes.every((home) => distanceSquared(home, candidate) >= minSeparationSquared)
      ) ?? fallbackCandidates[0] ?? {
        x: randomBetween(bounds.minX, bounds.maxX),
        y: randomBetween(bounds.minY, bounds.maxY),
      };
    }

    homes.push(bestCandidate);
  }

  return homes;
}

function createAreaGuides(): AreaGuide[] {
  const departmentGuides = departments.map((department, index) => ({
    id: `guide-${department.id}`,
    label: `${department.shortName}小龙虾`,
    accent: department.accent,
    position: resolveAreaGuidePosition(department.roomRect, department.approachSide, index + 1),
    preview: department.scenarios[0]?.title ?? `${department.shortName}区域导览`,
    target: { type: "department", department } satisfies AreaGuideTarget,
    facing: pickRandomSpriteFacing(index + 1),
  }));

  const sharedZoneGuides = sharedZones.map((zone, index) => ({
    id: `guide-${zone.id}`,
    label: `${zone.label}小龙虾`,
    accent: zone.accent,
    position: resolveAreaGuidePosition(zone.roomRect, zone.approachSide, 101 + index),
    preview: getSharedZoneGuidePreview(zone),
    target: { type: "shared-zone", zone } satisfies AreaGuideTarget,
    facing: pickRandomSpriteFacing(101 + index),
  }));

  return [...sharedZoneGuides, ...departmentGuides];
}

const areaGuides = createAreaGuides();

type LocalizedSceneScenario = Pick<
  Scenario,
  "id" | "title" | "hook" | "problem" | "workflow" | "outputs" | "kpis" | "stat" | "demoResult" | "impactScore" | "source"
>;

type LocalizedSceneDepartmentContent = {
  name: string;
  shortName: string;
  intro: string;
  speakerNote: string;
  npcRoles: string[];
  scenarios: LocalizedSceneScenario[];
};

function syncDataCatalogForCurrentLanguage(): void {
  const catalog = dataCatalogByLanguage[currentUiLanguage];
  baseDepartments = catalog.departments;
  currentThesisPoints = catalog.thesisPoints;
  currentUniqueSources = catalog.uniqueSources;
}

function getLocalizedNpcRoles(departmentId: string): string[] {
  switch (departmentId) {
    case "marketing":
      return pickUiText(["情报分析", "内容运营", "活动策划"], ["Intel Analyst", "Content Ops", "Campaign Planner"]);
    case "sales":
      return pickUiText(["客户拓展", "方案顾问", "续约经理"], ["Account Exec", "Solution Advisor", "Renewal Lead"]);
    case "development":
      return pickUiText(["后端开发", "前端开发", "测试联调"], ["Backend Dev", "Frontend Dev", "QA Sync"]);
    case "production":
      return pickUiText(["排产主管", "线长", "工艺工程师"], ["Scheduling Lead", "Line Lead", "Process Engineer"]);
    case "quality":
      return pickUiText(["来料检验", "QA 工程师", "终检专员"], ["Incoming QA", "QA Engineer", "Final Inspector"]);
    case "warehouse":
      return pickUiText(["拣货员", "调度员", "包装专员"], ["Picker", "Dispatcher", "Packing Specialist"]);
    case "support":
      return pickUiText(["客服坐席", "升级协调", "知识库编辑"], ["Support Agent", "Escalation Lead", "KB Editor"]);
    case "hr":
      return pickUiText(["招聘专员", "HRBP", "培训协调"], ["Recruiter", "HRBP", "Training Coordinator"]);
    case "finance":
      return pickUiText(["出纳", "FP&A", "审计协调"], ["Treasury", "FP&A", "Audit Coordinator"]);
    case "management":
      return pickUiText(["总经理", "运营助理", "战略分析"], ["GM", "Ops Assistant", "Strategy Analyst"]);
    default:
      return [];
  }
}

function getSharedZoneLabelByKind(kind: SharedZone["kind"]): string {
  return kind === "reception"
    ? pickUiText("前台接待", "Reception")
    : pickUiText("员工餐厅", "Cafeteria");
}

function getAreaGuideLabel(target: AreaGuideTarget): string {
  if (target.type === "department") {
    return pickUiText(`${target.department.shortName}小龙虾`, `${getDepartmentUiLabel(target.department)} Lobster`);
  }
  return pickUiText(`${target.zone.label}小龙虾`, `${getSharedZoneUiLabel(target.zone)} Lobster`);
}

function getAreaGuidePreview(target: AreaGuideTarget): string {
  if (target.type === "department") {
    return target.department.scenarios[0]?.title ?? pickUiText(`${target.department.shortName}区域导览`, `${getDepartmentUiLabel(target.department)} Guide`);
  }
  return getSharedZoneGuidePreview(target.zone);
}

function buildProductionCapacityScenario(): LocalizedSceneScenario {
  const capacitySource = cloneScenario(requireBaseDepartment("ops").scenarios[0], {
    id: "production-capacity",
    title: pickUiText("产能协同代理", "Capacity Coordination Agent"),
    hook: pickUiText(
      "把订单变化和设备状态即时翻译成班次与物料动作。",
      "Turn order shifts and equipment status into staffing and material actions in real time."
    ),
    demoResult: pickUiText(
      "OpenClaw 已根据本周订单波动重算产能占用，并同步建议一个班次调整方案。",
      "OpenClaw recalculated this week's capacity load from order swings and proposed one shift adjustment plan."
    ),
  });
  return capacitySource;
}

function getCustomDepartmentLocalization(departmentId: string): LocalizedSceneDepartmentContent | null {
  switch (departmentId) {
    case "development":
      return {
        name: "Development Bay",
        shortName: pickUiText("开发部", "Development"),
        intro: pickUiText(
          "开发办公室展示 OpenClaw 如何把需求理解、代码执行、测试与发布说明串成一条工程流水线。",
          "The development bay shows how OpenClaw can connect requirement reading, implementation, testing, and release notes into one engineering workflow."
        ),
        speakerNote: pickUiText(
          "这里强调工程团队不再只是用 AI 查资料，而是让它承担上下文整理、代码建议、测试与发布跟进。",
          "The point here is that engineering teams are not only querying AI. They let it organize context, propose code, plan tests, and support release follow-through."
        ),
        npcRoles: getLocalizedNpcRoles("development"),
        scenarios: [
          {
            id: "dev-context",
            title: pickUiText("代码上下文代理", "Code Context Agent"),
            hook: pickUiText(
              "进入一个任务前，自动把 issue、PR、文档和相邻模块变成可执行 briefing。",
              "Before work starts, turn the issue, PRs, docs, and adjacent modules into an executable briefing."
            ),
            problem: pickUiText(
              "开发者切入需求时，经常要在代码、工单、PR 和文档间来回跳转，理解成本高。",
              "When engineers step into a task, they often bounce between code, tickets, PRs, and docs, which makes context loading expensive."
            ),
            workflow: pickUiText(
              [
                "读取 issue、提交历史、相关模块和最近变更。",
                "整理依赖关系、风险点和需要补的测试清单。",
                "输出一份可直接开始编码的任务说明。",
              ],
              [
                "Read the issue, commit history, related modules, and recent changes.",
                "Summarize dependencies, risk points, and the tests that still need to be added.",
                "Produce a task brief that an engineer can code against immediately.",
              ]
            ),
            outputs: pickUiText(["任务 briefing", "受影响模块图", "测试建议"], ["Task brief", "Impacted module map", "Test suggestions"]),
            kpis: pickUiText(
              ["减少切任务时间", "降低改错位置的概率", "让新人更快进入上下文"],
              ["Reduce task-switch overhead", "Lower the risk of editing the wrong place", "Help new engineers enter context faster"]
            ),
            stat: pickUiText(
              "McKinsey 2025：software engineering 仍是生成式 AI 最具价值的高频函数之一。",
              "McKinsey 2025: software engineering remains one of the highest-value recurring functions for generative AI."
            ),
            impactScore: 18,
            source: cloneSource(requireBaseDepartment("marketing").scenarios[1].source),
            demoResult: pickUiText(
              "OpenClaw 已为本次功能改动整理出 6 个相关文件、2 个风险分支和一份测试待办。",
              "OpenClaw mapped 6 related files, 2 risk branches, and one testing backlog for this feature change."
            ),
          },
          {
            id: "dev-implementation",
            title: pickUiText("实现协同代理", "Implementation Copilot Agent"),
            hook: pickUiText(
              "把重复性的样板代码、接口拼接和日志埋点自动推进到可 review 状态。",
              "Push repetitive boilerplate, API wiring, and telemetry setup forward to a reviewable draft automatically."
            ),
            problem: pickUiText(
              "很多开发时间消耗在模板代码、接口联调和重复校验上，影响交付节奏。",
              "A lot of engineering time is consumed by template code, API plumbing, and repetitive validation, which slows delivery."
            ),
            workflow: pickUiText(
              [
                "按需求和现有模式生成实现草稿与注释。",
                "自动补齐日志、监控点与边界条件处理。",
                "提交 review 前给出差异摘要和潜在回归提醒。",
              ],
              [
                "Generate an implementation draft and annotations based on the request and existing patterns.",
                "Fill in logging, monitoring points, and edge-case handling automatically.",
                "Produce a diff summary and regression warnings before review.",
              ]
            ),
            outputs: pickUiText(["实现草稿", "变更摘要", "回归风险提示"], ["Implementation draft", "Change summary", "Regression risk notes"]),
            kpis: pickUiText(
              ["缩短编码准备时间", "提高提交一致性", "减少遗漏监控和日志"],
              ["Shorten coding setup time", "Increase commit consistency", "Reduce missed logs and monitoring"]
            ),
            stat: pickUiText(
              "Microsoft Work Trend Index 2025：越来越多团队开始把 agents 当作执行层，而不是单纯问答工具。",
              "Microsoft Work Trend Index 2025: more teams are treating agents as an execution layer rather than simple Q&A tools."
            ),
            impactScore: 17,
            source: cloneSource(requireBaseDepartment("hr").scenarios[1].source),
            demoResult: pickUiText(
              "OpenClaw 已生成接口封装、埋点和错误处理框架，并给出 review 说明。",
              "OpenClaw generated the API wrapper, telemetry scaffolding, and error-handling frame together with review notes."
            ),
          },
          {
            id: "dev-release",
            title: pickUiText("测试与发布代理", "Testing and Release Agent"),
            hook: pickUiText(
              "从代码改动直接生成测试计划、发布说明和回滚提示。",
              "Generate a test plan, release notes, and rollback guidance directly from the code diff."
            ),
            problem: pickUiText(
              "开发和测试常在发布前临时补文档、补 checklist，导致质量与节奏都受影响。",
              "Engineering and QA often patch in documentation and checklists right before release, which hurts both quality and pace."
            ),
            workflow: pickUiText(
              [
                "根据 diff 自动归纳风险路径和覆盖缺口。",
                "生成测试用例、发布说明和回滚要点。",
                "同步通知 QA、产品和支持团队。",
              ],
              [
                "Summarize risk paths and coverage gaps directly from the diff.",
                "Generate test cases, release notes, and rollback highlights.",
                "Notify QA, product, and support teams automatically.",
              ]
            ),
            outputs: pickUiText(["测试计划", "发布说明", "跨团队通知"], ["Test plan", "Release notes", "Cross-team notice"]),
            kpis: pickUiText(
              ["减少发布前沟通断层", "更早暴露测试缺口", "提升上线可追溯性"],
              ["Reduce release handoff gaps", "Expose test gaps earlier", "Improve production traceability"]
            ),
            stat: pickUiText(
              "McKinsey 2025：领先组织已经把 AI 从开发辅助推进到更靠近执行与交付的环节。",
              "McKinsey 2025: leading organizations are already moving AI from coding assistance toward execution and delivery."
            ),
            impactScore: 16,
            source: cloneSource(requireBaseDepartment("marketing").scenarios[1].source),
            demoResult: pickUiText(
              "OpenClaw 已输出本次版本的 12 条测试建议、发布摘要和 3 条回滚提醒。",
              "OpenClaw produced 12 testing recommendations, a release summary, and 3 rollback reminders for this release."
            ),
          },
        ],
      };
    case "quality": {
      const processScenario = cloneScenario(requireBaseDepartment("production").scenarios[1], {
        id: "quality-watch",
        title: pickUiText("制程异常代理", "Process Exception Agent"),
      });
      return {
        name: "Quality Assurance",
        shortName: pickUiText("品质部", "Quality"),
        intro: pickUiText(
          "品质办公室聚焦来料、制程和出货三类质量判断，让 OpenClaw 从抽查辅助走到异常闭环。",
          "The quality office focuses on incoming checks, in-process control, and shipping release so OpenClaw moves from spot-check assistance to exception closed-loop execution."
        ),
        speakerNote: pickUiText(
          "这一间用来讲 AI 不只发现异常，而是联动复检、隔离、追责和知识沉淀。",
          "This room shows that AI should not only spot exceptions. It should trigger reinspection, isolation, accountability, and knowledge capture."
        ),
        npcRoles: getLocalizedNpcRoles("quality"),
        scenarios: [
          processScenario,
          {
            id: "quality-incoming",
            title: pickUiText("来料检验代理", "Incoming Inspection Agent"),
            hook: pickUiText(
              "把供应商报告、抽检记录和历史异常自动串成一份放行建议。",
              "Automatically combine supplier reports, sampling records, and historical exceptions into one release recommendation."
            ),
            problem: pickUiText(
              "品质团队要在来料环节快速判断放行、复检或退料，资料往往不在一个地方。",
              "Quality teams must quickly decide whether to release, reinspect, or reject incoming lots, but the supporting material is usually scattered."
            ),
            workflow: pickUiText(
              [
                "读取来料批次、抽检结果、供应商历史表现和偏差记录。",
                "生成放行 / 复检 / 退料建议，并附上依据。",
                "把异常批次同步给采购和生产。",
              ],
              [
                "Read batch data, sample results, supplier history, and deviation records.",
                "Generate a release, reinspection, or rejection recommendation together with evidence.",
                "Sync abnormal lots to procurement and production.",
              ]
            ),
            outputs: pickUiText(["放行建议", "异常批次清单", "供应商复盘摘要"], ["Release recommendation", "Abnormal lot list", "Supplier review summary"]),
            kpis: pickUiText(
              ["缩短来料判断时间", "减少批次争议", "提升跨部门追溯速度"],
              ["Shorten incoming decision time", "Reduce lot disputes", "Improve cross-team traceability"]
            ),
            stat: pickUiText(
              "PwC 2026 Industrial Manufacturing Outlook：先进技术正在更深入进入制造现场与质量控制流程。",
              "PwC 2026 Industrial Manufacturing Outlook: advanced technology is moving deeper into factory operations and quality-control workflows."
            ),
            impactScore: 17,
            source: cloneSource(requireBaseDepartment("production").scenarios[1].source),
            demoResult: pickUiText(
              "OpenClaw 已识别出 2 个需要复检的来料批次，并附上退料证据链。",
              "OpenClaw identified 2 incoming lots that require reinspection and attached the rejection evidence trail."
            ),
          },
          {
            id: "quality-release",
            title: pickUiText("出货放行代理", "Shipping Release Agent"),
            hook: pickUiText(
              "出货前自动核对缺陷、返工和客户要求，避免问题流到市场端。",
              "Cross-check defects, rework, and customer requirements before shipment so issues do not leak into the market."
            ),
            problem: pickUiText(
              "出货放行常依赖人工翻检记录和客户要求，既慢又容易漏项。",
              "Shipping release often depends on manually reviewing records and customer specs, which is slow and easy to miss."
            ),
            workflow: pickUiText(
              [
                "汇总终检结果、返工记录、客户规格和特采说明。",
                "识别仍未关闭的风险点与放行条件。",
                "同步给仓库、客服和客户经理。",
              ],
              [
                "Aggregate final inspection results, rework records, customer specs, and special-approval notes.",
                "Identify unresolved risk points and release conditions.",
                "Sync the result to warehouse, support, and account teams.",
              ]
            ),
            outputs: pickUiText(["放行结论", "未闭环问题清单", "客户侧说明摘要"], ["Release verdict", "Open-issue list", "Customer-facing summary"]),
            kpis: pickUiText(
              ["减少带病出货", "提高出货前决策速度", "减少售后争议"],
              ["Reduce defective shipments", "Speed up pre-shipment decisions", "Lower after-sales disputes"]
            ),
            stat: pickUiText(
              "McKinsey 2025：AI 在 operations 里的价值来自把判断和执行联动，而不只是生成报告。",
              "McKinsey 2025: AI creates value in operations by linking decisions to execution instead of only generating reports."
            ),
            impactScore: 16,
            source: cloneSource(requireBaseDepartment("marketing").scenarios[1].source),
            demoResult: pickUiText(
              "OpenClaw 已在出货前拦截 1 个高风险批次，并自动通知仓库与客户成功团队。",
              "OpenClaw stopped 1 high-risk lot before shipment and automatically notified warehouse and customer success."
            ),
          },
        ],
      };
    }
    case "management":
      return {
        name: "Executive Office",
        shortName: pickUiText("管理层", "Executive"),
        intro: pickUiText(
          "最后一间是管理层办公室，用来讲 OpenClaw 如何汇总跨部门执行信号，推动经营决策和 agent 治理。",
          "The final room is the executive office, where OpenClaw aggregates cross-functional execution signals and supports operating decisions plus agent governance."
        ),
        speakerNote: pickUiText(
          "结尾在这里收束：所有部门不是各自用 AI，而是被统一拉进一个执行系统。",
          "This is where the story closes: departments are not using AI in isolation. They are pulled into one execution system."
        ),
        npcRoles: getLocalizedNpcRoles("management"),
        scenarios: [
          {
            id: "exec-cockpit",
            title: pickUiText("经营驾驶舱代理", "Operating Cockpit Agent"),
            hook: pickUiText(
              "把各部门实时动作压缩成管理层能直接判断的经营面板。",
              "Compress real-time actions from each function into an operating panel leaders can act on immediately."
            ),
            problem: pickUiText(
              "管理层拿到的数据常分散、滞后，难以快速看见哪里已经执行、哪里还停留在分析。",
              "Leadership data is often fragmented and delayed, making it hard to see what is actually executing versus still stuck in analysis."
            ),
            workflow: pickUiText(
              [
                "汇总销售、生产、仓库、客服和财务关键信号。",
                "生成跨部门例外事项和需要拍板的清单。",
                "把经营风险按紧急度排序。",
              ],
              [
                "Aggregate key signals from sales, production, warehouse, support, and finance.",
                "Generate a cross-functional exception list and decisions that need leadership approval.",
                "Rank operating risks by urgency.",
              ]
            ),
            outputs: pickUiText(["经营驾驶舱", "例外事项板", "拍板清单"], ["Operating cockpit", "Exception board", "Decision list"]),
            kpis: pickUiText(
              ["缩短例会准备时间", "更快定位执行瓶颈", "提升跨部门协同透明度"],
              ["Shorten leadership meeting prep", "Locate execution bottlenecks faster", "Increase cross-team transparency"]
            ),
            stat: pickUiText(
              "Microsoft Work Trend Index 2025：管理者越来越需要直接管理 agents 与人机混合执行。",
              "Microsoft Work Trend Index 2025: managers increasingly need to oversee agents and human-plus-agent execution directly."
            ),
            impactScore: 18,
            source: cloneSource(requireBaseDepartment("hr").scenarios[1].source),
            demoResult: pickUiText(
              "OpenClaw 已将 9 个部门动作汇总成 1 个经营 cockpit，并标出 4 个待拍板事项。",
              "OpenClaw consolidated actions from 9 functions into one operating cockpit and flagged 4 decisions awaiting approval."
            ),
          },
          {
            id: "exec-planning",
            title: pickUiText("战略节奏代理", "Strategy Cadence Agent"),
            hook: pickUiText(
              "把季度目标拆成跨部门的连续动作，而不是 PPT 口号。",
              "Break quarterly goals into cross-functional actions instead of leaving them as slideware slogans."
            ),
            problem: pickUiText(
              "战略目标落地时，往往缺少跨部门同步机制和明确的责任动作。",
              "When strategy is pushed into execution, teams often lack a shared coordination mechanism and clearly assigned actions."
            ),
            workflow: pickUiText(
              [
                "读取季度 OKR、预算与重点项目状态。",
                "拆出跨部门依赖、时间节点和负责人。",
                "自动跟踪延误项并生成提醒与调整建议。",
              ],
              [
                "Read quarterly OKRs, budget data, and key project status.",
                "Break out cross-functional dependencies, milestones, and owners.",
                "Track delays automatically and generate reminders plus adjustment suggestions.",
              ]
            ),
            outputs: pickUiText(["季度行动板", "跨部门依赖图", "风险调整建议"], ["Quarterly action board", "Dependency map", "Risk adjustment advice"]),
            kpis: pickUiText(
              ["减少战略落地断层", "让管理层看到真实推进状态", "提高项目节奏可控性"],
              ["Reduce strategy-to-execution gaps", "Give leadership a real view of progress", "Increase control over delivery cadence"]
            ),
            stat: pickUiText(
              "McKinsey 2025：真正的价值不在单个用例，而在跨函数规模化部署。",
              "McKinsey 2025: the real value is not in isolated use cases but in scaled deployment across functions."
            ),
            impactScore: 17,
            source: cloneSource(requireBaseDepartment("marketing").scenarios[1].source),
            demoResult: pickUiText(
              "OpenClaw 已把季度目标拆成 27 个跨部门动作，并标记 3 个关键依赖风险。",
              "OpenClaw broke the quarterly plan into 27 cross-functional actions and marked 3 critical dependency risks."
            ),
          },
          {
            id: "exec-governance",
            title: pickUiText("Agent 治理代理", "Agent Governance Agent"),
            hook: pickUiText(
              "当 AI 开始执行工作后，管理层需要看得见权限、风险和审计轨迹。",
              "Once AI starts executing work, leadership needs visibility into permissions, risk, and audit trails."
            ),
            problem: pickUiText(
              "多个部门同时运行 agent 时，权限边界、审批链和审计责任会迅速复杂化。",
              "When multiple departments run agents at the same time, permission boundaries, approvals, and audit responsibility get complicated quickly."
            ),
            workflow: pickUiText(
              [
                "汇总各 agent 的动作记录、异常和人工介入节点。",
                "输出权限、审批和回滚建议。",
                "形成对内审计和治理复盘材料。",
              ],
              [
                "Aggregate action logs, anomalies, and human intervention points across agents.",
                "Produce permission, approval, and rollback recommendations.",
                "Assemble internal audit and governance review materials.",
              ]
            ),
            outputs: pickUiText(["治理日报", "权限风险清单", "审计复盘包"], ["Governance daily", "Permission risk list", "Audit review pack"]),
            kpis: pickUiText(
              ["保证可追溯性", "降低误操作风险", "让 agent 执行可管可审"],
              ["Maintain traceability", "Reduce operational error risk", "Keep agent execution governable and auditable"]
            ),
            stat: pickUiText(
              "Salesforce 2025：随着 agents 进入核心流程，治理与安全预算会同步提升。",
              "Salesforce 2025: as agents move into core workflows, governance and security spending rises with them."
            ),
            impactScore: 16,
            source: cloneSource(requireBaseDepartment("it").scenarios[0].source),
            demoResult: pickUiText(
              "OpenClaw 已生成本周 agent 执行治理摘要，并标出 2 个需要收紧权限的流程。",
              "OpenClaw generated this week's agent-governance summary and flagged 2 workflows that need tighter permissions."
            ),
          },
        ],
      };
    default:
      return null;
  }
}

function applyLocalizedScenario(target: Scenario, source: LocalizedSceneScenario): void {
  target.title = source.title;
  target.hook = source.hook;
  target.problem = source.problem;
  target.workflow = [...source.workflow];
  target.outputs = [...source.outputs];
  target.kpis = [...source.kpis];
  target.stat = source.stat;
  target.impactScore = source.impactScore;
  target.demoResult = source.demoResult;
  target.source = cloneSource(source.source);
}

function applyLocalizedDepartment(target: SceneDepartment, source: LocalizedSceneDepartmentContent): void {
  target.name = source.name;
  target.shortName = source.shortName;
  target.intro = source.intro;
  target.speakerNote = source.speakerNote;
  target.npcRoles = [...source.npcRoles];

  const scenarioMap = new Map(source.scenarios.map((scenario) => [scenario.id, scenario] as const));
  target.scenarios.forEach((scenario) => {
    const localizedScenario = scenarioMap.get(scenario.id);
    if (localizedScenario) {
      applyLocalizedScenario(scenario, localizedScenario);
    }
  });

  target.insight.fact = target.speakerNote;
  const externalTerminal = target.terminals.find((terminal) => terminal.kind === "external");
  if (externalTerminal && externalTerminal.kind === "external" && externalTerminal.id === "marketing-ledservice-terminal") {
    externalTerminal.label = pickUiText("LED Service 网站", "LED Service Site");
  }
}

function localizeSceneContent(): void {
  syncDataCatalogForCurrentLanguage();

  departments.forEach((department) => {
    const baseDepartment = baseDepartments.find((candidate) => candidate.id === department.id);
    if (baseDepartment) {
      applyLocalizedDepartment(department, {
        name: baseDepartment.name,
        shortName: baseDepartment.shortName,
        intro: baseDepartment.intro,
        speakerNote: baseDepartment.speakerNote,
        npcRoles: getLocalizedNpcRoles(department.id),
        scenarios: baseDepartment.scenarios.map((scenario) => cloneScenario(scenario)),
      });

      if (department.id === "production") {
        const capacityScenario = buildProductionCapacityScenario();
        const existingScenario = department.scenarios.find((scenario) => scenario.id === "production-capacity");
        if (existingScenario) {
          applyLocalizedScenario(existingScenario, capacityScenario);
        }
      }
      return;
    }

    const customDepartment = getCustomDepartmentLocalization(department.id);
    if (customDepartment) {
      applyLocalizedDepartment(department, customDepartment);
    }
  });

  sharedZones.forEach((zone) => {
    zone.label = getSharedZoneLabelByKind(zone.kind);
  });

  areaGuides.forEach((guide) => {
    guide.label = getAreaGuideLabel(guide.target);
    guide.preview = getAreaGuidePreview(guide.target);
  });

  centralMeetingPodium.label = pickUiText("中央会议区演讲台", "Central Meeting Podium");

  npcs.forEach((npc, index) => {
    const roles = npc.department.npcRoles;
    npc.role = roles[index % roles.length] ?? npc.role;
  });

  if (!activeDepartmentId && !activeSharedZoneId) {
    navigationFocusTransition.label = pickUiText("中央办公区 · 全景视图", "Central Office · Panorama");
    activeAreaTransition.label = pickUiText("中央办公区 · 当前区域", "Central Office · Current Zone");
    focusArrivalTransition.label = pickUiText("中央办公区", "Central Office");
  }
}

function createMeetingSeats(): MeetingSeat[] {
  const upperCount = departments.filter((department) => department.approachSide === "down").length * 3;
  const lowerCount = departments.filter((department) => department.approachSide === "up").length * 3;
  const leftInset = 14;
  const rightInset = 14;

  const buildSeatRow = (
    count: number,
    group: MeetingSeatGroup,
    seatY: number,
    approachY: number,
    facing: FacingDirection
  ): MeetingSeat[] => {
    if (count <= 0) {
      return [];
    }

    return Array.from({ length: count }, (_, index) => {
      const progress = count === 1 ? 0.5 : index / (count - 1);
      return {
        id: `meeting-seat-${group}-${index}`,
        group,
        position: {
          x: Math.round(lerp(centralMeetingTableRect.left + leftInset, centralMeetingTableRect.left + centralMeetingTableRect.width - rightInset, progress)),
          y: seatY,
        },
        approachPoint: {
          x: Math.round(lerp(centralMeetingTableRect.left + leftInset, centralMeetingTableRect.left + centralMeetingTableRect.width - rightInset, progress)),
          y: approachY,
        },
        facing,
      };
    });
  };

  return [
    ...buildSeatRow(
      upperCount,
      "upper",
      centralMeetingTableRect.top - 10,
      centralMeetingTableRect.top - 18,
      "down"
    ),
    ...buildSeatRow(
      lowerCount,
      "lower",
      centralMeetingTableRect.top + centralMeetingTableRect.height + 10,
      centralMeetingTableRect.top + centralMeetingTableRect.height + 18,
      "up"
    ),
  ];
}

const meetingSeats = createMeetingSeats();
const meetingState = {
  active: false,
  discussionCooldown: 0,
  discussionTurn: 0,
  readyAnnounced: false,
  currentSpeakerId: "",
  lastSpeakerId: "",
  pendingQuestionerId: "",
  pendingResponderId: "",
  pendingTopicTurn: 0,
  phaseKind: "idle",
  phaseDuration: 0,
  recentTurns: [] as MeetingTimelineEntry[],
};

function resolveInitialSpawn(): Point {
  const preferredSpawns: Point[] = [
    { x: corridorRect.left + corridorRect.width - 92, y: corridorRect.top + corridorRect.height - 32 },
    { x: corridorRect.left + corridorRect.width - 118, y: corridorRect.top + 34 },
    { x: corridorRect.left + 92, y: corridorRect.top + corridorRect.height - 28 },
    { x: corridorRect.left + 72, y: corridorRect.top + 30 },
  ];

  const preferred = preferredSpawns.find((point) => canStandAt(point.x, point.y));
  if (preferred) {
    return preferred;
  }

  for (let y = corridorRect.top + 18; y <= corridorRect.top + corridorRect.height - 18; y += 6) {
    for (let x = corridorRect.left + 18; x <= corridorRect.left + corridorRect.width - 18; x += 6) {
      if (canStandAt(x, y)) {
        return { x, y };
      }
    }
  }

  return {
    x: corridorRect.left + 24,
    y: corridorRect.top + 24,
  };
}

const worldBounds: Rect = {
  left: officeRect.left - 12,
  top: officeRect.top - 6,
  width: officeRect.width + 24,
  height: officeRect.height + 12,
};

const starfield = Array.from({ length: 64 }, (_, index) => createStar(index));
const minimapHits: MinimapHit[] = [];
const keys = new Set<string>();
const touchControls = new Set<ControlKey>();
const completedScenarios = new Set<string>();
const collectedInsights = new Set<string>();
const bubbleLexiconByLanguage: Record<UiLanguage, string[]> = {
  "zh-CN": [
    "这周的周报格式又改了。",
    "审批流卡在上上级那里了。",
    "茶水间的咖啡又被喝空了。",
    "打印机今天第三次提示缺纸。",
    "产品说这个需求其实很简单。",
    "客户刚刚又改了一版口径。",
    "老板上午说不急，下午又催了。",
    "会议室又被临时拿去面试了。",
    "财务提醒报销别填错成本中心。",
    "谁把测试环境密码改了没同步？",
    "前台说有箱样品还没人认领。",
    "行政又在统计工位绿植名单。",
    "午休群里还在投票订哪家奶茶。",
    "这个表我昨晚明明发过一版了。",
    "刚对齐完口径，群里又有新说法。",
    "有人又把会议纪要发到错群了。",
    "HR 提醒别忘了补打卡申请。",
    "采购说发票抬头少了一个括号。",
    "运营说只改两个字，但要立刻上线。",
    "大家都说马上，结果都还没开始。",
    "法务说合同版本又传错附件了。",
    "隔壁组来借白板笔已经第三轮了。",
  ],
  en: [
    "The weekly report format changed again.",
    "The approval flow is stuck two levels up.",
    "The pantry coffee is already empty again.",
    "The printer warned about missing paper for the third time today.",
    "Product said this request should be simple.",
    "The customer just changed the messaging again.",
    "The boss said no rush this morning and chased it this afternoon.",
    "The meeting room got taken for interviews again.",
    "Finance reminded us not to submit the wrong cost center.",
    "Who changed the test-environment password without syncing it?",
    "Front desk says one box of samples is still unclaimed.",
    "Admin is counting desk plants again.",
    "The lunch chat is still voting on milk tea.",
    "I definitely sent one version of this sheet last night.",
    "We aligned the wording and then the group chat changed it again.",
    "Someone sent the meeting notes to the wrong chat again.",
    "HR said not to forget the attendance correction request.",
    "Procurement said the invoice title is missing one parenthesis.",
    "Ops said it is just two words, but it has to ship now.",
    "Everyone said soon, and nobody has started yet.",
    "Legal says the wrong contract attachment was uploaded again.",
    "The team next door has borrowed the whiteboard markers for a third round.",
  ],
};

const npcSurnamePool = ["陈", "林", "王", "李", "赵", "周", "吴", "郑", "孙", "谢", "何", "许", "徐", "梁", "郭", "高"];
const npcGivenNamePool = [
  "一诺",
  "予安",
  "知行",
  "可欣",
  "明哲",
  "若溪",
  "景言",
  "思远",
  "书宁",
  "泽语",
  "嘉禾",
  "安晴",
  "子墨",
  "清和",
  "北辰",
  "心怡",
  "云舒",
  "映雪",
  "闻歌",
  "亦凡",
];

function createNpcName(seed: number): string {
  const surname = npcSurnamePool[seed % npcSurnamePool.length] ?? "林";
  const givenName = npcGivenNamePool[(seed * 3 + 5) % npcGivenNamePool.length] ?? "知行";
  return `${surname}${givenName}`;
}

function trimSpeechSegment(text: string, maxChars: number): string {
  const clean = text.replace(/\s+/g, " ").replace(/[：:]/g, " ").trim();
  const chars = Array.from(clean);
  if (chars.length <= maxChars) {
    return clean;
  }
  return `${chars.slice(0, maxChars).join("")}…`;
}

function extractSpeechBody(text: string): string {
  const segments = text.split(/[：:]/);
  return segments.length > 1 ? segments.slice(1).join(":").trim() : text;
}

const initialSpawn = resolveInitialSpawn();

const player: PlayerState = {
  x: initialSpawn.x,
  y: initialSpawn.y,
  facing: 0,
  step: 0,
};

const introPromoRugRect: Rect = {
  left: initialSpawn.x - 42,
  top: initialSpawn.y - 18,
  width: 84,
  height: 36,
};

const camera = {
  x: player.x,
  y: player.y - 4,
  lookAheadX: 0,
  lookAheadY: 0,
  lookAheadStrength: 0,
  lookAheadDirectionX: 0,
  lookAheadDirectionY: 0,
  navigationBiasX: 0,
  navigationBiasY: 0,
  meetingBiasX: 0,
  meetingBiasY: 0,
  zoomBias: 0,
  zoom: isCompactViewport() ? DEFAULT_ZOOM_MOBILE : DEFAULT_ZOOM_DESKTOP,
  targetZoom: isCompactViewport() ? DEFAULT_ZOOM_MOBILE : DEFAULT_ZOOM_DESKTOP,
};

let activeDepartmentId = "";
let activeSharedZoneId = "";
let promptTargetDepartmentId = "";
let promptTargetSharedZoneId = "";
let hoveredGuide: AreaGuide | null = null;
let hoveredTerminal: OfficeTerminal | null = null;
let hoveredInsight: InsightNode | null = null;
let hoveredPodium: MeetingPodium | null = null;
let modalDepartment: SceneDepartment | null = null;
let modalSharedZone: SharedZone | null = null;
let uiMinimal = true;
let toastTimer: number | null = null;
let isDragging = false;
let lastPointerX = 0;
let lastPointerY = 0;
let activeCanvasPointerId: number | null = null;
let activeCanvasPointerStartX = 0;
let activeCanvasPointerStartY = 0;
let activeCanvasPointerTapEligible = false;
let mobileMoveTarget: Point | null = null;
let mobileMoveStallTimer = 0;
let lastFrameTime = performance.now();
let lastEventText = getLocalizedString("dashboard.waiting");
let lastPromptKey = "";
let lastRouteListRenderKey = "";
let lastHudStatusKey = "";
let officeFlowClock = 0;
const titleScreenState: {
  active: boolean;
  phase: TitleScreenPhase;
  hero: TitleScreenHero;
  lobster: TitleScreenLobster;
} = {
  active: true,
  phase: "language",
  hero: {
    position: { x: 120, y: 168 },
    target: { x: 120, y: 168 },
    facing: 0,
    speed: 26,
    retargetTimer: 0,
    step: 0,
  },
  lobster: {
    position: { x: 320, y: 146 },
    target: { x: 320, y: 146 },
    retargetTimer: 0,
    speed: 21,
    panic: 0,
    facing: Math.PI,
  },
};
const navigationFocusTransition: AreaTransitionState = {
  areaKey: "",
  pulse: 0,
  accent: "#89d0ff",
  label: "中央办公区",
};
const activeAreaTransition: AreaTransitionState = {
  areaKey: "",
  pulse: 0,
  accent: "#89d0ff",
  label: "中央办公区",
};
const focusArrivalTransition: AreaTransitionState = {
  areaKey: "",
  pulse: 0,
  accent: "#89d0ff",
  label: "中央办公区",
};
const goalRelayState: GoalRelayState = {
  pulse: 0,
  fromTarget: null,
  toTarget: null,
  fromAccent: "#89d0ff",
  toAccent: "#89d0ff",
  headline: "",
  detail: "",
};
const departmentMilestoneState: DepartmentMilestoneState = {
  pulse: 0,
  departmentId: "",
  accent: "#8be08c",
  title: "",
  detail: "",
  completedScenarios: 0,
  totalScenarios: 0,
  impactScore: 0,
};
const departmentOutcomeFeed: DepartmentOutcomeRecord[] = [];
const meetingStageCueState: MeetingStageCueState = {
  pulse: 0,
  accent: "#89d0ff",
  phaseKind: "idle",
  title: "",
  detail: "",
  speakerId: "",
  counterpartId: "",
};
const npcs = createNpcActors();
let lastNavigationFocusPresenceKey = "";

function createStar(index: number): Star {
  return {
    x: worldBounds.left + hashUnit(index * 17 + 3) * worldBounds.width,
    y: 3 + hashUnit(index * 23 + 11) * 20,
    size: hashUnit(index * 31 + 5) > 0.7 ? 2 : 1,
    speed: 0.8 + hashUnit(index * 29 + 7) * 2.2,
    alpha: 0.28 + hashUnit(index * 41 + 13) * 0.55,
  };
}

function hashUnit(seed: number): number {
  const value = Math.sin(seed * 93.173) * 43758.5453;
  return value - Math.floor(value);
}

function isCompactViewport(): boolean {
  return window.innerWidth <= 860;
}

function isTapInteractionMode(): boolean {
  return isCompactViewport();
}

function getMinZoom(): number {
  return window.innerHeight > window.innerWidth ? MOBILE_MIN_ZOOM : MIN_ZOOM;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function rectsOverlap(a: Rect, b: Rect, padding = 6): boolean {
  return (
    a.left < b.left + b.width + padding &&
    a.left + a.width + padding > b.left &&
    a.top < b.top + b.height + padding &&
    a.top + a.height + padding > b.top
  );
}

function resolveOverlayPlacement(
  preferredRect: Rect,
  reservedRects: Rect[],
  margin: number,
  verticalStep = 10,
  upwardAttempts = 10,
  downwardAttempts = 6
): Rect {
  const left = clamp(preferredRect.left, margin, canvas.width - preferredRect.width - margin);
  const minTop = margin;
  const maxTop = Math.max(margin, canvas.height - preferredRect.height - margin);
  const topCandidates: number[] = [];

  for (let attempt = 0; attempt <= upwardAttempts; attempt += 1) {
    topCandidates.push(clamp(preferredRect.top - attempt * verticalStep, minTop, maxTop));
  }
  for (let attempt = 1; attempt <= downwardAttempts; attempt += 1) {
    topCandidates.push(clamp(preferredRect.top + attempt * verticalStep, minTop, maxTop));
  }

  for (const top of topCandidates) {
    const candidate = { left, top, width: preferredRect.width, height: preferredRect.height };
    if (!reservedRects.some((rect) => rectsOverlap(candidate, rect))) {
      reservedRects.push(candidate);
      return candidate;
    }
  }

  const fallback = {
    left,
    top: clamp(preferredRect.top, minTop, maxTop),
    width: preferredRect.width,
    height: preferredRect.height,
  };
  reservedRects.push(fallback);
  return fallback;
}

function shouldUseCompactOverlayTag(anchor: Point, transform: SurfaceDrawTransform, padding = 92): boolean {
  const anchorOnCanvas = surfacePointToCanvas(anchor, transform);
  return (
    isCompactViewport() ||
    anchorOnCanvas.x <= padding ||
    anchorOnCanvas.x >= canvas.width - padding
  );
}

function lerp(current: number, target: number, amount: number): number {
  return current + (target - current) * amount;
}

function lerpAngle(current: number, target: number, amount: number): number {
  const delta = ((target - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return current + delta * amount;
}

function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.left + rect.width &&
    point.y >= rect.top &&
    point.y <= rect.top + rect.height
  );
}

function rectCenter(rect: Rect): Point {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function getTitleSceneBounds(): Rect {
  const paddingX = surface.width <= 320 ? 22 : 34;
  const top = Math.round(surface.height * 0.34);
  const bottomPadding = Math.round(surface.height * 0.12);
  return {
    left: paddingX,
    top,
    width: Math.max(96, surface.width - paddingX * 2),
    height: Math.max(72, surface.height - top - bottomPadding),
  };
}

function clampTitlePoint(point: Point, padding = 10): Point {
  const bounds = getTitleSceneBounds();
  return {
    x: clamp(point.x, bounds.left + padding, bounds.left + bounds.width - padding),
    y: clamp(point.y, bounds.top + padding, bounds.top + bounds.height - padding),
  };
}

function pickRandomTitlePoint(): Point {
  const bounds = getTitleSceneBounds();
  return {
    x: randomBetween(bounds.left + 10, bounds.left + bounds.width - 10),
    y: randomBetween(bounds.top + 12, bounds.top + bounds.height - 10),
  };
}

function retargetTitleLobster(): void {
  const lobster = titleScreenState.lobster;
  const hero = titleScreenState.hero;
  const escapeAngle = Math.atan2(lobster.position.y - hero.position.y, lobster.position.x - hero.position.x);
  const target = clampTitlePoint(
    {
      x: lobster.position.x + Math.cos(escapeAngle + randomBetween(-0.9, 0.9)) * randomBetween(52, 96),
      y: lobster.position.y + Math.sin(escapeAngle + randomBetween(-0.8, 0.8)) * randomBetween(30, 78),
    },
    12
  );
  lobster.target = target;
  lobster.retargetTimer = randomBetween(0.7, 1.6);
}

function retargetTitleHero(): void {
  const lobster = titleScreenState.lobster;
  const target = clampTitlePoint(
    {
      x: lobster.position.x + randomBetween(-22, 22),
      y: lobster.position.y + randomBetween(-16, 18),
    },
    14
  );
  titleScreenState.hero.target = target;
  titleScreenState.hero.retargetTimer = randomBetween(0.32, 0.76);
}

function resetTitleScreenActors(): void {
  const bounds = getTitleSceneBounds();
  titleScreenState.hero.position = {
    x: bounds.left + bounds.width * 0.26,
    y: bounds.top + bounds.height * 0.72,
  };
  titleScreenState.hero.target = { ...titleScreenState.hero.position };
  titleScreenState.hero.facing = 0;
  titleScreenState.hero.step = 0;
  titleScreenState.hero.retargetTimer = 0;
  titleScreenState.lobster.position = {
    x: bounds.left + bounds.width * 0.74,
    y: bounds.top + bounds.height * 0.44,
  };
  titleScreenState.lobster.target = { ...titleScreenState.lobster.position };
  titleScreenState.lobster.retargetTimer = 0;
  titleScreenState.lobster.panic = 0;
  titleScreenState.lobster.facing = Math.PI;
  retargetTitleLobster();
  retargetTitleHero();
}

function updateTitleScreen(delta: number): void {
  const hero = titleScreenState.hero;
  const lobster = titleScreenState.lobster;
  hero.retargetTimer -= delta;
  lobster.retargetTimer -= delta;

  const chaseDistance = Math.hypot(hero.position.x - lobster.position.x, hero.position.y - lobster.position.y);
  lobster.panic = clamp(1 - chaseDistance / 110, 0, 1);

  if (lobster.retargetTimer <= 0 || chaseDistance < 38) {
    retargetTitleLobster();
  }
  if (hero.retargetTimer <= 0 || Math.hypot(hero.target.x - lobster.position.x, hero.target.y - lobster.position.y) > 54) {
    retargetTitleHero();
  }

  const lobsterDx = lobster.target.x - lobster.position.x;
  const lobsterDy = lobster.target.y - lobster.position.y;
  const lobsterDistance = Math.hypot(lobsterDx, lobsterDy);
  if (lobsterDistance > 0.001) {
    const speed = (lobster.speed + lobster.panic * 16) * 1.5;
    const move = Math.min(lobsterDistance, speed * delta);
    lobster.position.x += (lobsterDx / lobsterDistance) * move;
    lobster.position.y += (lobsterDy / lobsterDistance) * move;
    lobster.facing = lerpAngle(lobster.facing, Math.atan2(lobsterDy, lobsterDx), clamp(delta * 10, 0, 1));
  }

  const heroDx = hero.target.x - hero.position.x;
  const heroDy = hero.target.y - hero.position.y;
  const heroDistance = Math.hypot(heroDx, heroDy);
  if (heroDistance > 0.001) {
    const speed = hero.speed + lobster.panic * 22;
    const move = Math.min(heroDistance, speed * delta);
    hero.position.x += (heroDx / heroDistance) * move;
    hero.position.y += (heroDy / heroDistance) * move;
    hero.facing = lerpAngle(hero.facing, Math.atan2(heroDy, heroDx), clamp(delta * 10, 0, 1));
    hero.step += delta * (8 + lobster.panic * 5);
  } else {
    hero.step = 0;
  }
}

function splitBubbleText(text: string, maxCharsPerLine = NPC_BUBBLE_MAX_CHARS_PER_LINE): string[] {
  const chars = Array.from(text.trim());
  if (chars.length === 0) {
    return ["..."];
  }

  const lines: string[] = [];
  for (let index = 0; index < chars.length; index += maxCharsPerLine) {
    lines.push(chars.slice(index, index + maxCharsPerLine).join(""));
  }
  return lines;
}

function getBubbleDuration(text: string): number {
  return clamp(1.6 + Array.from(text).length * 0.12, 1.6, 4.8);
}

function isNpcBubbleVisibleOnScreen(npc: NpcActor): boolean {
  if (!npc.bubbleText) {
    return false;
  }

  const anchor = worldToScreen(npc.x, npc.y);
  return isScreenRectVisible({
    left: anchor.x - 24,
    top: anchor.y - 42,
    width: 48,
    height: 48,
  });
}

function getVisibleNpcBubbleTexts(excludeNpcId?: string): Set<string> {
  return new Set(
    npcs
      .filter((npc) => npc.id !== excludeNpcId && isNpcBubbleVisibleOnScreen(npc))
      .map((npc) => npc.bubbleText)
      .filter((text): text is string => Boolean(text))
  );
}

function pickNpcBubbleText(excludeNpcId?: string): string {
  const bubbleLexicon = bubbleLexiconByLanguage[currentUiLanguage];
  const visibleTexts = getVisibleNpcBubbleTexts(excludeNpcId);
  const candidates = bubbleLexicon.filter((text) => !visibleTexts.has(text));
  const pool = candidates.length > 0 ? candidates : bubbleLexicon;
  return pool[Math.floor(Math.random() * pool.length)] ?? "...";
}

function getNpcAmbientZone(npc: NpcActor): SharedZone | SceneDepartment | "corridor" | null {
  const point = { x: npc.x, y: npc.y };
  const sharedZone = sharedZones.find((zone) =>
    pointInRect(point, zone.roomRect) ||
    pointInRect(point, zone.walkwayRect) ||
    pointInRect(point, zone.frontageRect)
  );
  if (sharedZone) {
    return sharedZone;
  }

  const department = departments.find((candidate) =>
    candidate.id !== npc.department.id &&
    (pointInRect(point, candidate.roomRect) ||
      pointInRect(point, candidate.walkwayRect) ||
      pointInRect(point, candidate.frontageRect))
  );
  if (department) {
    return department;
  }

  return isPointInCorridorNetwork(point) ? "corridor" : null;
}

function getAmbientConversationLines(left: NpcActor, right: NpcActor): [string, string] {
  const zone = getNpcAmbientZone(left) ?? getNpcAmbientZone(right);
  const promptTarget = getNavigationTarget();
  const promptTargetDepartment = getPromptTargetDepartment();
  const promptTargetSharedZone = getPromptTargetSharedZone();
  const zoneLabel = zone === "corridor"
    ? pickUiText("主走廊", "main corridor")
    : "kind" in (zone ?? {}) && (zone as SharedZone).kind
      ? getSharedZoneUiLabel(zone as SharedZone)
      : zone
        ? getDepartmentUiLabel(zone as SceneDepartment)
        : pickUiText("办公室", "office");
  const targetLabel = promptTarget
    ? trimSpeechSegment(getInteractionTargetIndicatorTitle(promptTarget), 6)
    : promptTargetDepartment
      ? getDepartmentUiLabel(promptTargetDepartment)
      : promptTargetSharedZone
        ? getSharedZoneUiLabel(promptTargetSharedZone)
        : pickUiText("当前任务", "current task");
  const sameDepartment = left.department.id === right.department.id;
  const sharedZoneConversation = zone && zone !== "corridor" && "kind" in zone;

  if (sharedZoneConversation) {
    if (isEnglishUi()) {
      return [
        `${left.role}: It is crowded around ${zoneLabel} today. Are we almost up for ${targetLabel}?`,
        `${right.role}: Let's align the current step first, then hand it straight into ${targetLabel}.`,
      ];
    }
    return [
      `${left.role}：${zoneLabel}这边今天人多，${targetLabel}是不是也快轮到我们了？`,
      `${right.role}：先把手头动作对齐，等会儿直接往${targetLabel}那边接。`,
    ];
  }

  if (zone === "corridor") {
    if (isEnglishUi()) {
      return [
        `${left.role}: I'll follow the main corridor toward ${targetLabel}. Are you ready on your side?`,
        `${right.role}: Yes. I'll finish the result and meet you at ${targetLabel}.`,
      ];
    }
    return [
      `${left.role}：我先顺着主走廊去看${targetLabel}，你那边准备好了吗？`,
      `${right.role}：好了，我把结果补齐后就往${targetLabel}汇合。`,
    ];
  }

  if (!sameDepartment) {
    if (isEnglishUi()) {
      return [
        `${getDepartmentUiLabel(left.department)} can start the action first. Can ${getDepartmentUiLabel(right.department)} catch it directly?`,
        `${right.role}: Yes. Once we align on ${targetLabel}, we won't need to confirm it again in chat.`,
      ];
    }
    return [
      `${left.department.shortName}这边先把动作跑起来，${right.department.shortName}能直接接住吗？`,
      `${right.role}：可以，我们把${targetLabel}对上后就不需要再回群里确认。`,
    ];
  }

  if (isEnglishUi()) {
    return [
      `${left.role}: This room is getting busy. Give that ${targetLabel} route one more look for me.`,
      `${right.role}: No problem. I'll collapse the result into the same version and we can review it together.`,
    ];
  }
  return [
    `${left.role}：这间现在挺热，${targetLabel}那条链路你再帮我看一眼。`,
    `${right.role}：没问题，我把结果压到同一版里，等会儿一起过。`,
  ];
}

function canStartAmbientConversation(npc: NpcActor): boolean {
  return (
    npc.meetingStatus === "office" &&
    npc.action === "working" &&
    npc.bubbleTimer <= 0 &&
    npc.socialCooldown <= 0 &&
    !npc.stationary
  );
}

function tryStartAmbientNpcConversation(visibleBubbleCount: number): void {
  if (meetingState.active || visibleBubbleCount >= MAX_VISIBLE_NPC_BUBBLES - 1 || Math.random() >= NPC_AMBIENT_CONVERSATION_CHANCE) {
    return;
  }

  const candidates = npcs.filter((npc) => canStartAmbientConversation(npc) && getNpcAmbientZone(npc));
  if (candidates.length < 2) {
    return;
  }

  const left = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
  if (!left) {
    return;
  }

  const partnerPool = candidates.filter((candidate) =>
    candidate.id !== left.id &&
    distanceSquared(left, candidate) <= NPC_AMBIENT_CONVERSATION_DISTANCE * NPC_AMBIENT_CONVERSATION_DISTANCE &&
    Boolean(getNpcAmbientZone(candidate))
  );
  if (partnerPool.length === 0) {
    return;
  }

  const right = partnerPool[Math.floor(Math.random() * partnerPool.length)] ?? null;
  if (!right) {
    return;
  }

  const [leftLine, rightLine] = getAmbientConversationLines(left, right);
  const visibleTexts = getVisibleNpcBubbleTexts();
  if (visibleTexts.has(leftLine) || visibleTexts.has(rightLine)) {
    return;
  }

  const chatDuration = clamp(Math.max(getBubbleDuration(leftLine), getBubbleDuration(rightLine)) + 0.45, 2.6, 5.4);
  left.bubbleText = leftLine;
  left.bubbleTimer = chatDuration;
  left.bubbleCooldown = randomBetween(7.4, 11.2);
  left.socialCooldown = randomBetween(8.2, 13.5);
  left.actionTimer = chatDuration;
  left.facing = getFacingDirection(right.x - left.x, right.y - left.y, left.facing);

  right.bubbleText = rightLine;
  right.bubbleTimer = chatDuration - 0.2;
  right.bubbleCooldown = randomBetween(7.4, 11.2);
  right.socialCooldown = randomBetween(8.2, 13.5);
  right.actionTimer = chatDuration;
  right.facing = getFacingDirection(left.x - right.x, left.y - right.y, right.facing);
}

function getSurfaceDrawTransform(): SurfaceDrawTransform {
  const scale = Math.max(canvas.width / surface.width, canvas.height / surface.height);
  return {
    scale,
    drawLeft: (canvas.width - surface.width * scale) / 2,
    drawTop: (canvas.height - surface.height * scale) / 2,
  };
}

function surfacePointToCanvas(point: Point, transform: SurfaceDrawTransform): Point {
  return {
    x: Math.round(transform.drawLeft + point.x * transform.scale),
    y: Math.round(transform.drawTop + point.y * transform.scale),
  };
}

function surfaceRectToCanvas(rect: Rect, transform: SurfaceDrawTransform): Rect {
  const topLeft = surfacePointToCanvas({ x: rect.left, y: rect.top }, transform);
  return {
    left: topLeft.x,
    top: topLeft.y,
    width: Math.round(rect.width * transform.scale),
    height: Math.round(rect.height * transform.scale),
  };
}

function expandRect(rect: Rect, padding: number): Rect {
  return {
    left: rect.left - padding,
    top: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function clientPointToCanvasPoint(clientX: number, clientY: number): Point {
  const bounds = canvas.getBoundingClientRect();
  const scaleX = bounds.width > 0 ? canvas.width / bounds.width : 1;
  const scaleY = bounds.height > 0 ? canvas.height / bounds.height : 1;
  return {
    x: (clientX - bounds.left) * scaleX,
    y: (clientY - bounds.top) * scaleY,
  };
}

function canvasPointToWorld(point: Point, transform: SurfaceDrawTransform): Point {
  const surfaceX = (point.x - transform.drawLeft) / transform.scale;
  const surfaceY = (point.y - transform.drawTop) / transform.scale;
  return {
    x: camera.x + (surfaceX - surface.width / 2) / camera.zoom,
    y: camera.y + (surfaceY - surface.height / 2) / camera.zoom,
  };
}

function getFacingDirection(dx: number, dy: number, fallback: FacingDirection = "down"): FacingDirection {
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return fallback;
  }
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

function distanceSquared(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function getNpcOverlayAlpha(npc: NpcActor): number {
  const distance = Math.hypot(player.x - npc.x, player.y - npc.y);
  if (distance <= NPC_OVERLAY_FULL_FADE_DISTANCE) {
    return NPC_OVERLAY_FADE_ALPHA;
  }
  if (distance >= NPC_OVERLAY_FADE_START_DISTANCE) {
    return 1;
  }
  return lerp(
    NPC_OVERLAY_FADE_ALPHA,
    1,
    (distance - NPC_OVERLAY_FULL_FADE_DISTANCE) /
      (NPC_OVERLAY_FADE_START_DISTANCE - NPC_OVERLAY_FULL_FADE_DISTANCE)
  );
}

function getNpcLabelPriority(npc: NpcActor): number {
  const distance = Math.hypot(player.x - npc.x, player.y - npc.y);
  const distanceWeight = clamp(1 - distance / NPC_LABEL_PRIORITY_DISTANCE, 0, 1);
  let score = distanceWeight + getNpcOverlayAlpha(npc);

  if (npc.id === meetingState.currentSpeakerId) {
    score += 6;
  }
  if (npc.bubbleTimer > 0) {
    score += 3;
  }
  if (npc.department.id === activeDepartmentId) {
    score += 1.4;
  }
  if (npc.stationary) {
    score += 0.2;
  }

  return score;
}

function shouldShowNpcRoleLabel(npc: NpcActor): boolean {
  if (npc.id === meetingState.currentSpeakerId) {
    return true;
  }
  if (npc.bubbleTimer > 0) {
    return true;
  }
  if (npc.department.id === activeDepartmentId) {
    return true;
  }
  return distanceSquared(player, npc) <= NPC_LABEL_ROLE_DISTANCE * NPC_LABEL_ROLE_DISTANCE;
}

function isLedServiceTerminal(terminal: OfficeTerminal): terminal is ExternalTerminal {
  return terminal.kind === "external" && terminal.id === "marketing-ledservice-terminal";
}

function isLedServiceWithinDiscoveryRange(terminal: OfficeTerminal): boolean {
  return (
    isLedServiceTerminal(terminal) &&
    distanceSquared(player, terminal.position) <= LED_SERVICE_DISCOVERY_DISTANCE * LED_SERVICE_DISCOVERY_DISTANCE
  );
}

function adjustHex(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) {
    return hex;
  }

  const channels = [0, 2, 4].map((offset) =>
    clamp(parseInt(clean.slice(offset, offset + 2), 16) + amount, 0, 255)
      .toString(16)
      .padStart(2, "0")
  );

  return `#${channels.join("")}`;
}

function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) {
    return hex;
  }
  return `#${clean}${clamp(Math.round(alpha * 255), 0, 255).toString(16).padStart(2, "0")}`;
}

function createNpcActors(): NpcActor[] {
  const clothesPalette = ["#4a87d6", "#d6694a", "#53a56f", "#8b6dd6", "#d0a15c", "#3d7e92"];
  const hairPalette = ["#2d1c16", "#4b3528", "#5a4c38", "#18161e", "#6b3d2f"];
  const upperMeetingSeats = meetingSeats.filter((seat) => seat.group === "upper");
  const lowerMeetingSeats = meetingSeats.filter((seat) => seat.group === "lower");
  let upperSeatIndex = 0;
  let lowerSeatIndex = 0;

  return departments.flatMap((department, deptIndex) => {
    const homePositions = resolveNpcHomePositions(department, 3);

    return Array.from({ length: 3 }, (_, index) => {
      const anchor = homePositions[index] ?? department.workSpots[index % department.workSpots.length];
      const actorIndex = deptIndex * 3 + index;
      const stationary = actorIndex % 2 === 0;
      const seatPool = department.approachSide === "down" ? upperMeetingSeats : lowerMeetingSeats;
      const seatIndex = department.approachSide === "down" ? upperSeatIndex++ : lowerSeatIndex++;
      const meetingSeat = seatPool[seatIndex] ?? meetingSeats[Math.min(actorIndex, meetingSeats.length - 1)];
      return {
        id: `${department.id}-npc-${index}`,
        department,
        name: createNpcName(actorIndex),
        role: department.npcRoles[index % department.npcRoles.length],
        x: anchor.x,
        y: anchor.y,
        home: anchor,
        target: anchor,
        route: [],
        workSpots: [anchor, ...department.workSpots],
        speed: NPC_BASE_SPEED + (index % 3),
        facing: department.approachSide === "down" ? "down" : "up",
        step: randomBetween(0, Math.PI * 2),
        action: "working",
        actionTimer: randomBetween(0.8, 2.2) + index * 0.35,
        bubbleText: "",
        bubbleTimer: 0,
        bubbleCooldown: randomBetween(3.6, 7.4),
        stationary,
        palette: {
          clothes: clothesPalette[(deptIndex + index) % clothesPalette.length],
          hair: hairPalette[(deptIndex * 2 + index) % hairPalette.length],
        },
        meetingSeat,
        meetingStatus: "office",
        meetingDelay: 0,
        flowSeed: hashUnit(actorIndex * 19 + deptIndex * 11 + 5),
        socialCooldown: randomBetween(1.8, 5.4),
      };
    });
  });
}

function resizeCanvases(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  sceneContext.imageSmoothingEnabled = false;
  const minimapWidth = Math.max(1, Math.floor((minimap.clientWidth || minimap.width) * dpr));
  const minimapHeight = Math.max(1, Math.floor((minimap.clientHeight || minimap.height) * dpr));
  minimap.width = minimapWidth;
  minimap.height = minimapHeight;
  minimapContext.imageSmoothingEnabled = false;

  if (window.innerHeight > window.innerWidth) {
    surface.width = 288;
    surface.height = 384;
  } else {
    surface.width = 480;
    surface.height = 270;
  }

  const minZoom = getMinZoom();
  camera.targetZoom = clamp(camera.targetZoom, minZoom, MAX_ZOOM);
  camera.zoom = clamp(camera.zoom, minZoom, MAX_ZOOM);
  resetTitleScreenActors();
}

function isWalkable(x: number, y: number): boolean {
  return canStandAt(x, y);
}

function movePlayer(deltaX: number, deltaY: number): void {
  const nextX = clamp(
    player.x + deltaX,
    officeRect.left + PLAYER_RADIUS,
    officeRect.left + officeRect.width - PLAYER_RADIUS
  );
  if (isWalkable(nextX, player.y)) {
    player.x = nextX;
  }

  const nextY = clamp(
    player.y + deltaY,
    officeRect.top + PLAYER_RADIUS,
    officeRect.top + officeRect.height - PLAYER_RADIUS
  );
  if (isWalkable(player.x, nextY)) {
    player.y = nextY;
  }
}

function clearMobileMoveTarget(): void {
  mobileMoveTarget = null;
  mobileMoveStallTimer = 0;
}

function setMobileMoveTarget(target: Point): void {
  mobileMoveTarget = target;
  mobileMoveStallTimer = 0;
}

function resolveTapMoveTarget(point: Point): Point | null {
  const clampedPoint = {
    x: clamp(point.x, officeRect.left + PLAYER_RADIUS, officeRect.left + officeRect.width - PLAYER_RADIUS),
    y: clamp(point.y, officeRect.top + PLAYER_RADIUS, officeRect.top + officeRect.height - PLAYER_RADIUS),
  };

  if (canStandAt(clampedPoint.x, clampedPoint.y)) {
    return clampedPoint;
  }

  for (let radius = 4; radius <= 56; radius += 4) {
    for (let step = 0; step < 16; step += 1) {
      const angle = (Math.PI * 2 * step) / 16;
      const candidate = {
        x: clamp(
          clampedPoint.x + Math.cos(angle) * radius,
          officeRect.left + PLAYER_RADIUS,
          officeRect.left + officeRect.width - PLAYER_RADIUS
        ),
        y: clamp(
          clampedPoint.y + Math.sin(angle) * radius,
          officeRect.top + PLAYER_RADIUS,
          officeRect.top + officeRect.height - PLAYER_RADIUS
        ),
      };
      if (canStandAt(candidate.x, candidate.y)) {
        return candidate;
      }
    }
  }

  return null;
}

function activateInteractionTarget(target: InteractionTarget): void {
  clearMobileMoveTarget();

  if (target.type === "podium") {
    toggleCentralMeeting();
    return;
  }

  if (target.type === "guide") {
    openAreaGuideModal(target.value);
    return;
  }

  if (target.type === "terminal") {
    openTerminal(target.value);
    return;
  }

  collectInsight(target.value);
}

function findInteractionTargetAtCanvasPoint(point: Point): InteractionTarget | null {
  const transform = getSurfaceDrawTransform();
  const candidates: Array<InteractionTarget & { hitRect: Rect }> = [];

  const podiumScreenRect = rectToScreen(centralMeetingPodium.rect);
  if (isScreenRectVisible(podiumScreenRect)) {
    candidates.push({
      type: "podium",
      value: centralMeetingPodium,
      hitRect: expandRect(surfaceRectToCanvas(podiumScreenRect, transform), 18),
    });
  }

  for (const guide of areaGuides) {
    const anchor = worldToScreen(guide.position.x, guide.position.y);
    const guideScreenRect = {
      left: anchor.x - 16,
      top: anchor.y - 20,
      width: 32,
      height: 32,
    };
    if (!isScreenRectVisible(guideScreenRect)) {
      continue;
    }
    candidates.push({
      type: "guide",
      value: guide,
      hitRect: expandRect(surfaceRectToCanvas(guideScreenRect, transform), 14),
    });
  }

  for (const terminal of terminals) {
    const anchor = worldToScreen(terminal.position.x, terminal.position.y);
    const terminalScreenRect = {
      left: anchor.x - 8,
      top: anchor.y - 8,
      width: 16,
      height: 14,
    };
    if (!isScreenRectVisible(terminalScreenRect)) {
      continue;
    }
    candidates.push({
      type: "terminal",
      value: terminal,
      hitRect: expandRect(surfaceRectToCanvas(terminalScreenRect, transform), 14),
    });
  }

  for (const node of insightNodes) {
    const anchor = worldToScreen(node.position.x, node.position.y);
    const insightScreenRect = {
      left: anchor.x - 8,
      top: anchor.y - 8,
      width: 16,
      height: 16,
    };
    if (!isScreenRectVisible(insightScreenRect)) {
      continue;
    }
    candidates.push({
      type: "insight",
      value: node,
      hitRect: expandRect(surfaceRectToCanvas(insightScreenRect, transform), 14),
    });
  }

  const hits = candidates
    .filter((candidate) => pointInRect(point, candidate.hitRect))
    .sort(
      (left, right) =>
        distanceSquared(point, rectCenter(left.hitRect)) - distanceSquared(point, rectCenter(right.hitRect))
    );

  if (hits.length === 0) {
    return null;
  }

  const best = hits[0];
  return { type: best.type, value: best.value } as InteractionTarget;
}

function handleCanvasTap(clientX: number, clientY: number): void {
  if (!isTapInteractionMode() || !modal.classList.contains("hidden")) {
    return;
  }

  const canvasPoint = clientPointToCanvasPoint(clientX, clientY);
  const interactionTarget = findInteractionTargetAtCanvasPoint(canvasPoint);
  if (interactionTarget) {
    activateInteractionTarget(interactionTarget);
    return;
  }

  const worldPoint = canvasPointToWorld(canvasPoint, getSurfaceDrawTransform());
  const moveTarget = resolveTapMoveTarget(worldPoint);
  if (moveTarget) {
    setMobileMoveTarget(moveTarget);
  }
}

function shouldIgnoreKeyboardEvent(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  const tagName = target?.tagName ?? "";
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
}

const handledCodes = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "KeyE",
  "KeyF",
]);

const GUIDE_PRIORITY_MARGIN = 8;
const INSIGHT_PRIORITY_MARGIN = 4;

function isHandledKeyboardCode(code: string): boolean {
  return handledCodes.has(code);
}

function isControlActive(control: ControlKey): boolean {
  if (touchControls.has(control)) {
    return true;
  }

  switch (control) {
    case "forward":
      return keys.has("KeyW") || keys.has("ArrowUp");
    case "backward":
      return keys.has("KeyS") || keys.has("ArrowDown");
    case "left":
      return keys.has("KeyA") || keys.has("ArrowLeft");
    case "right":
      return keys.has("KeyD") || keys.has("ArrowRight");
    case "turn-left":
      return false;
    case "turn-right":
      return false;
    default:
      return false;
  }
}

function getDepartmentAtPosition(x: number, y: number): SceneDepartment | null {
  return (
    departments.find((department) =>
      pointInRect({ x, y }, department.roomRect) ||
      pointInRect({ x, y }, department.walkwayRect) ||
      pointInRect({ x, y }, department.frontageRect)
    ) ?? null
  );
}

function getSharedZoneAtPosition(x: number, y: number): SharedZone | null {
  return (
    sharedZones.find((zone) =>
      pointInRect({ x, y }, zone.roomRect) ||
      pointInRect({ x, y }, zone.walkwayRect) ||
      pointInRect({ x, y }, zone.frontageRect)
    ) ?? null
  );
}

function findNearestGuide(): AreaGuide | null {
  let best: AreaGuide | null = null;
  let bestDistance = GUIDE_INTERACTION_DISTANCE * GUIDE_INTERACTION_DISTANCE;

  for (const guide of areaGuides) {
    const distance = distanceSquared(player, guide.position);
    if (distance < bestDistance) {
      best = guide;
      bestDistance = distance;
    }
  }

  return best;
}

function findNearestTerminal(): OfficeTerminal | null {
  let best: OfficeTerminal | null = null;
  let bestDistance = INTERACTION_DISTANCE * INTERACTION_DISTANCE;

  for (const terminal of terminals) {
    const distance = distanceSquared(player, terminal.position);
    if (distance < bestDistance) {
      best = terminal;
      bestDistance = distance;
    }
  }

  return best;
}

function findNearestInsight(): InsightNode | null {
  let best: InsightNode | null = null;
  let bestDistance = INSIGHT_DISTANCE * INSIGHT_DISTANCE;

  for (const node of insightNodes) {
    const distance = distanceSquared(player, node.position);
    if (distance < bestDistance) {
      best = node;
      bestDistance = distance;
    }
  }

  return best;
}

function findMeetingPodium(): MeetingPodium | null {
  return distanceSquared(player, centralMeetingPodium.interactionPoint) <=
      PODIUM_INTERACTION_DISTANCE * PODIUM_INTERACTION_DISTANCE
    ? centralMeetingPodium
    : null;
}

function getPromptTarget(): InteractionTarget | null {
  if (hoveredPodium) {
    return { type: "podium", value: hoveredPodium };
  }

  if (!hoveredGuide && !hoveredTerminal && !hoveredInsight) {
    return null;
  }

  const guideDistance = hoveredGuide
    ? distanceSquared(player, hoveredGuide.position)
    : Number.POSITIVE_INFINITY;
  const terminalDistance = hoveredTerminal
    ? distanceSquared(player, hoveredTerminal.position)
    : Number.POSITIVE_INFINITY;
  const insightDistance = hoveredInsight
    ? distanceSquared(player, hoveredInsight.position)
    : Number.POSITIVE_INFINITY;

  if (
    hoveredGuide &&
    guideDistance <= terminalDistance + GUIDE_PRIORITY_MARGIN &&
    guideDistance <= insightDistance + INSIGHT_PRIORITY_MARGIN
  ) {
    return hoveredGuide ? { type: "guide", value: hoveredGuide } : null;
  }

  if (hoveredInsight && insightDistance + INSIGHT_PRIORITY_MARGIN < terminalDistance) {
    return hoveredInsight ? { type: "insight", value: hoveredInsight } : null;
  }

  return hoveredTerminal
    ? { type: "terminal", value: hoveredTerminal }
    : hoveredInsight
      ? { type: "insight", value: hoveredInsight }
      : null;
}

function getDepartmentGuide(department: SceneDepartment): AreaGuide | null {
  return (
    areaGuides.find(
      (guide) => guide.target.type === "department" && guide.target.department.id === department.id
    ) ?? null
  );
}

function getInteractionTargetDepartment(target: InteractionTarget | null): SceneDepartment | null {
  if (!target) {
    return null;
  }

  switch (target.type) {
    case "podium":
      return null;
    case "guide":
      return target.value.target.type === "department" ? target.value.target.department : null;
    case "terminal":
      return target.value.department;
    case "insight":
      return target.value.department;
  }
}

function getScenarioInteractionTarget(
  department: SceneDepartment,
  scenarioId: string
): InteractionTarget | null {
  const terminal = department.terminals.find(
    (item): item is ScenarioTerminal => item.kind === "scenario" && item.scenario.id === scenarioId
  );
  return terminal ? { type: "terminal", value: terminal } : null;
}

function getDepartmentNextActionTarget(department: SceneDepartment): InteractionTarget | null {
  const nextScenario = department.scenarios.find((scenario) => !completedScenarios.has(scenario.id)) ?? null;
  if (nextScenario) {
    return getScenarioInteractionTarget(department, nextScenario.id);
  }

  if (!collectedInsights.has(department.insight.id)) {
    return { type: "insight", value: department.insight };
  }

  return null;
}

function getDepartmentPendingWorkSummary(department: SceneDepartment): string {
  const remainingScenarios = department.scenarios.length - getDepartmentCompletion(department);
  const missingInsight = !collectedInsights.has(department.insight.id);
  if (remainingScenarios <= 0 && !missingInsight) {
    return pickUiText("已闭环", "Closed loop done");
  }
  if (remainingScenarios > 0 && missingInsight) {
    return pickUiText(`还差 ${remainingScenarios} 场景 + 洞察`, `${remainingScenarios} scenes + insight left`);
  }
  if (remainingScenarios > 0) {
    return pickUiText(`还差 ${remainingScenarios} 场景`, `${remainingScenarios} scenes left`);
  }
  return pickUiText("还差洞察", "Insight left");
}

function getDepartmentBacklogRatio(department: SceneDepartment): number {
  const remainingScenarios = department.scenarios.length - getDepartmentCompletion(department);
  const missingInsight = !collectedInsights.has(department.insight.id) ? 1 : 0;
  const totalUnits = department.scenarios.length + 1;
  return clamp((remainingScenarios + missingInsight) / Math.max(1, totalUnits), 0, 1);
}

function shouldPreferDepartmentActionTarget(department: SceneDepartment): boolean {
  return (
    activeDepartmentId === department.id ||
    promptTargetDepartmentId === department.id ||
    pointInRect(player, department.roomRect) ||
    pointInRect(player, department.walkwayRect)
  );
}

function getSharedZoneGuide(zone: SharedZone): AreaGuide | null {
  return (
    areaGuides.find(
      (guide) => guide.target.type === "shared-zone" && guide.target.zone.id === zone.id
    ) ?? null
  );
}

function getStrategicNavigationTarget(): InteractionTarget | null {
  if (meetingState.active) {
    return { type: "podium", value: centralMeetingPodium };
  }

  let bestDepartmentGuide: AreaGuide | null = null;
  let bestDepartmentScore = Number.NEGATIVE_INFINITY;
  for (const department of departments) {
    const remainingScenarios = department.scenarios.length - getDepartmentCompletion(department);
    const missingInsight = !collectedInsights.has(department.insight.id);
    if (remainingScenarios <= 0 && !missingInsight) {
      continue;
    }

    const guide = getDepartmentGuide(department);
    if (!guide) {
      continue;
    }

    const distance = Math.sqrt(distanceSquared(player, guide.position));
    const score = (
      remainingScenarios * 4.2 +
      (missingInsight ? 2.4 : 0) +
      getDepartmentOccupancyRatio(department) * 2.6 +
      (department.id === activeDepartmentId ? 1.1 : 0) -
      distance / 120
    );
    if (score > bestDepartmentScore) {
      bestDepartmentScore = score;
      bestDepartmentGuide = guide;
    }
  }
  if (bestDepartmentGuide) {
    const department = bestDepartmentGuide.target.type === "department"
      ? bestDepartmentGuide.target.department
      : null;
    if (department && shouldPreferDepartmentActionTarget(department)) {
      const nextActionTarget = getDepartmentNextActionTarget(department);
      if (nextActionTarget) {
        return nextActionTarget;
      }
    }
    return { type: "guide", value: bestDepartmentGuide };
  }

  const preferredSharedZone = cafeteriaZone && activeSharedZoneId === cafeteriaZone.id
    ? receptionZone ?? cafeteriaZone
    : cafeteriaZone ?? receptionZone;
  const sharedZoneGuide = preferredSharedZone ? getSharedZoneGuide(preferredSharedZone) : null;
  return sharedZoneGuide ? { type: "guide", value: sharedZoneGuide } : null;
}

function getStrategicDepartmentCandidate(): SceneDepartment | null {
  return getInteractionTargetDepartment(getStrategicNavigationTarget());
}

function getNavigationTarget(): InteractionTarget | null {
  return getPromptTarget() ?? getStrategicNavigationTarget();
}

function getInteractionTargetAreaKey(target: InteractionTarget): string {
  switch (target.type) {
    case "podium":
      return "podium:central";
    case "guide":
      return target.value.target.type === "department"
        ? `department:${target.value.target.department.id}`
        : `shared-zone:${target.value.target.zone.id}`;
    case "terminal":
      return `department:${target.value.department.id}`;
    case "insight":
      return `department:${target.value.department.id}`;
  }
}

function getInteractionTargetId(target: InteractionTarget): string {
  switch (target.type) {
    case "podium":
      return "podium:central";
    case "guide":
      return `guide:${target.value.id}`;
    case "terminal":
      return `terminal:${target.value.id}`;
    case "insight":
      return `insight:${target.value.id}`;
  }
}

function getInteractionTargetPosition(target: InteractionTarget): Point {
  switch (target.type) {
    case "podium":
      return target.value.interactionPoint;
    case "guide":
      return target.value.position;
    case "terminal":
      return target.value.position;
    case "insight":
      return target.value.position;
  }
}

function getInteractionTargetDistance(target: InteractionTarget): number {
  return Math.sqrt(distanceSquared(player, getInteractionTargetPosition(target)));
}

function getInteractionTargetIndicatorTitle(target: InteractionTarget): string {
  if (isEnglishUi()) {
    switch (target.type) {
      case "podium":
        return "Podium";
      case "guide":
        return target.value.target.type === "department"
          ? `${getDepartmentUiLabel(target.value.target.department)} Guide`
          : `${getSharedZoneUiLabel(target.value.target.zone)} Guide`;
      case "terminal": {
        const terminal = target.value;
        if (terminal.kind === "external") {
          return terminal.id === "marketing-ledservice-terminal" ? "LED Gate" : terminal.label;
        }
        return terminal.scenario.title;
      }
      case "insight":
        return collectedInsights.has(target.value.id) ? "Captured Insight" : "Insight Chip";
    }
  }

  switch (target.type) {
    case "podium":
      return "演讲台";
    case "guide":
      return target.value.label;
    case "terminal":
      if (target.value.kind === "external") {
        const label = target.value.label;
        return isLedServiceTerminal(target.value) ? "LED 入口" : label;
      }
      return target.value.scenario.title;
    case "insight":
      return collectedInsights.has(target.value.id) ? "已记录芯片" : "记忆芯片";
  }
}

function getInteractionTargetIndicatorAccent(target: InteractionTarget): string {
  switch (target.type) {
    case "podium":
      return meetingState.active ? "#f4cf7d" : "#89d0ff";
    case "guide":
      return target.value.accent;
    case "terminal":
      if (target.value.kind === "external") {
        return isLedServiceTerminal(target.value) ? "#f4cf7d" : "#89d0ff";
      }
      return completedScenarios.has(target.value.scenario.id) ? "#8be08c" : target.value.department.accent;
    case "insight":
      return collectedInsights.has(target.value.id) ? "#8be08c" : "#ffde7a";
  }
}

function getInteractionTargetDiscoveryDistance(target: InteractionTarget): number {
  switch (target.type) {
    case "podium":
      return PODIUM_INTERACTION_DISTANCE * 2.8;
    case "guide":
      return GUIDE_INTERACTION_DISTANCE * 2.6;
    case "terminal":
      return target.value.kind === "external" && isLedServiceTerminal(target.value)
        ? LED_SERVICE_DISCOVERY_DISTANCE * 1.9
        : INTERACTION_DISTANCE * 2.8;
    case "insight":
      return INSIGHT_DISTANCE * 3.2;
  }
}

function getInteractionTargetIndicatorPriority(target: InteractionTarget, highlighted: boolean): number {
  const position = getInteractionTargetPosition(target);
  const discoveryDistance = getInteractionTargetDiscoveryDistance(target);
  const distance = Math.sqrt(distanceSquared(player, position));
  let priority = clamp(1 - distance / discoveryDistance, 0, 1) * 4;

  if (highlighted) {
    priority += 6;
  }

  switch (target.type) {
    case "podium":
      priority += 2.4;
      break;
    case "guide":
      priority += 1.4;
      break;
    case "terminal":
      priority += target.value.kind === "external" ? 1.8 : 1.2;
      if (target.value.kind === "external" && isLedServiceTerminal(target.value)) {
        priority += 1.3;
      }
      break;
    case "insight":
      priority += collectedInsights.has(target.value.id) ? 1 : 2;
      break;
  }

  return priority;
}

function shortenIndicatorTitle(title: string, maxChars: number): string {
  const chars = Array.from(title.trim());
  if (chars.length <= maxChars) {
    return title;
  }
  return `${chars.slice(0, maxChars).join("")}...`;
}

function collectOffscreenInteractionIndicators(transform: SurfaceDrawTransform): OffscreenInteractionIndicator[] {
  if (!shouldShowTaskPrompts()) {
    return [];
  }

  const promptTarget = getUiNavigationTarget();
  const followUpTarget = getUiNavigationFollowUpTarget();
  const strategicTarget = getStrategicNavigationTarget();
  const promptId = promptTarget ? getInteractionTargetId(promptTarget) : "";
  const followUpId = followUpTarget ? getInteractionTargetId(followUpTarget) : "";
  const strategicId = strategicTarget ? getInteractionTargetId(strategicTarget) : "";
  const candidates: InteractionTarget[] = [];

  if (promptTarget) {
    candidates.push(promptTarget);
  }
  if (followUpTarget) {
    candidates.push(followUpTarget);
  }
  candidates.push({ type: "podium", value: centralMeetingPodium });
  areaGuides.forEach((guide) => candidates.push({ type: "guide", value: guide }));
  terminals.forEach((terminal) => candidates.push({ type: "terminal", value: terminal }));
  insightNodes.forEach((node) => candidates.push({ type: "insight", value: node }));

  const seen = new Set<string>();
  const indicators: OffscreenInteractionIndicator[] = [];
  const visibilityPadding = isCompactViewport() ? 28 : 20;

  for (const target of candidates) {
    const id = getInteractionTargetId(target);
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const position = getInteractionTargetPosition(target);
    const discoveryDistance = getInteractionTargetDiscoveryDistance(target);
    const distance = Math.sqrt(distanceSquared(player, position));
    if (distance > discoveryDistance) {
      continue;
    }

    const anchor = worldToScreen(position.x, position.y);
    const anchorOnCanvas = surfacePointToCanvas(anchor, transform);
    if (
      anchorOnCanvas.x >= visibilityPadding &&
      anchorOnCanvas.x <= canvas.width - visibilityPadding &&
      anchorOnCanvas.y >= visibilityPadding &&
      anchorOnCanvas.y <= canvas.height - visibilityPadding
    ) {
      continue;
    }

    const highlighted = id === promptId || id === followUpId;
    const targetDepartment = getInteractionTargetDepartment(target);
    const sprintLabel = targetDepartment ? getDepartmentPendingWorkSummary(targetDepartment) : "";
    indicators.push({
      id,
      title: id === promptId && id === strategicId && sprintLabel
        ? `冲刺 ${targetDepartment?.shortName ?? getInteractionTargetIndicatorTitle(target)}`
      : id === promptId
        ? `目标 ${getInteractionTargetIndicatorTitle(target)}`
      : id === followUpId
        ? `后续 ${getInteractionTargetIndicatorTitle(target)}`
      : id === strategicId && sprintLabel
        ? `闭环 ${targetDepartment?.shortName ?? getInteractionTargetIndicatorTitle(target)}`
        : getInteractionTargetIndicatorTitle(target),
      accent: getInteractionTargetIndicatorAccent(target),
      anchor,
      distanceLabel: `${Math.max(1, Math.round(distance))}m`,
      priority: getInteractionTargetIndicatorPriority(target, highlighted) + (id === followUpId ? 1.2 : 0) + (id === strategicId ? 0.9 : 0),
      highlighted,
    });
  }

  return indicators
    .sort((left, right) => right.priority - left.priority)
    .slice(0, MAX_OFFSCREEN_INTERACTION_INDICATORS);
}

function shouldRenderMinimapInteractionMarker(target: InteractionTarget, highlighted: boolean): boolean {
  if (highlighted) {
    return true;
  }

  switch (target.type) {
    case "podium":
      return meetingState.active;
    case "guide":
      return true;
    case "terminal":
      return target.value.kind === "external" || !completedScenarios.has(target.value.scenario.id);
    case "insight":
      return !collectedInsights.has(target.value.id);
  }
}

function getInteractionTargetMinimapPriority(target: InteractionTarget, highlighted: boolean): number {
  let priority = getInteractionTargetIndicatorPriority(target, highlighted);

  switch (target.type) {
    case "podium":
      if (meetingState.active) {
        priority += 1.4;
      }
      break;
    case "guide":
      priority += 0.7;
      break;
    case "terminal":
      if (target.value.kind === "external") {
        priority += 1.1;
      } else if (!completedScenarios.has(target.value.scenario.id)) {
        priority += 0.8;
      }
      break;
    case "insight":
      if (!collectedInsights.has(target.value.id)) {
        priority += 1;
      }
      break;
  }

  return priority;
}

function collectMinimapInteractionMarkers(): MinimapInteractionMarker[] {
  const promptTarget = getNavigationTarget();
  const followUpTarget = getNavigationFollowUpTarget();
  const promptId = promptTarget ? getInteractionTargetId(promptTarget) : "";
  const followUpId = followUpTarget ? getInteractionTargetId(followUpTarget) : "";
  const candidates: InteractionTarget[] = [];

  if (promptTarget) {
    candidates.push(promptTarget);
  }
  if (followUpTarget) {
    candidates.push(followUpTarget);
  }
  candidates.push({ type: "podium", value: centralMeetingPodium });
  areaGuides.forEach((guide) => candidates.push({ type: "guide", value: guide }));
  terminals.forEach((terminal) => candidates.push({ type: "terminal", value: terminal }));
  insightNodes.forEach((node) => candidates.push({ type: "insight", value: node }));

  const seen = new Set<string>();
  const markers: MinimapInteractionMarker[] = [];

  for (const target of candidates) {
    const id = getInteractionTargetId(target);
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const highlighted = id === promptId || id === followUpId;
    if (!shouldRenderMinimapInteractionMarker(target, highlighted)) {
      continue;
    }

    const position = getInteractionTargetPosition(target);
    const revealDistance = getInteractionTargetDiscoveryDistance(target) * (
      target.type === "guide"
        ? 1.8
        : target.type === "insight"
          ? 1.7
          : target.type === "podium"
            ? 1.6
            : 1.45
    );
    if (!highlighted && distanceSquared(player, position) > revealDistance * revealDistance) {
      continue;
    }

    markers.push({
      id,
      target,
      accent: getInteractionTargetIndicatorAccent(target),
      priority: getInteractionTargetMinimapPriority(target, highlighted),
      highlighted,
    });
  }

  return markers
    .sort((left, right) => right.priority - left.priority)
    .slice(0, MAX_MINIMAP_INTERACTION_MARKERS);
}

function collectGroundInteractionMarkers(): GroundInteractionMarker[] {
  const promptTarget = getNavigationTarget();
  const followUpTarget = getNavigationFollowUpTarget();
  const markers: GroundInteractionMarker[] = [];
  const seen = new Set<string>();

  const pushMarker = (target: InteractionTarget, highlighted: boolean): void => {
    const id = getInteractionTargetId(target);
    if (seen.has(id)) {
      return;
    }
    seen.add(id);
    markers.push({
      id,
      target,
      accent: getInteractionTargetIndicatorAccent(target),
      highlighted,
    });
  };

  if (promptTarget) {
    pushMarker(promptTarget, true);
  }
  if (followUpTarget) {
    pushMarker(followUpTarget, false);
  }

  if (hoveredPodium) {
    pushMarker({ type: "podium", value: hoveredPodium }, false);
  }
  if (hoveredGuide) {
    pushMarker({ type: "guide", value: hoveredGuide }, false);
  }
  if (hoveredTerminal) {
    pushMarker({ type: "terminal", value: hoveredTerminal }, false);
  }
  if (hoveredInsight) {
    pushMarker({ type: "insight", value: hoveredInsight }, false);
  }

  const ledServiceTarget = getLedServiceBubbleTarget();
  if (ledServiceTarget) {
    pushMarker({ type: "terminal", value: ledServiceTarget }, false);
  }

  return markers.slice(0, MAX_GROUND_INTERACTION_MARKERS);
}

function getPromptTargetDepartment(): SceneDepartment | null {
  const target = getNavigationTarget();
  if (!target) {
    return null;
  }

  switch (target.type) {
    case "podium":
      return null;
    case "guide":
      return target.value.target.type === "department" ? target.value.target.department : null;
    case "terminal":
      return target.value.department;
    case "insight":
      return target.value.department;
  }
}

function getPromptTargetSharedZone(): SharedZone | null {
  const target = getNavigationTarget();
  if (!target || target.type !== "guide") {
    return null;
  }
  return target.value.target.type === "shared-zone" ? target.value.target.zone : null;
}

function isRecommendedNavigationTarget(target: InteractionTarget | null): boolean {
  if (!target) {
    return false;
  }
  const directPromptTarget = getPromptTarget();
  return (
    !directPromptTarget ||
    getInteractionTargetId(directPromptTarget) !== getInteractionTargetId(target)
  );
}

function getNavigationFocusRect(target: InteractionTarget | null): Rect | null {
  if (!target) {
    return null;
  }

  switch (target.type) {
    case "podium":
      return centralLoungeRect;
    case "guide":
      return target.value.target.type === "department"
        ? target.value.target.department.roomRect
        : target.value.target.zone.roomRect;
    case "terminal":
      return target.value.department.roomRect;
    case "insight":
      return target.value.department.roomRect;
  }
}

function getNavigationFocusCenter(target: InteractionTarget | null): Point | null {
  const focusRect = getNavigationFocusRect(target);
  return focusRect ? rectCenter(focusRect) : (target ? getInteractionTargetPosition(target) : null);
}

function getNavigationFocusSummary(target: InteractionTarget | null): {
  label: string;
  accent: string;
  pill: string;
} {
  if (!target) {
    return {
      label: pickUiText("中央办公区 · 全景视图", "Central Office · Panorama"),
      accent: "#7d8db3",
      pill: pickUiText("全景视图", "Panorama"),
    };
  }

  if (target.type === "podium") {
    return {
      label: pickUiText("中央会议区 · 舞台聚焦", "Central Meeting Zone · Stage Focus"),
      accent: getInteractionTargetIndicatorAccent(target),
      pill: pickUiText("舞台聚焦", "Stage Focus"),
    };
  }

  if (target.type === "guide" && target.value.target.type === "shared-zone") {
    return {
      label: pickUiText(
        `${getSharedZoneUiLabel(target.value.target.zone)} · 入口聚焦`,
        `${getSharedZoneUiLabel(target.value.target.zone)} · Entry Focus`
      ),
      accent: target.value.target.zone.accent,
      pill: pickUiText(
        `${getSharedZoneUiLabel(target.value.target.zone)} 入口`,
        `${getSharedZoneUiLabel(target.value.target.zone)} Entry`
      ),
    };
  }

  const targetDepartment = target.type === "guide" && target.value.target.type === "department"
    ? target.value.target.department
    : target.type === "terminal" || target.type === "insight"
      ? target.value.department
      : null;

  if (targetDepartment) {
    return {
      label: pickUiText(`${targetDepartment.shortName} · 房间聚焦`, `${targetDepartment.shortName} · Room Focus`),
      accent: targetDepartment.accent,
      pill: pickUiText(`${targetDepartment.shortName} 房间`, `${targetDepartment.shortName} Room`),
    };
  }

  return {
    label: pickUiText(
      `${getInteractionTargetIndicatorTitle(target)} · 目标聚焦`,
      `${getInteractionTargetIndicatorTitle(target)} · Target Focus`
    ),
    accent: getInteractionTargetIndicatorAccent(target),
    pill: pickUiText("目标聚焦", "Target Focus"),
  };
}

function getAreaRectByKey(areaKey: string): Rect | null {
  if (!areaKey) {
    return null;
  }

  if (areaKey === "podium:central") {
    return centralLoungeRect;
  }

  if (areaKey === "office:central") {
    return corridorRect;
  }

  if (areaKey.startsWith("department:")) {
    const departmentId = areaKey.slice("department:".length);
    return departments.find((department) => department.id === departmentId)?.roomRect ?? null;
  }

  if (areaKey.startsWith("shared-zone:")) {
    const zoneId = areaKey.slice("shared-zone:".length);
    return sharedZones.find((zone) => zone.id === zoneId)?.roomRect ?? null;
  }

  return null;
}

function getActiveAreaSummary(
  currentDepartment: SceneDepartment | null,
  currentSharedZone: SharedZone | null
): {
  areaKey: string;
  accent: string;
  label: string;
} {
  if (currentDepartment) {
    return {
      areaKey: `department:${currentDepartment.id}`,
      accent: currentDepartment.accent,
      label: pickUiText(`${currentDepartment.shortName} · 当前区域`, `${currentDepartment.shortName} · Current Zone`),
    };
  }

  if (currentSharedZone) {
    return {
      areaKey: `shared-zone:${currentSharedZone.id}`,
      accent: currentSharedZone.accent,
      label: pickUiText(`${getSharedZoneUiLabel(currentSharedZone)} · 当前区域`, `${getSharedZoneUiLabel(currentSharedZone)} · Current Zone`),
    };
  }

  return {
    areaKey: "office:central",
    accent: "#7d8db3",
    label: pickUiText("中央办公区 · 当前区域", "Central Office · Current Zone"),
  };
}

function syncAreaTransitionState(
  state: AreaTransitionState,
  nextAreaKey: string,
  accent: string,
  label: string,
  triggerStrength = 1
): void {
  if (!state.areaKey) {
    state.areaKey = nextAreaKey;
    state.accent = accent;
    state.label = label;
    return;
  }

  if (state.areaKey !== nextAreaKey) {
    state.areaKey = nextAreaKey;
    state.accent = accent;
    state.label = label;
    state.pulse = triggerStrength;
    return;
  }

  state.accent = accent;
  state.label = label;
}

function getNavigationFollowUpTarget(): InteractionTarget | null {
  const directPromptTarget = getPromptTarget();
  const strategicTarget = getStrategicNavigationTarget();
  if (!directPromptTarget || !strategicTarget) {
    return null;
  }

  if (getInteractionTargetId(directPromptTarget) === getInteractionTargetId(strategicTarget)) {
    return null;
  }

  if (getInteractionTargetAreaKey(directPromptTarget) === getInteractionTargetAreaKey(strategicTarget)) {
    return null;
  }

  return strategicTarget;
}

function getMeetingConversationActors(): {
  currentSpeaker: NpcActor | null;
  pendingQuestioner: NpcActor | null;
  pendingResponder: NpcActor | null;
} {
  const currentSpeaker = meetingState.currentSpeakerId
    ? npcs.find((npc) => npc.id === meetingState.currentSpeakerId) ?? null
    : null;
  const pendingQuestioner = meetingState.pendingQuestionerId
    ? npcs.find((npc) => npc.id === meetingState.pendingQuestionerId) ?? null
    : null;
  const pendingResponder = meetingState.pendingResponderId
    ? npcs.find((npc) => npc.id === meetingState.pendingResponderId) ?? null
    : null;

  return { currentSpeaker, pendingQuestioner, pendingResponder };
}

function getMeetingDiscussionSummary(): {
  round: number;
  stageCode: string;
  stageLabel: string;
  detail: string;
  progress: number;
  accent: string;
  pill: string;
} {
  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const seatedCount = getMeetingSeatedCount();
  const seatRatio = seatedCount / Math.max(1, npcs.length);
  const round = Math.max(1, Math.floor((meetingState.discussionTurn + (pendingQuestioner && pendingResponder ? 1 : 0)) / 2));
  const readyProgress = meetingState.phaseDuration > 0
    ? clamp(1 - meetingState.discussionCooldown / Math.max(0.1, meetingState.phaseDuration), 0, 1)
    : 0;

  if (!meetingState.active) {
    return {
      round: 0,
      stageCode: "IDLE",
      stageLabel: pickUiText("未开启", "Idle"),
      detail: pickUiText("中央会议区待机中", "Central meeting zone standing by"),
      progress: 0,
      accent: "#7d8db3",
      pill: pickUiText("会议待机", "Meeting Idle"),
    };
  }

  if (seatedCount < npcs.length) {
    return {
      round,
      stageCode: "SEAT",
      stageLabel: pickUiText("入座", "Seating"),
      detail: pickUiText(`${seatedCount}/${npcs.length} 已入座`, `${seatedCount}/${npcs.length} seated`),
      progress: seatRatio,
      accent: "#f4cf7d",
      pill: pickUiText(`入座 ${seatedCount}/${npcs.length}`, `Seat ${seatedCount}/${npcs.length}`),
    };
  }

  if (meetingState.phaseKind === "ask" && currentSpeaker) {
    return {
      round,
      stageCode: "ASK",
      stageLabel: pickUiText("提问", "Ask"),
      detail: pendingResponder
        ? `${trimSpeechSegment(currentSpeaker.name, 4)} -> ${trimSpeechSegment(pendingResponder.name, 4)}`
        : pickUiText(
            `${trimSpeechSegment(currentSpeaker.name, 4)} 正在发问`,
            `${trimSpeechSegment(currentSpeaker.name, 4)} is asking`
          ),
      progress: meetingState.phaseDuration > 0
        ? clamp(1 - currentSpeaker.bubbleTimer / Math.max(0.1, meetingState.phaseDuration), 0, 1)
        : readyProgress,
      accent: "#ffd98b",
      pill: pickUiText(`第${round}轮 提问`, `R${round} Ask`),
    };
  }

  if (meetingState.phaseKind === "response" && currentSpeaker) {
    return {
      round,
      stageCode: "RESP",
      stageLabel: pickUiText("回应", "Response"),
      detail: pickUiText(
        `${trimSpeechSegment(currentSpeaker.name, 4)} 正在接力`,
        `${trimSpeechSegment(currentSpeaker.name, 4)} is replying`
      ),
      progress: meetingState.phaseDuration > 0
        ? clamp(1 - currentSpeaker.bubbleTimer / Math.max(0.1, meetingState.phaseDuration), 0, 1)
        : readyProgress,
      accent: "#f4cf7d",
      pill: pickUiText(`第${round}轮 回应`, `R${round} Reply`),
    };
  }

  if (meetingState.phaseKind === "ready" || (!currentSpeaker && meetingState.discussionCooldown > 0)) {
    return {
      round,
      stageCode: "READY",
      stageLabel: pickUiText("准备", "Ready"),
      detail: pendingQuestioner && pendingResponder
        ? pickUiText(
            `${trimSpeechSegment(pendingQuestioner.name, 4)} 等待 ${trimSpeechSegment(pendingResponder.name, 4)}`,
            `${trimSpeechSegment(pendingQuestioner.name, 4)} waiting for ${trimSpeechSegment(pendingResponder.name, 4)}`
          )
        : pickUiText("等待下一轮接力", "Waiting for the next handoff"),
      progress: readyProgress,
      accent: "#cddcff",
      pill: pickUiText(`第${round}轮 准备`, `R${round} Ready`),
    };
  }

  if (currentSpeaker) {
    return {
      round,
      stageCode: "LIVE",
      stageLabel: pickUiText("发言", "Speaking"),
      detail: pickUiText(
        `${trimSpeechSegment(currentSpeaker.name, 4)} 正在发言`,
        `${trimSpeechSegment(currentSpeaker.name, 4)} is speaking`
      ),
      progress: 0.5,
      accent: "#f4cf7d",
      pill: pickUiText(`第${round}轮 发言`, `R${round} Live`),
    };
  }

  return {
    round,
    stageCode: "QUEUE",
    stageLabel: pickUiText("待命", "Queued"),
    detail: pickUiText("等待下一轮接力", "Waiting for the next handoff"),
    progress: 0,
    accent: "#cddcff",
    pill: pickUiText(`第${round}轮 待命`, `R${round} Queue`),
  };
}

function getMeetingRoundNumber(stage: "ask" | "response"): number {
  return stage === "ask"
    ? Math.max(1, Math.floor(meetingState.discussionTurn / 2) + 1)
    : Math.max(1, Math.ceil(meetingState.discussionTurn / 2));
}

function pushMeetingTimelineEntry(entry: Omit<MeetingTimelineEntry, "id">): void {
  const timelineEntry: MeetingTimelineEntry = {
    ...entry,
    id: `${entry.round}:${entry.stage}:${entry.speakerName}:${entry.counterpartName}:${meetingState.recentTurns.length}`,
  };
  meetingState.recentTurns = [timelineEntry, ...meetingState.recentTurns].slice(0, 6);
}

function getRecentMeetingTimeline(limit = 4): MeetingTimelineEntry[] {
  return meetingState.recentTurns.slice(0, limit);
}

function getLatestMeetingTimelineEntry(): MeetingTimelineEntry | null {
  return meetingState.recentTurns[0] ?? null;
}

function getMeetingSpeakerCandidates(limit = 3): NpcActor[] {
  const participants = getMeetingParticipants();
  if (participants.length === 0) {
    return [];
  }

  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  return participants
    .filter((npc) =>
      npc.id !== currentSpeaker?.id &&
      npc.id !== pendingQuestioner?.id &&
      npc.id !== pendingResponder?.id
    )
    .sort((left, right) => {
      const leftScore =
        (left.id !== meetingState.lastSpeakerId ? 2 : 0) +
        (left.department.id !== currentSpeaker?.department.id ? 1.2 : 0) +
        (left.meetingSeat.group === "upper" ? 0.3 : 0) -
        left.meetingSeat.position.x * 0.001;
      const rightScore =
        (right.id !== meetingState.lastSpeakerId ? 2 : 0) +
        (right.department.id !== currentSpeaker?.department.id ? 1.2 : 0) +
        (right.meetingSeat.group === "upper" ? 0.3 : 0) -
        right.meetingSeat.position.x * 0.001;
      return rightScore - leftScore;
    })
    .slice(0, limit);
}

function getMeetingCandidateSummary(limit = 3): string {
  const candidates = getMeetingSpeakerCandidates(limit);
  if (candidates.length === 0) {
    return pickUiText("等待候选人", "Waiting candidates");
  }
  return candidates
    .map((npc, index) => `${index + 1}.${trimSpeechSegment(npc.name, 3)}`)
    .join(" / ");
}

function triggerMeetingStageCue(
  title: string,
  detail: string,
  accent: string,
  phaseKind: MeetingStageCueState["phaseKind"],
  speakerId = "",
  counterpartId = ""
): void {
  meetingStageCueState.pulse = 1;
  meetingStageCueState.accent = accent;
  meetingStageCueState.phaseKind = phaseKind;
  meetingStageCueState.title = title;
  meetingStageCueState.detail = detail;
  meetingStageCueState.speakerId = speakerId;
  meetingStageCueState.counterpartId = counterpartId;
}

function getMeetingStageCueActors(): { speaker: NpcActor | null; counterpart: NpcActor | null } {
  return {
    speaker: meetingStageCueState.speakerId
      ? npcs.find((npc) => npc.id === meetingStageCueState.speakerId) ?? null
      : null,
    counterpart: meetingStageCueState.counterpartId
      ? npcs.find((npc) => npc.id === meetingStageCueState.counterpartId) ?? null
      : null,
  };
}

function triggerGoalRelayTransition(fromTarget: InteractionTarget): void {
  const nextTarget = getStrategicNavigationTarget();
  if (!nextTarget || getInteractionTargetId(nextTarget) === getInteractionTargetId(fromTarget)) {
    goalRelayState.pulse = 0;
    goalRelayState.fromTarget = fromTarget;
    goalRelayState.toTarget = null;
    goalRelayState.headline = "";
    goalRelayState.detail = "";
    return;
  }

  const sameArea = getInteractionTargetAreaKey(fromTarget) === getInteractionTargetAreaKey(nextTarget);
  const fromTitle = getInteractionTargetIndicatorTitle(fromTarget);
  const toTitle = getInteractionTargetIndicatorTitle(nextTarget);
  goalRelayState.pulse = 1;
  goalRelayState.fromTarget = fromTarget;
  goalRelayState.toTarget = nextTarget;
  goalRelayState.fromAccent = getInteractionTargetIndicatorAccent(fromTarget);
  goalRelayState.toAccent = getInteractionTargetIndicatorAccent(nextTarget);
  goalRelayState.headline = sameArea
    ? pickUiText("本区继续接管", "Same-Zone Handoff")
    : pickUiText("下一站已接管", "Next Target Handoff");
  goalRelayState.detail = sameArea
    ? pickUiText(`${fromTitle} 完成，继续 ${toTitle}`, `${fromTitle} done, continue to ${toTitle}`)
    : pickUiText(`${fromTitle} 完成，切到 ${toTitle}`, `${fromTitle} done, switch to ${toTitle}`);
}

function getNavigationTargetShortLabel(target: InteractionTarget | null, maxChars = 8): string {
  if (!target) {
    return pickUiText("空闲", "Idle");
  }
  return trimSpeechSegment(getInteractionTargetIndicatorTitle(target), maxChars);
}

function getNavigationFocusImmersionStrength(target: InteractionTarget | null): number {
  const focusRect = getNavigationFocusRect(target);
  const focusCenter = getNavigationFocusCenter(target);
  if (!focusCenter) {
    return 0;
  }

  const distance = Math.hypot(focusCenter.x - player.x, focusCenter.y - player.y);
  const distanceRatio = clamp(1 - distance / 220, 0, 1);
  let strength = distanceRatio;

  if (focusRect && pointInRect(player, focusRect)) {
    strength += 0.42;
  }
  if (target?.type === "podium" && meetingState.active) {
    strength += 0.16;
  }
  if (isRecommendedNavigationTarget(target)) {
    strength += 0.06;
  }

  return clamp(strength, 0, 1);
}

function getPromptTargetChipLabel(target: InteractionTarget): string {
  if (isEnglishUi()) {
    switch (target.type) {
      case "podium":
        return "Meeting";
      case "guide":
        return target.value.target.type === "shared-zone" ? "Guide" : "Dept";
      case "terminal":
        return target.value.kind === "external" ? "Gate" : "Scene";
      case "insight":
        return "Insight";
    }
  }

  switch (target.type) {
    case "podium":
      return "会议";
    case "guide":
      return target.value.target.type === "shared-zone" ? "导览" : "部门";
    case "terminal":
      return target.value.kind === "external" ? "终端" : "场景";
    case "insight":
      return "洞察";
  }
}

function getInteractionTargetAreaLabel(target: InteractionTarget): string {
  if (isEnglishUi()) {
    switch (target.type) {
      case "podium":
        return "Central Meeting Zone";
      case "guide":
        return target.value.target.type === "department"
          ? `${getDepartmentUiLabel(target.value.target.department)} Guide`
          : `${getSharedZoneUiLabel(target.value.target.zone)} Guide`;
      case "terminal":
        return target.value.kind === "external"
          ? `${getDepartmentUiLabel(target.value.department)} External`
          : `${getDepartmentUiLabel(target.value.department)} Terminal`;
      case "insight":
        return `${getDepartmentUiLabel(target.value.department)} Insight`;
    }
  }

  switch (target.type) {
    case "podium":
      return "中央会议区";
    case "guide":
      return target.value.target.type === "department"
        ? `${getDepartmentUiLabel(target.value.target.department)} 导览`
        : `${getSharedZoneUiLabel(target.value.target.zone)} 导览`;
    case "terminal":
      return target.value.kind === "external"
        ? `${getDepartmentUiLabel(target.value.department)} 外部入口`
        : `${getDepartmentUiLabel(target.value.department)} 终端`;
    case "insight":
      return `${getDepartmentUiLabel(target.value.department)} 洞察`;
  }
}

function getInteractionTargetStatusLabel(target: InteractionTarget): string {
  if (isEnglishUi()) {
    switch (target.type) {
      case "podium":
        return meetingState.active ? "Live" : "Idle";
      case "guide":
        return target.value.target.type === "department" ? "Department Guide" : "Shared Guide";
      case "terminal":
        if (target.value.kind === "external") {
          return isLedServiceTerminal(target.value) ? "Priority Gate" : "Web Terminal";
        }
        return completedScenarios.has(target.value.scenario.id) ? "Completed" : "Ready";
      case "insight":
        return collectedInsights.has(target.value.id) ? "Captured" : "Available";
    }
  }

  switch (target.type) {
    case "podium":
      return meetingState.active ? "会议中" : "待开始";
    case "guide":
      return target.value.target.type === "department" ? "部门导览" : "公共区导览";
    case "terminal":
      if (target.value.kind === "external") {
        return isLedServiceTerminal(target.value) ? "重点入口" : "网页终端";
      }
      return completedScenarios.has(target.value.scenario.id) ? "已执行" : "可执行";
    case "insight":
      return collectedInsights.has(target.value.id) ? "已记录" : "可记录";
  }
}

function getInteractionTargetActionLabel(target: InteractionTarget): string {
  if (isEnglishUi()) {
    switch (target.type) {
      case "podium":
        return meetingState.active
          ? (isTapInteractionMode() ? "Tap to dismiss meeting" : "Press E to dismiss meeting")
          : (isTapInteractionMode() ? "Tap to gather all NPCs" : "Press E to gather all NPCs");
      case "guide":
        return isTapInteractionMode() ? "Tap to open full guide" : "Press E to open full guide";
      case "terminal":
        if (target.value.kind === "external") {
          return isTapInteractionMode() ? "Tap to open site" : "Press E to open site";
        }
        return completedScenarios.has(target.value.scenario.id)
          ? (isTapInteractionMode() ? "Tap to review scene" : "Press E to review scene")
          : (isTapInteractionMode() ? "Tap to start demo" : "Press E to start demo");
      case "insight":
        return collectedInsights.has(target.value.id)
          ? (isTapInteractionMode() ? "Tap to review insight" : "Press F to review insight")
          : (isTapInteractionMode() ? "Tap to save insight" : "Press F to save insight");
    }
  }

  switch (target.type) {
    case "podium":
      return meetingState.active
        ? (isTapInteractionMode() ? "点击解散会议" : "按 E 解散会议")
        : (isTapInteractionMode() ? "点击召集所有 NPC 入座" : "按 E 召集所有 NPC 入座");
    case "guide":
      return isTapInteractionMode() ? "点击查看完整导览" : "按 E 查看完整导览";
    case "terminal":
      if (target.value.kind === "external") {
        return isTapInteractionMode() ? "点击弹窗打开网站" : "按 E 弹窗打开网站";
      }
      return completedScenarios.has(target.value.scenario.id)
        ? (isTapInteractionMode() ? "点击继续查看" : "按 E 继续查看")
        : (isTapInteractionMode() ? "点击开始演示" : "按 E 开始演示");
    case "insight":
      return collectedInsights.has(target.value.id)
        ? (isTapInteractionMode() ? "点击复看洞察" : "按 F 复看洞察")
        : (isTapInteractionMode() ? "点击保存洞察" : "按 F 保存洞察");
  }
}

function isNpcInsideDepartment(npc: NpcActor, department: SceneDepartment): boolean {
  const point = { x: npc.x, y: npc.y };
  return (
    pointInRect(point, department.roomRect) ||
    pointInRect(point, department.walkwayRect) ||
    pointInRect(point, department.frontageRect)
  );
}

function getDepartmentOccupancy(department: SceneDepartment): number {
  return npcs.filter((npc) => npc.department.id === department.id && isNpcInsideDepartment(npc, department)).length;
}

function getDepartmentOccupancyRatio(department: SceneDepartment): number {
  return clamp(getDepartmentOccupancy(department) / Math.max(1, department.npcRoles.length), 0, 1);
}

function getDepartmentOccupancyLabel(department: SceneDepartment): string {
  return isEnglishUi()
    ? `On floor ${getDepartmentOccupancy(department)}/${department.npcRoles.length}`
    : `在位 ${getDepartmentOccupancy(department)}/${department.npcRoles.length}`;
}

function isPointInCorridorNetwork(point: Point): boolean {
  return (
    pointInRect(point, corridorRect) ||
    departmentConcourseRects.some((rect) => pointInRect(point, rect)) ||
    departments.some((department) =>
      pointInRect(point, department.walkwayRect) || pointInRect(point, department.frontageRect)
    ) ||
    sharedZones.some((zone) =>
      pointInRect(point, zone.walkwayRect) || pointInRect(point, zone.frontageRect)
    )
  );
}

function isNpcInsideSharedZone(npc: NpcActor, zone: SharedZone): boolean {
  const point = { x: npc.x, y: npc.y };
  return (
    pointInRect(point, zone.roomRect) ||
    pointInRect(point, zone.walkwayRect) ||
    pointInRect(point, zone.frontageRect)
  );
}

function getSharedZoneOccupancy(zone: SharedZone): number {
  return npcs.filter((npc) => npc.meetingStatus === "office" && isNpcInsideSharedZone(npc, zone)).length;
}

function getSharedZoneOccupancyRatio(zone: SharedZone): number {
  return clamp(getSharedZoneOccupancy(zone) / SHARED_ZONE_ACTIVE_CAPACITY, 0, 1);
}

function getSharedZoneOccupancyLabel(zone: SharedZone): string {
  const occupancy = getSharedZoneOccupancy(zone);
  return occupancy > 0
    ? (isEnglishUi() ? `Flow ${occupancy}` : `流动 ${occupancy}人`)
    : (isEnglishUi() ? "Quiet now" : "当前较安静");
}

function getDepartmentStateAccent(state: DepartmentVisualState): string {
  switch (state) {
    case "busy":
      return "#f4cf7d";
    case "online":
      return "#89d0ff";
    case "done":
      return "#8be08c";
    case "idle":
    default:
      return "#8f96ab";
  }
}

function getRouteListRenderKey(): string {
  const promptTarget = getNavigationTarget();
  return [
    Math.round(player.x / 6),
    Math.round(player.y / 6),
    activeDepartmentId,
    activeSharedZoneId,
    promptTarget ? getInteractionTargetId(promptTarget) : "",
    promptTargetDepartmentId,
    promptTargetSharedZoneId,
    meetingState.active ? "meeting" : "office",
    meetingState.currentSpeakerId,
    departments.map((department) => `${department.id}:${getDepartmentCompletion(department)}:${getDepartmentOccupancy(department)}`).join("|"),
    sharedZones.map((zone) => `${zone.id}:${getSharedZoneOccupancy(zone)}`).join("|"),
    npcs.filter((npc) => npc.meetingStatus === "office" && npc.action === "walking").length,
    departmentOutcomeFeed.map((record) => `${record.id}:${record.impactScore}`).join("|"),
  ].join(";");
}

function getTopActiveDepartment(): SceneDepartment | null {
  return [...departments].sort((left, right) => {
    const completionDelta = getDepartmentCompletion(right) - getDepartmentCompletion(left);
    if (completionDelta !== 0) {
      return completionDelta;
    }
    const occupancyDelta = getDepartmentOccupancy(right) - getDepartmentOccupancy(left);
    if (occupancyDelta !== 0) {
      return occupancyDelta;
    }
    if (left.id === activeDepartmentId) {
      return -1;
    }
    if (right.id === activeDepartmentId) {
      return 1;
    }
    return 0;
  })[0] ?? null;
}

function getTopSharedZone(): SharedZone | null {
  const ranked = [...sharedZones].sort((left, right) => {
    const occupancyDelta = getSharedZoneOccupancy(right) - getSharedZoneOccupancy(left);
    if (occupancyDelta !== 0) {
      return occupancyDelta;
    }
    if (left.id === activeSharedZoneId) {
      return -1;
    }
    if (right.id === activeSharedZoneId) {
      return 1;
    }
    return 0;
  })[0] ?? null;

  if (!ranked) {
    return null;
  }

  return getSharedZoneOccupancy(ranked) > 0 || ranked.id === activeSharedZoneId ? ranked : null;
}

function getMeetingSeatedCount(): number {
  return npcs.filter((npc) => npc.meetingStatus === "seated").length;
}

function getMeetingSeatProgressLabel(): string {
  return `${getMeetingSeatedCount()} / ${npcs.length}`;
}

function getOfficeTrafficSummary(): {
  label: string;
  accent: string;
  pill: string;
} {
  if (meetingState.active) {
    const seatedCount = getMeetingSeatedCount();
    const movingCount = npcs.filter(
      (npc) => npc.meetingStatus === "queued" || npc.meetingStatus === "walking-to-seat"
    ).length;
    return {
      label: movingCount > 0
        ? (isEnglishUi()
            ? `Meeting gathering · ${seatedCount}/${npcs.length} seated`
            : `会议收拢中 · ${seatedCount}/${npcs.length} 已入座`)
        : (isEnglishUi()
            ? `Meeting live · ${meetingState.currentSpeakerId ? "next speaker queued" : "awaiting next speaker"}`
            : `会议发言中 · ${meetingState.currentSpeakerId ? "下一位待命" : "等待下一位"}`),
      accent: "#f4cf7d",
      pill: isEnglishUi() ? `Meet ${seatedCount}/${npcs.length}` : `会议 ${seatedCount}/${npcs.length}`,
    };
  }

  const ambientSpeakers = npcs.filter((npc) => npc.meetingStatus === "office" && npc.bubbleTimer > 0).length;
  if (ambientSpeakers >= 2) {
    return {
      label: isEnglishUi()
        ? `Office chatter is syncing · ${ambientSpeakers} people active`
        : `办公室正在串联沟通 · ${ambientSpeakers} 人在同步`,
      accent: "#89d0ff",
      pill: isEnglishUi() ? `Talk ${ambientSpeakers}` : `沟通 ${ambientSpeakers}人`,
    };
  }

  const topSharedZone = getTopSharedZone();
  if (topSharedZone && getSharedZoneOccupancy(topSharedZone) >= 2) {
    return {
      label: isEnglishUi()
        ? `${topSharedZone.label} recharging · ${getSharedZoneOccupancy(topSharedZone)} in motion`
        : `${topSharedZone.label}补能中 · ${getSharedZoneOccupancy(topSharedZone)} 人在流动`,
      accent: topSharedZone.accent,
      pill: isEnglishUi()
        ? `${topSharedZone.label} ${getSharedZoneOccupancy(topSharedZone)}`
        : `${topSharedZone.label} ${getSharedZoneOccupancy(topSharedZone)}人`,
    };
  }

  const movingCount = npcs.filter((npc) => npc.meetingStatus === "office" && npc.action === "walking").length;
  const transitCount = npcs.filter(
    (npc) => npc.meetingStatus === "office" && isPointInCorridorNetwork({ x: npc.x, y: npc.y })
  ).length;
  if (movingCount >= 5 || transitCount >= 8) {
    return {
      label: isEnglishUi()
        ? `Hallway surge · ${movingCount} moving`
        : `走廊联动高峰 · ${movingCount} 人在移动`,
      accent: "#89d0ff",
      pill: isEnglishUi() ? `Hall ${movingCount}` : `走廊 ${movingCount}动`,
    };
  }

  const topDepartment = getTopActiveDepartment();
  if (topDepartment) {
    return {
      label: isEnglishUi()
        ? `${topDepartment.name} hottest · ${getDepartmentOccupancyLabel(topDepartment)}`
        : `${topDepartment.shortName}最活跃 · ${getDepartmentOccupancyLabel(topDepartment)}`,
      accent: topDepartment.accent,
      pill: isEnglishUi() ? `${topDepartment.name} hot` : `${topDepartment.shortName} 热点`,
    };
  }

  return {
    label: isEnglishUi() ? "Office flow is calm · shared zones are quiet" : "办公室节奏平稳 · 公共区较安静",
    accent: "#7d8db3",
    pill: isEnglishUi() ? "Calm flow" : "节奏平稳",
  };
}

function getCorridorTickerStatus(): {
  accent: string;
  headline: string;
  detail: string;
  signalCount: number;
} {
  const promptTarget = getUiNavigationTarget();
  const followUpTarget = getUiNavigationFollowUpTarget();
  const strategicDepartment = getUiStrategicDepartmentCandidate();
  const topDepartment = getTopActiveDepartment();
  const topSharedZone = getTopSharedZone();
  const trafficSummary = getOfficeTrafficSummary();
  const meetingSummary = getMeetingDiscussionSummary();
  const latestOutcome = getLatestDepartmentOutcomeRecord();

  if (meetingState.active) {
    return {
      accent: meetingSummary.accent,
      headline: `MEETING ${meetingSummary.stageCode}`,
      detail: `${meetingSummary.pill} · ${meetingSummary.detail}`,
      signalCount: 5,
    };
  }

  if (!shouldShowTaskPrompts()) {
    if (latestOutcome) {
      return {
        accent: latestOutcome.accent,
        headline: "RESULT WALL",
        detail: `${latestOutcome.title} · ${trimSpeechSegment(latestOutcome.highlights[0] ?? "结果已回流", 14)}`,
        signalCount: 4,
      };
    }

    if (topDepartment) {
      return {
        accent: topDepartment.accent,
        headline: "OFFICE FLOW",
        detail: `${topDepartment.shortName} · ${trimSpeechSegment(getDepartmentOccupancyLabel(topDepartment), 14)}`,
        signalCount: 4,
      };
    }

    if (topSharedZone && getSharedZoneOccupancy(topSharedZone) >= 2) {
      return {
        accent: topSharedZone.accent,
        headline: "SHARED ZONE",
        detail: `${getSharedZoneUiLabel(topSharedZone)} · ${getSharedZoneOccupancy(topSharedZone)} active`,
        signalCount: 3,
      };
    }

    return {
      accent: trafficSummary.accent,
      headline: "OFFICE FLOW",
      detail: trafficSummary.label,
      signalCount: 3,
    };
  }

  if (goalRelayState.pulse > 0.08 && goalRelayState.toTarget) {
    return {
      accent: goalRelayState.toAccent,
      headline: "TARGET HANDOFF",
      detail: goalRelayState.detail,
      signalCount: 5,
    };
  }

  if (departmentMilestoneState.pulse > 0.08) {
    return {
      accent: departmentMilestoneState.accent,
      headline: "CLOSED LOOP",
      detail: `${departmentMilestoneState.title} · Impact +${departmentMilestoneState.impactScore}`,
      signalCount: 5,
    };
  }

  if (promptTarget) {
    return {
      accent: getInteractionTargetIndicatorAccent(promptTarget),
      headline: isRecommendedNavigationTarget(promptTarget) ? "RECOMMENDED ROUTE" : "ACTIVE TARGET",
      detail: followUpTarget
        ? `${trimSpeechSegment(getInteractionTargetIndicatorTitle(promptTarget), 7)} → ${trimSpeechSegment(getInteractionTargetIndicatorTitle(followUpTarget), 7)}${strategicDepartment ? ` · ${trimSpeechSegment(getDepartmentPendingWorkSummary(strategicDepartment), 10)}` : ""}`
        : `${trimSpeechSegment(getInteractionTargetIndicatorTitle(promptTarget), 12)} · ${Math.max(1, Math.round(getInteractionTargetDistance(promptTarget)))}m`,
      signalCount: followUpTarget ? 5 : isRecommendedNavigationTarget(promptTarget) ? 4 : 5,
    };
  }

  if (latestOutcome) {
    return {
      accent: latestOutcome.accent,
      headline: "RESULT WALL",
      detail: `${latestOutcome.title} · ${trimSpeechSegment(latestOutcome.highlights[0] ?? "结果已回流", 14)}`,
      signalCount: 4,
    };
  }

  if (topSharedZone && getSharedZoneOccupancy(topSharedZone) >= 2) {
    return {
      accent: topSharedZone.accent,
      headline: "SHARED ZONE FLOW",
      detail: `${topSharedZone.label} · ${getSharedZoneOccupancyLabel(topSharedZone)}`,
      signalCount: 4,
    };
  }

  if (topDepartment) {
    return {
      accent: topDepartment.accent,
      headline: "HOTSPOT ROOM",
      detail: `${topDepartment.shortName} · ${getDepartmentOccupancyLabel(topDepartment)}`,
      signalCount: 3 + Math.round(getDepartmentOccupancyRatio(topDepartment) * 2),
    };
  }

  return {
    accent: trafficSummary.accent,
    headline: "OFFICE FLOW",
    detail: trafficSummary.label,
    signalCount: 3,
  };
}

function getHudStatusKey(): string {
  const promptTarget = getNavigationTarget();
  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const topDepartment = getTopActiveDepartment();
  const trafficSummary = getOfficeTrafficSummary();
  const focusSummary = getNavigationFocusSummary(promptTarget);
  const followUpTarget = getNavigationFollowUpTarget();
  const meetingSummary = getMeetingDiscussionSummary();
  const latestMeetingEntry = getLatestMeetingTimelineEntry();
  const latestOutcome = getLatestDepartmentOutcomeRecord();
  return [
    promptTarget ? getInteractionTargetId(promptTarget) : "",
    promptTarget ? Math.round(getInteractionTargetDistance(promptTarget)) : "",
    meetingState.active ? "meeting" : "office",
    currentSpeaker?.id ?? "",
    pendingQuestioner?.id ?? "",
    pendingResponder?.id ?? "",
    activeDepartmentId,
    activeSharedZoneId,
    topDepartment?.id ?? "",
    topDepartment ? getDepartmentOccupancy(topDepartment) : "",
    getMeetingSeatedCount(),
    completedScenarios.size,
    collectedInsights.size,
    trafficSummary.label,
    focusSummary.label,
    followUpTarget ? getInteractionTargetId(followUpTarget) : "",
    meetingSummary.pill,
    meetingSummary.detail,
    latestMeetingEntry?.id ?? "",
    latestMeetingEntry?.summary ?? "",
    latestOutcome?.id ?? "",
    latestOutcome?.impactScore ?? "",
    meetingStageCueState.title,
    meetingStageCueState.detail,
    meetingStageCueState.phaseKind,
    Math.round(meetingStageCueState.pulse * 10),
    goalRelayState.headline,
    goalRelayState.detail,
    Math.round(goalRelayState.pulse * 10),
    departmentMilestoneState.departmentId,
    Math.round(departmentMilestoneState.pulse * 10),
    getCompletedDepartmentCount(),
    navigationFocusTransition.areaKey,
    Math.round(navigationFocusTransition.pulse * 10),
    activeAreaTransition.areaKey,
    Math.round(activeAreaTransition.pulse * 10),
    focusArrivalTransition.areaKey,
    Math.round(focusArrivalTransition.pulse * 10),
  ].join(";");
}

function updateHudStatus(): void {
  const promptTarget = getUiNavigationTarget();
  const { pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const topDepartment = getTopActiveDepartment();
  const seatProgressLabel = getMeetingSeatProgressLabel();
  const trafficSummary = getOfficeTrafficSummary();
  const focusSummary = getNavigationFocusSummary(promptTarget);
  const isRecommendedTarget = shouldShowTaskPrompts() && isRecommendedNavigationTarget(promptTarget);
  const followUpTarget = getUiNavigationFollowUpTarget();
  const meetingSummary = getMeetingDiscussionSummary();
  const latestMeetingEntry = getLatestMeetingTimelineEntry();
  const meetingCandidates = getMeetingCandidateSummary(3);
  const completedDepartmentCount = getCompletedDepartmentCount();
  const latestOutcome = getLatestDepartmentOutcomeRecord();
  const recommendedPrefix = isEnglishUi() ? "Recommended " : "推荐 ";

  currentTargetElement.textContent = shouldShowTaskPrompts() && promptTarget
    ? `${isRecommendedTarget ? recommendedPrefix : ""}${getInteractionTargetIndicatorTitle(promptTarget)} · ${Math.max(1, Math.round(getInteractionTargetDistance(promptTarget)))}m`
    : getIdleTargetLabel();
  currentTargetElement.style.color = shouldShowTaskPrompts() && promptTarget ? getInteractionTargetIndicatorAccent(promptTarget) : "#f5f7ff";
  currentTargetElement.style.textShadow = shouldShowTaskPrompts() && promptTarget
    ? `0 0 14px ${withAlpha(getInteractionTargetIndicatorAccent(promptTarget), 0.24)}`
    : "";

  if (meetingState.active) {
    meetingStatusElement.textContent = `${meetingSummary.pill} · ${meetingSummary.detail}`;
    meetingStatusElement.style.color = meetingSummary.accent;
    meetingStatusElement.style.textShadow = `0 0 14px ${withAlpha(meetingSummary.accent, 0.24)}`;
  } else {
    meetingStatusElement.textContent = getInactiveMeetingLabel();
    meetingStatusElement.style.color = "#f5f7ff";
    meetingStatusElement.style.textShadow = "";
  }

  if (topDepartment) {
    hotspotDepartmentElement.textContent = `${getDepartmentUiLabel(topDepartment)} · ${getDepartmentStateLabel(getDepartmentVisualState(topDepartment))} · ${getDepartmentOccupancyLabel(topDepartment)}`;
    hotspotDepartmentElement.style.color = topDepartment.accent;
    hotspotDepartmentElement.style.textShadow = `0 0 14px ${withAlpha(topDepartment.accent, 0.22)}`;
  } else {
    hotspotDepartmentElement.textContent = getWaitingHotspotLabel();
    hotspotDepartmentElement.style.color = "#f5f7ff";
    hotspotDepartmentElement.style.textShadow = "";
  }

  meetingSeatProgressElement.textContent = meetingState.active
    ? `${seatProgressLabel} · ${meetingSummary.stageLabel} ${Math.round(meetingSummary.progress * 100)}%`
    : `${seatProgressLabel} · ${isEnglishUi() ? "Not seated" : "未入会"}`;
  meetingSeatProgressElement.style.color = meetingState.active ? meetingSummary.accent : "#f5f7ff";
  meetingSeatProgressElement.style.textShadow = meetingState.active
    ? `0 0 14px ${withAlpha(meetingSummary.accent, 0.22)}`
    : "";

  officeTrafficElement.textContent = trafficSummary.label;
  officeTrafficElement.style.color = trafficSummary.accent;
  officeTrafficElement.style.textShadow = `0 0 14px ${withAlpha(trafficSummary.accent, 0.2)}`;

  focusRoomElement.textContent = focusSummary.label;
  focusRoomElement.style.color = focusSummary.accent;
  focusRoomElement.style.textShadow = `0 0 14px ${withAlpha(focusSummary.accent, 0.2)}`;

  const chips = [
    shouldShowTaskPrompts()
      ? (promptTarget
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${getInteractionTargetIndicatorAccent(promptTarget)};">${isRecommendedTarget ? "推荐" : "目标"} ${getInteractionTargetIndicatorTitle(promptTarget)}</span>`
      : '<span class="map-legend-chip">目标 空闲</span>')
      : `<span class="map-legend-chip">${pickUiText("自由漫游", "Free Roam")}</span>`,
    meetingState.active
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${meetingSummary.accent};">${meetingSummary.pill}</span>`
      : '<span class="map-legend-chip">会议 未开启</span>',
    topDepartment
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${topDepartment.accent};">热点 ${topDepartment.shortName} ${shouldShowTaskPrompts() ? `${getDepartmentOccupancy(topDepartment)}/${topDepartment.npcRoles.length}` : getDepartmentStateLabel(getDepartmentVisualState(topDepartment))}</span>`
      : '<span class="map-legend-chip">热点 无</span>',
    `<span class="map-legend-chip ${meetingState.active ? "emphasized" : ""}" style="--chip-accent:${meetingSummary.accent};">席位 ${seatProgressLabel}</span>`,
    `<span class="map-legend-chip emphasized" style="--chip-accent:${trafficSummary.accent};">节奏 ${trafficSummary.pill}</span>`,
    `<span class="map-legend-chip emphasized" style="--chip-accent:${focusSummary.accent};">聚焦 ${focusSummary.pill}</span>`,
    shouldShowTaskPrompts() && followUpTarget
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${getInteractionTargetIndicatorAccent(followUpTarget)};">后续 ${shortenIndicatorTitle(getInteractionTargetIndicatorTitle(followUpTarget), 8)}</span>`
      : "",
    shouldShowTaskPrompts() && pendingQuestioner && pendingResponder
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:#f4cf7d;">接力 ${trimSpeechSegment(pendingQuestioner.name, 4)}→${trimSpeechSegment(pendingResponder.name, 4)}</span>`
      : "",
    meetingState.active
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${meetingSummary.accent};">候选 ${meetingCandidates}</span>`
      : "",
    meetingStageCueState.pulse > 0.08
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${meetingStageCueState.accent};">切镜 ${shortenIndicatorTitle(meetingStageCueState.detail, 10)}</span>`
      : "",
    latestOutcome
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${latestOutcome.accent};">成果 ${latestOutcome.title} +${latestOutcome.impactScore}</span>`
      : "",
    latestMeetingEntry
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${latestMeetingEntry.accent};">${latestMeetingEntry.stage === "ask" ? "提问" : "回应"} ${trimSpeechSegment(latestMeetingEntry.speakerName, 4)}→${trimSpeechSegment(latestMeetingEntry.counterpartName, 4)}</span>`
      : "",
    shouldShowTaskPrompts() && goalRelayState.pulse > 0.08 && goalRelayState.toTarget
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${goalRelayState.toAccent};">${goalRelayState.headline} ${shortenIndicatorTitle(getInteractionTargetIndicatorTitle(goalRelayState.toTarget), 8)}</span>`
      : "",
    departmentMilestoneState.pulse > 0.08
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${departmentMilestoneState.accent};">闭环 ${shortenIndicatorTitle(departmentMilestoneState.title, 8)}</span>`
      : "",
    navigationFocusTransition.pulse > 0.08
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${navigationFocusTransition.accent};">切换 ${shortenIndicatorTitle(navigationFocusTransition.label, 8)}</span>`
      : "",
    activeAreaTransition.pulse > 0.08
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${activeAreaTransition.accent};">进入 ${shortenIndicatorTitle(activeAreaTransition.label, 8)}</span>`
      : "",
    focusArrivalTransition.pulse > 0.08
      ? `<span class="map-legend-chip emphasized" style="--chip-accent:${focusArrivalTransition.accent};">到达 ${shortenIndicatorTitle(focusArrivalTransition.label, 8)}</span>`
      : "",
    `<span class="map-legend-chip">闭环 ${completedDepartmentCount}/${departments.length}</span>`,
    `<span class="map-legend-chip">进度 ${completedScenarios.size}/${allScenarios.length}</span>`,
    `<span class="map-legend-chip">洞察 ${collectedInsights.size}</span>`,
  ].filter(Boolean);
  mapLegend.innerHTML = translateRuntimeMarkup(chips.join(""));
  lastHudStatusKey = getHudStatusKey();
}

function updateMapHint(): void {
  if (!shouldShowTaskPrompts()) {
    const latestOutcome = getLatestDepartmentOutcomeRecord();
    mapHint.style.color = "";
    mapHint.textContent = latestOutcome
      ? pickUiText(
          `自由漫游中，可点击任一部门或公共区快速切换。最近成果：${latestOutcome.title} · ${latestOutcome.highlights[0] ?? "成果已回流"}。`,
          `Free roam is active. Click any department or shared zone to jump quickly. Latest result: ${latestOutcome.title} · ${latestOutcome.highlights[0] ?? "result synced back"}.`
        )
      : pickUiText(
          "自由漫游中，可点击任一部门或公共区快速切换，白色箭头表示你当前所在位置和面向。",
          "Free roam is active. Click any department or shared zone to jump quickly. The white arrow shows your current position and facing."
        );
    return;
  }

  const promptTarget = getPromptTarget();
  const target = promptTarget ?? getStrategicNavigationTarget();
  const followUpTarget = getNavigationFollowUpTarget();
  const strategicDepartment = getStrategicDepartmentCandidate();
  const meetingSummary = getMeetingDiscussionSummary();
  const meetingCandidates = getMeetingCandidateSummary(3);
  const latestOutcome = getLatestDepartmentOutcomeRecord();
  if (departmentMilestoneState.pulse > 0.08) {
    mapHint.style.color = departmentMilestoneState.accent;
    mapHint.textContent = pickUiText(
      `${departmentMilestoneState.title}：${departmentMilestoneState.detail}，路线将继续接管到下一个重点部门。`,
      `${departmentMilestoneState.title}: ${departmentMilestoneState.detail}. The route will keep handing off to the next priority department.`
    );
    return;
  }
  if (goalRelayState.pulse > 0.08 && goalRelayState.toTarget) {
    mapHint.style.color = goalRelayState.toAccent;
    mapHint.textContent = pickUiText(
      `${goalRelayState.headline}：${goalRelayState.detail}，导航箭头、房间聚焦和 minimap 已自动切到新目标。`,
      `${goalRelayState.headline}: ${goalRelayState.detail}. The navigation arrow, room focus, and minimap have already switched to the new target.`
    );
    return;
  }
  if (meetingState.active && meetingStageCueState.pulse > 0.08 && target?.type === "podium") {
    mapHint.style.color = meetingStageCueState.accent;
    mapHint.textContent = pickUiText(
      `${meetingStageCueState.title}：${meetingStageCueState.detail}，轮盘和 minimap 会同步提亮候选位。`,
      `${meetingStageCueState.title}: ${meetingStageCueState.detail}. The minimap highlights the candidate seats as well.`
    );
    return;
  }
  if (!target) {
    mapHint.textContent = latestOutcome
      ? pickUiText(
          `最近闭环：${latestOutcome.title} 已完成，${latestOutcome.highlights[0] ?? "成果已回流"}。点击工位或公共区可继续推进下一站。`,
          `Latest closed loop: ${latestOutcome.title} is done, ${latestOutcome.highlights[0] ?? "result synced back"}. Click a desk or shared zone to continue to the next stop.`
        )
      : pickUiText(
          "点击工位或公共区可快速跳转，白色箭头表示你当前所在位置和面向。",
          "Click any desk or shared zone to jump quickly. The white arrow shows your current position and facing."
        );
    mapHint.style.color = "";
    return;
  }

  const accent = getInteractionTargetIndicatorAccent(target);
  const strategicPrefix = promptTarget ? "" : pickUiText("当前推荐：", "Recommended: ");
  const arrivedAtTarget = focusArrivalTransition.pulse > 0.08 &&
    focusArrivalTransition.areaKey === getInteractionTargetAreaKey(target);
  const followUpHint = followUpTarget
    ? pickUiText(`，之后建议去 ${getNavigationTargetShortLabel(followUpTarget, 6)}`, ` Then go to ${getNavigationTargetShortLabel(followUpTarget, 6)}`)
    : "";
  const departmentSprintHint = strategicDepartment
    ? pickUiText(
        `，当前闭环冲刺是 ${strategicDepartment.shortName}：${getDepartmentPendingWorkSummary(strategicDepartment)}`,
        ` Current closed-loop sprint: ${strategicDepartment.shortName} · ${getDepartmentPendingWorkSummary(strategicDepartment)}`
      )
    : "";
  mapHint.style.color = accent;
  if (target.type === "guide") {
    mapHint.textContent = pickUiText(
      `${strategicPrefix}${arrivedAtTarget ? "你已进入目标房间，" : ""}跟着主角周围的导航箭头和门口高亮走，接近小龙虾后可打开完整导览${followUpHint}${departmentSprintHint}。`,
      `${strategicPrefix}${arrivedAtTarget ? "You are already in the target room. " : ""}Follow the navigation arrow around the player and the doorway highlight. When you reach the lobster, open the full guide.${followUpHint}${departmentSprintHint}.`
    );
    return;
  }
  if (target.type === "podium") {
    mapHint.textContent = meetingState.active
      ? pickUiText(
          `${strategicPrefix}${arrivedAtTarget ? "你已进入会议焦点区，" : ""}会议正在进行中，第 ${meetingSummary.round} 轮 ${meetingSummary.stageLabel} 已进入 ${meetingSummary.detail}，候选队列 ${meetingCandidates}，地图路径和舞台高亮会持续指向演讲台。`,
          `${strategicPrefix}${arrivedAtTarget ? "You are inside the meeting focus zone. " : ""}The meeting is live. Round ${meetingSummary.round} is in ${meetingSummary.stageLabel.toLowerCase()} mode with ${meetingSummary.detail}. Candidate queue: ${meetingCandidates}. The route and stage highlight will keep pointing at the podium.`
        )
      : pickUiText(
          `${strategicPrefix}当前目标是中央演讲台，靠近后可直接召集会议。`,
          `${strategicPrefix}The current target is the central podium. Move close to gather the meeting.`
        );
    return;
  }
  if (target.type === "terminal") {
    mapHint.textContent = target.value.kind === "external"
      ? pickUiText(
          `${strategicPrefix}${arrivedAtTarget ? "你已进入终端房间，" : ""}导航箭头和房间聚焦会带你去外部终端入口，靠近后可直接弹窗打开站点${followUpTarget ? `，下一站是 ${getNavigationTargetShortLabel(followUpTarget, 6)}` : ""}${strategicDepartment ? `，当前闭环冲刺 ${strategicDepartment.shortName} 还差 ${getDepartmentPendingWorkSummary(strategicDepartment).replace("还差 ", "")}` : ""}。`,
          `${strategicPrefix}${arrivedAtTarget ? "You are inside the terminal room. " : ""}The navigation arrow and room focus will take you to the external terminal. Move close to open the site.${followUpTarget ? ` Next stop: ${getNavigationTargetShortLabel(followUpTarget, 6)}.` : ""}${strategicDepartment ? ` Sprint status for ${strategicDepartment.shortName}: ${getDepartmentPendingWorkSummary(strategicDepartment)}.` : ""}`
        )
      : pickUiText(
          `${strategicPrefix}${arrivedAtTarget ? "你已进入当前场景房间，" : ""}导航箭头和房间聚焦会指向当前场景终端，靠近后可继续执行或复看场景${followUpTarget ? `，完成后建议去 ${getNavigationTargetShortLabel(followUpTarget, 6)}` : ""}${strategicDepartment ? `，当前闭环冲刺 ${strategicDepartment.shortName}：${getDepartmentPendingWorkSummary(strategicDepartment)}` : ""}。`,
          `${strategicPrefix}${arrivedAtTarget ? "You are inside the scene room. " : ""}The navigation arrow and room focus point to the current scene terminal. Move close to run or replay the scene.${followUpTarget ? ` Suggested next stop: ${getNavigationTargetShortLabel(followUpTarget, 6)}.` : ""}${strategicDepartment ? ` Sprint status for ${strategicDepartment.shortName}: ${getDepartmentPendingWorkSummary(strategicDepartment)}.` : ""}`
        );
    return;
  }
  mapHint.textContent = pickUiText(
    `${strategicPrefix}${arrivedAtTarget ? "你已进入目标部门，" : ""}导航箭头和房间聚焦会引导你靠近记忆芯片，靠近后可记录或复看洞察${followUpTarget ? `，然后去 ${getNavigationTargetShortLabel(followUpTarget, 6)}` : ""}${strategicDepartment ? `，当前闭环冲刺 ${strategicDepartment.shortName}：${getDepartmentPendingWorkSummary(strategicDepartment)}` : ""}。`,
    `${strategicPrefix}${arrivedAtTarget ? "You are inside the target department. " : ""}The navigation arrow and room focus guide you to the insight chip. Move close to save or review the insight.${followUpTarget ? ` Then head to ${getNavigationTargetShortLabel(followUpTarget, 6)}.` : ""}${strategicDepartment ? ` Sprint status for ${strategicDepartment.shortName}: ${getDepartmentPendingWorkSummary(strategicDepartment)}.` : ""}`
  );
}

function updatePrompt(): void {
  if (!shouldShowTaskPrompts()) {
    prompt.classList.add("hidden");
    prompt.style.removeProperty("--prompt-accent");
    prompt.style.removeProperty("--prompt-accent-soft");
    prompt.style.removeProperty("--prompt-accent-glow");
    lastPromptKey = "";
    updateMapHint();
    return;
  }

  const target = getPromptTarget();
  const followUpTarget = getNavigationFollowUpTarget();
  const { pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const meetingSummary = getMeetingDiscussionSummary();
  const meetingCandidates = getMeetingCandidateSummary(3);
  if (!target || !modal.classList.contains("hidden")) {
    prompt.classList.add("hidden");
    prompt.style.removeProperty("--prompt-accent");
    prompt.style.removeProperty("--prompt-accent-soft");
    prompt.style.removeProperty("--prompt-accent-glow");
    updateMapHint();
    lastPromptKey = "";
    return;
  }

  const promptAccent = getInteractionTargetIndicatorAccent(target);
  const distanceLabel = `${Math.max(1, Math.round(Math.sqrt(distanceSquared(player, getInteractionTargetPosition(target)))))}m`;
  const arrivedAtTarget = focusArrivalTransition.pulse > 0.08 &&
    focusArrivalTransition.areaKey === getInteractionTargetAreaKey(target);
  const metaMarkup = `
    <div class="prompt-meta">
      <span class="prompt-pill">${getInteractionTargetStatusLabel(target)}</span>
      <span class="prompt-pill">${getInteractionTargetAreaLabel(target)}</span>
      ${followUpTarget ? `<span class="prompt-pill">${pickUiText("后续", "Next")} ${getNavigationTargetShortLabel(followUpTarget, 6)}</span>` : ""}
      ${goalRelayState.pulse > 0.08 && goalRelayState.toTarget ? `<span class="prompt-pill">${pickUiText("接管", "Handoff")} ${getNavigationTargetShortLabel(goalRelayState.toTarget, 6)}</span>` : ""}
      ${departmentMilestoneState.pulse > 0.08 ? `<span class="prompt-pill">${pickUiText("闭环", "Loop")} ${shortenIndicatorTitle(departmentMilestoneState.title, 6)}</span>` : ""}
      ${arrivedAtTarget ? `<span class="prompt-pill">${pickUiText("已进入", "Entered")}</span>` : ""}
      ${target.type === "podium" && meetingState.active
        ? `<span class="prompt-pill">${pickUiText(`第${meetingSummary.round}轮 ${meetingSummary.stageLabel}`, `R${meetingSummary.round} ${meetingSummary.stageLabel}`)}</span>`
        : ""}
      ${target.type === "podium" && meetingStageCueState.pulse > 0.08
        ? `<span class="prompt-pill">${meetingStageCueState.title}</span>`
        : ""}
      ${target.type === "podium" && meetingState.active
        ? `<span class="prompt-pill">${pickUiText("候选", "Candidates")} ${meetingCandidates}</span>`
        : ""}
      ${pendingQuestioner && pendingResponder && target.type === "podium"
        ? `<span class="prompt-pill">${pickUiText("接力", "Relay")} ${trimSpeechSegment(pendingQuestioner.name, 4)}→${trimSpeechSegment(pendingResponder.name, 4)}</span>`
        : ""}
    </div>
  `;
  let promptMarkup = "";
  let promptKey = "";
  if (target.type === "podium") {
    const detail = meetingState.active
      ? pickUiText(`状态：${meetingSummary.pill} · ${meetingSummary.detail}`, `Status: ${meetingSummary.pill} · ${meetingSummary.detail}`)
      : pickUiText("状态：待开始", "Status: Ready");
    const action = meetingState.active
      ? (isTapInteractionMode() ? "点击解散会议" : "按 E 解散会议")
      : (isTapInteractionMode() ? "点击召集所有 NPC 入座" : "按 E 召集所有 NPC 入座");
    promptKey = `podium:${meetingState.active ? "active" : "idle"}:${distanceLabel}:${meetingStageCueState.phaseKind}:${meetingStageCueState.detail}:${Math.round(meetingStageCueState.pulse * 10)}`;
    promptMarkup = `
      <div class="prompt-head">
        <span class="prompt-chip">${getPromptTargetChipLabel(target)}</span>
        <strong>${pickUiText("中央会议区 · 演讲台", "Central Meeting Zone · Podium")}</strong>
        <span class="prompt-distance">${distanceLabel}</span>
      </div>
      ${metaMarkup}
      <div class="prompt-detail">${detail}</div>
      ${meetingState.active && meetingStageCueState.pulse > 0.08
        ? `<div class="prompt-detail">${pickUiText("切镜：", "Focus: ")}${meetingStageCueState.detail}</div>`
        : ""}
      <div class="prompt-action">${action}</div>
    `;
  } else if (target.type === "guide") {
    const action = isTapInteractionMode() ? "点击查看完整导览" : "按 E 查看完整导览";
    promptKey = `guide:${target.value.id}:${distanceLabel}`;
    promptMarkup = `
      <div class="prompt-head">
        <span class="prompt-chip">${getPromptTargetChipLabel(target)}</span>
        <strong>${target.value.label}</strong>
        <span class="prompt-distance">${distanceLabel}</span>
      </div>
      ${metaMarkup}
      <div class="prompt-detail">${target.value.preview}</div>
      <div class="prompt-action">${action}</div>
    `;
  } else if (target.type === "terminal") {
    if (target.value.kind === "external") {
      const detail = isLedServiceTerminal(target.value)
        ? pickUiText("状态：重点外部入口", "Status: Priority External Gate")
        : pickUiText("状态：网页终端", "Status: Web Terminal");
      const action = isTapInteractionMode() ? "点击弹窗打开网站" : "按 E 弹窗打开网站";
      promptKey = `terminal:${target.value.id}:external:${distanceLabel}`;
      promptMarkup = `
        <div class="prompt-head">
          <span class="prompt-chip">${getPromptTargetChipLabel(target)}</span>
          <strong>${getDepartmentUiLabel(target.value.department)} · ${target.value.label}</strong>
          <span class="prompt-distance">${distanceLabel}</span>
        </div>
        ${metaMarkup}
        <div class="prompt-detail">${detail}</div>
        <div class="prompt-action">${action}</div>
      `;
    } else {
      const done = completedScenarios.has(target.value.scenario.id);
      const detail = done
        ? pickUiText("状态：已执行", "Status: Done")
        : pickUiText("状态：可执行", "Status: Ready");
      const action = done
        ? (isTapInteractionMode() ? "点击继续查看" : "按 E 继续查看")
        : (isTapInteractionMode() ? "点击开始演示" : "按 E 开始演示");
      promptKey = `terminal:${target.value.scenario.id}:${done ? "done" : "todo"}:${distanceLabel}`;
      promptMarkup = `
        <div class="prompt-head">
          <span class="prompt-chip">${getPromptTargetChipLabel(target)}</span>
          <strong>${getDepartmentUiLabel(target.value.department)} · ${target.value.scenario.title}</strong>
          <span class="prompt-distance">${distanceLabel}</span>
        </div>
        ${metaMarkup}
        <div class="prompt-detail">${detail}</div>
        <div class="prompt-action">${action}</div>
      `;
    }
  } else {
    const done = collectedInsights.has(target.value.id);
    const detail = done
      ? pickUiText("状态：已记录", "Status: Captured")
      : pickUiText("状态：可记录", "Status: Available");
    const action = done
      ? (isTapInteractionMode() ? "点击复看洞察" : "按 F 复看洞察")
      : (isTapInteractionMode() ? "点击保存洞察" : "按 F 保存洞察");
    promptKey = `insight:${target.value.id}:${done ? "done" : "todo"}:${distanceLabel}`;
    promptMarkup = `
      <div class="prompt-head">
        <span class="prompt-chip">${getPromptTargetChipLabel(target)}</span>
        <strong>${getDepartmentUiLabel(target.value.department)} · ${pickUiText("记忆芯片", "Insight Chip")}</strong>
        <span class="prompt-distance">${distanceLabel}</span>
      </div>
      ${metaMarkup}
      <div class="prompt-detail">${detail}</div>
      <div class="prompt-action">${action}</div>
    `;
  }

  if (promptKey !== lastPromptKey) {
    prompt.innerHTML = translateRuntimeMarkup(promptMarkup);
    lastPromptKey = promptKey;
  }
  prompt.style.setProperty("--prompt-accent", withAlpha(promptAccent, 0.68));
  prompt.style.setProperty("--prompt-accent-soft", withAlpha(promptAccent, 0.2));
  prompt.style.setProperty("--prompt-accent-glow", withAlpha(promptAccent, 0.32));
  prompt.classList.remove("hidden");
  updateMapHint();
}

function applyUiLanguage(): void {
  localizeSceneContent();
  document.documentElement.lang = currentUiLanguage;
  document.title = getLocalizedString("documentTitle");
  dashboardSessionLabel.textContent = getLocalizedString("dashboard.session");

  textI18nElements.forEach((element) => {
    const key = element.dataset.i18nText;
    if (key) {
      element.textContent = getLocalizedString(key);
    }
  });

  htmlI18nElements.forEach((element) => {
    const key = element.dataset.i18nHtml;
    if (key) {
      element.innerHTML = getLocalizedString(key);
    }
  });

  ariaI18nElements.forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    if (key) {
      element.setAttribute("aria-label", getLocalizedString(key));
    }
  });

  showLabelI18nElements.forEach((element) => {
    const key = element.dataset.i18nShowLabel;
    if (key) {
      element.setAttribute("data-show-label", getLocalizedString(key));
    }
  });

  hideLabelI18nElements.forEach((element) => {
    const key = element.dataset.i18nHideLabel;
    if (key) {
      element.setAttribute("data-hide-label", getLocalizedString(key));
    }
  });

  if (
    completedScenarios.size === 0 &&
    collectedInsights.size === 0 &&
    !meetingState.active &&
    activeDepartmentId === "" &&
    activeSharedZoneId === ""
  ) {
    lastEventText = getLocalizedString("dashboard.waiting");
  }

  thesisList.innerHTML = currentThesisPoints.map((point) => `<li>${point}</li>`).join("");
  mapFloorIndicator.textContent = getLocalizedString("map.floorIndicator");
  currentZoneElement.textContent = getDefaultZoneLabel();
  currentZoneElement.style.color = "#f5f7ff";
  currentZoneElement.style.textShadow = "";
  syncUiVisibility();
  updateClockPanel();
  renderSourceList();
  renderDepartmentList();
  updateStats();
  updateHudStatus();
  updateMapHint();
}

function renderSourceList(): void {
  sourceList.innerHTML = translateRuntimeMarkup(currentUniqueSources
    .map(
      (source) => `
        <a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">
          ${source.label}
          <span>${source.detail}</span>
        </a>
      `
    )
    .join(""));
}

function getDepartmentCompletion(department: SceneDepartment): number {
  return department.scenarios.filter((scenario) => completedScenarios.has(scenario.id)).length;
}

function getCompletedDepartmentCount(): number {
  return departments.filter((department) => isDepartmentFullyCompleted(department)).length;
}

function getDepartmentImpactScore(department: SceneDepartment): number {
  return department.scenarios
    .filter((scenario) => completedScenarios.has(scenario.id))
    .reduce((sum, scenario) => sum + scenario.impactScore, 0);
}

function isDepartmentFullyCompleted(department: SceneDepartment): boolean {
  return (
    getDepartmentCompletion(department) >= department.scenarios.length &&
    collectedInsights.has(department.insight.id)
  );
}

function getDepartmentVisualState(department: SceneDepartment): DepartmentVisualState {
  const completed = getDepartmentCompletion(department);
  if (completed === department.scenarios.length) {
    return "done";
  }
  if (department.id === activeDepartmentId) {
    return "busy";
  }
  if (completed > 0) {
    return "busy";
  }
  return collectedInsights.has(department.insight.id) ? "online" : "idle";
}

function triggerDepartmentMilestone(department: SceneDepartment): void {
  departmentMilestoneState.pulse = 1;
  departmentMilestoneState.departmentId = department.id;
  departmentMilestoneState.accent = department.accent;
  departmentMilestoneState.title = pickUiText(
    `${department.shortName} 已闭环`,
    `${department.shortName} Closed Loop`
  );
  departmentMilestoneState.detail = pickUiText(
    `${department.scenarios.length} 个场景与洞察芯片已完成`,
    `${department.scenarios.length} scenes plus the insight chip are complete`
  );
  departmentMilestoneState.completedScenarios = getDepartmentCompletion(department);
  departmentMilestoneState.totalScenarios = department.scenarios.length;
  departmentMilestoneState.impactScore = getDepartmentImpactScore(department);

  const outcomeRecord: DepartmentOutcomeRecord = {
    id: `${department.id}:${completedScenarios.size}:${collectedInsights.size}`,
    departmentId: department.id,
    accent: department.accent,
    title: department.shortName,
    impactScore: departmentMilestoneState.impactScore,
    highlights: getDepartmentOutcomeHighlights(department, 3),
  };
  departmentOutcomeFeed.unshift(outcomeRecord);
  if (departmentOutcomeFeed.length > 4) {
    departmentOutcomeFeed.length = 4;
  }
}

function getDepartmentOutcomeHighlights(department: SceneDepartment, limit = 3): string[] {
  const outputs = department.scenarios
    .map((scenario) => scenario.outputs[0] ?? scenario.title)
    .filter(Boolean)
    .map((item) => trimSpeechSegment(item, 8));
  const kpi = department.scenarios
    .map((scenario) => scenario.kpis[0] ?? scenario.hook)
    .find(Boolean);
  const insightLine = pickUiText(
    `洞察 ${trimSpeechSegment(department.insight.fact, 8)}`,
    `Insight ${trimSpeechSegment(department.insight.fact, 8)}`
  );
  return Array.from(new Set([...outputs.slice(0, 2), kpi ? trimSpeechSegment(kpi, 10) : "", insightLine].filter(Boolean))).slice(0, limit);
}

function getRecentDepartmentOutcomeFeed(limit = 3): DepartmentOutcomeRecord[] {
  return departmentOutcomeFeed.slice(0, limit);
}

function getLatestDepartmentOutcomeRecord(): DepartmentOutcomeRecord | null {
  return departmentOutcomeFeed[0] ?? null;
}

function getDepartmentOutcomeSubtitle(record: DepartmentOutcomeRecord): string {
  const lead = record.highlights[0] ?? pickUiText("结果已回流", "Result synced back");
  return pickUiText(`闭环 +${record.impactScore} · ${lead}`, `Closed Loop +${record.impactScore} · ${lead}`);
}

function getDepartmentStateLabel(state: DepartmentVisualState): string {
  if (isEnglishUi()) {
    switch (state) {
      case "busy":
        return "Running";
      case "online":
        return "Ready";
      case "done":
        return "Done";
      case "idle":
      default:
        return "Idle";
    }
  }

  switch (state) {
    case "busy":
      return "执行中";
    case "online":
      return "已就绪";
    case "done":
      return "已完成";
    case "idle":
    default:
      return "空闲";
  }
}

function renderDepartmentList(): void {
  const showTaskPrompts = shouldShowTaskPrompts();
  const promptTarget = getUiNavigationTarget();
  const promptTargetDepartment = getUiPromptTargetDepartment();
  const promptTargetSharedZone = getUiPromptTargetSharedZone();
  const isRecommendedTarget = showTaskPrompts && isRecommendedNavigationTarget(promptTarget);
  const trafficSummary = getOfficeTrafficSummary();
  const focusSummary = getNavigationFocusSummary(promptTarget);
  const followUpTarget = getUiNavigationFollowUpTarget();
  const { pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const meetingCandidates = getMeetingCandidateSummary(3);
  const completedDepartmentCount = getCompletedDepartmentCount();
  const latestOutcome = getLatestDepartmentOutcomeRecord();
  const recentOutcomes = getRecentDepartmentOutcomeFeed(3);
  const strategicDepartment = getUiStrategicDepartmentCandidate();
  const playerPoint = { x: player.x, y: player.y };
  const departmentMetrics = departments.map((department) => {
    const completed = getDepartmentCompletion(department);
    const progress = Math.round((completed / department.scenarios.length) * 100);
    const state = getDepartmentVisualState(department);
    const occupancy = getDepartmentOccupancy(department);
    const occupancyRatio = Math.round(getDepartmentOccupancyRatio(department) * 100);
    const impactScore = getDepartmentImpactScore(department);
    const distance = Math.round(
      Math.hypot(
        rectCenter(department.walkwayRect).x - playerPoint.x,
        rectCenter(department.walkwayRect).y - playerPoint.y
      )
    );
    const focused = promptTargetDepartment?.id === department.id;
    const active = department.id === activeDepartmentId;
    const fullyCompleted = isDepartmentFullyCompleted(department);
    return { department, completed, progress, state, occupancy, occupancyRatio, impactScore, distance, focused, active, fullyCompleted };
  })
    .sort((left, right) =>
      Number(right.focused) - Number(left.focused) ||
      Number(right.active) - Number(left.active) ||
      Number(right.department.id === strategicDepartment?.id) - Number(left.department.id === strategicDepartment?.id) ||
      getDepartmentBacklogRatio(right.department) - getDepartmentBacklogRatio(left.department) ||
      left.distance - right.distance
    );

  const sharedZoneMetrics = sharedZones
    .map((zone) => {
      const distance = Math.round(
        Math.hypot(
          rectCenter(zone.walkwayRect).x - playerPoint.x,
          rectCenter(zone.walkwayRect).y - playerPoint.y
        )
      );
      const occupancy = getSharedZoneOccupancy(zone);
      const occupancyRatio = Math.round(getSharedZoneOccupancyRatio(zone) * 100);
      const focused = promptTargetSharedZone?.id === zone.id;
      const active = zone.id === activeSharedZoneId;
      return { zone, distance, occupancy, occupancyRatio, focused, active };
    })
    .sort((left, right) =>
      Number(right.focused) - Number(left.focused) ||
      Number(right.active) - Number(left.active) ||
      right.occupancy - left.occupancy ||
      left.distance - right.distance
    );

  const routeSummaryMarkup = (() => {
    const outcomeMarkup = recentOutcomes.length > 0
      ? `
        <div class="route-summary-detail">${pickUiText("最近闭环：", "Recent loops: ")}${recentOutcomes
          .map((record) => `${record.title} +${record.impactScore}`)
          .join(" · ")}</div>
      `
      : "";
    if (!showTaskPrompts) {
      return `
        <div class="route-summary" style="--dept-accent:${trafficSummary.accent};">
          <div class="route-summary-eyebrow">${pickUiText("办公室总览", "Office Overview")}</div>
          <strong class="route-summary-title">${pickUiText("自由漫游", "Free Roam")}</strong>
          <div class="route-summary-detail">${pickUiText("点击任一部门或公共区可快速切换，地图和列表保留空间信息，但不再显示任务目标提示。", "Click any department or shared zone to jump quickly. The map and list keep spatial context, but objective prompts are hidden.")}</div>
          ${latestOutcome ? `<div class="route-summary-detail">${pickUiText("最新闭环：", "Latest closed loop: ")}${latestOutcome.title} · ${getDepartmentOutcomeSubtitle(latestOutcome)}</div>` : ""}
          ${outcomeMarkup}
          <div class="route-summary-pills">
            <span class="route-summary-pill">${pickUiText("自由漫游", "Free Roam")}</span>
            <span class="route-summary-pill">${pickUiText("点击右侧列表可快速切换", "Use the list on the right to jump quickly")}</span>
            <span class="route-summary-pill">${trafficSummary.pill}</span>
            <span class="route-summary-pill">${focusSummary.pill}</span>
            <span class="route-summary-pill">${pickUiText("闭环", "Loop")} ${completedDepartmentCount}/${departments.length}</span>
          </div>
        </div>
      `;
    }

    if (!promptTarget) {
      return `
        <div class="route-summary" style="--dept-accent:#7d8db3;">
          <div class="route-summary-eyebrow">${pickUiText("当前导航", "Current Route")}</div>
          <strong class="route-summary-title">${pickUiText("自由漫游", "Free Roam")}</strong>
          <div class="route-summary-detail">${pickUiText("靠近导览员、演讲台、终端或记忆芯片后，会自动切到目标聚焦模式。", "Move near a guide, podium, terminal, or insight chip to switch into target focus automatically.")}</div>
          ${strategicDepartment ? `<div class="route-summary-detail">${pickUiText("下一闭环：", "Next closed loop: ")}${getDepartmentUiLabel(strategicDepartment)} · ${getDepartmentPendingWorkSummary(strategicDepartment)}</div>` : ""}
          ${latestOutcome ? `<div class="route-summary-detail">${pickUiText("最新闭环：", "Latest closed loop: ")}${latestOutcome.title} · ${getDepartmentOutcomeSubtitle(latestOutcome)}</div>` : ""}
          ${outcomeMarkup}
          <div class="route-summary-pills">
            <span class="route-summary-pill">${pickUiText("无目标", "No Target")}</span>
            <span class="route-summary-pill">${pickUiText("点击右侧列表可快速切换", "Use the list on the right to jump quickly")}</span>
            <span class="route-summary-pill">${trafficSummary.pill}</span>
            <span class="route-summary-pill">${focusSummary.pill}</span>
            <span class="route-summary-pill">${pickUiText("闭环", "Loop")} ${completedDepartmentCount}/${departments.length}</span>
          </div>
        </div>
      `;
    }

    const promptDistance = `${Math.max(1, Math.round(getInteractionTargetDistance(promptTarget)))}m`;
    const promptAccent = getInteractionTargetIndicatorAccent(promptTarget);
    const summaryPills = [
      promptDistance,
      getInteractionTargetStatusLabel(promptTarget),
      getInteractionTargetAreaLabel(promptTarget),
      trafficSummary.pill,
      focusSummary.pill,
    ];
    if (followUpTarget) {
      summaryPills.push(`${pickUiText("后续", "Next")} ${shortenIndicatorTitle(getInteractionTargetIndicatorTitle(followUpTarget), 8)}`);
    }
    if (pendingQuestioner && pendingResponder) {
      summaryPills.push(`${pickUiText("接力", "Relay")} ${trimSpeechSegment(pendingQuestioner.name, 4)}→${trimSpeechSegment(pendingResponder.name, 4)}`);
    }
    summaryPills.push(`${pickUiText("闭环", "Loop")} ${completedDepartmentCount}/${departments.length}`);
    if (promptTarget.type === "podium") {
      const seatedCount = npcs.filter((npc) => npc.meetingStatus === "seated").length;
      summaryPills.push(`${pickUiText("就座", "Seated")} ${seatedCount}/${npcs.length}`);
      summaryPills.push(`${pickUiText("候选", "Candidates")} ${meetingCandidates}`);
    } else if (promptTarget.type === "guide" && promptTarget.value.target.type === "department") {
      summaryPills.push(getDepartmentOccupancyLabel(promptTarget.value.target.department));
    } else if (promptTarget.type === "terminal" || promptTarget.type === "insight") {
      summaryPills.push(getDepartmentOccupancyLabel(promptTarget.value.department));
    }

    return `
      <div class="route-summary" style="--dept-accent:${promptAccent};">
        <div class="route-summary-eyebrow">${isRecommendedTarget ? pickUiText("推荐导航", "Recommended Route") : pickUiText("当前导航", "Current Route")}</div>
        <strong class="route-summary-title">${getInteractionTargetIndicatorTitle(promptTarget)}</strong>
        <div class="route-summary-detail">${getInteractionTargetActionLabel(promptTarget)}</div>
        ${followUpTarget ? `<div class="route-summary-detail">${pickUiText("完成后将衔接 ", "Then hand off to ")}${getInteractionTargetIndicatorTitle(followUpTarget)}</div>` : ""}
        ${strategicDepartment && (!getInteractionTargetDepartment(promptTarget) || getInteractionTargetDepartment(promptTarget)?.id !== strategicDepartment.id)
          ? `<div class="route-summary-detail">${pickUiText("下一闭环：", "Next closed loop: ")}${getDepartmentUiLabel(strategicDepartment)} · ${getDepartmentPendingWorkSummary(strategicDepartment)}</div>`
          : ""}
        ${meetingState.active && promptTarget.type === "podium" && meetingStageCueState.pulse > 0.08
          ? `<div class="route-summary-detail">${pickUiText("导演切镜：", "Focus cut: ")}${meetingStageCueState.detail}</div>`
          : ""}
        ${latestOutcome ? `<div class="route-summary-detail">${pickUiText("最新闭环：", "Latest closed loop: ")}${latestOutcome.title} · ${getDepartmentOutcomeSubtitle(latestOutcome)}</div>` : ""}
        ${outcomeMarkup}
        <div class="route-summary-pills">
          ${summaryPills.map((pill) => `<span class="route-summary-pill">${pill}</span>`).join("")}
        </div>
      </div>
    `;
  })();

  const departmentMarkup = departmentMetrics
    .map(({ department, completed, progress, state, occupancy, occupancyRatio, impactScore, distance, focused, active, fullyCompleted }) => {
      const activeClass = active ? "active" : "";
      const targetFocus = focused ? "target-focus" : "";
      const targetBadge = focused
        ? `<span class="dept-tag dept-target-chip">${pickUiText("目标", "Target")}</span>`
        : "";
      const closedLoopBadge = fullyCompleted
        ? `<span class="dept-tag dept-target-chip">${pickUiText("闭环", "Loop")}</span>`
        : "";
      return `
        <button class="dept-button ${activeClass} ${targetFocus}" data-department-id="${department.id}" style="--dept-accent:${department.accent};">
          <div class="dept-title-row">
            <strong>${getDepartmentUiLabel(department)}</strong>
            <span class="dept-title-meta">
              ${targetBadge}
              ${closedLoopBadge}
              <span class="dept-tag">${distance}m</span>
              <span class="dept-tag">${progress}%</span>
            </span>
          </div>
          <div class="dept-status-line">
            <span class="dept-status-dot status-${state}"></span>
            <span>${fullyCompleted
              ? pickUiText(`闭环完成 · +${impactScore}`, `Closed Loop · +${impactScore}`)
              : showTaskPrompts
                ? `${getDepartmentStateLabel(state)} · ${completed}/${department.scenarios.length}`
                : `${getDepartmentStateLabel(state)} · ${getDepartmentOccupancyLabel(department)}`}</span>
          </div>
          <div class="dept-extra-line">
            <span class="dept-tag">${pickUiText(department.name, department.shortName)}</span>
            <span class="dept-tag">${showTaskPrompts ? (isEnglishUi() ? `On floor ${occupancy}/${department.npcRoles.length}` : `在位 ${occupancy}/${department.npcRoles.length}`) : getDepartmentOccupancyLabel(department)}</span>
            <span class="dept-tag">${fullyCompleted
              ? pickUiText(`成果 +${impactScore}`, `Result +${impactScore}`)
              : showTaskPrompts
                ? getDepartmentPendingWorkSummary(department)
                : pickUiText(`${department.sourceRoomLabel}`, `${department.sourceRoomLabel}`)}</span>
          </div>
          <div class="dept-presence">
            <div class="dept-presence-fill" style="width:${Math.max(12, occupancyRatio)}%; background:${getDepartmentStateAccent(state)};"></div>
          </div>
          <div class="dept-progress">
            <div class="dept-progress-fill" style="width:${progress}%; background:${department.accent};"></div>
          </div>
        </button>
      `;
    })
    .join("");

  const sharedZoneMarkup = sharedZoneMetrics
    .map(({ zone, distance, occupancy, occupancyRatio, focused, active }) => {
      const activeClass = active ? "active" : "";
      const targetFocus = focused ? "target-focus" : "";
      const targetBadge = focused
        ? `<span class="dept-tag dept-target-chip">${pickUiText("目标", "Target")}</span>`
        : "";
      const zoneTag = isEnglishUi()
        ? (zone.kind === "reception" ? "Reception" : "Cafeteria")
        : (zone.kind === "reception" ? "接待" : "餐厅");
      return `
        <button class="dept-button shared-zone-button ${activeClass} ${targetFocus}" data-shared-zone-id="${zone.id}" style="--dept-accent:${zone.accent};">
          <div class="dept-title-row">
            <strong>${getSharedZoneUiLabel(zone)}</strong>
            <span class="dept-title-meta">
              ${targetBadge}
              <span class="dept-tag">${distance}m</span>
            </span>
          </div>
          <div class="dept-status-line">
            <span class="dept-status-dot" style="color:${zone.accent}; background:${zone.accent};"></span>
            <span>${zoneTag} · ${occupancy > 0 ? (isEnglishUi() ? `${occupancy} moving` : `${occupancy} 人流动`) : (isEnglishUi() ? "Quick jump" : "快速切换")}</span>
          </div>
          <div class="dept-extra-line">
            <span class="dept-tag">${zone.sourceRoomLabel}</span>
            <span class="dept-tag">${focused ? (isEnglishUi() ? "Target zone" : "目标区域") : active ? (isEnglishUi() ? "Current zone" : "当前位置") : (isEnglishUi() ? "Shared zone" : "公共区")}</span>
            <span class="dept-tag">${isEnglishUi() ? `Heat ${occupancyRatio}%` : `热度 ${occupancyRatio}%`}</span>
          </div>
          <div class="dept-progress">
            <div class="dept-progress-fill" style="width:${Math.max(14, occupancy > 0 ? occupancyRatio : 24)}%; background:${zone.accent};"></div>
          </div>
        </button>
      `;
    })
    .join("");

  departmentList.innerHTML = translateRuntimeMarkup(`
    ${routeSummaryMarkup}
    <div class="route-subhead">部门工位</div>
    ${departmentMarkup}
    <div class="route-subhead">公共区</div>
    ${sharedZoneMarkup}
  `);
  lastRouteListRenderKey = getRouteListRenderKey();
}

function getSharedZoneModalCopy(zone: SharedZone): {
  title: string;
  intro: string;
  highlight: string;
  cards: Array<{ title: string; hook: string; bullets: string[] }>;
} {
  if (zone.kind === "reception") {
    if (isEnglishUi()) {
      return {
        title: "Reception Hub",
        intro:
          "This is the entry zone for the interactive office site. It handles welcome flow, visitor orientation, and zone switching so first-time visitors understand the layout immediately.",
        highlight:
          "The reception lobster first explains the office layout, priority zones, and the recommended visit order.",
        cards: [
          {
            title: "Arrival Guide",
            hook: "Bring people into the scene first, then direct them to the next room.",
            bullets: [
              "Welcome copy and entry instructions",
              "Point out where the meeting area, desks, and cafeteria are",
              "Turn spatial browsing into a guided walkthrough",
            ],
          },
          {
            title: "Zone Switching Cue",
            hook: "Make the next destination a spatial cue instead of hiding it in a sidebar.",
            bullets: [
              "Prompt the player to continue into other departments",
              "Works well as the first stop of the homepage",
              "Also supports new-visitor onboarding",
            ],
          },
        ],
      };
    }

    return {
      title: "前台接待 · Reception Hub",
      intro: "这里是办公室互动网页的入口区，用来做欢迎、访客导览和区域切换，让第一次进入的人也能马上理解空间结构。",
      highlight: "前台的小龙虾会先把办公室分区、重点区域和浏览顺序讲清楚。",
      cards: [
        {
          title: "进入引导",
          hook: "先把人带进场景，再决定去哪个区域继续看。",
          bullets: ["欢迎语与入口说明", "告诉用户哪里是会议、工位和餐厅", "把空间浏览变成有顺序的导览"],
        },
        {
          title: "区域切换提示",
          hook: "把“下一步去哪里”直接做成空间提示，而不是埋在侧边栏里。",
          bullets: ["提醒主角可去不同部门继续互动", "适合作为首页第一站", "也能承担新访客 onboarding"],
        },
      ],
    };
  }

  if (isEnglishUi()) {
    return {
      title: "Cafeteria",
      intro:
        "This is the rest-and-exchange zone inside the office. It is suited for light information prompts, cross-team pause points, and pacing changes between work areas and shared space.",
      highlight:
        "The cafeteria lobster treats this area as the entry point for rest, recharge, and casual encounters.",
      cards: [
        {
          title: "Recharge Zone",
          hook: "Give the space one clearly different public area outside the desks.",
          bullets: [
            "Dining and short breaks",
            "Make movement feel closer to a real office",
            "Create breathing room in the page rhythm",
          ],
        },
        {
          title: "Light Social Layer",
          hook: "A good place for relaxed prompts, easter eggs, or cross-team encounters.",
          bullets: [
            "Lunch-break chatter",
            "Light reminders and status display",
            "Shared-zone guidance or brand expression",
          ],
        },
      ],
    };
  }

  return {
    title: "员工餐厅 · Cafeteria",
    intro: "这里是办公室里的放松与交流区，适合承载轻量信息提示、跨部门休息节点，以及从工作区切到公共空间的节奏变化。",
    highlight: "餐厅的小龙虾会把这里当作休息、补能和偶遇交流的场景入口。",
    cards: [
      {
        title: "休息补能",
        hook: "让空间里有一块明显不同于工位的公共区域。",
        bullets: ["用餐与短暂停留", "让动线更像真实办公室", "给页面节奏一个喘息区"],
      },
      {
        title: "轻量交流",
        hook: "适合放松提示、彩蛋文案或跨团队偶遇内容。",
        bullets: ["午休闲聊", "轻提醒和状态展示", "公共区导览或品牌表达"],
      },
    ],
  };
}

function openDepartmentModal(department: SceneDepartment, highlightScenarioId?: string): void {
  modalSharedZone = null;
  modalDepartment = department;
  modal.classList.remove("hidden");

  modalContent.innerHTML = translateRuntimeMarkup(`
    <div class="modal-headline">
      <div class="eyebrow">面对面对话</div>
      <h2>${department.shortName} · ${department.name}</h2>
      <p>${department.intro}</p>
      <p><strong>讲述重点：</strong>${department.speakerNote}</p>
    </div>
    <div class="scenario-grid">
      ${department.scenarios
        .map((scenario) => {
          const done = completedScenarios.has(scenario.id);
          const highlight =
            scenario.id === highlightScenarioId
              ? "style=\"box-shadow:0 0 0 3px rgba(255,255,255,0.08), 0 0 0 6px rgba(124,226,255,0.35);\""
              : "";
          return `
            <article class="scenario-card ${done ? "done" : ""}" ${highlight}>
              <div class="eyebrow">${done ? "已执行" : "待执行"}</div>
              <h3>${scenario.title}</h3>
              <div class="scenario-hook">${scenario.hook}</div>
              <p><strong>业务痛点：</strong>${scenario.problem}</p>
              <div class="scenario-footer">
                <p><strong>产出物：</strong>${scenario.outputs.join(" / ")}</p>
                <div class="scenario-stat">${scenario.stat}</div>
                <div class="action-row">
                  <button class="action-button" data-run-scenario="${scenario.id}">
                    ${done ? "重播场景" : "开始演示"}
                  </button>
                  <span class="impact-chip">+${scenario.impactScore} 执行力分</span>
                  <a class="ghost-button" href="${scenario.source.url}" target="_blank" rel="noreferrer">查看参考</a>
                </div>
                ${done ? `<div class="result-box"><strong>演示结果</strong>${scenario.demoResult}</div>` : ""}
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `);
}

function openSharedZoneModal(zone: SharedZone): void {
  const copy = getSharedZoneModalCopy(zone);
  modalDepartment = null;
  modalSharedZone = zone;
  modal.classList.remove("hidden");

  modalContent.innerHTML = translateRuntimeMarkup(`
    <div class="modal-headline">
      <div class="eyebrow">小龙虾导览</div>
      <h2>${copy.title}</h2>
      <p>${copy.intro}</p>
      <p><strong>讲述重点：</strong>${copy.highlight}</p>
    </div>
    <div class="scenario-grid">
      ${copy.cards
        .map(
          (card) => `
            <article class="scenario-card">
              <div class="eyebrow">区域说明</div>
              <h3>${card.title}</h3>
              <div class="scenario-hook">${card.hook}</div>
              <ul>
                ${card.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
              </ul>
            </article>
          `
        )
        .join("")}
    </div>
  `);
}

function openAreaGuideModal(guide: AreaGuide): void {
  clearMobileMoveTarget();
  setLastEvent(`靠近 ${guide.label}`);
  if (guide.target.type === "department") {
    openDepartmentModal(guide.target.department);
    return;
  }

  openSharedZoneModal(guide.target.zone);
}

function closeModal(): void {
  modal.classList.add("hidden");
  modalDepartment = null;
  modalSharedZone = null;
}

function showToast(message: string): void {
  toast.innerHTML = translateRuntimeMarkup(message);
  toast.classList.remove("hidden");

  if (toastTimer !== null) {
    window.clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    toast.classList.add("hidden");
    toastTimer = null;
  }, 3200);
}

function updateClockPanel(): void {
  const now = new Date();
  const locale = getLocalizedString("dashboard.locale");
  dashboardTime.textContent = now.toLocaleTimeString(locale, { hour12: false });
  dashboardDate.textContent = now.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  dashboardLastEvent.textContent = `${getLocalizedString("dashboard.lastEventPrefix")}${translateRuntimeCopy(lastEventText)}`;
}

function setLastEvent(message: string): void {
  lastEventText = message;
  updateClockPanel();
}

function jitterPoint(point: Point, spreadX: number, spreadY = spreadX): Point {
  return {
    x: point.x + randomBetween(-spreadX, spreadX),
    y: point.y + randomBetween(-spreadY, spreadY),
  };
}

function compressNpcRoute(origin: Point, points: Point[]): Point[] {
  const route: Point[] = [];
  let previous = origin;

  for (const point of points) {
    if (distanceSquared(previous, point) < 4) {
      continue;
    }
    route.push(point);
    previous = point;
  }

  return route;
}

function getCorridorPatrolOptions(department: SceneDepartment): Point[] {
  const laneY = department.corridorLanePoint.y;
  const laneAnchors = departments
    .filter((candidate) => candidate.approachSide === department.approachSide)
    .map((candidate) => ({
      x: candidate.roomRect.left + candidate.roomRect.width / 2,
      y: laneY,
    }));

  return [
    ...laneAnchors,
    { x: corridorRect.left + 86, y: laneY },
    { x: corridorRect.left + corridorRect.width / 2, y: laneY },
    { x: corridorRect.left + corridorRect.width - 86, y: laneY },
  ];
}

function getSharedZoneFlowPoint(zone: SharedZone, seed: number): Point {
  const horizontal = zone.approachSide === "up" || zone.approachSide === "down";
  const minInset = 3;
  if (horizontal) {
    const minX = zone.walkwayRect.left + minInset;
    const maxX = zone.walkwayRect.left + zone.walkwayRect.width - minInset;
    return {
      x: lerp(minX, maxX, hashUnit(seed * 37 + 5)),
      y: zone.approachSide === "down"
        ? zone.walkwayRect.top + zone.walkwayRect.height - minInset
        : zone.walkwayRect.top + minInset,
    };
  }

  const minY = zone.walkwayRect.top + minInset;
  const maxY = zone.walkwayRect.top + zone.walkwayRect.height - minInset;
  return {
    x: zone.approachSide === "right"
      ? zone.walkwayRect.left + zone.walkwayRect.width - minInset
      : zone.walkwayRect.left + minInset,
    y: lerp(minY, maxY, hashUnit(seed * 29 + 11)),
  };
}

function buildNpcSharedZoneRoute(npc: NpcActor, zone: SharedZone): Point[] {
  const origin = { x: npc.x, y: npc.y };
  const inTransitNetwork = isPointInCorridorNetwork(origin);
  const doorwayPoint = getNpcDoorwayPoint(npc);
  const zoneWalkwayCenter = rectCenter(zone.walkwayRect);
  const zoneHoldPoint = getSharedZoneFlowPoint(zone, npc.flowSeed + zone.roomRect.left * 0.01);

  return compressNpcRoute(
    origin,
    inTransitNetwork
      ? [zoneWalkwayCenter, zoneHoldPoint]
      : [npc.department.entryPoint, doorwayPoint, npc.department.corridorLanePoint, zoneWalkwayCenter, zoneHoldPoint]
  );
}

function getNpcPreferredSharedZone(npc: NpcActor): SharedZone {
  const promptTargetSharedZone = getPromptTargetSharedZone();
  const topSharedZone = getTopSharedZone();
  const flowWave = 0.5 + Math.sin(officeFlowClock * OFFICE_FLOW_CYCLE_SPEED + npc.flowSeed * Math.PI * 2) * 0.5;

  if (promptTargetSharedZone && Math.random() < 0.34 + flowWave * 0.18) {
    return promptTargetSharedZone;
  }

  if (topSharedZone && topSharedZone.id !== promptTargetSharedZone?.id && Math.random() < 0.24) {
    return topSharedZone;
  }

  const cafeteria = cafeteriaZone ?? receptionZone;
  const reception = receptionZone ?? cafeteriaZone;
  if (!cafeteria || !reception) {
    throw new Error("公共区导航目标初始化失败。");
  }

  const preferred = flowWave > 0.55 ? cafeteria : reception;
  return hashUnit(npc.flowSeed * 61 + officeFlowClock * 0.1) > 0.28
    ? preferred
    : preferred.id === cafeteria.id
      ? reception
      : cafeteria;
}

function getNpcIdleDuration(point: Point): number {
  if (sharedZones.some((zone) => pointInRect(point, zone.walkwayRect) || pointInRect(point, zone.frontageRect))) {
    return randomBetween(1.4, 3.1);
  }
  if (isPointInCorridorNetwork(point)) {
    return randomBetween(0.8, 1.9);
  }
  return randomBetween(1.2, 3.2);
}

function getNpcDoorwayPoint(npc: NpcActor): Point {
  const doorwayOffset = hashUnit(npc.department.decorSeed * 17 + npc.id.length) > 0.5 ? -4 : 4;
  return {
    x: rectCenter(npc.department.walkwayRect).x + doorwayOffset,
    y: rectCenter(npc.department.walkwayRect).y,
  };
}

function chooseNpcRoute(npc: NpcActor): Point[] {
  const origin = { x: npc.x, y: npc.y };
  const inTransitNetwork = isPointInCorridorNetwork(origin);
  const doorwayPoint = getNpcDoorwayPoint(npc);
  const promptTargetDepartment = getPromptTargetDepartment();
  const topDepartment = getTopActiveDepartment();
  const flowWave = 0.5 + Math.sin(officeFlowClock * OFFICE_FLOW_CYCLE_SPEED + npc.flowSeed * Math.PI * 2) * 0.5;
  const focusBoost = promptTargetDepartment?.id === npc.department.id
    ? 0.18
    : topDepartment?.id === npc.department.id
      ? 0.1
      : 0;
  const sharedZoneChance = clamp(
    NPC_SHARED_ZONE_VISIT_CHANCE + flowWave * 0.12 + focusBoost * 0.4,
    0.08,
    0.34
  );
  const corridorChance = clamp(
    NPC_HOTSPOT_ROUTE_CHANCE + flowWave * 0.1 + focusBoost,
    0.18,
    0.58
  );
  const roomTarget = jitterPoint(
    npc.workSpots[Math.floor(Math.random() * npc.workSpots.length)] ?? npc.home,
    4,
    3
  );
  const roll = Math.random();

  if (roll < sharedZoneChance) {
    const sharedZoneRoute = buildNpcSharedZoneRoute(npc, getNpcPreferredSharedZone(npc));
    if (sharedZoneRoute.length > 0) {
      return sharedZoneRoute;
    }
  }

  if (roll < sharedZoneChance + corridorChance) {
    const corridorOptions = [...getCorridorPatrolOptions(npc.department)];
    if (promptTargetDepartment) {
      corridorOptions.push(promptTargetDepartment.corridorLanePoint, promptTargetDepartment.corridorLanePoint);
    }
    if (topDepartment && topDepartment.id !== promptTargetDepartment?.id) {
      corridorOptions.push(topDepartment.corridorLanePoint);
    }
    const promptTargetSharedZone = getPromptTargetSharedZone();
    if (promptTargetSharedZone) {
      corridorOptions.push(rectCenter(promptTargetSharedZone.walkwayRect));
    }
    const topSharedZone = getTopSharedZone();
    if (topSharedZone && topSharedZone.id !== promptTargetSharedZone?.id) {
      corridorOptions.push(rectCenter(topSharedZone.walkwayRect));
    }
    const corridorChoice =
      corridorOptions[Math.floor(Math.random() * corridorOptions.length)] ?? npc.department.corridorLanePoint;
    const corridorTarget = jitterPoint(corridorChoice, 8, 4);

    return compressNpcRoute(
      origin,
      inTransitNetwork
        ? [npc.department.corridorLanePoint, corridorTarget]
        : [npc.department.entryPoint, doorwayPoint, npc.department.corridorLanePoint, corridorTarget]
    );
  }

  return compressNpcRoute(
    origin,
    inTransitNetwork
      ? [npc.department.corridorLanePoint, doorwayPoint, npc.department.entryPoint, roomTarget]
      : [roomTarget]
  );
}

function buildNpcMeetingRoute(npc: NpcActor): Point[] {
  const origin = { x: npc.x, y: npc.y };
  const inTransitNetwork = isPointInCorridorNetwork(origin);
  const doorwayPoint = getNpcDoorwayPoint(npc);
  const seatLanePoint = {
    x: npc.meetingSeat.approachPoint.x,
    y: npc.department.corridorLanePoint.y,
  };

  return compressNpcRoute(
    origin,
    inTransitNetwork
      ? [seatLanePoint, npc.meetingSeat.approachPoint, npc.meetingSeat.position]
      : [
        npc.department.entryPoint,
        doorwayPoint,
        npc.department.corridorLanePoint,
        seatLanePoint,
        npc.meetingSeat.approachPoint,
        npc.meetingSeat.position,
      ]
  );
}

function buildNpcReturnRoute(npc: NpcActor): Point[] {
  const origin = { x: npc.x, y: npc.y };
  const inTransitNetwork = isPointInCorridorNetwork(origin);
  const doorwayPoint = getNpcDoorwayPoint(npc);

  return compressNpcRoute(
    origin,
    inTransitNetwork
      ? [npc.department.corridorLanePoint, doorwayPoint, npc.department.entryPoint, npc.home]
      : [npc.home]
  );
}

function startNpcRoute(npc: NpcActor, route: Point[]): void {
  const [nextTarget, ...rest] = route;
  if (!nextTarget) {
    npc.action = "working";
    npc.actionTimer = getNpcIdleDuration({ x: npc.x, y: npc.y });
    return;
  }

  npc.target = nextTarget;
  npc.route = rest;
  npc.action = "walking";
  npc.actionTimer = randomBetween(1.6, 4.5);
  npc.facing = getFacingDirection(npc.target.x - npc.x, npc.target.y - npc.y, npc.facing);
}

function settleNpcAtMeetingSeat(npc: NpcActor): void {
  npc.meetingStatus = "seated";
  npc.x = npc.meetingSeat.position.x;
  npc.y = npc.meetingSeat.position.y;
  npc.target = npc.meetingSeat.position;
  npc.route = [];
  npc.action = "working";
  npc.actionTimer = 0;
  npc.step = 0;
  npc.facing = npc.meetingSeat.facing;
}

function settleNpcAtOffice(npc: NpcActor): void {
  npc.meetingStatus = "office";
  npc.x = npc.home.x;
  npc.y = npc.home.y;
  npc.target = npc.home;
  npc.route = [];
  npc.action = "working";
  npc.actionTimer = npc.stationary ? randomBetween(0.9, 1.6) : randomBetween(0.8, 2.2);
  npc.step = 0;
}

function sendNpcToMeetingSeat(npc: NpcActor): void {
  const route = buildNpcMeetingRoute(npc);
  if (route.length === 0) {
    settleNpcAtMeetingSeat(npc);
    return;
  }

  npc.meetingStatus = "walking-to-seat";
  startNpcRoute(npc, route);
}

function sendNpcBackToOffice(npc: NpcActor): void {
  const route = buildNpcReturnRoute(npc);
  if (route.length === 0) {
    settleNpcAtOffice(npc);
    return;
  }

  npc.meetingStatus = "walking-home";
  startNpcRoute(npc, route);
}

function startCentralMeeting(): void {
  if (meetingState.active) {
    return;
  }

  meetingState.active = true;
  meetingState.discussionCooldown = 0.6;
  meetingState.discussionTurn = 0;
  meetingState.readyAnnounced = false;
  meetingState.currentSpeakerId = "";
  meetingState.lastSpeakerId = "";
  meetingState.pendingQuestionerId = "";
  meetingState.pendingResponderId = "";
  meetingState.pendingTopicTurn = 0;
  meetingState.phaseKind = "seating";
  meetingState.phaseDuration = 0;
  meetingState.recentTurns = [];
  npcs.forEach((npc, index) => {
    npc.meetingStatus = "queued";
    npc.meetingDelay = index * 0.09 + hashUnit(index * 17 + 7) * 0.22;
    npc.target = { x: npc.x, y: npc.y };
    npc.route = [];
    npc.action = "working";
    npc.actionTimer = 0;
    npc.step = 0;
    npc.bubbleText = "";
    npc.bubbleTimer = 0;
  });
  triggerMeetingStageCue("会议召集", `${npcs.length} 人正在入座`, "#89d0ff", "seating");
  setLastEvent(pickUiText("中央会议区开始会议", "Central meeting zone started a meeting"));
  showToast(
    pickUiText(
      `<strong>中央会议区</strong> 已开始会议，${npcs.length} 位 NPC 正在依次入座。`,
      `<strong>Central Meeting Zone</strong> the meeting has started, and ${npcs.length} NPCs are taking their seats in sequence.`
    )
  );
}

function dismissCentralMeeting(): void {
  meetingState.active = false;
  meetingState.discussionCooldown = 0;
  meetingState.readyAnnounced = false;
  meetingState.currentSpeakerId = "";
  meetingState.lastSpeakerId = "";
  meetingState.pendingQuestionerId = "";
  meetingState.pendingResponderId = "";
  meetingState.pendingTopicTurn = 0;
  meetingState.phaseKind = "idle";
  meetingState.phaseDuration = 0;
  meetingState.recentTurns = [];
  meetingStageCueState.pulse = 0;
  meetingStageCueState.phaseKind = "idle";
  meetingStageCueState.title = "";
  meetingStageCueState.detail = "";
  meetingStageCueState.speakerId = "";
  meetingStageCueState.counterpartId = "";
  npcs.forEach((npc) => {
    npc.meetingDelay = 0;
    npc.bubbleText = "";
    npc.bubbleTimer = 0;
    sendNpcBackToOffice(npc);
  });
  setLastEvent(pickUiText("中央会议区解散会议", "Central meeting zone dismissed the meeting"));
  showToast(
    pickUiText(
      "<strong>中央会议区</strong> 会议已解散，所有 NPC 正在返回工位。",
      "<strong>Central Meeting Zone</strong> the meeting has ended, and all NPCs are returning to their desks."
    )
  );
}

function toggleCentralMeeting(): void {
  clearMobileMoveTarget();
  if (meetingState.active) {
    dismissCentralMeeting();
    return;
  }

  startCentralMeeting();
}

function getMeetingParticipants(): NpcActor[] {
  return [...npcs]
    .filter((npc) => npc.meetingStatus === "seated")
    .sort((left, right) => {
      if (left.meetingSeat.group !== right.meetingSeat.group) {
        return left.meetingSeat.group === "upper" ? -1 : 1;
      }
      return left.meetingSeat.position.x - right.meetingSeat.position.x;
    });
}

function clearMeetingSpeechBubbles(excludeNpcId?: string): void {
  npcs.forEach((npc) => {
    if (npc.id === excludeNpcId || npc.meetingStatus !== "seated") {
      return;
    }
    npc.bubbleText = "";
    npc.bubbleTimer = 0;
  });
}

function pickRandomMeetingParticipant(
  participants: NpcActor[],
  excludedIds: string[] = [],
  preferredPredicate?: (npc: NpcActor) => boolean
): NpcActor | null {
  const available = participants.filter((npc) => !excludedIds.includes(npc.id));
  if (available.length === 0) {
    return null;
  }

  const preferred = preferredPredicate ? available.filter(preferredPredicate) : [];
  const pool = preferred.length > 0 ? preferred : available;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

function getMeetingScenarioSnapshot(npc: NpcActor, turnIndex: number): {
  topicIndex: number;
  title: string;
  hook: string;
  output: string;
  kpi: string;
} {
  const actorIndex = Number.parseInt(npc.id.split("-npc-")[1] ?? "0", 10) || 0;
  const topicIndex = actorIndex + turnIndex;
  const scenario = npc.department.scenarios[topicIndex % npc.department.scenarios.length] ?? npc.department.scenarios[0];
  const title = trimSpeechSegment(scenario?.title ?? "执行流程", 10);
  const hook = trimSpeechSegment(scenario?.hook ?? "把动作直接跑起来", 14);
  const output = trimSpeechSegment(
    scenario?.outputs[topicIndex % Math.max(1, scenario.outputs.length)] ?? title,
    10
  );
  const kpi = trimSpeechSegment(
    scenario?.kpis[topicIndex % Math.max(1, scenario.kpis.length)] ?? "减少人工反复",
    12
  );

  return {
    topicIndex,
    title,
    hook,
    output,
    kpi,
  };
}

function getMeetingQuestionLine(questioner: NpcActor, responder: NpcActor, turnIndex: number): string {
  const { topicIndex, title, hook, output, kpi } = getMeetingScenarioSnapshot(questioner, turnIndex);

  if (isEnglishUi()) {
    switch (topicIndex % 5) {
      case 0:
        return `${questioner.role}: If ${getDepartmentUiLabel(responder.department)} picks up ${title}, can we connect ${output} as well?`;
      case 1:
        return `${questioner.role}: ${responder.name}, when your side takes ${hook}, what has to move first?`;
      case 2:
        return `${questioner.role}: If OpenClaw handles ${output} first, can ${getDepartmentUiLabel(responder.department)} catch it directly?`;
      case 3:
        return `${questioner.role}: If we start with ${title}, do you think ${kpi} will land faster?`;
      default:
        return `${questioner.role}: If ${getDepartmentUiLabel(responder.department)} runs OpenClaw with us, how do we turn the actions into one closed loop?`;
    }
  }

  switch (topicIndex % 5) {
    case 0:
      return `${questioner.role}：${responder.department.shortName}那边如果接上${title}，能不能把${output}一起拉通？`;
    case 1:
      return `${questioner.role}：${responder.name}，你们那边接${hook}时，最先要联动什么？`;
    case 2:
      return `${questioner.role}：如果先把${output}交给 OpenClaw，${responder.department.shortName}能直接接住吗？`;
    case 3:
      return `${questioner.role}：我们这边先跑${title}的话，你觉得${kpi}会更快出来吗？`;
    default:
      return `${questioner.role}：${responder.department.shortName}如果一起上 OpenClaw，怎么把执行动作接成闭环？`;
  }
}

function getMeetingAnswerLine(responder: NpcActor, questioner: NpcActor, turnIndex: number): string {
  const { topicIndex, title, hook, output, kpi } = getMeetingScenarioSnapshot(responder, turnIndex + 1);

  if (isEnglishUi()) {
    switch (topicIndex % 5) {
      case 0:
        return `${responder.role}: Yes. ${getDepartmentUiLabel(responder.department)} can take ${hook} first, then write ${output} back to ${getDepartmentUiLabel(questioner.department)}.`;
      case 1:
        return `${responder.role}: No problem. I'll have OpenClaw run ${title} first so ${kpi} gets to your team faster.`;
      case 2:
        return `${responder.role}: We can take it. We'll hold ${output} on our side first, then sync the decision with ${getDepartmentUiLabel(questioner.department)}.`;
      case 3:
        return `${responder.role}: I'd put OpenClaw on both sides, with ${getDepartmentUiLabel(responder.department)} triggering first and then feeding it back to you.`;
      default:
        return `${responder.role}: Yes. We'll start with ${hook}, then sync the result back to ${getDepartmentUiLabel(questioner.department)}.`;
    }
  }

  switch (topicIndex % 5) {
    case 0:
      return `${responder.role}：可以，${responder.department.shortName}先接${hook}，再把${output}回写给${questioner.department.shortName}。`;
    case 1:
      return `${responder.role}：没问题，我会让 OpenClaw 先跑${title}，这样${kpi}会更快给到你们。`;
    case 2:
      return `${responder.role}：能接，我们这边先把${output}收住，再跟${questioner.department.shortName}同步拍板。`;
    case 3:
      return `${responder.role}：我建议两边都接 OpenClaw，由${responder.department.shortName}先触发，再回推你们。`;
    default:
      return `${responder.role}：可以答这个，我们先把${hook}跑起来，再把结果同步给${questioner.department.shortName}。`;
  }
}

function updateMeetingDiscussion(delta: number): void {
  if (!meetingState.active) {
    return;
  }

  const participants = getMeetingParticipants();
  if (participants.length < npcs.length) {
    meetingState.currentSpeakerId = "";
    meetingState.pendingQuestionerId = "";
    meetingState.pendingResponderId = "";
    meetingState.discussionCooldown = 0.4;
    meetingState.phaseKind = "seating";
    meetingState.phaseDuration = 0;
    return;
  }

  if (!meetingState.readyAnnounced) {
    meetingState.readyAnnounced = true;
    meetingState.discussionCooldown = 0.5;
    meetingState.phaseKind = "ready";
    meetingState.phaseDuration = 0.5;
    triggerMeetingStageCue(
      pickUiText("全员就绪", "All Seated"),
      pickUiText("中央会议区进入随机问答", "Central meeting zone enters live Q&A"),
      "#f4cf7d",
      "ready"
    );
    setLastEvent(
      pickUiText(
        "中央会议区开始随机问答讨论 OpenClaw 商业运用",
        "Central meeting zone started a live Q&A on OpenClaw business use"
      )
    );
    showToast(
      pickUiText(
        "<strong>中央会议区</strong> 全员已入座，开始随机问答讨论 OpenClaw 的商业运用。",
        "<strong>Central Meeting Zone</strong> everyone is seated and the live Q&A on OpenClaw business use has started."
      )
    );
  }

  meetingState.discussionCooldown -= delta;
  const currentSpeaker = meetingState.currentSpeakerId
    ? npcs.find((npc) => npc.id === meetingState.currentSpeakerId) ?? null
    : null;

  if (currentSpeaker && currentSpeaker.meetingStatus !== "seated") {
    meetingState.currentSpeakerId = "";
  }

  if (currentSpeaker && currentSpeaker.bubbleTimer > 0) {
    return;
  }

  if (currentSpeaker && currentSpeaker.bubbleTimer <= 0) {
    meetingState.currentSpeakerId = "";
  }

  if (meetingState.discussionCooldown > 0) {
    return;
  }

  const pendingQuestioner = meetingState.pendingQuestionerId
    ? participants.find((npc) => npc.id === meetingState.pendingQuestionerId) ?? null
    : null;
  const pendingResponder = meetingState.pendingResponderId
    ? participants.find((npc) => npc.id === meetingState.pendingResponderId) ?? null
    : null;

  if (meetingState.pendingResponderId && (!pendingQuestioner || !pendingResponder)) {
    meetingState.pendingQuestionerId = "";
    meetingState.pendingResponderId = "";
    meetingState.discussionCooldown = 0.35;
    meetingState.phaseKind = "ready";
    meetingState.phaseDuration = 0.35;
    return;
  }

  if (pendingQuestioner && pendingResponder) {
    clearMeetingSpeechBubbles(pendingResponder.id);
    const line = getMeetingAnswerLine(pendingResponder, pendingQuestioner, meetingState.pendingTopicTurn);
    const responseRound = getMeetingRoundNumber("response");
    pendingResponder.bubbleText = line;
    pendingResponder.bubbleTimer = clamp(getBubbleDuration(line) + 0.8, 3.1, 6);
    pendingResponder.bubbleCooldown = randomBetween(6.4, 9.2);
    meetingState.currentSpeakerId = pendingResponder.id;
    meetingState.lastSpeakerId = pendingResponder.id;
    meetingState.pendingQuestionerId = "";
    meetingState.pendingResponderId = "";
    meetingState.discussionTurn += 1;
    meetingState.phaseKind = "response";
    meetingState.phaseDuration = pendingResponder.bubbleTimer;
    meetingState.discussionCooldown = pendingResponder.bubbleTimer + randomBetween(0.45, 0.9);
    triggerMeetingStageCue(
      pickUiText("回应接棒", "Reply Handoff"),
      pickUiText(
        `${trimSpeechSegment(pendingResponder.name, 4)} 接 ${trimSpeechSegment(pendingQuestioner.name, 4)}`,
        `${trimSpeechSegment(pendingResponder.name, 4)} replies to ${trimSpeechSegment(pendingQuestioner.name, 4)}`
      ),
      "#f4cf7d",
      "response",
      pendingResponder.id,
      pendingQuestioner.id
    );
    pushMeetingTimelineEntry({
      round: responseRound,
      stage: "response",
      speakerName: pendingResponder.name,
      counterpartName: pendingQuestioner.name,
      speakerDepartment: pendingResponder.department.shortName,
      accent: "#f4cf7d",
      summary: pickUiText(
        `${trimSpeechSegment(pendingResponder.name, 4)} 接 ${trimSpeechSegment(pendingQuestioner.name, 4)} · ${trimSpeechSegment(extractSpeechBody(line), 14)}`,
        `${trimSpeechSegment(pendingResponder.name, 4)} replies to ${trimSpeechSegment(pendingQuestioner.name, 4)} · ${trimSpeechSegment(extractSpeechBody(line), 14)}`
      ),
    });
    setLastEvent(
      pickUiText(
        `${pendingResponder.name} 正在回应 ${pendingQuestioner.name} 的问题`,
        `${pendingResponder.name} is responding to ${pendingQuestioner.name}`
      )
    );
    return;
  }

  const questioner = pickRandomMeetingParticipant(participants, [meetingState.lastSpeakerId]);
  if (!questioner) {
    return;
  }

  const responder = pickRandomMeetingParticipant(
    participants,
    [questioner.id],
    (npc) => npc.department.id !== questioner.department.id
  ) ?? pickRandomMeetingParticipant(participants, [questioner.id]);
  if (!responder) {
    return;
  }

  clearMeetingSpeechBubbles(questioner.id);
  const line = getMeetingQuestionLine(questioner, responder, meetingState.discussionTurn);
  const askRound = getMeetingRoundNumber("ask");
  questioner.bubbleText = line;
  questioner.bubbleTimer = clamp(getBubbleDuration(line) + 0.85, 3.2, 6.2);
  questioner.bubbleCooldown = randomBetween(6.8, 9.8);
  meetingState.currentSpeakerId = questioner.id;
  meetingState.lastSpeakerId = questioner.id;
  meetingState.pendingQuestionerId = questioner.id;
  meetingState.pendingResponderId = responder.id;
  meetingState.pendingTopicTurn = meetingState.discussionTurn;
  meetingState.discussionTurn += 1;
  meetingState.phaseKind = "ask";
  meetingState.phaseDuration = questioner.bubbleTimer;
  meetingState.discussionCooldown = questioner.bubbleTimer + randomBetween(0.45, 0.9);
  triggerMeetingStageCue(
    pickUiText("提问切镜", "Question Focus"),
    pickUiText(
      `${trimSpeechSegment(questioner.name, 4)} 问 ${trimSpeechSegment(responder.name, 4)}`,
      `${trimSpeechSegment(questioner.name, 4)} asks ${trimSpeechSegment(responder.name, 4)}`
    ),
    "#ffd98b",
    "ask",
    questioner.id,
    responder.id
  );
  pushMeetingTimelineEntry({
    round: askRound,
    stage: "ask",
    speakerName: questioner.name,
    counterpartName: responder.name,
    speakerDepartment: questioner.department.shortName,
    accent: "#ffd98b",
    summary: pickUiText(
      `${trimSpeechSegment(questioner.name, 4)} 问 ${trimSpeechSegment(responder.name, 4)} · ${trimSpeechSegment(extractSpeechBody(line), 14)}`,
      `${trimSpeechSegment(questioner.name, 4)} asks ${trimSpeechSegment(responder.name, 4)} · ${trimSpeechSegment(extractSpeechBody(line), 14)}`
    ),
  });
  setLastEvent(
    pickUiText(
      `${questioner.name} 正在向 ${responder.name} 提问`,
      `${questioner.name} is asking ${responder.name}`
    )
  );
}

function updateNpcActors(delta: number): void {
  officeFlowClock += delta;
  const visibleBubbleCount = npcs.filter(
    (candidate) => candidate.meetingStatus === "office" && isNpcBubbleVisibleOnScreen(candidate)
  ).length;
  for (const npc of npcs) {
    npc.actionTimer -= delta;
    npc.bubbleCooldown -= delta;
    npc.socialCooldown -= delta;
    if ((npc.meetingStatus === "office" || npc.meetingStatus === "seated") && npc.bubbleTimer > 0) {
      npc.bubbleTimer -= delta;
      if (npc.bubbleTimer <= 0) {
        npc.bubbleText = "";
      }
    } else if (npc.meetingStatus !== "office" && npc.meetingStatus !== "seated") {
      npc.bubbleText = "";
      npc.bubbleTimer = 0;
    }

    if (
      npc.meetingStatus === "office" &&
      npc.bubbleCooldown <= 0 &&
      npc.bubbleTimer <= 0 &&
      visibleBubbleCount < MAX_VISIBLE_NPC_BUBBLES &&
      Math.random() < NPC_BUBBLE_TRIGGER_CHANCE
    ) {
      npc.bubbleText = pickNpcBubbleText(npc.id);
      npc.bubbleTimer = getBubbleDuration(npc.bubbleText) + randomBetween(0, 0.4);
      npc.bubbleCooldown = randomBetween(5.8, 10.5);
    }

    if (npc.meetingStatus === "queued") {
      npc.meetingDelay -= delta;
      npc.target = { x: npc.x, y: npc.y };
      npc.route = [];
      npc.action = "working";
      npc.step = 0;
      if (npc.meetingDelay <= 0) {
        sendNpcToMeetingSeat(npc);
      }
      continue;
    }

    if (npc.meetingStatus === "seated") {
      settleNpcAtMeetingSeat(npc);
      continue;
    }

    if (npc.meetingStatus === "office" && npc.stationary) {
      npc.x = npc.home.x;
      npc.y = npc.home.y;
      npc.target = npc.home;
      npc.route = [];
      npc.action = "working";
      npc.step = 0;
      continue;
    }

    if (npc.action === "walking") {
      const dx = npc.target.x - npc.x;
      const dy = npc.target.y - npc.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.4) {
        npc.x = npc.target.x;
        npc.y = npc.target.y;
        const nextWaypoint = npc.route.shift();
        if (nextWaypoint) {
          npc.target = nextWaypoint;
          npc.facing = getFacingDirection(npc.target.x - npc.x, npc.target.y - npc.y, npc.facing);
        } else {
          if (npc.meetingStatus === "walking-to-seat") {
            settleNpcAtMeetingSeat(npc);
          } else if (npc.meetingStatus === "walking-home") {
            settleNpcAtOffice(npc);
          } else {
            npc.action = "working";
            npc.actionTimer = getNpcIdleDuration(npc.target);
          }
        }
      } else {
        const effectiveSpeed = npc.meetingStatus === "walking-to-seat"
          ? npc.speed * NPC_MEETING_SUMMON_SPEED_MULTIPLIER
          : npc.speed;
        const step = Math.min(distance, effectiveSpeed * delta);
        npc.x += (dx / distance) * step;
        npc.y += (dy / distance) * step;
        npc.facing = getFacingDirection(dx, dy, npc.facing);
        npc.step += delta * 10;
      }
      continue;
    }

    npc.step = 0;
    if (npc.meetingStatus !== "office") {
      continue;
    }

    if (npc.actionTimer <= 0) {
      startNpcRoute(npc, chooseNpcRoute(npc));
    }
  }

  tryStartAmbientNpcConversation(visibleBubbleCount);
  updateMeetingDiscussion(delta);
}

function updateStats(): void {
  const completedCount = completedScenarios.size;
  const impactScore = allScenarios
    .filter((scenario) => completedScenarios.has(scenario.id))
    .reduce((sum, scenario) => sum + scenario.impactScore, 0);

  completedCountElement.textContent = `${completedCount}/${allScenarios.length}`;
  impactScoreElement.textContent = String(impactScore);
  insightCountElement.textContent = String(collectedInsights.size);

  if (completedCount >= 18) {
    executionStageElement.textContent = getExecutionStageLabel("network");
  } else if (completedCount >= 12) {
    executionStageElement.textContent = getExecutionStageLabel("collaborate");
  } else if (completedCount >= 6) {
    executionStageElement.textContent = getExecutionStageLabel("orchestrate");
  } else {
    executionStageElement.textContent = getExecutionStageLabel("assist");
  }
}

function collectInsight(node: InsightNode): void {
  clearMobileMoveTarget();
  const wasFullyCompleted = isDepartmentFullyCompleted(node.department);
  collectedInsights.add(node.id);
  updateStats();
  renderDepartmentList();
  triggerGoalRelayTransition({ type: "insight", value: node });
  if (!wasFullyCompleted && isDepartmentFullyCompleted(node.department)) {
    triggerDepartmentMilestone(node.department);
  }
  setLastEvent(pickUiText(`${node.department.shortName} 记录洞察`, `${node.department.shortName} logged an insight`));
  showToast(
    pickUiText(
      `<strong>${node.department.shortName}</strong> 已记录洞察：${node.fact}`,
      `<strong>${node.department.shortName}</strong> captured insight: ${node.fact}`
    )
  );
}

function runScenario(scenarioId: string, department: SceneDepartment): void {
  const scenario = department.scenarios.find((item) => item.id === scenarioId);
  if (!scenario) {
    return;
  }

  const wasFullyCompleted = isDepartmentFullyCompleted(department);
  completedScenarios.add(scenario.id);
  updateStats();
  renderDepartmentList();
  triggerGoalRelayTransition(
    getScenarioInteractionTarget(department, scenario.id) ??
      (getDepartmentGuide(department) ? { type: "guide", value: getDepartmentGuide(department)! } : { type: "insight", value: department.insight })
  );
  if (!wasFullyCompleted && isDepartmentFullyCompleted(department)) {
    triggerDepartmentMilestone(department);
  }
  openDepartmentModal(department, scenario.id);
  setLastEvent(pickUiText(`${department.shortName} 执行 ${scenario.title}`, `${department.shortName} ran ${scenario.title}`));
  showToast(
    pickUiText(
      `<strong>${department.shortName}</strong> 已执行场景：${scenario.title}`,
      `<strong>${department.shortName}</strong> ran scene: ${scenario.title}`
    )
  );
}

function openExternalTerminal(terminal: ExternalTerminal): void {
  const popup = window.open(
    terminal.url,
    terminal.id,
    "popup=yes,width=1320,height=860,left=120,top=80,resizable=yes,scrollbars=yes"
  );

  if (!popup) {
    setLastEvent(
      pickUiText(
        `${terminal.department.shortName} 网页终端被拦截`,
        `${terminal.department.shortName} web terminal was blocked`
      )
    );
    showToast(
      pickUiText(
        `<strong>${terminal.department.shortName}</strong> 网页终端弹窗被浏览器拦截。`,
        `<strong>${terminal.department.shortName}</strong> the browser blocked the web terminal popup.`
      )
    );
    return;
  }

  popup.focus();
  setLastEvent(
    pickUiText(
      `${terminal.department.shortName} 打开 ${terminal.label}`,
      `${terminal.department.shortName} opened ${terminal.label}`
    )
  );
  showToast(
    pickUiText(
      `<strong>${terminal.department.shortName}</strong> 已弹窗打开：${terminal.label}`,
      `<strong>${terminal.department.shortName}</strong> opened popup: ${terminal.label}`
    )
  );
}

function openTerminal(terminal: OfficeTerminal): void {
  clearMobileMoveTarget();
  if (terminal.kind === "external") {
    openExternalTerminal(terminal);
    return;
  }

  openDepartmentModal(terminal.department, terminal.scenario.id);
}

function teleportToDepartment(department: SceneDepartment): void {
  clearMobileMoveTarget();
  player.x = department.walkwayRect.left + department.walkwayRect.width / 2;
  player.y = department.walkwayRect.top + department.walkwayRect.height / 2;
  activeDepartmentId = department.id;
  activeSharedZoneId = "";
  currentZoneElement.textContent = getDepartmentUiLabel(department);
  renderDepartmentList();
  setLastEvent(pickUiText(`前往 ${department.shortName} 工位`, `Heading to ${department.shortName} desk`));
  showToast(
    pickUiText(
      `<strong>${department.shortName}</strong> 已切换，工位会话已就绪。`,
      `<strong>${department.shortName}</strong> switched in, and the desk session is ready.`
    )
  );
}

function teleportToSharedZone(zone: SharedZone): void {
  clearMobileMoveTarget();
  player.x = zone.walkwayRect.left + zone.walkwayRect.width / 2;
  player.y = zone.walkwayRect.top + zone.walkwayRect.height / 2;
  activeDepartmentId = "";
  activeSharedZoneId = zone.id;
  currentZoneElement.textContent = getSharedZoneUiLabel(zone);
  renderDepartmentList();
  setLastEvent(pickUiText(`前往 ${zone.label}`, `Heading to ${zone.label}`));
  showToast(
    pickUiText(
      `<strong>${zone.label}</strong> 已切换，公共区动线已对焦。`,
      `<strong>${zone.label}</strong> switched in, and the shared-zone route is now focused.`
    )
  );
}

function isTitleScreenActive(): boolean {
  return titleScreenState.active;
}

function syncTitleScreenUi(): void {
  const isLanguagePhase = titleScreenState.phase === "language";
  document.body.classList.toggle("title-screen-active", titleScreenState.active);
  startScreen.setAttribute("aria-hidden", String(!titleScreenState.active));
  startScreen.dataset.phase = titleScreenState.phase;
  startButton.parentElement?.classList.toggle("hidden", isLanguagePhase);
  startButton.classList.toggle("hidden", isLanguagePhase);
  startLanguagePanel.classList.remove("hidden");

  if (isLanguagePhase) {
    startBadge.textContent = "LANGUAGE SELECT";
    startTitle.textContent = "选择语言 / Choose Language";
    startSubtitle.textContent = "中文 / English";
    startCopy.textContent =
      "先选择界面语言，再进入开始画面。下一页仍可继续切换。 / Choose the UI language first, then continue to the start screen. You can still switch it on the next page.";
    startLanguageLabel.textContent = "界面语言 / UI Language";
  } else {
    startBadge.textContent = getLocalizedString("start.badge");
    startTitle.textContent = getLocalizedString("start.title");
    startSubtitle.textContent = getLocalizedString("start.subtitle");
    startCopy.textContent = getLocalizedString("start.copy");
    startButton.textContent = getLocalizedString("start.button");
    startLanguageLabel.textContent = getLocalizedString("start.languageLabel");
  }

  startLanguageZhButton.classList.toggle("is-active", currentUiLanguage === "zh-CN");
  startLanguageZhButton.setAttribute("aria-pressed", String(currentUiLanguage === "zh-CN"));
  startLanguageEnButton.classList.toggle("is-active", currentUiLanguage === "en");
  startLanguageEnButton.setAttribute("aria-pressed", String(currentUiLanguage === "en"));
}

function selectTitleScreenLanguage(language: UiLanguage): void {
  currentUiLanguage = language;
  titleScreenState.phase = "intro";
  applyUiLanguage();
  syncTitleScreenUi();
}

function enterTitleExperience(): void {
  titleScreenState.active = false;
  titleScreenState.phase = "intro";
  keys.clear();
  touchControls.clear();
  clearMobileMoveTarget();
  hoveredGuide = null;
  hoveredTerminal = null;
  hoveredInsight = null;
  hoveredPodium = null;
  applyUiLanguage();
  syncTitleScreenUi();
  lastFrameTime = performance.now();
}

function syncUiVisibility(): void {
  document.body.classList.toggle("ui-minimal", uiMinimal);
  uiToggleButton.setAttribute("aria-pressed", String(uiMinimal));
  uiToggleButton.textContent = uiMinimal ? getLocalizedString("uiToggle.show") : getLocalizedString("uiToggle.hide");
}

function worldToScreen(x: number, y: number): Point {
  return {
    x: Math.round((x - camera.x) * camera.zoom + surface.width / 2),
    y: Math.round((y - camera.y) * camera.zoom + surface.height / 2),
  };
}

function rectToScreen(rect: Rect): Rect {
  const topLeft = worldToScreen(rect.left, rect.top);
  return {
    left: topLeft.x,
    top: topLeft.y,
    width: Math.round(rect.width * camera.zoom),
    height: Math.round(rect.height * camera.zoom),
  };
}

function isScreenRectVisible(rect: Rect): boolean {
  return rect.left + rect.width >= 0 && rect.left <= surface.width && rect.top + rect.height >= 0 && rect.top <= surface.height;
}

function drawPixelFrame(
  context: CanvasRenderingContext2D,
  rect: Rect,
  fill: string,
  border: string,
  shadow = "#040610",
  shadowOffset = 3
): void {
  context.fillStyle = shadow;
  context.fillRect(rect.left + shadowOffset, rect.top + shadowOffset, rect.width, rect.height);
  context.fillStyle = fill;
  context.fillRect(rect.left, rect.top, rect.width, rect.height);
  context.fillStyle = border;
  context.fillRect(rect.left, rect.top, rect.width, 2);
  context.fillRect(rect.left, rect.top + rect.height - 2, rect.width, 2);
  context.fillRect(rect.left, rect.top, 2, rect.height);
  context.fillRect(rect.left + rect.width - 2, rect.top, 2, rect.height);
}

function drawRoomFrame(
  context: CanvasRenderingContext2D,
  room: Rect,
  opening: Rect,
  fill: string,
  border: string,
  shadow = "#040610",
  shadowOffset = 3,
  approachSide: RoomApproachSide
): void {
  context.fillStyle = shadow;
  context.fillRect(room.left + shadowOffset, room.top + shadowOffset, room.width, room.height);
  context.fillStyle = fill;
  context.fillRect(room.left, room.top, room.width, room.height);

  const thickness = 2;
  const openingLeft = clamp(opening.left, room.left, room.left + room.width);
  const openingRight = clamp(opening.left + opening.width, room.left, room.left + room.width);

  context.fillStyle = border;
  context.fillRect(room.left, room.top, room.width, thickness);
  context.fillRect(room.left, room.top, thickness, room.height);
  context.fillRect(room.left + room.width - thickness, room.top, thickness, room.height);
  context.fillRect(room.left, room.top + room.height - thickness, room.width, thickness);

  if (approachSide === "down") {
    context.clearRect(openingLeft, room.top + room.height - thickness, openingRight - openingLeft, thickness);
  } else {
    context.clearRect(openingLeft, room.top, openingRight - openingLeft, thickness);
  }
}

function drawPattern(
  context: CanvasRenderingContext2D,
  rect: Rect,
  primary: string,
  secondary: string,
  step = 8
): void {
  context.save();
  context.beginPath();
  context.rect(rect.left, rect.top, rect.width, rect.height);
  context.clip();

  for (let y = rect.top; y < rect.top + rect.height; y += step) {
    for (let x = rect.left; x < rect.left + rect.width; x += step) {
      context.fillStyle = ((x + y) / step) % 2 === 0 ? primary : secondary;
      context.fillRect(x, y, Math.max(2, step - 2), Math.max(2, step - 2));
    }
  }

  context.restore();
}

function drawAmbientRoomShell(room: Rect, floorRect: Rect, accent: string, elapsed: number, seed: number): void {
  const headerHeight = Math.max(6, Math.round(room.height * 0.08));
  const sideShadeWidth = Math.max(4, Math.round(room.width * 0.04));
  const footerHeight = Math.max(6, Math.round(room.height * 0.07));
  const lightWidth = Math.max(10, Math.round(room.width * 0.11));
  const lightGap = Math.max(10, Math.round(room.width * 0.05));
  const lightCount = Math.max(2, Math.floor((floorRect.width - 16 + lightGap) / (lightWidth + lightGap)));
  const lightSpan = lightCount * lightWidth + Math.max(0, lightCount - 1) * lightGap;
  const lightStart = floorRect.left + Math.max(6, Math.round((floorRect.width - lightSpan) / 2));
  const footerTop = floorRect.top + floorRect.height - footerHeight - 2;
  const footerWidth = Math.max(16, floorRect.width - 20);
  const footerLeft = floorRect.left + Math.round((floorRect.width - footerWidth) / 2);
  const cableX = floorRect.left + Math.round(lerp(0.24, 0.76, hashUnit(seed * 17 + 5)) * floorRect.width);

  surfaceContext.fillStyle = "#1b2334";
  surfaceContext.fillRect(floorRect.left, floorRect.top, floorRect.width, headerHeight);
  surfaceContext.fillStyle = withAlpha(accent, 0.32);
  surfaceContext.fillRect(floorRect.left + 4, floorRect.top + headerHeight - 2, floorRect.width - 8, 2);

  for (let index = 0; index < lightCount; index += 1) {
    const left = lightStart + index * (lightWidth + lightGap);
    surfaceContext.fillStyle = "#5e687d";
    surfaceContext.fillRect(left, floorRect.top + 3, lightWidth, 4);
    surfaceContext.fillStyle = pulseColor(elapsed + seed * 0.08 + index * 0.35, "#f7fbff", adjustHex(accent, 26));
    surfaceContext.fillRect(left + 2, floorRect.top + 4, Math.max(4, lightWidth - 4), 2);
  }

  surfaceContext.fillStyle = "rgba(8, 11, 19, 0.22)";
  surfaceContext.fillRect(floorRect.left, floorRect.top + headerHeight, sideShadeWidth, floorRect.height - headerHeight);
  surfaceContext.fillRect(
    floorRect.left + floorRect.width - sideShadeWidth,
    floorRect.top + headerHeight,
    sideShadeWidth,
    floorRect.height - headerHeight
  );

  surfaceContext.fillStyle = "#202838";
  surfaceContext.fillRect(footerLeft, footerTop, footerWidth, footerHeight);
  surfaceContext.fillStyle = withAlpha(accent, 0.26);
  surfaceContext.fillRect(footerLeft + 3, footerTop + 2, footerWidth - 6, 2);
  for (let index = 0; index < 4; index += 1) {
    const progress = index / 3;
    const tickLeft = Math.round(lerp(footerLeft + 8, footerLeft + footerWidth - 16, progress));
    surfaceContext.fillStyle = pulseColor(elapsed + seed * 0.05 + index * 0.4, adjustHex(accent, 22), "#dce6f5");
    surfaceContext.fillRect(tickLeft, footerTop + footerHeight - 3, 6, 1);
  }

  surfaceContext.fillStyle = withAlpha(adjustHex(accent, -18), 0.18);
  surfaceContext.fillRect(cableX, floorRect.top + headerHeight + 4, 2, Math.max(10, floorRect.height - headerHeight - footerHeight - 10));
  surfaceContext.fillStyle = withAlpha("#dbe5f4", 0.42);
  surfaceContext.fillRect(cableX - 2, floorRect.top + headerHeight + 10, 6, 1);
}

function drawCorridorZoneAccent(rect: Rect, accent: string, elapsed: number, seed: number): void {
  const bannerHeight = Math.max(6, Math.round(rect.height * 0.12));
  const footerTop = rect.top + rect.height - Math.max(8, Math.round(rect.height * 0.14));

  surfaceContext.fillStyle = "rgba(10, 14, 22, 0.22)";
  surfaceContext.fillRect(rect.left + 4, rect.top + 4, rect.width - 8, bannerHeight);
  surfaceContext.fillStyle = withAlpha(accent, 0.24);
  surfaceContext.fillRect(rect.left + 6, rect.top + 6, rect.width - 12, 2);
  surfaceContext.fillStyle = withAlpha(adjustHex(accent, 26), 0.22);
  surfaceContext.fillRect(rect.left + 6, footerTop, rect.width - 12, 3);

  for (let index = 0; index < 3; index += 1) {
    const lightLeft = rect.left + rect.width - 24 + index * 5;
    surfaceContext.fillStyle = pulseColor(elapsed + seed * 0.2 + index * 0.3, adjustHex(accent, 20), "#f7fbff");
    surfaceContext.fillRect(lightLeft, rect.top + 6, 3, 3);
  }
}

function drawCorridorFlowRibbon(floor: Rect, laneY: number, elapsed: number): void {
  if (!shouldShowTaskPrompts()) {
    return;
  }

  const promptTarget = getNavigationTarget();
  const topDepartment = getTopActiveDepartment();
  const topSharedZone = getTopSharedZone();
  const focusCenter = getNavigationFocusCenter(promptTarget) ??
    (topDepartment ? rectCenter(topDepartment.roomRect) : topSharedZone ? rectCenter(topSharedZone.roomRect) : null);
  if (!focusCenter) {
    return;
  }

  const accent = promptTarget
    ? getInteractionTargetIndicatorAccent(promptTarget)
    : topDepartment
      ? topDepartment.accent
      : topSharedZone?.accent ?? "#89d0ff";
  const targetPoint = worldToScreen(focusCenter.x, focusCenter.y);
  const startX = Math.round(floor.left + floor.width / 2);
  const clampedTargetX = clamp(targetPoint.x, floor.left + 18, floor.left + floor.width - 18);
  const direction = clampedTargetX >= startX ? 1 : -1;
  const span = Math.abs(clampedTargetX - startX);
  if (span < 20) {
    return;
  }

  const step = 18;
  const pulseOffset = (elapsed * 44) % step;
  for (let traveled = 0; traveled <= span; traveled += step) {
    const x = Math.round(startX + direction * Math.min(span, traveled + pulseOffset));
    const alpha = 0.16 + (1 - traveled / span) * 0.18;
    surfaceContext.fillStyle = withAlpha(accent, alpha);
    surfaceContext.fillRect(x - 4, laneY - 7, 8, 1);
    surfaceContext.fillRect(x - 3, laneY - 6, 6, 1);
    surfaceContext.fillRect(x - 2, laneY + 5, 4, 1);
  }

  surfaceContext.fillStyle = withAlpha("#f7fbff", 0.42);
  surfaceContext.fillRect(clampedTargetX - 2, laneY - 8, 4, 16);
}

function drawCorridorSprintLane(floor: Rect, laneY: number, elapsed: number): void {
  if (!shouldShowTaskPrompts()) {
    return;
  }

  const strategicDepartment = getStrategicDepartmentCandidate();
  if (!strategicDepartment || isDepartmentFullyCompleted(strategicDepartment)) {
    return;
  }

  const walkwayCenter = rectCenter(strategicDepartment.walkwayRect);
  const targetPoint = worldToScreen(walkwayCenter.x, walkwayCenter.y);
  const startX = Math.round(floor.left + floor.width / 2);
  const endX = clamp(targetPoint.x, floor.left + 18, floor.left + floor.width - 18);
  const direction = endX >= startX ? 1 : -1;
  const span = Math.abs(endX - startX);
  if (span < 24) {
    return;
  }

  const accent = strategicDepartment.accent;
  const laneOffset = strategicDepartment.approachSide === "down" ? 10 : -10;
  const sprintY = laneY + laneOffset;
  const backlogRatio = getDepartmentBacklogRatio(strategicDepartment);
  const pulseOffset = (elapsed * 52) % 16;
  surfaceContext.fillStyle = withAlpha(accent, 0.1 + backlogRatio * 0.08);
  surfaceContext.fillRect(Math.min(startX, endX), sprintY - 1, span, 2);
  for (let traveled = 0; traveled <= span; traveled += 16) {
    const x = Math.round(startX + direction * Math.min(span, traveled + pulseOffset));
    const alpha = 0.18 + (1 - traveled / span) * 0.24;
    surfaceContext.fillStyle = withAlpha(accent, alpha);
    surfaceContext.fillRect(x - 3, sprintY - 3, 6, 1);
    surfaceContext.fillRect(x - 2, sprintY + 2, 4, 1);
  }
  surfaceContext.fillStyle = withAlpha("#f7fbff", 0.78);
  surfaceContext.fillRect(endX - 2, sprintY - 4, 4, 8);
  drawSceneRouteStepBadge({ x: endX, y: sprintY - 10 }, "S", accent, true);
}

function drawContactShadow(rect: Rect, alpha = 0.18, inset = 4): void {
  const clampedInset = Math.max(1, Math.min(inset, Math.floor(rect.width / 3)));
  const width = Math.max(4, rect.width - clampedInset * 2);
  surfaceContext.fillStyle = `rgba(8, 10, 18, ${alpha})`;
  surfaceContext.fillRect(rect.left + clampedInset, rect.top + rect.height - 1, width, 3);
}

function drawFloorWear(rect: Rect, accent: string, seed: number): void {
  for (let index = 0; index < 4; index += 1) {
    const width = 8 + Math.round(hashUnit(seed * 19 + index * 13 + 1) * 16);
    const left = rect.left + 6 + Math.round((rect.width - width - 12) * hashUnit(seed * 31 + index * 17 + 3));
    const top = rect.top + 8 + Math.round((rect.height - 16) * hashUnit(seed * 43 + index * 11 + 7));
    surfaceContext.fillStyle = withAlpha(index % 2 === 0 ? adjustHex(accent, -18) : "#f7fbff", index % 2 === 0 ? 0.08 : 0.05);
    surfaceContext.fillRect(left, top, width, 1);
  }

  const footprintLeft = rect.left + Math.round(rect.width * 0.18);
  const footprintTop = rect.top + rect.height - 12;
  surfaceContext.fillStyle = withAlpha(adjustHex(accent, -28), 0.08);
  surfaceContext.fillRect(footprintLeft, footprintTop, 8, 2);
  surfaceContext.fillRect(footprintLeft + 12, footprintTop + 1, 8, 2);
}

function drawGlassPanel(rect: Rect, accent: string, alpha = 0.24): void {
  surfaceContext.fillStyle = `rgba(235, 244, 255, ${alpha})`;
  surfaceContext.fillRect(rect.left, rect.top, rect.width, rect.height);
  surfaceContext.fillStyle = withAlpha(adjustHex(accent, 24), Math.min(0.5, alpha + 0.1));
  surfaceContext.fillRect(rect.left, rect.top, rect.width, 1);
  surfaceContext.fillRect(rect.left, rect.top, 1, rect.height);
  surfaceContext.fillStyle = "rgba(255,255,255,0.38)";
  surfaceContext.fillRect(rect.left + 2, rect.top + 1, Math.max(2, rect.width - 4), 1);
}

function drawEntranceGuide(
  room: Rect,
  walkway: Rect,
  accent: string,
  approachSide: RoomApproachSide,
  elapsed: number,
  pulseOffset: number,
  active = false
): void {
  const guideWidth = Math.max(4, Math.round(walkway.width / 4));
  const guideLeft = walkway.left + Math.round((walkway.width - guideWidth) / 2);
  const thresholdY = approachSide === "down" ? room.top + room.height - 4 : room.top + 2;
  const beaconY = approachSide === "down" ? room.top + room.height - 8 : room.top + 4;
  const readerX = guideLeft + guideWidth + 4;
  const readerY = approachSide === "down" ? room.top + room.height - 12 : room.top + 4;

  surfaceContext.fillStyle = withAlpha(accent, active ? 0.72 : 0.34);
  surfaceContext.fillRect(guideLeft, walkway.top + 3, guideWidth, Math.max(4, walkway.height - 6));
  surfaceContext.fillRect(walkway.left + 2, walkway.top + 2, walkway.width - 4, 2);
  surfaceContext.fillRect(walkway.left + 2, walkway.top + walkway.height - 4, walkway.width - 4, 2);

  surfaceContext.fillStyle = active ? "#f7fbff" : adjustHex(accent, 14);
  surfaceContext.fillRect(walkway.left + 4, thresholdY, walkway.width - 8, 2);

  surfaceContext.fillStyle = pulseColor(elapsed + pulseOffset, accent, "#f7fbff");
  surfaceContext.fillRect(walkway.left + 2, beaconY, 3, 3);
  surfaceContext.fillRect(walkway.left + walkway.width - 5, beaconY, 3, 3);
  surfaceContext.fillStyle = "#161b29";
  surfaceContext.fillRect(guideLeft - 3, thresholdY - 2, 3, 4);
  surfaceContext.fillRect(guideLeft + guideWidth, thresholdY - 2, 3, 4);
  surfaceContext.fillStyle = "#2e384d";
  surfaceContext.fillRect(readerX, readerY, 4, 8);
  surfaceContext.fillStyle = pulseColor(elapsed + pulseOffset * 0.7, active ? "#f7fbff" : accent, "#8be08c");
  surfaceContext.fillRect(readerX + 1, readerY + 2, 2, 2);
}

function drawBackdrop(elapsed: number): void {
  surfaceContext.fillStyle = "#22263f";
  surfaceContext.fillRect(0, 0, surface.width, surface.height);

  const office = rectToScreen(officeRect);
  surfaceContext.fillStyle = "#0c0e18";
  surfaceContext.fillRect(office.left + 8, office.top + 8, office.width, office.height);
  surfaceContext.fillStyle = "#1a1d30";
  surfaceContext.fillRect(office.left, office.top, office.width, office.height);

  starfield.forEach((star, index) => {
    const driftX = star.x + Math.sin(elapsed * 0.3 + index * 0.6) * star.speed;
    const driftY = star.y + Math.cos(elapsed * 0.4 + index * 0.7) * 0.8;
    const point = worldToScreen(driftX, driftY);
    surfaceContext.fillStyle = withAlpha("#d5dbf7", star.alpha * 0.55);
    surfaceContext.fillRect(point.x, point.y, star.size, star.size);
  });

  surfaceContext.fillStyle = "rgba(143, 170, 255, 0.05)";
  surfaceContext.fillRect(office.left + 24, office.top + 18, office.width - 48, 42);
  surfaceContext.fillStyle = "rgba(8, 10, 18, 0.18)";
  surfaceContext.fillRect(office.left, office.top, 18, office.height);
  surfaceContext.fillRect(office.left + office.width - 18, office.top, 18, office.height);
}

function drawCorridor(elapsed: number): void {
  const office = rectToScreen(officeRect);
  const floor = rectToScreen(corridorRect);
  const introRug = rectToScreen(introPromoRugRect);
  const wall = rectToScreen({ left: officeRect.left, top: officeRect.top, width: officeRect.width, height: WALL_HEIGHT });
  const resourceHub = rectToScreen(resourceHubRect);
  const lounge = rectToScreen(centralLoungeRect);
  const refreshHub = rectToScreen(refreshHubRect);
  const ticker = rectToScreen(corridorTickerRect);
  const promptTargetDepartment = getPromptTargetDepartment();
  const tickerStatus = getCorridorTickerStatus();
  const zoneStep = Math.max(10, Math.round(camera.zoom * 7));
  const drawZone = (rect: Rect, primary: string, secondary: string, border: string): void => {
    surfaceContext.fillStyle = primary;
    surfaceContext.fillRect(rect.left, rect.top, rect.width, rect.height);
    drawPattern(surfaceContext, rect, primary, secondary, zoneStep);
    surfaceContext.fillStyle = border;
    surfaceContext.fillRect(rect.left, rect.top, rect.width, 2);
    surfaceContext.fillRect(rect.left, rect.top + rect.height - 2, rect.width, 2);
    surfaceContext.fillRect(rect.left, rect.top, 2, rect.height);
    surfaceContext.fillRect(rect.left + rect.width - 2, rect.top, 2, rect.height);
  };
  const drawHangingSign = (rect: Rect, accent: string, seed: number): void => {
    const signWidth = Math.max(22, Math.round(rect.width * 0.44));
    const signHeight = 10;
    const signLeft = rect.left + Math.round((rect.width - signWidth) / 2);
    const signTop = rect.top + 8;
    drawPixelFrame(
      surfaceContext,
      { left: signLeft, top: signTop, width: signWidth, height: signHeight },
      "#2b3850",
      adjustHex(accent, 18),
      "#090b12",
      1
    );
    surfaceContext.fillStyle = pulseColor(elapsed + seed * 0.4, adjustHex(accent, 20), "#f7fbff");
    surfaceContext.fillRect(signLeft + 4, signTop + 3, signWidth - 8, 2);
    surfaceContext.fillStyle = withAlpha(accent, 0.28);
    surfaceContext.fillRect(signLeft + 6, signTop + 6, signWidth - 12, 1);
    surfaceContext.fillStyle = "#51627e";
    surfaceContext.fillRect(signLeft + 5, signTop - 6, 1, 6);
    surfaceContext.fillRect(signLeft + signWidth - 6, signTop - 6, 1, 6);
  };

  drawPixelFrame(surfaceContext, office, "#7f856f", "#262b44", "#0a0c14", 4);
  surfaceContext.fillStyle = "#738063";
  surfaceContext.fillRect(floor.left, floor.top, floor.width, floor.height);
  drawPattern(surfaceContext, floor, "#c7ba99", "#b9ab89", Math.max(10, Math.round(camera.zoom * 8)));
  const laneY = Math.round(floor.top + floor.height / 2);
  const strategicDepartment = getStrategicDepartmentCandidate();
  surfaceContext.fillStyle = "#d6ccb5";
  surfaceContext.fillRect(floor.left + 20, laneY - 1, floor.width - 40, 2);
  for (let index = 0; index < Math.max(6, Math.floor((floor.width - 64) / 34)); index += 1) {
    const dashLeft = floor.left + 28 + index * 34;
    surfaceContext.fillStyle = index % 2 === 0 ? "#f7f1e2" : "#a39578";
    surfaceContext.fillRect(dashLeft, laneY - 3, 12, 1);
    surfaceContext.fillRect(dashLeft + 4, laneY + 2, 8, 1);
  }
  drawCorridorFlowRibbon(floor, laneY, elapsed);
  drawCorridorSprintLane(floor, laneY, elapsed);
  drawPixelFrame(surfaceContext, introRug, "#314667", "#b4f263", "#0a0c14", 2);
  surfaceContext.fillStyle = "#5a78a5";
  surfaceContext.fillRect(introRug.left + 4, introRug.top + 4, introRug.width - 8, introRug.height - 8);
  surfaceContext.fillStyle = "#dff7a2";
  surfaceContext.fillRect(introRug.left + 8, introRug.top + 7, introRug.width - 16, 2);
  surfaceContext.fillRect(introRug.left + 8, introRug.top + introRug.height - 9, introRug.width - 16, 2);
  surfaceContext.fillStyle = "#89d0ff";
  surfaceContext.fillRect(introRug.left + 10, introRug.top + 11, introRug.width - 20, 3);
  surfaceContext.fillRect(introRug.left + 10, introRug.top + introRug.height - 14, introRug.width - 20, 3);
  surfaceContext.fillStyle = "#23344e";
  surfaceContext.fillRect(introRug.left + Math.round(introRug.width / 2) - 2, introRug.top + 6, 4, introRug.height - 12);
  surfaceContext.fillRect(introRug.left + 6, introRug.top + Math.round(introRug.height / 2) - 1, introRug.width - 12, 2);
  drawZone(resourceHub, "#68778c", "#5c687c", "#97b2dc");
  drawZone(lounge, "#7a6d63", "#6e6158", "#bf9f84");
  drawZone(refreshHub, "#6a5d55", "#5d5149", "#d6bb92");
  drawCorridorZoneAccent(resourceHub, "#9bc8ff", elapsed, 1);
  drawCorridorZoneAccent(lounge, "#f0c38b", elapsed, 2);
  drawCorridorZoneAccent(refreshHub, "#f5cf9c", elapsed, 3);
  drawHangingSign(resourceHub, "#9bc8ff", 1);
  drawHangingSign(lounge, "#f0c38b", 2);
  drawHangingSign(refreshHub, "#f5cf9c", 3);
  departmentConcourseRects.forEach((rect) => {
    const concourse = rectToScreen(rect);
    surfaceContext.fillStyle = "#8793a5";
    surfaceContext.fillRect(concourse.left, concourse.top, concourse.width, concourse.height);
    drawPattern(surfaceContext, concourse, "#dce2eb", "#cfd6df", Math.max(10, Math.round(camera.zoom * 7)));
    surfaceContext.fillStyle = "#6c7b96";
    surfaceContext.fillRect(concourse.left, concourse.top, concourse.width, 2);
    surfaceContext.fillRect(concourse.left, concourse.top + concourse.height - 2, concourse.width, 2);
    surfaceContext.fillRect(concourse.left, concourse.top, 2, concourse.height);
    surfaceContext.fillRect(concourse.left + concourse.width - 2, concourse.top, 2, concourse.height);
    surfaceContext.fillStyle = "#f7fbff";
    surfaceContext.fillRect(concourse.left + 10, concourse.top + Math.round(concourse.height / 2), concourse.width - 20, 2);
    surfaceContext.fillStyle = "#a9b6cb";
    surfaceContext.fillRect(concourse.left + 16, concourse.top + Math.round(concourse.height / 2) - 4, concourse.width - 32, 1);
  });
  departments.forEach((department, index) => {
    const state = getDepartmentVisualState(department);
    const focused = promptTargetDepartment?.id === department.id;
    const occupancyRatio = getDepartmentOccupancyRatio(department);
    const stateAccent = getDepartmentStateAccent(state);
    const strategic = strategicDepartment?.id === department.id;
    const backlogRatio = getDepartmentBacklogRatio(department);
    const dock = rectToScreen({
      left: department.walkwayRect.left + 2,
      top: department.approachSide === "down" ? corridorRect.top + 8 : corridorRect.top + corridorRect.height - 14,
      width: Math.max(8, department.walkwayRect.width - 4),
      height: 6,
    });
    const dockCenterX = dock.left + Math.round(dock.width / 2);
    const connectorTop = Math.min(laneY, dock.top + dock.height);
    const connectorBottom = Math.max(laneY, dock.top);
    surfaceContext.fillStyle = withAlpha(department.accent, 0.18);
    surfaceContext.fillRect(dockCenterX - 1, connectorTop, 2, Math.max(2, connectorBottom - connectorTop));
    surfaceContext.fillStyle = "rgba(247, 251, 255, 0.42)";
    surfaceContext.fillRect(dockCenterX - 2, laneY - 2, 4, 4);
    surfaceContext.fillStyle = withAlpha(
      department.accent,
      focused ? 0.9 : strategic ? 0.84 : department.id === activeDepartmentId ? 0.78 : 0.42
    );
    surfaceContext.fillRect(dock.left, dock.top, dock.width, dock.height);
    surfaceContext.fillStyle = pulseColor(elapsed + index * 0.4, adjustHex(department.accent, 18), "#f7fbff");
    surfaceContext.fillRect(dock.left + 2, dock.top + 2, Math.max(2, dock.width - 4), 2);
    if (strategic && backlogRatio > 0) {
      surfaceContext.fillStyle = withAlpha(department.accent, 0.2 + backlogRatio * 0.14);
      surfaceContext.fillRect(dock.left + 1, dock.top + dock.height + 1, dock.width - 2, 2);
      drawSceneRouteStepBadge(
        { x: dockCenterX, y: dock.top - 7 },
        "S",
        department.accent,
        true
      );
    }

    const connectorLength = Math.max(6, connectorBottom - connectorTop);
    const flowProgress = (elapsed * (focused ? 2.6 : 1.8) + index * 0.17) % 1;
    const pulseY = Math.round(connectorTop + connectorLength * flowProgress);
    const lanePulseWidth = Math.max(10, Math.round(18 + Math.max(occupancyRatio, strategic ? backlogRatio : 0) * 18));
    surfaceContext.fillStyle = withAlpha(
      focused ? "#f7fbff" : strategic ? department.accent : stateAccent,
      focused ? 0.88 : strategic ? 0.78 : state === "idle" ? 0.38 : 0.66
    );
    surfaceContext.fillRect(dockCenterX - 2, pulseY - 2, 4, 4);
    surfaceContext.fillRect(dockCenterX - Math.round(lanePulseWidth / 2), laneY - 5, lanePulseWidth, 1);
    surfaceContext.fillRect(dockCenterX - Math.round(lanePulseWidth / 2), laneY + 4, lanePulseWidth, 1);
    if (focused || strategic || state !== "idle") {
      surfaceContext.fillStyle = withAlpha(strategic ? department.accent : stateAccent, focused ? 0.26 : strategic ? 0.22 : 0.14);
      surfaceContext.fillRect(dockCenterX - 1, connectorTop, 2, Math.max(4, connectorBottom - connectorTop));
    }
  });

  surfaceContext.fillStyle = "#7d8db3";
  surfaceContext.fillRect(wall.left, wall.top, wall.width, wall.height);
  surfaceContext.fillStyle = "#5b6889";
  surfaceContext.fillRect(wall.left, wall.top + wall.height - 4, wall.width, 4);
  const wallPanelCount = Math.max(6, Math.floor(wall.width / 118));
  const wallPanelWidth = Math.max(28, Math.round((wall.width - 40) / wallPanelCount) - 12);
  const wallPanelGap = Math.max(10, Math.round((wall.width - wallPanelCount * wallPanelWidth - 20) / Math.max(1, wallPanelCount - 1)));
  for (let index = 0; index < wallPanelCount; index += 1) {
    const panelLeft = wall.left + 12 + index * (wallPanelWidth + wallPanelGap);
    surfaceContext.fillStyle = "#51627e";
    surfaceContext.fillRect(panelLeft, wall.top + 4, wallPanelWidth, 7);
    surfaceContext.fillStyle = pulseColor(elapsed + index * 0.33, "#9fd8ff", "#d9ecff");
    surfaceContext.fillRect(panelLeft + 3, wall.top + 6, wallPanelWidth - 6, 2);
    surfaceContext.fillStyle = "rgba(159, 216, 255, 0.06)";
    surfaceContext.fillRect(panelLeft + 4, floor.top + 2, wallPanelWidth - 8, 14);
  }
  const awardPanel: Rect = {
    left: wall.left + 34,
    top: wall.top + 5,
    width: 36,
    height: 9,
  };
  drawPixelFrame(surfaceContext, awardPanel, "#51617a", "#9bb7dc", "#0a0c14", 1);
  surfaceContext.fillStyle = "#f4cf7d";
  surfaceContext.fillRect(awardPanel.left + 5, awardPanel.top + 3, 4, 3);
  surfaceContext.fillRect(awardPanel.left + 11, awardPanel.top + 3, 4, 3);
  surfaceContext.fillStyle = "#dce6f6";
  surfaceContext.fillRect(awardPanel.left + 19, awardPanel.top + 3, 11, 2);
  const wallClock: Rect = {
    left: wall.left + wall.width - 50,
    top: wall.top + 3,
    width: 14,
    height: 12,
  };
  drawPixelFrame(surfaceContext, wallClock, "#dce4f2", "#637492", "#0a0c14", 1);
  surfaceContext.fillStyle = "#233047";
  surfaceContext.fillRect(wallClock.left + 4, wallClock.top + 3, 6, 6);
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.fillRect(wallClock.left + 7, wallClock.top + 4, 1, 3);
  surfaceContext.fillRect(wallClock.left + 7, wallClock.top + 6, 2, 1);
  drawPixelFrame(surfaceContext, ticker, "#22314c", adjustHex(tickerStatus.accent, 16), "#090b12", 2);
  for (let index = 0; index < tickerStatus.signalCount; index += 1) {
    surfaceContext.fillStyle = pulseColor(elapsed + index * 0.35, tickerStatus.accent, "#f7fbff");
    surfaceContext.fillRect(ticker.left + 8 + index * 18, ticker.top + 5, 10, 4);
  }
  surfaceContext.fillStyle = withAlpha(tickerStatus.accent, 0.2);
  surfaceContext.fillRect(ticker.left + 6, ticker.top + ticker.height - 5, ticker.width - 12, 2);
  surfaceContext.fillStyle = "#d9ecff";
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
}

function drawMeetingStageLighting(elapsed: number): void {
  const promptTarget = getNavigationTarget();
  const emphasized = meetingState.active || Boolean(hoveredPodium) || promptTarget?.type === "podium";
  const lounge = rectToScreen(centralLoungeRect);
  if (!emphasized || !isScreenRectVisible(lounge)) {
    return;
  }

  const table = rectToScreen(centralMeetingTableRect);
  const podium = rectToScreen(centralMeetingPodium.rect);
  const accent = meetingState.active ? "#f4cf7d" : "#89d0ff";
  const pulse = 0.5 + Math.sin(elapsed * 3.6) * 0.5;
  const beamAlpha = meetingState.active ? 0.11 + pulse * 0.06 : 0.06 + pulse * 0.03;

  surfaceContext.fillStyle = withAlpha(accent, meetingState.active ? 0.08 + pulse * 0.04 : 0.04 + pulse * 0.02);
  surfaceContext.fillRect(lounge.left + 12, lounge.top + 10, lounge.width - 24, lounge.height - 20);

  surfaceContext.fillStyle = withAlpha("#f7fbff", beamAlpha);
  surfaceContext.beginPath();
  surfaceContext.moveTo(table.left + Math.round(table.width * 0.26), lounge.top + 6);
  surfaceContext.lineTo(podium.left + podium.width - 2, podium.top + 4);
  surfaceContext.lineTo(podium.left + podium.width - 2, podium.top + podium.height + 6);
  surfaceContext.closePath();
  surfaceContext.fill();

  surfaceContext.beginPath();
  surfaceContext.moveTo(table.left + Math.round(table.width * 0.74), lounge.top + 6);
  surfaceContext.lineTo(podium.left + 2, podium.top + 4);
  surfaceContext.lineTo(podium.left + 2, podium.top + podium.height + 6);
  surfaceContext.closePath();
  surfaceContext.fill();

  surfaceContext.fillStyle = withAlpha(accent, 0.18 + pulse * 0.08);
  surfaceContext.fillRect(table.left + 12, table.top + table.height - 6, table.width - 24, 3);
  surfaceContext.fillRect(table.left + 12, table.top + 3, table.width - 24, 2);
  surfaceContext.fillStyle = withAlpha("#f7fbff", 0.38 + pulse * 0.16);
  surfaceContext.fillRect(podium.left - 6, podium.top + podium.height + 5, podium.width + 12, 2);

  meetingSeats.forEach((seat, index) => {
    const seatPoint = worldToScreen(seat.position.x, seat.position.y);
    const seatPulse = 0.3 + Math.sin(elapsed * 4.2 + index * 0.7) * 0.2;
    surfaceContext.fillStyle = withAlpha(accent, meetingState.active ? 0.14 + seatPulse : 0.08 + seatPulse * 0.4);
    surfaceContext.fillRect(seatPoint.x - 2, seatPoint.y + 8, 4, 2);
  });

  const currentSpeaker = meetingState.currentSpeakerId
    ? npcs.find((npc) => npc.id === meetingState.currentSpeakerId) ?? null
    : null;
  const pendingQuestioner = meetingState.pendingQuestionerId
    ? npcs.find((npc) => npc.id === meetingState.pendingQuestionerId) ?? null
    : null;
  const pendingResponder = meetingState.pendingResponderId
    ? npcs.find((npc) => npc.id === meetingState.pendingResponderId) ?? null
    : null;
  if (currentSpeaker) {
    const speakerPoint = worldToScreen(currentSpeaker.x, currentSpeaker.y);
    surfaceContext.fillStyle = withAlpha("#f7fbff", 0.26 + pulse * 0.1);
    surfaceContext.beginPath();
    surfaceContext.moveTo(speakerPoint.x - 8, lounge.top + 6);
    surfaceContext.lineTo(speakerPoint.x + 8, lounge.top + 6);
    surfaceContext.lineTo(speakerPoint.x + 5, speakerPoint.y + 8);
    surfaceContext.lineTo(speakerPoint.x - 5, speakerPoint.y + 8);
    surfaceContext.closePath();
    surfaceContext.fill();
    surfaceContext.fillStyle = withAlpha("#f7fbff", 0.68);
    surfaceContext.fillRect(speakerPoint.x - 4, speakerPoint.y + 9, 8, 2);
    surfaceContext.fillStyle = withAlpha(accent, 0.5);
    surfaceContext.fillRect(speakerPoint.x - 6, speakerPoint.y + 8, 12, 1);
  }

  if (pendingQuestioner && pendingResponder) {
    const questionPoint = worldToScreen(pendingQuestioner.x, pendingQuestioner.y);
    const responderPoint = worldToScreen(pendingResponder.x, pendingResponder.y);
    const dx = responderPoint.x - questionPoint.x;
    const dy = responderPoint.y - questionPoint.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 1) {
      const pulseOffset = (elapsed * 42) % 14;
      for (let traveled = 0; traveled <= distance; traveled += 14) {
        const progress = Math.min(1, (traveled + pulseOffset) / distance);
        const signalX = Math.round(questionPoint.x + dx * progress);
        const signalY = Math.round(questionPoint.y + dy * progress);
        surfaceContext.fillStyle = withAlpha(accent, 0.22 + (1 - progress) * 0.16);
        surfaceContext.fillRect(signalX - 1, signalY - 1, 3, 3);
      }
    }

    const responderPulse = 0.5 + Math.sin(elapsed * 4.4 + pendingResponder.x * 0.01) * 0.5;
    surfaceContext.fillStyle = withAlpha(accent, 0.22 + responderPulse * 0.14);
    surfaceContext.fillRect(responderPoint.x - 6, responderPoint.y + 7, 12, 4);
    surfaceContext.fillStyle = withAlpha("#f7fbff", 0.7);
    surfaceContext.fillRect(responderPoint.x - 3, responderPoint.y + 8, 6, 2);
  }

  const candidates = getMeetingSpeakerCandidates(3);
  candidates.forEach((candidate, index) => {
    const seatPoint = worldToScreen(candidate.meetingSeat.position.x, candidate.meetingSeat.position.y);
    const pulseOffset = 0.5 + Math.sin(elapsed * 4.2 + index * 0.6 + seatPoint.x * 0.01) * 0.5;
    surfaceContext.fillStyle = withAlpha(candidate.department.accent, 0.12 + pulseOffset * 0.08);
    surfaceContext.fillRect(seatPoint.x - 6, seatPoint.y + 6, 12, 4);
    surfaceContext.fillStyle = withAlpha("#f7fbff", 0.72);
    surfaceContext.fillRect(seatPoint.x - 2, seatPoint.y + 7, 4, 2);
    drawSceneRouteStepBadge(
      { x: seatPoint.x, y: seatPoint.y - 10 },
      String(index + 1),
      candidate.department.accent,
      index === 0
    );
  });

  if (meetingStageCueState.pulse > 0.08) {
    const cueActors = getMeetingStageCueActors();
    [cueActors.speaker, cueActors.counterpart].forEach((actor, index) => {
      if (!actor) {
        return;
      }
      const actorPoint = worldToScreen(actor.x, actor.y);
      const cuePulse = 0.5 + Math.sin(elapsed * 4.6 + index * 0.8 + actor.x * 0.02) * 0.5;
      surfaceContext.strokeStyle = withAlpha(
        index === 0 ? meetingStageCueState.accent : "#f7fbff",
        0.34 + cuePulse * 0.22
      );
      surfaceContext.lineWidth = 1;
      surfaceContext.strokeRect(actorPoint.x - 8.5, actorPoint.y - 11.5, 17, 18);
      drawSceneRouteStepBadge(
        { x: actorPoint.x, y: actorPoint.y - 15 },
        index === 0 ? "A" : "B",
        index === 0 ? meetingStageCueState.accent : actor.department.accent,
        index === 0
      );
    });
  }
}

function drawMeetingReadinessPanel(elapsed: number): void {
  if (meetingState.active) {
    return;
  }

  const promptTarget = getNavigationTarget();
  const emphasized = Boolean(hoveredPodium) || promptTarget?.type === "podium";
  const lounge = rectToScreen(centralLoungeRect);
  if (!emphasized || !isScreenRectVisible(lounge)) {
    return;
  }

  const seatedCount = getMeetingSeatedCount();
  const seatRatio = seatedCount / Math.max(1, npcs.length);
  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const panel: Rect = {
    left: lounge.left + Math.max(8, Math.round(lounge.width * 0.18)),
    top: lounge.top + 6,
    width: Math.max(58, Math.round(lounge.width * 0.64)),
    height: 22,
  };
  const accent = meetingState.active ? "#f4cf7d" : "#89d0ff";
  const statusAccent = meetingState.active ? "#fff1c2" : "#d9ecff";
  const pulse = 0.5 + Math.sin(elapsed * 3.4) * 0.5;

  drawPixelFrame(surfaceContext, panel, "#243047", "#101727", "#090b12", 1);
  surfaceContext.fillStyle = withAlpha(accent, 0.16 + pulse * 0.06);
  surfaceContext.fillRect(panel.left + 2, panel.top + 2, panel.width - 4, panel.height - 4);
  surfaceContext.fillStyle = "rgba(9, 11, 18, 0.42)";
  surfaceContext.fillRect(panel.left + 5, panel.top + 9, panel.width - 10, 3);
  surfaceContext.fillStyle = withAlpha(accent, 0.84);
  surfaceContext.fillRect(
    panel.left + 5,
    panel.top + 9,
    Math.max(8, Math.round((panel.width - 10) * Math.max(0.16, seatRatio))),
    3
  );

  const lightCount = Math.min(8, npcs.length);
  for (let index = 0; index < lightCount; index += 1) {
    const active = index / Math.max(1, lightCount - 1) <= seatRatio + 0.02;
    surfaceContext.fillStyle = active
      ? withAlpha(accent, 0.9)
      : "rgba(22, 28, 44, 0.88)";
    surfaceContext.fillRect(panel.left + 6 + index * 8, panel.top + 4, 4, 2);
  }

  surfaceContext.save();
  surfaceContext.textAlign = "left";
  surfaceContext.textBaseline = "middle";
  surfaceContext.font = '600 8px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillStyle = statusAccent;
  surfaceContext.fillText(`SEATS ${seatedCount}/${npcs.length}`, panel.left + 6, panel.top + 6);
  surfaceContext.textAlign = "right";
  surfaceContext.fillStyle = currentSpeaker ? "#fff4cf" : "#d9ecff";
  surfaceContext.fillText(
    currentSpeaker
      ? `${trimSpeechSegment(currentSpeaker.name, 4)} ${trimSpeechSegment(currentSpeaker.department.shortName, 4)}`
      : meetingState.active
        ? "WAIT SPEAKER"
        : "READY",
    panel.left + panel.width - 6,
    panel.top + 6
  );
  surfaceContext.textAlign = "center";
  surfaceContext.font = '500 7px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillStyle = pendingQuestioner && pendingResponder
    ? "#fff4cf"
    : currentSpeaker
      ? withAlpha(statusAccent, 0.86)
      : "#b9c7de";
  surfaceContext.fillText(
    pendingQuestioner && pendingResponder
      ? `NEXT ${trimSpeechSegment(pendingQuestioner.name, 4)} → ${trimSpeechSegment(pendingResponder.name, 4)}`
      : currentSpeaker
        ? `LIVE ${trimSpeechSegment(currentSpeaker.department.shortName, 4)}`
        : "NEXT ROUND WAITING",
    panel.left + panel.width / 2,
    panel.top + 17
  );
  surfaceContext.restore();
}

function drawMeetingDiscussionBoard(elapsed: number): void {
  const promptTarget = getNavigationTarget();
  const emphasized = meetingState.active || Boolean(hoveredPodium) || promptTarget?.type === "podium";
  const lounge = rectToScreen(centralLoungeRect);
  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const meetingSummary = getMeetingDiscussionSummary();
  if (
    !emphasized ||
    !isScreenRectVisible(lounge) ||
    (!meetingState.active && !currentSpeaker && !pendingQuestioner && !pendingResponder)
  ) {
    return;
  }

  const accent = meetingState.active ? "#f4cf7d" : "#89d0ff";
  const board: Rect = {
    left: lounge.left + 12,
    top: lounge.top + lounge.height - 36,
    width: Math.max(80, lounge.width - 24),
    height: 28,
  };
  drawPixelFrame(surfaceContext, board, "#1d2437", adjustHex(accent, 10), "#090b12", 1);
  surfaceContext.fillStyle = withAlpha(accent, 0.12);
  surfaceContext.fillRect(board.left + 2, board.top + 2, board.width - 4, board.height - 4);
  surfaceContext.fillStyle = "rgba(8, 12, 24, 0.4)";
  surfaceContext.fillRect(board.left + 3, board.top + 3, board.width - 6, 8);

  surfaceContext.textBaseline = "middle";
  surfaceContext.textAlign = "left";
  surfaceContext.font = 'bold 5px Monaco, "Courier New", monospace';
  surfaceContext.fillStyle = "#d9ecff";
  surfaceContext.fillText(`TURN ${String(Math.max(1, meetingSummary.round)).padStart(2, "0")}`, board.left + 6, board.top + 7);
  surfaceContext.textAlign = "right";
  surfaceContext.fillStyle = meetingSummary.accent;
  surfaceContext.fillText(meetingSummary.stageCode, board.left + board.width - 6, board.top + 7);

  const progressBarLeft = board.left + 6;
  const progressBarTop = board.top + 11;
  const progressBarWidth = board.width - 12;
  surfaceContext.fillStyle = "rgba(255,255,255,0.08)";
  surfaceContext.fillRect(progressBarLeft, progressBarTop, progressBarWidth, 2);
  surfaceContext.fillStyle = withAlpha(meetingSummary.accent, 0.86);
  surfaceContext.fillRect(
    progressBarLeft,
    progressBarTop,
    Math.max(8, progressBarWidth * Math.max(0.14, meetingSummary.progress)),
    2
  );
  surfaceContext.textAlign = "center";
  surfaceContext.font = '500 6px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillStyle = "#d9ecff";
  surfaceContext.fillText(trimSpeechSegment(meetingSummary.detail, 18), board.left + board.width / 2, board.top + 16);

  const cells = [
    {
      label: "ASK",
      actor: pendingQuestioner,
      accent: pendingQuestioner ? "#fff1c2" : "#9db0ca",
    },
    {
      label: "LIVE",
      actor: currentSpeaker,
      accent: currentSpeaker ? accent : "#9db0ca",
    },
    {
      label: "NEXT",
      actor: pendingResponder,
      accent: pendingResponder ? "#fff1c2" : "#9db0ca",
    },
  ] as const;
  const cellWidth = Math.floor((board.width - 8) / cells.length);

  cells.forEach((cell, index) => {
    const cellLeft = board.left + 4 + index * cellWidth;
    if (index > 0) {
      surfaceContext.fillStyle = "rgba(255,255,255,0.08)";
      surfaceContext.fillRect(cellLeft - 2, board.top + 17, 1, board.height - 20);
    }
    surfaceContext.fillStyle = cell.accent;
    surfaceContext.fillRect(cellLeft, board.top + 20, 10, 2);
    surfaceContext.fillStyle = "#d9ecff";
    surfaceContext.font = 'bold 5px Monaco, "Courier New", monospace';
    surfaceContext.textAlign = "left";
    surfaceContext.textBaseline = "middle";
    surfaceContext.fillText(cell.label, cellLeft + 12, board.top + 21);
    surfaceContext.font = '600 7px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    surfaceContext.fillStyle = cell.actor ? "#f7fbff" : "#92a1bc";
    surfaceContext.fillText(
      cell.actor
        ? `${trimSpeechSegment(cell.actor.name, 4)} ${trimSpeechSegment(cell.actor.department.shortName, 4)}`
        : "待命",
      cellLeft,
      board.top + 27
    );
  });
}

function drawMeetingTurnTimeline(elapsed: number): void {
  if (!meetingState.active) {
    return;
  }

  const entries = getRecentMeetingTimeline(4).slice().reverse();
  const lounge = rectToScreen(centralLoungeRect);
  if (entries.length === 0 || !isScreenRectVisible(lounge)) {
    return;
  }

  const panel: Rect = {
    left: lounge.left + 14,
    top: lounge.top + 6,
    width: Math.max(94, lounge.width - 28),
    height: 18,
  };
  drawPixelFrame(surfaceContext, panel, "#172033", "#53698f", "#090b12", 1);
  surfaceContext.fillStyle = "rgba(8, 12, 24, 0.66)";
  surfaceContext.fillRect(panel.left + 2, panel.top + 2, panel.width - 4, panel.height - 4);
  surfaceContext.fillStyle = withAlpha("#f7fbff", 0.08);
  surfaceContext.fillRect(panel.left + 3, panel.top + 3, panel.width - 6, 4);

  const slotWidth = Math.floor((panel.width - 10) / entries.length);
  entries.forEach((entry, index) => {
    const slotLeft = panel.left + 5 + index * slotWidth;
    const slotWidthSafe = index === entries.length - 1
      ? panel.left + panel.width - 5 - slotLeft
      : slotWidth - 2;
    if (index > 0) {
      surfaceContext.fillStyle = "rgba(255,255,255,0.08)";
      surfaceContext.fillRect(slotLeft - 2, panel.top + 5, 1, panel.height - 8);
    }

    const pulse = 0.5 + Math.sin(elapsed * 4.2 + entry.round + index * 0.8) * 0.5;
    surfaceContext.fillStyle = withAlpha(entry.accent, 0.2 + pulse * 0.08);
    surfaceContext.fillRect(slotLeft, panel.top + 5, Math.max(14, slotWidthSafe - 2), 2);
    surfaceContext.fillStyle = "#d9ecff";
    surfaceContext.font = 'bold 5px Monaco, "Courier New", monospace';
    surfaceContext.textAlign = "left";
    surfaceContext.textBaseline = "middle";
    surfaceContext.fillText(`R${entry.round} ${entry.stage === "ask" ? "ASK" : "RESP"}`, slotLeft, panel.top + 9);
    surfaceContext.font = '500 6px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    surfaceContext.fillStyle = "#f7fbff";
    surfaceContext.fillText(
      trimSpeechSegment(`${entry.speakerName}→${entry.counterpartName}`, 8),
      slotLeft,
      panel.top + 14
    );
  });
}

function drawMeetingSpeakerWheel(elapsed: number): void {
  if (!meetingState.active) {
    return;
  }

  const participants = getMeetingParticipants();
  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const latestEntry = getLatestMeetingTimelineEntry();
  const meetingSummary = getMeetingDiscussionSummary();
  const candidates = getMeetingSpeakerCandidates(3);
  const lounge = rectToScreen(centralLoungeRect);
  if (participants.length === 0 || !isScreenRectVisible(lounge)) {
    return;
  }

  const panel: Rect = {
    left: lounge.left + lounge.width - 42,
    top: lounge.top + 34,
    width: 32,
    height: 32,
  };
  drawPixelFrame(surfaceContext, panel, "#172033", "#53698f", "#090b12", 1);
  surfaceContext.fillStyle = "rgba(8, 12, 24, 0.74)";
  surfaceContext.fillRect(panel.left + 2, panel.top + 2, panel.width - 4, panel.height - 4);

  const center = {
    x: panel.left + panel.width / 2,
    y: panel.top + panel.height / 2,
  };
  const radiusX = 10;
  const radiusY = 9;
  const pulse = 0.5 + Math.sin(elapsed * 4.2) * 0.5;

  surfaceContext.strokeStyle = withAlpha("#3d4d69", 0.88);
  surfaceContext.lineWidth = 1;
  surfaceContext.strokeRect(panel.left + 6.5, panel.top + 6.5, panel.width - 13, panel.height - 13);

  participants.forEach((npc, index) => {
    const angle = -Math.PI / 2 + (index / Math.max(1, participants.length)) * Math.PI * 2;
    const x = Math.round(center.x + Math.cos(angle) * radiusX);
    const y = Math.round(center.y + Math.sin(angle) * radiusY);
    const isCurrent = npc.id === currentSpeaker?.id;
    const isQuestioner = npc.id === pendingQuestioner?.id;
    const isResponder = npc.id === pendingResponder?.id;
    const accent = isCurrent
      ? "#f4cf7d"
      : isQuestioner
        ? "#ffd98b"
        : isResponder
          ? "#fff1c2"
          : withAlpha(npc.department.accent, 0.9);
    const size = isCurrent ? 4 : isQuestioner || isResponder ? 3 : 2;
    if (isCurrent || isQuestioner || isResponder) {
      surfaceContext.strokeStyle = withAlpha(accent, 0.3 + pulse * 0.2);
      surfaceContext.lineWidth = 1;
      surfaceContext.beginPath();
      surfaceContext.moveTo(center.x, center.y);
      surfaceContext.lineTo(x, y);
      surfaceContext.stroke();
    }
    surfaceContext.fillStyle = accent;
    surfaceContext.fillRect(x - size / 2, y - size / 2, size, size);
    if (isCurrent || isQuestioner || isResponder) {
      surfaceContext.strokeStyle = "#f7fbff";
      surfaceContext.strokeRect(x - size / 2 - 1.5, y - size / 2 - 1.5, size + 3, size + 3);
    }
  });

  if (candidates.length > 0) {
    surfaceContext.fillStyle = "rgba(255,255,255,0.08)";
    surfaceContext.fillRect(panel.left + 4, panel.top + panel.height - 8, panel.width - 8, 1);
    candidates.forEach((candidate, index) => {
      const slotLeft = panel.left + 5 + index * 8;
      surfaceContext.fillStyle = withAlpha(candidate.department.accent, 0.9);
      surfaceContext.fillRect(slotLeft, panel.top + panel.height - 6, 4, 3);
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.font = 'bold 5px Monaco, "Courier New", monospace';
      surfaceContext.fillText(String(index + 1), slotLeft + 2, panel.top + panel.height - 4.5);
    });
  }

  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillStyle = meetingSummary.accent;
  surfaceContext.font = 'bold 6px Monaco, "Courier New", monospace';
  surfaceContext.fillText(meetingSummary.stageCode, center.x, center.y - 2);
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.font = '500 5px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillText(`R${meetingSummary.round}`, center.x, center.y + 4);

  if (latestEntry) {
    const label = latestEntry.stage === "ask"
      ? `${trimSpeechSegment(latestEntry.speakerName, 3)}?`
      : `${trimSpeechSegment(latestEntry.speakerName, 3)}!`;
    surfaceContext.fillStyle = withAlpha("#09111d", 0.86);
    surfaceContext.fillRect(panel.left - 2, panel.top + panel.height + 2, panel.width + 4, 8);
    surfaceContext.strokeStyle = withAlpha(latestEntry.accent, 0.72);
    surfaceContext.strokeRect(panel.left - 1.5, panel.top + panel.height + 2.5, panel.width + 3, 7);
    surfaceContext.fillStyle = "#f7fbff";
    surfaceContext.font = '500 5px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    surfaceContext.fillText(label, panel.left + panel.width / 2, panel.top + panel.height + 6);
  }
}

function drawMeetingDirectorRail(elapsed: number): void {
  const promptTarget = getNavigationTarget();
  const emphasized = meetingState.active || Boolean(hoveredPodium) || promptTarget?.type === "podium";
  const lounge = rectToScreen(centralLoungeRect);
  if (!emphasized || !isScreenRectVisible(lounge)) {
    return;
  }

  const { speaker, counterpart } = getMeetingStageCueActors();
  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const leadSpeaker = speaker ?? currentSpeaker ?? pendingQuestioner;
  const leadCounterpart = counterpart ?? pendingResponder;
  const candidates = getMeetingSpeakerCandidates(3);
  const accent = meetingState.active
    ? (meetingStageCueState.pulse > 0.08 ? meetingStageCueState.accent : "#f4cf7d")
    : "#89d0ff";
  const rail: Rect = {
    left: lounge.left + 12,
    top: lounge.top + 28,
    width: Math.max(96, lounge.width - 56),
    height: 20,
  };
  const pulse = 0.5 + Math.sin(elapsed * 4.2) * 0.5;

  drawPixelFrame(surfaceContext, rail, "#172033", accent, "#090b12", 1);
  surfaceContext.fillStyle = "rgba(8, 12, 24, 0.76)";
  surfaceContext.fillRect(rail.left + 2, rail.top + 2, rail.width - 4, rail.height - 4);
  surfaceContext.fillStyle = withAlpha(accent, 0.14 + pulse * 0.08);
  surfaceContext.fillRect(rail.left + 3, rail.top + 3, rail.width - 6, 4);
  surfaceContext.textAlign = "left";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.font = 'bold 5px Monaco, "Courier New", monospace';
  surfaceContext.fillText(
    meetingStageCueState.pulse > 0.08 ? meetingStageCueState.title : "DIRECTOR RAIL",
    rail.left + 5,
    rail.top + 5
  );
  surfaceContext.textAlign = "right";
  surfaceContext.fillStyle = withAlpha("#d9ecff", 0.84);
  surfaceContext.fillText(
    meetingState.active ? `R${String(Math.max(1, getMeetingDiscussionSummary().round)).padStart(2, "0")}` : "WAIT",
    rail.left + rail.width - 5,
    rail.top + 5
  );

  const actorWidth = Math.max(20, Math.floor((rail.width - 16) * 0.22));
  const actorTop = rail.top + 9;
  const leftActor: Rect = {
    left: rail.left + 5,
    top: actorTop,
    width: actorWidth,
    height: 7,
  };
  const rightActor: Rect = {
    left: rail.left + 10 + actorWidth,
    top: actorTop,
    width: actorWidth,
    height: 7,
  };
  const queueLeft = rightActor.left + rightActor.width + 6;
  const queueWidth = rail.left + rail.width - 5 - queueLeft;
  const candidateWidth = Math.max(12, Math.floor((queueWidth - 4) / 3));

  const drawActorSlot = (
    rect: Rect,
    label: string,
    actor: NpcActor | null,
    slotAccent: string
  ): void => {
    surfaceContext.fillStyle = withAlpha(slotAccent, actor ? 0.16 + pulse * 0.08 : 0.08);
    surfaceContext.fillRect(rect.left, rect.top, rect.width, rect.height);
    surfaceContext.strokeStyle = withAlpha(slotAccent, 0.76);
    surfaceContext.lineWidth = 1;
    surfaceContext.strokeRect(rect.left + 0.5, rect.top + 0.5, rect.width - 1, rect.height - 1);
    surfaceContext.fillStyle = "#f7fbff";
    surfaceContext.font = 'bold 4px Monaco, "Courier New", monospace';
    surfaceContext.textAlign = "left";
    surfaceContext.fillText(label, rect.left + 2, rect.top + 3.8);
    surfaceContext.textAlign = "right";
    surfaceContext.font = '500 5px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    surfaceContext.fillText(
      actor ? trimSpeechSegment(actor.name, 4) : "待命",
      rect.left + rect.width - 2,
      rect.top + 3.8
    );
  };

  drawActorSlot(leftActor, "A", leadSpeaker, accent);
  drawActorSlot(rightActor, "B", leadCounterpart, leadCounterpart?.department.accent ?? "#d9ecff");
  surfaceContext.strokeStyle = withAlpha(accent, 0.42 + pulse * 0.18);
  surfaceContext.lineWidth = 1;
  surfaceContext.beginPath();
  surfaceContext.moveTo(leftActor.left + leftActor.width + 1, leftActor.top + 3.5);
  surfaceContext.lineTo(rightActor.left - 1, rightActor.top + 3.5);
  surfaceContext.stroke();

  candidates.forEach((candidate, index) => {
    const candidateRect: Rect = {
      left: queueLeft + index * candidateWidth,
      top: actorTop,
      width: candidateWidth - 2,
      height: 7,
    };
    surfaceContext.fillStyle = withAlpha(candidate.department.accent, 0.14 + pulse * 0.06);
    surfaceContext.fillRect(candidateRect.left, candidateRect.top, candidateRect.width, candidateRect.height);
    surfaceContext.strokeStyle = withAlpha(candidate.department.accent, 0.72);
    surfaceContext.lineWidth = 1;
    surfaceContext.strokeRect(candidateRect.left + 0.5, candidateRect.top + 0.5, candidateRect.width - 1, candidateRect.height - 1);
    surfaceContext.fillStyle = "#f7fbff";
    surfaceContext.font = 'bold 4px Monaco, "Courier New", monospace';
    surfaceContext.textAlign = "left";
    surfaceContext.fillText(String(index + 1), candidateRect.left + 2, candidateRect.top + 3.8);
    surfaceContext.textAlign = "right";
    surfaceContext.font = '500 5px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    surfaceContext.fillText(
      trimSpeechSegment(candidate.name, 3),
      candidateRect.left + candidateRect.width - 2,
      candidateRect.top + 3.8
    );
  });
}

function drawMeetingConversationLinks(elapsed: number): void {
  if (!meetingState.active) {
    return;
  }

  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const drawLink = (
    startWorld: Point,
    endWorld: Point,
    accent: string,
    label: string,
    options: {
      dash?: number[];
      highlighted?: boolean;
      seed?: number;
    } = {}
  ): void => {
    const start = worldToScreen(startWorld.x, startWorld.y);
    const end = worldToScreen(endWorld.x, endWorld.y);
    const rect = {
      left: Math.min(start.x, end.x) - 12,
      top: Math.min(start.y, end.y) - 12,
      width: Math.abs(end.x - start.x) + 24,
      height: Math.abs(end.y - start.y) + 24,
    };
    if (!isScreenRectVisible(rect)) {
      return;
    }

    const pulse = 0.5 + Math.sin(elapsed * 4.4 + (options.seed ?? 0)) * 0.5;
    surfaceContext.save();
    surfaceContext.strokeStyle = withAlpha(accent, options.highlighted ? 0.44 + pulse * 0.18 : 0.24 + pulse * 0.12);
    surfaceContext.lineWidth = options.highlighted ? 2 : 1.2;
    surfaceContext.setLineDash(options.dash ?? [3, 3]);
    surfaceContext.lineDashOffset = -elapsed * 16;
    surfaceContext.beginPath();
    surfaceContext.moveTo(start.x, start.y);
    surfaceContext.lineTo(end.x, end.y);
    surfaceContext.stroke();
    surfaceContext.restore();

    surfaceContext.fillStyle = withAlpha(accent, options.highlighted ? 0.24 + pulse * 0.12 : 0.14 + pulse * 0.08);
    surfaceContext.fillRect(start.x - 2, start.y - 2, 4, 4);
    surfaceContext.fillRect(end.x - 2, end.y - 2, 4, 4);
    const midX = Math.round((start.x + end.x) / 2);
    const midY = Math.round((start.y + end.y) / 2 - 6);
    const labelWidth = Math.max(24, label.length * 4 + 8);
    surfaceContext.fillStyle = withAlpha("#09111d", 0.82);
    surfaceContext.fillRect(midX - Math.round(labelWidth / 2), midY - 4, labelWidth, 8);
    surfaceContext.strokeStyle = withAlpha(accent, 0.72);
    surfaceContext.lineWidth = 1;
    surfaceContext.strokeRect(midX - Math.round(labelWidth / 2) + 0.5, midY - 3.5, labelWidth - 1, 7);
    surfaceContext.fillStyle = "#f7fbff";
    surfaceContext.textAlign = "center";
    surfaceContext.textBaseline = "middle";
    surfaceContext.font = 'bold 5px Monaco, "Courier New", monospace';
    surfaceContext.fillText(label, midX, midY + 0.5);
  };

  if (currentSpeaker) {
    drawLink(
      centralMeetingPodium.interactionPoint,
      { x: currentSpeaker.x, y: currentSpeaker.y - 2 },
      "#f4cf7d",
      "LIVE",
      {
        dash: [4, 3],
        highlighted: true,
        seed: currentSpeaker.x * 0.03 + currentSpeaker.y * 0.02,
      }
    );
  }

  if (pendingQuestioner && pendingResponder) {
    drawLink(
      { x: pendingQuestioner.x, y: pendingQuestioner.y - 2 },
      { x: pendingResponder.x, y: pendingResponder.y - 2 },
      "#fff1c2",
      "QUEUE",
      {
        dash: [2, 2],
        highlighted: false,
        seed: pendingQuestioner.x * 0.02 + pendingResponder.y * 0.03,
      }
    );
  }
}

function drawNavigationFocusImmersion(elapsed: number): void {
  if (!shouldShowTaskPrompts()) {
    return;
  }

  const target = getNavigationTarget();
  const focusRect = getNavigationFocusRect(target);
  const strength = getNavigationFocusImmersionStrength(target);
  if (!focusRect || strength <= 0.14) {
    return;
  }

  const focus = rectToScreen(focusRect);
  if (!isScreenRectVisible(focus)) {
    return;
  }

  const padding = Math.round(10 + strength * 14);
  const left = clamp(focus.left - padding, 0, surface.width);
  const top = clamp(focus.top - padding, 0, surface.height);
  const right = clamp(focus.left + focus.width + padding, 0, surface.width);
  const bottom = clamp(focus.top + focus.height + padding, 0, surface.height);
  const accent = getInteractionTargetIndicatorAccent(target ?? { type: "podium", value: centralMeetingPodium });
  const pulse = 0.5 + Math.sin(elapsed * 3.2 + left * 0.01) * 0.5;

  surfaceContext.fillStyle = `rgba(5, 8, 16, ${0.08 + strength * 0.18})`;
  surfaceContext.fillRect(0, 0, surface.width, top);
  surfaceContext.fillRect(0, bottom, surface.width, surface.height - bottom);
  surfaceContext.fillRect(0, top, left, bottom - top);
  surfaceContext.fillRect(right, top, surface.width - right, bottom - top);

  surfaceContext.fillStyle = withAlpha(accent, 0.05 + strength * 0.08);
  surfaceContext.fillRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
  surfaceContext.fillStyle = withAlpha("#f7fbff", 0.12 + pulse * 0.08 + strength * 0.06);
  surfaceContext.fillRect(left + 3, top + 3, Math.max(8, right - left - 6), 1);
  surfaceContext.fillRect(left + 3, bottom - 4, Math.max(8, right - left - 6), 1);
  surfaceContext.fillStyle = withAlpha(accent, 0.24 + strength * 0.18);
  surfaceContext.fillRect(left + 4, top + 4, 10, 1);
  surfaceContext.fillRect(left + 4, top + 4, 1, 10);
  surfaceContext.fillRect(right - 14, top + 4, 10, 1);
  surfaceContext.fillRect(right - 5, top + 4, 1, 10);
  surfaceContext.fillRect(left + 4, bottom - 5, 10, 1);
  surfaceContext.fillRect(left + 4, bottom - 14, 1, 10);
  surfaceContext.fillRect(right - 14, bottom - 5, 10, 1);
  surfaceContext.fillRect(right - 5, bottom - 14, 1, 10);
}

function drawAreaTransitionPulse(
  state: AreaTransitionState,
  elapsed: number,
  options: {
    strokeBoost?: number;
    fillBoost?: number;
    labelPrefix?: string;
  } = {}
): void {
  if (state.pulse <= 0.02) {
    return;
  }

  const areaRect = getAreaRectByKey(state.areaKey);
  if (!areaRect) {
    return;
  }

  const screenRect = rectToScreen(areaRect);
  if (!isScreenRectVisible(screenRect)) {
    return;
  }

  const pulse = clamp(state.pulse, 0, 1);
  const expansion = Math.round((1 - pulse) * 18 + 6);
  const frameRect = expandRect(screenRect, expansion);
  const shimmer = 0.5 + Math.sin(elapsed * 5.2 + frameRect.left * 0.02) * 0.5;
  const strokeBoost = options.strokeBoost ?? 1;
  const fillBoost = options.fillBoost ?? 1;

  surfaceContext.fillStyle = withAlpha(state.accent, (0.04 + pulse * 0.08 + shimmer * 0.02) * fillBoost);
  surfaceContext.fillRect(frameRect.left, frameRect.top, frameRect.width, frameRect.height);
  surfaceContext.strokeStyle = withAlpha(state.accent, (0.14 + pulse * 0.34 + shimmer * 0.08) * strokeBoost);
  surfaceContext.lineWidth = 1;
  surfaceContext.strokeRect(frameRect.left + 0.5, frameRect.top + 0.5, frameRect.width - 1, frameRect.height - 1);
  surfaceContext.strokeStyle = withAlpha("#f7fbff", (0.08 + pulse * 0.18) * strokeBoost);
  surfaceContext.strokeRect(frameRect.left + 2.5, frameRect.top + 2.5, frameRect.width - 5, frameRect.height - 5);

  if (pulse <= 0.12) {
    return;
  }

  const label = translateRuntimeCopy(options.labelPrefix ? `${options.labelPrefix} ${state.label}` : state.label);
  const labelWidth = Math.max(58, label.length * 7);
  const labelLeft = clamp(frameRect.left + 4, 6, surface.width - labelWidth - 6);
  const labelTop = clamp(frameRect.top - 10, 6, surface.height - 14);
  surfaceContext.fillStyle = withAlpha("#0a1020", 0.82);
  surfaceContext.fillRect(labelLeft, labelTop, labelWidth, 10);
  surfaceContext.strokeStyle = withAlpha(state.accent, 0.7);
  surfaceContext.strokeRect(labelLeft + 0.5, labelTop + 0.5, labelWidth - 1, 9);
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.textAlign = "left";
  surfaceContext.textBaseline = "middle";
  surfaceContext.font = '500 6px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillText(trimSpeechSegment(label, 16), labelLeft + 4, labelTop + 5);
}

function drawFocusArrivalCinematic(elapsed: number): void {
  if (!shouldShowTaskPrompts()) {
    return;
  }

  if (focusArrivalTransition.pulse <= 0.02) {
    return;
  }

  const pulse = clamp(focusArrivalTransition.pulse, 0, 1);
  const shimmer = 0.5 + Math.sin(elapsed * 5.6) * 0.5;
  const barHeight = Math.round(10 + pulse * 18);
  const accent = focusArrivalTransition.accent;
  const followUpTarget = getNavigationFollowUpTarget();
  const title = pickUiText(
    `已进入 ${focusArrivalTransition.label}`,
    `Entered ${focusArrivalTransition.label}`
  );
  const subtitle = followUpTarget
    ? pickUiText(`继续前往 ${getNavigationTargetShortLabel(followUpTarget, 8)}`, `Continue to ${getNavigationTargetShortLabel(followUpTarget, 8)}`)
    : pickUiText("当前目标已锁定", "Current target locked");

  surfaceContext.fillStyle = withAlpha("#050914", 0.08 + pulse * 0.16);
  surfaceContext.fillRect(0, 0, surface.width, barHeight);
  surfaceContext.fillRect(0, surface.height - barHeight, surface.width, barHeight);
  surfaceContext.fillStyle = withAlpha(accent, 0.12 + pulse * 0.1 + shimmer * 0.04);
  surfaceContext.fillRect(0, barHeight - 2, surface.width, 2);
  surfaceContext.fillRect(0, surface.height - barHeight, surface.width, 2);

  const cardWidth = Math.max(132, title.length * 7 + 28);
  const cardHeight = 20;
  const cardLeft = Math.round(surface.width / 2 - cardWidth / 2);
  const cardTop = Math.max(barHeight + 6, Math.round(surface.height * 0.16));
  surfaceContext.fillStyle = withAlpha("#09111d", 0.88);
  surfaceContext.fillRect(cardLeft, cardTop, cardWidth, cardHeight);
  surfaceContext.strokeStyle = withAlpha(accent, 0.84);
  surfaceContext.lineWidth = 1;
  surfaceContext.strokeRect(cardLeft + 0.5, cardTop + 0.5, cardWidth - 1, cardHeight - 1);
  surfaceContext.fillStyle = withAlpha(accent, 0.18 + shimmer * 0.08);
  surfaceContext.fillRect(cardLeft + 3, cardTop + 3, cardWidth - 6, 4);
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.font = '600 8px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillText(trimSpeechSegment(title, 18), cardLeft + cardWidth / 2, cardTop + 9);
  surfaceContext.fillStyle = withAlpha("#d9ecff", 0.82);
  surfaceContext.font = '500 6px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillText(trimSpeechSegment(subtitle, 18), cardLeft + cardWidth / 2, cardTop + 15.5);
}

function drawGoalRelayOverlay(elapsed: number): void {
  if (!shouldShowTaskPrompts()) {
    return;
  }

  if (goalRelayState.pulse <= 0.02 || !goalRelayState.fromTarget || !goalRelayState.toTarget) {
    return;
  }

  const pulse = clamp(goalRelayState.pulse, 0, 1);
  const shimmer = 0.5 + Math.sin(elapsed * 5 + surface.width * 0.01) * 0.5;
  const panelWidth = 168;
  const panelHeight = 22;
  const panelLeft = Math.round(surface.width / 2 - panelWidth / 2);
  const panelTop = Math.round(surface.height * 0.08);
  const fromTitle = trimSpeechSegment(getInteractionTargetIndicatorTitle(goalRelayState.fromTarget), 8);
  const toTitle = trimSpeechSegment(getInteractionTargetIndicatorTitle(goalRelayState.toTarget), 8);

  surfaceContext.fillStyle = withAlpha("#09111d", 0.88);
  surfaceContext.fillRect(panelLeft, panelTop, panelWidth, panelHeight);
  surfaceContext.strokeStyle = withAlpha(goalRelayState.toAccent, 0.78 + shimmer * 0.1);
  surfaceContext.lineWidth = 1;
  surfaceContext.strokeRect(panelLeft + 0.5, panelTop + 0.5, panelWidth - 1, panelHeight - 1);
  surfaceContext.fillStyle = withAlpha(goalRelayState.toAccent, 0.14 + pulse * 0.08);
  surfaceContext.fillRect(panelLeft + 3, panelTop + 3, panelWidth - 6, 5);
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.font = '600 8px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillText(goalRelayState.headline, panelLeft + panelWidth / 2, panelTop + 8);
  surfaceContext.font = '500 6px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillStyle = withAlpha("#d9ecff", 0.88);
  surfaceContext.fillText(`${fromTitle} -> ${toTitle}`, panelLeft + panelWidth / 2, panelTop + 15.5);
}

function drawGoalRelayPath(elapsed: number): void {
  if (!shouldShowTaskPrompts()) {
    return;
  }

  if (goalRelayState.pulse <= 0.02 || !goalRelayState.fromTarget || !goalRelayState.toTarget) {
    return;
  }

  const fromPosition = getInteractionTargetPosition(goalRelayState.fromTarget);
  const toPosition = getInteractionTargetPosition(goalRelayState.toTarget);
  const fromAnchor = worldToScreen(fromPosition.x, fromPosition.y);
  const toAnchor = worldToScreen(toPosition.x, toPosition.y);
  const rect = {
    left: Math.min(fromAnchor.x, toAnchor.x) - 12,
    top: Math.min(fromAnchor.y, toAnchor.y) - 12,
    width: Math.abs(toAnchor.x - fromAnchor.x) + 24,
    height: Math.abs(toAnchor.y - fromAnchor.y) + 24,
  };
  if (!isScreenRectVisible(rect)) {
    return;
  }

  const pulse = clamp(goalRelayState.pulse, 0, 1);
  surfaceContext.save();
  surfaceContext.strokeStyle = withAlpha(goalRelayState.toAccent, 0.3 + pulse * 0.22);
  surfaceContext.lineWidth = 1.4;
  surfaceContext.setLineDash([6, 4]);
  surfaceContext.lineDashOffset = -elapsed * 24;
  surfaceContext.beginPath();
  surfaceContext.moveTo(fromAnchor.x, fromAnchor.y + 6);
  surfaceContext.lineTo(toAnchor.x, toAnchor.y + 6);
  surfaceContext.stroke();
  surfaceContext.restore();

  drawSceneRouteStepBadge({ x: fromAnchor.x, y: fromAnchor.y - 10 }, "X", goalRelayState.fromAccent, false);
  drawSceneRouteStepBadge({ x: toAnchor.x, y: toAnchor.y - 10 }, "N", goalRelayState.toAccent, true);
}

function drawDepartmentMilestoneOverlay(elapsed: number): void {
  if (departmentMilestoneState.pulse <= 0.02) {
    return;
  }

  const department = departments.find((item) => item.id === departmentMilestoneState.departmentId);
  if (!department) {
    return;
  }

  const pulse = clamp(departmentMilestoneState.pulse, 0, 1);
  const shimmer = 0.5 + Math.sin(elapsed * 4.8) * 0.5;
  const cardWidth = 178;
  const cardHeight = 28;
  const cardLeft = Math.round(surface.width / 2 - cardWidth / 2);
  const cardTop = Math.round(surface.height * 0.24);
  surfaceContext.fillStyle = withAlpha("#09111d", 0.92);
  surfaceContext.fillRect(cardLeft, cardTop, cardWidth, cardHeight);
  surfaceContext.strokeStyle = withAlpha(departmentMilestoneState.accent, 0.78 + shimmer * 0.12);
  surfaceContext.lineWidth = 1;
  surfaceContext.strokeRect(cardLeft + 0.5, cardTop + 0.5, cardWidth - 1, cardHeight - 1);
  surfaceContext.fillStyle = withAlpha(departmentMilestoneState.accent, 0.16 + pulse * 0.08);
  surfaceContext.fillRect(cardLeft + 3, cardTop + 3, cardWidth - 6, 5);
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.font = '600 8px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillText(translateRuntimeCopy(departmentMilestoneState.title), cardLeft + cardWidth / 2, cardTop + 8);
  surfaceContext.fillStyle = withAlpha("#d9ecff", 0.88);
  surfaceContext.font = '500 6px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillText(translateRuntimeCopy(departmentMilestoneState.detail), cardLeft + cardWidth / 2, cardTop + 15.5);
  surfaceContext.fillText(
    pickUiText(
      `Impact +${departmentMilestoneState.impactScore} · ${departmentMilestoneState.completedScenarios}/${departmentMilestoneState.totalScenarios} 场景`,
      `Impact +${departmentMilestoneState.impactScore} · ${departmentMilestoneState.completedScenarios}/${departmentMilestoneState.totalScenarios} scenes`
    ),
    cardLeft + cardWidth / 2,
    cardTop + 22
  );
}

function drawDepartmentOutcomeFeedOverlay(elapsed: number): void {
  const records = getRecentDepartmentOutcomeFeed(3);
  if (records.length === 0) {
    return;
  }

  const panelWidth = 116;
  const rowHeight = 13;
  const panelHeight = 12 + records.length * rowHeight;
  const panelLeft = 14;
  const panelTop = 16;
  const panel: Rect = {
    left: panelLeft,
    top: panelTop,
    width: panelWidth,
    height: panelHeight,
  };
  drawPixelFrame(surfaceContext, panel, "#172033", "#53698f", "#090b12", 1);
  surfaceContext.fillStyle = "rgba(8, 12, 24, 0.74)";
  surfaceContext.fillRect(panelLeft + 2, panelTop + 2, panelWidth - 4, panelHeight - 4);
  surfaceContext.fillStyle = withAlpha("#8be08c", 0.14);
  surfaceContext.fillRect(panelLeft + 3, panelTop + 3, panelWidth - 6, 5);
  surfaceContext.textAlign = "left";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.font = 'bold 5px Monaco, "Courier New", monospace';
  surfaceContext.fillText("CLOSED LOOPS", panelLeft + 5, panelTop + 5);

  records.forEach((record, index) => {
    const rowTop = panelTop + 9 + index * rowHeight;
    const pulse = 0.5 + Math.sin(elapsed * 3.8 + index * 0.7) * 0.5;
    surfaceContext.fillStyle = withAlpha(record.accent, 0.1 + pulse * 0.06);
    surfaceContext.fillRect(panelLeft + 4, rowTop, panelWidth - 8, rowHeight - 2);
    surfaceContext.fillStyle = withAlpha(record.accent, 0.72);
    surfaceContext.fillRect(panelLeft + 4, rowTop, 3, rowHeight - 2);
    surfaceContext.fillStyle = "#f7fbff";
    surfaceContext.font = '600 6px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    surfaceContext.fillText(`${record.title} +${record.impactScore}`, panelLeft + 10, rowTop + 4);
    surfaceContext.fillStyle = withAlpha("#d9ecff", 0.84);
    surfaceContext.font = '500 5px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    surfaceContext.fillText(
      trimSpeechSegment(translateRuntimeCopy(record.highlights[0] ?? pickUiText("结果已回流", "Result synced back")), 12),
      panelLeft + 10,
      rowTop + 9
    );
  });
}

function drawMeetingStageCueOverlay(elapsed: number): void {
  if (!meetingState.active || meetingStageCueState.pulse <= 0.02) {
    return;
  }

  const cuePulse = clamp(meetingStageCueState.pulse, 0, 1);
  const shimmer = 0.5 + Math.sin(elapsed * 4.4) * 0.5;
  const panelWidth = 152;
  const panelHeight = 22;
  const panelLeft = surface.width - panelWidth - 16;
  const panelTop = 16;
  const meetingCandidates = getMeetingCandidateSummary(3);

  surfaceContext.fillStyle = withAlpha("#09111d", 0.9);
  surfaceContext.fillRect(panelLeft, panelTop, panelWidth, panelHeight);
  surfaceContext.strokeStyle = withAlpha(meetingStageCueState.accent, 0.7 + shimmer * 0.14);
  surfaceContext.lineWidth = 1;
  surfaceContext.strokeRect(panelLeft + 0.5, panelTop + 0.5, panelWidth - 1, panelHeight - 1);
  surfaceContext.fillStyle = withAlpha(meetingStageCueState.accent, 0.15 + cuePulse * 0.08);
  surfaceContext.fillRect(panelLeft + 3, panelTop + 3, panelWidth - 6, 5);
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.font = '600 8px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillText(translateRuntimeCopy(meetingStageCueState.title), panelLeft + panelWidth / 2, panelTop + 8);
  surfaceContext.fillStyle = withAlpha("#d9ecff", 0.88);
  surfaceContext.font = '500 6px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  surfaceContext.fillText(trimSpeechSegment(translateRuntimeCopy(meetingStageCueState.detail), 18), panelLeft + panelWidth / 2, panelTop + 15.5);
  surfaceContext.fillStyle = withAlpha(meetingStageCueState.accent, 0.18 + cuePulse * 0.08);
  surfaceContext.fillRect(panelLeft + 4, panelTop + panelHeight - 4, panelWidth - 8, 2);
  surfaceContext.fillStyle = withAlpha("#f7fbff", 0.86);
  surfaceContext.fillRect(panelLeft + 6, panelTop + panelHeight - 4, Math.max(18, (panelWidth - 12) * cuePulse), 2);
  if (meetingCandidates !== pickUiText("等待候选人", "Waiting candidates")) {
    surfaceContext.fillStyle = withAlpha("#09111d", 0.7);
    surfaceContext.fillRect(panelLeft + 32, panelTop + panelHeight - 9, panelWidth - 64, 5);
    surfaceContext.fillStyle = withAlpha("#f7fbff", 0.82);
    surfaceContext.font = 'bold 4px Monaco, "Courier New", monospace';
    surfaceContext.fillText(meetingCandidates, panelLeft + panelWidth / 2, panelTop + panelHeight - 6.2);
  }
}

function drawDepartmentOutcomeRibbon(
  department: SceneDepartment,
  walkway: Rect,
  elapsed: number,
  emphasized: boolean
): void {
  if (!isDepartmentFullyCompleted(department) || walkway.width < 26 || walkway.height < 6) {
    return;
  }

  const pulse = 0.5 + Math.sin(elapsed * 3.6 + department.decorSeed) * 0.5;
  const ribbon: Rect = {
    left: walkway.left + 5,
    top: walkway.top + Math.max(1, Math.round(walkway.height / 2) - 3),
    width: walkway.width - 10,
    height: 6,
  };
  surfaceContext.fillStyle = withAlpha("#09111d", 0.72);
  surfaceContext.fillRect(ribbon.left, ribbon.top, ribbon.width, ribbon.height);
  surfaceContext.strokeStyle = withAlpha(department.accent, emphasized ? 0.82 : 0.52 + pulse * 0.18);
  surfaceContext.lineWidth = 1;
  surfaceContext.strokeRect(ribbon.left + 0.5, ribbon.top + 0.5, ribbon.width - 1, ribbon.height - 1);
  surfaceContext.fillStyle = withAlpha(department.accent, 0.18 + pulse * 0.1);
  surfaceContext.fillRect(ribbon.left + 2, ribbon.top + 2, ribbon.width - 4, 2);
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.font = 'bold 4px Monaco, "Courier New", monospace';
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillText("RESULT", ribbon.left + ribbon.width / 2, ribbon.top + 3.8);
}

function drawDepartmentOutcomeWall(
  department: SceneDepartment,
  room: Rect,
  elapsed: number,
  emphasized: boolean
): void {
  if (!isDepartmentFullyCompleted(department) || room.width < 44 || room.height < 26) {
    return;
  }

  const highlights = getDepartmentOutcomeHighlights(department, 3);
  const panelWidth = Math.max(38, Math.min(52, Math.round(room.width * 0.3)));
  const panelHeight = Math.min(room.height - 16, 13 + highlights.length * 6);
  if (panelHeight < 20) {
    return;
  }

  const panel: Rect = {
    left: room.left + room.width - panelWidth - 6,
    top: room.top + 15,
    width: panelWidth,
    height: panelHeight,
  };
  const pulse = 0.5 + Math.sin(elapsed * 4 + department.decorSeed) * 0.5;
  const impactScore = getDepartmentImpactScore(department);
  drawPixelFrame(
    surfaceContext,
    panel,
    withAlpha("#09111d", 0.88),
    emphasized ? adjustHex(department.accent, 10) : withAlpha(department.accent, 0.78),
    "#090b12",
    1
  );
  surfaceContext.fillStyle = withAlpha(department.accent, emphasized ? 0.14 + pulse * 0.08 : 0.1 + pulse * 0.05);
  surfaceContext.fillRect(panel.left + 2, panel.top + 2, panel.width - 4, 4);
  surfaceContext.textAlign = "left";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.font = 'bold 5px Monaco, "Courier New", monospace';
  surfaceContext.fillText("RESULTS", panel.left + 4, panel.top + 4.5);
  surfaceContext.textAlign = "right";
  surfaceContext.fillStyle = withAlpha("#f7fbff", 0.88);
  surfaceContext.fillText(`+${impactScore}`, panel.left + panel.width - 4, panel.top + 4.5);

  highlights.forEach((item, index) => {
    const rowTop = panel.top + 8 + index * 6;
    surfaceContext.fillStyle = withAlpha(department.accent, 0.24 + index * 0.04);
    surfaceContext.fillRect(panel.left + 4, rowTop, 3, 3);
    surfaceContext.fillStyle = "#d9ecff";
    surfaceContext.font = '500 5px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    surfaceContext.textAlign = "left";
    surfaceContext.fillText(trimSpeechSegment(item, 10), panel.left + 9, rowTop + 1.8);
  });
}

function drawRoomFocusSweep(room: Rect, accent: string, elapsed: number, strength: number): void {
  const intensity = clamp(strength, 0, 1);
  if (intensity <= 0.08) {
    return;
  }

  const insetLeft = room.left + 3;
  const insetTop = room.top + 5;
  const insetWidth = Math.max(10, room.width - 6);
  const insetHeight = Math.max(10, room.height - 10);
  const sweepWidth = Math.max(10, Math.round(insetWidth * 0.24));
  const pulse = 0.5 + Math.sin(elapsed * 3 + room.left * 0.02) * 0.5;
  const travel = insetWidth + sweepWidth * 2;
  const sweepProgress = (elapsed * (24 + intensity * 10) + room.left * 0.07) % travel;
  const sweepLeft = clamp(
    Math.round(insetLeft - sweepWidth + sweepProgress),
    insetLeft,
    insetLeft + insetWidth - sweepWidth
  );

  surfaceContext.fillStyle = withAlpha(accent, 0.04 + intensity * 0.05);
  surfaceContext.fillRect(insetLeft, insetTop, insetWidth, insetHeight);
  surfaceContext.fillStyle = withAlpha(accent, 0.1 + intensity * 0.12 + pulse * 0.05);
  surfaceContext.fillRect(sweepLeft, insetTop + 1, sweepWidth, insetHeight - 2);
  surfaceContext.fillStyle = withAlpha("#f7fbff", 0.08 + intensity * 0.08);
  surfaceContext.fillRect(insetLeft + 2, insetTop + 2, Math.max(6, insetWidth - 4), 1);

  surfaceContext.fillStyle = withAlpha(accent, 0.18 + intensity * 0.16);
  surfaceContext.fillRect(room.left + 4, room.top + 4, 6, 1);
  surfaceContext.fillRect(room.left + 4, room.top + 4, 1, 6);
  surfaceContext.fillRect(room.left + room.width - 10, room.top + 4, 6, 1);
  surfaceContext.fillRect(room.left + room.width - 5, room.top + 4, 1, 6);
  surfaceContext.fillRect(room.left + 4, room.top + room.height - 5, 6, 1);
  surfaceContext.fillRect(room.left + 4, room.top + room.height - 10, 1, 6);
  surfaceContext.fillRect(room.left + room.width - 10, room.top + room.height - 5, 6, 1);
  surfaceContext.fillRect(room.left + room.width - 5, room.top + room.height - 10, 1, 6);
}

function drawRoomCrowdSignals(room: Rect, accent: string, elapsed: number, strength: number): void {
  const intensity = clamp(strength, 0, 1);
  if (intensity <= 0.12) {
    return;
  }

  const nodeCount = 2 + Math.round(intensity * 4);
  const top = room.top + 8;
  const bottom = room.top + room.height - 10;
  const left = room.left + 7;
  const right = room.left + room.width - 10;
  for (let index = 0; index < nodeCount; index += 1) {
    const progress = nodeCount === 1 ? 0.5 : index / (nodeCount - 1);
    const pulse = 0.5 + Math.sin(elapsed * 4.6 + index * 0.8 + room.left * 0.01) * 0.5;
    const signalTop = Math.round(lerp(top, bottom, progress));
    const glowAlpha = 0.16 + intensity * 0.18 + pulse * 0.08;

    surfaceContext.fillStyle = withAlpha(accent, glowAlpha);
    surfaceContext.fillRect(left, signalTop, 3, 3);
    surfaceContext.fillRect(right, signalTop, 3, 3);
    surfaceContext.fillStyle = withAlpha("#f7fbff", 0.18 + intensity * 0.12);
    surfaceContext.fillRect(left + 1, signalTop + 1, 1, 1);
    surfaceContext.fillRect(right + 1, signalTop + 1, 1, 1);
  }
}

function drawRoomActivityEdge(
  room: Rect,
  accent: string,
  stateAccent: string,
  fillRatio: number,
  elapsed: number,
  emphasized: boolean
): void {
  const barLeft = room.left + 8;
  const barTop = room.top + 5;
  const barWidth = Math.max(20, room.width - 24);
  const barHeight = 3;
  const fillWidth = Math.max(6, Math.round(barWidth * clamp(fillRatio, 0.12, 1)));
  const pulse = 0.5 + Math.sin(elapsed * 3.8 + room.left * 0.02) * 0.5;

  surfaceContext.fillStyle = "rgba(9, 11, 18, 0.42)";
  surfaceContext.fillRect(barLeft, barTop, barWidth, barHeight);
  surfaceContext.fillStyle = withAlpha(accent, emphasized ? 0.26 : 0.16);
  surfaceContext.fillRect(barLeft, barTop - 1, barWidth, 1);
  surfaceContext.fillStyle = withAlpha(stateAccent, emphasized ? 0.9 : 0.64 + pulse * 0.16);
  surfaceContext.fillRect(barLeft, barTop, fillWidth, barHeight);

  const lightCount = 4;
  for (let index = 0; index < lightCount; index += 1) {
    const active = index / Math.max(1, lightCount - 1) <= fillRatio + 0.05;
    const lightLeft = room.left + room.width - 12;
    const lightTop = room.top + 6 + index * 4;
    surfaceContext.fillStyle = active
      ? withAlpha(stateAccent, emphasized ? 0.92 : 0.7)
      : "rgba(23, 28, 42, 0.88)";
    surfaceContext.fillRect(lightLeft, lightTop, 4, 2);
  }
}

function drawOfficeProp(prop: OfficeProp, elapsed: number, index: number): void {
  const rect = rectToScreen(prop.rect);
  if (!isScreenRectVisible(rect)) {
    return;
  }
  const shadowInset = prop.kind === "meeting"
    ? 18
    : prop.kind === "sofa" || prop.kind === "diningTable"
      ? 7
      : prop.kind === "plant"
        ? 3
        : 4;
  const shadowAlpha = prop.kind === "plant" ? 0.12 : prop.kind === "meeting" ? 0.22 : 0.18;
  drawContactShadow(rect, shadowAlpha, shadowInset);

  switch (prop.kind) {
    case "meeting":
      drawPixelFrame(surfaceContext, rect, "#8a6547", "#5f4634", "#0c0d12", 3);
      surfaceContext.fillStyle = "#70523b";
      surfaceContext.fillRect(rect.left + 6, rect.top + 6, rect.width - 12, rect.height - 12);
      surfaceContext.fillStyle = "#d7c29c";
      surfaceContext.fillRect(rect.left + 10, rect.top + 9, rect.width - 20, 3);
      surfaceContext.fillStyle = "#5a4331";
      surfaceContext.fillRect(rect.left + 16, rect.top + 15, rect.width - 32, 3);
      surfaceContext.fillRect(rect.left + 16, rect.top + rect.height - 18, rect.width - 32, 3);
      surfaceContext.fillRect(rect.left + 22, rect.top + 12, 4, rect.height - 24);
      surfaceContext.fillRect(rect.left + rect.width - 26, rect.top + 12, 4, rect.height - 24);
      surfaceContext.fillStyle = "#f4e4c7";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 12, rect.top + Math.round(rect.height / 2) - 3, 24, 6);
      surfaceContext.fillStyle = "#344660";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 4, rect.top + Math.round(rect.height / 2) - 2, 8, 4);
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 2, rect.top + Math.round(rect.height / 2) - 1, 4, 2);
      const chairCount = Math.max(10, Math.ceil(npcs.length / 2));
      const chairInset = 12;
      const chairSpan = Math.max(1, rect.width - chairInset * 2);
      for (let chair = 0; chair < chairCount; chair += 1) {
        const progress = chairCount === 1 ? 0.5 : chair / (chairCount - 1);
        const chairX = Math.round(rect.left + chairInset + chairSpan * progress - 3);
        surfaceContext.fillStyle = "#3f5578";
        surfaceContext.fillRect(chairX, rect.top - 6, 7, 4);
        surfaceContext.fillRect(chairX, rect.top + rect.height + 2, 7, 4);
        if (chair % 3 === 1) {
          surfaceContext.fillStyle = "#dbe7fa";
          surfaceContext.fillRect(chairX + 2, rect.top + 4, 3, 2);
        }
      }
      break;
    case "podium":
      drawInteractionBeacon(
        {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
        elapsed,
        meetingState.active ? "#f4cf7d" : "#89d0ff",
        Boolean(hoveredPodium),
        {
          width: rect.width + 10,
          height: 12,
          offsetY: Math.round(rect.height / 2) - 2,
          beamHeight: 16,
          seed: rect.left * 0.03 + rect.top * 0.02,
        }
      );
      drawPixelFrame(surfaceContext, rect, "#7f6338", "#4a3620", "#0b0d14", 2);
      surfaceContext.fillStyle = "#d7c29c";
      surfaceContext.fillRect(rect.left + 2, rect.top + 2, rect.width - 4, 5);
      surfaceContext.fillStyle = "#6b5131";
      surfaceContext.fillRect(rect.left + 4, rect.top + 8, rect.width - 8, rect.height - 12);
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(rect.left + rect.width - 5, rect.top + 4, 2, 6);
      surfaceContext.fillRect(rect.left + rect.width - 3, rect.top + 4, 2, 2);
      surfaceContext.fillStyle = "#2f3d59";
      surfaceContext.fillRect(rect.left + 4, rect.top + 1, rect.width - 8, 2);
      surfaceContext.fillStyle = "#cddaf0";
      surfaceContext.fillRect(rect.left + rect.width - 4, rect.top, 1, 5);
      break;
    case "plant":
      const leafSway = Math.round(Math.sin(elapsed * 2.1 + index * 0.8));
      surfaceContext.fillStyle = "#7a5539";
      surfaceContext.fillRect(rect.left + 2, rect.top + rect.height - 4, rect.width - 4, 4);
      surfaceContext.fillStyle = "#9b7454";
      surfaceContext.fillRect(rect.left + 3, rect.top + rect.height - 6, rect.width - 6, 2);
      surfaceContext.fillStyle = pulseColor(elapsed + index, "#5e9b56", "#72bc65");
      surfaceContext.fillRect(rect.left + 1 + leafSway, rect.top + 2, rect.width - 2, rect.height - 6);
      surfaceContext.fillStyle = "#84d774";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 1, rect.top, 3, rect.height - 2);
      surfaceContext.fillRect(rect.left + 2 + leafSway, rect.top + 4, 2, Math.max(4, rect.height - 10));
      surfaceContext.fillRect(rect.left + rect.width - 4 + leafSway, rect.top + 5, 2, Math.max(4, rect.height - 11));
      break;
    case "cabinet":
      drawPixelFrame(surfaceContext, rect, "#7e7e8e", "#50586a", "#0b0d14", 2);
      surfaceContext.fillStyle = "#d8dde8";
      surfaceContext.fillRect(rect.left + 3, rect.top + 5, rect.width - 6, 3);
      surfaceContext.fillRect(rect.left + 3, rect.top + 11, rect.width - 6, 3);
      surfaceContext.fillStyle = "#a7b1c5";
      surfaceContext.fillRect(rect.left + 6, rect.top + 17, rect.width - 12, 2);
      surfaceContext.fillStyle = "#556072";
      surfaceContext.fillRect(rect.left + 5, rect.top + 6, 2, 1);
      surfaceContext.fillRect(rect.left + 5, rect.top + 12, 2, 1);
      surfaceContext.fillRect(rect.left + 5, rect.top + 17, 2, 1);
      surfaceContext.fillStyle = "#556072";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 1, rect.top + rect.height - 8, 2, 5);
      break;
    case "printer":
      drawPixelFrame(surfaceContext, rect, "#dce2ed", "#69748b", "#0b0d14", 2);
      surfaceContext.fillStyle = "#8a9cc0";
      surfaceContext.fillRect(rect.left + 2, rect.top + 2, rect.width - 4, 4);
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(rect.left + 4, rect.top + 7, rect.width - 8, 4);
      const printoutHeight = 2 + Math.round((Math.sin(elapsed * 1.8 + index) + 1) * 1.5);
      surfaceContext.fillStyle = "#dce4f3";
      surfaceContext.fillRect(rect.left + 5, rect.top - printoutHeight, rect.width - 10, printoutHeight + 1);
      surfaceContext.fillStyle = pulseColor(elapsed + index * 0.4, "#8be08c", "#f4cf7d");
      surfaceContext.fillRect(rect.left + rect.width - 5, rect.top + 3, 2, 2);
      surfaceContext.fillStyle = "#6b7c9a";
      surfaceContext.fillRect(rect.left + 5, rect.top + rect.height - 5, rect.width - 10, 2);
      break;
    case "coffee":
      drawPixelFrame(surfaceContext, rect, "#5e473d", "#352822", "#090b12", 2);
      surfaceContext.fillStyle = "#d0dbf2";
      surfaceContext.fillRect(rect.left + 4, rect.top + 4, rect.width - 8, rect.height - 8);
      surfaceContext.fillStyle = "#86654e";
      surfaceContext.fillRect(rect.left + rect.width - 5, rect.top + 5, 3, rect.height - 10);
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(rect.left + 4, rect.top + rect.height - 6, 5, 2);
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(rect.left + 3, rect.top + 3, 4, 5);
      surfaceContext.fillStyle = "#d8e1ef";
      surfaceContext.fillRect(rect.left + 6, rect.top + 4, 1, 3);
      surfaceContext.fillStyle = "#f5efe1";
      surfaceContext.fillRect(rect.left + 4, rect.top + 1, 1, 2);
      surfaceContext.fillRect(rect.left + 6, rect.top + 1, 1, 2);
      surfaceContext.fillStyle = "rgba(245, 247, 255, 0.55)";
      surfaceContext.fillRect(rect.left + 4, rect.top - 3 - Math.round(Math.sin(elapsed * 2.1 + index) * 1), 1, 3);
      surfaceContext.fillRect(rect.left + 6, rect.top - 5 - Math.round(Math.cos(elapsed * 1.9 + index) * 1), 1, 4);
      break;
    case "microwave":
      drawPixelFrame(surfaceContext, rect, "#d8dde8", "#6f7b95", "#090b12", 2);
      surfaceContext.fillStyle = "#c5d0e3";
      surfaceContext.fillRect(rect.left + 2, rect.top + 3, rect.width - 4, rect.height - 5);
      surfaceContext.fillStyle = "#7ea8d8";
      surfaceContext.fillRect(rect.left + 4, rect.top + 5, rect.width - 10, rect.height - 9);
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(rect.left + rect.width - 5, rect.top + 5, 2, 2);
      surfaceContext.fillStyle = "#8fa0bb";
      surfaceContext.fillRect(rect.left + rect.width - 5, rect.top + 9, 2, 1);
      surfaceContext.fillRect(rect.left + rect.width - 5, rect.top + 12, 2, 1);
      surfaceContext.fillStyle = pulseColor(elapsed + index * 0.45, "#f4cf7d", "#89d0ff");
      surfaceContext.fillRect(rect.left + 6, rect.top + 7, 5, 1);
      surfaceContext.fillRect(rect.left + 8, rect.top + 10, 1, 1);
      surfaceContext.fillStyle = "#556072";
      surfaceContext.fillRect(rect.left + rect.width - 4, rect.top + 9, 1, rect.height - 12);
      break;
    case "cooler":
      drawPixelFrame(surfaceContext, rect, "#d7eefc", "#7291c0", "#090b12", 2);
      surfaceContext.fillStyle = "#86baf0";
      surfaceContext.fillRect(rect.left + 2, rect.top + 3, rect.width - 4, 6);
      surfaceContext.fillStyle = "#edf5ff";
      surfaceContext.fillRect(rect.left + 4, rect.top + 12, rect.width - 8, 2);
      surfaceContext.fillStyle = "#7291c0";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 1, rect.top + 10, 2, 4);
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(rect.left + 4, rect.top + 5, 2, 2);
      surfaceContext.fillRect(rect.left + rect.width - 6, rect.top + 16, 2, 3);
      const waterWave = Math.max(3, rect.width - 6 - Math.abs(Math.round(Math.sin(elapsed * 2.4 + index) * 2)));
      surfaceContext.fillStyle = "rgba(247, 251, 255, 0.65)";
      surfaceContext.fillRect(rect.left + 3, rect.top + 7, waterWave, 1);
      break;
    case "sofa":
      drawPixelFrame(surfaceContext, rect, "#425273", "#24324b", "#090b12", 2);
      surfaceContext.fillStyle = "#5e7499";
      surfaceContext.fillRect(rect.left + 2, rect.top + 6, rect.width - 4, rect.height - 8);
      surfaceContext.fillStyle = "#738aac";
      surfaceContext.fillRect(rect.left + 3, rect.top + 3, rect.width - 6, 4);
      surfaceContext.fillRect(rect.left + 5, rect.top + 10, rect.width - 10, 2);
      surfaceContext.fillStyle = "#31435f";
      surfaceContext.fillRect(rect.left + 3, rect.top + 3, 3, rect.height - 5);
      surfaceContext.fillRect(rect.left + rect.width - 6, rect.top + 3, 3, rect.height - 5);
      surfaceContext.fillStyle = "#90a7ca";
      surfaceContext.fillRect(rect.left + 7, rect.top + 6, Math.max(6, rect.width - 14), 2);
      surfaceContext.fillStyle = "#1f2c42";
      surfaceContext.fillRect(rect.left + 5, rect.top + rect.height - 2, 4, 2);
      surfaceContext.fillRect(rect.left + rect.width - 9, rect.top + rect.height - 2, 4, 2);
      break;
    case "bookshelf":
      drawPixelFrame(surfaceContext, rect, "#896848", "#533a28", "#090b12", 2);
      for (let shelf = 0; shelf < 3; shelf += 1) {
        surfaceContext.fillStyle = shelf % 2 === 0 ? "#f1c16d" : "#8bc8ff";
        surfaceContext.fillRect(rect.left + 2, rect.top + 3 + shelf * 6, rect.width - 4, 3);
        surfaceContext.fillStyle = shelf % 2 === 0 ? "#8b542a" : "#486d99";
        for (let slot = 0; slot < Math.max(2, Math.floor((rect.width - 6) / 6)); slot += 1) {
          surfaceContext.fillRect(rect.left + 3 + slot * 6, rect.top + 3 + shelf * 6, 2, 3);
        }
      }
      surfaceContext.fillStyle = "#dbe4f2";
      surfaceContext.fillRect(rect.left + 4, rect.top + rect.height - 6, rect.width - 8, 2);
      break;
    case "whiteboard":
      drawPixelFrame(surfaceContext, rect, "#edf3fb", "#6d7b9a", "#090b12", 2);
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(rect.left + 6, rect.top + 4, rect.width - 12, 2);
      surfaceContext.fillStyle = "#e48d6f";
      surfaceContext.fillRect(rect.left + 10, rect.top + 8, 10, 2);
      surfaceContext.fillStyle = "#d0dbf2";
      surfaceContext.fillRect(rect.left + 22, rect.top + 8, rect.width - 30, 2);
      surfaceContext.fillRect(rect.left + 12, rect.top + rect.height - 5, rect.width - 18, 2);
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(rect.left + 6, rect.top + rect.height - 5, 4, 2);
      surfaceContext.fillRect(rect.left + rect.width - 10, rect.top + 4, 2, 2);
      break;
    case "receptionDesk":
      drawPixelFrame(surfaceContext, rect, "#8b6848", "#5a412d", "#090b12", 2);
      surfaceContext.fillStyle = "#6f5038";
      surfaceContext.fillRect(rect.left + 3, rect.top + 5, rect.width - 6, rect.height - 8);
      surfaceContext.fillStyle = "#dbe8fa";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 8, rect.top + 2, 16, 4);
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(rect.left + 8, rect.top + rect.height - 6, rect.width - 16, 2);
      surfaceContext.fillStyle = "#314a65";
      surfaceContext.fillRect(rect.left + 6, rect.top + 6, 10, 5);
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(rect.left + 8, rect.top + 7, 6, 2);
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(rect.left + rect.width - 10, rect.top + 6, 3, 3);
      drawGlassPanel(
        {
          left: rect.left + Math.round(rect.width * 0.18),
          top: rect.top - 7,
          width: Math.max(12, Math.round(rect.width * 0.64)),
          height: 7,
        },
        "#9ac6ff",
        0.28
      );
      surfaceContext.fillStyle = "#5f718c";
      surfaceContext.fillRect(rect.left + Math.round(rect.width * 0.28), rect.top - 1, 1, 4);
      surfaceContext.fillRect(rect.left + Math.round(rect.width * 0.72), rect.top - 1, 1, 4);
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(rect.left + 4, rect.top + 3, 4, 2);
      surfaceContext.fillStyle = "#dce4f2";
      surfaceContext.fillRect(rect.left + 5, rect.top + 5, 7, 2);
      break;
    case "diningTable": {
      const unit = Math.max(1, Math.round(Math.min(rect.width, rect.height) / 34));
      const px = (value: number): number => Math.max(1, Math.round(value * unit));
      const flipLayout = index % 2 === 1;
      const chairWidth = px(8);
      const chairHeight = px(4);
      const leftSlot = rect.left + px(flipLayout ? 16 : 6);
      const rightSlot = rect.left + px(flipLayout ? 6 : 16);
      const topSlot = rect.top + px(6);
      const bottomSlot = rect.top + px(20);

      drawPixelFrame(surfaceContext, rect, "#9f744e", "#65462d", "#090b12", 2);
      surfaceContext.fillStyle = "#caa476";
      surfaceContext.fillRect(rect.left + px(4), rect.top + px(4), rect.width - px(8), rect.height - px(8));
      surfaceContext.fillStyle = "#52698d";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - Math.round(chairWidth / 2), rect.top - chairHeight, chairWidth, chairHeight);
      surfaceContext.fillRect(
        rect.left + Math.round(rect.width / 2) - Math.round(chairWidth / 2),
        rect.top + rect.height,
        chairWidth,
        chairHeight
      );
      surfaceContext.fillRect(rect.left - chairHeight, rect.top + Math.round(rect.height / 2) - Math.round(chairWidth / 2), chairHeight, chairWidth);
      surfaceContext.fillRect(
        rect.left + rect.width,
        rect.top + Math.round(rect.height / 2) - Math.round(chairWidth / 2),
        chairHeight,
        chairWidth
      );

      surfaceContext.fillStyle = "#e9d6b6";
      surfaceContext.fillRect(rect.left + px(6), rect.top + Math.round(rect.height / 2) - px(2), rect.width - px(12), px(4));

      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(leftSlot, topSlot, px(12), px(8));
      surfaceContext.fillStyle = "#d6deea";
      surfaceContext.fillRect(leftSlot + px(1), topSlot + px(6), px(10), px(1));
      for (let piece = 0; piece < 3; piece += 1) {
        const pieceLeft = leftSlot + px(2) + piece * px(3);
        surfaceContext.fillStyle = "#1f2836";
        surfaceContext.fillRect(pieceLeft, topSlot + px(3), px(2), px(3));
        surfaceContext.fillStyle = piece === 1 ? "#ffcf6b" : "#ff8c72";
        surfaceContext.fillRect(pieceLeft, topSlot + px(2), px(2), px(1));
      }

      surfaceContext.fillStyle = "#7a5539";
      surfaceContext.fillRect(rightSlot, bottomSlot, px(12), px(8));
      surfaceContext.fillStyle = "#b97a43";
      surfaceContext.fillRect(rightSlot + px(1), bottomSlot + px(1), px(10), px(6));
      for (let skewer = 0; skewer < 2; skewer += 1) {
        const skewerTop = bottomSlot + px(2) + skewer * px(2);
        surfaceContext.fillStyle = "#d8c38d";
        surfaceContext.fillRect(rightSlot + px(2), skewerTop, px(8), px(1));
        surfaceContext.fillStyle = skewer === 0 ? "#9b4f2c" : "#7d3d21";
        surfaceContext.fillRect(rightSlot + px(3), skewerTop - px(1), px(5), px(2));
      }

      const bottleLeft = rect.left + Math.round(rect.width / 2) - px(2);
      const bottleTop = rect.top + px(8);
      surfaceContext.fillStyle = "#4d6a56";
      surfaceContext.fillRect(bottleLeft, bottleTop, px(3), px(8));
      surfaceContext.fillRect(bottleLeft + px(1), bottleTop - px(2), px(1), px(2));
      surfaceContext.fillStyle = "#d9b8c8";
      surfaceContext.fillRect(bottleLeft, bottleTop + px(2), px(3), px(2));

      const glassLeft = bottleLeft + px(5);
      const glassTop = bottleTop + px(2);
      surfaceContext.fillStyle = "#dfe8f6";
      surfaceContext.fillRect(glassLeft, glassTop, px(3), px(3));
      surfaceContext.fillRect(glassLeft + px(1), glassTop + px(3), px(1), px(3));
      surfaceContext.fillStyle = "#b56578";
      surfaceContext.fillRect(glassLeft + px(1), glassTop + px(1), px(1), px(1));
      break;
    }
    case "servingCounter":
      drawPixelFrame(surfaceContext, rect, "#c9d2df", "#657189", "#090b12", 2);
      surfaceContext.fillStyle = "#e8edf5";
      surfaceContext.fillRect(rect.left + 4, rect.top + 4, rect.width - 8, rect.height - 8);
      surfaceContext.fillStyle = "#8a99b5";
      if (rect.height > rect.width) {
        for (let shelf = 0; shelf < 3; shelf += 1) {
          surfaceContext.fillRect(rect.left + 5, rect.top + 7 + shelf * 12, rect.width - 10, 3);
        }
      } else {
        for (let shelf = 0; shelf < 3; shelf += 1) {
          surfaceContext.fillRect(rect.left + 6 + shelf * 12, rect.top + 5, 3, rect.height - 10);
        }
      }
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(rect.left + 3, rect.top + 3, rect.width - 6, 2);
      if (rect.height > rect.width) {
        surfaceContext.fillStyle = "#dce6f6";
        surfaceContext.fillRect(rect.left + 6, rect.top + rect.height - 8, rect.width - 12, 3);
        drawGlassPanel(
          {
            left: rect.left + 2,
            top: rect.top - 6,
            width: rect.width - 4,
            height: 6,
          },
          "#f6d27a",
          0.22
        );
        surfaceContext.fillStyle = "#7f8ba1";
        surfaceContext.fillRect(rect.left + 4, rect.top - 1, 1, 5);
        surfaceContext.fillRect(rect.left + rect.width - 5, rect.top - 1, 1, 5);
        for (let tray = 0; tray < 2; tray += 1) {
          const trayTop = rect.top + 10 + tray * 14;
          surfaceContext.fillStyle = "#f1d8aa";
          surfaceContext.fillRect(rect.left + 5, trayTop, rect.width - 10, 2);
          surfaceContext.fillStyle = tray === 0 ? "#c87452" : "#7ab874";
          surfaceContext.fillRect(rect.left + 6, trayTop + 3, rect.width - 12, 3);
        }
      } else {
        surfaceContext.fillStyle = "#dce6f6";
        surfaceContext.fillRect(rect.left + rect.width - 8, rect.top + 6, 3, rect.height - 12);
        drawGlassPanel(
          {
            left: rect.left,
            top: rect.top + 2,
            width: rect.width,
            height: 6,
          },
          "#f6d27a",
          0.22
        );
      }
      break;
    default:
      drawPixelFrame(surfaceContext, rect, "#5a6280", "#303752", "#090b12", 2);
  }
}

function drawOfficePropForegroundOverlays(elapsed: number): void {
  officeProps.forEach((prop, index) => {
    const rect = rectToScreen(prop.rect);
    if (!isScreenRectVisible(rect)) {
      return;
    }

    switch (prop.kind) {
      case "meeting": {
        const lip: Rect = {
          left: rect.left + 18,
          top: rect.top + rect.height - 5,
          width: Math.max(18, rect.width - 36),
          height: 5,
        };
        surfaceContext.fillStyle = "rgba(63, 44, 31, 0.36)";
        surfaceContext.fillRect(lip.left, lip.top, lip.width, lip.height);
        surfaceContext.fillStyle = "rgba(247, 235, 213, 0.32)";
        surfaceContext.fillRect(lip.left + 4, lip.top, lip.width - 8, 1);
        break;
      }
      case "receptionDesk": {
        const panel: Rect = {
          left: rect.left + Math.round(rect.width * 0.18),
          top: rect.top - 7,
          width: Math.max(12, Math.round(rect.width * 0.64)),
          height: 7,
        };
        drawGlassPanel(panel, "#9ac6ff", 0.34);
        surfaceContext.fillStyle = "rgba(255,255,255,0.3)";
        surfaceContext.fillRect(panel.left + 4, panel.top + 2, panel.width - 8, 1);
        surfaceContext.fillStyle = "rgba(154, 198, 255, 0.18)";
        surfaceContext.fillRect(rect.left + 4, rect.top + 1, rect.width - 8, 3);
        break;
      }
      case "servingCounter": {
        if (rect.height > rect.width) {
          const glass: Rect = {
            left: rect.left + 2,
            top: rect.top - 6,
            width: rect.width - 4,
            height: 6,
          };
          drawGlassPanel(glass, "#f6d27a", 0.28);
          for (let wisp = 0; wisp < 2; wisp += 1) {
            const steamLeft = rect.left + 5 + wisp * 4;
            const steamOffset = Math.round(Math.sin(elapsed * 1.8 + index + wisp * 0.7) * 1.5);
            surfaceContext.fillStyle = "rgba(255, 248, 224, 0.26)";
            surfaceContext.fillRect(steamLeft + steamOffset, rect.top - 8 - wisp * 2, 1, 3);
            surfaceContext.fillRect(steamLeft + 1 + steamOffset, rect.top - 11 - wisp * 2, 1, 2);
          }
          surfaceContext.fillStyle = "rgba(246, 210, 122, 0.15)";
          surfaceContext.fillRect(rect.left + 2, rect.top + 2, rect.width - 4, 6);
        } else {
          const glass: Rect = {
            left: rect.left,
            top: rect.top + 2,
            width: rect.width,
            height: 6,
          };
          drawGlassPanel(glass, "#f6d27a", 0.28);
        }
        break;
      }
      case "sofa": {
        surfaceContext.fillStyle = "rgba(24, 35, 58, 0.22)";
        surfaceContext.fillRect(rect.left + 4, rect.top + rect.height - 4, rect.width - 8, 4);
        surfaceContext.fillStyle = "rgba(198, 216, 242, 0.16)";
        surfaceContext.fillRect(rect.left + 6, rect.top + 5, rect.width - 12, 1);
        break;
      }
      default:
    }
  });
}

function getAreaGuideBubbleLines(guide: AreaGuide): string[] {
  const lines = splitBubbleText(guide.preview, 8).slice(0, 2);
  return [guide.label, ...lines, isTapInteractionMode() ? pickUiText("点击看详情", "Tap for details") : pickUiText("按 E 看详情", "Press E for details")];
}

function drawFloatingInfoBubble(
  anchor: Point,
  lines: string[],
  transform: SurfaceDrawTransform,
  accent: string,
  reservedRects: Rect[] = []
): void {
  const localizedLines = lines.map((line) => translateRuntimeCopy(line));
  const uiScale = Math.min(window.devicePixelRatio || 1, 2);
  const fontSize = 12 * uiScale;
  const lineHeight = 16 * uiScale;
  const paddingX = 12 * uiScale;
  const paddingY = 8 * uiScale;
  const borderWidth = Math.max(2, Math.round(uiScale * 2));
  const pointerWidth = 10 * uiScale;
  const pointerHeight = 8 * uiScale;
  const shadowOffset = Math.max(3, Math.round(uiScale * 3));
  const margin = 8 * uiScale;
  const anchorOnCanvas = surfacePointToCanvas(anchor, transform);

  sceneContext.save();
  sceneContext.font = `600 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  sceneContext.textAlign = "center";
  sceneContext.textBaseline = "middle";

  const textWidth = localizedLines.reduce((max, line) => Math.max(max, sceneContext.measureText(line).width), 0);
  const width = Math.ceil(textWidth + paddingX * 2);
  const height = Math.ceil(localizedLines.length * lineHeight + paddingY * 2);
  const placement = resolveOverlayPlacement(
    {
      left: anchorOnCanvas.x - width / 2,
      top: anchorOnCanvas.y - height - pointerHeight - 18 * uiScale,
      width,
      height,
    },
    reservedRects,
    margin,
    Math.max(8, Math.round(lineHeight * 0.7))
  );
  const left = placement.left;
  const top = placement.top;
  const pointerX = clamp(anchorOnCanvas.x, left + pointerWidth, left + width - pointerWidth);

  sceneContext.fillStyle = "rgba(9, 11, 18, 0.35)";
  sceneContext.fillRect(left + shadowOffset, top + shadowOffset, width, height);
  sceneContext.beginPath();
  sceneContext.moveTo(pointerX - pointerWidth / 2 + shadowOffset, top + height + shadowOffset);
  sceneContext.lineTo(pointerX + shadowOffset, top + height + pointerHeight + shadowOffset);
  sceneContext.lineTo(pointerX + pointerWidth / 2 + shadowOffset, top + height + shadowOffset);
  sceneContext.closePath();
  sceneContext.fill();

  sceneContext.fillStyle = "rgba(243, 246, 251, 0.97)";
  sceneContext.fillRect(left, top, width, height);
  sceneContext.strokeStyle = adjustHex(accent, -32);
  sceneContext.lineWidth = borderWidth;
  sceneContext.strokeRect(left + borderWidth / 2, top + borderWidth / 2, width - borderWidth, height - borderWidth);

  sceneContext.beginPath();
  sceneContext.moveTo(pointerX - pointerWidth / 2, top + height);
  sceneContext.lineTo(pointerX, top + height + pointerHeight);
  sceneContext.lineTo(pointerX + pointerWidth / 2, top + height);
  sceneContext.closePath();
  sceneContext.fill();
  sceneContext.stroke();

  localizedLines.forEach((line, index) => {
    sceneContext.fillStyle = index === 0 ? adjustHex(accent, -40) : "#202638";
    sceneContext.fillText(line, left + width / 2, top + paddingY + lineHeight / 2 + index * lineHeight);
  });
  sceneContext.restore();
}

function drawFallbackLobsterGuideSprite(
  anchor: Point,
  elapsed: number,
  active: boolean,
  options: {
    cutout?: boolean;
    glowAlpha?: number;
    scale?: number;
  } = {}
): void {
  const scale = Math.max(1, options.scale ?? 1);
  const x = Math.round(anchor.x);
  const y = Math.round(anchor.y + Math.sin(elapsed * 2.6 + anchor.x * 0.03) * (active ? 0.8 : 0.35));
  const shell = active ? "#ff6c61" : "#ef564e";
  const shellDark = active ? "#d43f3b" : "#b73733";
  const claw = active ? "#f85f54" : "#df4f48";
  const eye = "#0c1626";
  const eyeGlow = "#61ebff";
  const outline = "#fff9f2";
  const glowAlpha = options.glowAlpha ?? 0.32;
  const unit = (value: number): number => Math.round(value * scale);
  const drawRect = (offsetX: number, offsetY: number, width: number, height: number, color: string): void => {
    surfaceContext.fillStyle = color;
    surfaceContext.fillRect(
      x + unit(offsetX),
      y + unit(offsetY),
      Math.max(1, unit(width)),
      Math.max(1, unit(height))
    );
  };

  drawGroundShadow(x, y, Math.max(16, unit(16) + Math.round(scale * 2)));
  if (active) {
    surfaceContext.fillStyle = withAlpha(options.cutout ? "#fff1ea" : "#ff8176", glowAlpha);
    surfaceContext.fillRect(x - unit(10), y - unit(12), unit(20), unit(20));
  }

  const rows = [
    { offsetY: -8, left: -3, width: 6 },
    { offsetY: -7, left: -5, width: 10 },
    { offsetY: -6, left: -6, width: 12 },
    { offsetY: -5, left: -7, width: 14 },
    { offsetY: -4, left: -7, width: 14 },
    { offsetY: -3, left: -8, width: 16 },
    { offsetY: -2, left: -8, width: 16 },
    { offsetY: -1, left: -8, width: 16 },
    { offsetY: 0, left: -8, width: 16 },
    { offsetY: 1, left: -7, width: 14 },
    { offsetY: 2, left: -7, width: 14 },
    { offsetY: 3, left: -6, width: 12 },
    { offsetY: 4, left: -5, width: 10 },
    { offsetY: 5, left: -4, width: 8 },
  ];
  const shellRects = [
    ...rows.map((row) => ({ offsetX: row.left, offsetY: row.offsetY, width: row.width, height: 1, color: shell })),
    { offsetX: -12, offsetY: -1, width: 4, height: 4, color: shell },
    { offsetX: -13, offsetY: 0, width: 4, height: 3, color: shell },
    { offsetX: 8, offsetY: -1, width: 4, height: 4, color: shell },
    { offsetX: 9, offsetY: 0, width: 4, height: 3, color: shell },
    { offsetX: -14, offsetY: 1, width: 4, height: 3, color: claw },
    { offsetX: 10, offsetY: 1, width: 4, height: 3, color: claw },
    { offsetX: -5, offsetY: -11, width: 1, height: 3, color: shell },
    { offsetX: 4, offsetY: -11, width: 1, height: 3, color: shell },
    { offsetX: -6, offsetY: -12, width: 1, height: 1, color: shell },
    { offsetX: 5, offsetY: -12, width: 1, height: 1, color: shell },
    { offsetX: -4, offsetY: -12, width: 1, height: 1, color: shell },
    { offsetX: 3, offsetY: -12, width: 1, height: 1, color: shell },
    { offsetX: -2, offsetY: 6, width: 2, height: 4, color: shellDark },
    { offsetX: 1, offsetY: 6, width: 2, height: 4, color: shellDark },
  ];

  if (options.cutout) {
    shellRects.forEach((rect) => {
      drawRect(rect.offsetX - 1, rect.offsetY, rect.width, rect.height, outline);
      drawRect(rect.offsetX + 1, rect.offsetY, rect.width, rect.height, outline);
      drawRect(rect.offsetX, rect.offsetY - 1, rect.width, rect.height, outline);
      drawRect(rect.offsetX, rect.offsetY + 1, rect.width, rect.height, outline);
    });
  }

  rows.forEach((row) => drawRect(row.left, row.offsetY, row.width, 1, shell));
  surfaceContext.fillStyle = shellDark;
  rows
    .slice(5)
    .forEach((row) => drawRect(row.left + 2, row.offsetY, Math.max(2, row.width - 6), 1, shellDark));

  drawRect(-12, -1, 4, 4, shell);
  drawRect(-13, 0, 4, 3, shell);
  drawRect(8, -1, 4, 4, shell);
  drawRect(9, 0, 4, 3, shell);
  drawRect(-14, 1, 4, 3, claw);
  drawRect(10, 1, 4, 3, claw);

  drawRect(-2, 6, 2, 4, shellDark);
  drawRect(1, 6, 2, 4, shellDark);

  drawRect(-5, -11, 1, 3, shell);
  drawRect(4, -11, 1, 3, shell);
  drawRect(-6, -12, 1, 1, shell);
  drawRect(5, -12, 1, 1, shell);
  drawRect(-4, -12, 1, 1, shell);
  drawRect(3, -12, 1, 1, shell);

  drawRect(-4, -4, 3, 3, eye);
  drawRect(1, -4, 3, 3, eye);
  drawRect(-3, -3, 1, 1, eyeGlow);
  drawRect(2, -3, 1, 1, eyeGlow);
}

function drawLobsterGuideSprite(
  anchor: Point,
  elapsed: number,
  active: boolean,
  options: {
    cutout?: boolean;
    glowAlpha?: number;
    scale?: number;
    facing?: PlayerSpriteFacing;
    facingAngle?: number;
  } = {}
): void {
  const scale = Math.max(1, options.scale ?? 1);
  const x = Math.round(anchor.x);
  const y = Math.round(anchor.y + Math.sin(elapsed * 2.6 + anchor.x * 0.03) * (active ? 0.8 : 0.35));
  const sheet = lobsterSpriteSheetState.sheet;
  if (!sheet) {
    drawFallbackLobsterGuideSprite(anchor, elapsed, active, options);
    return;
  }

  drawGroundShadow(x, y, Math.max(16, Math.round((LOBSTER_SPRITE_FRAME_SIZE / 2) * scale) + 2));
  if (active) {
    surfaceContext.fillStyle = withAlpha(options.cutout ? "#fff1ea" : "#ff8176", options.glowAlpha ?? 0.32);
    surfaceContext.fillRect(
      x - Math.round(10 * scale),
      y - Math.round(12 * scale),
      Math.round(20 * scale),
      Math.round(20 * scale)
    );
  }

  const facing = options.facing ?? getPlayerSpriteFacing(options.facingAngle ?? Math.PI / 2);
  const frame = sheet.frames[facing];
  const drawWidth = Math.max(24, Math.round(frame.width * scale));
  const drawHeight = Math.max(24, Math.round(frame.height * scale));
  const drawLeft = x - Math.round(LOBSTER_SPRITE_ANCHOR_X * scale);
  const drawTop = y - Math.round(LOBSTER_SPRITE_ANCHOR_Y * scale);

  surfaceContext.save();
  surfaceContext.globalAlpha = active ? 1 : 0.94;
  surfaceContext.drawImage(
    sheet.canvas,
    frame.left,
    frame.top,
    frame.width,
    frame.height,
    drawLeft,
    drawTop,
    drawWidth,
    drawHeight
  );
  surfaceContext.restore();
}

function drawAreaGuide(guide: AreaGuide, elapsed: number): void {
  const anchor = worldToScreen(guide.position.x, guide.position.y);
  if (
    !isScreenRectVisible({
      left: anchor.x - 16,
      top: anchor.y - 20,
      width: 32,
      height: 32,
    })
  ) {
    return;
  }

  const highlighted = hoveredGuide?.id === guide.id;
  drawInteractionBeacon(anchor, elapsed, guide.accent, highlighted, {
    width: 20,
    height: 12,
    offsetY: 4,
    beamHeight: 14,
    seed: guide.position.x * 0.03 + guide.position.y * 0.02,
  });
  drawLobsterGuideSprite(anchor, elapsed, highlighted, { facing: guide.facing });
}

function drawSharedZone(zone: SharedZone, elapsed: number): void {
  const room = rectToScreen(zone.roomRect);
  const walkway = rectToScreen(zone.walkwayRect);
  const promptTargetSharedZone = getPromptTargetSharedZone();
  const focused = promptTargetSharedZone?.id === zone.id;
  const active = zone.id === activeSharedZoneId;
  const occupancyRatio = getSharedZoneOccupancyRatio(zone);
  const occupancy = getSharedZoneOccupancy(zone);
  const topSharedZone = getTopSharedZone();
  const hotspot = topSharedZone?.id === zone.id;
  if (!isScreenRectVisible(room) && !isScreenRectVisible(walkway)) {
    return;
  }

  surfaceContext.fillStyle = withAlpha(
    zone.accent,
    focused ? 0.28 : active ? 0.24 : hotspot ? 0.22 : 0.16 + occupancyRatio * 0.08
  );
  surfaceContext.fillRect(walkway.left, walkway.top, walkway.width, walkway.height);

  drawRoomFrame(
    surfaceContext,
    room,
    walkway,
    focused ? adjustHex(zone.accent, -4) : adjustHex(zone.accent, -18),
    focused ? "#f7fbff" : adjustHex(zone.accent, 12),
    "#090a10",
    2,
    zone.approachSide
  );
  surfaceContext.fillStyle = zone.kind === "reception" ? "#3d4861" : "#5b4837";
  surfaceContext.fillRect(room.left + 3, room.top + 4, room.width - 6, room.height - 8);
  drawRoomFocusSweep(
    room,
    zone.accent,
    elapsed,
    focused ? 1 : active ? 0.66 : hotspot ? 0.52 : occupancyRatio * 0.7
  );
  drawRoomCrowdSignals(
    room,
    zone.accent,
    elapsed,
    focused ? 0.82 : active ? 0.58 : hotspot ? 0.5 : occupancyRatio * 0.86
  );
  drawRoomActivityEdge(
    room,
    zone.accent,
    zone.accent,
    Math.max(focused ? 0.92 : active ? 0.72 : hotspot ? 0.56 : 0.32, occupancyRatio),
    elapsed,
    active || focused || hotspot
  );
  drawEntranceGuide(
    room,
    walkway,
    zone.accent,
    zone.approachSide,
    elapsed,
    room.left * 0.015,
    active || focused || hotspot
  );

  if (focused) {
    const thresholdY = zone.approachSide === "down" ? room.top + room.height - 5 : room.top + 3;
    surfaceContext.fillStyle = withAlpha("#f7fbff", 0.42);
    surfaceContext.fillRect(walkway.left + 4, thresholdY, walkway.width - 8, 2);
    surfaceContext.fillStyle = withAlpha(zone.accent, 0.56);
    surfaceContext.fillRect(walkway.left + 8, thresholdY - 1, walkway.width - 16, 1);
  }

  drawSharedZoneDecor(zone, room, elapsed);

  if (occupancy >= 2) {
    surfaceContext.fillStyle = withAlpha(zone.accent, 0.34);
    surfaceContext.fillRect(room.left + room.width - 22, room.top + 6, 16, 6);
    surfaceContext.fillStyle = "#f7fbff";
    for (let index = 0; index < Math.min(occupancy, 4); index += 1) {
      surfaceContext.fillRect(room.left + room.width - 20 + index * 4, room.top + 8, 2, 2);
    }
  }
}

function drawDepartment(department: SceneDepartment, elapsed: number): void {
  const room = rectToScreen(department.roomRect);
  const walkway = rectToScreen(department.walkwayRect);
  const departmentNpcs = npcs.filter((npc) => npc.department.id === department.id);
  const promptTargetDepartment = getPromptTargetDepartment();
  const focused = promptTargetDepartment?.id === department.id;
  const npcVisible = departmentNpcs.some((npc) => {
    const anchor = worldToScreen(npc.x, npc.y);
    return isScreenRectVisible({
      left: anchor.x - 8,
      top: anchor.y - 18,
      width: 16,
      height: 28,
    });
  });
  if (!isScreenRectVisible(room) && !isScreenRectVisible(walkway) && !npcVisible) {
    return;
  }

  const state = getDepartmentVisualState(department);
  const occupancyRatio = getDepartmentOccupancyRatio(department);
  const occupancy = getDepartmentOccupancy(department);
  const completed = getDepartmentCompletion(department);
  const fullyCompleted = isDepartmentFullyCompleted(department);
  const active = department.id === activeDepartmentId;
  const topDepartment = getTopActiveDepartment();
  const hotspot = topDepartment?.id === department.id;
  const milestoneActive = departmentMilestoneState.pulse > 0.08 && departmentMilestoneState.departmentId === department.id;

  surfaceContext.fillStyle = active
    ? withAlpha(department.accent, 0.22)
    : focused
      ? withAlpha(department.accent, 0.18)
      : milestoneActive
        ? withAlpha(department.accent, 0.2)
      : hotspot
        ? withAlpha(department.accent, 0.14)
        : "rgba(0,0,0,0.1)";
  surfaceContext.fillRect(walkway.left, walkway.top, walkway.width, walkway.height);

  drawRoomFrame(
    surfaceContext,
    room,
    walkway,
    focused
      ? adjustHex(department.accent, -6)
      : milestoneActive
        ? adjustHex(department.accent, 4)
      : state === "done"
        ? adjustHex(department.accent, -20)
        : "#6f553f",
    active
      ? "#ffffff"
      : focused
        ? withAlpha("#f7fbff", 0.9)
        : milestoneActive
          ? "#f0fff2"
        : state === "done"
          ? "#8be08c"
          : "#4c3c31",
    "#090a10",
    2,
    department.approachSide
  );
  surfaceContext.fillStyle = "#4b3728";
  surfaceContext.fillRect(room.left + 3, room.top + 4, room.width - 6, room.height - 8);
  drawRoomFocusSweep(
    room,
    department.accent,
    elapsed,
    focused ? 1 : active ? 0.7 : milestoneActive ? 0.82 : hotspot ? 0.48 : occupancyRatio * 0.28
  );
  drawRoomCrowdSignals(
    room,
    department.accent,
    elapsed,
    focused ? 0.76 : active ? 0.58 : hotspot ? 0.48 : occupancyRatio * 0.7
  );
  drawRoomActivityEdge(
    room,
    department.accent,
    getDepartmentStateAccent(state),
    occupancyRatio,
    elapsed,
    active || focused || hotspot
  );
  drawEntranceGuide(
    room,
    walkway,
    department.accent,
    department.approachSide,
    elapsed,
    department.decorSeed,
    active || focused || hotspot
  );

  drawDepartmentOutcomeRibbon(
    department,
    walkway,
    elapsed,
    focused || active || milestoneActive
  );
  drawDepartmentDecor(department, room, elapsed, state, focused);
  drawDepartmentOutcomeWall(
    department,
    room,
    elapsed,
    focused || milestoneActive
  );
  drawNpcSprites(departmentNpcs, elapsed);

  drawStatusDot(department, room, state);
  department.terminals.forEach((terminal, index) => {
    const position = worldToScreen(terminal.position.x, terminal.position.y);
    drawTerminal(terminal, position, elapsed, index);
  });

  drawInsightNode(department.insight, elapsed);

  for (let index = 0; index < department.scenarios.length; index += 1) {
    surfaceContext.fillStyle = completedScenarios.has(department.scenarios[index].id) ? "#8be08c" : "#5c6180";
    surfaceContext.fillRect(room.left + room.width - 5 - index * 6, room.top + 3, 4, 4);
  }

  if (fullyCompleted) {
    const stampPulse = 0.5 + Math.sin(elapsed * 4 + room.left * 0.02) * 0.5;
    const stamp: Rect = {
      left: room.left + 6,
      top: room.top + 4,
      width: 28,
      height: 9,
    };
    surfaceContext.fillStyle = withAlpha(department.accent, 0.16 + stampPulse * 0.08);
    surfaceContext.fillRect(stamp.left, stamp.top, stamp.width, stamp.height);
    surfaceContext.strokeStyle = withAlpha("#8be08c", 0.84);
    surfaceContext.lineWidth = 1;
    surfaceContext.strokeRect(stamp.left + 0.5, stamp.top + 0.5, stamp.width - 1, stamp.height - 1);
    surfaceContext.fillStyle = "#f7fbff";
    surfaceContext.textAlign = "center";
    surfaceContext.textBaseline = "middle";
    surfaceContext.font = 'bold 5px Monaco, "Courier New", monospace';
    surfaceContext.fillText("CLOSED", stamp.left + stamp.width / 2, stamp.top + 5);
  }

  if (hotspot && occupancy > 0) {
    surfaceContext.fillStyle = withAlpha(department.accent, 0.3);
    surfaceContext.fillRect(room.left + 6, room.top + room.height - 10, 20, 4);
    surfaceContext.fillStyle = "#f7fbff";
    for (let index = 0; index < Math.min(occupancy, 4); index += 1) {
      surfaceContext.fillRect(room.left + 8 + index * 4, room.top + room.height - 9, 2, 2);
    }
  }
}

function drawNpcSpeechBubble(
  anchor: Point,
  text: string,
  transform: SurfaceDrawTransform,
  alpha = 1,
  reservedRects: Rect[] = []
): void {
  const lines = splitBubbleText(translateRuntimeCopy(text));
  const uiScale = Math.min(window.devicePixelRatio || 1, 2);
  const fontSize = NPC_BUBBLE_FONT_SIZE * uiScale;
  const lineHeight = NPC_BUBBLE_LINE_HEIGHT * uiScale;
  const paddingX = 10 * uiScale;
  const paddingY = 8 * uiScale;
  const borderWidth = Math.max(2, Math.round(uiScale * 2));
  const pointerWidth = 10 * uiScale;
  const pointerHeight = 8 * uiScale;
  const shadowOffset = Math.max(3, Math.round(uiScale * 3));
  const margin = 8 * uiScale;
  const anchorOnCanvas = surfacePointToCanvas(anchor, transform);

  sceneContext.save();
  sceneContext.globalAlpha = alpha;
  sceneContext.font = `600 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  sceneContext.textAlign = "center";
  sceneContext.textBaseline = "middle";

  const textWidth = lines.reduce((max, line) => Math.max(max, sceneContext.measureText(line).width), 0);
  const width = Math.ceil(textWidth + paddingX * 2);
  const height = Math.ceil(lines.length * lineHeight + paddingY * 2);
  const placement = resolveOverlayPlacement(
    {
      left: anchorOnCanvas.x - width / 2,
      top: anchorOnCanvas.y - height - pointerHeight - 18 * uiScale,
      width,
      height,
    },
    reservedRects,
    margin,
    Math.max(8, Math.round(lineHeight * 0.8))
  );
  const left = placement.left;
  const top = placement.top;
  const pointerX = clamp(anchorOnCanvas.x, left + pointerWidth, left + width - pointerWidth);

  sceneContext.fillStyle = "rgba(9, 11, 18, 0.35)";
  sceneContext.fillRect(left + shadowOffset, top + shadowOffset, width, height);
  sceneContext.beginPath();
  sceneContext.moveTo(pointerX - pointerWidth / 2 + shadowOffset, top + height + shadowOffset);
  sceneContext.lineTo(pointerX + shadowOffset, top + height + pointerHeight + shadowOffset);
  sceneContext.lineTo(pointerX + pointerWidth / 2 + shadowOffset, top + height + shadowOffset);
  sceneContext.closePath();
  sceneContext.fill();

  sceneContext.fillStyle = "rgba(243, 246, 251, 0.96)";
  sceneContext.fillRect(left, top, width, height);
  sceneContext.strokeStyle = "#4a5673";
  sceneContext.lineWidth = borderWidth;
  sceneContext.strokeRect(left + borderWidth / 2, top + borderWidth / 2, width - borderWidth, height - borderWidth);

  sceneContext.beginPath();
  sceneContext.moveTo(pointerX - pointerWidth / 2, top + height);
  sceneContext.lineTo(pointerX, top + height + pointerHeight);
  sceneContext.lineTo(pointerX + pointerWidth / 2, top + height);
  sceneContext.closePath();
  sceneContext.fill();
  sceneContext.stroke();

  sceneContext.fillStyle = "#202638";
  lines.forEach((line, index) => {
    sceneContext.fillText(line, left + width / 2, top + paddingY + lineHeight / 2 + index * lineHeight);
  });
  sceneContext.restore();
}

function drawStatusDot(department: SceneDepartment, room: Rect, state: DepartmentVisualState): void {
  const color = state === "busy"
    ? "#f4cf7d"
    : state === "online"
      ? "#89d0ff"
      : state === "done"
        ? "#8be08c"
        : "#9197aa";
  surfaceContext.fillStyle = "#0a0c14";
  surfaceContext.fillRect(room.left + room.width - 9, room.top + room.height - 9, 7, 7);
  surfaceContext.fillStyle = color;
  surfaceContext.fillRect(room.left + room.width - 8, room.top + room.height - 8, 5, 5);
  if (state === "busy") {
    surfaceContext.fillStyle = withAlpha(color, 0.5);
    surfaceContext.fillRect(room.left + room.width - 10, room.top + room.height - 10, 9, 9);
  }
}

function drawTerminal(
  terminal: OfficeTerminal,
  position: Point,
  elapsed: number,
  index: number
): void {
  const done = terminal.kind === "scenario" && completedScenarios.has(terminal.scenario.id);
  const external = terminal.kind === "external";
  const hovered = hoveredTerminal?.id === terminal.id;
  const ledService = isLedServiceTerminal(terminal);
  const highlighted = hovered || isLedServiceWithinDiscoveryRange(terminal);
  const pulse = 0.55 + Math.sin(elapsed * 3 + terminal.pulseOffset) * 0.2;
  const accent = ledService
    ? (highlighted ? "#f4cf7d" : "#d9b96a")
    : external
      ? (hovered ? "#f4cf7d" : "#89d0ff")
    : done
      ? "#8be08c"
      : hovered
        ? "#89d0ff"
        : terminal.department.accent;
  const outline = highlighted ? "#f7fbff" : adjustHex(accent, 28);
  const badgeText = ledService ? "LED" : external ? (isEnglishUi() ? "WEB" : "网") : String(index + 1);

  drawInteractionBeacon(position, elapsed, accent, highlighted, {
    width: ledService ? 24 : 18,
    height: ledService ? 11 : 9,
    offsetY: 4,
    beamHeight: ledService ? 14 : 11,
    beamWidth: ledService ? 2 : 1,
    seed: terminal.pulseOffset,
  });

  const baseRect: Rect = ledService
    ? {
        left: position.x - 10,
        top: position.y - 5,
        width: 20,
        height: 10,
      }
    : {
        left: position.x - 6,
        top: position.y - 4,
        width: 12,
        height: 8,
      };
  drawPixelFrame(surfaceContext, baseRect, done ? "#35522f" : "#1d2437", outline, "#03050d", 1);
  surfaceContext.fillStyle = withAlpha(accent, pulse);
  surfaceContext.fillRect(baseRect.left + 2, baseRect.top + 2, baseRect.width - 4, 3);
  surfaceContext.fillStyle = "#f4f7ff";
  surfaceContext.font = ledService ? "bold 5px Monaco, 'Courier New', monospace" : "bold 6px Monaco, 'Courier New', monospace";
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillText(
    badgeText,
    baseRect.left + Math.round(baseRect.width / 2),
    ledService ? baseRect.top + 7 : baseRect.top + 6
  );
}

function drawInsightNode(node: InsightNode, elapsed: number): void {
  const position = worldToScreen(node.position.x, node.position.y);
  const collected = collectedInsights.has(node.id);
  const glow = collected ? "#8be08c" : "#ffde7a";
  const highlighted = hoveredInsight?.id === node.id;
  const pulse = Math.sin(elapsed * 4 + node.pulseOffset) > 0 ? 1 : 0;

  if (!collected || highlighted) {
    drawInteractionBeacon(position, elapsed, glow, highlighted, {
      width: 18,
      height: 10,
      offsetY: 3,
      beamHeight: collected ? 9 : 13,
      seed: node.pulseOffset,
    });
  }

  surfaceContext.fillStyle = collected ? "#243a2b" : "#6f5a2e";
  surfaceContext.fillRect(position.x - 4, position.y - 4, 8, 8);
  surfaceContext.fillStyle = glow;
  surfaceContext.fillRect(position.x - 2, position.y - 2, 4, 4);
  if (pulse || collected) {
    surfaceContext.fillStyle = withAlpha(glow, 0.55);
    surfaceContext.fillRect(position.x - 1, position.y - 6, 2, 12);
    surfaceContext.fillRect(position.x - 6, position.y - 1, 12, 2);
  }
}

function drawNpcSprites(departmentNpcs: NpcActor[], elapsed: number): void {
  for (const npc of [...departmentNpcs].sort((left, right) => left.y - right.y)) {
    const anchor = worldToScreen(npc.x, npc.y);
    const bob = npc.action === "walking" ? Math.sin(npc.step) * 1.2 : Math.sin(elapsed * 2 + npc.x) * 0.35;
    const speaking = npc.id === meetingState.currentSpeakerId;
    const bubbling = npc.bubbleTimer > 0;
    const targetFocused = promptTargetDepartmentId === npc.department.id &&
      distanceSquared(player, npc) <= NPC_LABEL_PRIORITY_DISTANCE * NPC_LABEL_PRIORITY_DISTANCE;
    if (speaking || bubbling || targetFocused) {
      drawNpcFocusHalo(
        anchor,
        elapsed,
        speaking ? "#f4cf7d" : bubbling ? "#89d0ff" : npc.department.accent,
        speaking || bubbling
      );
    }
    drawNpcSprite(anchor, npc.facing, npc.palette, bob);
  }
}

function drawNpcBubbleOverlays(transform: SurfaceDrawTransform, reservedRects: Rect[]): void {
  const visibleCandidates = npcs
    .filter((npc) => isNpcBubbleVisibleOnScreen(npc))
    .sort((left, right) => right.bubbleTimer - left.bubbleTimer);
  const renderedTexts = new Set<string>();
  let renderedCount = 0;

  for (const npc of visibleCandidates) {
    if (renderedCount >= MAX_VISIBLE_NPC_BUBBLES || renderedTexts.has(npc.bubbleText)) {
      continue;
    }

    const overlayAlpha = getNpcOverlayAlpha(npc);
    if (overlayAlpha <= 0) {
      continue;
    }

    const anchor = worldToScreen(npc.x, npc.y);
    drawNpcSpeechBubble({ x: anchor.x, y: anchor.y - 16 }, npc.bubbleText, transform, overlayAlpha, reservedRects);
    renderedTexts.add(npc.bubbleText);
    renderedCount += 1;
  }
}

function drawHdSceneTag(
  anchor: Point,
  transform: SurfaceDrawTransform,
  title: string,
  accent: string,
  options: {
    subtitle?: string;
    offsetY?: number;
    compact?: boolean;
    alpha?: number;
    reservedRects?: Rect[];
  } = {}
): void {
  const localizedTitle = translateRuntimeCopy(title);
  const uiScale = Math.min(window.devicePixelRatio || 1, 2);
  const titleSize = (options.compact ? 11 : 12) * uiScale;
  const subtitleSize = 10 * uiScale;
  const lineHeight = (options.compact ? 14 : 16) * uiScale;
  const paddingX = (options.compact ? 10 : 12) * uiScale;
  const paddingY = (options.compact ? 6 : 8) * uiScale;
  const borderWidth = Math.max(1.5, Math.round(uiScale * 1.5));
  const shadowOffset = Math.max(3, Math.round(uiScale * 3));
  const margin = 8 * uiScale;
  const anchorOnCanvas = surfacePointToCanvas(anchor, transform);
  const subtitle = options.subtitle?.trim();
  const localizedSubtitle = subtitle ? translateRuntimeCopy(subtitle) : "";

  sceneContext.save();
  sceneContext.globalAlpha = options.alpha ?? 1;
  sceneContext.textAlign = "center";
  sceneContext.textBaseline = "middle";
  sceneContext.font = `600 ${titleSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  const titleWidth = sceneContext.measureText(localizedTitle).width;
  let subtitleWidth = 0;
  if (localizedSubtitle) {
    sceneContext.font = `500 ${subtitleSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
    subtitleWidth = sceneContext.measureText(localizedSubtitle).width;
  }

  const width = Math.ceil(Math.max(titleWidth, subtitleWidth) + paddingX * 2);
  const lineCount = localizedSubtitle ? 2 : 1;
  const height = Math.ceil(lineCount * lineHeight + paddingY * 2 - (localizedSubtitle ? 2 * uiScale : 0));
  const placement = options.reservedRects
    ? resolveOverlayPlacement(
        {
          left: anchorOnCanvas.x - width / 2,
          top: anchorOnCanvas.y + (options.offsetY ?? 0) * uiScale - height / 2,
          width,
          height,
        },
        options.reservedRects,
        margin,
        Math.max(8, Math.round(lineHeight * 0.8))
      )
    : {
        left: clamp(anchorOnCanvas.x - width / 2, margin, canvas.width - width - margin),
        top: Math.max(margin, anchorOnCanvas.y + (options.offsetY ?? 0) * uiScale - height / 2),
        width,
        height,
      };
  const left = placement.left;
  const top = placement.top;

  sceneContext.fillStyle = "rgba(9, 11, 18, 0.24)";
  sceneContext.fillRect(left + shadowOffset, top + shadowOffset, width, height);
  sceneContext.fillStyle = "rgba(245, 247, 252, 0.96)";
  sceneContext.fillRect(left, top, width, height);
  sceneContext.strokeStyle = withAlpha(adjustHex(accent, -28), 0.78);
  sceneContext.lineWidth = borderWidth;
  sceneContext.strokeRect(left + borderWidth / 2, top + borderWidth / 2, width - borderWidth, height - borderWidth);

  sceneContext.font = `600 ${titleSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  sceneContext.fillStyle = adjustHex(accent, -36);
  sceneContext.fillText(localizedTitle, left + width / 2, top + paddingY + lineHeight / 2);

  if (localizedSubtitle) {
    sceneContext.font = `500 ${subtitleSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
    sceneContext.fillStyle = "#33405c";
    sceneContext.fillText(localizedSubtitle, left + width / 2, top + paddingY + lineHeight * 1.45);
  }
  sceneContext.restore();
}

function drawOffscreenInteractionIndicators(transform: SurfaceDrawTransform, reservedRects: Rect[]): void {
  if (!modal.classList.contains("hidden")) {
    return;
  }

  const indicators = collectOffscreenInteractionIndicators(transform);
  if (indicators.length === 0) {
    return;
  }

  const uiScale = Math.min(window.devicePixelRatio || 1, 2);
  const fontSize = 11 * uiScale;
  const lineHeight = 14 * uiScale;
  const paddingX = 10 * uiScale;
  const paddingY = 6 * uiScale;
  const borderWidth = Math.max(1.5, Math.round(uiScale * 1.5));
  const pointerSize = 8 * uiScale;
  const shadowOffset = Math.max(3, Math.round(uiScale * 3));
  const horizontalMargin = 12 * uiScale;
  const topMargin = 40 * uiScale;
  const bottomMargin = 18 * uiScale;
  const leftLimit = horizontalMargin + 2;
  const rightLimit = canvas.width - horizontalMargin - 2;
  const topLimit = topMargin + 2;
  const bottomLimit = canvas.height - bottomMargin - 2;

  sceneContext.save();
  sceneContext.textBaseline = "middle";
  sceneContext.font = `600 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;

  for (const indicator of indicators) {
    const anchorOnCanvas = surfacePointToCanvas(indicator.anchor, transform);
    const title = shortenIndicatorTitle(indicator.title, isCompactViewport() ? 5 : 7);
    const textWidth = sceneContext.measureText(title).width;
    const distanceWidth = sceneContext.measureText(indicator.distanceLabel).width;
    const pillWidth = Math.ceil(distanceWidth + 10 * uiScale);
    const width = Math.ceil(textWidth + pillWidth + paddingX * 2 + 18 * uiScale);
    const height = Math.ceil(lineHeight + paddingY * 2);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = anchorOnCanvas.x - centerX;
    const dy = anchorOnCanvas.y - centerY;
    const scaleX = dx > 0
      ? (rightLimit - centerX) / dx
      : dx < 0
        ? (leftLimit - centerX) / dx
        : Number.POSITIVE_INFINITY;
    const scaleY = dy > 0
      ? (bottomLimit - centerY) / dy
      : dy < 0
        ? (topLimit - centerY) / dy
        : Number.POSITIVE_INFINITY;
    const side: OffscreenIndicatorSide = scaleX <= scaleY
      ? (dx >= 0 ? "right" : "left")
      : (dy >= 0 ? "bottom" : "top");
    const edgeX = side === "left"
      ? leftLimit
      : side === "right"
        ? rightLimit
        : clamp(centerX + dx * scaleY, leftLimit, rightLimit);
    const edgeY = side === "top"
      ? topLimit
      : side === "bottom"
        ? bottomLimit
        : clamp(centerY + dy * scaleX, topLimit, bottomLimit);
    const preferredRect = side === "left"
      ? {
          left: horizontalMargin,
          top: edgeY - height / 2,
          width,
          height,
        }
      : side === "right"
        ? {
            left: canvas.width - horizontalMargin - width,
            top: edgeY - height / 2,
            width,
            height,
          }
        : side === "top"
          ? {
              left: edgeX - width / 2,
              top: topMargin,
              width,
              height,
            }
          : {
              left: edgeX - width / 2,
              top: canvas.height - bottomMargin - height,
              width,
              height,
            };
    const placement = resolveOverlayPlacement(
      preferredRect,
      reservedRects,
      8 * uiScale,
      Math.max(10, Math.round(height * 0.8))
    );
    const left = placement.left;
    const top = placement.top;
    const pointerBaseX = clamp(edgeX, left + pointerSize, left + width - pointerSize);
    const pointerBaseY = clamp(edgeY, top + pointerSize, top + height - pointerSize);

    sceneContext.fillStyle = "rgba(9, 11, 18, 0.28)";
    sceneContext.fillRect(left + shadowOffset, top + shadowOffset, width, height);

    sceneContext.beginPath();
    switch (side) {
      case "left":
        sceneContext.moveTo(left + shadowOffset, pointerBaseY - pointerSize / 2 + shadowOffset);
        sceneContext.lineTo(left - pointerSize + shadowOffset, pointerBaseY + shadowOffset);
        sceneContext.lineTo(left + shadowOffset, pointerBaseY + pointerSize / 2 + shadowOffset);
        break;
      case "right":
        sceneContext.moveTo(left + width + shadowOffset, pointerBaseY - pointerSize / 2 + shadowOffset);
        sceneContext.lineTo(left + width + pointerSize + shadowOffset, pointerBaseY + shadowOffset);
        sceneContext.lineTo(left + width + shadowOffset, pointerBaseY + pointerSize / 2 + shadowOffset);
        break;
      case "top":
        sceneContext.moveTo(pointerBaseX - pointerSize / 2 + shadowOffset, top + shadowOffset);
        sceneContext.lineTo(pointerBaseX + shadowOffset, top - pointerSize + shadowOffset);
        sceneContext.lineTo(pointerBaseX + pointerSize / 2 + shadowOffset, top + shadowOffset);
        break;
      case "bottom":
        sceneContext.moveTo(pointerBaseX - pointerSize / 2 + shadowOffset, top + height + shadowOffset);
        sceneContext.lineTo(pointerBaseX + shadowOffset, top + height + pointerSize + shadowOffset);
        sceneContext.lineTo(pointerBaseX + pointerSize / 2 + shadowOffset, top + height + shadowOffset);
        break;
    }
    sceneContext.closePath();
    sceneContext.fill();

    sceneContext.fillStyle = indicator.highlighted
      ? withAlpha(indicator.accent, 0.22)
      : "rgba(245, 247, 252, 0.96)";
    sceneContext.fillRect(left, top, width, height);
    sceneContext.strokeStyle = withAlpha(adjustHex(indicator.accent, -28), indicator.highlighted ? 0.96 : 0.76);
    sceneContext.lineWidth = borderWidth;
    sceneContext.strokeRect(left + borderWidth / 2, top + borderWidth / 2, width - borderWidth, height - borderWidth);

    sceneContext.beginPath();
    switch (side) {
      case "left":
        sceneContext.moveTo(left, pointerBaseY - pointerSize / 2);
        sceneContext.lineTo(left - pointerSize, pointerBaseY);
        sceneContext.lineTo(left, pointerBaseY + pointerSize / 2);
        break;
      case "right":
        sceneContext.moveTo(left + width, pointerBaseY - pointerSize / 2);
        sceneContext.lineTo(left + width + pointerSize, pointerBaseY);
        sceneContext.lineTo(left + width, pointerBaseY + pointerSize / 2);
        break;
      case "top":
        sceneContext.moveTo(pointerBaseX - pointerSize / 2, top);
        sceneContext.lineTo(pointerBaseX, top - pointerSize);
        sceneContext.lineTo(pointerBaseX + pointerSize / 2, top);
        break;
      case "bottom":
        sceneContext.moveTo(pointerBaseX - pointerSize / 2, top + height);
        sceneContext.lineTo(pointerBaseX, top + height + pointerSize);
        sceneContext.lineTo(pointerBaseX + pointerSize / 2, top + height);
        break;
    }
    sceneContext.closePath();
    sceneContext.fill();
    sceneContext.stroke();

    sceneContext.fillStyle = withAlpha(indicator.accent, indicator.highlighted ? 0.94 : 0.78);
    if (side === "left") {
      sceneContext.fillRect(left, top, 4 * uiScale, height);
    } else if (side === "right") {
      sceneContext.fillRect(left + width - 4 * uiScale, top, 4 * uiScale, height);
    } else if (side === "top") {
      sceneContext.fillRect(left, top, width, 4 * uiScale);
    } else {
      sceneContext.fillRect(left, top + height - 4 * uiScale, width, 4 * uiScale);
    }

    const titleLeft = left + paddingX;
    const textCenterY = top + height / 2;
    const pillLeft = left + width - paddingX - pillWidth;
    const pillTop = top + Math.max(3, Math.round(uiScale * 3));
    const pillHeight = height - Math.max(6, Math.round(uiScale * 6));

    sceneContext.textAlign = "left";
    sceneContext.fillStyle = indicator.highlighted ? adjustHex(indicator.accent, -44) : "#223047";
    sceneContext.fillText(title, titleLeft, textCenterY);

    sceneContext.fillStyle = indicator.highlighted
      ? withAlpha(indicator.accent, 0.22)
      : "rgba(10, 16, 30, 0.08)";
    sceneContext.fillRect(pillLeft, pillTop, pillWidth, pillHeight);
    sceneContext.strokeStyle = withAlpha(indicator.accent, indicator.highlighted ? 0.8 : 0.48);
    sceneContext.lineWidth = Math.max(1, Math.round(uiScale));
    sceneContext.strokeRect(pillLeft + 0.5, pillTop + 0.5, pillWidth - 1, pillHeight - 1);
    sceneContext.textAlign = "center";
    sceneContext.fillStyle = indicator.highlighted ? "#f7fbff" : adjustHex(indicator.accent, -28);
    sceneContext.fillText(indicator.distanceLabel, pillLeft + pillWidth / 2, textCenterY);
  }

  sceneContext.restore();
}

function drawSceneLabelOverlays(transform: SurfaceDrawTransform, reservedRects: Rect[]): void {
  const showTaskPrompts = shouldShowTaskPrompts();
  const promptTarget = getUiNavigationTarget();
  const promptTargetDepartment = getUiPromptTargetDepartment();
  const promptTargetSharedZone = getUiPromptTargetSharedZone();
  const followUpTarget = getUiNavigationFollowUpTarget();
  const strategicDepartment = getUiStrategicDepartmentCandidate();
  const meetingSummary = getMeetingDiscussionSummary();
  const followUpDepartment = followUpTarget
    ? followUpTarget.type === "guide" && followUpTarget.value.target.type === "department"
      ? followUpTarget.value.target.department
      : followUpTarget.type === "terminal" || followUpTarget.type === "insight"
        ? followUpTarget.value.department
        : null
    : null;
  const followUpSharedZone = followUpTarget?.type === "guide" && followUpTarget.value.target.type === "shared-zone"
    ? followUpTarget.value.target.zone
    : null;
  const introRug = rectToScreen(introPromoRugRect);
  if (isScreenRectVisible(introRug)) {
    drawHdSceneTag(
      worldToScreen(initialSpawn.x, introPromoRugRect.top + introPromoRugRect.height / 2),
      transform,
      "Melbourne AI Development Group",
      "#b4f263",
      {
        subtitle: pickUiText("4月26日活动", "April 26 Event"),
        offsetY: -34,
        reservedRects,
      }
    );
  }

  sharedZones.forEach((zone) => {
    const room = rectToScreen(zone.roomRect);
    const walkway = rectToScreen(zone.walkwayRect);
    const focused = promptTargetSharedZone?.id === zone.id;
    const active = zone.id === activeSharedZoneId;
    const hotspot = getTopSharedZone()?.id === zone.id;
    const occupancy = getSharedZoneOccupancy(zone);
    if (!isScreenRectVisible(room) && !isScreenRectVisible(walkway)) {
      return;
    }
    const tagAnchor = {
      x: walkway.left + walkway.width / 2,
      y: zone.approachSide === "down" ? walkway.top + 4 : walkway.top + walkway.height - 4,
    };

    drawHdSceneTag(
      tagAnchor,
      transform,
      getSharedZoneUiLabel(zone),
      focused ? adjustHex(zone.accent, 12) : zone.accent,
      {
        subtitle: showTaskPrompts
          ? (focused
          ? pickUiText(`目标 · ${occupancy}人流动`, `Target · ${occupancy} moving`)
          : followUpSharedZone?.id === zone.id
            ? pickUiText(
                `下一站 · ${occupancy > 0 ? `${occupancy}人流动` : "公共区"}`,
                `Next · ${occupancy > 0 ? `${occupancy} moving` : "Shared Zone"}`
              )
          : active
            ? pickUiText(
                `${zone.kind === "reception" ? "接待区" : "餐厅"} · 当前位置`,
                `${getSharedZoneUiLabel(zone)} · Current Zone`
              )
          : hotspot && occupancy > 0
              ? pickUiText(`热点 · ${occupancy}人流动`, `Hot · ${occupancy} moving`)
            : occupancy > 0
              ? pickUiText(`${zone.kind === "reception" ? "接待区" : "餐厅"} · ${occupancy}人`, `${getSharedZoneUiLabel(zone)} · ${occupancy}`)
              : getSharedZoneUiLabel(zone))
          : undefined,
        offsetY: zone.approachSide === "down" ? -18 : -6,
        compact: shouldUseCompactOverlayTag(tagAnchor, transform),
        reservedRects,
      }
    );
  });

  departments.forEach((department) => {
    const room = rectToScreen(department.roomRect);
    const walkway = rectToScreen(department.walkwayRect);
    const focused = promptTargetDepartment?.id === department.id;
    const active = department.id === activeDepartmentId;
    const hotspot = getTopActiveDepartment()?.id === department.id;
    const state = getDepartmentVisualState(department);
    const occupancy = getDepartmentOccupancy(department);
    const fullyCompleted = isDepartmentFullyCompleted(department);
    const impactScore = getDepartmentImpactScore(department);
    if (!isScreenRectVisible(room) && !isScreenRectVisible(walkway)) {
      return;
    }
    const tagAnchor = {
      x: walkway.left + walkway.width / 2,
      y: department.approachSide === "down"
        ? walkway.top + 4
        : walkway.top + walkway.height - 4,
    };

    drawHdSceneTag(
      tagAnchor,
      transform,
      getDepartmentUiLabel(department),
      focused ? adjustHex(department.accent, 12) : department.accent,
      {
        subtitle: showTaskPrompts
          ? (focused
          ? pickUiText(`目标 · ${occupancy}/${department.npcRoles.length}`, `Target · ${occupancy}/${department.npcRoles.length}`)
          : strategicDepartment?.id === department.id
            ? pickUiText(`冲刺 · ${getDepartmentPendingWorkSummary(department)}`, `Sprint · ${getDepartmentPendingWorkSummary(department)}`)
          : fullyCompleted
            ? pickUiText(`闭环 · +${impactScore}`, `Closed Loop · +${impactScore}`)
          : followUpDepartment?.id === department.id
            ? pickUiText(`下一站 · ${occupancy}/${department.npcRoles.length}`, `Next · ${occupancy}/${department.npcRoles.length}`)
          : active
            ? pickUiText(`${getDepartmentStateLabel(state)} · 当前位置`, `${getDepartmentStateLabel(state)} · Current Zone`)
            : hotspot
              ? pickUiText(`热点 · ${occupancy}/${department.npcRoles.length}`, `Hot · ${occupancy}/${department.npcRoles.length}`)
            : `${getDepartmentStateLabel(state)} · ${occupancy}/${department.npcRoles.length}`)
          : undefined,
        offsetY: department.approachSide === "down" ? -18 : -6,
        compact: shouldUseCompactOverlayTag(tagAnchor, transform),
        reservedRects,
      }
    );

  });

  const podiumAnchor = worldToScreen(
    centralMeetingPodium.interactionPoint.x,
    centralMeetingPodium.interactionPoint.y
  );
  if (
    isScreenRectVisible({
      left: podiumAnchor.x - 36,
      top: podiumAnchor.y - 42,
      width: 72,
      height: 44,
    })
  ) {
    const podiumAccent = meetingState.active
      ? (hoveredPodium ? "#ffe3a0" : "#f4cf7d")
      : (hoveredPodium ? "#b7e6ff" : "#89d0ff");
    drawHdSceneTag(
      podiumAnchor,
      transform,
      pickUiText("演讲台", "Podium"),
      promptTarget?.type === "podium" ? adjustHex(podiumAccent, 10) : podiumAccent,
      {
        subtitle: showTaskPrompts
          ? (promptTarget?.type === "podium"
          ? (meetingState.active
            ? (meetingStageCueState.pulse > 0.08
              ? pickUiText(`当前目标 · ${meetingStageCueState.title}`, `Target · ${meetingStageCueState.title}`)
              : pickUiText(`当前目标 · 第${meetingSummary.round}轮 ${meetingSummary.stageLabel}`, `Target · R${meetingSummary.round} ${meetingSummary.stageLabel}`))
            : pickUiText("当前目标", "Current Target"))
          : meetingState.active
            ? `${meetingStageCueState.pulse > 0.08 ? meetingStageCueState.title : meetingSummary.pill} · ${isTapInteractionMode() ? pickUiText("点击解散会议", "Tap to dismiss meeting") : pickUiText("按 E 解散会议", "Press E to dismiss meeting")}`
            : (isTapInteractionMode() ? pickUiText("点击召集入座", "Tap to gather seats") : pickUiText("按 E 召集入座", "Press E to gather seats")))
          : undefined,
        offsetY: -20,
        compact: true,
        reservedRects,
      }
    );
  }

  npcs
    .filter((npc) => {
      const anchor = worldToScreen(npc.x, npc.y);
      return (
        isScreenRectVisible({
          left: anchor.x - 24,
          top: anchor.y - 34,
          width: 48,
          height: 24,
        }) &&
        getNpcOverlayAlpha(npc) > 0
      );
    })
    .sort((left, right) => {
      const priorityDelta = getNpcLabelPriority(right) - getNpcLabelPriority(left);
      if (Math.abs(priorityDelta) > 0.001) {
        return priorityDelta;
      }
      return distanceSquared(player, left) - distanceSquared(player, right);
    })
    .slice(0, MAX_VISIBLE_NPC_NAME_TAGS)
    .forEach((npc) => {
    const anchor = worldToScreen(npc.x, npc.y);
    const speakerActive = npc.id === meetingState.currentSpeakerId;
    const overlayAlpha = getNpcOverlayAlpha(npc);
    const subtitle = speakerActive
      ? pickUiText(`${npc.role} · 发言中`, `${npc.role} · Speaking`)
      : shouldShowNpcRoleLabel(npc)
        ? npc.role
        : "";
    drawHdSceneTag(anchor, transform, npc.name, speakerActive ? "#f4cf7d" : npc.stationary ? "#6ca57a" : "#6f89c8", {
      subtitle,
      offsetY: -24,
      compact: true,
      alpha: overlayAlpha,
      reservedRects,
    });
  });
}

function drawHdCorridorHeadings(transform: SurfaceDrawTransform): void {
  const uiScale = Math.min(window.devicePixelRatio || 1, 2);
  const wall = surfaceRectToCanvas(
    rectToScreen({ left: officeRect.left, top: officeRect.top, width: officeRect.width, height: WALL_HEIGHT }),
    transform
  );
  const ticker = surfaceRectToCanvas(rectToScreen(corridorTickerRect), transform);
  const tickerStatus = getCorridorTickerStatus();

  sceneContext.save();
  sceneContext.textAlign = "center";
  sceneContext.textBaseline = "middle";
  sceneContext.shadowColor = "rgba(8, 10, 18, 0.35)";
  sceneContext.shadowOffsetY = Math.max(2, Math.round(uiScale * 2));
  sceneContext.shadowBlur = 0;

  sceneContext.font = `700 ${13 * uiScale}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  sceneContext.fillStyle = "#d9ecff";
  sceneContext.fillText(pickUiText("OpenClaw Agent Office", "OpenClaw Agent Office"), wall.left + wall.width / 2, wall.top + wall.height / 2);

  sceneContext.font = `600 ${10 * uiScale}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  sceneContext.fillStyle = tickerStatus.accent;
  sceneContext.fillText(
    tickerStatus.headline,
    ticker.left + ticker.width / 2,
    ticker.top + ticker.height / 2 - 4 * uiScale
  );
  sceneContext.font = `500 ${7 * uiScale}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  sceneContext.fillStyle = "#d9ecff";
  sceneContext.fillText(
    trimSpeechSegment(translateRuntimeCopy(tickerStatus.detail), 22),
    ticker.left + ticker.width / 2,
    ticker.top + ticker.height / 2 + 4 * uiScale
  );
  sceneContext.restore();
}

function drawHdCommandBoard(transform: SurfaceDrawTransform): void {
  const uiScale = Math.min(window.devicePixelRatio || 1, 2);
  const showTaskPrompts = shouldShowTaskPrompts();
  const strategicDepartment = getUiStrategicDepartmentCandidate();
  const latestOutcome = getLatestDepartmentOutcomeRecord();
  const promptTarget = getUiNavigationTarget();
  const followUpTarget = getUiNavigationFollowUpTarget();
  const topDepartment = getTopActiveDepartment();
  const trafficSummary = getOfficeTrafficSummary();
  const focusSummary = getNavigationFocusSummary(promptTarget);
  const cards = [
    {
      label: showTaskPrompts
        ? (promptTarget ? pickUiText("当前目标", "Current Target") : pickUiText("当前节奏", "Current Flow"))
        : pickUiText("当前状态", "Current State"),
      title: showTaskPrompts && promptTarget ? getInteractionTargetIndicatorTitle(promptTarget) : trafficSummary.pill,
      detail: showTaskPrompts && promptTarget
        ? `${getInteractionTargetStatusLabel(promptTarget)} · ${Math.max(1, Math.round(getInteractionTargetDistance(promptTarget)))}m${followUpTarget ? ` → ${getNavigationTargetShortLabel(followUpTarget, 6)}` : ""}`
        : focusSummary.label,
      accent: showTaskPrompts && promptTarget ? getInteractionTargetIndicatorAccent(promptTarget) : trafficSummary.accent,
      meter: showTaskPrompts && promptTarget ? clamp(1 - getInteractionTargetDistance(promptTarget) / 180, 0.12, 1) : 0.42,
    },
    {
      label: showTaskPrompts ? pickUiText("下一闭环", "Next Closed Loop") : pickUiText("热点部门", "Hot Department"),
      title: showTaskPrompts
        ? (strategicDepartment ? strategicDepartment.shortName : (topDepartment?.shortName ?? pickUiText("待分配", "Unassigned")))
        : (topDepartment?.shortName ?? pickUiText("自由漫游", "Free Roam")),
      detail: showTaskPrompts
        ? (strategicDepartment
        ? getDepartmentPendingWorkSummary(strategicDepartment)
        : topDepartment
          ? getDepartmentOccupancyLabel(topDepartment)
          : pickUiText("等待新目标", "Waiting for a new target"))
        : (topDepartment
          ? `${getDepartmentStateLabel(getDepartmentVisualState(topDepartment))} · ${getDepartmentOccupancyLabel(topDepartment)}`
          : pickUiText("点击地图或列表可自由切换", "Use the map or list to jump freely")),
      accent: strategicDepartment?.accent ?? topDepartment?.accent ?? "#7d8db3",
      meter: showTaskPrompts && strategicDepartment
        ? getDepartmentBacklogRatio(strategicDepartment)
        : topDepartment
          ? Math.max(0.18, getDepartmentOccupancyRatio(topDepartment))
          : 0.26,
    },
    {
      label: pickUiText("最新成果", "Latest Result"),
      title: latestOutcome ? latestOutcome.title : pickUiText("暂无", "None yet"),
      detail: latestOutcome
        ? `${latestOutcome.highlights[0] ?? pickUiText("成果已回流", "Result synced back")} · +${latestOutcome.impactScore}`
        : pickUiText("完成部门闭环后会出现在这里", "This appears after a department closes the loop"),
      accent: latestOutcome?.accent ?? "#8be08c",
      meter: latestOutcome ? 0.9 : 0.16,
    },
  ];
  const base = surfaceRectToCanvas(
    rectToScreen({
      left: corridorTickerRect.left,
      top: corridorTickerRect.top + corridorTickerRect.height + 4,
      width: corridorTickerRect.width,
      height: 18,
    }),
    transform
  );
  const gap = 6 * uiScale;
  const cardWidth = (base.width - gap * 2) / 3;
  const cardHeight = 22 * uiScale;

  sceneContext.save();
  sceneContext.textBaseline = "middle";
  cards.forEach((card, index) => {
    const left = base.left + index * (cardWidth + gap);
    const top = base.top;
    sceneContext.fillStyle = "rgba(9, 11, 18, 0.84)";
    sceneContext.fillRect(left, top, cardWidth, cardHeight);
    sceneContext.strokeStyle = withAlpha(card.accent, 0.72);
    sceneContext.lineWidth = 1;
    sceneContext.strokeRect(left + 0.5, top + 0.5, cardWidth - 1, cardHeight - 1);
    sceneContext.fillStyle = withAlpha(card.accent, 0.16);
    sceneContext.fillRect(left + 2, top + 2, cardWidth - 4, 4 * uiScale);
    sceneContext.textAlign = "left";
    sceneContext.fillStyle = "#d9ecff";
    sceneContext.font = `700 ${6 * uiScale}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
    sceneContext.fillText(translateRuntimeCopy(card.label), left + 5 * uiScale, top + 4.5 * uiScale);
    sceneContext.fillStyle = "#f7fbff";
    sceneContext.font = `600 ${8 * uiScale}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
    sceneContext.fillText(trimSpeechSegment(translateRuntimeCopy(card.title), 10), left + 5 * uiScale, top + 11 * uiScale);
    sceneContext.fillStyle = withAlpha("#d9ecff", 0.82);
    sceneContext.font = `500 ${6 * uiScale}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
    sceneContext.fillText(trimSpeechSegment(translateRuntimeCopy(card.detail), 18), left + 5 * uiScale, top + 17.2 * uiScale);
    sceneContext.fillStyle = "rgba(255,255,255,0.08)";
    sceneContext.fillRect(left + 4 * uiScale, top + cardHeight - 5 * uiScale, cardWidth - 8 * uiScale, 2 * uiScale);
    sceneContext.fillStyle = withAlpha(card.accent, 0.9);
    sceneContext.fillRect(
      left + 4 * uiScale,
      top + cardHeight - 5 * uiScale,
      Math.max(8 * uiScale, (cardWidth - 8 * uiScale) * card.meter),
      2 * uiScale
    );
  });
  sceneContext.restore();
}

function drawAreaGuideBubbleOverlays(transform: SurfaceDrawTransform, reservedRects: Rect[]): void {
  if (!hoveredGuide || !modal.classList.contains("hidden")) {
    return;
  }

  const anchor = worldToScreen(hoveredGuide.position.x, hoveredGuide.position.y);
  if (
    !isScreenRectVisible({
      left: anchor.x - 48,
      top: anchor.y - 64,
      width: 96,
      height: 72,
    })
  ) {
    return;
  }

  drawFloatingInfoBubble(
    { x: anchor.x, y: anchor.y - 12 },
    getAreaGuideBubbleLines(hoveredGuide),
    transform,
    hoveredGuide.accent,
    reservedRects
  );
}

function getLedServiceBubbleTarget(): ExternalTerminal | null {
  const ledServiceTerminal = terminals.find((terminal) => isLedServiceWithinDiscoveryRange(terminal));
  return ledServiceTerminal && ledServiceTerminal.kind === "external" ? ledServiceTerminal : null;
}

function getLedServiceBubbleLines(terminal: ExternalTerminal): string[] {
  return [
    terminal.label,
    pickUiText("市场部重点入口", "Marketing Priority Gate"),
    isTapInteractionMode() ? pickUiText("点击打开网站", "Tap to open site") : pickUiText("按 E 打开网站", "Press E to open site"),
  ];
}

function drawTerminalBubbleOverlays(transform: SurfaceDrawTransform, reservedRects: Rect[]): void {
  if (!modal.classList.contains("hidden")) {
    return;
  }

  const terminal = getLedServiceBubbleTarget();
  if (!terminal) {
    return;
  }

  const anchor = worldToScreen(terminal.position.x, terminal.position.y);
  if (
    !isScreenRectVisible({
      left: anchor.x - 60,
      top: anchor.y - 70,
      width: 120,
      height: 84,
    })
  ) {
    return;
  }

  drawFloatingInfoBubble(
    { x: anchor.x, y: anchor.y - 14 },
    getLedServiceBubbleLines(terminal),
    transform,
    "#f4cf7d",
    reservedRects
  );
}

function drawDepartmentDecor(
  department: SceneDepartment,
  room: Rect,
  elapsed: number,
  state: DepartmentVisualState,
  focused = false
): void {
  const accent = adjustHex(department.accent, 12);
  const stateAccent = getDepartmentStateAccent(state);
  const floorRect: Rect = {
    left: room.left + 6,
    top: room.top + 6,
    width: room.width - 12,
    height: room.height - 12,
  };
  const step = Math.max(8, Math.round(camera.zoom * 7));
  const zone = (x: number, y: number, width: number, height: number): Rect => ({
    left: Math.round(room.left + room.width * x),
    top: Math.round(room.top + room.height * y),
    width: Math.max(5, Math.round(room.width * width)),
    height: Math.max(4, Math.round(room.height * height)),
  });
  const block = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    border: string,
    shadow = "#090b12"
  ): Rect => {
    const rect = zone(x, y, width, height);
    drawContactShadow(rect, 0.14, 3);
    drawPixelFrame(surfaceContext, rect, fill, border, shadow, 1);
    return rect;
  };

  const threshold = zone(0.16, department.approachSide === "down" ? 0.84 : 0.08, 0.68, 0.04);
  const shellAccent = state === "idle" ? department.accent : stateAccent;
  const drawFloorBase = (primary: string, secondary: string): void => {
    drawPattern(surfaceContext, floorRect, primary, secondary, step);
    drawAmbientRoomShell(room, floorRect, shellAccent, elapsed, department.decorSeed);
    drawFloorWear(floorRect, shellAccent, department.decorSeed);
  };
  surfaceContext.fillStyle = "#263047";
  surfaceContext.fillRect(threshold.left, threshold.top, threshold.width, threshold.height);
  surfaceContext.fillStyle = withAlpha(stateAccent, state === "idle" ? 0.18 : 0.3);
  surfaceContext.fillRect(threshold.left + 4, threshold.top + 1, threshold.width - 8, 1);
  if (focused) {
    surfaceContext.fillStyle = withAlpha("#f7fbff", 0.44);
    surfaceContext.fillRect(threshold.left + 6, threshold.top, threshold.width - 12, 1);
    surfaceContext.fillStyle = withAlpha(department.accent, 0.6);
    surfaceContext.fillRect(threshold.left + 8, threshold.top + 2, threshold.width - 16, 1);
  }

  switch (department.id) {
    case "marketing": {
      drawFloorBase("#705646", "#624a3e");
      const board = block(0.08, 0.10, 0.42, 0.12, "#8a6547", "#5f4634");
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(board.left + 6, board.top + 4, board.width - 12, 3);
      surfaceContext.fillStyle = accent;
      surfaceContext.fillRect(board.left + 8, board.top + 10, 10, 4);
      surfaceContext.fillRect(board.left + 22, board.top + 7, 14, 7);
      surfaceContext.fillStyle = "#dce8fb";
      surfaceContext.fillRect(board.left + board.width - 16, board.top + 6, 8, 8);

      const storyboard = block(0.10, 0.30, 0.18, 0.10, "#8a6547", "#5f4634");
      surfaceContext.fillStyle = "#ffe2a6";
      surfaceContext.fillRect(storyboard.left + 4, storyboard.top + 4, storyboard.width - 8, 2);
      surfaceContext.fillStyle = "#dce8fb";
      surfaceContext.fillRect(storyboard.left + 6, storyboard.top + 9, storyboard.width - 12, 2);

      const mediaWall = block(0.68, 0.10, 0.16, 0.20, "#dce2ed", "#69748b");
      surfaceContext.fillStyle = pulseColor(elapsed + department.decorSeed, stateAccent, "#9ec9ff");
      surfaceContext.fillRect(mediaWall.left + 4, mediaWall.top + 4, mediaWall.width - 8, mediaWall.height - 8);

      block(0.10, 0.58, 0.28, 0.18, "#425273", "#24324b");
      const campaignDesk = block(0.46, 0.58, 0.20, 0.10, "#8a6547", "#5f4634");
      surfaceContext.fillStyle = "#314a65";
      surfaceContext.fillRect(campaignDesk.left + 4, campaignDesk.top + 3, campaignDesk.width - 8, 3);
      surfaceContext.fillStyle = "#ffe2a6";
      surfaceContext.fillRect(campaignDesk.left + 6, campaignDesk.top + 7, 6, 3);
      surfaceContext.fillStyle = "#f08e72";
      surfaceContext.fillRect(campaignDesk.left + 14, campaignDesk.top + 7, 4, 3);
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(campaignDesk.left + 20, campaignDesk.top + 7, 5, 3);
      const planter = block(0.78, 0.54, 0.10, 0.24, "#5d8e56", "#335234");
      surfaceContext.fillStyle = "#84d774";
      surfaceContext.fillRect(planter.left + Math.round(planter.width / 2) - 1, planter.top + 1, 3, planter.height - 3);
      break;
    }
    case "sales": {
      drawFloorBase("#6d5748", "#5e4b3f");
      const crmBar = block(0.14, 0.12, 0.68, 0.12, "#6a4d39", "#3d2d24");
      for (let index = 0; index < 4; index += 1) {
        surfaceContext.fillStyle = pulseColor(elapsed + index * 0.3, stateAccent, "#f6d07d");
        surfaceContext.fillRect(crmBar.left + 8 + index * 16, crmBar.top + 4, 10, 4);
      }
      surfaceContext.fillStyle = "#f6f7ff";
      surfaceContext.fillRect(crmBar.left + crmBar.width - 18, crmBar.top + 5, 10, 3);
      block(0.10, 0.44, 0.16, 0.26, "#32435c", "#1c283a");
      block(0.34, 0.44, 0.16, 0.26, "#32435c", "#1c283a");
      const table = block(0.60, 0.50, 0.22, 0.16, "#8a6547", "#5f4634");
      surfaceContext.fillStyle = "#314a65";
      surfaceContext.fillRect(table.left - 4, table.top + 4, 4, 8);
      surfaceContext.fillRect(table.left + table.width, table.top + 4, 4, 8);
      surfaceContext.fillRect(table.left + 6, table.top - 4, 8, 4);
      surfaceContext.fillRect(table.left + table.width - 14, table.top - 4, 8, 4);
      const cabinet = block(0.14, 0.74, 0.14, 0.08, "#7e7e8e", "#50586a");
      surfaceContext.fillStyle = "#dce2ed";
      surfaceContext.fillRect(cabinet.left + 4, cabinet.top + 3, cabinet.width - 8, 2);
      break;
    }
    case "development": {
      drawFloorBase("#2c364d", "#263043");
      const bench = block(0.08, 0.12, 0.78, 0.14, "#3b455f", "#1d293b");
      const monitorCount = Math.max(4, Math.floor((bench.width - 18) / 16));
      const spacing = Math.max(12, Math.floor((bench.width - 20) / monitorCount));
      for (let index = 0; index < monitorCount; index += 1) {
        surfaceContext.fillStyle = pulseColor(elapsed + department.decorSeed + index * 0.35, stateAccent, "#89d0ff");
        surfaceContext.fillRect(bench.left + 6 + index * spacing, bench.top + 4, 10, 5);
      }

      const rack = block(0.10, 0.42, 0.20, 0.30, "#56606f", "#2c3441");
      for (let shelf = 0; shelf < 4; shelf += 1) {
        surfaceContext.fillStyle = shelf % 2 === 0 ? "#89d0ff" : "#8be08c";
        surfaceContext.fillRect(rack.left + 4, rack.top + 4 + shelf * 8, rack.width - 8, 3);
      }

      const worktable = block(0.44, 0.50, 0.24, 0.12, "#637797", "#30415a");
      surfaceContext.fillStyle = "#1f2836";
      surfaceContext.fillRect(worktable.left + 6, worktable.top + 5, 12, 4);
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(worktable.left + 8, worktable.top + 6, 8, 2);
      surfaceContext.fillStyle = "#d8dde8";
      surfaceContext.fillRect(worktable.left + 21, worktable.top + 7, 5, 2);
      surfaceContext.fillStyle = "#31435f";
      surfaceContext.fillRect(worktable.left + 26, worktable.top + 7, 8, 1);
      const whiteboard = block(0.78, 0.40, 0.12, 0.28, "#edf3fb", "#6d7b9a");
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(whiteboard.left + 4, whiteboard.top + 4, whiteboard.width - 8, 2);
      surfaceContext.fillStyle = "#e48d6f";
      surfaceContext.fillRect(whiteboard.left + 8, whiteboard.top + 10, whiteboard.width - 16, 2);
      surfaceContext.fillStyle = "#d0dbf2";
      surfaceContext.fillRect(whiteboard.left + 8, whiteboard.top + 15, whiteboard.width - 16, 2);
      surfaceContext.fillStyle = "#3d4c64";
      surfaceContext.fillRect(rack.left + rack.width + 4, rack.top + rack.height - 6, 28, 2);
      surfaceContext.fillRect(worktable.left + 8, rack.top + rack.height - 6, 2, 12);
      break;
    }
    case "production": {
      drawFloorBase("#69523c", "#5b4634");
      const board = block(0.10, 0.12, 0.76, 0.12, "#7a5c3a", "#4d3824");
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(board.left + 8, board.top + 4, board.width - 16, 3);
      surfaceContext.fillStyle = "#dce2ed";
      surfaceContext.fillRect(board.left + 10, board.top + 10, 22, 3);
      surfaceContext.fillRect(board.left + 40, board.top + 10, 18, 3);
      surfaceContext.fillStyle = "#8be08c";
      surfaceContext.fillRect(board.left + board.width - 18, board.top + 6, 10, 4);

      const line = block(0.14, 0.46, 0.50, 0.14, "#7c858f", "#4b5562");
      surfaceContext.fillStyle = "#b98448";
      for (let index = 0; index < 3; index += 1) {
        surfaceContext.fillRect(line.left + 10 + index * 16, line.top + 3, 10, line.height - 6);
      }
      const buffer = block(0.68, 0.50, 0.14, 0.10, "#637797", "#30415a");
      surfaceContext.fillStyle = "#dce2ed";
      surfaceContext.fillRect(buffer.left + 4, buffer.top + 4, buffer.width - 8, 3);
      const tower = block(0.80, 0.38, 0.10, 0.32, "#b98448", "#6c4726");
      surfaceContext.fillStyle = stateAccent;
      surfaceContext.fillRect(tower.left + 4, tower.top + 6, tower.width - 8, 3);
      surfaceContext.fillStyle = withAlpha(stateAccent, 0.35);
      surfaceContext.fillRect(tower.left + 6, tower.top + 11, tower.width - 12, 10);
      break;
    }
    case "quality": {
      drawFloorBase("#46626b", "#3b545c");
      const inspection = block(0.10, 0.14, 0.22, 0.14, "#d7eefc", "#7291c0");
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(inspection.left + 5, inspection.top + 5, inspection.width - 10, 3);
      const records = block(0.48, 0.12, 0.26, 0.18, "#edf3fb", "#6d7b9a");
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(records.left + 6, records.top + 5, records.width - 12, 2);
      surfaceContext.fillStyle = "#e48d6f";
      surfaceContext.fillRect(records.left + 10, records.top + 10, records.width - 20, 2);
      const lightTable = block(0.12, 0.50, 0.14, 0.18, "#f2f6fb", "#7aa6d8");
      surfaceContext.fillStyle = stateAccent;
      surfaceContext.fillRect(lightTable.left + Math.round(lightTable.width / 2) - 1, lightTable.top + 4, 3, lightTable.height - 8);
      surfaceContext.fillRect(lightTable.left + 4, lightTable.top + Math.round(lightTable.height / 2) - 1, lightTable.width - 8, 3);
      const rack = block(0.64, 0.44, 0.16, 0.26, "#7b8db1", "#33415c");
      surfaceContext.fillStyle = stateAccent;
      surfaceContext.fillRect(rack.left + 4, rack.top + 5, rack.width - 8, 3);
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(rack.left + 6, rack.top + 12, rack.width - 12, 3);
      for (let stripe = 0; stripe < 5; stripe += 1) {
        surfaceContext.fillStyle = stripe % 2 === 0 ? "#f4cf7d" : "#2b303f";
        surfaceContext.fillRect(Math.round(room.left + room.width * 0.38) + stripe * 8, Math.round(room.top + room.height * 0.66), 6, 3);
      }
      break;
    }
    case "warehouse": {
      drawFloorBase("#6b563f", "#5e4b36");
      const racks = [
        block(0.08, 0.14, 0.18, 0.58, "#896848", "#533a28"),
        block(0.36, 0.14, 0.18, 0.58, "#896848", "#533a28"),
        block(0.64, 0.14, 0.16, 0.58, "#896848", "#533a28"),
      ];
      for (const rack of racks) {
        for (let shelf = 1; shelf < 4; shelf += 1) {
          surfaceContext.fillStyle = shelf % 2 === 0 ? "#8bc8ff" : "#f1c16d";
          surfaceContext.fillRect(rack.left + 3, rack.top + shelf * 10, rack.width - 6, 3);
        }
        surfaceContext.fillStyle = "#b98448";
        surfaceContext.fillRect(rack.left + 4, rack.top + rack.height - 8, 8, 4);
        surfaceContext.fillRect(rack.left + rack.width - 12, rack.top + rack.height - 8, 8, 4);
      }
      for (let dash = 0; dash < 6; dash += 1) {
        surfaceContext.fillStyle = dash % 2 === 0 ? "#f4cf7d" : "#2b303f";
        surfaceContext.fillRect(Math.round(room.left + room.width * 0.47), room.top + 20 + dash * 12, 4, 6);
      }
      const stripeTop = Math.round(room.top + room.height * 0.80);
      const stripeLeft = Math.round(room.left + room.width * 0.12);
      const stripeWidth = Math.round(room.width * 0.72);
      for (let index = 0; index < 5; index += 1) {
        surfaceContext.fillStyle = index % 2 === 0 ? "#f4cf7d" : "#2b303f";
        surfaceContext.fillRect(stripeLeft + index * 14, stripeTop, 10, 4);
      }
      break;
    }
    case "support": {
      drawFloorBase("#4e5368", "#44495f");
      const ticketWall = block(0.12, 0.13, 0.74, 0.12, "#35506a", "#22354a");
      for (let index = 0; index < 5; index += 1) {
        surfaceContext.fillStyle = index % 2 === 0 ? "#f5f7ff" : "#89d0ff";
        surfaceContext.fillRect(ticketWall.left + 6 + index * 14, ticketWall.top + 5, 10, 5);
      }
      const desks = [
        block(0.10, 0.50, 0.22, 0.18, "#24324b", "#141d2d"),
        block(0.38, 0.50, 0.20, 0.18, "#24324b", "#141d2d"),
        block(0.66, 0.58, 0.16, 0.14, "#24324b", "#141d2d"),
      ];
      for (const desk of desks) {
        surfaceContext.fillStyle = pulseColor(elapsed + desk.left * 0.01, stateAccent, accent);
        surfaceContext.fillRect(desk.left + 4, desk.top + 4, desk.width - 8, 4);
        surfaceContext.fillStyle = "#dce4f2";
        surfaceContext.fillRect(desk.left + 5, desk.top + 10, 5, 3);
        surfaceContext.fillStyle = "#1c2436";
        surfaceContext.fillRect(desk.left + 12, desk.top + 9, 6, 4);
      }
      const knowledge = block(0.70, 0.40, 0.12, 0.08, "#5d6a82", "#354055");
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(knowledge.left + 4, knowledge.top + 3, knowledge.width - 8, 2);
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(knowledge.left + 5, knowledge.top + 8, 3, 2);
      break;
    }
    case "hr": {
      drawFloorBase("#625a48", "#564f3e");
      const notice = block(0.08, 0.12, 0.72, 0.14, "#70835c", "#435036");
      surfaceContext.fillStyle = "#ffe2a6";
      surfaceContext.fillRect(notice.left + 6, notice.top + 4, notice.width - 12, 3);
      surfaceContext.fillRect(notice.left + 8, notice.top + 10, 16, 3);
      surfaceContext.fillStyle = "#f5f7ff";
      surfaceContext.fillRect(notice.left + notice.width - 20, notice.top + 5, 12, 5);
      block(0.10, 0.54, 0.28, 0.18, "#6d8056", "#39462c");
      const bench = block(0.30, 0.58, 0.12, 0.10, "#7e7e8e", "#50586a");
      surfaceContext.fillStyle = "#dce2ed";
      surfaceContext.fillRect(bench.left + 4, bench.top + 3, bench.width - 8, 2);
      block(0.50, 0.52, 0.16, 0.18, "#8a6547", "#5f4634");
      const plant = block(0.74, 0.50, 0.12, 0.24, "#5f8f58", "#325234");
      surfaceContext.fillStyle = "#84d774";
      surfaceContext.fillRect(plant.left + Math.round(plant.width / 2) - 1, plant.top + 1, 3, plant.height - 3);
      break;
    }
    case "finance": {
      drawFloorBase("#495066", "#40475c");
      const cabinets = block(0.08, 0.16, 0.22, 0.48, "#7e7e8e", "#50586a");
      surfaceContext.fillStyle = "#d8dde8";
      for (let drawer = 0; drawer < 3; drawer += 1) {
        surfaceContext.fillRect(cabinets.left + 4, cabinets.top + 7 + drawer * 10, cabinets.width - 8, 3);
      }
      const ledger = block(0.46, 0.16, 0.36, 0.12, "#5d6a82", "#354055");
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(ledger.left + 6, ledger.top + 4, ledger.width - 12, 2);
      surfaceContext.fillRect(ledger.left + 6, ledger.top + 9, ledger.width - 18, 2);
      const counter = block(0.38, 0.56, 0.10, 0.12, "#dce2ed", "#69748b");
      surfaceContext.fillStyle = "#314a65";
      surfaceContext.fillRect(counter.left + 4, counter.top + 3, counter.width - 8, 3);
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(counter.left + 5, counter.top + 7, counter.width - 10, 2);
      surfaceContext.fillStyle = "#c35c4f";
      surfaceContext.fillRect(counter.left + 6, counter.top + 11, 4, 3);
      const vault = block(0.66, 0.56, 0.16, 0.20, "#4a5870", "#233047");
      surfaceContext.fillStyle = stateAccent;
      surfaceContext.fillRect(vault.left + Math.round(vault.width / 2) - 1, vault.top + Math.round(vault.height / 2) - 1, 3, 3);
      surfaceContext.fillStyle = withAlpha(stateAccent, 0.28);
      surfaceContext.fillRect(vault.left + 4, vault.top + 4, vault.width - 8, 4);
      break;
    }
    case "management": {
      drawFloorBase("#68563d", "#5a4a33");
      const screen = block(0.10, 0.14, 0.78, 0.14, "#d0b46a", "#7f6338");
      for (let index = 0; index < 4; index += 1) {
        surfaceContext.fillStyle = pulseColor(elapsed + index * 0.45, stateAccent, "#f7fbff");
        surfaceContext.fillRect(screen.left + 8 + index * 18, screen.top + 5, 12, 5);
      }
      const table = block(0.22, 0.46, 0.50, 0.20, "#8a6547", "#5f4634");
      surfaceContext.fillStyle = "#314a65";
      surfaceContext.fillRect(table.left - 4, table.top + 6, 4, 10);
      surfaceContext.fillRect(table.left + table.width, table.top + 6, 4, 10);
      surfaceContext.fillRect(table.left + 10, table.top - 4, 12, 4);
      surfaceContext.fillRect(table.left + table.width - 22, table.top - 4, 12, 4);
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(table.left + Math.round(table.width / 2) - 10, table.top - 6, 20, 3);
      surfaceContext.fillStyle = "#dce4f2";
      surfaceContext.fillRect(table.left + 12, table.top + 8, 14, 3);
      surfaceContext.fillRect(table.left + table.width - 30, table.top + 8, 14, 3);
      surfaceContext.fillStyle = "#1f2938";
      surfaceContext.fillRect(table.left + Math.round(table.width / 2) - 8, table.top + 10, 16, 5);
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(table.left + Math.round(table.width / 2) - 5, table.top + 11, 10, 2);
      const archive = block(0.08, 0.50, 0.10, 0.24, "#7e7e8e", "#50586a");
      surfaceContext.fillStyle = "#dce2ed";
      surfaceContext.fillRect(archive.left + 4, archive.top + 6, archive.width - 8, 3);
      const control = block(0.80, 0.48, 0.10, 0.26, "#425273", "#24324b");
      surfaceContext.fillStyle = stateAccent;
      surfaceContext.fillRect(control.left + 4, control.top + 6, control.width - 8, 3);
      break;
    }
    default:
      drawFloorBase("#5f564b", "#564d44");
      block(0.10, 0.14, 0.78, 0.12, adjustHex(accent, -10), adjustHex(accent, -40));
  }
}

function drawSharedZoneDecor(zone: SharedZone, room: Rect, elapsed: number): void {
  const floorRect: Rect = {
    left: room.left + 6,
    top: room.top + 6,
    width: room.width - 12,
    height: room.height - 12,
  };
  const step = Math.max(8, Math.round(camera.zoom * 7));
  const localRect = (x: number, y: number, width: number, height: number): Rect => ({
    left: Math.round(room.left + room.width * x),
    top: Math.round(room.top + room.height * y),
    width: Math.max(5, Math.round(room.width * width)),
    height: Math.max(4, Math.round(room.height * height)),
  });
  const drawFloorBase = (primary: string, secondary: string): void => {
    drawPattern(surfaceContext, floorRect, primary, secondary, step);
    drawAmbientRoomShell(room, floorRect, zone.accent, elapsed, room.left + room.top);
    drawFloorWear(floorRect, zone.accent, room.left + room.top);
  };

  if (zone.kind === "reception") {
    drawFloorBase("#5f677d", "#566077");
    const plaque = localRect(0.18, 0.12, 0.46, 0.12);
    drawPixelFrame(surfaceContext, plaque, "#dce4f2", "#7586a6", "#090b12", 1);
    surfaceContext.fillStyle = pulseColor(elapsed + room.left * 0.02, "#8bd5ff", "#d9ecff");
    surfaceContext.fillRect(plaque.left + 6, plaque.top + 4, plaque.width - 12, 4);

    const rug = localRect(0.18, 0.56, 0.62, 0.20);
    drawPixelFrame(surfaceContext, rug, "#4b5f86", "#25344e", "#090b12", 1);
    surfaceContext.fillStyle = "#6e87b2";
    surfaceContext.fillRect(rug.left + 4, rug.top + 4, rug.width - 8, rug.height - 8);
    surfaceContext.fillStyle = "#f4cf7d";
    surfaceContext.fillRect(rug.left + 8, rug.top + 8, rug.width - 16, 2);
    const queueA = localRect(0.18, 0.40, 0.18, 0.04);
    const queueB = localRect(0.44, 0.40, 0.18, 0.04);
    surfaceContext.fillStyle = "#d9ecff";
    surfaceContext.fillRect(queueA.left, queueA.top, queueA.width, queueA.height);
    surfaceContext.fillRect(queueB.left, queueB.top, queueB.width, queueB.height);
    surfaceContext.fillStyle = "#89d0ff";
    surfaceContext.fillRect(queueA.left + 4, queueA.top + 1, queueA.width - 8, 1);
    surfaceContext.fillRect(queueB.left + 4, queueB.top + 1, queueB.width - 8, 1);
    const kiosk = localRect(0.72, 0.20, 0.10, 0.26);
    drawPixelFrame(surfaceContext, kiosk, "#dce4f2", "#6a7d9b", "#090b12", 1);
    surfaceContext.fillStyle = pulseColor(elapsed + room.left * 0.02, "#89d0ff", "#f7fbff");
    surfaceContext.fillRect(kiosk.left + 3, kiosk.top + 4, kiosk.width - 6, kiosk.height - 8);
    const waitingPad = localRect(0.56, 0.66, 0.18, 0.06);
    surfaceContext.fillStyle = "#3c4d69";
    surfaceContext.fillRect(waitingPad.left, waitingPad.top, waitingPad.width, waitingPad.height);
    surfaceContext.fillStyle = "#f4cf7d";
    surfaceContext.fillRect(waitingPad.left + 4, waitingPad.top + 2, waitingPad.width - 8, 2);
    const magazineStack = localRect(0.24, 0.70, 0.12, 0.08);
    drawPixelFrame(surfaceContext, magazineStack, "#dce4f2", "#6a7d9b", "#090b12", 1);
    surfaceContext.fillStyle = "#89d0ff";
    surfaceContext.fillRect(magazineStack.left + 3, magazineStack.top + 2, magazineStack.width - 6, 2);
    surfaceContext.fillStyle = "#f08e72";
    surfaceContext.fillRect(magazineStack.left + 4, magazineStack.top + 5, magazineStack.width - 8, 1);
    const bell = localRect(0.66, 0.28, 0.06, 0.06);
    surfaceContext.fillStyle = "#f4cf7d";
    surfaceContext.fillRect(bell.left + 1, bell.top + 2, bell.width - 2, bell.height - 2);
    surfaceContext.fillStyle = "#fff4ce";
    surfaceContext.fillRect(bell.left + 2, bell.top + 1, bell.width - 4, 1);
    return;
  }

  drawFloorBase("#7b6956", "#705f4f");
  const menuBoard = localRect(0.52, 0.10, 0.30, 0.12);
  drawPixelFrame(surfaceContext, menuBoard, "#edf3fb", "#6d7b9a", "#090b12", 1);
  surfaceContext.fillStyle = "#89d0ff";
  surfaceContext.fillRect(menuBoard.left + 5, menuBoard.top + 4, menuBoard.width - 10, 2);
  surfaceContext.fillStyle = "#e48d6f";
  surfaceContext.fillRect(menuBoard.left + 8, menuBoard.top + 9, menuBoard.width - 16, 2);

  const aisle = localRect(0.14, 0.22, 0.12, 0.58);
  drawPixelFrame(surfaceContext, aisle, "#8f7f70", "#5d5148", "#090b12", 1);
  surfaceContext.fillStyle = "#bba993";
  surfaceContext.fillRect(aisle.left + 3, aisle.top + 3, aisle.width - 6, aisle.height - 6);
  surfaceContext.fillStyle = "#f4cf7d";
  for (let dash = 0; dash < 5; dash += 1) {
    surfaceContext.fillRect(aisle.left + Math.round(aisle.width / 2) - 1, aisle.top + 6 + dash * 12, 3, 6);
  }

  const divider = localRect(0.86, 0.22, 0.04, 0.56);
  surfaceContext.fillStyle = pulseColor(elapsed + room.top * 0.02, "#f4cf7d", "#e9b96a");
  surfaceContext.fillRect(divider.left, divider.top, divider.width, divider.height);
  const servingLight = localRect(0.16, 0.12, 0.26, 0.04);
  surfaceContext.fillStyle = "#544536";
  surfaceContext.fillRect(servingLight.left, servingLight.top, servingLight.width, servingLight.height);
  surfaceContext.fillStyle = pulseColor(elapsed + room.left * 0.03, "#f7fbff", "#f4cf7d");
  surfaceContext.fillRect(servingLight.left + 3, servingLight.top + 1, servingLight.width - 6, 2);
  const trayRail = localRect(0.18, 0.80, 0.22, 0.05);
  surfaceContext.fillStyle = "#c9b08f";
  surfaceContext.fillRect(trayRail.left, trayRail.top, trayRail.width, trayRail.height);
  surfaceContext.fillStyle = "#8e765f";
  surfaceContext.fillRect(trayRail.left + 3, trayRail.top + 1, trayRail.width - 6, 2);
  const vending = localRect(0.72, 0.18, 0.12, 0.26);
  drawPixelFrame(surfaceContext, vending, "#cad4df", "#677690", "#090b12", 1);
  surfaceContext.fillStyle = "#89d0ff";
  surfaceContext.fillRect(vending.left + 4, vending.top + 5, vending.width - 8, 10);
  surfaceContext.fillStyle = "#dce6f6";
  surfaceContext.fillRect(vending.left + 5, vending.top + 18, vending.width - 10, 2);
  surfaceContext.fillStyle = "#f4cf7d";
  surfaceContext.fillRect(vending.left + vending.width - 6, vending.top + vending.height - 8, 2, 2);
  const condiment = localRect(0.44, 0.16, 0.08, 0.10);
  drawPixelFrame(surfaceContext, condiment, "#c9d2df", "#677690", "#090b12", 1);
  surfaceContext.fillStyle = "#d65d4f";
  surfaceContext.fillRect(condiment.left + 3, condiment.top + 3, 2, condiment.height - 6);
  surfaceContext.fillStyle = "#f4cf7d";
  surfaceContext.fillRect(condiment.left + 7, condiment.top + 3, 2, condiment.height - 6);
  const trayStack = localRect(0.46, 0.74, 0.10, 0.08);
  surfaceContext.fillStyle = "#dce4f2";
  surfaceContext.fillRect(trayStack.left, trayStack.top, trayStack.width, 2);
  surfaceContext.fillRect(trayStack.left + 1, trayStack.top + 3, trayStack.width - 2, 2);
  surfaceContext.fillRect(trayStack.left + 2, trayStack.top + 6, trayStack.width - 4, 2);
  surfaceContext.fillStyle = withAlpha("#6b4d36", 0.16);
  surfaceContext.fillRect(trayStack.left + trayStack.width + 6, trayStack.top - 3, 3, 3);
  surfaceContext.fillRect(trayStack.left + trayStack.width + 11, trayStack.top - 1, 2, 2);
}

function pulseColor(time: number, primary: string, secondary: string): string {
  return Math.sin(time * 4) > 0 ? primary : secondary;
}

function drawGroundShadow(x: number, y: number, width: number): void {
  surfaceContext.fillStyle = "#0a0c14";
  surfaceContext.fillRect(x - Math.round(width / 2), y + 8, width, 3);
}

function drawInteractionGroundMarker(
  anchor: Point,
  elapsed: number,
  accent: string,
  highlighted: boolean,
  options: {
    width?: number;
    offsetY?: number;
    seed?: number;
  } = {}
): void {
  const width = Math.max(10, Math.round(options.width ?? 18));
  const offsetY = options.offsetY ?? 8;
  const seed = options.seed ?? 0;
  const pulse = 0.5 + Math.sin(elapsed * 4 + seed) * 0.5;
  const x = Math.round(anchor.x);
  const y = Math.round(anchor.y + offsetY);
  const halfWidth = Math.round(width / 2);
  const innerWidth = Math.max(6, width - 8);
  const scanWidth = Math.max(3, Math.round(width * (highlighted ? 0.34 : 0.22)));
  const scanTravel = Math.max(2, innerWidth - scanWidth);
  const scanOffset = Math.round((pulse - 0.5) * scanTravel);

  surfaceContext.fillStyle = withAlpha(accent, highlighted ? 0.18 + pulse * 0.08 : 0.08 + pulse * 0.04);
  surfaceContext.fillRect(x - halfWidth, y - 1, width, 3);

  surfaceContext.fillStyle = withAlpha("#0a0c14", highlighted ? 0.48 : 0.36);
  surfaceContext.fillRect(x - halfWidth + 2, y, width - 4, 1);

  surfaceContext.fillStyle = withAlpha(adjustHex(accent, 18), highlighted ? 0.92 : 0.62);
  surfaceContext.fillRect(x - halfWidth, y - 2, 4, 1);
  surfaceContext.fillRect(x + halfWidth - 3, y - 2, 4, 1);
  surfaceContext.fillRect(x - halfWidth, y + 2, 4, 1);
  surfaceContext.fillRect(x + halfWidth - 3, y + 2, 4, 1);
  surfaceContext.fillRect(x - halfWidth - 1, y - 1, 1, 3);
  surfaceContext.fillRect(x + halfWidth, y - 1, 1, 3);

  surfaceContext.fillStyle = withAlpha("#f7fbff", highlighted ? 0.86 : 0.48);
  surfaceContext.fillRect(x - Math.round(innerWidth / 2) + scanOffset, y, scanWidth, 1);
}

function drawNpcFocusHalo(anchor: Point, elapsed: number, accent: string, emphasized: boolean): void {
  const x = Math.round(anchor.x);
  const y = Math.round(anchor.y);
  const pulse = 0.5 + Math.sin(elapsed * 4.4 + x * 0.03) * 0.5;
  surfaceContext.fillStyle = withAlpha(accent, emphasized ? 0.14 + pulse * 0.08 : 0.08 + pulse * 0.04);
  surfaceContext.fillRect(x - (emphasized ? 11 : 9), y - 12, emphasized ? 22 : 18, emphasized ? 18 : 14);
  surfaceContext.fillStyle = withAlpha("#f7fbff", emphasized ? 0.52 : 0.26);
  surfaceContext.fillRect(x - 4, y - 12, 8, 1);
  surfaceContext.fillStyle = withAlpha(accent, emphasized ? 0.44 : 0.26);
  surfaceContext.fillRect(x - (emphasized ? 9 : 8), y + 8, emphasized ? 18 : 16, 2);
}

function drawGroundInteractionHighlights(elapsed: number): void {
  const markers = collectGroundInteractionMarkers();
  if (markers.length === 0) {
    return;
  }

  markers
    .slice()
    .reverse()
    .forEach((marker, index) => {
      const position = getInteractionTargetPosition(marker.target);
      const anchor = worldToScreen(position.x, position.y);
      const width = marker.target.type === "podium"
        ? 18
        : marker.target.type === "guide"
          ? 22
          : marker.target.type === "terminal"
            ? marker.target.value.kind === "external" && isLedServiceTerminal(marker.target.value)
              ? 20
              : 18
            : 16;
      const offsetY = marker.target.type === "guide" ? 10 : 8;
      const visibilityRect = {
        left: anchor.x - width,
        top: anchor.y - 6,
        width: width * 2,
        height: 18,
      };

      if (!isScreenRectVisible(visibilityRect)) {
        return;
      }

      drawInteractionGroundMarker(anchor, elapsed, marker.accent, marker.highlighted, {
        width,
        offsetY,
        seed: index * 0.8 + position.x * 0.03 + position.y * 0.02,
      });
    });
}

function drawSceneRouteStepBadge(anchor: Point, label: string, accent: string, emphasized: boolean): void {
  const size = emphasized ? 12 : 10;
  const left = Math.round(anchor.x - size / 2);
  const top = Math.round(anchor.y - size / 2);
  surfaceContext.save();
  surfaceContext.fillStyle = withAlpha("#09111d", 0.92);
  surfaceContext.fillRect(left, top, size, size);
  surfaceContext.strokeStyle = withAlpha(accent, emphasized ? 0.92 : 0.72);
  surfaceContext.lineWidth = 1;
  surfaceContext.strokeRect(left + 0.5, top + 0.5, size - 1, size - 1);
  surfaceContext.fillStyle = "#f7fbff";
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.font = emphasized
    ? 'bold 7px Monaco, "Courier New", monospace'
    : 'bold 6px Monaco, "Courier New", monospace';
  surfaceContext.fillText(label, left + size / 2, top + size / 2 + 0.5);
  surfaceContext.restore();
}

function drawPromptTargetPath(elapsed: number): void {
  if (!shouldShowTaskPrompts()) {
    return;
  }

  const directPromptTarget = getPromptTarget();
  const target = getNavigationTarget();
  if (!target) {
    return;
  }

  const targetPosition = getInteractionTargetPosition(target);
  const playerAnchor = worldToScreen(player.x, player.y);
  const targetAnchor = worldToScreen(targetPosition.x, targetPosition.y);
  const dx = targetAnchor.x - playerAnchor.x;
  const dy = targetAnchor.y - playerAnchor.y;
  const distance = Math.hypot(dx, dy);
  if (distance < (directPromptTarget ? 2 : 10)) {
    return;
  }

  const accent = getInteractionTargetIndicatorAccent(target);
  const arrowDistance = directPromptTarget
    ? PROMPT_TARGET_ARROW_DISTANCE
    : distance > PROMPT_TARGET_ARROW_DISTANCE + 6
      ? PROMPT_TARGET_ARROW_DISTANCE
      : Math.max(8, distance - 6);
  const arrowAnchor = {
    x: playerAnchor.x + (dx / distance) * arrowDistance,
    y: playerAnchor.y + (dy / distance) * arrowDistance,
  };
  const pulse = 0.5 + Math.sin(elapsed * 4.2) * 0.5;
  const arrowAngle = Math.atan2(dy, dx) + Math.PI / 2;

  surfaceContext.save();
  surfaceContext.translate(Math.round(arrowAnchor.x), Math.round(arrowAnchor.y));
  surfaceContext.rotate(arrowAngle);

  surfaceContext.fillStyle = withAlpha(accent, 0.12 + pulse * 0.08);
  surfaceContext.beginPath();
  surfaceContext.arc(0, 0, 12 + pulse * 2, 0, Math.PI * 2);
  surfaceContext.fill();

  surfaceContext.fillStyle = withAlpha("#09111d", 0.82);
  surfaceContext.beginPath();
  surfaceContext.moveTo(0, -12);
  surfaceContext.lineTo(8, 2);
  surfaceContext.lineTo(3, 2);
  surfaceContext.lineTo(3, 10);
  surfaceContext.lineTo(-3, 10);
  surfaceContext.lineTo(-3, 2);
  surfaceContext.lineTo(-8, 2);
  surfaceContext.closePath();
  surfaceContext.fill();

  surfaceContext.fillStyle = withAlpha(accent, 0.94);
  surfaceContext.beginPath();
  surfaceContext.moveTo(0, -10);
  surfaceContext.lineTo(6, 1);
  surfaceContext.lineTo(2, 1);
  surfaceContext.lineTo(2, 8);
  surfaceContext.lineTo(-2, 8);
  surfaceContext.lineTo(-2, 1);
  surfaceContext.lineTo(-6, 1);
  surfaceContext.closePath();
  surfaceContext.fill();

  surfaceContext.strokeStyle = withAlpha("#f7fbff", 0.86);
  surfaceContext.lineWidth = 1;
  surfaceContext.beginPath();
  surfaceContext.moveTo(0, -10);
  surfaceContext.lineTo(6, 1);
  surfaceContext.lineTo(2, 1);
  surfaceContext.lineTo(2, 8);
  surfaceContext.lineTo(-2, 8);
  surfaceContext.lineTo(-2, 1);
  surfaceContext.lineTo(-6, 1);
  surfaceContext.closePath();
  surfaceContext.stroke();

  surfaceContext.fillStyle = withAlpha("#f7fbff", 0.78 + pulse * 0.12);
  surfaceContext.fillRect(-1, -5, 2, 8);
  surfaceContext.fillRect(-1, -5, 4, 2);
  surfaceContext.restore();
}

function drawInteractionBeacon(
  anchor: Point,
  elapsed: number,
  accent: string,
  highlighted: boolean,
  options: {
    width?: number;
    height?: number;
    offsetY?: number;
    beamHeight?: number;
    beamWidth?: number;
    seed?: number;
  } = {}
): void {
  const width = Math.max(8, Math.round(options.width ?? 18));
  const height = Math.max(4, Math.round(options.height ?? 10));
  const offsetY = options.offsetY ?? 0;
  const beamHeight = Math.max(6, Math.round(options.beamHeight ?? 12));
  const beamWidth = Math.max(1, Math.round(options.beamWidth ?? 2));
  const seed = options.seed ?? 0;
  const pulse = 0.5 + Math.sin(elapsed * 4.6 + seed) * 0.5;
  const auraAlpha = highlighted ? 0.18 + pulse * 0.12 : 0.08 + pulse * 0.05;
  const beamAlpha = highlighted ? 0.44 + pulse * 0.18 : 0.18 + pulse * 0.08;
  const frameAlpha = highlighted ? 0.78 : 0.42 + pulse * 0.1;
  const x = Math.round(anchor.x);
  const y = Math.round(anchor.y + offsetY);
  const halfWidth = Math.round(width / 2);
  const halfHeight = Math.round(height / 2);
  const auraWidth = width + (highlighted ? 8 : 4);
  const auraHeight = height + (highlighted ? 4 : 2);

  surfaceContext.fillStyle = withAlpha(accent, auraAlpha);
  surfaceContext.fillRect(
    x - Math.round(auraWidth / 2),
    y - Math.round(auraHeight / 2),
    auraWidth,
    auraHeight
  );

  surfaceContext.fillStyle = withAlpha("#f7fbff", beamAlpha);
  surfaceContext.fillRect(x - Math.floor(beamWidth / 2), y - beamHeight, beamWidth, beamHeight - 2);
  surfaceContext.fillStyle = withAlpha("#f7fbff", highlighted ? 0.9 : 0.58);
  surfaceContext.fillRect(x - 1, y - beamHeight - 2, 2, 2);

  surfaceContext.fillStyle = withAlpha(adjustHex(accent, 18), frameAlpha);
  surfaceContext.fillRect(x - halfWidth, y - halfHeight, width, 1);
  surfaceContext.fillRect(x - halfWidth, y + halfHeight, width, 1);
  surfaceContext.fillRect(x - halfWidth, y - halfHeight, 1, height);
  surfaceContext.fillRect(x + halfWidth, y - halfHeight, 1, height);

  surfaceContext.fillStyle = withAlpha(accent, beamAlpha * 0.9);
  surfaceContext.fillRect(x - halfWidth - 2, y, 2, 1);
  surfaceContext.fillRect(x + halfWidth + 1, y, 2, 1);
}

function drawHeroMarker(x: number, y: number, offset = PLAYER_MARKER_OFFSET): void {
  surfaceContext.fillStyle = withAlpha("#79f0ff", 0.45);
  surfaceContext.fillRect(x - 1, y - offset + 4, 2, 5);
  surfaceContext.fillStyle = "#ffe082";
  surfaceContext.fillRect(x - 3, y - offset, 7, 1);
  surfaceContext.fillRect(x - 2, y - offset + 1, 5, 1);
  surfaceContext.fillRect(x - 1, y - offset + 2, 3, 1);
  surfaceContext.fillRect(x, y - offset + 3, 1, 1);
}

function drawNpcSprite(
  anchor: Point,
  facing: FacingDirection,
  palette: CharacterPalette,
  bob: number
): void {
  const x = Math.round(anchor.x);
  const y = Math.round(anchor.y + bob);
  const skin = "#f0d7c1";
  const pants = "#d8dde8";
  drawGroundShadow(x, y, 10);

  if (facing === "up") {
    surfaceContext.fillStyle = palette.hair;
    surfaceContext.fillRect(x - 4, y - 9, 8, 6);
    surfaceContext.fillStyle = palette.clothes;
    surfaceContext.fillRect(x - 5, y - 3, 10, 9);
    surfaceContext.fillStyle = pants;
    surfaceContext.fillRect(x - 4, y + 6, 3, 5);
    surfaceContext.fillRect(x + 1, y + 6, 3, 5);
    surfaceContext.fillStyle = adjustHex(palette.clothes, -22);
    surfaceContext.fillRect(x - 3, y - 1, 6, 2);
    return;
  }

  if (facing === "left" || facing === "right") {
    const dir = facing === "left" ? -1 : 1;
    surfaceContext.fillStyle = skin;
    surfaceContext.fillRect(x - 3, y - 8, 6, 6);
    surfaceContext.fillStyle = palette.hair;
    surfaceContext.fillRect(x - 4, y - 9, 7, 3);
    surfaceContext.fillRect(x - 4 + (dir > 0 ? 0 : 1), y - 8, 2, 5);
    surfaceContext.fillStyle = "#1b1c24";
    surfaceContext.fillRect(x + dir, y - 5, 1, 1);
    surfaceContext.fillStyle = palette.clothes;
    surfaceContext.fillRect(x - 4, y - 2, 8, 8);
    surfaceContext.fillStyle = pants;
    surfaceContext.fillRect(x - 3, y + 6, 2, 5);
    surfaceContext.fillRect(x + 1, y + 6, 2, 5);
    surfaceContext.fillStyle = skin;
    surfaceContext.fillRect(x + (dir > 0 ? 4 : -5), y + 1, 2, 4);
    return;
  }

  surfaceContext.fillStyle = skin;
  surfaceContext.fillRect(x - 3, y - 8, 6, 6);
  surfaceContext.fillStyle = palette.hair;
  surfaceContext.fillRect(x - 4, y - 9, 8, 3);
  surfaceContext.fillStyle = "#1b1c24";
  surfaceContext.fillRect(x - 2, y - 5, 1, 1);
  surfaceContext.fillRect(x + 1, y - 5, 1, 1);
  surfaceContext.fillStyle = "#d0928a";
  surfaceContext.fillRect(x - 1, y - 3, 2, 1);
  surfaceContext.fillStyle = palette.clothes;
  surfaceContext.fillRect(x - 5, y - 2, 10, 8);
  surfaceContext.fillStyle = pants;
  surfaceContext.fillRect(x - 4, y + 6, 3, 5);
  surfaceContext.fillRect(x + 1, y + 6, 3, 5);
}

function drawFallbackPlayerSprite(anchor: Point, facing: FacingDirection, bob: number): void {
  const x = Math.round(anchor.x);
  const y = Math.round(anchor.y + bob);
  const skin = "#f0d7c1";
  const hair = "#3c2418";
  const coat = "#cb4c3b";
  const coatShadow = "#9e342a";
  const scarf = "#f0c94d";
  const trim = "#f3f5f8";
  const boots = "#232734";

  drawGroundShadow(x, y, 14);
  drawHeroMarker(x, y);

  if (facing === "up") {
    surfaceContext.fillStyle = trim;
    surfaceContext.fillRect(x - 5, y - 4, 10, 2);
    surfaceContext.fillStyle = hair;
    surfaceContext.fillRect(x - 4, y - 9, 8, 6);
    surfaceContext.fillStyle = coat;
    surfaceContext.fillRect(x - 5, y - 3, 10, 10);
    surfaceContext.fillStyle = scarf;
    surfaceContext.fillRect(x - 4, y - 2, 8, 2);
    surfaceContext.fillStyle = coatShadow;
    surfaceContext.fillRect(x - 1, y - 1, 2, 7);
    surfaceContext.fillStyle = boots;
    surfaceContext.fillRect(x - 4, y + 7, 3, 4);
    surfaceContext.fillRect(x + 1, y + 7, 3, 4);
    return;
  }

  if (facing === "left" || facing === "right") {
    const dir = facing === "left" ? -1 : 1;
    surfaceContext.fillStyle = scarf;
    surfaceContext.fillRect(x - 3 - dir, y - 1, 2, 5);
    surfaceContext.fillStyle = skin;
    surfaceContext.fillRect(x - 3, y - 8, 6, 6);
    surfaceContext.fillStyle = hair;
    surfaceContext.fillRect(x - 4, y - 9, 7, 3);
    surfaceContext.fillRect(x - 4 + (dir > 0 ? 0 : 1), y - 8, 2, 5);
    surfaceContext.fillStyle = trim;
    surfaceContext.fillRect(x + (dir > 0 ? 1 : -2), y - 5, 2, 1);
    surfaceContext.fillStyle = coat;
    surfaceContext.fillRect(x - 5, y - 2, 9, 9);
    surfaceContext.fillStyle = coatShadow;
    surfaceContext.fillRect(x - 2, y, 4, 6);
    surfaceContext.fillStyle = boots;
    surfaceContext.fillRect(x - 3, y + 7, 2, 4);
    surfaceContext.fillRect(x + 1, y + 7, 2, 4);
    surfaceContext.fillStyle = skin;
    surfaceContext.fillRect(x + (dir > 0 ? 4 : -5), y + 1, 2, 4);
    return;
  }

  surfaceContext.fillStyle = skin;
  surfaceContext.fillRect(x - 3, y - 8, 6, 6);
  surfaceContext.fillStyle = hair;
  surfaceContext.fillRect(x - 4, y - 9, 8, 3);
  surfaceContext.fillStyle = "#1b1c24";
  surfaceContext.fillRect(x - 2, y - 5, 1, 1);
  surfaceContext.fillRect(x + 1, y - 5, 1, 1);
  surfaceContext.fillStyle = scarf;
  surfaceContext.fillRect(x - 5, y - 3, 10, 2);
  surfaceContext.fillStyle = coat;
  surfaceContext.fillRect(x - 6, y - 2, 12, 9);
  surfaceContext.fillStyle = trim;
  surfaceContext.fillRect(x - 1, y - 1, 2, 7);
  surfaceContext.fillRect(x - 5, y - 1, 2, 2);
  surfaceContext.fillRect(x + 3, y - 1, 2, 2);
  surfaceContext.fillStyle = coatShadow;
  surfaceContext.fillRect(x - 6, y + 5, 12, 2);
  surfaceContext.fillStyle = boots;
  surfaceContext.fillRect(x - 4, y + 7, 3, 4);
  surfaceContext.fillRect(x + 1, y + 7, 3, 4);
}

function getPlayerSpriteFacing(angle: number): PlayerSpriteFacing {
  const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const octant = Math.round(normalized / (Math.PI / 4)) % 8;
  const facings: PlayerSpriteFacing[] = [
    "right",
    "down-right",
    "down",
    "down-left",
    "left",
    "up-left",
    "up",
    "up-right",
  ];
  return facings[octant] ?? "down";
}

function drawPlayerSprite(anchor: Point, facingAngle: number, bob: number, walkStride: number): void {
  const x = Math.round(anchor.x);
  const y = Math.round(anchor.y + bob);
  const sheet = playerSpriteSheetState.sheet;
  if (!sheet) {
    const fallbackFacing = getFacingDirection(Math.cos(facingAngle), Math.sin(facingAngle), "down");
    drawFallbackPlayerSprite(anchor, fallbackFacing, bob);
    return;
  }

  const facing = getPlayerSpriteFacing(facingAngle);
  const frame = sheet.frames[facing];
  const strideIntensity = Math.abs(walkStride);
  const spriteScale = PLAYER_SPRITE_TARGET_HEIGHT / frame.height;
  const drawHeight = Math.max(30, Math.round(PLAYER_SPRITE_TARGET_HEIGHT * (1 - strideIntensity * 0.06)));
  const drawWidth = Math.max(
    PLAYER_SPRITE_MIN_WIDTH,
    Math.round(frame.width * spriteScale * (1 + strideIntensity * 0.1))
  );
  const swayX = Math.round(walkStride * 1.4);
  const drawLeft = x - Math.round(drawWidth / 2) + swayX;
  const drawTop = y - drawHeight + PLAYER_SPRITE_BASELINE_OFFSET + Math.round(strideIntensity);

  surfaceContext.drawImage(
    sheet.canvas,
    frame.left,
    frame.top,
    frame.width,
    frame.height,
    drawLeft,
    drawTop,
    drawWidth,
    drawHeight
  );
  drawHeroMarker(x, y);
}

function drawPlayer(elapsed: number): void {
  const position = worldToScreen(player.x, player.y);
  const walkStride = player.step > 0 ? Math.sin(player.step) : 0;
  const bob = player.step > 0 ? walkStride * 1.8 : Math.sin(elapsed * 2) * 0.35;
  drawPlayerSprite(position, player.facing, bob, walkStride);
}

function drawTitleScreenBackdrop(elapsed: number): void {
  surfaceContext.fillStyle = "#171d31";
  surfaceContext.fillRect(0, 0, surface.width, surface.height);

  for (let index = 0; index < starfield.length; index += 1) {
    const star = starfield[index];
    const driftX = ((star.x + elapsed * star.speed * 0.5 + index * 3) % OFFICE_WIDTH) / OFFICE_WIDTH;
    const driftY = ((star.y + index * 7) % OFFICE_HEIGHT) / OFFICE_HEIGHT;
    const x = Math.round(driftX * surface.width);
    const y = Math.round(driftY * surface.height * 0.52);
    surfaceContext.fillStyle = withAlpha("#e3ebff", star.alpha * 0.55);
    surfaceContext.fillRect(x, y, star.size, star.size);
  }

  surfaceContext.fillStyle = "rgba(106, 158, 255, 0.12)";
  surfaceContext.fillRect(0, Math.round(surface.height * 0.24), surface.width, Math.round(surface.height * 0.18));
  surfaceContext.fillStyle = "rgba(14, 18, 31, 0.72)";
  surfaceContext.fillRect(0, Math.round(surface.height * 0.42), surface.width, Math.round(surface.height * 0.18));

  const skyline = [
    { left: 18, width: 56, height: 70 },
    { left: 94, width: 44, height: 92 },
    { left: 154, width: 68, height: 80 },
    { left: 248, width: 54, height: 96 },
    { left: 324, width: 46, height: 72 },
    { left: 388, width: 54, height: 84 },
  ];
  skyline.forEach((building, index) => {
    const top = Math.round(surface.height * 0.42) - building.height;
    drawPixelFrame(
      surfaceContext,
      { left: building.left, top, width: building.width, height: building.height },
      index % 2 === 0 ? "#29304b" : "#222944",
      "#0b1020",
      "#090c15",
      2
    );
    surfaceContext.fillStyle = index % 2 === 0 ? "#ffe49b" : "#8fd2ff";
    for (let row = 0; row < building.height - 14; row += 12) {
      for (let col = 0; col < building.width - 14; col += 12) {
        if ((row + col + index * 3) % 24 === 0) {
          surfaceContext.fillRect(building.left + 8 + col, top + 8 + row, 4, 5);
        }
      }
    }
  });

  const floorTop = Math.round(surface.height * 0.58);
  drawPixelFrame(
    surfaceContext,
    { left: 0, top: floorTop, width: surface.width, height: surface.height - floorTop },
    "#4f5e7d",
    "#1a2134",
    "#0d111b",
    0
  );
  surfaceContext.fillStyle = "#627295";
  for (let y = floorTop + 10; y < surface.height; y += 12) {
    surfaceContext.fillRect(0, y, surface.width, 2);
  }
  surfaceContext.fillStyle = "#7182a8";
  for (let x = 16; x < surface.width; x += 24) {
    surfaceContext.fillRect(x, floorTop, 2, surface.height - floorTop);
  }

  const chaseLane = {
    left: 18,
    top: floorTop + 18,
    width: surface.width - 36,
    height: Math.max(42, surface.height - floorTop - 34),
  };
  drawPixelFrame(surfaceContext, chaseLane, "#40506e", "#1a2134", "#151a28", 2);
  surfaceContext.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let x = chaseLane.left + 14; x < chaseLane.left + chaseLane.width - 14; x += 28) {
    surfaceContext.fillRect(x, chaseLane.top + Math.round(chaseLane.height / 2), 14, 2);
  }
}

function drawTitleChaseTrail(): void {
  const hero = titleScreenState.hero.position;
  const lobster = titleScreenState.lobster.position;
  const distance = Math.hypot(lobster.x - hero.x, lobster.y - hero.y);
  const steps = Math.max(4, Math.min(12, Math.round(distance / 18)));

  for (let index = 1; index < steps; index += 1) {
    const progress = index / steps;
    const x = Math.round(lerp(hero.x, lobster.x, progress));
    const y = Math.round(lerp(hero.y - 6, lobster.y - 6, progress) + Math.sin(progress * Math.PI * 3) * 2);
    surfaceContext.fillStyle = withAlpha("#8fd2ff", 0.08 + progress * 0.2);
    surfaceContext.fillRect(x - 1, y - 1, 3, 3);
  }
}

function renderTitleScreen(elapsed: number): void {
  surfaceContext.clearRect(0, 0, surface.width, surface.height);
  surfaceContext.imageSmoothingEnabled = false;
  drawTitleScreenBackdrop(elapsed);
  drawTitleChaseTrail();
  const walkStride = titleScreenState.hero.step > 0 ? Math.sin(titleScreenState.hero.step) : 0;
  const bob = walkStride * 1.8 + Math.sin(elapsed * 2.4) * 0.25;
  drawPlayerSprite(titleScreenState.hero.position, titleScreenState.hero.facing, bob, walkStride);
  drawLobsterGuideSprite(titleScreenState.lobster.position, elapsed, true, {
    cutout: true,
    glowAlpha: 0.54,
    scale: 1.25,
    facingAngle: titleScreenState.lobster.facing,
  });
  drawScreenEffects();

  sceneContext.clearRect(0, 0, canvas.width, canvas.height);
  sceneContext.imageSmoothingEnabled = false;
  const transform = getSurfaceDrawTransform();
  const drawWidth = surface.width * transform.scale;
  const drawHeight = surface.height * transform.scale;
  sceneContext.drawImage(surface, transform.drawLeft, transform.drawTop, drawWidth, drawHeight);
}

function drawScreenEffects(): void {
  surfaceContext.fillStyle = "rgba(255, 255, 255, 0.025)";
  for (let y = 0; y < surface.height; y += 4) {
    surfaceContext.fillRect(0, y, surface.width, 1);
  }

  surfaceContext.fillStyle = "rgba(3, 6, 15, 0.22)";
  surfaceContext.fillRect(0, 0, surface.width, 8);
  surfaceContext.fillRect(0, surface.height - 8, surface.width, 8);
  surfaceContext.fillStyle = "rgba(3, 6, 15, 0.14)";
  surfaceContext.fillRect(0, 0, 10, surface.height);
  surfaceContext.fillRect(surface.width - 10, 0, 10, surface.height);
}

function renderScene(elapsed: number): void {
  surfaceContext.clearRect(0, 0, surface.width, surface.height);
  surfaceContext.imageSmoothingEnabled = false;

  drawBackdrop(elapsed);
  drawCorridor(elapsed);
  drawMeetingStageLighting(elapsed);
  drawMeetingReadinessPanel(elapsed);
  drawMeetingDiscussionBoard(elapsed);
  drawMeetingTurnTimeline(elapsed);
  drawMeetingDirectorRail(elapsed);
  drawMeetingSpeakerWheel(elapsed);
  sharedZones.forEach((zone) => drawSharedZone(zone, elapsed));
  officeProps.forEach((prop, index) => drawOfficeProp(prop, elapsed, index));
  departments.forEach((department) => drawDepartment(department, elapsed));
  drawNavigationFocusImmersion(elapsed);
  drawAreaTransitionPulse(navigationFocusTransition, elapsed, {
    strokeBoost: 1.15,
    fillBoost: 1.05,
    labelPrefix: "聚焦切换",
  });
  drawAreaTransitionPulse(activeAreaTransition, elapsed, {
    strokeBoost: 0.88,
    fillBoost: 0.78,
    labelPrefix: "进入",
  });
  drawMeetingConversationLinks(elapsed);
  drawGoalRelayPath(elapsed);
  drawPromptTargetPath(elapsed);
  drawGroundInteractionHighlights(elapsed);
  [...areaGuides].sort((left, right) => left.position.y - right.position.y).forEach((guide) => drawAreaGuide(guide, elapsed));
  drawPlayer(elapsed);
  drawOfficePropForegroundOverlays(elapsed);
  drawDepartmentOutcomeFeedOverlay(elapsed);
  drawGoalRelayOverlay(elapsed);
  drawMeetingStageCueOverlay(elapsed);
  drawDepartmentMilestoneOverlay(elapsed);
  drawFocusArrivalCinematic(elapsed);
  drawScreenEffects();

  sceneContext.clearRect(0, 0, canvas.width, canvas.height);
  sceneContext.imageSmoothingEnabled = false;

  const transform = getSurfaceDrawTransform();
  const overlayRects: Rect[] = [];
  const drawWidth = surface.width * transform.scale;
  const drawHeight = surface.height * transform.scale;

  sceneContext.drawImage(surface, transform.drawLeft, transform.drawTop, drawWidth, drawHeight);
  drawHdCorridorHeadings(transform);
  drawHdCommandBoard(transform);
  drawAreaGuideBubbleOverlays(transform, overlayRects);
  drawTerminalBubbleOverlays(transform, overlayRects);
  drawNpcBubbleOverlays(transform, overlayRects);
  drawOffscreenInteractionIndicators(transform, overlayRects);
  drawSceneLabelOverlays(transform, overlayRects);
}

function renderMinimap(elapsed: number): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = minimap.width / dpr;
  const height = minimap.height / dpr;
  const padding = 16;
  const showTaskPrompts = shouldShowTaskPrompts();
  const promptTarget = getUiNavigationTarget();
  const promptTargetDepartment = getUiPromptTargetDepartment();
  const promptTargetSharedZone = getUiPromptTargetSharedZone();
  const topDepartment = getTopActiveDepartment();
  const topSharedZone = getTopSharedZone();
  const isRecommendedTarget = showTaskPrompts && isRecommendedNavigationTarget(promptTarget);
  const promptTargetTitle = promptTarget ? shortenIndicatorTitle(getInteractionTargetIndicatorTitle(promptTarget), 10) : "";
  const promptTargetAccent = promptTarget ? getInteractionTargetIndicatorAccent(promptTarget) : "#7d8db3";
  const followUpTarget = getUiNavigationFollowUpTarget();
  const followUpTitle = followUpTarget ? shortenIndicatorTitle(getInteractionTargetIndicatorTitle(followUpTarget), 8) : "";
  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  const meetingSummary = getMeetingDiscussionSummary();
  const completedDepartmentCount = getCompletedDepartmentCount();
  const strategicDepartment = getUiStrategicDepartmentCandidate();
  const latestOutcome = getLatestDepartmentOutcomeRecord();
  const fallbackPhaseTarget: InteractionTarget = promptTarget ?? followUpTarget ?? { type: "podium", value: centralMeetingPodium };
  minimapHits.length = 0;

  minimapContext.setTransform(1, 0, 0, 1, 0, 0);
  minimapContext.clearRect(0, 0, minimap.width, minimap.height);
  minimapContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  minimapContext.fillStyle = "#1b2037";
  minimapContext.fillRect(0, 0, width, height);
  minimapContext.fillStyle = "#6f7b65";
  minimapContext.fillRect(3, 3, width - 6, height - 6);

  const minX = officeRect.left;
  const maxX = officeRect.left + officeRect.width;
  const minY = officeRect.top;
  const maxY = officeRect.top + officeRect.height;
  const worldWidth = maxX - minX;
  const worldHeight = maxY - minY;

  const project = (x: number, y: number): Point => ({
    x: padding + ((x - minX) / worldWidth) * (width - padding * 2),
    y: padding + ((y - minY) / worldHeight) * (height - padding * 2),
  });
  const drawMinimapTargetStepBadge = (point: Point, label: string, accent: string): void => {
    minimapContext.fillStyle = withAlpha("#09111d", 0.9);
    minimapContext.fillRect(point.x - 6, point.y - 6, 12, 12);
    minimapContext.strokeStyle = withAlpha(accent, 0.8);
    minimapContext.lineWidth = 1;
    minimapContext.strokeRect(point.x - 5.5, point.y - 5.5, 11, 11);
    minimapContext.fillStyle = "#f7fbff";
    minimapContext.font = 'bold 7px Monaco, "Courier New", monospace';
    minimapContext.textAlign = "center";
    minimapContext.textBaseline = "middle";
    minimapContext.fillText(label, point.x, point.y + 0.5);
  };
  const drawMinimapAreaTransition = (state: AreaTransitionState, labelPrefix: string): void => {
    if (state.pulse <= 0.02) {
      return;
    }
    const areaRect = getAreaRectByKey(state.areaKey);
    if (!areaRect) {
      return;
    }

    const topLeft = project(areaRect.left, areaRect.top);
    const bottomRight = project(areaRect.left + areaRect.width, areaRect.top + areaRect.height);
    const pulse = clamp(state.pulse, 0, 1);
    const expand = 3 + (1 - pulse) * 5;
    minimapContext.strokeStyle = withAlpha(state.accent, 0.16 + pulse * 0.42);
    minimapContext.lineWidth = 1.5;
    minimapContext.strokeRect(
      topLeft.x - expand,
      topLeft.y - expand,
      bottomRight.x - topLeft.x + expand * 2,
      bottomRight.y - topLeft.y + expand * 2
    );
    if (pulse <= 0.12) {
      return;
    }

    const label = translateRuntimeCopy(`${labelPrefix} ${trimSpeechSegment(state.label, 6)}`);
    const labelWidth = Math.max(34, label.length * 4.4);
    const labelLeft = clamp(topLeft.x, padding, width - padding - labelWidth);
    const labelTop = clamp(topLeft.y - 10, padding + 22, height - 18);
    minimapContext.fillStyle = withAlpha("#09111d", 0.88);
    minimapContext.fillRect(labelLeft, labelTop, labelWidth, 8);
    minimapContext.strokeStyle = withAlpha(state.accent, 0.76);
    minimapContext.lineWidth = 1;
    minimapContext.strokeRect(labelLeft + 0.5, labelTop + 0.5, labelWidth - 1, 7);
    minimapContext.fillStyle = "#f7fbff";
    minimapContext.font = '500 5px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    minimapContext.textAlign = "center";
    minimapContext.textBaseline = "middle";
    minimapContext.fillText(label, labelLeft + labelWidth / 2, labelTop + 4.5);
  };
  const playerPoint = project(player.x, player.y);

  const corridorTopLeft = project(corridorRect.left, corridorRect.top);
  const corridorBottomRight = project(
    corridorRect.left + corridorRect.width,
    corridorRect.top + corridorRect.height
  );
  minimapContext.fillStyle = "#c7ba99";
  minimapContext.fillRect(
    corridorTopLeft.x,
    corridorTopLeft.y,
    corridorBottomRight.x - corridorTopLeft.x,
    corridorBottomRight.y - corridorTopLeft.y
  );
  const drawMiniZone = (rect: Rect, fill: string, label: string): void => {
    const topLeft = project(rect.left, rect.top);
    const bottomRight = project(rect.left + rect.width, rect.top + rect.height);
    const zoneWidth = bottomRight.x - topLeft.x;
    const zoneHeight = bottomRight.y - topLeft.y;

    minimapContext.fillStyle = fill;
    minimapContext.fillRect(topLeft.x, topLeft.y, zoneWidth, zoneHeight);
    minimapContext.strokeStyle = "rgba(255,255,255,0.22)";
    minimapContext.lineWidth = 1;
    minimapContext.strokeRect(topLeft.x + 0.5, topLeft.y + 0.5, zoneWidth - 1, zoneHeight - 1);

    if (zoneWidth > 24) {
      minimapContext.fillStyle = "rgba(255,255,255,0.58)";
      minimapContext.font = '600 7px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
      minimapContext.textAlign = "center";
      minimapContext.textBaseline = "middle";
      minimapContext.fillText(label, topLeft.x + zoneWidth / 2, topLeft.y + zoneHeight / 2);
    }
  };
  drawMiniZone(resourceHubRect, "rgba(109, 133, 174, 0.52)", "TOOLS");
  drawMiniZone(centralLoungeRect, "rgba(166, 130, 109, 0.46)", "MEET");
  drawMiniZone(refreshHubRect, "rgba(163, 130, 102, 0.48)", "CAFE");
  departmentConcourseRects.forEach((rect) => {
    const topLeft = project(rect.left, rect.top);
    const bottomRight = project(rect.left + rect.width, rect.top + rect.height);
    minimapContext.fillStyle = "#dce2eb";
    minimapContext.fillRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
    minimapContext.strokeStyle = "rgba(108, 123, 150, 0.86)";
    minimapContext.lineWidth = 1;
    minimapContext.strokeRect(
      topLeft.x + 0.5,
      topLeft.y + 0.5,
      bottomRight.x - topLeft.x - 1,
      bottomRight.y - topLeft.y - 1
    );
  });
  minimapContext.fillStyle = promptTarget ? withAlpha(promptTargetAccent, 0.34) : "#7d8db3";
  minimapContext.fillRect(padding, padding, width - padding * 2, 22);
  minimapContext.strokeStyle = promptTarget ? withAlpha("#f7fbff", 0.68) : "rgba(255,255,255,0.26)";
  minimapContext.lineWidth = 1;
  minimapContext.strokeRect(padding + 0.5, padding + 0.5, width - padding * 2 - 1, 21);
  minimapContext.fillStyle = "#f6f7ff";
  minimapContext.font = '600 8px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  minimapContext.textAlign = "center";
  minimapContext.textBaseline = "middle";
  minimapContext.fillText(
    translateRuntimeCopy(
      !showTaskPrompts
        ? pickUiText("办公室总览", "Office Overview")
      : departmentMilestoneState.pulse > 0.08
        ? `${shortenIndicatorTitle(departmentMilestoneState.title, 10)}`
      : goalRelayState.pulse > 0.08 && goalRelayState.toTarget
        ? `目标接管 ${shortenIndicatorTitle(getInteractionTargetIndicatorTitle(goalRelayState.toTarget), 10)}`
      : meetingState.active && meetingStageCueState.pulse > 0.08
        ? `会议切镜 ${shortenIndicatorTitle(meetingStageCueState.title, 8)}`
      : promptTarget
        ? `${isRecommendedTarget ? "推荐目标" : "附近目标"} ${promptTargetTitle}${followUpTarget ? ` → ${followUpTitle}` : ""}`
        : "交互导航图"
    ),
    width / 2,
    padding + 8
  );
  const phaseBadge = meetingState.active
    ? `R${String(Math.max(1, meetingSummary.round)).padStart(2, "0")} ${meetingSummary.stageCode}`
    : !showTaskPrompts
      ? ""
    : departmentMilestoneState.pulse > 0.08
      ? "DONE"
    : goalRelayState.pulse > 0.08 && goalRelayState.toTarget
      ? "HANDOFF"
    : focusArrivalTransition.pulse > 0.08
      ? "LOCKED"
    : followUpTarget
      ? "CHAIN 2"
      : "";
  if (phaseBadge) {
    const badgeWidth = Math.max(34, phaseBadge.length * 4.8);
    const badgeLeft = width - padding - badgeWidth - 4;
    const badgeTop = padding + 11;
    const badgeAccent = meetingState.active
      ? meetingSummary.accent
      : departmentMilestoneState.pulse > 0.08
        ? departmentMilestoneState.accent
      : goalRelayState.pulse > 0.08 && goalRelayState.toTarget
        ? goalRelayState.toAccent
      : focusArrivalTransition.pulse > 0.08
        ? focusArrivalTransition.accent
        : getInteractionTargetIndicatorAccent(fallbackPhaseTarget);
    minimapContext.fillStyle = withAlpha("#09111d", 0.82);
    minimapContext.fillRect(badgeLeft, badgeTop, badgeWidth, 7);
    minimapContext.strokeStyle = withAlpha(badgeAccent, 0.8);
    minimapContext.lineWidth = 1;
    minimapContext.strokeRect(badgeLeft + 0.5, badgeTop + 0.5, badgeWidth - 1, 6);
    minimapContext.fillStyle = "#f7fbff";
    minimapContext.font = 'bold 5px Monaco, "Courier New", monospace';
    minimapContext.textAlign = "center";
    minimapContext.fillText(phaseBadge, badgeLeft + badgeWidth / 2, badgeTop + 3.7);
  }
  minimapContext.fillStyle = "rgba(255,255,255,0.68)";
  minimapContext.font = '500 5px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  minimapContext.textAlign = "left";
  minimapContext.fillText(
    translateRuntimeCopy(`闭环 ${completedDepartmentCount}/${departments.length}`),
    padding + 4,
    padding + 17.5
  );
  if (latestOutcome) {
    minimapContext.fillStyle = withAlpha(latestOutcome.accent, 0.86);
    minimapContext.textAlign = "right";
    minimapContext.fillText(
      translateRuntimeCopy(`${latestOutcome.title} +${latestOutcome.impactScore}`),
      width - padding - 6,
      padding + 17.5
    );
  }
  if (strategicDepartment) {
    minimapContext.fillStyle = withAlpha(strategicDepartment.accent, 0.86);
    minimapContext.textAlign = "center";
    minimapContext.fillText(
      translateRuntimeCopy(`冲刺 ${strategicDepartment.shortName} · ${trimSpeechSegment(getDepartmentPendingWorkSummary(strategicDepartment), 10)}`),
      width / 2,
      padding + 28
    );
  }

  const viewportHalfWidth = surface.width / camera.zoom / 2;
  const viewportHalfHeight = surface.height / camera.zoom / 2;
  const viewportTopLeft = project(camera.x - viewportHalfWidth, camera.y - viewportHalfHeight);
  const viewportBottomRight = project(camera.x + viewportHalfWidth, camera.y + viewportHalfHeight);
  minimapContext.fillStyle = "rgba(255,255,255,0.03)";
  minimapContext.fillRect(
    viewportTopLeft.x,
    viewportTopLeft.y,
    viewportBottomRight.x - viewportTopLeft.x,
    viewportBottomRight.y - viewportTopLeft.y
  );
  minimapContext.strokeStyle = promptTarget ? withAlpha(promptTargetAccent, 0.52) : "rgba(255,255,255,0.24)";
  minimapContext.lineWidth = 1;
  minimapContext.strokeRect(
    viewportTopLeft.x + 0.5,
    viewportTopLeft.y + 0.5,
    viewportBottomRight.x - viewportTopLeft.x - 1,
    viewportBottomRight.y - viewportTopLeft.y - 1
  );

  sharedZones.forEach((zone) => {
    const topLeft = project(zone.roomRect.left, zone.roomRect.top);
    const bottomRight = project(zone.roomRect.left + zone.roomRect.width, zone.roomRect.top + zone.roomRect.height);
    const rectWidth = bottomRight.x - topLeft.x;
    const rectHeight = bottomRight.y - topLeft.y;
    const active = zone.id === activeSharedZoneId;
    const focused = promptTargetSharedZone?.id === zone.id;
    const occupancyRatio = getSharedZoneOccupancyRatio(zone);
    const hotspot = topSharedZone?.id === zone.id;

    minimapContext.fillStyle = withAlpha(
      zone.accent,
      focused ? 0.54 : active ? 0.46 : hotspot ? 0.38 : 0.24 + occupancyRatio * 0.14
    );
    minimapContext.fillRect(topLeft.x, topLeft.y, rectWidth, rectHeight);
    minimapContext.strokeStyle = focused ? "#f7fbff" : active ? "#f7fbff" : withAlpha(zone.accent, 0.72);
    minimapContext.lineWidth = focused ? 2 : 1.5;
    minimapContext.strokeRect(topLeft.x + 1, topLeft.y + 1, rectWidth - 2, rectHeight - 2);
    if (focused) {
      minimapContext.strokeStyle = withAlpha(zone.accent, 0.82);
      minimapContext.lineWidth = 1;
      minimapContext.strokeRect(topLeft.x - 2.5, topLeft.y - 2.5, rectWidth + 5, rectHeight + 5);
    }

    if (rectWidth > 34) {
      minimapContext.fillStyle = "rgba(9, 11, 18, 0.42)";
      minimapContext.fillRect(topLeft.x + 4, topLeft.y + rectHeight / 2 - 6, rectWidth - 8, 12);
      minimapContext.fillStyle = "#f6f7ff";
      minimapContext.font = '600 8px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
      minimapContext.textAlign = "center";
      minimapContext.textBaseline = "middle";
      minimapContext.fillText(zone.label, topLeft.x + rectWidth / 2, topLeft.y + rectHeight / 2);
    }

    const activityBarLeft = topLeft.x + 3;
    const activityBarTop = topLeft.y + rectHeight - 5;
    const activityBarWidth = Math.max(8, rectWidth - 6);
    minimapContext.fillStyle = "rgba(9, 11, 18, 0.42)";
    minimapContext.fillRect(activityBarLeft, activityBarTop, activityBarWidth, 2);
    minimapContext.fillStyle = withAlpha(zone.accent, 0.92);
    minimapContext.fillRect(
      activityBarLeft,
      activityBarTop,
      Math.max(3, activityBarWidth * Math.max(0.16, occupancyRatio)),
      2
    );
  });

  if (meetingState.active) {
    const loungeTopLeft = project(centralLoungeRect.left, centralLoungeRect.top);
    const loungeBottomRight = project(
      centralLoungeRect.left + centralLoungeRect.width,
      centralLoungeRect.top + centralLoungeRect.height
    );
    const loungeWidth = loungeBottomRight.x - loungeTopLeft.x;
    const seatRatio = getMeetingSeatedCount() / Math.max(1, npcs.length);
    minimapContext.strokeStyle = withAlpha("#f4cf7d", 0.92);
    minimapContext.lineWidth = 1.5;
    minimapContext.strokeRect(
      loungeTopLeft.x + 1,
      loungeTopLeft.y + 1,
      loungeWidth - 2,
      loungeBottomRight.y - loungeTopLeft.y - 2
    );
    minimapContext.fillStyle = "rgba(9, 11, 18, 0.42)";
    minimapContext.fillRect(loungeTopLeft.x + 4, loungeTopLeft.y + 4, loungeWidth - 8, 3);
    minimapContext.fillStyle = withAlpha("#f4cf7d", 0.92);
    minimapContext.fillRect(loungeTopLeft.x + 4, loungeTopLeft.y + 4, Math.max(8, (loungeWidth - 8) * Math.max(0.16, seatRatio)), 3);
    const timelineEntries = getRecentMeetingTimeline(3).slice().reverse();
    if (timelineEntries.length > 0) {
      const slotWidth = Math.max(8, (loungeWidth - 10) / timelineEntries.length);
      timelineEntries.forEach((entry, index) => {
        const slotLeft = loungeTopLeft.x + 4 + index * slotWidth;
        const slotTop = loungeBottomRight.y - 7;
        minimapContext.fillStyle = withAlpha("#09111d", 0.72);
        minimapContext.fillRect(slotLeft, slotTop, Math.max(7, slotWidth - 2), 4);
        minimapContext.fillStyle = withAlpha(entry.accent, 0.9);
        minimapContext.fillRect(slotLeft + 1, slotTop + 1, Math.max(5, slotWidth - 4), 2);
      });
    }
  }

  departments.forEach((department) => {
    const topLeft = project(department.roomRect.left, department.roomRect.top);
    const bottomRight = project(
      department.roomRect.left + department.roomRect.width,
      department.roomRect.top + department.roomRect.height
    );
    const active = department.id === activeDepartmentId;
    const focused = promptTargetDepartment?.id === department.id;
    const occupancyRatio = getDepartmentOccupancyRatio(department);
    const stateAccent = getDepartmentStateAccent(getDepartmentVisualState(department));
    const rectWidth = bottomRight.x - topLeft.x;
    const rectHeight = bottomRight.y - topLeft.y;

    minimapContext.fillStyle = withAlpha(department.accent, focused ? 0.8 : active ? 0.72 : 0.36);
    minimapContext.fillRect(topLeft.x, topLeft.y, rectWidth, rectHeight);
    minimapContext.strokeStyle = focused ? "#f7fbff" : active ? "#f7fbff" : withAlpha("#8eb6ff", 0.4);
    minimapContext.lineWidth = focused ? 2.5 : 2;
    minimapContext.strokeRect(topLeft.x + 1, topLeft.y + 1, rectWidth - 2, rectHeight - 2);
    if (focused) {
      minimapContext.strokeStyle = withAlpha(department.accent, 0.9);
      minimapContext.lineWidth = 1;
      minimapContext.strokeRect(topLeft.x - 2.5, topLeft.y - 2.5, rectWidth + 5, rectHeight + 5);
    }

    minimapContext.fillStyle = "rgba(9, 11, 18, 0.36)";
    minimapContext.fillRect(topLeft.x + 4, topLeft.y + rectHeight / 2 - 6, rectWidth - 8, 12);
    minimapContext.fillStyle = "#f6f7ff";
    minimapContext.font = rectWidth > 26
      ? '600 9px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
      : '600 7px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
    minimapContext.textAlign = "center";
    minimapContext.textBaseline = "middle";
    const minimapLabel = rectWidth > 24
      ? department.shortName
      : Array.from(department.shortName).slice(0, 2).join("");
    minimapContext.fillText(
      minimapLabel,
      topLeft.x + rectWidth / 2,
      topLeft.y + rectHeight / 2
    );

    if (isDepartmentFullyCompleted(department)) {
      const stampWidth = Math.max(10, Math.min(18, rectWidth - 4));
      minimapContext.fillStyle = withAlpha("#0b121e", 0.82);
      minimapContext.fillRect(topLeft.x + 2, topLeft.y + 2, stampWidth, 6);
      minimapContext.strokeStyle = withAlpha("#8be08c", 0.86);
      minimapContext.lineWidth = 1;
      minimapContext.strokeRect(topLeft.x + 2.5, topLeft.y + 2.5, stampWidth - 1, 5);
      minimapContext.fillStyle = "#f7fbff";
      minimapContext.font = 'bold 4px Monaco, "Courier New", monospace';
      minimapContext.textAlign = "center";
      minimapContext.fillText("OK", topLeft.x + 2 + stampWidth / 2, topLeft.y + 5.3);
    }

    const activityBarLeft = topLeft.x + 3;
    const activityBarTop = topLeft.y + rectHeight - 5;
    const activityBarWidth = Math.max(8, rectWidth - 6);
    minimapContext.fillStyle = "rgba(9, 11, 18, 0.42)";
    minimapContext.fillRect(activityBarLeft, activityBarTop, activityBarWidth, 2);
    minimapContext.fillStyle = withAlpha(stateAccent, 0.92);
    minimapContext.fillRect(
      activityBarLeft,
      activityBarTop,
      Math.max(3, activityBarWidth * Math.max(0.16, occupancyRatio)),
      2
    );

    minimapHits.push({
      department,
      x: topLeft.x,
      y: topLeft.y,
      width: rectWidth,
      height: rectHeight,
    });
  });

  if (departmentMilestoneState.pulse > 0.08) {
    const department = departments.find((item) => item.id === departmentMilestoneState.departmentId) ?? null;
    if (department) {
      const topLeft = project(department.roomRect.left, department.roomRect.top);
      const bottomRight = project(
        department.roomRect.left + department.roomRect.width,
        department.roomRect.top + department.roomRect.height
      );
      const pulse = clamp(departmentMilestoneState.pulse, 0, 1);
      minimapContext.strokeStyle = withAlpha(departmentMilestoneState.accent, 0.34 + pulse * 0.28);
      minimapContext.lineWidth = 2;
      minimapContext.strokeRect(
        topLeft.x - 4,
        topLeft.y - 4,
        bottomRight.x - topLeft.x + 8,
        bottomRight.y - topLeft.y + 8
      );
    }
  }

  if (strategicDepartment && !isDepartmentFullyCompleted(strategicDepartment)) {
    const topLeft = project(strategicDepartment.roomRect.left, strategicDepartment.roomRect.top);
    const bottomRight = project(
      strategicDepartment.roomRect.left + strategicDepartment.roomRect.width,
      strategicDepartment.roomRect.top + strategicDepartment.roomRect.height
    );
    const backlogRatio = getDepartmentBacklogRatio(strategicDepartment);
    const pulse = 0.5 + Math.sin(elapsed * 4) * 0.5;
    minimapContext.strokeStyle = withAlpha(strategicDepartment.accent, 0.46 + pulse * 0.22);
    minimapContext.lineWidth = 2;
    minimapContext.strokeRect(
      topLeft.x - 6,
      topLeft.y - 6,
      bottomRight.x - topLeft.x + 12,
      bottomRight.y - topLeft.y + 12
    );
    minimapContext.fillStyle = withAlpha("#09111d", 0.82);
    minimapContext.fillRect(topLeft.x + 2, bottomRight.y + 3, Math.max(20, bottomRight.x - topLeft.x - 4), 7);
    minimapContext.fillStyle = withAlpha(strategicDepartment.accent, 0.92);
    minimapContext.fillRect(
      topLeft.x + 3,
      bottomRight.y + 5,
      Math.max(8, (Math.max(20, bottomRight.x - topLeft.x - 6)) * backlogRatio),
      3
    );
    minimapContext.fillStyle = "#f7fbff";
    minimapContext.font = 'bold 4px Monaco, "Courier New", monospace';
    minimapContext.textAlign = "center";
    minimapContext.textBaseline = "middle";
    minimapContext.fillText(
      translateRuntimeCopy(`S ${trimSpeechSegment(getDepartmentPendingWorkSummary(strategicDepartment), 8)}`),
      topLeft.x + (bottomRight.x - topLeft.x) / 2,
      bottomRight.y + 6.5
    );
  }

  if (topDepartment) {
    const topLeft = project(topDepartment.roomRect.left, topDepartment.roomRect.top);
    const bottomRight = project(
      topDepartment.roomRect.left + topDepartment.roomRect.width,
      topDepartment.roomRect.top + topDepartment.roomRect.height
    );
    const pulse = 0.5 + Math.sin(elapsed * 3.6) * 0.5;
    minimapContext.strokeStyle = withAlpha(topDepartment.accent, 0.46 + pulse * 0.24);
    minimapContext.lineWidth = 2;
    minimapContext.strokeRect(
      topLeft.x - 4,
      topLeft.y - 4,
      bottomRight.x - topLeft.x + 8,
      bottomRight.y - topLeft.y + 8
    );
  }

  if (topSharedZone) {
    const topLeft = project(topSharedZone.roomRect.left, topSharedZone.roomRect.top);
    const bottomRight = project(
      topSharedZone.roomRect.left + topSharedZone.roomRect.width,
      topSharedZone.roomRect.top + topSharedZone.roomRect.height
    );
    const pulse = 0.5 + Math.sin(elapsed * 3.2 + 1.3) * 0.5;
    minimapContext.strokeStyle = withAlpha(topSharedZone.accent, 0.38 + pulse * 0.22);
    minimapContext.lineWidth = 2;
    minimapContext.strokeRect(
      topLeft.x - 4,
      topLeft.y - 4,
      bottomRight.x - topLeft.x + 8,
      bottomRight.y - topLeft.y + 8
    );
  }

  drawMinimapAreaTransition(navigationFocusTransition, pickUiText("切换", "Focus"));
  drawMinimapAreaTransition(activeAreaTransition, pickUiText("进入", "Enter"));

  if (showTaskPrompts && goalRelayState.pulse > 0.08 && goalRelayState.fromTarget && goalRelayState.toTarget) {
    const fromPoint = project(
      getInteractionTargetPosition(goalRelayState.fromTarget).x,
      getInteractionTargetPosition(goalRelayState.fromTarget).y
    );
    const toPoint = project(
      getInteractionTargetPosition(goalRelayState.toTarget).x,
      getInteractionTargetPosition(goalRelayState.toTarget).y
    );
    minimapContext.save();
    minimapContext.strokeStyle = withAlpha(goalRelayState.toAccent, 0.54);
    minimapContext.lineWidth = 1.2;
    minimapContext.setLineDash([4, 3]);
    minimapContext.lineDashOffset = -elapsed * 20;
    minimapContext.beginPath();
    minimapContext.moveTo(fromPoint.x, fromPoint.y);
    minimapContext.lineTo(toPoint.x, toPoint.y);
    minimapContext.stroke();
    minimapContext.restore();
    drawMinimapTargetStepBadge(fromPoint, "X", goalRelayState.fromAccent);
    drawMinimapTargetStepBadge(toPoint, "N", goalRelayState.toAccent);
  }

  if (showTaskPrompts && promptTarget) {
    const promptTargetPoint = project(
      getInteractionTargetPosition(promptTarget).x,
      getInteractionTargetPosition(promptTarget).y
    );
    minimapContext.save();
    minimapContext.strokeStyle = withAlpha(promptTargetAccent, 0.62);
    minimapContext.lineWidth = 1.5;
    minimapContext.setLineDash([5, 4]);
    minimapContext.lineDashOffset = -elapsed * 18;
    minimapContext.beginPath();
    minimapContext.moveTo(playerPoint.x, playerPoint.y);
    minimapContext.lineTo(promptTargetPoint.x, promptTargetPoint.y);
    minimapContext.stroke();
    minimapContext.restore();

    minimapContext.fillStyle = withAlpha(promptTargetAccent, 0.22);
    minimapContext.beginPath();
    minimapContext.arc(promptTargetPoint.x, promptTargetPoint.y, 8, 0, Math.PI * 2);
    minimapContext.fill();
    drawMinimapTargetStepBadge(promptTargetPoint, "1", promptTargetAccent);

    if (followUpTarget) {
      const followUpPoint = project(
        getInteractionTargetPosition(followUpTarget).x,
        getInteractionTargetPosition(followUpTarget).y
      );
      minimapContext.save();
      minimapContext.strokeStyle = withAlpha(getInteractionTargetIndicatorAccent(followUpTarget), 0.44);
      minimapContext.lineWidth = 1;
      minimapContext.setLineDash([3, 3]);
      minimapContext.lineDashOffset = -elapsed * 14;
      minimapContext.beginPath();
      minimapContext.moveTo(promptTargetPoint.x, promptTargetPoint.y);
      minimapContext.lineTo(followUpPoint.x, followUpPoint.y);
      minimapContext.stroke();
      minimapContext.restore();

      minimapContext.fillStyle = withAlpha(getInteractionTargetIndicatorAccent(followUpTarget), 0.18);
      minimapContext.beginPath();
      minimapContext.arc(followUpPoint.x, followUpPoint.y, 5, 0, Math.PI * 2);
      minimapContext.fill();
      drawMinimapTargetStepBadge(followUpPoint, "2", getInteractionTargetIndicatorAccent(followUpTarget));
    }
  }

  if (currentSpeaker) {
    const speakerPoint = project(currentSpeaker.x, currentSpeaker.y);
    const pulse = 0.5 + Math.sin(elapsed * 4.2) * 0.5;
    minimapContext.fillStyle = withAlpha("#f4cf7d", 0.28 + pulse * 0.16);
    minimapContext.beginPath();
    minimapContext.arc(speakerPoint.x, speakerPoint.y, 6 + pulse * 2, 0, Math.PI * 2);
    minimapContext.fill();
    minimapContext.fillStyle = "#fff7d6";
    minimapContext.fillRect(speakerPoint.x - 1, speakerPoint.y - 4, 2, 8);
    minimapContext.fillRect(speakerPoint.x - 4, speakerPoint.y - 1, 8, 2);
  }

  if (pendingQuestioner && pendingResponder) {
    const questionPoint = project(pendingQuestioner.x, pendingQuestioner.y);
    const responderPoint = project(pendingResponder.x, pendingResponder.y);
    minimapContext.save();
    minimapContext.strokeStyle = withAlpha("#f4cf7d", 0.62);
    minimapContext.lineWidth = 1.2;
    minimapContext.setLineDash([3, 2]);
    minimapContext.lineDashOffset = -elapsed * 18;
    minimapContext.beginPath();
    minimapContext.moveTo(questionPoint.x, questionPoint.y);
    minimapContext.lineTo(responderPoint.x, responderPoint.y);
    minimapContext.stroke();
    minimapContext.restore();

    minimapContext.fillStyle = withAlpha("#fff7d6", 0.8);
    minimapContext.fillRect(responderPoint.x - 2, responderPoint.y - 2, 4, 4);
  }

  if (meetingState.active) {
    getMeetingSpeakerCandidates(3).forEach((candidate, index) => {
      const candidatePoint = project(candidate.x, candidate.y);
      const pulse = 0.5 + Math.sin(elapsed * 4.1 + index * 0.7 + candidate.x * 0.02) * 0.5;
      minimapContext.strokeStyle = withAlpha(candidate.department.accent, 0.42 + pulse * 0.18);
      minimapContext.lineWidth = 1.1;
      minimapContext.beginPath();
      minimapContext.arc(candidatePoint.x, candidatePoint.y, 5 + pulse, 0, Math.PI * 2);
      minimapContext.stroke();
      drawMinimapTargetStepBadge(candidatePoint, String(index + 1), candidate.department.accent);
    });
  }

  const minimapMarkers = collectMinimapInteractionMarkers();
  minimapMarkers.forEach((marker, index) => {
    const position = getInteractionTargetPosition(marker.target);
    const basePoint = project(position.x, position.y);
    const offset = marker.target.type === "guide"
      ? { x: -3, y: -3 }
      : marker.target.type === "terminal"
        ? { x: 3, y: -2 }
        : marker.target.type === "insight"
          ? { x: 0, y: 4 }
          : { x: 0, y: 0 };
    const x = basePoint.x + offset.x;
    const y = basePoint.y + offset.y;
    const pulse = 0.5 + Math.sin(elapsed * 4 + index * 0.9 + position.x * 0.02 + position.y * 0.03) * 0.5;
    const glowRadius = marker.highlighted ? 7 + pulse * 2 : 4 + pulse * 1.5;

    minimapContext.fillStyle = withAlpha(marker.accent, marker.highlighted ? 0.28 + pulse * 0.18 : 0.14 + pulse * 0.08);
    minimapContext.beginPath();
    minimapContext.arc(x, y, glowRadius, 0, Math.PI * 2);
    minimapContext.fill();

    if (marker.highlighted) {
      minimapContext.strokeStyle = withAlpha("#f7fbff", 0.92);
      minimapContext.lineWidth = 1.5;
      minimapContext.beginPath();
      minimapContext.arc(x, y, glowRadius + 1.5, 0, Math.PI * 2);
      minimapContext.stroke();
    }

    minimapContext.save();
    minimapContext.translate(x, y);
    minimapContext.fillStyle = marker.accent;
    minimapContext.strokeStyle = marker.highlighted ? "#f7fbff" : "rgba(9,11,18,0.72)";
    minimapContext.lineWidth = 1;

    switch (marker.target.type) {
      case "podium":
        minimapContext.beginPath();
        minimapContext.moveTo(0, -4);
        minimapContext.lineTo(4, 4);
        minimapContext.lineTo(-4, 4);
        minimapContext.closePath();
        minimapContext.fill();
        minimapContext.stroke();
        break;
      case "guide":
        minimapContext.fillRect(-3, -3, 6, 6);
        minimapContext.strokeRect(-3.5, -3.5, 7, 7);
        break;
      case "terminal":
        minimapContext.fillRect(-4, -2, 8, 4);
        minimapContext.strokeRect(-4.5, -2.5, 9, 5);
        minimapContext.fillStyle = marker.highlighted ? "#f7fbff" : withAlpha("#f7fbff", 0.74);
        minimapContext.fillRect(-1, -1, 2, 2);
        break;
      case "insight":
        minimapContext.rotate(Math.PI / 4);
        minimapContext.fillRect(-3, -3, 6, 6);
        minimapContext.strokeRect(-3.5, -3.5, 7, 7);
        break;
    }

    minimapContext.restore();
  });

  minimapContext.save();
  minimapContext.translate(playerPoint.x, playerPoint.y);
  minimapContext.rotate(player.facing + Math.PI / 2);
  minimapContext.fillStyle = "#ffffff";
  minimapContext.beginPath();
  minimapContext.moveTo(0, -8);
  minimapContext.lineTo(6, 6);
  minimapContext.lineTo(0, 2);
  minimapContext.lineTo(-6, 6);
  minimapContext.closePath();
  minimapContext.fill();
  minimapContext.restore();

  minimapContext.fillStyle = "rgba(255,255,255,0.6)";
  minimapContext.font = '600 9px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  minimapContext.textAlign = "left";
  minimapContext.fillText(pickUiText("Agent Office", "Agent Office"), padding, height - 10);
  minimapContext.textAlign = "right";
  minimapContext.fillText(
    translateRuntimeCopy(
      activeDepartmentId
        ? departments.find((department) => department.id === activeDepartmentId)?.shortName ?? "公共区"
        : sharedZones.find((zone) => zone.id === activeSharedZoneId)?.label ?? "公共区"
    ),
    width - padding,
    height - 10
  );
}

function isWorldPointWithinViewport(point: Point, marginPixels = 0): boolean {
  const margin = marginPixels / Math.max(camera.zoom, 0.001);
  const halfWidth = surface.width / camera.zoom / 2 - margin;
  const halfHeight = surface.height / camera.zoom / 2 - margin;
  return (
    point.x >= camera.x - halfWidth &&
    point.x <= camera.x + halfWidth &&
    point.y >= camera.y - halfHeight &&
    point.y <= camera.y + halfHeight
  );
}

function getNavigationCameraBias(target: InteractionTarget | null): Point {
  const focusCenter = getNavigationFocusCenter(target);
  if (!focusCenter) {
    return { x: 0, y: 0 };
  }

  const deltaX = focusCenter.x - player.x;
  const deltaY = focusCenter.y - player.y;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance <= CAMERA_NAVIGATION_BIAS_NEAR_DISTANCE) {
    return { x: 0, y: 0 };
  }

  const direction = {
    x: deltaX / distance,
    y: deltaY / distance,
  };
  const distanceRatio = clamp(
    (distance - CAMERA_NAVIGATION_BIAS_NEAR_DISTANCE) /
      (CAMERA_NAVIGATION_BIAS_FAR_DISTANCE - CAMERA_NAVIGATION_BIAS_NEAR_DISTANCE),
    0,
    1
  );
  const onScreen = isWorldPointWithinViewport(focusCenter, 28);
  const visibilityBoost = onScreen ? 0.58 : 1;
  const recommendationBoost = isRecommendedNavigationTarget(target) ? 0.14 : 0;
  const baseBiasDistance = (
    isCompactViewport()
      ? CAMERA_NAVIGATION_BIAS_PIXELS_MOBILE
      : CAMERA_NAVIGATION_BIAS_PIXELS_DESKTOP
  ) / camera.zoom;
  const biasDistance = baseBiasDistance * (0.22 + distanceRatio * 0.78 + recommendationBoost) * visibilityBoost;

  return {
    x: direction.x * biasDistance,
    y: direction.y * biasDistance,
  };
}

function getNavigationZoomBias(target: InteractionTarget | null): number {
  const focusCenter = getNavigationFocusCenter(target);
  if (!focusCenter) {
    return 0;
  }

  const maxBias = isCompactViewport()
    ? CAMERA_FOCUS_ZOOM_BIAS_MOBILE
    : CAMERA_FOCUS_ZOOM_BIAS_DESKTOP;
  const distance = Math.hypot(focusCenter.x - player.x, focusCenter.y - player.y);
  const distanceRatio = clamp(
    1 - (distance - CAMERA_FOCUS_ZOOM_NEAR_DISTANCE) /
      (CAMERA_FOCUS_ZOOM_FAR_DISTANCE - CAMERA_FOCUS_ZOOM_NEAR_DISTANCE),
    0,
    1
  );
  let bias = maxBias * distanceRatio;

  const focusRect = getNavigationFocusRect(target);
  if (focusRect && pointInRect(player, focusRect)) {
    bias += maxBias * 0.45;
  }

  if (target?.type === "podium" && meetingState.active) {
    bias = Math.max(bias, maxBias * 0.8);
  }

  if (getNavigationFollowUpTarget()) {
    bias += maxBias * 0.1;
  }

  return clamp(bias, 0, maxBias * 1.25);
}

function getMeetingStageFocusCenter(): Point | null {
  if (!meetingState.active) {
    return null;
  }

  const { speaker, counterpart } = getMeetingStageCueActors();
  if (speaker && counterpart) {
    return {
      x: lerp(speaker.x, counterpart.x, 0.38),
      y: lerp(speaker.y, counterpart.y, 0.38),
    };
  }
  if (speaker) {
    return { x: speaker.x, y: speaker.y };
  }

  const { currentSpeaker, pendingQuestioner, pendingResponder } = getMeetingConversationActors();
  if (currentSpeaker) {
    return { x: currentSpeaker.x, y: currentSpeaker.y };
  }
  if (pendingQuestioner && pendingResponder) {
    return {
      x: lerp(pendingQuestioner.x, pendingResponder.x, 0.4),
      y: lerp(pendingQuestioner.y, pendingResponder.y, 0.4),
    };
  }
  return centralMeetingPodium.interactionPoint;
}

function getMeetingStageCameraBias(target: InteractionTarget | null): Point {
  const focusCenter = getMeetingStageFocusCenter();
  if (!focusCenter) {
    return { x: 0, y: 0 };
  }

  const deltaX = focusCenter.x - player.x;
  const deltaY = focusCenter.y - player.y;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance <= 1) {
    return { x: 0, y: 0 };
  }

  const direction = {
    x: deltaX / distance,
    y: deltaY / distance,
  };
  const targetBoost = target?.type === "podium" ? 1 : 0.42;
  const cueBoost = 0.36 + clamp(meetingStageCueState.pulse, 0, 1) * 0.64;
  const focusRect = getNavigationFocusRect(target);
  const roomBoost = focusRect && pointInRect(player, focusRect) ? 1 : 0.72;
  const baseBias = (
    isCompactViewport()
      ? CAMERA_MEETING_STAGE_BIAS_PIXELS_MOBILE
      : CAMERA_MEETING_STAGE_BIAS_PIXELS_DESKTOP
  ) / camera.zoom;
  const biasDistance = baseBias * targetBoost * cueBoost * roomBoost;

  return {
    x: direction.x * biasDistance,
    y: direction.y * biasDistance,
  };
}

function getMeetingStageZoomBias(target: InteractionTarget | null): number {
  const focusCenter = getMeetingStageFocusCenter();
  if (!focusCenter) {
    return 0;
  }

  const maxBias = isCompactViewport()
    ? CAMERA_MEETING_STAGE_ZOOM_BIAS_MOBILE
    : CAMERA_MEETING_STAGE_ZOOM_BIAS_DESKTOP;
  const distance = Math.hypot(focusCenter.x - player.x, focusCenter.y - player.y);
  const distanceRatio = clamp(1 - distance / 180, 0, 1);
  const cueBoost = 0.28 + clamp(meetingStageCueState.pulse, 0, 1) * 0.42;
  const targetBoost = target?.type === "podium" ? 1 : 0.46;
  return clamp(maxBias * targetBoost * (distanceRatio + cueBoost), 0, maxBias * 1.24);
}

function updateCamera(delta: number, lookDirection: Point | null, lookStrength = 0): void {
  void delta;
  void lookDirection;
  void lookStrength;
  camera.lookAheadX = 0;
  camera.lookAheadY = 0;
  camera.lookAheadStrength = 0;
  camera.lookAheadDirectionX = 0;
  camera.lookAheadDirectionY = 0;
  camera.navigationBiasX = 0;
  camera.navigationBiasY = 0;
  camera.meetingBiasX = 0;
  camera.meetingBiasY = 0;
  camera.zoomBias = 0;
  camera.zoom = clamp(camera.targetZoom, getMinZoom(), MAX_ZOOM);
  const halfWidth = surface.width / camera.zoom / 2;
  const halfHeight = surface.height / camera.zoom / 2;
  const targetX = clamp(
    player.x,
    worldBounds.left + halfWidth,
    worldBounds.left + worldBounds.width - halfWidth
  );
  const targetY = clamp(
    player.y - 4,
    worldBounds.top + halfHeight,
    worldBounds.top + worldBounds.height - halfHeight
  );
  camera.x = targetX;
  camera.y = targetY;
}

function adjustZoomTarget(delta: number): void {
  camera.targetZoom = clamp(camera.targetZoom + delta, getMinZoom(), MAX_ZOOM);
}

function updateWorld(delta: number): void {
  const movement = { x: 0, y: 0 };
  let cameraLookDirection: Point | null = null;
  let cameraLookStrength = 0;
  departmentMilestoneState.pulse = Math.max(0, departmentMilestoneState.pulse - delta / DEPARTMENT_MILESTONE_DURATION);
  meetingStageCueState.pulse = Math.max(0, meetingStageCueState.pulse - delta / MEETING_STAGE_CUE_DURATION);
  goalRelayState.pulse = Math.max(0, goalRelayState.pulse - delta / GOAL_RELAY_TRANSITION_DURATION);
  navigationFocusTransition.pulse = Math.max(0, navigationFocusTransition.pulse - delta / NAVIGATION_FOCUS_TRANSITION_DURATION);
  activeAreaTransition.pulse = Math.max(0, activeAreaTransition.pulse - delta / ACTIVE_AREA_TRANSITION_DURATION);
  focusArrivalTransition.pulse = Math.max(0, focusArrivalTransition.pulse - delta / FOCUS_ARRIVAL_TRANSITION_DURATION);
  updateNpcActors(delta);

  if (modal.classList.contains("hidden")) {
    if (isControlActive("forward")) {
      movement.y -= 1;
    }
    if (isControlActive("backward")) {
      movement.y += 1;
    }
    if (isControlActive("left")) {
      movement.x -= 1;
    }
    if (isControlActive("right")) {
      movement.x += 1;
    }
  } else {
    clearMobileMoveTarget();
  }

  if (movement.x !== 0 || movement.y !== 0) {
    clearMobileMoveTarget();
    const length = Math.hypot(movement.x, movement.y) || 1;
    const normalizedX = movement.x / length;
    const normalizedY = movement.y / length;
    const previousX = player.x;
    const previousY = player.y;
    movePlayer(normalizedX * PLAYER_SPEED * delta, normalizedY * PLAYER_SPEED * delta);
    const movedDistance = Math.hypot(player.x - previousX, player.y - previousY);
    player.facing = lerpAngle(player.facing, Math.atan2(normalizedY, normalizedX), 1 - Math.pow(0.001, delta));
    if (movedDistance > 0.02) {
      const expectedDistance = Math.max(PLAYER_SPEED * delta, 0.001);
      cameraLookDirection = {
        x: (player.x - previousX) / movedDistance,
        y: (player.y - previousY) / movedDistance,
      };
      cameraLookStrength = clamp(movedDistance / expectedDistance, 0, 1);
      player.step += delta * 12;
    } else {
      player.step = 0;
    }
  } else if (modal.classList.contains("hidden") && mobileMoveTarget) {
    const deltaX = mobileMoveTarget.x - player.x;
    const deltaY = mobileMoveTarget.y - player.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance <= TAP_MOVE_REACHED_DISTANCE) {
      clearMobileMoveTarget();
      player.step = 0;
    } else {
      const previousX = player.x;
      const previousY = player.y;
      movePlayer((deltaX / distance) * PLAYER_SPEED * delta, (deltaY / distance) * PLAYER_SPEED * delta);
      player.facing = lerpAngle(player.facing, Math.atan2(deltaY, deltaX), 1 - Math.pow(0.001, delta));

      const movedDistance = Math.hypot(player.x - previousX, player.y - previousY);
      if (movedDistance > 0.02) {
        const expectedDistance = Math.max(PLAYER_SPEED * delta, 0.001);
        cameraLookDirection = {
          x: (player.x - previousX) / movedDistance,
          y: (player.y - previousY) / movedDistance,
        };
        cameraLookStrength = clamp(movedDistance / expectedDistance, 0, 1);
        mobileMoveStallTimer = 0;
        player.step += delta * 12;
      } else {
        mobileMoveStallTimer += delta;
        player.step = 0;
        if (mobileMoveStallTimer >= TAP_MOVE_STALL_TIMEOUT) {
          clearMobileMoveTarget();
        }
      }
    }
  } else {
    player.step = 0;
  }

  hoveredPodium = findMeetingPodium();
  hoveredGuide = findNearestGuide();
  hoveredTerminal = findNearestTerminal();
  hoveredInsight = findNearestInsight();
  const navigationTarget = getNavigationTarget();
  const focusSummary = getNavigationFocusSummary(navigationTarget);
  syncAreaTransitionState(
    navigationFocusTransition,
    navigationTarget ? getInteractionTargetAreaKey(navigationTarget) : "office:central",
    focusSummary.accent,
    focusSummary.label
  );
  const navigationFocusRect = getNavigationFocusRect(navigationTarget);
  const currentNavigationFocusPresenceKey = navigationTarget &&
      navigationFocusRect &&
      pointInRect(player, navigationFocusRect)
    ? getInteractionTargetAreaKey(navigationTarget)
    : "";
  if (
    currentNavigationFocusPresenceKey &&
    currentNavigationFocusPresenceKey !== lastNavigationFocusPresenceKey
  ) {
    focusArrivalTransition.areaKey = currentNavigationFocusPresenceKey;
    focusArrivalTransition.accent = focusSummary.accent;
    focusArrivalTransition.label = focusSummary.label;
    focusArrivalTransition.pulse = 1;
  }
  lastNavigationFocusPresenceKey = currentNavigationFocusPresenceKey;
  updateCamera(delta, cameraLookDirection, cameraLookStrength);
  updatePrompt();
  const nextPromptDepartmentId = getPromptTargetDepartment()?.id ?? "";
  const nextPromptSharedZoneId = getPromptTargetSharedZone()?.id ?? "";
  let shouldRefreshRouteList = false;
  if (nextPromptDepartmentId !== promptTargetDepartmentId) {
    promptTargetDepartmentId = nextPromptDepartmentId;
    shouldRefreshRouteList = true;
  }
  if (nextPromptSharedZoneId !== promptTargetSharedZoneId) {
    promptTargetSharedZoneId = nextPromptSharedZoneId;
    shouldRefreshRouteList = true;
  }

  const currentDepartment = getDepartmentAtPosition(player.x, player.y);
  const currentSharedZone = currentDepartment ? null : getSharedZoneAtPosition(player.x, player.y);
  const nextActiveId = currentDepartment?.id ?? "";
  if (nextActiveId !== activeDepartmentId) {
    activeDepartmentId = nextActiveId;
    shouldRefreshRouteList = true;
  }
  const nextActiveSharedZoneId = currentSharedZone?.id ?? "";
  if (nextActiveSharedZoneId !== activeSharedZoneId) {
    activeSharedZoneId = nextActiveSharedZoneId;
    shouldRefreshRouteList = true;
  }
  const activeAreaSummary = getActiveAreaSummary(currentDepartment, currentSharedZone);
  syncAreaTransitionState(
    activeAreaTransition,
    activeAreaSummary.areaKey,
    activeAreaSummary.accent,
    activeAreaSummary.label,
    0.9
  );
  if (shouldRefreshRouteList || getRouteListRenderKey() !== lastRouteListRenderKey) {
    renderDepartmentList();
  }
  currentZoneElement.textContent = currentDepartment
    ? getDepartmentUiLabel(currentDepartment)
    : currentSharedZone
      ? getSharedZoneUiLabel(currentSharedZone)
      : getDefaultZoneLabel();
  currentZoneElement.style.color = currentDepartment?.accent ?? currentSharedZone?.accent ?? "#f5f7ff";
  currentZoneElement.style.textShadow = currentDepartment || currentSharedZone
    ? `0 0 14px ${withAlpha(currentDepartment?.accent ?? currentSharedZone?.accent ?? "#89d0ff", 0.22)}`
    : "";
  if (getHudStatusKey() !== lastHudStatusKey) {
    updateHudStatus();
  }

  mapFloorIndicator.textContent = getLocalizedString("map.floorIndicator");
}

function animate(now: number): void {
  const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  const elapsed = now / 1000;

  if (isTitleScreenActive()) {
    updateTitleScreen(delta);
    renderTitleScreen(elapsed);
    window.requestAnimationFrame(animate);
    return;
  }

  updateWorld(delta);
  renderScene(elapsed);
  renderMinimap(elapsed);
  window.requestAnimationFrame(animate);
}

function initializeUi(): void {
  syncUiVisibility();
  currentZoneElement.textContent = getDefaultZoneLabel();
  officeTrafficElement.textContent = getWaitingTrafficLabel();
  focusRoomElement.textContent = getFocusRoomFallbackLabel();
  applyUiLanguage();
  syncTitleScreenUi();
}

initializeUi();
resizeCanvases();
renderMinimap(0);
window.requestAnimationFrame(animate);
window.setInterval(updateClockPanel, 1000);

window.addEventListener("resize", resizeCanvases);

window.addEventListener("keydown", (event) => {
  if (isTitleScreenActive()) {
    return;
  }

  if (shouldIgnoreKeyboardEvent(event)) {
    return;
  }

  if (isHandledKeyboardCode(event.code)) {
    event.preventDefault();
  }

  if (event.code === "KeyE") {
    if (!event.repeat && hoveredPodium && modal.classList.contains("hidden")) {
      toggleCentralMeeting();
    } else if (!event.repeat && hoveredGuide && modal.classList.contains("hidden")) {
      openAreaGuideModal(hoveredGuide);
    } else if (!event.repeat && hoveredTerminal && modal.classList.contains("hidden")) {
      openTerminal(hoveredTerminal);
    }
    return;
  }

  if (event.code === "KeyF") {
    if (!event.repeat && hoveredInsight && modal.classList.contains("hidden")) {
      collectInsight(hoveredInsight);
    }
    return;
  }

  if (event.code === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
    return;
  }

  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  if (isTitleScreenActive()) {
    return;
  }

  if (shouldIgnoreKeyboardEvent(event)) {
    return;
  }

  if (isHandledKeyboardCode(event.code)) {
    event.preventDefault();
  }

  keys.delete(event.code);
});

window.addEventListener("blur", () => {
  keys.clear();
  touchControls.clear();
  clearMobileMoveTarget();
  isDragging = false;
  activeCanvasPointerId = null;
  activeCanvasPointerTapEligible = false;
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    keys.clear();
    touchControls.clear();
    clearMobileMoveTarget();
    isDragging = false;
    activeCanvasPointerId = null;
    activeCanvasPointerTapEligible = false;
  }
});

canvas.addEventListener("pointerdown", (event) => {
  if (isTitleScreenActive()) {
    return;
  }

  activeCanvasPointerId = event.pointerId;
  activeCanvasPointerStartX = event.clientX;
  activeCanvasPointerStartY = event.clientY;
  activeCanvasPointerTapEligible = isTapInteractionMode();
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  isDragging = !isTapInteractionMode();
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (isTitleScreenActive()) {
    return;
  }

  if (activeCanvasPointerId !== event.pointerId) {
    return;
  }

  if (
    Math.hypot(event.clientX - activeCanvasPointerStartX, event.clientY - activeCanvasPointerStartY) >
    CANVAS_TAP_THRESHOLD
  ) {
    activeCanvasPointerTapEligible = false;
  }

  if (!isDragging) {
    return;
  }

  const deltaX = event.clientX - lastPointerX;
  const deltaY = event.clientY - lastPointerY;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;

  if (Math.abs(deltaX) + Math.abs(deltaY) > 2) {
    player.facing = Math.atan2(deltaY, deltaX);
  }
});

canvas.addEventListener("pointerup", (event) => {
  if (isTitleScreenActive()) {
    return;
  }

  const shouldHandleTap =
    activeCanvasPointerId === event.pointerId && activeCanvasPointerTapEligible && isTapInteractionMode();
  isDragging = false;
  activeCanvasPointerId = null;
  activeCanvasPointerTapEligible = false;
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
  if (shouldHandleTap) {
    handleCanvasTap(event.clientX, event.clientY);
  }
});

canvas.addEventListener("pointerleave", () => {
  if (isTitleScreenActive()) {
    return;
  }

  isDragging = false;
  activeCanvasPointerId = null;
  activeCanvasPointerTapEligible = false;
});

canvas.addEventListener("pointercancel", (event) => {
  if (isTitleScreenActive()) {
    return;
  }

  isDragging = false;
  activeCanvasPointerId = null;
  activeCanvasPointerTapEligible = false;
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
});

canvas.addEventListener(
  "wheel",
  (event) => {
    if (isTitleScreenActive()) {
      return;
    }

    event.preventDefault();
    adjustZoomTarget(-event.deltaY * 0.0025);
  },
  { passive: false }
);

mobileControls.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
  const action = button.dataset.mobileAction;
  if (!action) {
    return;
  }

  button.addEventListener("click", (event) => {
    if (isTitleScreenActive()) {
      return;
    }

    event.preventDefault();
    if (action === "zoom-in") {
      adjustZoomTarget(0.2);
      return;
    }
    if (action === "zoom-out") {
      adjustZoomTarget(-0.2);
    }
  });
});

startButton.addEventListener("click", () => {
  enterTitleExperience();
});

startLanguageZhButton.addEventListener("click", () => {
  selectTitleScreenLanguage("zh-CN");
});

startLanguageEnButton.addEventListener("click", () => {
  selectTitleScreenLanguage("en");
});

closeModalButton.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).classList.contains("modal-backdrop")) {
    closeModal();
  }
});

departmentList.addEventListener("click", (event) => {
  if (isTitleScreenActive()) {
    return;
  }

  const zoneTarget = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-shared-zone-id]");
  if (zoneTarget) {
    const zoneId = zoneTarget.dataset.sharedZoneId;
    const zone = sharedZones.find((item) => item.id === zoneId);
    if (zone) {
      teleportToSharedZone(zone);
    }
    return;
  }

  const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-department-id]");
  if (!target) {
    return;
  }

  const departmentId = target.dataset.departmentId;
  const department = departments.find((item) => item.id === departmentId);
  if (!department) {
    return;
  }

  teleportToDepartment(department);
});

minimap.addEventListener("click", (event) => {
  if (isTitleScreenActive()) {
    return;
  }

  const rect = minimap.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const hit = minimapHits.find((item) =>
    x >= item.x &&
    x <= item.x + item.width &&
    y >= item.y &&
    y <= item.y + item.height
  );

  if (hit) {
    teleportToDepartment(hit.department);
  }
});

uiToggleButton.addEventListener("click", () => {
  if (isTitleScreenActive()) {
    return;
  }

  uiMinimal = !uiMinimal;
  syncUiVisibility();
});

modalContent.addEventListener("click", (event) => {
  if (isTitleScreenActive()) {
    return;
  }

  const actionTarget = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-run-scenario]");
  if (!actionTarget || !modalDepartment) {
    return;
  }

  const scenarioId = actionTarget.dataset.runScenario;
  if (!scenarioId) {
    return;
  }

  runScenario(scenarioId, modalDepartment);
});
