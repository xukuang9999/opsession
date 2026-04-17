import "./style.css";
import heroCapybaraSheetUrl from "./assets/hero-capybara-sheet.png";
import clawLibrarySceneFloorUrl from "./assets/clawlibrary-scene-floor.png";
import clawLibrarySceneObjectsUrl from "./assets/clawlibrary-scene-objects.png";
import {
  departments as baseDepartments,
  thesisPoints,
  uniqueSources,
  type Department,
  type Scenario,
  type SourceItem,
} from "./data";

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
  corridorPoint: Point;
};

type FacingDirection = "up" | "down" | "left" | "right";
type PlayerSpriteFacing = FacingDirection | "up-left" | "up-right" | "down-left" | "down-right";

type ScenarioTerminal = {
  department: SceneDepartment;
  scenario: Scenario;
  position: Point;
  pulseOffset: number;
};

type InsightNode = {
  id: string;
  department: SceneDepartment;
  fact: string;
  position: Point;
  pulseOffset: number;
};

type SceneDepartment = Department & {
  npcRoles: string[];
  roomRect: Rect;
  walkwayRect: Rect;
  frontageRect: Rect;
  deskRect: Rect;
  entryPoint: Point;
  corridorLanePoint: Point;
  workSpots: Point[];
  terminals: ScenarioTerminal[];
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

type DepartmentSeed = Department & {
  npcRoles: string[];
};

type DepartmentVisualState = "busy" | "online" | "idle" | "done";

type OfficeProp = {
  rect: Rect;
  kind:
    | "meeting"
    | "plant"
    | "cabinet"
    | "printer"
    | "coffee"
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
  accent: string;
  kind: "reception" | "cafeteria";
  roomRect: Rect;
  walkwayRect: Rect;
  frontageRect: Rect;
  approachSide: RoomApproachSide;
};

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
};

type CharacterPalette = {
  clothes: string;
  hair: string;
};

