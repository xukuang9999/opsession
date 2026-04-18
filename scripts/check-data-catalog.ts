import { departments as zhDepartments, thesisPoints as zhThesisPoints, uniqueSources as zhSources } from "../src/data";
import { departments as enDepartments, thesisPoints as enThesisPoints, uniqueSources as enSources } from "../src/data-en";

type DepartmentLike = {
  id: string;
  scenarios: Array<{
    id: string;
    impactScore: number;
    source: { url: string };
  }>;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function listScenarioIds(departments: DepartmentLike[]): string[] {
  return departments.flatMap((department) =>
    department.scenarios.map((scenario) => `${department.id}/${scenario.id}`)
  );
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

function main(): void {
  const zhScenarioIds = listScenarioIds(zhDepartments);
  const enScenarioIds = listScenarioIds(enDepartments);

  assert(zhDepartments.length === 10, `预期中文目录有 10 个部门，实际为 ${zhDepartments.length}`);
  assert(enDepartments.length === 10, `预期英文目录有 10 个部门，实际为 ${enDepartments.length}`);
  assert(zhScenarioIds.length === 30, `预期中文目录有 30 个场景，实际为 ${zhScenarioIds.length}`);
  assert(enScenarioIds.length === 30, `预期英文目录有 30 个场景，实际为 ${enScenarioIds.length}`);

  assert(
    JSON.stringify(zhDepartments.map((department) => department.id)) ===
      JSON.stringify(enDepartments.map((department) => department.id)),
    "中英文部门 ID 不一致"
  );
  assert(
    JSON.stringify(zhScenarioIds) === JSON.stringify(enScenarioIds),
    "中英文场景 ID 不一致"
  );

  for (const department of zhDepartments) {
    for (const scenario of department.scenarios) {
      assert(scenario.impactScore > 0, `${department.id}/${scenario.id} 的 impactScore 必须大于 0`);
      assert(isHttpUrl(scenario.source.url), `${department.id}/${scenario.id} 的 source.url 不是合法 http(s) 地址`);
    }
  }

  assert(zhThesisPoints.length === 4, `预期中文 thesisPoints 为 4 条，实际为 ${zhThesisPoints.length}`);
  assert(enThesisPoints.length === 4, `预期英文 thesisPoints 为 4 条，实际为 ${enThesisPoints.length}`);
  assert(zhSources.length >= zhDepartments.length, "uniqueSources 数量过少，无法覆盖部门级摘要");
  assert(enSources.length === zhSources.length, "中英文 uniqueSources 数量不一致");
  assert(
    JSON.stringify(zhSources.map((source) => source.url)) ===
      JSON.stringify(enSources.map((source) => source.url)),
    "中英文 uniqueSources URL 列表不一致"
  );

  console.log("OpenClaw data catalog check");
  console.log(`- departments: ${zhDepartments.length}`);
  console.log(`- scenarios: ${zhScenarioIds.length}`);
  console.log(`- thesis points: ${zhThesisPoints.length}`);
  console.log(`- unique sources: ${zhSources.length}`);
  console.log("");
  console.log("PASS data catalog aligned across zh/en.");
}

main();
