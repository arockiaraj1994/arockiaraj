const { useState } = React;

function IconSearch({ size = 14, className = "" }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconChevronDown({ size = 15, className = "" }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function IconArrowRight({ size = 13, className = "" }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const COURSE_OVERVIEW = [
  { id: "c1", title: "Claude Code", meta: "5 modules" },
  { id: "c2", title: "AI Agents", meta: "5 modules" },
  { id: "c3", title: "Prompt Engineering", meta: "6 modules" },
  { id: "c4", title: "Custom GPTs", meta: "3 modules" },
];

/* ────────────────────────────────────────────────
   DESIGN TOKENS
──────────────────────────────────────────────── */
const ACCENT = {
  c1: { name: "Claude Code", badge: "bg-blueprint", text: "text-blueprint", border: "border-blueprint", bg50: "bg-blueprint/5", dot: "bg-blueprint" },
  c2: { name: "AI Agents", badge: "bg-plum", text: "text-plum", border: "border-plum", bg50: "bg-plum/5", dot: "bg-plum" },
  c3: { name: "Prompt Engineering", badge: "bg-signal", text: "text-signal", border: "border-signal", bg50: "bg-signal/5", dot: "bg-signal" },
  c4: { name: "Custom GPTs", badge: "bg-amber", text: "text-amber", border: "border-amber", bg50: "bg-amber/5", dot: "bg-amber" },
};

const TAG_STYLES = {
  fw: { label: "Framework", cls: "border border-blueprint text-blueprint" },
  pt: { label: "Pattern", cls: "border border-plum text-plum" },
  rl: { label: "Rule", cls: "border border-amber text-amber" },
  ky: { label: "Key Insight", cls: "border border-signal text-signal" },
  sm: { label: "Summary", cls: "border border-signal text-signal" },
};

const CALLOUT_STYLES = {
  rule: "bg-amber/5 border-amber/40 text-ink",
  insight: "bg-signal/5 border-signal/40 text-ink",
  tip: "bg-plum/5 border-plum/40 text-ink",
};

/* ────────────────────────────────────────────────
   COURSE DATA
──────────────────────────────────────────────── */
const COURSES = {
  c1: {
    concepts: ["AI Labour", "Best-of-N", "CHAT·CRAFT·SCALE", "CLAUDE.md", "Git Worktrees", "Subagents", "Feature Branch", "Custom Commands"],
    sections: [
      {
        title: "Micromanaging AI",
        tag: "rl",
        blocks: [
          { kind: "notes", items: [
            `Do **NOT** ask: "create this class / this method". Too granular`,
            `This rule is true **only for greenfield development**`,
          ]},
          { kind: "callout", variant: "rule", icon: "🚫", text: `Don't micromanage. Give Claude the vision, not the tasks and functions.` },
        ],
      },
      {
        title: "Mindset Shift: The Coding Perspective",
        tag: "ky",
        blocks: [
          { kind: "notes", items: [
            `Imagine chatting with a person who is **purely in coding perspective**`,
            `You work/code at **100x or 1000x**. Building becomes superfast`,
            `Where to focus now:`,
          ]},
          { kind: "sub", items: ["Creativity", "Critical Thinking", "Design", "Architecture"] },
          { kind: "callout", variant: "insight", icon: "💡", text: `Do NOT worry about writing a single line of code. You instruct AI to code. You are the director, not the coder.` },
        ],
      },
      {
        title: "AI Labour",
        tag: "fw",
        blocks: [
          { kind: "notes", items: [
            `Trust the workers. They will work **on behalf of you**`,
            `Initially: just prompt → response`,
            `Now: A **big planned prompt** → get entire work done`,
            `**You are the Leader of the AI Labour**`,
            `If you don't prompt correctly → You **cannot scale** your AI Labour`,
          ]},
          { kind: "callout", variant: "insight", icon: "⚡", text: `Big prompt = Give the VISION to AI, not tasks and functions. No micromanage.` },
        ],
      },
      {
        title: "Prompt Quality Rule",
        tag: "ky",
        blocks: [
          { kind: "notes", items: [
            `Average question → **Average answers**`,
            `For powerful answers → use your **own creativity and thoughts**`,
            `Go back to previous stage → solve the problem in a **different way**`,
          ]},
          { kind: "callout", variant: "rule", icon: "🎯", text: `If you ask average questions, you will get average answers. Bring your own thinking.` },
        ],
      },
      {
        title: "AI is Cheaper, Not Costly",
        tag: "ky",
        blocks: [
          { kind: "notes", items: [
            `Build fast → **Fail fast** if it doesn't work`,
            `Building a complete Dashboard under **$5** was not even possible before`,
            `AI Labour is **Scalable and Cheap**`,
          ]},
        ],
      },
      {
        title: "Can AI Produce Quality Code?",
        tag: "ky",
        blocks: [
          { kind: "notes", items: [
            `Yes, but it is driven by **YOUR ability to recognize** high quality code`,
            `You must be able to **evaluate the code**`,
            `For that you need:`,
          ]},
          { kind: "sub", items: ["Coding Standards", "Software Architecture Skills", "Debugging Skills"] },
          { kind: "callout", variant: "insight", icon: "💡", text: `AI produces high quality code. That is driven by MY ability to recognize high quality code.` },
        ],
      },
      {
        title: "CHAT · CRAFT · SCALE Framework",
        tag: "fw",
        blocks: [
          { kind: "notes", items: [
            `**CHAT**: Think, converse, design. Before coding or implementation`,
            `**CRAFT**: Crafting the code, the structure`,
            `**SCALE**: Execution part by AI Labour`,
          ]},
          { kind: "flow", label: "Flow", steps: ["Idea", "Discussion", "Requirement", "Craft Code & Structure", "AI Executes"] },
        ],
      },
      {
        title: "Custom Commands with Arguments",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Claude allows **Custom Commands**`,
            `Can specify commands like: **Code Review, Security Audits**, etc.`,
            `Also useful for the dev playbook and **CLAUDE.md**`,
          ]},
        ],
      },
      {
        title: "Learn from Examples",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Feed better / quality code from **existing repo**`,
            `Claude learns your **coding style** from the examples`,
          ]},
        ],
      },
      {
        title: "Always Work on Feature Branch",
        tag: "rl",
        blocks: [
          { kind: "callout", variant: "rule", icon: "🚨", text: `NEVER SKIP. Always create new branch before making ANY changes. This is a Global Rule.` },
          { kind: "notes", items: [
            `Must instruct Claude Code for **Branch Naming Convention**`,
            `Need to understand: **Work Tree vs Git Branch**. They are different concepts`,
          ]},
        ],
      },
      {
        title: "Test Cases",
        tag: "rl",
        blocks: [
          { kind: "notes", items: [`Build new code → Always **write tests**`] },
        ],
      },
      {
        title: "Structuring the Project",
        tag: "ky",
        blocks: [
          { kind: "notes", items: [
            `For **token efficiency**, project structure matters`,
            `**Naming convention** is now more important than before`,
          ]},
        ],
      },
    ],
  },

  c2: {
    concepts: ["Agent Loop", "GAIL Framework", "GAME Framework", "Tool Naming", "Persona Pattern", "Prompt Templating", "Hallucination = Computation"],
    sections: [
      {
        title: "Agent Loop",
        tag: "fw",
        blocks: [
          { kind: "flow", label: "The Loop", steps: ["Construct Prompt", "Generate Response", "Parse Response", "Execute Action", "Convert to String", "Continue?"] },
        ],
      },
      {
        title: "Prompt Templating",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [`As part of prompt → Ask LLM to return response in a **templated way**`] },
          { kind: "format", text: "<Action> : <Object>" },
        ],
      },
      {
        title: "AI Agent Structure: GAIL",
        tag: "fw",
        blocks: [
          { kind: "notes", items: [
            `**Goal, Actions** → System messages`,
            `**Information, Language** → User messages`,
          ]},
          { kind: "callout", variant: "tip", icon: "📌", text: `GAIL = Goals, Actions, Information, Language: the building blocks of an AI agent prompt.` },
        ],
      },
      {
        title: "Tools to Agents",
        tag: "fw",
        blocks: [
          { kind: "notes", items: [`Provide **tools** to the agent to perform an action`] },
        ],
      },
      {
        title: "Tool Naming & Description",
        tag: "ky",
        blocks: [
          { kind: "callout", variant: "rule", icon: "⚠️", text: `Naming and description is MORE important than the code. LLM understands the tool by name and description alone.` },
        ],
      },
      {
        title: "Tool Use Outcome",
        tag: "ky",
        blocks: [
          { kind: "notes", items: [
            `User **cannot see / observe** the tool results directly`,
            `Results are internal to the agent loop`,
          ]},
        ],
      },
      {
        title: "GAME Framework",
        tag: "fw",
        blocks: [
          { kind: "notes", items: [
            `**G**: Goal → Define a goal`,
            `**A**: Action → Set of Actions`,
            `**M**: Memory → Keeping the State`,
            `**E**: Environment → To work / route the Action & Memory`,
          ]},
          { kind: "callout", variant: "tip", icon: "📌", text: `GAME = the blueprint to design an agent BEFORE writing code.` },
        ],
      },
      {
        title: "Hallucination = New Form of Computation",
        tag: "ky",
        blocks: [
          { kind: "notes", items: [
            `If no hallucination → we **never wonder**`,
            `Hallucination is what drives AI to **creatively explore**`,
          ]},
          { kind: "callout", variant: "insight", icon: "💡", text: `Hallucination is the new form of computation: the engine of AI creativity.` },
        ],
      },
      {
        title: "Prompting Philosophy",
        tag: "ky",
        blocks: [
          { kind: "notes", items: [
            `Do NOT ask for the Answer → Ask for **perspective** and get the answer`,
            `Average question → Average answer. Use your own creativity.`,
          ]},
        ],
      },
      {
        title: "Persona Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Most agent instructions **start with Persona Pattern**`,
            `Ask a machine to act as a person / animal / object`,
          ]},
          { kind: "format", text: "Act as [Persona A] and do [Task X]" },
        ],
      },
    ],
  },

  c3: {
    concepts: ["Question Refinement", "Cognitive Verifier", "Audience Persona", "Flipped Interaction", "Few Shot", "Chain of Thought", "ReAct", "Template", "Meta Language", "Recipe", "Outline Expansion", "Menu Action", "Fact Check List", "Tail Generation", "Semantic Filter"],
    sections: [
      {
        title: "Adding More Information",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `First provide **past data** as context in the prompt`,
            `~E.g.: Last week 10 bugs, this week 12 bugs, 2 weeks ago 12 bugs → provide data → get insights~`,
          ]},
        ],
      },
      {
        title: "Information Limits",
        tag: "rl",
        blocks: [
          { kind: "notes", items: [
            `Do NOT provide more / large information`,
            `Select **only required** information`,
            `If new information → know how to provide it **based on size**`,
          ]},
        ],
      },
      {
        title: "Root Prompts",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `A **hidden prompt** to LLM on top of user prompt (system prompt)`,
            `We can open the thoughts and see what LLM is thinking`,
          ]},
        ],
      },
      {
        title: "Question Refinement Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `User asks a question (may or may not have enough info)`,
            `LLM **optimizes / refines** the question based on what was asked`,
          ]},
        ],
      },
      {
        title: "Cognitive Verifier Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Rule: Ask **small sub-questions** to solve the original question`,
            `~E.g.: Generate doc → LLM asks: What is the format? How many pages? Any questions?~`,
          ]},
        ],
      },
      {
        title: "Audience Persona Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Define the **audience** first before generating content`,
            `~E.g.: Document for → Internal dev team / Product team?~`,
          ]},
        ],
      },
      {
        title: "Flipped Interaction Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Prompt LLM to **ask the questions** → then follow the conversation`,
            `Human does NOT have to always be the driver`,
          ]},
        ],
      },
      {
        title: "Few Shot Examples",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Setting LLM by giving examples → LLM responds **like the examples**`,
            `From next prompt onwards → LLM predicts based on previous examples`,
          ]},
          { kind: "format", text: "Input: Some Question\nSentiment: How LLM to Answer" },
        ],
      },
      {
        title: "Few Shot: With Action",
        tag: "pt",
        blocks: [
          { kind: "format", text: "Situation: [Some situation] → Action: [Relevant action]\nSituation: [Some other situation] → Action: [Relevant action]" },
          { kind: "notes", items: [`From next prompt → LLM predicts the **Action** based on user prompt`] },
        ],
      },
      {
        title: "Effective Few Shot: Bad Example",
        tag: "ky",
        blocks: [
          { kind: "format", text: "Bad: I: Brick → O: Hard  /  I: Pillow → O: Soft  /  I: Car → O: Hard and Soft\n❌ Not related to previous examples :  unrelated set" },
          { kind: "callout", variant: "rule", icon: "⚡", text: `Prompt is MORE powerful than huge trained data, because it drives the input AND output of the LLM.` },
        ],
      },
      {
        title: "Chain of Thought Prompting",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Without CoT: Question → Yes/No or single word ~(just result)~`,
            `With CoT: Question → **Reasoning + Result** ~(thinking process visible)~`,
          ]},
        ],
      },
      {
        title: "ReAct Prompt",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Same as Chain of Thought, but **more intensive**`,
            `Mostly useful for **building Agents**`,
          ]},
          { kind: "flow", label: "ReAct Flow", steps: ["Task", "Think", "Action (tool)", "Result", "Think", "Action", "Result"] },
          { kind: "callout", variant: "insight", icon: "💡", text: `Don't just run faster always. Stop, step back, revisit with new knowledge → Better view, better output, better quality.` },
        ],
      },
      {
        title: "Template Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Setting the **format** of prompt and response with placeholders`,
            `Use: Creating MCQs, preparing Q&A for a specific topic`,
          ]},
          { kind: "format", text: "QUESTION: [placeholder]\nANSWER: [placeholder]" },
        ],
      },
      {
        title: "Meta Language Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Shorthand note taking → communicate to others in custom notation`,
            `~E.g.: Palayamkottai,2 → Chennai,2 → Trichy,5 → Ooty,5~`,
            `~Meaning: Palayamkottai 2 days then Chennai 2 days then Trichy 5 days...~`,
          ]},
        ],
      },
      {
        title: "Recipe Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Fill in the blanks → Ask LLM to **fill missing gaps** in the prompt`,
            `~E.g.: What all places of Trichy can I visit?~`,
          ]},
        ],
      },
      {
        title: "Outline Expansion Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `On the prompt → Just provide data/info **as a bullet point** as a starting point`,
            `LLM expands it further from the base`,
          ]},
        ],
      },
      {
        title: "Menu Action Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Like typical file operations in OS: Menu → (File) → Actions`,
            `Component **tied with Action**`,
            `~E.g.: Type "Add Food" → Add food to Budget. Say "Eating" → Add to Activity list~`,
          ]},
        ],
      },
      {
        title: "Fact Check List Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Instruct LLM to respond with **set of Facts at the end** of response`,
            `Source / Reference links should be added as part of output`,
            `Based on fact check list → Ask **follow-up questions**`,
          ]},
        ],
      },
      {
        title: "Tail Generation Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Long conversation → LLM **drifts from original goal**`,
            `At end of output → Suggest **next set of prompts**`,
            `By asking recommendation → LLM keeps the **Original Goal** in focus`,
          ]},
        ],
      },
      {
        title: "Semantic Filter Pattern",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `Remove the set of output which **matches a pattern**`,
            `~E.g.: Remove dates from response / slightly rewrite dates (add +1 day)~`,
            `~E.g.: Remove date of birth → Keep only the year~`,
          ]},
        ],
      },
      {
        title: "Conclusion: What Next",
        tag: "sm",
        blocks: [
          { kind: "notes", items: [
            `Practice`,
            `Stay up to date`,
            `Collaborate with other users`,
            `**Keep Ethics in mind**`,
          ]},
        ],
      },
    ],
  },

  c4: {
    concepts: ["Custom Instructions", "CAPITAL Framework", "RAG", "Boundaries", "Ambiguity Handling", "Flipped Interaction"],
    sections: [
      {
        title: "Core Idea: Custom GPTs",
        tag: "ky",
        blocks: [
          { kind: "notes", items: [
            `Most of the time → You **don't really train** the model`,
            `Just **tell the model to do the right thing** via instructions`,
          ]},
        ],
      },
      {
        title: "Custom Instructions",
        tag: "fw",
        blocks: [
          { kind: "notes", items: [
            `All providers are providing **Custom Instructions**`,
            `Training model needed **ONLY** if you have private huge data`,
            `Training NOT required for common data like math formulas, general web data`,
          ]},
        ],
      },
      {
        title: "CAPITAL Framework",
        tag: "fw",
        blocks: [
          { kind: "callout", variant: "rule", icon: "🎯", text: `The goal is to help the Human SOLVE the problem, NOT PROVIDE AN ANSWER` },
          { kind: "notes", items: [`How → Do not ask for ideas → **Go with ideas and ask for the reasons**`] },
        ],
      },
      {
        title: "Flipped Interaction Pattern (in GPTs)",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [`Instruct LLM to **ask questions** and build the content → then solve the problem`] },
        ],
      },
      {
        title: "Boundaries",
        tag: "rl",
        blocks: [
          { kind: "notes", items: [
            `Must **set the boundaries** of the Custom GPT / Agent`,
            `~E.g.: GPT built for code → User asks for image → GPT should NOT generate image~`,
            `In knowledge base if data is not clear → GPT must know how to handle it`,
            `The instruction **must define how to handle such cases**`,
          ]},
        ],
      },
      {
        title: "Handling Ambiguity",
        tag: "pt",
        blocks: [
          { kind: "notes", items: [
            `If content is not clear → **Ask follow-up question**`,
            `Automatic prompt refining → Refine the question and ask the user ~(Question Refinement Pattern)~`,
            `Suggest to the user with **other options / alternatives**`,
            `Apply **Cognitive Verifier Pattern** → Ask sub-questions`,
          ]},
        ],
      },
    ],
  },
};

