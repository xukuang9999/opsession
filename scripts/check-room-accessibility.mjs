const PLAYER_RADIUS = 0.72;
const PLAYER_DIAMETER = PLAYER_RADIUS * 2;

const ROOM_WALL_DOOR_WIDTH = 9.2;
const ROOM_DOOR_PANEL_WIDTH = 3.2;
const ROOM_DOOR_OPEN_OFFSET = 1.72;

const MAIN_ENTRANCE_WIDTH = 10.8;
const MAIN_ENTRANCE_PANEL_WIDTH = 2.8;
const MAIN_ENTRANCE_OPEN_OFFSET = 2.2;

const START_X = -210;
const DEFAULT_SPACING = 8;
const SPACING_OVERRIDES = new Map([["quality", 20]]);
const CORRIDOR_CENTER_Z = -15;

const rooms = [
  { id: "marketing", label: "市场部", width: 34, depth: 26 },
  { id: "sales", label: "销售部", width: 32, depth: 28 },
  { id: "development", label: "开发部", width: 38, depth: 30 },
  { id: "production", label: "生产部", width: 36, depth: 30 },
  { id: "quality", label: "品质部", width: 30, depth: 26 },
  { id: "warehouse", label: "仓库", width: 40, depth: 30 },
  { id: "support", label: "客服部", width: 34, depth: 28 },
  { id: "hr", label: "HR", width: 32, depth: 26 },
  { id: "finance", label: "财务部", width: 32, depth: 26 },
  { id: "management", label: "管理层", width: 42, depth: 32 },
];

function computeDoorGap(panelWidth, openOffset) {
  const panelHalfWidth = panelWidth / 2;
  const panelCenterOffset = panelHalfWidth + 0.08 + openOffset;
  return panelCenterOffset * 2 - panelWidth;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const roomDoorGap = computeDoorGap(ROOM_DOOR_PANEL_WIDTH, ROOM_DOOR_OPEN_OFFSET);
const mainEntranceGap = computeDoorGap(MAIN_ENTRANCE_PANEL_WIDTH, MAIN_ENTRANCE_OPEN_OFFSET);

assert(
  ROOM_WALL_DOOR_WIDTH > PLAYER_DIAMETER,
  `房间墙体门洞过窄：${ROOM_WALL_DOOR_WIDTH.toFixed(2)} <= ${PLAYER_DIAMETER.toFixed(2)}`
);
assert(
  roomDoorGap > PLAYER_DIAMETER,
  `房间滑门净宽过窄：${roomDoorGap.toFixed(2)} <= ${PLAYER_DIAMETER.toFixed(2)}`
);
assert(
  MAIN_ENTRANCE_WIDTH > PLAYER_DIAMETER,
  `主入口门洞过窄：${MAIN_ENTRANCE_WIDTH.toFixed(2)} <= ${PLAYER_DIAMETER.toFixed(2)}`
);
assert(
  mainEntranceGap > PLAYER_DIAMETER,
  `主入口滑门净宽过窄：${mainEntranceGap.toFixed(2)} <= ${PLAYER_DIAMETER.toFixed(2)}`
);

let cursorX = START_X;
const positionedRooms = rooms.map((room) => {
  const centerX = cursorX + room.width / 2;
  const position = {
    ...room,
    centerX,
    leftX: centerX - room.width / 2,
    rightX: centerX + room.width / 2,
    doorZ: 10 - room.depth / 2 + 0.12,
  };
  cursorX += room.width + (SPACING_OVERRIDES.get(room.id) ?? DEFAULT_SPACING);
  return position;
});

const results = positionedRooms.map((room) => {
  const corridorReachable = room.centerX >= positionedRooms[0].leftX - 14;
  const corridorToDoorDepth = room.doorZ - CORRIDOR_CENTER_Z;
  const doorwayClear = roomDoorGap > PLAYER_DIAMETER;
  const wallOpeningClear = ROOM_WALL_DOOR_WIDTH > PLAYER_DIAMETER;

  assert(corridorReachable, `${room.id} 无法从起点沿主走廊到达入口 x 坐标`);
  assert(corridorToDoorDepth > 0, `${room.id} 的入口不在主走廊前方`);
  assert(wallOpeningClear, `${room.id} 的墙体门洞不足以让玩家通过`);
  assert(doorwayClear, `${room.id} 的滑门净宽不足以让玩家通过`);

  return {
    room: room.label,
    corridorToDoorDepth,
    wallOpening: ROOM_WALL_DOOR_WIDTH,
    slidingGap: roomDoorGap,
  };
});

console.log("OpenClaw room accessibility check");
console.log(`- player diameter: ${PLAYER_DIAMETER.toFixed(2)}`);
console.log(`- main entrance wall opening: ${MAIN_ENTRANCE_WIDTH.toFixed(2)}`);
console.log(`- main entrance sliding gap: ${mainEntranceGap.toFixed(2)}`);
console.log(`- room wall opening: ${ROOM_WALL_DOOR_WIDTH.toFixed(2)}`);
console.log(`- room sliding gap: ${roomDoorGap.toFixed(2)}`);
console.log("");

results.forEach((result, index) => {
  console.log(
    `${index + 1}. ${result.room} | corridor->door depth ${result.corridorToDoorDepth.toFixed(2)} | wall opening ${result.wallOpening.toFixed(2)} | sliding gap ${result.slidingGap.toFixed(2)}`
  );
});

console.log("");
console.log(`PASS ${results.length} rooms + main entrance checked.`);
