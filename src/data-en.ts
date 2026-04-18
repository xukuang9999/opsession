import { departments as sourceDepartments } from "./data";
import type { Department } from "./data";

export type { SourceItem, Scenario, Department } from "./data";

type ScenarioTranslation = {
  title: string;
  hook: string;
  problem: string;
  workflow: string[];
  outputs: string[];
  kpis: string[];
  stat: string;
  demoResult: string;
  source: {
    detail: string;
  };
};

type DepartmentTranslation = {
  shortName: string;
  intro: string;
  speakerNote: string;
  scenarios: Record<string, ScenarioTranslation>;
};

const departmentTranslations: Record<string, DepartmentTranslation> = {
  marketing: {
    shortName: "Marketing",
    intro:
      "The marketing room shows how OpenClaw can turn market insight directly into execution through three linked workflows: competitors, pricing, and content.",
    speakerNote:
      "The key point here is that AI is not writing copy on its own. It first clarifies the market, then automatically advances the next step.",
    scenarios: {
      "market-research": {
        title: "Market Research Agent",
        hook: "Automatically turn noisy competitor signals into an intelligence brief that is ready for the next leadership meeting.",
        problem:
          "Marketing teams have to monitor competitor websites, social channels, review threads, and pricing pages every day. The information is fragmented and updates too quickly.",
        workflow: [
          "Pull competitor websites, news, reviews, and search trends into a single workflow.",
          "Cluster and detect changes by brand, price band, value proposition, and campaign frequency.",
          "Automatically generate a one-page executive summary and a one-page action brief, then send them to Slack or Feishu.",
        ],
        outputs: ["Competitor weekly report", "New launch and campaign alerts", "Differentiated messaging recommendations"],
        kpis: [
          "Save 6 to 8 hours of manual synthesis each week",
          "Shorten campaign briefing preparation time",
          "Reduce the chance of missing competitor moves",
        ],
        stat:
          "HubSpot 2024: 74% of marketers already use at least one AI tool at work, and 43% rank content creation as the top use case.",
        source: {
          detail: "Updated in 2024 and based on a survey of 1,000+ marketing and advertising professionals.",
        },
        demoResult:
          "OpenClaw has generated the Asia-Pacific Competitor Weekly Brief, highlighting 3 new promotions, 2 price-cut signals, and 1 recurring customer complaint theme.",
      },
      "price-watch": {
        title: "Price Monitoring Agent",
        hook: "Turn the daily habit of refreshing webpages for price checks into always-on anomaly monitoring.",
        problem:
          "Price shifts, discount strategies, and SKU packaging updates are scattered across multiple ecommerce platforms and landing pages, making real-time alignment difficult.",
        workflow: [
          "Poll competitor sites, marketplaces, and regional pages to detect changes in price, inventory, and promotional copy.",
          "Apply thresholds to abnormal movement and automatically label it as normal fluctuation, needs response, or follow up now.",
          "Coordinate with marketing and sales leads to generate countermeasures and follow-up tasks.",
        ],
        outputs: ["Price change alerts", "Promotion strategy comparison table", "Regional channel pricing alerts"],
        kpis: [
          "Detect competitor price cuts the same day they happen",
          "Reduce manual comparison errors",
          "Give sales and marketing a single factual baseline",
        ],
        stat:
          "McKinsey 2025: Organizations most often deploy generative AI in high-value functions such as marketing and sales, service operations, and software engineering.",
        source: {
          detail: "The 2025 global survey shows generative AI is now in routine use across multiple business functions.",
        },
        demoResult:
          "OpenClaw detected that a North American competitor cut the price of its flagship SKU by 8% within four hours, and proposed two responses: a limited-time bundle or a stronger service-value message.",
      },
      "blog-refresh": {
        title: "Content Refresh Agent",
        hook: "When products launch, prices change, or customer stories are updated, blogs and landing pages can refresh automatically.",
        problem:
          "Marketing content often lags behind product and market changes, and inconsistencies emerge across the website, blog, email, and social channels.",
        workflow: [
          "Monitor product updates, campaign cadence, and changes in brand asset libraries.",
          "Extract key information and generate blog outlines, SEO titles, email summaries, and multilingual variants.",
          "After human approval, publish automatically while preserving version diffs and source links.",
        ],
        outputs: ["Blog drafts", "SEO update recommendations", "Multilingual email and social assets"],
        kpis: [
          "Launch content faster",
          "Reduce cross-team copy review loops",
          "Keep brand messaging consistent",
        ],
        stat:
          "HubSpot 2024: Nearly 70% of marketing leaders who invested in AI say it has delivered positive ROI in employee productivity and efficiency.",
        source: {
          detail: "The article notes that nearly 70% of marketing leaders who invested in AI are seeing positive ROI.",
        },
        demoResult:
          "OpenClaw has rewritten the product launch announcement into 1 blog post, 1 EDM copy set, and 4 LinkedIn posts, while flagging the sections that still need human confirmation.",
      },
    },
  },
  sales: {
    shortName: "Sales",
    intro:
      "The sales room shows how OpenClaw can connect pre-meeting research, quoting, follow-up, and renewal risk into a closed loop, so sellers can spend more time closing.",
    speakerNote:
      "This room is best for explaining that AI is not there to chat for sales reps. It automates preparation, follow-up, and system write-back.",
    scenarios: {
      "account-research": {
        title: "Account Research Agent",
        hook: "Walk into a customer meeting with a one-page account brief generated automatically.",
        problem:
          "Before meetings, sales reps have to manually search company news, org changes, product usage, and historical interactions, which makes prep expensive.",
        workflow: [
          "Read from the CRM, email summaries, company news, and public financial and organizational information.",
          "Generate a pre-meeting brief with buying signals, risks, and recommended talk tracks.",
          "After the meeting, automatically write back action items, next-step recommendations, and updated win probability.",
        ],
        outputs: ["Pre-meeting brief", "Stakeholder map", "Next-step recommendations"],
        kpis: [
          "Cut pre-meeting prep time",
          "Improve frontline understanding of each account",
          "Increase CRM data completeness",
        ],
        stat:
          "Salesforce 2026: Reps spend only 40% of their time actually selling, with the rest consumed by prospecting, quoting, data entry, and related work.",
        source: {
          detail: "The 7th edition of State of Sales shows that a large share of sales time is still spent on non-selling tasks.",
        },
        demoResult:
          "OpenClaw has generated a pre-meeting dossier for a target APAC account, uncovering 2 org changes, 1 potential budget window, and 3 recommended questions.",
      },
      "quote-builder": {
        title: "Quote and Outreach Agent",
        hook: "Turn quotes and follow-up emails from copy-paste templates into an auditable, automatically generated process.",
        problem:
          "Sales teams often keep manually revising quotes, personalized emails, and product bundle explanations, which is slow and error-prone.",
        workflow: [
          "Generate a tailored proposal based on customer profile, historical deals, and current inventory or service capacity.",
          "Automatically draft the pricing narrative, follow-up emails, and ROI messaging.",
          "After approval, sync everything back to the CRM, task system, and document repository.",
        ],
        outputs: ["Quote package", "Personalized follow-up emails", "ROI messaging recommendations"],
        kpis: [
          "Speed up proposal turnaround",
          "Make external messaging more consistent",
          "Reduce manual data-entry errors",
        ],
        stat:
          "Salesforce 2026: 94% of sales leaders already using AI agents say they are critical for meeting business needs.",
        source: {
          detail: "Sales leaders increasingly treat agents as growth infrastructure rather than edge experiments.",
        },
        demoResult:
          "OpenClaw has assembled a quote package for a manufacturing prospect, including pricing, implementation timeline, risk notes, and 2 role-specific follow-up emails.",
      },
      "renewal-risk": {
        title: "Renewal Risk Agent",
        hook: "Automatically identify silent customers and low-engagement accounts 30 days before renewal.",
        problem:
          "Customer success and sales often wait until just before renewal to gather usage data and risk signals, leaving too little time to recover the account.",
        workflow: [
          "Aggregate usage, support tickets, NPS, billing data, and key-contact activity.",
          "Detect expansion, contraction, and churn signals, then produce a prioritized queue.",
          "Automatically assign the next action: schedule a review call, send a case study, trigger discount approval, or escalate support.",
        ],
        outputs: ["Renewal heat map", "Customer health score", "Retention action list"],
        kpis: [
          "Spot churn risk earlier",
          "Give sales, CS, and support a shared decision baseline",
          "Turn data into action instead of static reporting",
        ],
        stat:
          "Salesforce 2024: 83% of sales teams using AI reported revenue growth this year, versus 66% of teams not using AI.",
        source: {
          detail: "The 2024 survey links AI adoption with revenue growth and stronger sales efficiency.",
        },
        demoResult:
          "OpenClaw flagged 5 high-risk accounts in the renewal list, with 2 driven by declining engagement and 3 driven by unresolved support issues.",
      },
    },
  },
  support: {
    shortName: "Support",
    intro:
      "The support room demonstrates how OpenClaw can intake, route, summarize, reply, and continuously feed the knowledge base.",
    speakerNote: "Emphasize that AI should handle standard questions first, then hand complex issues to people.",
    scenarios: {
      "triage-routing": {
        title: "Ticket Triage Agent",
        hook: "Automatically classify, prioritize, and route multilingual tickets to reduce manual first-pass triage.",
        problem:
          "Support comes in through many channels and languages, with uneven urgency. Manual triage is easy to delay or misroute.",
        workflow: [
          "Read emails, forms, chat logs, and attachments to identify issue type and urgency.",
          "Recommend queue ownership and response templates based on SLA, customer tier, and historical cases.",
          "Automatically trigger refunds, escalations, or internal collaboration workflows when needed.",
        ],
        outputs: ["Ticket priority", "Recommended owner", "First-response draft"],
        kpis: [
          "Shorten first response time",
          "Reduce routing mistakes",
          "Automatically resolve simple issues without human touch",
        ],
        stat:
          "Salesforce 2025: By 2027, 50% of service cases are expected to be resolved by AI, up from 30% in 2025.",
        source: {
          detail: "The 7th edition of State of Service surveyed 6,500 service professionals.",
        },
        demoResult:
          "OpenClaw completed first-pass routing for 18 new tickets: 9 went to FAQ automation, 5 were escalated to agents, and 4 were sent to the product team.",
      },
      "case-summarizer": {
        title: "Case Summary Agent",
        hook: "Compress long threads, multi-turn conversations, and cross-channel history into a handoff brief that someone can immediately take over.",
        problem:
          "When complex cases are transferred or escalated, engineers and supervisors often have to reread a long context from scratch.",
        workflow: [
          "Extract cross-channel conversations, order history, device details, and actions already taken.",
          "Generate a four-part summary covering the customer request, actions taken, risks, and recommended next steps.",
          "Attach a suggested reply, escalation note, and relevant knowledge-base links.",
        ],
        outputs: ["Escalation summary", "Manager view", "Recommended reply draft"],
        kpis: [
          "Reduce handoff cost",
          "Improve escalation speed",
          "Lower customer frustration caused by repeated questions",
        ],
        stat:
          "Salesforce 2025: Service reps using AI spend about 4 fewer hours per week on routine cases, freeing time for more complex work.",
        source: {
          detail: "The announcement summarizes how AI is changing service roles and time allocation.",
        },
        demoResult:
          "OpenClaw compressed 47 email and chat interactions into a one-page escalation summary and attached 3 response versions that can be sent immediately.",
      },
      "kb-refresh": {
        title: "Knowledge Base Refresh Agent",
        hook: "Turn recurring questions into documentation automatically instead of relying on team memory.",
        problem:
          "Knowledge bases often lag behind front-line issues, so the same problems keep getting handled and re-explained.",
        workflow: [
          "Aggregate similar tickets and identify high-frequency topics, root causes, and effective resolutions.",
          "Produce knowledge-base drafts, FAQ structures, and a screenshot checklist.",
          "After review, automatically publish to the help center and internal support handbook.",
        ],
        outputs: ["FAQ draft", "Internal SOP update recommendations", "Multilingual help-center content"],
        kpis: [
          "Reduce repeat tickets",
          "Help new team members ramp faster",
          "Keep AI-generated responses getting more accurate over time",
        ],
        stat:
          "Zendesk 2026: 74% of consumers now expect customer service to be available 24/7, and 88% expect faster responses than they did a year ago.",
        source: {
          detail: "The 2026 CX Trends homepage highlights the latest customer expectations for always-on service and faster response times.",
        },
        demoResult:
          "OpenClaw generated 4 knowledge-base drafts from 62 repeat issues this week and estimates they can cover 31% of recurring inquiries.",
      },
    },
  },
  finance: {
    shortName: "Finance",
    intro:
      "The finance room highlights how OpenClaw turns invoices, forecasting, anomalies, and collaboration into an auditable execution chain.",
    speakerNote:
      "Finance is where you stress that AI is not just generating reports. It helps teams validate, forecast, and flag risks faster.",
    scenarios: {
      "invoice-reconcile": {
        title: "Invoice Reconciliation Agent",
        hook: "Turn manual checks across invoices, expense claims, and statements into automatic matching with anomaly flags.",
        problem:
          "Finance teams spend a large amount of repetitive effort on invoice extraction, expense classification, and reconciliation across multiple systems, and errors are easy to make.",
        workflow: [
          "Parse invoices, reimbursement attachments, and vendor bills to extract key fields.",
          "Check consistency against procurement, contract, budget, and ERP data.",
          "Flag missing fields, abnormal amounts, and duplicate claims, then generate a review queue.",
        ],
        outputs: ["Reconciliation exception list", "Review queue", "Structured records after auto-archiving"],
        kpis: ["Shorten the month-end close cycle", "Lower manual review effort", "Reduce booking errors"],
        stat:
          "Workday CFO AI Indicator: Finance leaders see automated reconciliation and expense workflows among the fastest AI wins, cited by 28%.",
        source: {
          detail: "The report lists finance AI use cases with the most immediate value, including reconciliation and expense automation.",
        },
        demoResult:
          "OpenClaw found 11 amount anomalies and 3 suspected duplicate claims across 240 documents, then generated a finance review list.",
      },
      "fpa-simulator": {
        title: "FP&A Scenario Modeling Agent",
        hook: "Generate multi-scenario forecasts automatically before budget meetings instead of scrambling to build spreadsheets at the last minute.",
        problem:
          "Budget changes and operating forecasts often require collecting input across business lines. Timelines are tight, assumptions vary, and scenarios are hard to recalculate quickly.",
        workflow: [
          "Consolidate revenue, cost, procurement, headcount, and project progress data.",
          "Automatically generate best-case, base-case, and worst-case forecasts as assumptions change.",
          "Produce a board-ready summary with an explanation of the variables that matter most.",
        ],
        outputs: ["Three-scenario forecast board", "Budget variance narrative", "Operating review summary"],
        kpis: [
          "Improve prep efficiency for operating reviews",
          "Expose margin and cash-flow pressure points faster",
          "Move finance from report production to business recommendations",
        ],
        stat:
          "Workday CFO AI Indicator: 34% of finance leaders say AI can create immediate value by improving forecasts and budget decisions.",
        source: {
          detail: "The report explicitly lists forecasting, budgeting, and scenario planning as high-value use cases.",
        },
        demoResult:
          "OpenClaw generated 3 quarterly budget scenarios and showed that channel discounts and logistics cost increases have the biggest impact on margin.",
      },
      "anomaly-guard": {
        title: "Anomaly and Risk Agent",
        hook: "Raise alerts as soon as abnormal spending, data variance, or potential risk starts to appear.",
        problem:
          "Finance teams often discover variances only at the end of a reporting cycle, after the window for timely correction has already narrowed.",
        workflow: [
          "Monitor key flows such as the general ledger, procurement, expenses, and revenue recognition.",
          "Use rules and models together to detect unusual distributions, abnormal movements, and missing evidence.",
          "Automatically generate risk notes, ownership mapping, and a checklist of supporting materials.",
        ],
        outputs: ["Anomaly alerts", "Audit prep package", "Cross-functional follow-up tasks"],
        kpis: ["Surface risks earlier", "Reduce audit preparation pressure", "Improve explainability and governance"],
        stat:
          "Workday CFO AI Indicator: 35% of finance leaders say finance and accounting is one of the least prepared areas in the enterprise for AI adoption, which makes governance critical.",
        source: {
          detail: "The report also highlights finance teams' concerns about transparency, bias, and security.",
        },
        demoResult:
          "OpenClaw found 2 abnormal spend clusters in procurement accounts and automatically pulled the missing attachments and approval records.",
      },
    },
  },
  hr: {
    shortName: "HR",
    intro:
      "The HR room focuses on recruiting, onboarding, learning, and policy Q&A, positioning OpenClaw as a process orchestration layer rather than a simple assistant.",
    speakerNote:
      "HR is a good place to explain that standardized judgments can be delegated to AI, while final decisions and experience design stay with people.",
    scenarios: {
      "skill-hiring": {
        title: "Skills Hiring Agent",
        hook: "Connect job descriptions, resumes, skill graphs, and interview scheduling into one continuous workflow.",
        problem:
          "Recruiting teams repeatedly screen resumes, compare skills, and coordinate interviews, while different hiring managers often use inconsistent standards.",
        workflow: [
          "Parse job descriptions and extract must-have and nice-to-have skills.",
          "Scan candidate resumes and portfolios, then explain initial screening decisions with a skills-first approach.",
          "Automatically generate a shortlist, interview questions, and interviewer briefings.",
        ],
        outputs: ["Candidate shortlist", "Skill-match rationale", "Structured interview questions"],
        kpis: [
          "Speed up first-round screening",
          "Standardize skill-based evaluation",
          "Reduce unnecessary interview scheduling",
        ],
        stat:
          "LinkedIn 2025 Future of Recruiting: 73% of talent acquisition professionals believe AI will change how their organizations hire.",
        source: {
          detail: "The LinkedIn report focuses on how AI is reshaping recruiting excellence.",
        },
        demoResult:
          "OpenClaw screened 120 resumes, identified 8 high-match candidates, and attached skill-gap explanations and interview recommendations.",
      },
      "onboarding-agent": {
        title: "Onboarding Coordination Agent",
        hook: "Pull the fragmented tasks after offer acceptance into a single new-hire experience flow.",
        problem:
          "Onboarding spans HR, IT, managers, and workplace teams, and multi-role coordination easily leads to missed steps.",
        workflow: [
          "Create an onboarding task package and timeline from role templates.",
          "Automatically follow up on devices, accounts, training, buddy setup, and the first-week schedule.",
          "Escalate incomplete tasks to the owner and provide the new hire with a single entry point.",
        ],
        outputs: ["Onboarding checklist", "First-week schedule", "Cross-team task status board"],
        kpis: [
          "Reduce missing accounts or devices",
          "Improve the new hire experience in the first two weeks",
          "Cut manual HR chasing",
        ],
        stat:
          "Microsoft Work Trend Index 2025: Over the next five years, 41% of leaders expect teams to train agents and 36% expect teams to manage agents.",
        source: {
          detail: "The report introduces the idea of the agent boss and argues that every function will learn to train and manage agents.",
        },
        demoResult:
          "OpenClaw created a Day 1-14 onboarding path for a new sales manager and automatically reminded IT to provision 5 system accesses.",
      },
      "learning-path": {
        title: "Learning and Policy Q&A Agent",
        hook: "Let HR spend less time answering repeat questions and more time designing better growth paths for employees.",
        problem: "Policy questions and training recommendations repeat constantly, which traps HR in FAQ-style work.",
        workflow: [
          "Read policy documents, role maps, and historical training records.",
          "Generate learning paths by role and capability gap, and answer policy questions.",
          "When human confirmation is needed, automatically escalate to the HRBP or hiring manager.",
        ],
        outputs: ["Personalized learning path", "Policy Q&A summary", "Queue for human escalation"],
        kpis: ["Reduce repetitive HR Q&A", "Make learning recommendations more specific", "Improve employee self-service"],
        stat:
          "LinkedIn 2025: 93% of talent acquisition professionals say accurately assessing candidate skills is critical to improving quality of hire, and 61% think AI can improve quality-of-hire measurement.",
        source: {
          detail: "The report also emphasizes skills-based hiring and better ways to measure quality of hire.",
        },
        demoResult:
          "OpenClaw generated a 90-day growth plan for an operations employee and answered 14 policy questions with traceable citations.",
      },
    },
  },
  ops: {
    shortName: "Operations",
    intro:
      "The operations room emphasizes how OpenClaw can connect forecasting, fulfillment, and supplier coordination into a real-time execution chain.",
    speakerNote:
      "This is the best room to explain that AI can only start orchestrating real action once systems can see the end-to-end process.",
    scenarios: {
      "demand-forecast": {
        title: "Demand Forecasting Agent",
        hook: "Fuse sales, inventory, seasonality, and campaign changes into a demand signal that keeps updating.",
        problem:
          "Demand planning often relies on static spreadsheets and human experience, so it reacts slowly when campaigns, weather, or channel volatility hit.",
        workflow: [
          "Read historical orders, campaign plans, regional inventory, and external event data.",
          "Refresh the forecast on a rolling basis and flag SKUs or regions with high uncertainty.",
          "Sync with procurement, warehousing, and sales to trigger replenishment or promotional adjustments.",
        ],
        outputs: ["Rolling forecast", "High-risk SKU list", "Replenishment and promotion recommendations"],
        kpis: [
          "Reduce stockouts and excess inventory",
          "Speed up cross-functional coordination",
          "Move forecasting from monthly refreshes to continuous updates",
        ],
        stat:
          "Microsoft 2025 logistics article: AI innovation can reduce logistics costs by 15%, optimize inventory levels by 35%, and improve service levels by 65%.",
        source: {
          detail: "The article summarizes the efficiency upside and representative AI use cases across logistics and supply chains.",
        },
        demoResult:
          "OpenClaw flagged the 6 SKUs with the largest demand swings for next week and recommended early replenishment for 2 of them and substitution for 1.",
      },
      "shipment-reroute": {
        title: "Fulfillment Rerouting Agent",
        hook: "When transport is disrupted, do more than raise an alert. Produce rerouting plans and customer communications immediately.",
        problem:
          "Once a logistics node is blocked, operations teams have to coordinate warehouses, carriers, support, and sales at the same time, and manual judgment slows the response.",
        workflow: [
          "Monitor carrier status, delay signals, weather, and warehouse load.",
          "Match alternative warehouses, alternative routes, and priority orders.",
          "Generate customer notices, an internal action board, and a cost-impact summary at the same time.",
        ],
        outputs: ["Rerouting recommendations", "High-priority order queue", "Customer communication draft"],
        kpis: [
          "Shorten exception handling time",
          "Reduce delays on high-value orders",
          "Close the information gap between operations and support",
        ],
        stat:
          "Microsoft 2025: 91% of logistics companies say customers now expect a single provider to deliver seamless end-to-end logistics services.",
        source: {
          detail: "The article stresses that customers now treat end-to-end fulfillment capability as a baseline expectation.",
        },
        demoResult:
          "After detecting a port delay, OpenClaw generated rerouting plans for 23 orders and automatically wrote a delay-notification template.",
      },
      "vendor-watch": {
        title: "Vendor Coordination Agent",
        hook: "Bring supplier performance, lead-time risk, and procurement issues into one operating cockpit.",
        problem:
          "Supplier delivery risk, price changes, and SLA deviations are often scattered across emails, spreadsheets, and meeting notes.",
        workflow: [
          "Collect purchase orders, ETA status, quality feedback, and supplier communication records.",
          "Build risk profiles based on SLA deviation, delay frequency, and the size of impacted orders.",
          "Automatically prepare weekly review materials and recommend backup suppliers or negotiation actions.",
        ],
        outputs: ["Supplier health score", "Weekly review summary", "Alternative sourcing recommendations"],
        kpis: [
          "Spot supply risk earlier",
          "Improve procurement meeting efficiency",
          "Turn supply chain risk into an action list",
        ],
        stat:
          "Microsoft 2025: AI use cases now span inbound logistics, outbound logistics, and support activities, showing this is not a narrow point solution.",
        source: {
          detail: "The article explicitly lists multiple places where AI can create value across the logistics value chain.",
        },
        demoResult:
          "OpenClaw placed 4 critical suppliers on the watch list and flagged 2 lead-time risks that could affect deliveries this month.",
      },
    },
  },
  production: {
    shortName: "Production",
    intro:
      "The production room shows how OpenClaw can pull scheduling, quality, handoffs, and inspections into a continuous execution chain.",
    speakerNote:
      "The key point here is that AI does not just watch data. It turns line signals into scheduling, reinspection, and escalation actions.",
    scenarios: {
      "production-scheduler": {
        title: "Production Scheduling Agent",
        hook: "Combine orders, capacity, materials, and equipment status to continuously refresh shift-level scheduling recommendations.",
        problem:
          "Production schedules are often split across ERP, spreadsheets, and verbal coordination on the floor. Any rush order, material shortage, or equipment change forces multiple people to reschedule manually.",
        workflow: [
          "Consolidate order priority, equipment availability, labor hours, material arrivals, and maintenance windows.",
          "Automatically recalculate the best schedule by shift and line, then flag bottleneck steps and material-shortage risks.",
          "Generate crew task lists, rush-order handling suggestions, and cross-functional coordination reminders.",
        ],
        outputs: ["Shift schedule", "Bottleneck step alerts", "Cross-functional coordination tasks"],
        kpis: ["Reduce chaos caused by rush-order insertions", "Increase line utilization", "Shorten schedule update cycles"],
        stat:
          "McKinsey 2025 COO100 Survey: COOs expect AI to have one of its biggest impacts in expanding capacity, improving labor productivity, and increasing end-to-end visibility.",
        source: {
          detail: "The 2025 COO100 Survey summarizes the AI value points that matter most to manufacturing and operations leaders.",
        },
        demoResult:
          "OpenClaw rescheduled 2 rush orders inserted this morning across 3 lines and flagged 1 material-shortage station and 1 equipment conflict window in advance.",
      },
      "quality-watch": {
        title: "Quality Exception Agent",
        hook: "Combine inspection records, visual defects, and rework trends into a quality cockpit that can escalate immediately.",
        problem:
          "Quality exceptions are usually scattered across inspection sheets, equipment logs, and rework records, so issues are often noticed only after they scale across a batch.",
        workflow: [
          "Read inspection results, workstation sensors, rework records, and descriptions of QC images.",
          "Identify abnormal batches, recurring defect patterns, and high-risk process steps.",
          "Automatically generate CAPA drafts, escalation notices, and reinspection checklists.",
        ],
        outputs: ["Abnormal batch board", "CAPA draft", "Reinspection and escalation checklist"],
        kpis: ["Intercept batch defects earlier", "Reduce rework cost", "Close the loop on quality issues faster"],
        stat:
          "PwC 2026 Industrial Manufacturing Outlook: 37% of future-fit manufacturers have already embedded advanced technologies more deeply into production and operations.",
        source: {
          detail: "The 2026 industrial manufacturing outlook describes adoption gaps for advanced technology across production operations.",
        },
        demoResult:
          "OpenClaw isolated 2 recurring defect clusters across the latest 6 batches and automatically drafted reinspection and process review tasks for the line team.",
      },
      "shift-briefing": {
        title: "Shift Handoff Agent",
        hook: "Turn supervisors' verbal handoffs into a traceable, escalatable, executable digital handoff board.",
        problem:
          "During shift changes, equipment risks, unfinished work orders, and safety issues are often passed on verbally. Missing information directly affects the next shift's execution.",
        workflow: [
          "Aggregate current work-order progress, equipment status, safety to-dos, and exception logs.",
          "Generate a structured handoff summary and split tasks by workstation and owner.",
          "Automatically notify maintenance, quality, or warehouse teams to follow up on high-risk issues.",
        ],
        outputs: ["Shift handoff summary", "Owner task board", "High-risk escalation notice"],
        kpis: ["Reduce handoff omissions", "Shorten pre-shift preparation time", "Improve response speed for exceptions"],
        stat:
          "TCS-AWS Future-Ready Manufacturing Study 2025: 74% of respondents expect AI agents to independently manage 11% to 50% of routine production decisions within three years.",
        source: {
          detail: "The 2025 manufacturing study examines how quickly AI agents are expected to penetrate day-to-day production decisions.",
        },
        demoResult:
          "OpenClaw generated the night-shift handoff board with 9 pending items, 2 safety reminders, and 1 blocking issue that requires warehouse replenishment.",
      },
    },
  },
  it: {
    shortName: "IT Security",
    intro:
      "The IT security room focuses on compliance, monitoring, tickets, and governance, showing that OpenClaw must be controllable before it can scale as an execution layer.",
    speakerNote: "Use the final room to close the whole story: without governance, none of the earlier automation can scale.",
    scenarios: {
      "security-posture": {
        title: "Security Posture Agent",
        hook: "Aggregate alerts, assets, vulnerabilities, and configuration drift so the noise collapses into a workable priority list.",
        problem:
          "Security teams face a flood of alerts and fragmented assets, which makes truly dangerous events easy to miss.",
        workflow: [
          "Connect logs, endpoints, identity systems, and cloud configuration inventories.",
          "Compress duplicate alerts, correlate assets, and rank risks by priority.",
          "Generate on-call summaries, remediation recommendations, and escalation tickets.",
        ],
        outputs: ["On-call summary", "Critical alert list", "Remediation recommendations"],
        kpis: ["Reduce alert fatigue", "Improve prioritization accuracy", "Shorten on-call handoff time"],
        stat: "Salesforce State of IT: Security 2025: 75% of organizations plan to increase security budgets.",
        source: {
          detail: "The report is based on a survey of more than 2,000 security, privacy, and compliance leaders.",
        },
        demoResult:
          "OpenClaw compressed 126 alerts into 7 incidents to handle and marked 2 of them for immediate escalation.",
      },
      "compliance-copilot": {
        title: "Compliance Evidence Agent",
        hook: "Automate the evidence-gathering steps in audits and compliance while preserving a traceable chain.",
        problem:
          "Compliance checks often require hunting across multiple systems for screenshots, configurations, and approval records, which is slow and easy to miss.",
        workflow: [
          "Automatically collect log, configuration, approval, and change evidence based on the control checklist.",
          "Detect evidence gaps and generate requests for missing materials.",
          "Output an audit package with traceable source links.",
        ],
        outputs: ["Audit evidence package", "Evidence gap list", "Control status board"],
        kpis: [
          "Reduce the pre-audit scramble",
          "Improve evidence completeness",
          "Turn compliance from a year-end project into ongoing operations",
        ],
        stat: "Salesforce 2025: 69% of security leaders say accelerating regulatory change is making compliance harder to manage.",
        source: {
          detail: "The report directly states that compliance complexity is rising.",
        },
        demoResult:
          "OpenClaw automatically packaged evidence for 18 quarterly audit controls and flagged 3 missing approval records.",
      },
      "agent-governance": {
        title: "Agent Governance Agent",
        hook: "Audit the permissions, data boundaries, and write-back actions of every department agent under one control layer.",
        problem:
          "Once multiple departments deploy agents, any lack of unified governance amplifies permission abuse, data overreach, and bad execution.",
        workflow: [
          "Track each agent's data sources, action scope, and approval checkpoints.",
          "Apply policy checks, human confirmation, and log retention to high-risk actions.",
          "Generate a governance dashboard that highlights high-risk workflows and permissions that should be tightened.",
        ],
        outputs: ["Agent audit log", "High-risk action list", "Permission-hardening recommendations"],
        kpis: [
          "Let automation scale without losing control",
          "Build security in before expanding to more departments",
          "Give leadership confidence to delegate authority",
        ],
        stat:
          "Salesforce 2025: 80% of security leaders believe AI agents will strengthen defense, and 75% expect to use AI agents within two years.",
        source: {
          detail: "The news release adds adoption expectations and confidence levels among security teams regarding AI agents.",
        },
        demoResult:
          "OpenClaw added permission notes and approval points for 21 automated actions across the building and flagged 4 high-risk write-back operations that need stronger governance.",
      },
    },
  },
  "product-design": {
    shortName: "Product Design",
    intro:
      "The product design room highlights how OpenClaw can connect research, ideation, prototyping, and delivery to shorten the path from idea to validation.",
    speakerNote:
      "This room is where you explain that AI does not decide for designers. It increases the throughput of research, exploration, critique, and delivery.",
    scenarios: {
      "research-synth": {
        title: "User Research Synthesis Agent",
        hook: "Compress interviews, support tickets, reviews, and session records into an insight pack that design can act on immediately.",
        problem:
          "Product and design teams often have to find patterns across scattered interviews, tickets, and feedback, and the synthesis work slows iteration.",
        workflow: [
          "Read research interviews, support tickets, surveys, and product feedback.",
          "Cluster major pain points, task flows, and high-frequency design opportunities.",
          "Output persona updates, an opportunity tree, and a review summary.",
        ],
        outputs: ["Research synthesis pack", "Opportunity map", "Persona update recommendations"],
        kpis: [
          "Reduce research synthesis time",
          "Align design direction faster",
          "Make feedback part of continuous iteration instead of one-off reports",
        ],
        stat:
          "Figma 2025 AI Report: The study surveyed 2,500 product builders and shows that design and development teams are rapidly weaving AI into daily workflows.",
        source: {
          detail: "Figma's official 2025 AI report is based on a survey of 2,500 product builders across seven countries.",
        },
        demoResult:
          "OpenClaw consolidated 34 interviews and 120 feedback items into 5 core pain points and produced a list of design opportunities for a new onboarding flow.",
      },
      "prototype-generator": {
        title: "Prototype Generation Agent",
        hook: "Generate multiple reviewable prototypes directly from requirements so teams spend less time waiting between the whiteboard and the first draft.",
        problem:
          "There is often a long manual translation step between PM requirements, research findings, and reviewable prototypes, which limits how many directions can be explored.",
        workflow: [
          "Read the PRD, success metrics, and design-system constraints.",
          "Generate several low- to mid-fidelity options and highlight interaction differences and best-fit use cases.",
          "Automatically package them for review with trade-off notes and open questions.",
        ],
        outputs: ["Multi-version prototypes", "Design review pack", "Design trade-off notes"],
        kpis: ["Shorten time to first prototype", "Increase the number of concepts explored", "Improve review meeting quality"],
        stat:
          "Figma 2025 AI Report: The report specifically discusses how AI is reshaping design principles, collaboration, and prototyping, showing that AI is already part of the core design workflow.",
        source: {
          detail: "Figma's official blog summarizes the key findings from the 2025 AI report.",
        },
        demoResult:
          "OpenClaw generated 3 interaction directions from the checkout flow requirements and automatically marked 4 key points that still need PM decisions.",
      },
      "design-qa-handoff": {
        title: "Design Handoff Agent",
        hook: "Automatically check components, copy, edge states, and design-system consistency before development starts to reduce rework.",
        problem:
          "Before designs are handed to front-end engineers, teams often manually verify component naming, state coverage, annotations, and copy consistency, and misses are common.",
        workflow: [
          "Scan designs, component tokens, interaction notes, and copy.",
          "Identify missing states, misaligned components, and potential accessibility issues.",
          "Output a handoff checklist, developer annotations, and suggested fixes.",
        ],
        outputs: ["Handoff checklist", "Consistency issue list", "Developer annotation bundle"],
        kpis: [
          "Reduce rework",
          "Lower information loss between design and development",
          "Improve design-system consistency",
        ],
        stat:
          "Figma 2025 AI Report: Design teams care not only about generation speed but also about how well AI understands and applies design principles and best practices.",
        source: {
          detail: "The report includes discussion of design principles and best practices.",
        },
        demoResult:
          "OpenClaw found 11 component inconsistencies, 3 missing empty states, and 2 copy conflicts before handoff, then generated the developer handoff notes.",
      },
    },
  },
  warehouse: {
    shortName: "Warehouse",
    intro:
      "The warehouse room focuses on receiving, picking, sorting, and exception handling, showing how OpenClaw can push logistics visibility all the way into fulfillment execution.",
    speakerNote:
      "This room works well for the point that AI should not just see warehouse problems. It should directly produce routes, tasks, and communication actions.",
    scenarios: {
      "slotting-optimizer": {
        title: "Slotting Optimization Agent",
        hook: "Continuously recalculate slotting from demand velocity, size, and replenishment rhythm so fast movers stay where they should.",
        problem:
          "Warehouse slotting often lags behind shifts in order mix, and popular items that sit too far from the picking path directly hurt efficiency.",
        workflow: [
          "Read order velocity, SKU dimensions, replenishment frequency, and the current slotting layout.",
          "Identify fast-moving SKUs and inefficient travel paths, then generate slotting reshuffle recommendations.",
          "Output adjustment tasks, impact estimates, and execution priorities.",
        ],
        outputs: ["Slotting reshuffle recommendations", "Fast-moving SKU heat map", "Execution work orders"],
        kpis: ["Shorten picking travel paths", "Reduce replenishment conflicts", "Improve space utilization"],
        stat:
          "Microsoft 2025 logistics article: AI innovation can reduce logistics costs by 15%, optimize inventory levels by 35%, and improve service levels by 65%.",
        source: {
          detail: "Microsoft's 2025 logistics article summarizes AI's impact on inventory, cost, and service levels.",
        },
        demoResult:
          "OpenClaw generated 12 slotting reshuffle recommendations for Zone A and estimates they can reduce travel distance for fast-moving SKUs by 18%.",
      },
      "picking-orchestrator": {
        title: "Picking Orchestration Agent",
        hook: "Orchestrate waves, labor, equipment, and order priority together so outbound flow stays steady.",
        problem:
          "During peaks, picking often relies on supervisors coordinating manually. Conflicts between people, carts, waves, and rush orders can quickly throw warehouse rhythm off.",
        workflow: [
          "Consolidate order priority, labor schedules, equipment status, and wave plans.",
          "Dynamically split tasks and recommend human-machine picking and replenishment sequences.",
          "Automatically sync the pace for packing stations, docks, and customer service notifications.",
        ],
        outputs: ["Wave task board", "Human-machine coordination task list", "Outbound priority recommendations"],
        kpis: [
          "Improve wave execution efficiency",
          "Reduce chaos caused by rush-order insertions",
          "Increase on-time dispatch performance",
        ],
        stat:
          "NAIOP 2025: AI-enabled ASRS and warehouse robotics are increasingly seen as important ways to ease labor pressure and expand warehouse productivity.",
        source: {
          detail: "The 2025 report discusses how AI warehouses, ASRS, and robotics affect productivity.",
        },
        demoResult:
          "OpenClaw split the afternoon wave into 3 coordinated task groups, prioritized 27 rush orders, and smoothed packing-station load into two time blocks.",
      },
      "dock-exception": {
        title: "Dock Exception Agent",
        hook: "When inbound delays, dock congestion, or outbound exceptions occur, the system responds with rerouting and notification actions directly.",
        problem:
          "Dock exceptions often ripple across warehousing, transportation, support, and operations, and manual coordination lets problems snowball quickly.",
        workflow: [
          "Monitor inbound ETAs, dock occupancy, outbound queues, and carrier exceptions.",
          "Recommend alternate docks, temporary buffer zones, and processing priority.",
          "Generate internal alerts, customer notices, and next-step recommendations at the same time.",
        ],
        outputs: ["Exception rerouting recommendations", "Dock load view", "Cross-team notification draft"],
        kpis: [
          "Reduce dock congestion",
          "Shorten recovery time for exceptions",
          "Let fulfillment teams detect problems before customers do",
        ],
        stat:
          "Microsoft 2025: 91% of logistics companies say customers now expect a single provider to deliver seamless end-to-end logistics services.",
        source: {
          detail: "The article emphasizes rising customer expectations for end-to-end logistics visibility and continuity.",
        },
        demoResult:
          "OpenClaw produced 2 rerouting options 20 minutes before dock congestion occurred and automatically drafted sync notices for operations and support.",
      },
    },
  },
};

