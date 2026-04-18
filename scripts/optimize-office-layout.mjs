import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OFFICE_WIDTH = 960;
const OFFICE_HEIGHT = 540;
const FLOOR_PADDING = 12;
const CORRIDOR_TOP = 150;
const CORRIDOR_HEIGHT = 230;
const CORRIDOR_LANE_PADDING = 24;
const TOP_ROW_BOTTOM = 146;
const BOTTOM_ROW_TOP = 398;
const ITERATIONS = 50;

const layoutPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/office-layouts.json");

const departmentMeta = {
  marketing: { logicalWidth: 34, logicalDepth: 26, row: "top" },
  sales: { logicalWidth: 32, logicalDepth: 28, row: "top" },
  development: { logicalWidth: 38, logicalDepth: 30, row: "top" },
  support: { logicalWidth: 34, logicalDepth: 28, row: "top" },
  management: { logicalWidth: 42, logicalDepth: 32, row: "top" },
  production: { logicalWidth: 36, logicalDepth: 30, row: "bottom" },
  quality: { logicalWidth: 30, logicalDepth: 26, row: "bottom" },
  warehouse: { logicalWidth: 40, logicalDepth: 30, row: "bottom" },
  hr: { logicalWidth: 32, logicalDepth: 26, row: "bottom" },
  finance: { logicalWidth: 32, logicalDepth: 26, row: "bottom" },
};