const TAB_ORDER = ["c1", "c2", "c3", "c4"];

/* ────────────────────────────────────────────────
   INLINE TEXT RENDERER (bold **, example ~, + search highlight)
──────────────────────────────────────────────── */
function splitMarkup(text) {
  const regex = /(\*\*[^*]+\*\*|~[^~]+~)/g;
  return text.split(regex).filter((p) => p !== undefined && p !== "").map((p) => {
    if (p.startsWith("**") && p.endsWith("**")) return { type: "bold", content: p.slice(2, -2) };
    if (p.startsWith("~") && p.endsWith("~")) return { type: "ex", content: p.slice(1, -1) };
    return { type: "text", content: p };
  });
}

function renderRich(text, query) {
  const segments = splitMarkup(text);
  const q = query.trim().toLowerCase();

  return segments.map((seg, segIdx) => {
    if (!q) return wrapSeg(seg, `s${segIdx}`);

    const lower = seg.content.toLowerCase();
    if (!lower.includes(q)) return wrapSeg(seg, `s${segIdx}`);

    const pieces = [];
    let start = 0;
    let count = 0;
    while (true) {
      const found = lower.indexOf(q, start);
      if (found === -1) {
        pieces.push(wrapSeg({ ...seg, content: seg.content.slice(start) }, `s${segIdx}-${count++}`));
        break;
      }
      if (found > start) pieces.push(wrapSeg({ ...seg, content: seg.content.slice(start, found) }, `s${segIdx}-${count++}`));
      pieces.push(
        <mark key={`s${segIdx}-m-${count++}`} className="bg-amber/25 rounded px-0.5">
          {seg.content.slice(found, found + q.length)}
        </mark>
      );
      start = found + q.length;
    }
    return <React.Fragment key={segIdx}>{pieces}</React.Fragment>;
  });
}