const getDepartmentTranslation = (departmentId: string): DepartmentTranslation => {
  const translation = departmentTranslations[departmentId];

  if (!translation) {
    throw new Error(`Missing English translation for department: ${departmentId}`);
  }

  return translation;
};

const getScenarioTranslation = (
  departmentId: string,
  scenarioId: string,
  scenarios: Record<string, ScenarioTranslation>
): ScenarioTranslation => {
  const translation = scenarios[scenarioId];

  if (!translation) {
    throw new Error(`Missing English translation for scenario: ${departmentId}/${scenarioId}`);
  }

  return translation;
};

export const thesisPoints = [
  "This is not about isolated productivity gains. It turns OpenClaw into an execution network that spans departments.",
  "It is not about replacing roles. It removes repetitive work like searching, organizing, and comparing from people.",
  "It is not just about giving answers. It can pull data, make judgments, produce outcomes, and write back to systems.",
  "It is not a single agent that tries to do everything. It orchestrates multiple specialized capabilities around departmental scenarios.",
];

export const departments: Department[] = sourceDepartments.map((department) => {
  const translatedDepartment = getDepartmentTranslation(department.id);

  return {
    ...department,
    shortName: translatedDepartment.shortName,
    intro: translatedDepartment.intro,
    speakerNote: translatedDepartment.speakerNote,
    scenarios: department.scenarios.map((scenario) => {
      const translatedScenario = getScenarioTranslation(department.id, scenario.id, translatedDepartment.scenarios);

      return {
        ...scenario,
        title: translatedScenario.title,
        hook: translatedScenario.hook,
        problem: translatedScenario.problem,
        workflow: [...translatedScenario.workflow],
        outputs: [...translatedScenario.outputs],
        kpis: [...translatedScenario.kpis],
        stat: translatedScenario.stat,
        demoResult: translatedScenario.demoResult,
        source: {
          ...scenario.source,
          detail: translatedScenario.source.detail,
        },
      };
    }),
  };
});

export const uniqueSources = Array.from(
  new Map(
    departments
      .flatMap((department) => department.scenarios.map((scenario) => [scenario.source.url, scenario.source] as const))
  ).values()
);
