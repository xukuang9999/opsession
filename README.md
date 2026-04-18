# OpenClaw Session

一个面向演讲现场的像素办公室 demo。核心 takeaway 只有一句：

**先看活，再选工具。别反过来。**

它把 OpenClaw 放回真实工作流里，而不是把它讲成抽象的“万能 AI”。观众进入办公室后，会沿着前台工单、10 个部门、中央演讲台和食堂工具箱一路走完一场 20 分钟的产品叙事。

## 当前体验

- 2D 像素办公室漫游，覆盖市场、销售、开发、生产、品质、仓库、客服、HR、财务、管理层 10 个部门
- 每个部门包含 3 个 OpenClaw 落地场景，总计 30+ 场景卡
- 开场 7 秒 cinematic、常驻 Lobster 导览员、前台三工单揭晓、食堂七工具终局
- HUD / 小地图 / Presenter Mode / 互动提示 / Thank-you 收尾页
- 中英文界面切换、首进引导、快捷帮助、崩溃恢复、状态持久化、演讲倒计时

## 交互

- `WASD` / 方向键：移动
- 鼠标拖拽：调整角色朝向
- 滚轮：缩放镜头
- `E`：进入终端 / 公共区 / 结束出口
- `F`：记录洞察芯片
- `P`：切换 Presenter Mode
- `?`：打开帮助
- `Shift + Esc`：紧急回到开始画面

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## 校验脚本

```bash
npm run check:rooms
npm run check:layout
```

## 技术栈

- Vite
- TypeScript
- Canvas 2D
- 纯 DOM + CSS 动效

## 目录

- [`src/main.ts`](./src/main.ts): 场景逻辑、输入、状态、演讲模式、HUD
- [`src/style.css`](./src/style.css): 全局视觉、响应式、动效、Modal / Start / Thanks UI
- [`src/data.ts`](./src/data.ts): 中文场景数据
- [`src/data-en.ts`](./src/data-en.ts): 英文场景数据
- [`src/assets`](./src/assets): 像素场景、角色与 Lobster 资源

## 演讲前建议

- 先跑一次 `npm run build`
- 用投影仪或 1080p 镜像模式预演
- 打开 Presenter Mode，确认右上角倒计时可见
- 把 `dist/` 留一份离线备份

## 数据说明

场景里的案例、指标和参考链接都内置在应用里，来源覆盖 HubSpot、McKinsey、Microsoft、Salesforce、LinkedIn、Zendesk、Workday 等公开资料。这个 demo 的重点不是“列工具清单”，而是把这些资料压进一个更适合现场讲述的空间叙事里。
