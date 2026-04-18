import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OFFICE_WIDTH = 960;
const OFFICE_HEIGHT = 540;
const FLOOR_PADDING = 12;
const CORRIDOR_TOP = 150;
const CORRIDOR_HEIGHT = 230;
const CORRIDOR_LANE_PADDING = 24;

const layoutPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/office-layouts.json");

const logicalAreas = {
  marketing: 34 * 26,
  sales: 32 * 28,
  development: 38 * 30,
  support: 34 * 28,
  management: 42 * 32,
  production: 36 * 30,
  quality: 30 * 26,
  warehouse: 40 * 30,
  hr: 32 * 26,
  finance: 32 * 26,
};

const rowOrder = {
  top: ["marketing", "sales", "development", "support", "management"],
  bottom: ["production", "quality", "warehouse", "hr", "finance"],
};

function rectRight(rect) {
  return rect.left + rect.width;
}

function rectBottom(rect) {
  return rect.top + rect.height;
}

function pointInRect(point, rect) {
  return (
    point.x >= rect.left &&
    point.x <= rectRight(rect) &&
    point.y >= rect.top &&
    point.y <= rectBottom(rect)
  );
}

function rectContainsRect(outer, inner) {
  return (
    inner.left >= outer.left &&
    rectRight(inner) <= rectRight(outer) &&
    inner.top >= outer.top &&
    rectBottom(inner) <= rectBottom(outer)
  );
}

function rectsOverlap(a, b) {
  return !(rectRight(a) <= b.left || rectRight(b) <= a.left || rectBottom(a) <= b.top || rectBottom(b) <= a.top);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function resolveCorridorPoint(layout) {
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
    default:
      throw new Error(`unsupported approach side: ${layout.approachSide}`);
  }
}

function createRoomGeometry(layout) {
  const roomRect = {
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

  let walkwayRect;
  let entryPoint;
  let deskRect;
  let frontageRect;

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
    default:
      throw new Error(`unsupported regression side: ${layout.approachSide}`);
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

function deriveDepartmentPoints(layout) {
  const geometry = createRoomGeometry(layout);
  const { roomRect, deskRect } = geometry;
  const workSpots = [
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
  const terminals = Array.from({ length: 3 }, (_, index) => ({
    x: roomRect.left + ((index + 1) * roomRect.width) / 4,
    y: layout.approachSide === "down" ? deskRect.top + deskRect.height + 12 : deskRect.top - 10,
  }));
  const insight = {
    x: roomRect.left + roomRect.width - 16,
    y: layout.approachSide === "down" ? roomRect.top + 24 : roomRect.top + roomRect.height - 24,
  };

  return {
    ...geometry,
    workSpots,
    terminals,
    insight,
  };
}

async function main() {
  const raw = await readFile(layoutPath, "utf8");
  const layoutConfig = JSON.parse(raw);

  assert(layoutConfig.departments.length === 10, `expected 10 departments, got ${layoutConfig.departments.length}`);
  assert(layoutConfig.sharedZones.length === 2, `expected 2 shared zones, got ${layoutConfig.sharedZones.length}`);

  const officeRect = { left: 0, top: 0, width: OFFICE_WIDTH, height: OFFICE_HEIGHT };
  const corridorRect = {
    left: FLOOR_PADDING,
    top: CORRIDOR_TOP,
    width: OFFICE_WIDTH - FLOOR_PADDING * 2,
    height: CORRIDOR_HEIGHT,
  };
  const departments = layoutConfig.departments.map((layout) => ({ ...layout, ...deriveDepartmentPoints(layout) }));
  const sharedZones = layoutConfig.sharedZones.map((layout) => ({ ...layout, ...createRoomGeometry(layout) }));

  for (const item of [...departments, ...sharedZones]) {
    for (const rect of [item.roomRect, item.walkwayRect, item.frontageRect, item.deskRect].filter(Boolean)) {
      assert(rectContainsRect(officeRect, rect), `${item.id} geometry escapes office bounds`);
    }
  }

  for (const department of departments) {
    assert(rectContainsRect(department.roomRect, department.deskRect), `${department.id} desk escapes room`);
    assert(pointInRect(department.entryPoint, department.roomRect), `${department.id} entry point leaves room`);
    assert(!pointInRect(department.entryPoint, department.deskRect), `${department.id} entry point lands on desk`);
    assert(pointInRect(department.corridorLanePoint, corridorRect), `${department.id} corridor lane point leaves corridor`);

    for (const point of [...department.workSpots, ...department.terminals, department.insight]) {
      assert(pointInRect(point, department.roomRect), `${department.id} derived interaction point leaves room`);
    }
  }

  for (let index = 0; index < departments.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < departments.length; otherIndex += 1) {
      assert(
        !rectsOverlap(departments[index].roomRect, departments[otherIndex].roomRect),
        `${departments[index].id} overlaps ${departments[otherIndex].id}`
      );
    }
    for (const zone of sharedZones) {
      assert(!rectsOverlap(departments[index].roomRect, zone.roomRect), `${departments[index].id} overlaps ${zone.id}`);
    }
  }

  const rowGaps = Object.values(rowOrder).flatMap((ids) =>
    ids.slice(0, -1).map((id, index) => {
      const current = departments.find((layout) => layout.id === id);
      const next = departments.find((layout) => layout.id === ids[index + 1]);
      return next.left - (current.left + current.width);
    })
  );
  const minGap = Math.min(...rowGaps);
  assert(minGap >= 8, `neighbor gap too small: ${minGap}`);

  const pixelAreas = Object.fromEntries(departments.map((layout) => [layout.id, layout.width * layout.height]));
  const bigBand = ["management", "development", "warehouse"];
  const smallBand = ["quality", "hr", "finance"];
  const smallestBig = Math.min(...bigBand.map((id) => pixelAreas[id]));
  const largestSmall = Math.max(...smallBand.map((id) => pixelAreas[id]));
  assert(largestSmall < smallestBig, "small-room band should not outgrow management/development/warehouse");

  const pixelAreaRank = [...departments]
    .sort((left, right) => pixelAreas[right.id] - pixelAreas[left.id])
    .map((layout) => layout.id);
  const logicalAreaRank = Object.entries(logicalAreas)
    .sort((left, right) => right[1] - left[1])
    .map(([id]) => id);

  assert(
    bigBand.every((id) => pixelAreaRank.slice(0, 4).includes(id)),
    `unexpected top-area band: ${pixelAreaRank.slice(0, 4).join(", ")}`
  );

  const averageRoomArea = Math.round(
    departments.reduce((sum, layout) => sum + layout.width * layout.height, 0) / departments.length
  );

  console.log("OpenClaw layout regression");
  console.log(`- departments: ${departments.length}`);
  console.log(`- shared zones: ${sharedZones.length}`);
  console.log(`- average room area: ${averageRoomArea}`);
  console.log(`- minimum neighbor gap: ${minGap}`);
  console.log(`- pixel top band: ${pixelAreaRank.slice(0, 4).join(", ")}`);
  console.log(`- logical top band: ${logicalAreaRank.slice(0, 4).join(", ")}`);
  console.log("");
  console.log(`PASS ${departments.length} departments + ${sharedZones.length} shared zones checked.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