type NpcActor = {
  id: string;
  department: SceneDepartment;
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
  palette: CharacterPalette;
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
const GUIDE_INTERACTION_DISTANCE = 14;
const INSIGHT_DISTANCE = 8;
const PLAYER_RADIUS = 1.4;
const PLAYER_SPEED = 90;
const NPC_BASE_SPEED = 8;
const NPC_BUBBLE_MAX_CHARS_PER_LINE = 10;
const NPC_BUBBLE_FONT_SIZE = 14;
const NPC_BUBBLE_LINE_HEIGHT = 18;
const MAX_VISIBLE_NPC_BUBBLES = 3;
const NPC_BUBBLE_TRIGGER_CHANCE = 0.0035;
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
const TURN_SPEED = 3.2;
const MIN_ZOOM = 0.9;
const MAX_ZOOM = 3.4;
const MOBILE_MIN_ZOOM = 1.28;
const DEFAULT_ZOOM_DESKTOP = 0.98;
const DEFAULT_ZOOM_MOBILE = 1.28;

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
const thesisList = requireElement<HTMLUListElement>("#thesis-list");
const departmentList = requireElement<HTMLDivElement>("#department-list");
const sourceList = requireElement<HTMLDivElement>("#source-list");
const prompt = requireElement<HTMLDivElement>("#prompt");
const modal = requireElement<HTMLElement>("#modal");
const modalContent = requireElement<HTMLDivElement>("#modal-content");
const closeModalButton = requireElement<HTMLButtonElement>("#close-modal");
const minimap = requireElement<HTMLCanvasElement>("#minimap");
const mapFloorIndicator = requireElement<HTMLElement>("#map-floor-indicator");
const uiToggleButton = requireElement<HTMLButtonElement>("#ui-toggle");
const completedCountElement = requireElement<HTMLElement>("#completed-count");
const impactScoreElement = requireElement<HTMLElement>("#impact-score");
const currentZoneElement = requireElement<HTMLElement>("#current-zone");
const executionStageElement = requireElement<HTMLElement>("#execution-stage");
const insightCountElement = requireElement<HTMLElement>("#insight-count");
const mobileControls = requireElement<HTMLDivElement>("#mobile-controls");
const toast = requireElement<HTMLDivElement>("#toast");
const dashboardTime = requireElement<HTMLElement>("#dashboard-time");
const dashboardDate = requireElement<HTMLElement>("#dashboard-date");
const dashboardLastEvent = requireElement<HTMLElement>("#dashboard-last-event");

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

const sceneLayerState: SceneLayerState = {
  floorImage: null,
  objectsImage: null,
};

const PLAYER_SPRITE_FACING_ORDER: PlayerSpriteFacing[] = [
  "down",
  "up",
  "right",
  "left",
  "down-right",
  "up-right",
  "down-left",
  "up-left",
];

preparePlayerSpriteSheet(heroCapybaraSheetUrl);
prepareSceneLayer("floorImage", clawLibrarySceneFloorUrl);
prepareSceneLayer("objectsImage", clawLibrarySceneObjectsUrl);

function cloneSource(source: SourceItem): SourceItem {
  return { ...source };
}

function requireCanvasContext(canvasElement: HTMLCanvasElement, label: string): CanvasRenderingContext2D {
  const context = canvasElement.getContext("2d");
  if (!context) {
    throw new Error(`无法初始化 ${label} 画布。`);
  }
  context.imageSmoothingEnabled = false;
  return context;
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

  const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const { data } = imageData;
  const background = [data[0], data[1], data[2]];
  for (let index = 0; index < data.length; index += 4) {
    const distance =
      Math.abs(data[index] - background[0]) +
      Math.abs(data[index + 1] - background[1]) +
      Math.abs(data[index + 2] - background[2]);
    if (distance <= PLAYER_SPRITE_BACKGROUND_TOLERANCE) {
      data[index + 3] = 0;
    }
  }
  context.putImageData(imageData, 0, 0);

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
  const corridorLanePoint = { ...layout.corridorPoint };
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

  const sequence: DepartmentSeed[] = [
    {
      ...marketing,
      size: { width: 34, depth: 26 },
      level: 0,
      npcRoles: ["情报分析", "内容运营", "活动策划"],
    },
    {
      ...sales,
      size: { width: 32, depth: 28 },
      level: 0,
      npcRoles: ["客户拓展", "方案顾问", "续约经理"],
    },
    {
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
    {
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
    {
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
    {
      ...warehouse,
      size: { width: 40, depth: 30 },
      level: 0,
      npcRoles: ["拣货员", "调度员", "包装专员"],
    },
    {
      ...support,
      size: { width: 34, depth: 28 },
      level: 0,
      npcRoles: ["客服坐席", "升级协调", "知识库编辑"],
    },
    {
      ...hr,
      size: { width: 32, depth: 26 },
      level: 0,
      npcRoles: ["招聘专员", "HRBP", "培训协调"],
    },
    {
      ...finance,
      size: { width: 32, depth: 26 },
      level: 0,
      npcRoles: ["出纳", "FP&A", "审计协调"],
    },
    {
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
  ];

  const roomLayouts: RoomLayout[] = [
    { left: 148, top: 54, width: 108, height: 92, doorWidth: 34, approachSide: "down" },
    { left: 264, top: 30, width: 112, height: 116, doorWidth: 34, approachSide: "down" },
    { left: 384, top: 26, width: 210, height: 120, doorWidth: 56, approachSide: "down" },
    { left: 28, top: 398, width: 184, height: 128, doorWidth: 58, approachSide: "up" },
    { left: 222, top: 398, width: 112, height: 96, doorWidth: 32, approachSide: "up" },
    { left: 344, top: 398, width: 170, height: 128, doorWidth: 54, approachSide: "up" },
    { left: 604, top: 50, width: 118, height: 96, doorWidth: 36, approachSide: "down" },
    { left: 524, top: 398, width: 102, height: 92, doorWidth: 30, approachSide: "up" },
    { left: 636, top: 398, width: 106, height: 92, doorWidth: 30, approachSide: "up" },
    { left: 752, top: 42, width: 174, height: 104, doorWidth: 52, approachSide: "down" },
  ];

  return sequence.map((department, index) => {
    const layout = roomLayouts[index];
    const geometry = createRoomGeometry(layout);
    const { roomRect, deskRect } = geometry;
    const position = {
      x: layout.left + layout.width / 2,
      z: layout.top + layout.height / 2,
    };

    const sceneDepartment = {
      ...department,
      position,
      roomRect: geometry.roomRect,
      walkwayRect: geometry.walkwayRect,
      frontageRect: geometry.frontageRect,
      deskRect: geometry.deskRect,
      entryPoint: geometry.entryPoint,
      corridorLanePoint: geometry.corridorLanePoint,
      workSpots: [] as Point[],
      terminals: [] as ScenarioTerminal[],
      insight: null as unknown as InsightNode,
      decorSeed: index,
      approachSide: layout.approachSide,
    } satisfies Omit<SceneDepartment, "terminals" | "insight"> & {
      terminals: ScenarioTerminal[];
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
      department: sceneDepartment,
      scenario,
      position: {
        x: roomRect.left + ((scenarioIndex + 1) * roomRect.width) / (department.scenarios.length + 1),
        y: layout.approachSide === "down" ? deskRect.top + deskRect.height + 12 : deskRect.top - 10,
      },
      pulseOffset: index * 0.8 + scenarioIndex * 0.65,
    }));

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
  const layouts: Array<{
    id: string;
    label: string;
    accent: string;
    kind: SharedZone["kind"];
  } & RoomLayout> = [
    {
      id: "reception",
      label: "前台接待",
      accent: "#9ac6ff",
      kind: "reception",
      left: 24,
      top: 46,
      width: 114,
      height: 100,
      doorWidth: 40,
      approachSide: "down",
    },
    {
      id: "cafeteria",
      label: "员工餐厅",
      accent: "#f6d27a",
      kind: "cafeteria",
      left: 748,
      top: 380,
      width: 178,
      height: 146,
      doorWidth: 54,
      approachSide: "up",
    },
  ];

  return layouts.map((layout) => {
    const geometry = createRoomGeometry(layout);
    return {
      id: layout.id,
      label: layout.label,
      accent: layout.accent,
      kind: layout.kind,
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
const centralLoungeRect: Rect = {
  left: corridorCenterX - 86,
  top: corridorCenterY - 34,
  width: 172,
  height: 92,
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

const officeProps: OfficeProp[] = [
  { kind: "whiteboard", rect: { left: corridorCenterX - 88, top: WALL_HEIGHT + 10, width: 176, height: 12 } },
  { kind: "bookshelf", rect: { left: corridorRect.left + 134, top: corridorCenterY - 24, width: 24, height: 42 } },
  { kind: "plant", rect: { left: corridorRect.left + 166, top: corridorCenterY - 12, width: 14, height: 18 } },
  { kind: "printer", rect: { left: corridorRect.left + 188, top: corridorCenterY + 24, width: 18, height: 16 } },
  { kind: "meeting", rect: { left: corridorCenterX - 66, top: corridorCenterY - 20, width: 132, height: 40 } },
  { kind: "sofa", rect: { left: corridorCenterX - 30, top: corridorCenterY + 36, width: 60, height: 16 } },
  { kind: "plant", rect: { left: corridorCenterX - 108, top: corridorCenterY + 18, width: 16, height: 16 } },
  { kind: "plant", rect: { left: corridorCenterX + 92, top: corridorCenterY + 18, width: 16, height: 16 } },
  { kind: "cabinet", rect: { left: corridorRect.left + corridorRect.width - 176, top: corridorCenterY - 24, width: 24, height: 38 } },
  { kind: "coffee", rect: { left: corridorRect.left + corridorRect.width - 142, top: corridorCenterY + 22, width: 18, height: 18 } },
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
        left: item.rect.left + 12,
        top: item.rect.top + 8,
        width: item.rect.width - 24,
        height: item.rect.height - 12,
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
      return "欢迎进入办公室导览";
    case "cafeteria":
      return "员工餐厅与交流补能区";
    default:
      return "区域导览";
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

function createAreaGuides(): AreaGuide[] {
  const departmentGuides = departments.map((department, index) => ({
    id: `guide-${department.id}`,
    label: `${department.shortName}小龙虾`,
    accent: department.accent,
    position: resolveAreaGuidePosition(department.roomRect, department.approachSide, index + 1),
    preview: department.scenarios[0]?.title ?? `${department.shortName}区域导览`,
    target: { type: "department", department } satisfies AreaGuideTarget,
  }));

  const sharedZoneGuides = sharedZones.map((zone, index) => ({
    id: `guide-${zone.id}`,
    label: `${zone.label}小龙虾`,
    accent: zone.accent,
    position: resolveAreaGuidePosition(zone.roomRect, zone.approachSide, 101 + index),
    preview: getSharedZoneGuidePreview(zone),
    target: { type: "shared-zone", zone } satisfies AreaGuideTarget,
  }));

  return [...sharedZoneGuides, ...departmentGuides];
}

const areaGuides = createAreaGuides();

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
const bubbleLexicon = [
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
];
const initialSpawn = resolveInitialSpawn();

const player: PlayerState = {
  x: initialSpawn.x,
  y: initialSpawn.y,
  facing: 0,
  step: 0,
};

const camera = {
  x: player.x,
  y: player.y - 4,
  zoom: isCompactViewport() ? DEFAULT_ZOOM_MOBILE : DEFAULT_ZOOM_DESKTOP,
  targetZoom: isCompactViewport() ? DEFAULT_ZOOM_MOBILE : DEFAULT_ZOOM_DESKTOP,
};

let activeDepartmentId = "";
let activeSharedZoneId = "";
let hoveredGuide: AreaGuide | null = null;
let hoveredTerminal: ScenarioTerminal | null = null;
let hoveredInsight: InsightNode | null = null;
let modalDepartment: SceneDepartment | null = null;
let modalSharedZone: SharedZone | null = null;
let uiMinimal = true;
let toastTimer: number | null = null;
let isDragging = false;
let lastPointerX = 0;
let lastPointerY = 0;
let lastFrameTime = performance.now();
let lastEventText = "等待指令";
let lastPromptKey = "";
const npcs = createNpcActors();

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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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
  const visibleTexts = getVisibleNpcBubbleTexts(excludeNpcId);
  const candidates = bubbleLexicon.filter((text) => !visibleTexts.has(text));
  const pool = candidates.length > 0 ? candidates : bubbleLexicon;
  return pool[Math.floor(Math.random() * pool.length)] ?? "...";
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

  return departments.flatMap((department, deptIndex) => {
    const roomCenter = rectCenter(department.roomRect);
    const stagingY = department.approachSide === "down"
      ? department.roomRect.top + department.roomRect.height - 10
      : department.roomRect.top + 10;

    return Array.from({ length: 3 }, (_, index) => {
      const anchor = department.workSpots[index % department.workSpots.length];
      return {
        id: `${department.id}-npc-${index}`,
        department,
        role: department.npcRoles[index % department.npcRoles.length],
        x: anchor.x + (index - 1) * 6,
        y: index === 1 ? roomCenter.y : stagingY + index * 5,
        home: anchor,
        target: anchor,
        route: [],
        workSpots: department.workSpots,
        speed: NPC_BASE_SPEED + (index % 3),
        facing: department.approachSide === "down" ? "down" : "up",
        step: randomBetween(0, Math.PI * 2),
        action: "working",
        actionTimer: randomBetween(0.8, 2.2) + index * 0.35,
        bubbleText: "",
        bubbleTimer: 0,
        bubbleCooldown: randomBetween(3.6, 7.4),
        palette: {
          clothes: clothesPalette[(deptIndex + index) % clothesPalette.length],
          hair: hairPalette[(deptIndex * 2 + index) % hairPalette.length],
        },
      };
    });
  });
}

function resizeCanvases(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  sceneContext.imageSmoothingEnabled = false;

  if (window.innerHeight > window.innerWidth) {
    surface.width = 288;
    surface.height = 384;
  } else {
    surface.width = 480;
    surface.height = 270;
  }

  const minZoom = window.innerHeight > window.innerWidth ? MOBILE_MIN_ZOOM : MIN_ZOOM;
  camera.targetZoom = clamp(camera.targetZoom, minZoom, MAX_ZOOM);
  camera.zoom = clamp(camera.zoom, minZoom, MAX_ZOOM);
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

function findNearestTerminal(): ScenarioTerminal | null {
  let best: ScenarioTerminal | null = null;
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

function getPromptTarget():
  | { type: "guide"; value: AreaGuide }
  | { type: "terminal"; value: ScenarioTerminal }
  | { type: "insight"; value: InsightNode }
  | null {
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

function updatePrompt(): void {
  const target = getPromptTarget();
  if (!target || !modal.classList.contains("hidden")) {
    prompt.classList.add("hidden");
    lastPromptKey = "";
    return;
  }

  let promptMarkup = "";
  let promptKey = "";
  if (target.type === "guide") {
    promptKey = `guide:${target.value.id}`;
    promptMarkup = [
      `<strong>${target.value.label}</strong>`,
      target.value.preview,
      "按 E 查看完整导览",
    ].join(" · ");
  } else if (target.type === "terminal") {
    const done = completedScenarios.has(target.value.scenario.id);
    promptKey = `terminal:${target.value.scenario.id}:${done ? "done" : "todo"}`;
    promptMarkup = [
      `<strong>${target.value.department.shortName}</strong> · ${target.value.scenario.title}`,
      done ? "状态：已执行 · 按 E 继续查看" : "状态：可执行 · 按 E 开始演示",
    ].join(" · ");
  } else {
    const done = collectedInsights.has(target.value.id);
    promptKey = `insight:${target.value.id}:${done ? "done" : "todo"}`;
    promptMarkup = [
      `<strong>${target.value.department.shortName}</strong> · 记忆芯片`,
      done ? "状态：已记录 · 按 F 复看洞察" : "状态：可记录 · 按 F 保存洞察",
    ].join(" · ");
  }

  if (promptKey !== lastPromptKey) {
    prompt.innerHTML = promptMarkup;
    lastPromptKey = promptKey;
  }
  prompt.classList.remove("hidden");
}

function renderSourceList(): void {
  sourceList.innerHTML = uniqueSources
    .map(
      (source) => `
        <a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">
          ${source.label}
          <span>${source.detail}</span>
        </a>
      `
    )
    .join("");
}

function getDepartmentCompletion(department: SceneDepartment): number {
  return department.scenarios.filter((scenario) => completedScenarios.has(scenario.id)).length;
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

function getDepartmentStateLabel(state: DepartmentVisualState): string {
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
  const departmentMetrics = departments.map((department) => {
    const completed = getDepartmentCompletion(department);
    const progress = Math.round((completed / department.scenarios.length) * 100);
    const state = getDepartmentVisualState(department);
    return { department, completed, progress, state };
  });

  departmentList.innerHTML = departmentMetrics
    .map(({ department, completed, progress, state }) => {
      const active = department.id === activeDepartmentId ? "active" : "";
      return `
        <button class="dept-button ${active}" data-department-id="${department.id}">
          <div class="dept-title-row">
            <strong>${department.shortName}</strong>
            <span class="dept-tag">${progress}%</span>
          </div>
          <div class="dept-status-line">
            <span class="dept-status-dot status-${state}"></span>
            <span>${getDepartmentStateLabel(state)} · ${completed}/${department.scenarios.length}</span>
          </div>
          <div class="dept-tag">${department.name}</div>
          <div class="dept-progress">
            <div class="dept-progress-fill" style="width:${progress}%; background:${department.accent};"></div>
          </div>
        </button>
      `;
    })
    .join("");
}

function getSharedZoneModalCopy(zone: SharedZone): {
  title: string;
  intro: string;
  highlight: string;
  cards: Array<{ title: string; hook: string; bullets: string[] }>;
} {
  if (zone.kind === "reception") {
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

  modalContent.innerHTML = `
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
              <ul>
                ${scenario.workflow.map((step) => `<li>${step}</li>`).join("")}
              </ul>
              <div class="scenario-footer">
                <p><strong>产出物：</strong>${scenario.outputs.join(" / ")}</p>
                <p><strong>KPI：</strong>${scenario.kpis.join(" / ")}</p>
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
  `;
}

function openSharedZoneModal(zone: SharedZone): void {
  const copy = getSharedZoneModalCopy(zone);
  modalDepartment = null;
  modalSharedZone = zone;
  modal.classList.remove("hidden");

  modalContent.innerHTML = `
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
  `;
}

function openAreaGuideModal(guide: AreaGuide): void {
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
  toast.innerHTML = message;
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
  dashboardTime.textContent = now.toLocaleTimeString("zh-CN", { hour12: false });
  dashboardDate.textContent = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  dashboardLastEvent.textContent = `最近动作：${lastEventText}`;
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

function chooseNpcRoute(npc: NpcActor): Point[] {
  const origin = { x: npc.x, y: npc.y };
  const inCorridor = pointInRect(origin, corridorRect) || pointInRect(origin, npc.department.walkwayRect);
  const doorwayOffset = hashUnit(npc.department.decorSeed * 17 + npc.id.length) > 0.5 ? -4 : 4;
  const doorwayPoint = {
    x: rectCenter(npc.department.walkwayRect).x + doorwayOffset,
    y: rectCenter(npc.department.walkwayRect).y,
  };
  const roomTarget = jitterPoint(
    npc.workSpots[Math.floor(Math.random() * npc.workSpots.length)] ?? npc.home,
    4,
    3
  );

  if (Math.random() < 0.4) {
    const corridorOptions = getCorridorPatrolOptions(npc.department);
    const corridorChoice =
      corridorOptions[Math.floor(Math.random() * corridorOptions.length)] ?? npc.department.corridorLanePoint;
    const corridorTarget = jitterPoint(corridorChoice, 8, 4);

    return compressNpcRoute(
      origin,
      inCorridor
        ? [npc.department.corridorLanePoint, corridorTarget]
        : [npc.department.entryPoint, doorwayPoint, npc.department.corridorLanePoint, corridorTarget]
    );
  }

  return compressNpcRoute(
    origin,
    inCorridor
      ? [npc.department.corridorLanePoint, doorwayPoint, npc.department.entryPoint, roomTarget]
      : [roomTarget]
  );
}

function startNpcRoute(npc: NpcActor, route: Point[]): void {
  const [nextTarget, ...rest] = route;
  if (!nextTarget) {
    npc.action = "working";
    npc.actionTimer = randomBetween(0.9, 1.8);
    return;
  }

  npc.target = nextTarget;
  npc.route = rest;
  npc.action = "walking";
  npc.actionTimer = randomBetween(1.6, 4.5);
  npc.facing = getFacingDirection(npc.target.x - npc.x, npc.target.y - npc.y, npc.facing);
}

function updateNpcActors(delta: number): void {
  const visibleBubbleCount = npcs.filter((candidate) => isNpcBubbleVisibleOnScreen(candidate)).length;
  for (const npc of npcs) {
    npc.actionTimer -= delta;
    npc.bubbleCooldown -= delta;
    if (npc.bubbleTimer > 0) {
      npc.bubbleTimer -= delta;
      if (npc.bubbleTimer <= 0) {
        npc.bubbleText = "";
      }
    }

    if (
      npc.bubbleCooldown <= 0 &&
      npc.bubbleTimer <= 0 &&
      visibleBubbleCount < MAX_VISIBLE_NPC_BUBBLES &&
      Math.random() < NPC_BUBBLE_TRIGGER_CHANCE
    ) {
      npc.bubbleText = pickNpcBubbleText(npc.id);
      npc.bubbleTimer = getBubbleDuration(npc.bubbleText) + randomBetween(0, 0.4);
      npc.bubbleCooldown = randomBetween(5.8, 10.5);
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
          npc.action = "working";
          npc.actionTimer = pointInRect(npc.target, corridorRect)
            ? randomBetween(0.8, 1.9)
            : randomBetween(1.2, 3.2);
        }
      } else {
        const step = Math.min(distance, npc.speed * delta);
        npc.x += (dx / distance) * step;
        npc.y += (dy / distance) * step;
        npc.facing = getFacingDirection(dx, dy, npc.facing);
        npc.step += delta * 10;
      }
      continue;
    }

    npc.step = 0;
    if (npc.actionTimer <= 0) {
      startNpcRoute(npc, chooseNpcRoute(npc));
    }
  }
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
    executionStageElement.textContent = "多 Agent 网络";
  } else if (completedCount >= 12) {
    executionStageElement.textContent = "协同自治";
  } else if (completedCount >= 6) {
    executionStageElement.textContent = "编排执行";
  } else {
    executionStageElement.textContent = "辅助执行";
  }
}

function collectInsight(node: InsightNode): void {
  collectedInsights.add(node.id);
  updateStats();
  renderDepartmentList();
  setLastEvent(`${node.department.shortName} 记录洞察`);
  showToast(`<strong>${node.department.shortName}</strong> 已记录洞察：${node.fact}`);
}

function runScenario(scenarioId: string, department: SceneDepartment): void {
  const scenario = department.scenarios.find((item) => item.id === scenarioId);
  if (!scenario) {
    return;
  }

  completedScenarios.add(scenario.id);
  updateStats();
  renderDepartmentList();
  openDepartmentModal(department, scenario.id);
  setLastEvent(`${department.shortName} 执行 ${scenario.title}`);
  showToast(`<strong>${department.shortName}</strong> 已执行场景：${scenario.title}`);
}

function teleportToDepartment(department: SceneDepartment): void {
  player.x = department.walkwayRect.left + department.walkwayRect.width / 2;
  player.y = department.walkwayRect.top + department.walkwayRect.height / 2;
  activeDepartmentId = department.id;
  currentZoneElement.textContent = department.shortName;
  renderDepartmentList();
  setLastEvent(`前往 ${department.shortName} 工位`);
  showToast(`<strong>${department.shortName}</strong> 已切换，工位会话已就绪。`);
}

function syncUiVisibility(): void {
  document.body.classList.toggle("ui-minimal", uiMinimal);
  uiToggleButton.setAttribute("aria-pressed", String(uiMinimal));
  uiToggleButton.textContent = uiMinimal ? "显示 UI" : "隐藏 UI";
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

  surfaceContext.fillStyle = withAlpha(accent, active ? 0.72 : 0.34);
  surfaceContext.fillRect(guideLeft, walkway.top + 3, guideWidth, Math.max(4, walkway.height - 6));
  surfaceContext.fillRect(walkway.left + 2, walkway.top + 2, walkway.width - 4, 2);
  surfaceContext.fillRect(walkway.left + 2, walkway.top + walkway.height - 4, walkway.width - 4, 2);

  surfaceContext.fillStyle = active ? "#f7fbff" : adjustHex(accent, 14);
  surfaceContext.fillRect(walkway.left + 4, thresholdY, walkway.width - 8, 2);

  surfaceContext.fillStyle = pulseColor(elapsed + pulseOffset, accent, "#f7fbff");
  surfaceContext.fillRect(walkway.left + 2, beaconY, 3, 3);
  surfaceContext.fillRect(walkway.left + walkway.width - 5, beaconY, 3, 3);
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
  const wall = rectToScreen({ left: officeRect.left, top: officeRect.top, width: officeRect.width, height: WALL_HEIGHT });
  const resourceHub = rectToScreen(resourceHubRect);
  const lounge = rectToScreen(centralLoungeRect);
  const refreshHub = rectToScreen(refreshHubRect);
  const ticker = rectToScreen(corridorTickerRect);
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

  drawPixelFrame(surfaceContext, office, "#7f856f", "#262b44", "#0a0c14", 4);
  surfaceContext.fillStyle = "#738063";
  surfaceContext.fillRect(floor.left, floor.top, floor.width, floor.height);
  drawPattern(surfaceContext, floor, "#c7ba99", "#b9ab89", Math.max(10, Math.round(camera.zoom * 8)));
  drawZone(resourceHub, "#68778c", "#5c687c", "#97b2dc");
  drawZone(lounge, "#7a6d63", "#6e6158", "#bf9f84");
  drawZone(refreshHub, "#6a5d55", "#5d5149", "#d6bb92");
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
  });
  departments.forEach((department, index) => {
    const dock = rectToScreen({
      left: department.walkwayRect.left + 2,
      top: department.approachSide === "down" ? corridorRect.top + 8 : corridorRect.top + corridorRect.height - 14,
      width: Math.max(8, department.walkwayRect.width - 4),
      height: 6,
    });
    surfaceContext.fillStyle = withAlpha(department.accent, department.id === activeDepartmentId ? 0.78 : 0.42);
    surfaceContext.fillRect(dock.left, dock.top, dock.width, dock.height);
    surfaceContext.fillStyle = pulseColor(elapsed + index * 0.4, adjustHex(department.accent, 18), "#f7fbff");
    surfaceContext.fillRect(dock.left + 2, dock.top + 2, Math.max(2, dock.width - 4), 2);
  });

  surfaceContext.fillStyle = "#7d8db3";
  surfaceContext.fillRect(wall.left, wall.top, wall.width, wall.height);
  surfaceContext.fillStyle = "#5b6889";
  surfaceContext.fillRect(wall.left, wall.top + wall.height - 4, wall.width, 4);
  drawPixelFrame(surfaceContext, ticker, "#22314c", "#89d0ff", "#090b12", 2);
  for (let index = 0; index < 5; index += 1) {
    surfaceContext.fillStyle = pulseColor(elapsed + index * 0.35, "#89d0ff", "#f4cf7d");
    surfaceContext.fillRect(ticker.left + 8 + index * 18, ticker.top + 5, 10, 4);
  }
  surfaceContext.fillStyle = "#d9ecff";
  surfaceContext.font = "bold 10px Monaco, 'Courier New', monospace";
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillText("OpenClaw Agent Office", wall.left + Math.round(wall.width / 2), wall.top + 8);
  surfaceContext.font = "7px Monaco, 'Courier New', monospace";
  surfaceContext.fillStyle = "#f4cf7d";
  surfaceContext.fillText("Cross-Dept Execution Grid", ticker.left + Math.round(ticker.width / 2), ticker.top + Math.round(ticker.height / 2));
}

function drawOfficeProp(prop: OfficeProp, elapsed: number, index: number): void {
  const rect = rectToScreen(prop.rect);
  if (!isScreenRectVisible(rect)) {
    return;
  }

  switch (prop.kind) {
    case "meeting":
      drawPixelFrame(surfaceContext, rect, "#8a6547", "#5f4634", "#0c0d12", 3);
      surfaceContext.fillStyle = "#70523b";
      surfaceContext.fillRect(rect.left + 4, rect.top + 6, rect.width - 8, rect.height - 12);
      surfaceContext.fillStyle = "#d7c29c";
      surfaceContext.fillRect(rect.left + 8, rect.top + 8, rect.width - 16, 3);
      surfaceContext.fillStyle = "#5a4331";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 2, rect.top + 10, 4, rect.height - 20);
      for (let chair = 0; chair < 4; chair += 1) {
        surfaceContext.fillStyle = "#3f5578";
        surfaceContext.fillRect(rect.left + 6 + chair * 10, rect.top - 4, 6, 4);
        surfaceContext.fillRect(rect.left + 6 + chair * 10, rect.top + rect.height, 6, 4);
      }
      break;
    case "plant":
      surfaceContext.fillStyle = "#7a5539";
      surfaceContext.fillRect(rect.left + 2, rect.top + rect.height - 4, rect.width - 4, 4);
      surfaceContext.fillStyle = pulseColor(elapsed + index, "#5e9b56", "#72bc65");
      surfaceContext.fillRect(rect.left + 1, rect.top + 2, rect.width - 2, rect.height - 6);
      surfaceContext.fillStyle = "#84d774";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 1, rect.top, 3, rect.height - 2);
      break;
    case "cabinet":
      drawPixelFrame(surfaceContext, rect, "#7e7e8e", "#50586a", "#0b0d14", 2);
      surfaceContext.fillStyle = "#d8dde8";
      surfaceContext.fillRect(rect.left + 3, rect.top + 5, rect.width - 6, 3);
      surfaceContext.fillRect(rect.left + 3, rect.top + 11, rect.width - 6, 3);
      surfaceContext.fillStyle = "#556072";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 1, rect.top + rect.height - 8, 2, 5);
      break;
    case "printer":
      drawPixelFrame(surfaceContext, rect, "#dce2ed", "#69748b", "#0b0d14", 2);
      surfaceContext.fillStyle = "#8a9cc0";
      surfaceContext.fillRect(rect.left + 2, rect.top + 2, rect.width - 4, 4);
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(rect.left + 4, rect.top + 7, rect.width - 8, 4);
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
      break;
    case "cooler":
      drawPixelFrame(surfaceContext, rect, "#d7eefc", "#7291c0", "#090b12", 2);
      surfaceContext.fillStyle = "#86baf0";
      surfaceContext.fillRect(rect.left + 2, rect.top + 3, rect.width - 4, 6);
      surfaceContext.fillStyle = "#edf5ff";
      surfaceContext.fillRect(rect.left + 4, rect.top + 12, rect.width - 8, 2);
      surfaceContext.fillStyle = "#7291c0";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 1, rect.top + 10, 2, 4);
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
      break;
    case "bookshelf":
      drawPixelFrame(surfaceContext, rect, "#896848", "#533a28", "#090b12", 2);
      for (let shelf = 0; shelf < 3; shelf += 1) {
        surfaceContext.fillStyle = shelf % 2 === 0 ? "#f1c16d" : "#8bc8ff";
        surfaceContext.fillRect(rect.left + 2, rect.top + 3 + shelf * 6, rect.width - 4, 3);
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
      break;
    case "receptionDesk":
      drawPixelFrame(surfaceContext, rect, "#8b6848", "#5a412d", "#090b12", 2);
      surfaceContext.fillStyle = "#6f5038";
      surfaceContext.fillRect(rect.left + 3, rect.top + 5, rect.width - 6, rect.height - 8);
      surfaceContext.fillStyle = "#dbe8fa";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 8, rect.top + 2, 16, 4);
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(rect.left + 8, rect.top + rect.height - 6, rect.width - 16, 2);
      break;
    case "diningTable":
      drawPixelFrame(surfaceContext, rect, "#9f744e", "#65462d", "#090b12", 2);
      surfaceContext.fillStyle = "#caa476";
      surfaceContext.fillRect(rect.left + 4, rect.top + 4, rect.width - 8, rect.height - 8);
      surfaceContext.fillStyle = "#52698d";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 4, rect.top - 4, 8, 4);
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 4, rect.top + rect.height, 8, 4);
      surfaceContext.fillRect(rect.left - 4, rect.top + Math.round(rect.height / 2) - 4, 4, 8);
      surfaceContext.fillRect(rect.left + rect.width, rect.top + Math.round(rect.height / 2) - 4, 4, 8);
      surfaceContext.fillStyle = "#e9d6b6";
      surfaceContext.fillRect(rect.left + Math.round(rect.width / 2) - 3, rect.top + Math.round(rect.height / 2) - 3, 6, 6);
      break;
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
      break;
    default:
      drawPixelFrame(surfaceContext, rect, "#5a6280", "#303752", "#090b12", 2);
  }
}

function getAreaGuideBubbleLines(guide: AreaGuide): string[] {
  const lines = splitBubbleText(guide.preview, 8).slice(0, 2);
  return [guide.label, ...lines, "按E看详情"];
}

function drawFloatingInfoBubble(
  anchor: Point,
  lines: string[],
  transform: SurfaceDrawTransform,
  accent: string
): void {
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

  const textWidth = lines.reduce((max, line) => Math.max(max, sceneContext.measureText(line).width), 0);
  const width = Math.ceil(textWidth + paddingX * 2);
  const height = Math.ceil(lines.length * lineHeight + paddingY * 2);
  const left = clamp(anchorOnCanvas.x - width / 2, margin, canvas.width - width - margin);
  const top = Math.max(margin, anchorOnCanvas.y - height - pointerHeight - 18 * uiScale);
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

  lines.forEach((line, index) => {
    sceneContext.fillStyle = index === 0 ? adjustHex(accent, -40) : "#202638";
    sceneContext.fillText(line, left + width / 2, top + paddingY + lineHeight / 2 + index * lineHeight);
  });
  sceneContext.restore();
}

function drawLobsterGuideSprite(anchor: Point, elapsed: number, active: boolean): void {
  const x = Math.round(anchor.x);
  const y = Math.round(anchor.y + Math.sin(elapsed * 2.6 + anchor.x * 0.03) * (active ? 0.8 : 0.35));
  const shell = active ? "#ff6c61" : "#ef564e";
  const shellDark = active ? "#d43f3b" : "#b73733";
  const claw = active ? "#f85f54" : "#df4f48";
  const eye = "#0c1626";
  const eyeGlow = "#61ebff";

  drawGroundShadow(x, y, 16);
  if (active) {
    surfaceContext.fillStyle = withAlpha("#ff8176", 0.32);
    surfaceContext.fillRect(x - 10, y - 12, 20, 20);
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

  surfaceContext.fillStyle = shell;
  rows.forEach((row) => surfaceContext.fillRect(x + row.left, y + row.offsetY, row.width, 1));
  surfaceContext.fillStyle = shellDark;
  rows.slice(5).forEach((row) => surfaceContext.fillRect(x + row.left + 2, y + row.offsetY, Math.max(2, row.width - 6), 1));

  surfaceContext.fillStyle = shell;
  surfaceContext.fillRect(x - 12, y - 1, 4, 4);
  surfaceContext.fillRect(x - 13, y, 4, 3);
  surfaceContext.fillRect(x + 8, y - 1, 4, 4);
  surfaceContext.fillRect(x + 9, y, 4, 3);
  surfaceContext.fillStyle = claw;
  surfaceContext.fillRect(x - 14, y + 1, 4, 3);
  surfaceContext.fillRect(x + 10, y + 1, 4, 3);

  surfaceContext.fillStyle = shellDark;
  surfaceContext.fillRect(x - 2, y + 6, 2, 4);
  surfaceContext.fillRect(x + 1, y + 6, 2, 4);

  surfaceContext.fillStyle = shell;
  surfaceContext.fillRect(x - 5, y - 11, 1, 3);
  surfaceContext.fillRect(x + 4, y - 11, 1, 3);
  surfaceContext.fillRect(x - 6, y - 12, 1, 1);
  surfaceContext.fillRect(x + 5, y - 12, 1, 1);
  surfaceContext.fillRect(x - 4, y - 12, 1, 1);
  surfaceContext.fillRect(x + 3, y - 12, 1, 1);

  surfaceContext.fillStyle = eye;
  surfaceContext.fillRect(x - 4, y - 4, 3, 3);
  surfaceContext.fillRect(x + 1, y - 4, 3, 3);
  surfaceContext.fillStyle = eyeGlow;
  surfaceContext.fillRect(x - 3, y - 3, 1, 1);
  surfaceContext.fillRect(x + 2, y - 3, 1, 1);
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

  drawLobsterGuideSprite(anchor, elapsed, hoveredGuide?.id === guide.id);
}

function drawSharedZone(zone: SharedZone, elapsed: number): void {
  const room = rectToScreen(zone.roomRect);
  const walkway = rectToScreen(zone.walkwayRect);
  if (!isScreenRectVisible(room) && !isScreenRectVisible(walkway)) {
    return;
  }

  surfaceContext.fillStyle = withAlpha(zone.accent, 0.18);
  surfaceContext.fillRect(walkway.left, walkway.top, walkway.width, walkway.height);

  drawRoomFrame(
    surfaceContext,
    room,
    walkway,
    adjustHex(zone.accent, -18),
    adjustHex(zone.accent, 12),
    "#090a10",
    2,
    zone.approachSide
  );
  surfaceContext.fillStyle = zone.kind === "reception" ? "#3d4861" : "#5b4837";
  surfaceContext.fillRect(room.left + 3, room.top + 4, room.width - 6, room.height - 8);
  drawEntranceGuide(room, walkway, zone.accent, zone.approachSide, elapsed, room.left * 0.015);

  const labelWidth = Math.max(walkway.width + 18, Array.from(zone.label).length * 10 + 22);
  const banner: Rect = {
    left: Math.round(walkway.left + walkway.width / 2 - labelWidth / 2),
    top: zone.approachSide === "down"
      ? walkway.top + 3
      : walkway.top + walkway.height - DEPARTMENT_BANNER_HEIGHT - 3,
    width: labelWidth,
    height: DEPARTMENT_BANNER_HEIGHT,
  };
  drawPixelFrame(
    surfaceContext,
    banner,
    adjustHex(zone.accent, -22),
    adjustHex(zone.accent, 8),
    "#10121a",
    2
  );
  surfaceContext.fillStyle = "#f6f7ff";
  surfaceContext.font = `bold ${DEPARTMENT_BANNER_FONT_SIZE}px Monaco, 'Courier New', monospace`;
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillText(zone.label, banner.left + Math.round(banner.width / 2), banner.top + Math.round(banner.height / 2));

  drawSharedZoneDecor(zone, room, elapsed);
}

function drawDepartment(department: SceneDepartment, elapsed: number): void {
  const room = rectToScreen(department.roomRect);
  const walkway = rectToScreen(department.walkwayRect);
  const departmentNpcs = npcs.filter((npc) => npc.department.id === department.id);
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

  const accentDark = adjustHex(department.accent, -52);
  const accentLight = adjustHex(department.accent, 18);
  const state = getDepartmentVisualState(department);
  const completed = getDepartmentCompletion(department);
  const active = department.id === activeDepartmentId;

  surfaceContext.fillStyle = active ? withAlpha(department.accent, 0.22) : "rgba(0,0,0,0.1)";
  surfaceContext.fillRect(walkway.left, walkway.top, walkway.width, walkway.height);

  drawRoomFrame(
    surfaceContext,
    room,
    walkway,
    state === "done" ? adjustHex(department.accent, -20) : "#6f553f",
    active ? "#ffffff" : state === "done" ? "#8be08c" : "#4c3c31",
    "#090a10",
    2,
    department.approachSide
  );
  surfaceContext.fillStyle = "#4b3728";
  surfaceContext.fillRect(room.left + 3, room.top + 4, room.width - 6, room.height - 8);
  drawEntranceGuide(room, walkway, department.accent, department.approachSide, elapsed, department.decorSeed, active);

  const labelWidth = Math.max(
    walkway.width + DEPARTMENT_BANNER_WALKWAY_PADDING,
    Array.from(department.shortName).length * DEPARTMENT_BANNER_FONT_SIZE + DEPARTMENT_BANNER_TEXT_PADDING
  );
  const banner: Rect = {
    left: Math.round(walkway.left + walkway.width / 2 - labelWidth / 2),
    top: department.approachSide === "down"
      ? walkway.top + 3
      : walkway.top + walkway.height - DEPARTMENT_BANNER_HEIGHT - 3,
    width: labelWidth,
    height: DEPARTMENT_BANNER_HEIGHT,
  };
  drawPixelFrame(surfaceContext, banner, accentDark, accentLight, "#10121a", 2);
  surfaceContext.fillStyle = "#f6f7ff";
  surfaceContext.font = `bold ${DEPARTMENT_BANNER_FONT_SIZE}px Monaco, 'Courier New', monospace`;
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillText(department.shortName, banner.left + Math.round(banner.width / 2), banner.top + Math.round(banner.height / 2));

  drawDepartmentDecor(department, room, elapsed);
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

  if (state === "busy") {
    drawPixelSpeechBubble(
      { x: room.left + Math.round(room.width / 2), y: room.top - 10 },
      completed === 0 ? "..." : `${completed}/${department.scenarios.length}`
    );
  }
}

function drawPixelSpeechBubble(anchor: Point, text: string): void {
  const lines = splitBubbleText(text);
  const longestLine = lines.reduce((max, line) => Math.max(max, Array.from(line).length), 0);
  const width = Math.max(18, longestLine * 8 + 10);
  const height = 8 + lines.length * 8;
  const left = clamp(anchor.x - Math.round(width / 2), 2, surface.width - width - 2);
  const top = Math.max(2, anchor.y - height + 2);
  const bubbleRect: Rect = {
    left,
    top,
    width,
    height,
  };
  drawPixelFrame(surfaceContext, bubbleRect, "#f3f6fb", "#4a5673", "#090b12", 2);
  surfaceContext.fillStyle = "#202638";
  surfaceContext.font = "bold 7px 'PingFang SC', 'Microsoft YaHei', Monaco, 'Courier New', monospace";
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  for (let index = 0; index < lines.length; index += 1) {
    surfaceContext.fillText(
      lines[index] ?? "",
      bubbleRect.left + Math.round(bubbleRect.width / 2),
      bubbleRect.top + 6 + index * 8
    );
  }
  surfaceContext.fillStyle = "#f3f6fb";
  surfaceContext.fillRect(anchor.x - 1, bubbleRect.top + bubbleRect.height, 3, 4);
}

function drawNpcSpeechBubble(anchor: Point, text: string, transform: SurfaceDrawTransform): void {
  const lines = splitBubbleText(text);
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
  sceneContext.font = `600 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  sceneContext.textAlign = "center";
  sceneContext.textBaseline = "middle";

  const textWidth = lines.reduce((max, line) => Math.max(max, sceneContext.measureText(line).width), 0);
  const width = Math.ceil(textWidth + paddingX * 2);
  const height = Math.ceil(lines.length * lineHeight + paddingY * 2);
  const left = clamp(anchorOnCanvas.x - width / 2, margin, canvas.width - width - margin);
  const top = Math.max(margin, anchorOnCanvas.y - height - pointerHeight - 18 * uiScale);
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
  terminal: ScenarioTerminal,
  position: Point,
  elapsed: number,
  index: number
): void {
  const done = completedScenarios.has(terminal.scenario.id);
  const hovered = hoveredTerminal?.scenario.id === terminal.scenario.id;
  const pulse = 0.55 + Math.sin(elapsed * 3 + terminal.pulseOffset) * 0.2;
  const accent = done ? "#8be08c" : hovered ? "#89d0ff" : terminal.department.accent;
  const outline = hovered ? "#f7fbff" : adjustHex(accent, 28);

  const baseRect: Rect = {
    left: position.x - 6,
    top: position.y - 4,
    width: 12,
    height: 8,
  };
  drawPixelFrame(surfaceContext, baseRect, done ? "#35522f" : "#1d2437", outline, "#03050d", 1);
  surfaceContext.fillStyle = withAlpha(accent, pulse);
  surfaceContext.fillRect(baseRect.left + 2, baseRect.top + 2, baseRect.width - 4, 3);
  surfaceContext.fillStyle = "#f4f7ff";
  surfaceContext.font = "bold 6px Monaco, 'Courier New', monospace";
  surfaceContext.textAlign = "center";
  surfaceContext.textBaseline = "middle";
  surfaceContext.fillText(String(index + 1), baseRect.left + Math.round(baseRect.width / 2), baseRect.top + 6);
}

function drawInsightNode(node: InsightNode, elapsed: number): void {
  const position = worldToScreen(node.position.x, node.position.y);
  const collected = collectedInsights.has(node.id);
  const glow = collected ? "#8be08c" : "#ffde7a";
  const pulse = Math.sin(elapsed * 4 + node.pulseOffset) > 0 ? 1 : 0;

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
    drawNpcSprite(anchor, npc.facing, npc.palette, bob);
  }
}

function drawNpcBubbleOverlays(transform: SurfaceDrawTransform): void {
  const visibleCandidates = npcs
    .filter((npc) => isNpcBubbleVisibleOnScreen(npc))
    .sort((left, right) => right.bubbleTimer - left.bubbleTimer);
  const renderedTexts = new Set<string>();
  let renderedCount = 0;

  for (const npc of visibleCandidates) {
    if (renderedCount >= MAX_VISIBLE_NPC_BUBBLES || renderedTexts.has(npc.bubbleText)) {
      continue;
    }

    const anchor = worldToScreen(npc.x, npc.y);
    drawNpcSpeechBubble({ x: anchor.x, y: anchor.y - 16 }, npc.bubbleText, transform);
    renderedTexts.add(npc.bubbleText);
    renderedCount += 1;
  }
}

function drawAreaGuideBubbleOverlays(transform: SurfaceDrawTransform): void {
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
    hoveredGuide.accent
  );
}

function drawDepartmentDecor(department: SceneDepartment, room: Rect, elapsed: number): void {
  const accent = adjustHex(department.accent, 12);
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
    drawPixelFrame(surfaceContext, rect, fill, border, shadow, 1);
    return rect;
  };

  const threshold = zone(0.16, department.approachSide === "down" ? 0.84 : 0.08, 0.68, 0.04);
  surfaceContext.fillStyle = "#263047";
  surfaceContext.fillRect(threshold.left, threshold.top, threshold.width, threshold.height);

  switch (department.id) {
    case "marketing": {
      drawPattern(surfaceContext, floorRect, "#705646", "#624a3e", step);
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
      surfaceContext.fillStyle = pulseColor(elapsed + department.decorSeed, accent, "#9ec9ff");
      surfaceContext.fillRect(mediaWall.left + 4, mediaWall.top + 4, mediaWall.width - 8, mediaWall.height - 8);

      block(0.10, 0.58, 0.28, 0.18, "#425273", "#24324b");
      const campaignDesk = block(0.46, 0.58, 0.20, 0.10, "#8a6547", "#5f4634");
      surfaceContext.fillStyle = "#314a65";
      surfaceContext.fillRect(campaignDesk.left + 4, campaignDesk.top + 3, campaignDesk.width - 8, 3);
      const planter = block(0.78, 0.54, 0.10, 0.24, "#5d8e56", "#335234");
      surfaceContext.fillStyle = "#84d774";
      surfaceContext.fillRect(planter.left + Math.round(planter.width / 2) - 1, planter.top + 1, 3, planter.height - 3);
      break;
    }
    case "sales": {
      drawPattern(surfaceContext, floorRect, "#6d5748", "#5e4b3f", step);
      const crmBar = block(0.14, 0.12, 0.68, 0.12, "#6a4d39", "#3d2d24");
      for (let index = 0; index < 4; index += 1) {
        surfaceContext.fillStyle = pulseColor(elapsed + index * 0.3, accent, "#f6d07d");
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
      drawPattern(surfaceContext, floorRect, "#2c364d", "#263043", step);
      const bench = block(0.08, 0.12, 0.78, 0.14, "#3b455f", "#1d293b");
      const monitorCount = Math.max(4, Math.floor((bench.width - 18) / 16));
      const spacing = Math.max(12, Math.floor((bench.width - 20) / monitorCount));
      for (let index = 0; index < monitorCount; index += 1) {
        surfaceContext.fillStyle = pulseColor(elapsed + department.decorSeed + index * 0.35, accent, "#89d0ff");
        surfaceContext.fillRect(bench.left + 6 + index * spacing, bench.top + 4, 10, 5);
      }

      const rack = block(0.10, 0.42, 0.20, 0.30, "#56606f", "#2c3441");
      for (let shelf = 0; shelf < 4; shelf += 1) {
        surfaceContext.fillStyle = shelf % 2 === 0 ? "#89d0ff" : "#8be08c";
        surfaceContext.fillRect(rack.left + 4, rack.top + 4 + shelf * 8, rack.width - 8, 3);
      }

      const worktable = block(0.44, 0.50, 0.24, 0.12, "#637797", "#30415a");
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
      drawPattern(surfaceContext, floorRect, "#69523c", "#5b4634", step);
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
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(tower.left + 4, tower.top + 6, tower.width - 8, 3);
      break;
    }
    case "quality": {
      drawPattern(surfaceContext, floorRect, "#46626b", "#3b545c", step);
      const inspection = block(0.10, 0.14, 0.22, 0.14, "#d7eefc", "#7291c0");
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(inspection.left + 5, inspection.top + 5, inspection.width - 10, 3);
      const records = block(0.48, 0.12, 0.26, 0.18, "#edf3fb", "#6d7b9a");
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(records.left + 6, records.top + 5, records.width - 12, 2);
      surfaceContext.fillStyle = "#e48d6f";
      surfaceContext.fillRect(records.left + 10, records.top + 10, records.width - 20, 2);
      const lightTable = block(0.12, 0.50, 0.14, 0.18, "#f2f6fb", "#7aa6d8");
      surfaceContext.fillStyle = "#d7ff75";
      surfaceContext.fillRect(lightTable.left + Math.round(lightTable.width / 2) - 1, lightTable.top + 4, 3, lightTable.height - 8);
      surfaceContext.fillRect(lightTable.left + 4, lightTable.top + Math.round(lightTable.height / 2) - 1, lightTable.width - 8, 3);
      const rack = block(0.64, 0.44, 0.16, 0.26, "#7b8db1", "#33415c");
      surfaceContext.fillStyle = "#8be08c";
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
      drawPattern(surfaceContext, floorRect, "#6b563f", "#5e4b36", step);
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
      drawPattern(surfaceContext, floorRect, "#4e5368", "#44495f", step);
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
        surfaceContext.fillStyle = pulseColor(elapsed + desk.left * 0.01, "#89d0ff", accent);
        surfaceContext.fillRect(desk.left + 4, desk.top + 4, desk.width - 8, 4);
      }
      const knowledge = block(0.70, 0.40, 0.12, 0.08, "#5d6a82", "#354055");
      surfaceContext.fillStyle = "#f7fbff";
      surfaceContext.fillRect(knowledge.left + 4, knowledge.top + 3, knowledge.width - 8, 2);
      break;
    }
    case "hr": {
      drawPattern(surfaceContext, floorRect, "#625a48", "#564f3e", step);
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
      drawPattern(surfaceContext, floorRect, "#495066", "#40475c", step);
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
      const vault = block(0.66, 0.56, 0.16, 0.20, "#4a5870", "#233047");
      surfaceContext.fillStyle = "#f4cf7d";
      surfaceContext.fillRect(vault.left + Math.round(vault.width / 2) - 1, vault.top + Math.round(vault.height / 2) - 1, 3, 3);
      break;
    }
    case "management": {
      drawPattern(surfaceContext, floorRect, "#68563d", "#5a4a33", step);
      const screen = block(0.10, 0.14, 0.78, 0.14, "#d0b46a", "#7f6338");
      for (let index = 0; index < 4; index += 1) {
        surfaceContext.fillStyle = pulseColor(elapsed + index * 0.45, accent, "#f7fbff");
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
      const archive = block(0.08, 0.50, 0.10, 0.24, "#7e7e8e", "#50586a");
      surfaceContext.fillStyle = "#dce2ed";
      surfaceContext.fillRect(archive.left + 4, archive.top + 6, archive.width - 8, 3);
      const control = block(0.80, 0.48, 0.10, 0.26, "#425273", "#24324b");
      surfaceContext.fillStyle = "#89d0ff";
      surfaceContext.fillRect(control.left + 4, control.top + 6, control.width - 8, 3);
      break;
    }
    default:
      drawPattern(surfaceContext, floorRect, "#5f564b", "#564d44", step);
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

  if (zone.kind === "reception") {
    drawPattern(surfaceContext, floorRect, "#5f677d", "#566077", step);
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
    return;
  }

  drawPattern(surfaceContext, floorRect, "#7b6956", "#705f4f", step);
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
}

function pulseColor(time: number, primary: string, secondary: string): string {
  return Math.sin(time * 4) > 0 ? primary : secondary;
}

function drawGroundShadow(x: number, y: number, width: number): void {
  surfaceContext.fillStyle = "#0a0c14";
  surfaceContext.fillRect(x - Math.round(width / 2), y + 8, width, 3);
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
  drawHeroMarker(x, y, PLAYER_MARKER_OFFSET + Math.max(0, drawHeight - PLAYER_SPRITE_TARGET_HEIGHT));
}

function drawPlayer(elapsed: number): void {
  const position = worldToScreen(player.x, player.y);
  const walkStride = player.step > 0 ? Math.sin(player.step) : 0;
  const bob = player.step > 0 ? walkStride * 1.8 : Math.sin(elapsed * 2) * 0.35;
  drawPlayerSprite(position, player.facing, bob, walkStride);
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
  sharedZones.forEach((zone) => drawSharedZone(zone, elapsed));
  officeProps.forEach((prop, index) => drawOfficeProp(prop, elapsed, index));
  departments.forEach((department) => drawDepartment(department, elapsed));
  [...areaGuides].sort((left, right) => left.position.y - right.position.y).forEach((guide) => drawAreaGuide(guide, elapsed));
  drawPlayer(elapsed);
  drawScreenEffects();

  sceneContext.clearRect(0, 0, canvas.width, canvas.height);
  sceneContext.imageSmoothingEnabled = false;

  const transform = getSurfaceDrawTransform();
  const drawWidth = surface.width * transform.scale;
  const drawHeight = surface.height * transform.scale;

  sceneContext.drawImage(surface, transform.drawLeft, transform.drawTop, drawWidth, drawHeight);
  drawNpcBubbleOverlays(transform);
  drawAreaGuideBubbleOverlays(transform);
}

function renderMinimap(): void {
  const width = minimap.width;
  const height = minimap.height;
  const padding = 16;
  minimapHits.length = 0;

  minimapContext.clearRect(0, 0, width, height);
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
      minimapContext.font = "bold 7px Monaco, 'Courier New', monospace";
      minimapContext.textAlign = "center";
      minimapContext.textBaseline = "middle";
      minimapContext.fillText(label, topLeft.x + zoneWidth / 2, topLeft.y + zoneHeight / 2);
    }
  };
  drawMiniZone(resourceHubRect, "rgba(109, 133, 174, 0.52)", "TOOLS");
  drawMiniZone(centralLoungeRect, "rgba(166, 130, 109, 0.46)", "LOUNGE");
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
  minimapContext.fillStyle = "#7d8db3";
  minimapContext.fillRect(padding, padding, width - padding * 2, 18);

  sharedZones.forEach((zone) => {
    const topLeft = project(zone.roomRect.left, zone.roomRect.top);
    const bottomRight = project(zone.roomRect.left + zone.roomRect.width, zone.roomRect.top + zone.roomRect.height);
    const rectWidth = bottomRight.x - topLeft.x;
    const rectHeight = bottomRight.y - topLeft.y;
    const active = zone.id === activeSharedZoneId;

    minimapContext.fillStyle = withAlpha(zone.accent, active ? 0.44 : 0.26);
    minimapContext.fillRect(topLeft.x, topLeft.y, rectWidth, rectHeight);
    minimapContext.strokeStyle = active ? "#f7fbff" : withAlpha(zone.accent, 0.72);
    minimapContext.lineWidth = 1.5;
    minimapContext.strokeRect(topLeft.x + 1, topLeft.y + 1, rectWidth - 2, rectHeight - 2);

    if (rectWidth > 34) {
      minimapContext.fillStyle = "rgba(9, 11, 18, 0.42)";
      minimapContext.fillRect(topLeft.x + 4, topLeft.y + rectHeight / 2 - 6, rectWidth - 8, 12);
      minimapContext.fillStyle = "#f6f7ff";
      minimapContext.font = "bold 8px Monaco, 'Courier New', monospace";
      minimapContext.textAlign = "center";
      minimapContext.textBaseline = "middle";
      minimapContext.fillText(zone.label, topLeft.x + rectWidth / 2, topLeft.y + rectHeight / 2);
    }
  });

  departments.forEach((department) => {
    const topLeft = project(department.roomRect.left, department.roomRect.top);
    const bottomRight = project(
      department.roomRect.left + department.roomRect.width,
      department.roomRect.top + department.roomRect.height
    );
    const active = department.id === activeDepartmentId;
    const rectWidth = bottomRight.x - topLeft.x;
    const rectHeight = bottomRight.y - topLeft.y;

    minimapContext.fillStyle = withAlpha(department.accent, active ? 0.72 : 0.36);
    minimapContext.fillRect(topLeft.x, topLeft.y, rectWidth, rectHeight);
    minimapContext.strokeStyle = active ? "#f7fbff" : withAlpha("#8eb6ff", 0.4);
    minimapContext.lineWidth = 2;
    minimapContext.strokeRect(topLeft.x + 1, topLeft.y + 1, rectWidth - 2, rectHeight - 2);

    minimapContext.fillStyle = "rgba(9, 11, 18, 0.36)";
    minimapContext.fillRect(topLeft.x + 4, topLeft.y + rectHeight / 2 - 6, rectWidth - 8, 12);
    minimapContext.fillStyle = "#f6f7ff";
    minimapContext.font = rectWidth > 26
      ? "bold 9px Monaco, 'Courier New', monospace"
      : "bold 7px Monaco, 'Courier New', monospace";
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

    minimapHits.push({
      department,
      x: topLeft.x,
      y: topLeft.y,
      width: rectWidth,
      height: rectHeight,
    });
  });

  const playerPoint = project(player.x, player.y);
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
  minimapContext.font = "bold 9px Monaco, 'Courier New', monospace";
  minimapContext.textAlign = "left";
  minimapContext.fillText("Agent Office", padding, height - 10);
  minimapContext.textAlign = "right";
  minimapContext.fillText(
    activeDepartmentId
      ? departments.find((department) => department.id === activeDepartmentId)?.shortName ?? "公共区"
      : sharedZones.find((zone) => zone.id === activeSharedZoneId)?.label ?? "公共区",
    width - padding,
    height - 10
  );
}

function updateCamera(delta: number): void {
  camera.zoom = lerp(camera.zoom, camera.targetZoom, 1 - Math.pow(0.0008, delta));
  const halfWidth = surface.width / camera.zoom / 2;
  const halfHeight = surface.height / camera.zoom / 2;

  const targetX = clamp(player.x, worldBounds.left + halfWidth, worldBounds.left + worldBounds.width - halfWidth);
  const targetY = clamp(
    player.y - 4,
    worldBounds.top + halfHeight,
    worldBounds.top + worldBounds.height - halfHeight
  );

  camera.x = lerp(camera.x, targetX, 1 - Math.pow(0.0009, delta));
  camera.y = lerp(camera.y, targetY, 1 - Math.pow(0.0009, delta));
}

function updateWorld(delta: number): void {
  const movement = { x: 0, y: 0 };
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
  }

  const turnDirection = (touchControls.has("turn-right") ? 1 : 0) - (touchControls.has("turn-left") ? 1 : 0);

  if (movement.x !== 0 || movement.y !== 0) {
    const length = Math.hypot(movement.x, movement.y) || 1;
    const normalizedX = movement.x / length;
    const normalizedY = movement.y / length;
    movePlayer(normalizedX * PLAYER_SPEED * delta, normalizedY * PLAYER_SPEED * delta);
    player.facing = lerpAngle(player.facing, Math.atan2(normalizedY, normalizedX), 1 - Math.pow(0.001, delta));
    player.step += delta * 12;
  } else {
    player.step = 0;
    if (turnDirection !== 0) {
      player.facing += turnDirection * TURN_SPEED * delta;
    }
  }

  updateCamera(delta);

  hoveredGuide = findNearestGuide();
  hoveredTerminal = findNearestTerminal();
  hoveredInsight = findNearestInsight();
  updatePrompt();

  const currentDepartment = getDepartmentAtPosition(player.x, player.y);
  const currentSharedZone = currentDepartment ? null : getSharedZoneAtPosition(player.x, player.y);
  const nextActiveId = currentDepartment?.id ?? "";
  if (nextActiveId !== activeDepartmentId) {
    activeDepartmentId = nextActiveId;
    renderDepartmentList();
  }
  activeSharedZoneId = currentSharedZone?.id ?? "";
  currentZoneElement.textContent = currentDepartment?.shortName ?? currentSharedZone?.label ?? "中央办公区";

  mapFloorIndicator.textContent = "L1 Agent Office";
}

function animate(now: number): void {
  const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  const elapsed = now / 1000;

  updateWorld(delta);
  renderScene(elapsed);
  renderMinimap();
  window.requestAnimationFrame(animate);
}

function initializeUi(): void {
  thesisList.innerHTML = thesisPoints.map((point) => `<li>${point}</li>`).join("");
  renderSourceList();
  renderDepartmentList();
  updateStats();
  syncUiVisibility();
  currentZoneElement.textContent = "中央办公区";
  updateClockPanel();
}

initializeUi();
resizeCanvases();
renderMinimap();
window.requestAnimationFrame(animate);
window.setInterval(updateClockPanel, 1000);

window.addEventListener("resize", resizeCanvases);

window.addEventListener("keydown", (event) => {
  if (shouldIgnoreKeyboardEvent(event)) {
    return;
  }

  if (isHandledKeyboardCode(event.code)) {
    event.preventDefault();
  }

  if (event.code === "KeyE") {
    if (!event.repeat && hoveredGuide && modal.classList.contains("hidden")) {
      openAreaGuideModal(hoveredGuide);
    } else if (!event.repeat && hoveredTerminal && modal.classList.contains("hidden")) {
      openDepartmentModal(hoveredTerminal.department, hoveredTerminal.scenario.id);
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
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    keys.clear();
    touchControls.clear();
  }
});

canvas.addEventListener("pointerdown", (event) => {
  isDragging = true;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
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
  isDragging = false;
  canvas.releasePointerCapture(event.pointerId);
});

canvas.addEventListener("pointerleave", () => {
  isDragging = false;
});

canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    camera.targetZoom = clamp(camera.targetZoom - event.deltaY * 0.0025, MIN_ZOOM, MAX_ZOOM);
  },
  { passive: false }
);

mobileControls.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
  const control = button.dataset.control as ControlKey | undefined;
  if (!control) {
    return;
  }

  const onPress = (event: PointerEvent) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    touchControls.add(control);
  };
  const onRelease = (event?: PointerEvent) => {
    if (event && button.hasPointerCapture(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }
    touchControls.delete(control);
  };

  button.addEventListener("pointerdown", onPress);
  button.addEventListener("pointerup", onRelease);
  button.addEventListener("pointerleave", onRelease);
  button.addEventListener("pointercancel", onRelease);
});

closeModalButton.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).classList.contains("modal-backdrop")) {
    closeModal();
  }
});

departmentList.addEventListener("click", (event) => {
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
  const rect = minimap.getBoundingClientRect();
  const scaleX = minimap.width / rect.width;
  const scaleY = minimap.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
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
  uiMinimal = !uiMinimal;
  syncUiVisibility();
});

modalContent.addEventListener("click", (event) => {
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