const rowOrder = {
  top: ["marketing", "sales", "development", "support", "management"],
  bottom: ["production", "quality", "warehouse", "hr", "finance"],
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectRight(rect) {
  return rect.left + rect.width;
}

function rectBottom(rect) {
  return rect.top + rect.height;
}

function pointInRect(point, rect) {
  return (
    point.x >= rect.left &&
    point.x <= rect.left + rect.width &&
    point.y >= rect.top &&
    point.y <= rect.top + rect.height
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

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let value = Math.imul(t ^ (t >>> 15), 1 | t);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(rng, min, max) {
  return min + rng() * (max - min);
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
      throw new Error(`unsupported optimization side: ${layout.approachSide}`);
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

function validateCandidate(layoutConfig) {
  const errors = [];
  const officeRect = { left: 0, top: 0, width: OFFICE_WIDTH, height: OFFICE_HEIGHT };
  const departments = layoutConfig.departments.map((layout) => ({
    ...layout,
    ...deriveDepartmentPoints(layout),
  }));
  const sharedZones = layoutConfig.sharedZones.map((layout) => ({
    ...layout,
    ...createRoomGeometry(layout),
  }));

  if (departments.length !== 10) {
    errors.push(`expected 10 departments, got ${departments.length}`);
  }
  if (sharedZones.length !== 2) {
    errors.push(`expected 2 shared zones, got ${sharedZones.length}`);
  }

  for (const item of [...departments, ...sharedZones]) {
    for (const rect of [item.roomRect, item.walkwayRect, item.frontageRect, item.deskRect].filter(Boolean)) {
      if (!rectContainsRect(officeRect, rect)) {
        errors.push(`${item.id} has geometry outside office bounds`);
      }
    }
  }

  for (let index = 0; index < departments.length; index += 1) {
    const left = departments[index];
    if (!pointInRect(left.entryPoint, left.roomRect)) {
      errors.push(`${left.id} entry point is outside room`);
    }
    if (pointInRect(left.entryPoint, left.deskRect)) {
      errors.push(`${left.id} entry point overlaps desk`);
    }
    if (!pointInRect(left.corridorLanePoint, { left: FLOOR_PADDING, top: CORRIDOR_TOP, width: OFFICE_WIDTH - FLOOR_PADDING * 2, height: CORRIDOR_HEIGHT })) {
      errors.push(`${left.id} corridor lane point is outside corridor`);
    }
    for (const point of [...left.workSpots, ...left.terminals, left.insight]) {
      if (!pointInRect(point, left.roomRect)) {
        errors.push(`${left.id} derived point escapes room`);
      }
    }
    for (let otherIndex = index + 1; otherIndex < departments.length; otherIndex += 1) {
      if (rectsOverlap(left.roomRect, departments[otherIndex].roomRect)) {
        errors.push(`${left.id} overlaps ${departments[otherIndex].id}`);
      }
    }
    for (const zone of sharedZones) {
      if (rectsOverlap(left.roomRect, zone.roomRect)) {
        errors.push(`${left.id} overlaps shared zone ${zone.id}`);
      }
    }
  }

  const minGap = Math.min(
    ...Object.values(rowOrder).flatMap((ids) =>
      ids.slice(0, -1).map((id, index) => {
        const current = departments.find((layout) => layout.id === id);
        const next = departments.find((layout) => layout.id === ids[index + 1]);
        return next.left - (current.left + current.width);
      })
    )
  );

  if (minGap < 8) {
    errors.push(`minimum neighbor gap too small: ${minGap}`);
  }

  const areasById = Object.fromEntries(departments.map((layout) => [layout.id, layout.width * layout.height]));
  const bigBand = ["management", "development", "warehouse"];
  const smallBand = ["quality", "hr", "finance"];
  const smallestBig = Math.min(...bigBand.map((id) => areasById[id]));
  const largestSmall = Math.max(...smallBand.map((id) => areasById[id]));
  if (largestSmall >= smallestBig) {
    errors.push("small-room band grows larger than the expected big-room band");
  }

  return {
    ok: errors.length === 0,
    errors,
    metrics: {
      averageRoomArea: Math.round(
        departments.reduce((sum, layout) => sum + layout.width * layout.height, 0) / departments.length
      ),
      minGap,
    },
  };
}

function scoreCandidate(layoutConfig) {
  const departments = layoutConfig.departments;
  let score = 0;

  for (const layout of departments) {
    const meta = departmentMeta[layout.id];
    const ratioError = Math.abs(Math.log((layout.width / layout.height) / (meta.logicalWidth / meta.logicalDepth)));
    const relativeArea = (layout.width * layout.height) / (meta.logicalWidth * meta.logicalDepth);
    const areaError = Math.abs(Math.log(relativeArea / 12.5));
    score -= ratioError * 55;
    score -= areaError * 24;
    score -= Math.abs(layout.doorWidth / layout.width - 0.31) * 120;
  }

  const areasById = Object.fromEntries(departments.map((layout) => [layout.id, layout.width * layout.height]));
  score += Math.min(areasById.management, areasById.development, areasById.warehouse) / 300;
  score -= Math.max(areasById.quality, areasById.hr, areasById.finance) / 900;

  const topDepth = departments
    .filter((layout) => layout.approachSide === "down")
    .reduce((sum, layout) => sum + rectBottom(layout), 0);
  score -= Math.abs(topDepth / 5 - TOP_ROW_BOTTOM) * 20;

  return score;
}

function buildCandidate(baseConfig, rng) {
  const reception = baseConfig.sharedZones.find((layout) => layout.id === "reception");
  const cafeteria = baseConfig.sharedZones.find((layout) => layout.id === "cafeteria");
  const rowBounds = {
    top: { start: rectRight(reception) + 10, end: 926, bottom: TOP_ROW_BOTTOM },
    bottom: { start: 28, end: cafeteria.left - 6, top: BOTTOM_ROW_TOP },
  };

  const params = {
    topGap: Math.round(randomBetween(rng, 10, 16)),
    bottomGap: Math.round(randomBetween(rng, 10, 16)),
    topBaseHeight: randomBetween(rng, 96, 104),
    bottomBaseHeight: randomBetween(rng, 96, 106),
    topDepthScale: randomBetween(rng, 4.6, 7.1),
    bottomDepthScale: randomBetween(rng, 4.6, 7.8),
    topWidthStretch: randomBetween(rng, 1.02, 1.18),
    bottomWidthStretch: randomBetween(rng, 1.02, 1.18),
    megaBoost: randomBetween(rng, 3, 8),
    largeBoost: randomBetween(rng, 1, 5),
    doorRatio: randomBetween(rng, 0.29, 0.33),
  };

  const departments = Object.entries(rowOrder).flatMap(([row, ids]) => {
    const gap = params[`${row}Gap`];
    const metaList = ids.map((id) => departmentMeta[id]);
    const averageDepth = metaList.reduce((sum, meta) => sum + meta.logicalDepth, 0) / metaList.length;
    const heights = new Map();
    const idealWidths = [];

    for (const id of ids) {
      const meta = departmentMeta[id];
      const area = meta.logicalWidth * meta.logicalDepth;
      const sizeBoost = area >= 1200 ? params.megaBoost : area >= 1100 ? params.largeBoost : 0;
      const height = clamp(
        Math.round(params[`${row}BaseHeight`] + (meta.logicalDepth - averageDepth) * params[`${row}DepthScale`] + sizeBoost),
        row === "top" ? 92 : 96,
        row === "top" ? 122 : 132
      );
      const width = clamp(
        Math.round(height * (meta.logicalWidth / meta.logicalDepth) * params[`${row}WidthStretch`]),
        100,
        190
      );
      heights.set(id, height);
      idealWidths.push([id, width]);
    }

    const availableWidth = rowBounds[row].end - rowBounds[row].start - gap * (ids.length - 1);
    const idealTotal = idealWidths.reduce((sum, [, width]) => sum + width, 0);
    const scaledWidths = idealWidths.map(([id, width]) => [id, Math.max(100, Math.round(width * (availableWidth / idealTotal)))]);

    let widthDelta = availableWidth - scaledWidths.reduce((sum, [, width]) => sum + width, 0);
    const rebalanceOrder = [...ids].sort(
      (left, right) =>
        departmentMeta[right].logicalWidth * departmentMeta[right].logicalDepth -
        departmentMeta[left].logicalWidth * departmentMeta[left].logicalDepth
    );

    for (let index = 0; widthDelta !== 0 && index < 400; index += 1) {
      const id = rebalanceOrder[index % rebalanceOrder.length];
      const widthEntry = scaledWidths.find((item) => item[0] === id);
      if (widthDelta > 0) {
        widthEntry[1] += 1;
        widthDelta -= 1;
      } else if (widthEntry[1] > 100) {
        widthEntry[1] -= 1;
        widthDelta += 1;
      }
    }

    let cursor = rowBounds[row].start;
    return ids.map((id) => {
      const width = scaledWidths.find((item) => item[0] === id)[1];
      const height = heights.get(id);
      const layout = {
        id,
        left: cursor,
        top: row === "top" ? rowBounds.top.bottom - height : rowBounds.bottom.top,
        width,
        height,
        doorWidth: clamp(Math.round(width * params.doorRatio), 32, 56),
        approachSide: row === "top" ? "down" : "up",
      };
      cursor += width + gap;
      return layout;
    });
  });

  return {
    departments,
    sharedZones: baseConfig.sharedZones,
  };
}

async function main() {
  const shouldWrite = process.argv.includes("--write");
  const raw = await readFile(layoutPath, "utf8");
  const baseConfig = JSON.parse(raw);
  const rng = mulberry32(20260417);

  let best = null;
  let lastValidated = null;

  for (let iteration = 1; iteration <= ITERATIONS; iteration += 1) {
    const candidate = buildCandidate(baseConfig, rng);
    const validation = validateCandidate(candidate);
    if (validation.ok) {
      const candidateScore = scoreCandidate(candidate);
      if (!best || candidateScore > best.score) {
        best = {
          iteration,
          score: candidateScore,
          candidate,
          metrics: validation.metrics,
        };
      }
      lastValidated = { iteration, metrics: validation.metrics, candidate };
    }

    if (iteration % 3 === 0 || iteration === ITERATIONS) {
      const checkpoint = best ?? lastValidated;
      if (!checkpoint) {
        throw new Error(`iteration ${iteration}: no valid candidate found`);
      }
      console.log(
        `[regression ${iteration}] PASS avgRoomArea=${checkpoint.metrics.averageRoomArea} minGap=${checkpoint.metrics.minGap} bestIteration=${checkpoint.iteration}`
      );
    }
  }

  if (!best) {
    throw new Error("optimizer did not find a valid candidate");
  }

  const output = {
    departments: best.candidate.departments,
    sharedZones: baseConfig.sharedZones,
  };

  if (shouldWrite) {
    await writeFile(layoutPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
    console.log(`wrote optimized layout to ${layoutPath}`);
  }

  console.log(`best score=${best.score.toFixed(2)} iteration=${best.iteration}`);
  console.log(JSON.stringify(best.candidate.departments, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