function wrapSeg(seg, key) {
  if (seg.type === "bold") return <strong key={key} className="font-semibold text-ink">{seg.content}</strong>;
  if (seg.type === "ex") return <span key={key} className="text-inkmuted text-[14px]">{seg.content}</span>;
  return <span key={key}>{seg.content}</span>;
}

/* ────────────────────────────────────────────────
   BLOCK RENDERER
──────────────────────────────────────────────── */
function Block({ block, query }) {
  if (block.kind === "notes") {
    return (
      <ul className="space-y-1.5 mt-2">
        {block.items.map((it, i) => (
          <li key={i} className="relative pl-5 text-[15px] leading-relaxed text-ink">
            <span className="absolute left-0 top-[3px] text-inkmuted text-xs">→</span>
            {renderRich(it, query)}
          </li>
        ))}
      </ul>
    );
  }
  if (block.kind === "sub") {
    return (
      <ul className="pl-5 mt-1.5 space-y-1">
        {block.items.map((it, i) => (
          <li key={i} className="relative pl-4 text-[14.5px] text-inkmuted">
            <span className="absolute left-0 top-[1px] text-inkmuted">·</span>
            {renderRich(it, query)}
          </li>
        ))}
      </ul>
    );
  }
  if (block.kind === "callout") {
    return (
      <div className={`flex items-start gap-2.5 rounded border px-3.5 py-2.5 mt-3 text-[15px] leading-relaxed ${CALLOUT_STYLES[block.variant]}`}>
        <span className="flex-shrink-0">{block.icon}</span>
        <span>{renderRich(block.text, query)}</span>
      </div>
    );
  }
  if (block.kind === "flow") {
    return (
      <div className="bg-surface rounded px-4 py-3 mt-3">
        <div className="text-[11.5px] font-semibold tracking-wide uppercase text-inkmuted mb-2 font-mono">{block.label}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {block.steps.map((s, i) => (
            <React.Fragment key={i}>
              <span className="px-2.5 py-1 bg-paper border border-line rounded-full text-[14px] font-medium text-ink">{s}</span>
              {i < block.steps.length - 1 && <IconArrowRight size={13} className="text-inkmuted flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
  if (block.kind === "format") {
    return (
      <pre className="bg-surface border-l-2 border-line rounded px-3.5 py-2.5 mt-3 text-[14px] text-inkmuted whitespace-pre-wrap font-mono leading-relaxed">
        {block.text}
      </pre>
    );
  }
  return null;
}

/* ────────────────────────────────────────────────
   SECTION (ACCORDION ITEM)
──────────────────────────────────────────────── */
function Section({ section, index, accent, isOpen, onToggle, query }) {
  const tagInfo = TAG_STYLES[section.tag];
  return (
    <div className="bg-paper border border-line mb-[-1px]">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface transition-colors"
      >
        <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-paper text-[12.5px] font-bold font-mono ${accent.badge}`}>
          {index + 1}
        </div>
        <div className="flex-1 font-semibold text-[16px] text-ink">
          {renderRich(section.title, query)}
        </div>
        <span className={`hidden sm:inline-block flex-shrink-0 px-2 py-0.5 rounded text-[12px] font-medium font-mono ${tagInfo.cls}`}>
          {tagInfo.label}
        </span>
        <IconChevronDown size={15} className={`flex-shrink-0 text-inkmuted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? 800 : 0 }}
      >
        <div className="px-4 pb-4 pt-1 border-t border-line">
          {section.blocks.map((b, i) => (
            <Block key={i} block={b} query={query} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   MAIN APP
──────────────────────────────────────────────── */
function CourseNotesDashboard() {
  const [activeTab, setActiveTab] = useState("c1");
  const [search, setSearch] = useState("");
  const [openSet, setOpenSet] = useState({ c1: [0], c2: [0], c3: [0], c4: [0] });

  const course = COURSES[activeTab];
  const accent = ACCENT[activeTab];
  const query = search.trim().toLowerCase();

  const filteredSections = course.sections
    .map((s, idx) => ({ s, idx }))
    .filter(({ s }) => {
      if (!query) return true;
      const haystack = (
        s.title +
        " " +
        TAG_STYLES[s.tag].label +
        " " +
        s.blocks
          .map((b) => {
            if (b.kind === "notes" || b.kind === "sub") return b.items.join(" ");
            if (b.kind === "callout") return b.text;
            if (b.kind === "flow") return b.steps.join(" ");
            if (b.kind === "format") return b.text;
            return "";
          })
          .join(" ")
      ).toLowerCase();
      return haystack.includes(query);
    });

  function switchTab(tab) {
    setActiveTab(tab);
    setSearch("");
  }

  function toggleSection(idx) {
    setOpenSet((prev) => {
      const arr = prev[activeTab];
      const has = arr.includes(idx);
      return { ...prev, [activeTab]: has ? arr.filter((i) => i !== idx) : [...arr, idx] };
    });
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* HERO */}
      <div className="border-b border-line bg-blueprint">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-8">
          <p className="text-[13px] font-mono text-signal mb-2">
            Coursera specialization &middot; Vanderbilt University &middot; Dr. Jules White
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-paper leading-tight">
            Generative AI Software Engineering
          </h1>
          <p className="mt-2 text-[15px] text-paper/70 max-w-xl leading-relaxed">
            Personal study notes from all four courses. All complete.
          </p>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2">
            {COURSE_OVERVIEW.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  switchTab(c.id);
                  requestAnimationFrame(() => {
                    document.getElementById("notes-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }}
                className={`text-left border px-2.5 py-2 transition-colors ${
                  activeTab === c.id
                    ? "bg-paper/10 border-paper/40"
                    : "bg-transparent border-paper/15 hover:border-paper/30"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 font-mono text-[10px] text-paper/60">
                  <span className={`w-1.5 h-1.5 rounded-full ${ACCENT[c.id].dot}`} />
                  {c.id.toUpperCase()}
                </div>
                <div className="text-[12.5px] font-semibold text-paper leading-snug">
                  {c.title}
                </div>
                <div className="text-[11px] text-paper/50 mt-0.5 font-mono">{c.meta}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NOTES HEADER */}
      <div id="notes-header" className="bg-paper border-b border-line sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-4">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <h2 className="text-[18px] font-bold text-ink">
                Study Notes
              </h2>
              <p className="text-[13.5px] text-inkmuted mt-0.5">
                Browse by course or search across concepts, patterns, and rules
              </p>
            </div>
            <div className="relative">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="pl-9 pr-4 py-2 w-full sm:w-64 border border-line rounded text-[14.5px] bg-surface outline-none focus:border-signal focus:bg-paper transition-colors"
              />
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-1 overflow-x-auto -mb-px" style={{ scrollbarWidth: "none" }}>
            {TAB_ORDER.map((tabKey) => {
              const a = ACCENT[tabKey];
              const active = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => switchTab(tabKey)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold font-mono whitespace-nowrap border-b-[3px] transition-colors ${
                    active ? `${a.text} ${a.border}` : "text-inkmuted border-transparent hover:text-ink"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${a.dot}`}></span>
                  {tabKey.toUpperCase()}: {a.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6 pb-16">

        {/* KEY CONCEPTS */}
        <div className={`rounded px-4.5 py-4 mb-5 border ${accent.bg50} ${accent.border}`} style={{ paddingLeft: 18, paddingRight: 18 }}>
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-inkmuted mb-2.5 font-mono">Core Concepts</div>
          <div className="flex flex-wrap gap-1.5">
            {course.concepts.map((c, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 rounded text-[13.5px] font-medium border ${accent.border} ${accent.text}`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* SEARCH COUNT */}
        {query && (
          <div className="text-[13.5px] text-inkmuted mb-2 px-1">
            {filteredSections.length} section{filteredSections.length !== 1 ? "s" : ""} found
          </div>
        )}

        {/* SECTIONS */}
        {filteredSections.length > 0 ? (
          <div>
            {filteredSections.map(({ s, idx }) => (
              <Section
                key={idx}
                section={s}
                index={idx}
                accent={accent}
                isOpen={query ? true : openSet[activeTab].includes(idx)}
                onToggle={() => toggleSection(idx)}
                query={query}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-inkmuted">
            <h3 className="text-[16px] font-semibold text-ink mb-1">
              No results found
            </h3>
            <p className="text-[14px]">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<CourseNotesDashboard />);
