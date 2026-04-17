export type SourceItem = {
  label: string;
  url: string;
  detail: string;
};

export type Scenario = {
  id: string;
  title: string;
  hook: string;
  problem: string;
  workflow: string[];
  outputs: string[];
  kpis: string[];
  stat: string;
  impactScore: number;
  source: SourceItem;
  demoResult: string;
};

export type Department = {
  id: string;
  name: string;
  shortName: string;
  accent: string;
  level: 0 | 1;
  position: { x: number; z: number };
  size: { width: number; depth: number };
  intro: string;
  speakerNote: string;
  scenarios: Scenario[];
};

export const thesisPoints = [
  "不是单点提效，而是把 OpenClaw 变成跨部门的执行网络。",
  "不是替代岗位，而是把搜索、整理、比对这些重复动作从人身上移走。",
  "不是只给答案，而是能拉数据、做判断、产出结果，再回写系统。",
  "不是一个 Agent 包打天下，而是按部门场景编排多个专业能力。",
];

export const departments: Department[] = [
  {
    id: "marketing",
    name: "Marketing Lab",
    shortName: "市场部",
    accent: "#ff7b54",
    level: 0,
    position: { x: -54, z: -28 },
    size: { width: 28, depth: 24 },
    intro:
      "营销房间用竞品、价格和内容三条链路，说明 OpenClaw 如何把市场洞察直接变成执行动作。",
    speakerNote:
      "这里要强调：不是让 AI 直接写稿，而是先看清市场，再自动推进下一步。",
    scenarios: [
      {
        id: "market-research",
        title: "市场调研代理",
        hook: "从竞品信息噪声里，自动抽出一份能直接上会的情报摘要。",
        problem:
          "营销团队每天都要盯竞品官网、社媒、评论区和价格页，信息分散且更新太快。",
        workflow: [
          "抓取竞品官网、新闻、评论和搜索趋势，归并到同一工作流。",
          "按品牌、价格带、卖点和活动频率做聚类与变化检测。",
          "自动生成一页高管摘要和一页执行建议，并推送到 Slack/飞书。",
        ],
        outputs: ["竞品周报", "新品/活动提醒", "差异化 messaging 建议"],
        kpis: ["每周节省 6-8 小时人工整理", "缩短 campaign briefing 准备时间", "减少错过竞品动作的概率"],
        stat: "HubSpot 2024：74% 的营销人已在工作中使用至少一种 AI 工具，43% 把内容生成列为头号用例。",
        impactScore: 16,
        source: {
          label: "HubSpot - Marketers double AI usage in 2024",
          url: "https://www.hubspot.com/company-news/marketers-double-ai-usage-in-2024",
          detail: "2024 年更新，基于 1000+ 营销与广告从业者调研。",
        },
        demoResult:
          "OpenClaw 已生成《亚太竞品动态周报》：发现 3 个新促销活动、2 个价格下调信号和 1 个高频用户抱怨主题。",
      },
      {
        id: "price-watch",
        title: "价格巡检代理",
        hook: "把每天刷网页看价格的动作，变成全天候的异常监控。",
        problem:
          "价格波动、折扣策略和 SKU 包装更新散落在多个电商平台和落地页，很难实时对齐。",
        workflow: [
          "轮询竞品站点、市场平台和区域页面，识别价格、库存和促销文案变化。",
          "对异常波动做阈值判断，自动标注‘正常波动 / 需要应对 / 立即跟进’。",
          "联动市场和销售负责人，生成反制建议与跟进事项。",
        ],
        outputs: ["价格变化预警", "促销策略差异表", "区域渠道价盘提醒"],
        kpis: ["竞品降价当天即可发现", "减少人工比价失误", "让销售与营销共享同一份事实底稿"],
        stat: "McKinsey 2025：组织最常把生成式 AI 用在 marketing & sales、service operations、software engineering 等高价值函数中。",
        impactScore: 14,
        source: {
          label: "McKinsey - The State of AI 2025",
          url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
          detail: "2025 全球调查，显示生成式 AI 已进入多业务函数常规使用。",
        },
        demoResult:
          "OpenClaw 发现北美竞品在 4 小时内将旗舰 SKU 价格下调 8%，并给出 2 套响应策略：限时 bundle 或改打服务价值。",
      },
      {
        id: "blog-refresh",
        title: "内容更新代理",
        hook: "当产品发布、价格变化或客户案例更新时，博客和落地页自动同步迭代。",
        problem:
          "营销内容经常滞后于产品和市场变化，官网、博客、邮件、社媒之间还会版本不一致。",
        workflow: [
          "监听产品更新、活动节奏和品牌素材库变化。",
          "抽取关键信息并生成博客提纲、SEO 标题、邮件摘要和多语版本。",
          "进入人工审批后自动发布，保留版本差异与来源链路。",
        ],
        outputs: ["博客草稿", "SEO 更新建议", "多语邮件与社媒素材"],
        kpis: ["内容上线速度更快", "减少跨团队反复对稿", "保障品牌口径统一"],
        stat: "HubSpot 2024：近 7 成投资 AI 的营销负责人认为 AI 在员工生产率与效率上带来正向 ROI。",
        impactScore: 13,
        source: {
          label: "HubSpot - Marketers double AI usage in 2024",
          url: "https://www.hubspot.com/company-news/marketers-double-ai-usage-in-2024",
          detail: "文中提到近 7 成已投资 AI 的营销负责人看到正向 ROI。",
        },
        demoResult:
          "OpenClaw 已把产品发布说明改写为 1 篇博客、1 组 EDM 文案和 4 条 LinkedIn 帖子，并标出待人工确认段落。",
      },
    ],
  },
  {
    id: "sales",
    name: "Sales Command",
    shortName: "销售部",
    accent: "#4ecdc4",
    level: 0,
    position: { x: 0, z: -28 },
    size: { width: 28, depth: 24 },
    intro:
      "销售房间展示 OpenClaw 如何把会前研究、报价跟进和续约风险串成闭环，把时间还给成交。",
    speakerNote:
      "这一间适合讲：AI 不是替销售聊天，而是把准备、跟进和回写自动化。",
    scenarios: [
      {
        id: "account-research",
        title: "账户研究代理",
        hook: "进入客户会议前，自动拿到一页可直接使用的 account brief。",
        problem:
          "销售会前要手动搜公司新闻、组织变化、产品使用情况和历史互动记录，准备成本很高。",
        workflow: [
          "读取 CRM、邮件摘要、官网新闻和公开财务/组织信息。",
          "生成包含 buying signal、风险点和推荐话术的会前 briefing。",
          "会后自动回写行动项、下一步建议和概率更新。",
        ],
        outputs: ["会前简报", "关键人地图", "下一步跟进建议"],
        kpis: ["缩短会前准备时间", "提升一线销售对客户理解深度", "提高 CRM 信息完整性"],
        stat: "Salesforce 2026：销售平均只有 40% 的时间真正用于 selling，其余被 prospecting、报价、数据录入等工作占用。",
        impactScore: 18,
        source: {
          label: "Salesforce - State of Sales 2026",
          url: "https://www.salesforce.com/resources/research-reports/state-of-sales/",
          detail: "第七版 State of Sales，显示销售大量时间耗在非销售事务上。",
        },
        demoResult:
          "OpenClaw 已为 APAC 区目标客户生成会前 dossier：发现 2 个组织变动、1 个潜在预算窗口和 3 条建议提问。",
      },
      {
        id: "quote-builder",
        title: "报价与外联代理",
        hook: "让报价和跟进邮件从复制模板，变成自动生成、可审计的流程。",
        problem:
          "销售经常在报价、个性化邮件和产品组合说明上反复手工修改，既慢又容易出错。",
        workflow: [
          "根据客户画像、历史成交和库存/服务能力生成个性化方案。",
          "自动起草报价说明、跟进邮件与 ROI 叙述。",
          "审批后同步回写 CRM、任务系统和文件目录。",
        ],
        outputs: ["报价包", "个性化跟进邮件", "ROI 话术建议"],
        kpis: ["加快 proposal 周转", "提升对外文案一致性", "减少手工录入错误"],
        stat: "Salesforce 2026：94% 已使用 AI agents 的销售领导者认为，它们对满足业务需求至关重要。",
        impactScore: 17,
        source: {
          label: "Salesforce - State of Sales 2026",
          url: "https://www.salesforce.com/resources/research-reports/state-of-sales/",
          detail: "销售领导者已把 agent 视为增长基础设施，而非边缘试验。",
        },
        demoResult:
          "OpenClaw 已组合出一套制造业客户报价包：包含价格、实施节奏、风险说明和 2 封分角色跟进邮件。",
      },
      {
        id: "renewal-risk",
        title: "续约风险代理",
        hook: "在续约前 30 天自动识别沉默客户和低活跃账户。",
        problem:
          "客户成功和销售往往到续约前才开始整理使用数据和风险信号，留给挽回的时间太少。",
        workflow: [
          "聚合 usage、支持工单、NPS、账单和关键联系人活跃度。",
          "识别扩容、缩减和流失信号，生成优先级队列。",
          "自动分配动作：发起复盘会议、推送案例、触发折扣审批或升级支持。",
        ],
        outputs: ["续约热力图", "客户健康评分", "挽回动作清单"],
        kpis: ["更早发现流失风险", "让销售、CS、支持统一判断口径", "把数据变成动作而不是静态报表"],
        stat: "Salesforce 2024：83% 使用 AI 的销售团队报告今年收入增长，而未使用 AI 的团队为 66%。",
        impactScore: 15,
        source: {
          label: "Salesforce - Sales Teams Using AI 1.3x More Likely to See Revenue Increase",
          url: "https://www.salesforce.com/news/stories/sales-ai-statistics-2024/",
          detail: "2024 调查显示 AI 与收入增长和销售效率改进相关。",
        },
        demoResult:
          "OpenClaw 在续约名单中标出 5 个高风险账户，其中 2 个问题来自活跃度下滑，3 个来自未闭环支持问题。",
      },
    ],
  },
  {
    id: "support",
    name: "Support Hub",
    shortName: "客服部",
    accent: "#ffd166",
    level: 0,
    position: { x: 54, z: -28 },
    size: { width: 28, depth: 24 },
    intro:
      "客服房间用于演示 OpenClaw 如何自动接单、分流、总结、回复并沉淀知识库。",
    speakerNote:
      "这里可以强调：先让 AI 处理标准问题，再把复杂问题交给人。",
    scenarios: [
      {
        id: "triage-routing",
        title: "工单分流代理",
        hook: "多语工单自动分类、定级、路由，减少人工初筛。",
        problem:
          "支持入口多、语言多、优先级不一，人工 triage 容易延迟或分错队列。",
        workflow: [
          "读取邮件、表单、聊天记录和附件内容，自动识别问题类型与紧急度。",
          "基于 SLA、客户等级和历史案例建议队列归属与响应模板。",
          "需要时自动触发退款、升级或内部协作流程。",
        ],
        outputs: ["工单优先级", "推荐处理人", "首轮响应草稿"],
        kpis: ["缩短首次响应时间", "减少错路由", "把简单问题直接自动化关闭"],
        stat: "Salesforce 2025：预计到 2027 年，50% 的服务案例将由 AI 解决，而 2025 年这一比例为 30%。",
        impactScore: 19,
        source: {
          label: "Salesforce - State of Service 2025",
          url: "https://www.salesforce.com/resources/research-reports/state-of-service/",
          detail: "第七版 State of Service 报告，样本为 6500 名服务专业人士。",
        },
        demoResult:
          "OpenClaw 已完成 18 条新工单首轮分流：其中 9 条进入 FAQ 自动化、5 条升级人工、4 条转产品团队。",
      },
      {
        id: "case-summarizer",
        title: "案例摘要代理",
        hook: "把长线程、多轮沟通和跨渠道历史，一次压缩成可接手的 briefing。",
        problem:
          "复杂工单在转交和升级时，工程师和主管往往要重新读很长的上下文。",
        workflow: [
          "提取跨渠道对话、历史订单、设备信息和已执行动作。",
          "生成‘客户诉求 / 已做动作 / 风险 / 建议下一步’四段式摘要。",
          "附带推荐回复、升级说明和知识库链接。",
        ],
        outputs: ["升级摘要", "主管视图", "推荐回复草稿"],
        kpis: ["减少接手成本", "提升升级效率", "降低重复提问带来的客户不满"],
        stat: "Salesforce 2025：使用 AI 的客服代表在 routine cases 上平均少花约 4 小时/周，把时间腾给复杂问题。",
        impactScore: 14,
        source: {
          label: "Salesforce - State of Service 2025 announcement",
          url: "https://www.salesforce.com/news/stories/state-of-service-report-announcement-2025/",
          detail: "新闻稿概述了 AI 对服务角色与时间分配的影响。",
        },
        demoResult:
          "OpenClaw 已把 47 条跨邮件与聊天记录压缩为 1 页升级摘要，并附上 3 个可直接发送的响应版本。",
      },
      {
        id: "kb-refresh",
        title: "知识库更新代理",
        hook: "把重复出现的问题自动沉淀为文档，而不是靠团队记忆。",
        problem:
          "知识库往往落后于一线问题，导致同类问题重复处理、重复解释。",
        workflow: [
          "聚合同类工单，识别高频主题、故障根因和有效解决方案。",
          "输出知识库草稿、FAQ 结构与截图需求清单。",
          "审核通过后自动推送到帮助中心与内部支持手册。",
        ],
        outputs: ["FAQ 草稿", "内部 SOP 更新建议", "多语帮助中心内容"],
        kpis: ["减少重复工单", "让新成员更快上手", "让 AI 自动答复持续变准"],
        stat: "Zendesk 2026：74% 的消费者现在希望客户服务是 24/7 可用，88% 比一年前更期待更快响应。",
        impactScore: 16,
        source: {
          label: "Zendesk - CX Trends 2026",
          url: "https://cxtrends.zendesk.com/",
          detail: "2026 CX Trends 首页披露了客户对全天候与更快响应的最新预期。",
        },
        demoResult:
          "OpenClaw 从本周 62 条重复问题中生成了 4 篇知识库草稿，并估计可覆盖 31% 的重复咨询。",
      },
    ],
  },
  {
    id: "finance",
    name: "Finance Vault",
    shortName: "财务部",
    accent: "#c3f73a",
    level: 1,
    position: { x: -54, z: -28 },
    size: { width: 28, depth: 24 },
    intro:
      "财务房间强调 OpenClaw 如何把票据、预测、异常和协同做成可追溯的执行链。",
    speakerNote:
      "财务最适合讲：AI 不是生成报表，而是更快完成核验、预测和风险提醒。",
    scenarios: [
      {
        id: "invoice-reconcile",
        title: "票据对账代理",
        hook: "把发票、报销单、对账单的人工核验，改成自动比对与异常提示。",
        problem:
          "财务常在发票识别、费用归类和多系统对账上投入大量重复劳动，且容易出错。",
        workflow: [
          "解析票据、报销附件和供应商账单，抽取关键字段。",
          "与采购、合同、预算和 ERP 数据做一致性比对。",
          "标出缺失字段、异常金额和重复报销，并生成审阅队列。",
        ],
        outputs: ["对账异常清单", "待审核队列", "自动归档后的结构化记录"],
        kpis: ["缩短月结周期", "降低人工复核强度", "减少错误入账"],
        stat: "Workday CFO AI Indicator：财务领导者认为 AI 最快见效的场景之一包括自动化 reconciliation、expenses 等流程（28%）。",
        impactScore: 18,
        source: {
          label: "Workday - Global CFO AI Indicator Report",
          url: "https://forms.workday.com/content/dam/web/sg/documents/reports/cfo-global-ai-indicator-report-en-SG.pdf",
          detail: "报告列出财务最具即时价值的 AI 用例，含对账与报销自动化。",
        },
        demoResult:
          "OpenClaw 已在 240 张票据中发现 11 条金额异常和 3 条疑似重复报销，并生成财务审阅清单。",
      },
      {
        id: "fpa-simulator",
        title: "FP&A 场景模拟代理",
        hook: "预算会前自动给出多情景预测，而不是临时拉表。",
        problem:
          "预算调整和经营预测经常要跨业务线收集信息，时间紧、口径杂、情景难以快速重算。",
        workflow: [
          "汇总收入、成本、采购、人员与项目进度数据。",
          "根据假设变化自动生成 best/base/worst 三套预测。",
          "输出董事会可读摘要，并附上影响最大的变量解释。",
        ],
        outputs: ["三情景预测板", "预算变动解释", "经营会摘要"],
        kpis: ["提高经营会议准备效率", "更快看见利润/现金流压力点", "让财务从报表搬运转向业务建议"],
        stat: "Workday CFO AI Indicator：34% 的财务领导者认为 AI 在 improving forecasts and budget decisions 上最能立刻产生价值。",
        impactScore: 17,
        source: {
          label: "Workday - Global CFO AI Indicator Report",
          url: "https://forms.workday.com/content/dam/web/sg/documents/reports/cfo-global-ai-indicator-report-en-SG.pdf",
          detail: "报告明确把 forecast、budget、scenario planning 列为高价值场景。",
        },
        demoResult:
          "OpenClaw 已输出 3 套季度预算情景，并指出利润率受渠道折扣和物流涨价影响最大。",
      },
      {
        id: "anomaly-guard",
        title: "异常与风险代理",
        hook: "在异常花费、数据偏差和潜在风险刚出现时就发出提醒。",
        problem:
          "财务往往在周期末才发现差异，错过了及时纠偏的窗口。",
        workflow: [
          "监控 GL、采购、费用、收入确认等关键流。",
          "用规则和模型结合判断异常分布、异常波动和缺失证据。",
          "自动生成风险说明、责任归属和补充材料清单。",
        ],
        outputs: ["异常告警", "审计准备包", "跨部门补料任务"],
        kpis: ["提前暴露风险", "减少审计准备压力", "提高可解释性与治理能力"],
        stat: "Workday CFO AI Indicator：35% 的财务领导者认为 finance and accounting 是企业里对 AI 融合准备最不足的区域，治理因此非常关键。",
        impactScore: 14,
        source: {
          label: "Workday - Global CFO AI Indicator Report",
          url: "https://forms.workday.com/content/dam/web/sg/documents/reports/cfo-global-ai-indicator-report-en-SG.pdf",
          detail: "报告同时强调财务部门对透明性、偏差和安全问题的担忧。",
        },
        demoResult:
          "OpenClaw 已针对采购科目发现 2 个异常波动簇，并自动拉取缺失附件与审批记录。",
      },
    ],
  },
  {
    id: "hr",
    name: "Talent Studio",
    shortName: "HR 部",
    accent: "#9b5de5",
    level: 1,
    position: { x: 0, z: -28 },
    size: { width: 28, depth: 24 },
    intro:
      "HR 房间关注招聘、入职、学习和问答，让 OpenClaw 变成流程协调层而不是简单助手。",
    speakerNote:
      "HR 适合讲：标准化判断交给 AI，最终判断和体验设计保留给人。",
    scenarios: [
      {
        id: "skill-hiring",
        title: "技能招聘代理",
        hook: "把 JD、简历、技能图谱和面试安排串成一条连续流程。",
        problem:
          "招聘流程里经常要反复筛简历、比技能、约面试，且不同用人经理标准不一致。",
        workflow: [
          "解析 JD，抽取 must-have / nice-to-have 技能。",
          "扫描候选人简历与作品，按 skills-first 逻辑给出初筛解释。",
          "自动生成 shortlist、面试问题和面试官 briefing。",
        ],
        outputs: ["候选人 short list", "技能匹配解释", "结构化面试问题"],
        kpis: ["加快筛选首轮速度", "统一技能判断逻辑", "减少无效面试安排"],
        stat: "LinkedIn 2025 Future of Recruiting：73% 的 TA 从业者认为 AI 将改变组织招聘方式。",
        impactScore: 16,
        source: {
          label: "LinkedIn - Future of Recruiting 2025",
          url: "https://business.linkedin.com/content/dam/me/business/en-us/talent-solutions/resources/pdfs/future-of-recruiting-2025.pdf",
          detail: "LinkedIn 报告聚焦 AI 如何重塑 recruiting excellence。",
        },
        demoResult:
          "OpenClaw 已从 120 份简历中筛出 8 位高匹配候选人，并附带技能缺口解释和面试建议。",
      },
      {
        id: "onboarding-agent",
        title: "入职协调代理",
        hook: "把 offer 后的碎片化任务收拢成一个新员工体验流。",
        problem:
          "入职流程牵涉 HR、IT、直属经理和行政，多角色协同容易漏项。",
        workflow: [
          "根据岗位模板创建入职任务包与时间线。",
          "自动跟进设备、账号、培训、导师安排和首周日程。",
          "将未完成任务升级提醒到责任人，并给新人一个统一入口。",
        ],
        outputs: ["入职 checklist", "首周日程", "跨团队待办状态板"],
        kpis: ["降低漏配账号/设备", "提升新人前两周体验", "减少 HR 手工催办"],
        stat: "Microsoft Work Trend Index 2025：未来五年，41% 的领导者预计团队会训练 agents，36% 预计团队会管理 agents。",
        impactScore: 15,
        source: {
          label: "Microsoft - Work Trend Index 2025",
          url: "https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born",
          detail: "报告提出 agent boss 概念，强调每个职能都将学习训练和管理 agents。",
        },
        demoResult:
          "OpenClaw 已为新销售经理生成 Day 1-14 入职路径，并自动提醒 IT 开通 5 项系统访问。",
      },
      {
        id: "learning-path",
        title: "学习与政策问答代理",
        hook: "让 HR 从回答重复问题，转向设计更好的员工成长路径。",
        problem:
          "政策问题和培训建议大量重复，HR 容易被 FAQ 式工作拖住。",
        workflow: [
          "读取政策文档、岗位地图和历史培训记录。",
          "按岗位与能力差距生成学习路径，并回答政策问题。",
          "在需要人工确认时自动转交 HRBP 或用人经理。",
        ],
        outputs: ["个性化学习路径", "政策问答摘要", "升级人工的问题队列"],
        kpis: ["减少 HR 重复答疑", "让培训建议更具体", "提升员工自助服务能力"],
        stat: "LinkedIn 2025：93% 的 TA 从业者认为，准确评估候选人技能对提升 quality of hire 至关重要；61% 认为 AI 能改善 quality-of-hire 衡量。",
        impactScore: 12,
        source: {
          label: "LinkedIn - Future of Recruiting 2025",
          url: "https://business.linkedin.com/content/dam/me/business/en-us/talent-solutions/resources/pdfs/future-of-recruiting-2025.pdf",
          detail: "报告同时强调 skills-based hiring 与 quality-of-hire 衡量。",
        },
        demoResult:
          "OpenClaw 已为运营岗员工生成 90 天成长计划，并对 14 个政策问题给出可追溯答案与引用来源。",
      },
    ],
  },
  {
    id: "ops",
    name: "Ops Tower",
    shortName: "运营部",
    accent: "#00bbf9",
    level: 0,
    position: { x: 0, z: 30 },
    size: { width: 30, depth: 26 },
    intro:
      "运营房间强调 OpenClaw 如何把预测、履约和供应商协同接成一条实时执行链。",
    speakerNote:
      "这间最适合讲：系统一旦看见端到端流程，AI 才能真正开始调度动作。",
    scenarios: [
      {
        id: "demand-forecast",
        title: "需求预测代理",
        hook: "把销售、库存、季节性和活动变化融合成持续更新的需求信号。",
        problem:
          "需求预测常依赖静态表格和人工经验，遇到活动、天气或渠道波动时反应慢。",
        workflow: [
          "读取历史订单、活动计划、区域库存和外部事件数据。",
          "滚动刷新预测并标注不确定性高的 SKU/区域。",
          "同步给采购、仓储和销售，触发补货或促销调整建议。",
        ],
        outputs: ["滚动预测", "高风险 SKU 列表", "补货与促销建议"],
        kpis: ["减少缺货与积压", "提升跨部门协同速度", "让预测从月度变成持续刷新"],
        stat: "Microsoft 2025 物流文章：AI 创新可让物流成本降低 15%、库存水平优化 35%、服务水平提升 65%。",
        impactScore: 18,
        source: {
          label: "Microsoft - The future of logistics",
          url: "https://www.microsoft.com/en-us/industry/blog/manufacturing-and-mobility/mobility/2025/03/20/the-future-of-logistics-how-generative-ai-and-agentic-ai-is-creating-a-new-era-of-efficiency-and-innovation/",
          detail: "文章汇总物流与供应链中 AI 带来的效率空间与典型用例。",
        },
        demoResult:
          "OpenClaw 已把下周需求波动最大的 6 个 SKU 标红，并建议其中 2 个提前补货、1 个切换替代品。",
      },
      {
        id: "shipment-reroute",
        title: "履约改道代理",
        hook: "运输受阻时，不只报警，还直接给出改道方案和客户沟通稿。",
        problem:
          "一旦物流节点受阻，运营团队需要同时协调仓、运、客服和销售，靠人工判断容易慢半拍。",
        workflow: [
          "监听承运商状态、延误信号、天气和仓库负载。",
          "匹配替代仓、替代线路和优先级订单。",
          "同步生成客户通知、内部行动板和成本影响摘要。",
        ],
        outputs: ["改道建议", "高优订单队列", "客户沟通稿"],
        kpis: ["缩短异常处理时间", "降低高价值订单延误", "减少运营与客服之间的信息断层"],
        stat: "Microsoft 2025：91% 的物流企业表示，客户现在要求单一服务商提供 seamless end-to-end logistics 服务。",
        impactScore: 17,
        source: {
          label: "Microsoft - The future of logistics",
          url: "https://www.microsoft.com/en-us/industry/blog/manufacturing-and-mobility/mobility/2025/03/20/the-future-of-logistics-how-generative-ai-and-agentic-ai-is-creating-a-new-era-of-efficiency-and-innovation/",
          detail: "文章强调客户已经把端到端履约能力视作基本要求。",
        },
        demoResult:
          "OpenClaw 检测到港口延误后，已为 23 个订单生成改道建议，并自动写好延误通知模板。",
      },
      {
        id: "vendor-watch",
        title: "供应商协同代理",
        hook: "把供应商表现、交期风险和采购事项集中到同一个运营驾驶舱里。",
        problem:
          "供应商交付风险、价格变化和 SLA 偏差往往散落在邮件、表格和会议纪要里。",
        workflow: [
          "收集采购单、交期状态、质量反馈和供应商沟通记录。",
          "按 SLA 偏差、延误频次和影响订单规模生成风险画像。",
          "自动整理周会材料，并建议替代供应商或谈判动作。",
        ],
        outputs: ["供应商健康评分", "周会摘要", "替代方案建议"],
        kpis: ["更早发现供应风险", "提升采购会效率", "把供应链风险转换成行动列表"],
        stat: "Microsoft 2025：AI 用例已覆盖 inbound logistics、outbound logistics 以及支持活动，说明它不是局部点状能力。",
        impactScore: 13,
        source: {
          label: "Microsoft - The future of logistics",
          url: "https://www.microsoft.com/en-us/industry/blog/manufacturing-and-mobility/mobility/2025/03/20/the-future-of-logistics-how-generative-ai-and-agentic-ai-is-creating-a-new-era-of-efficiency-and-innovation/",
          detail: "文中专门列出 AI 在物流价值链中的多处落点。",
        },
        demoResult:
          "OpenClaw 已把 4 家关键供应商列入观察名单，并提前标记 2 个可能影响本月交付的交期风险。",
      },
    ],
  },
  {
    id: "production",
    name: "Production Control",
    shortName: "生产部",
    accent: "#f3722c",
    level: 0,
    position: { x: -54, z: 30 },
    size: { width: 30, depth: 26 },
    intro:
      "生产房间展示 OpenClaw 如何把排产、质量、交接和巡检拉成连续执行链。",
    speakerNote:
      "这里重点讲：AI 不只看数据，而是把产线信号转成排程、复检和升级动作。",
    scenarios: [
      {
        id: "production-scheduler",
        title: "排产协调代理",
        hook: "把订单、产能、物料和设备状态汇总后，持续刷新班次级别的排产建议。",
        problem:
          "生产排程常分散在 ERP、表格和现场口头同步里，一旦插单、缺料或设备波动，就需要多人手动重排。",
        workflow: [
          "汇总订单优先级、设备可用率、工时、物料到货与维修窗口。",
          "按班次和产线自动重算最优排程，并标出瓶颈工序与缺料风险。",
          "同步生成班组任务清单、加急单处理建议和跨部门协作提醒。",
        ],
        outputs: ["班次排产表", "瓶颈工序预警", "跨部门协同任务"],
        kpis: ["减少临时插单造成的混乱", "提高产线利用率", "缩短排产更新周期"],
        stat: "McKinsey 2025 COO100 Survey：COO 预期 AI 最大影响之一就是扩大产能、提升劳动生产率并增强端到端可视性。",
        impactScore: 18,
        source: {
          label: "McKinsey - How COOs can scale AI in manufacturing",
          url: "https://www.mckinsey.com/capabilities/operations/our-insights/from-pilots-to-performance-how-coos-can-scale-ai-in-manufacturing",
          detail: "2025 COO100 Survey，总结制造与运营高管最看重的 AI 价值点。",
        },
        demoResult:
          "OpenClaw 已把上午插入的 2 张加急单重排到三条产线，并提前标出 1 个缺料工位和 1 个设备冲突窗口。",
      },
      {
        id: "quality-watch",
        title: "质量异常代理",
        hook: "把巡检记录、视觉缺陷和返工趋势合并成可即时升级的质量驾驶舱。",
        problem:
          "质量异常通常分散在巡检表、设备日志和返工记录里，问题经常在批量放大后才被看见。",
        workflow: [
          "读取巡检结果、工位传感器、返工记录与质检图片描述。",
          "识别异常批次、重复缺陷模式和高风险工序。",
          "自动生成 CAPA 草稿、升级通知与复检清单。",
        ],
        outputs: ["异常批次看板", "CAPA 草稿", "复检与升级清单"],
        kpis: ["更早拦截批量缺陷", "减少返工成本", "提升质量问题的闭环速度"],
        stat: "PwC 2026 Industrial Manufacturing Outlook：37% 的 future-fit 制造企业已把先进技术更深入用在 production and operations。",
        impactScore: 16,
        source: {
          label: "PwC - Industrial manufacturers to more than double automation of key processes by 2030",
          url: "https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-global-industrial-manufacturing-sector-outlook.html",
          detail: "2026 工业制造业展望，包含先进技术在生产运营中的采用差异。",
        },
        demoResult:
          "OpenClaw 已在最近 6 个批次中锁定 2 个重复缺陷簇，并自动起草了班组复检与工艺复盘任务。",
      },
      {
        id: "shift-briefing",
        title: "班组交接代理",
        hook: "把班组长的口头交接，变成可追溯、可升级、可执行的数字交接板。",
        problem:
          "交接班时，设备风险、未完工工单和安全事项容易靠口头传递，信息缺失会直接影响后续班次执行。",
        workflow: [
          "聚合当前工单进度、设备状态、安全待办和异常记录。",
          "生成结构化交接摘要，按工位与责任人拆分事项。",
          "对高风险问题自动提醒维修、质量或仓储团队跟进。",
        ],
        outputs: ["交接班摘要", "责任人事项板", "高风险升级通知"],
        kpis: ["降低交接遗漏", "缩短班前准备时间", "提升异常处理响应速度"],
        stat: "TCS–AWS Future-Ready Manufacturing Study 2025：74% 受访者预计未来三年 AI agents 将独立管理 11% 至 50% 的例行生产决策。",
        impactScore: 15,
        source: {
          label: "TCS - Future-Ready Manufacturing Study 2025",
          url: "https://www.tcs.com/what-we-do/industries/manufacturing/future-ready-manufacturing-study-2025",
          detail: "2025 制造研究，讨论 AI agents 对日常生产决策的渗透速度。",
        },
        demoResult:
          "OpenClaw 已生成晚班交接板：含 9 项待办、2 项安全提醒和 1 个需要仓库补料的阻塞事项。",
      },
    ],
  },
  {
    id: "it",
    name: "IT Security NOC",
    shortName: "IT 安全部",
    accent: "#ff4d6d",
    level: 1,
    position: { x: 54, z: -28 },
    size: { width: 30, depth: 24 },
    intro:
      "IT 安全房间聚焦合规、巡检、工单与治理，说明 OpenClaw 作为执行层必须先可控再可扩张。",
    speakerNote:
      "最后一间房用来收束全场：没有治理，前面的自动化就无法规模化。",
    scenarios: [
      {
        id: "security-posture",
        title: "安全态势代理",
        hook: "对告警、资产、漏洞和配置漂移做汇总，把杂音压成可处理的优先级。",
        problem:
          "安全团队面对大量告警和分散资产，真正危险的事件容易被淹没。",
        workflow: [
          "接入日志、终端、身份系统和云配置清单。",
          "做重复告警压缩、资产关联和风险优先级排序。",
          "生成值班摘要、修复建议和升级工单。",
        ],
        outputs: ["值班摘要", "高危告警列表", "修复动作建议"],
        kpis: ["减少告警疲劳", "提升问题优先级准确度", "缩短值班交接时间"],
        stat: "Salesforce State of IT: Security 2025：75% 的组织计划增加安全预算。",
        impactScore: 16,
        source: {
          label: "Salesforce - State of IT: Security",
          url: "https://www.salesforce.com/resources/research-reports/4th-state-of-it-security/",
          detail: "报告基于 2000+ 安全、隐私和合规负责人调查。",
        },
        demoResult:
          "OpenClaw 已把 126 条告警压缩为 7 个待处理事件，并将其中 2 个标为需立即升级。",
      },
      {
        id: "compliance-copilot",
        title: "合规证据代理",
        hook: "把审计和合规中的找证据步骤自动化，保留可追溯链路。",
        problem:
          "合规检查往往要在多个系统里找截图、配置和审批记录，耗时长而且容易遗漏。",
        workflow: [
          "根据控制项清单自动收集日志、配置、审批和变更证据。",
          "识别证据缺口，生成补料请求。",
          "输出审计包和可追溯的来源链路。",
        ],
        outputs: ["审计证据包", "证据缺口列表", "控制项状态板"],
        kpis: ["减少审计前冲刺", "提升证据完整性", "让合规从年终项目变成常态化运营"],
        stat: "Salesforce 2025：69% 的安全领导者认为，监管变化加快使合规管理更困难。",
        impactScore: 14,
        source: {
          label: "Salesforce - State of IT: Security",
          url: "https://www.salesforce.com/resources/research-reports/4th-state-of-it-security/",
          detail: "报告直接指出合规复杂度在上升。",
        },
        demoResult:
          "OpenClaw 已为季度审计自动打包 18 项控制证据，并提醒 3 处缺失审批记录。",
      },
      {
        id: "agent-governance",
        title: "Agent 治理代理",
        hook: "对前面所有部门 Agent 的权限、数据边界和回写动作做统一审计。",
        problem:
          "多部门启用 Agent 后，如果没有统一治理，权限滥用、数据越界和错误执行都会放大。",
        workflow: [
          "追踪每个 Agent 的数据来源、动作范围和审批节点。",
          "对高风险操作启用策略校验、人工确认和日志留存。",
          "生成治理看板，标出高风险流程和待收敛权限。",
        ],
        outputs: ["Agent 审计日志", "高风险动作清单", "权限收敛建议"],
        kpis: ["让自动化可扩张而不失控", "为更多部门上线做安全前置", "让管理层放心放权"],
        stat: "Salesforce 2025：80% 的安全领导者认为 AI agents 会增强防御能力；另有 75% 预计两年内使用 AI agents。",
        impactScore: 20,
        source: {
          label: "Salesforce - IT security stats for 2025",
          url: "https://www.salesforce.com/news/stories/it-security-stats-2025/",
          detail: "新闻稿补充了安全团队对 AI agents 的采用预期与信心。",
        },
        demoResult:
          "OpenClaw 已为全楼 21 个自动化动作补齐权限说明和审批点，并标出 4 个需要加强治理的高风险回写操作。",
      },
    ],
  },
  {
    id: "product-design",
    name: "Product Design Studio",
    shortName: "产品设计",
    accent: "#43aa8b",
    level: 1,
    position: { x: 0, z: 30 },
    size: { width: 32, depth: 26 },
    intro:
      "产品设计房间强调 OpenClaw 如何把研究、发散、原型和交付串起来，缩短从想法到验证的周期。",
    speakerNote:
      "这里可以讲：AI 不替设计师做决定，而是放大调研、探索、评审和交付的吞吐量。",
    scenarios: [
      {
        id: "research-synth",
        title: "用户研究综合代理",
        hook: "把访谈、工单、评论和会话记录压缩成设计可以直接开工的洞察包。",
        problem:
          "产品设计常要在大量分散的访谈、工单与反馈里找模式，研究整理会拖慢设计迭代。",
        workflow: [
          "读取研究访谈、支持工单、问卷和产品使用反馈。",
          "聚类主要痛点、任务路径和高频设计机会点。",
          "输出 persona 更新、机会树和评审摘要。",
        ],
        outputs: ["研究摘要包", "机会点地图", "Persona 更新建议"],
        kpis: ["减少研究整理时间", "更快对齐设计方向", "让反馈进入持续迭代而非一次性报告"],
        stat: "Figma 2025 AI Report：调研覆盖 2,500 位 product builders，反映设计与开发团队正加速把 AI 接入日常工作流。",
        impactScore: 16,
        source: {
          label: "Figma - Figma’s 2025 AI report",
          url: "https://www.figma.com/reports/ai-2025/",
          detail: "Figma 官方 2025 AI 报告，基于七个国家的 2,500 名产品构建者调查。",
        },
        demoResult:
          "OpenClaw 已把 34 份访谈与 120 条反馈整合成 5 个核心痛点，并输出新 onboarding 流程的设计机会清单。",
      },
      {
        id: "prototype-generator",
        title: "原型生成代理",
        hook: "从需求说明直接生成多版可评审原型，减少从白板到首版的等待时间。",
        problem:
          "从 PM 需求、研究结论到可评审原型之间常有较长手工转换过程，导致探索版本不够多。",
        workflow: [
          "读取 PRD、成功指标与设计系统约束。",
          "生成多个低保真到中保真方案，并标出交互差异与适用场景。",
          "自动整理成评审包，附上取舍说明与待确认问题。",
        ],
        outputs: ["多版本原型", "设计评审包", "设计取舍说明"],
        kpis: ["缩短首版原型时间", "增加方案探索数量", "提升评审会议质量"],
        stat: "Figma 2025 AI Report：报告专门讨论 AI 对设计原则、协作方式与原型实践的影响，说明 AI 已进入设计主流程。",
        impactScore: 17,
        source: {
          label: "Figma Blog - Perspectives from designers and developers",
          url: "https://www.figma.com/blog/figma-2025-ai-report-perspectives/",
          detail: "Figma 官方博客对 2025 AI 报告关键发现的总结。",
        },
        demoResult:
          "OpenClaw 已根据结账流程需求生成 3 个交互方向，并自动标注需要 PM 决策的 4 个关键分歧点。",
      },
      {
        id: "design-qa-handoff",
        title: "设计交付代理",
        hook: "在开发前自动检查组件、文案、边界态和设计系统一致性，减少设计返工。",
        problem:
          "设计交付给前端前，常要人工检查组件命名、状态覆盖、标注与文案一致性，容易遗漏。",
        workflow: [
          "扫描设计稿、组件 token、交互说明和文案。",
          "识别缺失状态、未对齐组件和潜在可访问性问题。",
          "输出 handoff 清单、开发注释和修正建议。",
        ],
        outputs: ["Handoff 检查表", "一致性问题列表", "开发注释包"],
        kpis: ["减少返工", "降低设计到开发的信息损耗", "提升设计系统一致性"],
        stat: "Figma 2025 AI Report：设计团队关注的不只是生成速度，还包括设计原则和最佳实践如何被 AI 更好地理解与执行。",
        impactScore: 14,
        source: {
          label: "Figma - Figma’s 2025 AI report",
          url: "https://www.figma.com/reports/ai-2025/",
          detail: "报告包含对 design principles 与 best practices 的讨论。",
        },
        demoResult:
          "OpenClaw 已在交付前发现 11 处组件不一致、3 个缺失空状态和 2 处文案冲突，并生成开发 handoff 说明。",
      },
    ],
  },
  {
    id: "warehouse",
    name: "Warehouse Fulfillment",
    shortName: "仓库",
    accent: "#577590",
    level: 0,
    position: { x: 54, z: 30 },
    size: { width: 30, depth: 26 },
    intro:
      "仓库房间聚焦入库、拣选、分拣与异常处理，展示 OpenClaw 如何把物流可视化推进到履约执行。",
    speakerNote:
      "这间房适合讲：AI 不只是在仓库里看见问题，而是直接给出路线、任务和沟通动作。",
    scenarios: [
      {
        id: "slotting-optimizer",
        title: "库位优化代理",
        hook: "根据动销、体积和补货节奏持续重算库位，把热门 SKU 放到最该出现的位置。",
        problem:
          "仓库库位经常跟不上订单结构变化，热门商品离拣货路径太远会直接拉低效率。",
        workflow: [
          "读取订单热度、SKU 尺寸、补货频率和当前库位分布。",
          "识别高频移动 SKU 与低效路径，生成库位重排建议。",
          "输出调整任务、影响评估和执行优先级。",
        ],
        outputs: ["库位重排建议", "高频 SKU 热力图", "执行任务单"],
        kpis: ["缩短拣货路径", "减少补货冲突", "提升库容利用率"],
        stat: "Microsoft 2025 物流文章：AI 创新可让物流成本降低 15%、库存水平优化 35%、服务水平提升 65%。",
        impactScore: 17,
        source: {
          label: "Microsoft - The future of logistics",
          url: "https://www.microsoft.com/en-us/industry/blog/manufacturing-and-mobility/mobility/2025/03/20/the-future-of-logistics-how-generative-ai-and-agentic-ai-is-creating-a-new-era-of-efficiency-and-innovation/",
          detail: "微软 2025 物流文章，概述 AI 对库存、成本与服务水平的影响。",
        },
        demoResult:
          "OpenClaw 已为 A 区仓库输出 12 个库位重排建议，预计能减少热门 SKU 拣货路径 18%。",
      },
      {
        id: "picking-orchestrator",
        title: "拣选编排代理",
        hook: "把波次、人员、设备和订单优先级统一编排，让出库节奏更稳。",
        problem:
          "高峰期拣选常依赖班组长手动协调，人、车、波次和急单冲突容易让仓库节奏失衡。",
        workflow: [
          "汇总订单优先级、人员排班、设备状态和波次计划。",
          "动态拆分任务，给出人机协同拣选与补货顺序。",
          "自动同步包装台、出库口与客服通知节奏。",
        ],
        outputs: ["波次任务板", "人机协同任务清单", "出库优先级建议"],
        kpis: ["提高波次执行效率", "减少急单插队带来的混乱", "提升出库准时率"],
        stat: "NAIOP 2025：AI-enabled ASRS 和 warehouse robotics 被视为缓解劳动力压力、扩张仓库生产率的重要方向。",
        impactScore: 18,
        source: {
          label: "NAIOP - AI’s Role in Next-Generation Industrial Real Estate",
          url: "https://www.naiop.org/globalassets/research-and-publications/report/from-static-to-strategic-ais-role-in-next-generation-industrial-real-estate/2025-ais-role-in-next-generation-industrial-real-estate.pdf",
          detail: "2025 报告讨论 AI 仓储设施、ASRS 与机器人对生产率的影响。",
        },
        demoResult:
          "OpenClaw 已把下午波次拆成 3 组协同任务，优先保障 27 个加急单，并把包装台负载削峰到两个时段。",
      },
      {
        id: "dock-exception",
        title: "月台异常代理",
        hook: "当到货延迟、月台拥堵或出库异常出现时，系统直接给出改道与通知动作。",
        problem:
          "仓库月台异常通常牵连仓储、运输、客服和运营，人工协调会让问题快速放大。",
        workflow: [
          "监听到货 ETA、月台占用、出库队列和承运异常。",
          "推荐改道月台、临时缓存区和优先处理顺序。",
          "同步生成内部提醒、客户通知与下一步执行建议。",
        ],
        outputs: ["异常改道建议", "月台负载视图", "跨团队通知草稿"],
        kpis: ["减少月台拥堵", "缩短异常恢复时间", "让履约团队先于客户发现问题"],
        stat: "Microsoft 2025：91% 的物流企业表示客户现在要求单一服务商提供 seamless end-to-end logistics 服务。",
        impactScore: 15,
        source: {
          label: "Microsoft - The future of logistics",
          url: "https://www.microsoft.com/en-us/industry/blog/manufacturing-and-mobility/mobility/2025/03/20/the-future-of-logistics-how-generative-ai-and-agentic-ai-is-creating-a-new-era-of-efficiency-and-innovation/",
          detail: "文章强调客户对端到端物流透明度和连续服务的要求在提高。",
        },
        demoResult:
          "OpenClaw 已在月台拥堵出现前 20 分钟给出 2 套改道方案，并自动起草对运营和客服的同步通知。",
      },
    ],
  },
];

export const uniqueSources = Array.from(
  new Map(
    departments
      .flatMap((department) => department.scenarios.map((scenario) => [scenario.source.url, scenario.source] as const))
  ).values()
);
