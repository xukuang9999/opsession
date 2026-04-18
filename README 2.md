# OpenClaw Session

一个用于 20 分钟演讲的 2D 像素互动网页原型，主题是“工作的叠加态：OpenClaw 的多场景 AI 落地”。

## 体验内容

- 可在 2D 像素街区中移动，进入不同部门工作舱
- 覆盖市场、销售、开发、生产、品质、仓库、客服、HR、财务、管理层 10 个部门
- 每个部门包含 3 个具体 OpenClaw 落地场景
- 每个场景包含业务痛点、执行链路、产出物、KPI、执行结果与数据来源

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## 技术栈

- Vite
- TypeScript
- Canvas 2D 渲染

## 交互说明

- `WASD` / 方向键：移动
- 鼠标拖拽：调整角色朝向
- `E`：进入当前终端场景
- `F`：记录当前洞察芯片
- 右侧导航：快速跳转到部门

## 数据来源

场景中使用的数据与案例链接已内置在应用右侧面板中，覆盖 HubSpot、McKinsey、Salesforce、LinkedIn、Workday、Microsoft、Zendesk 等公开资料。
