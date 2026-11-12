/* Game content: role-matching scenarios, resume claims to judge, and the
   scripted conversations for the call simulator. */

/* A client says something; pick the role. `opts` are role ids, first is right
   (the engine shuffles them). */
const SCOUT = [
  { say: "Our support assistant keeps answering from policies we retired last year.", opts: ["data-eng", "ai-arch", "caio", "conv-design"], why: "Stale source data is a pipeline and data quality problem." },
  { say: "We bought 5,000 Copilot seats and maybe a tenth of people use it.", opts: ["adoption", "ml-eng", "ai-sec", "data-arch"], why: "Low usage after purchase is a change and adoption gap." },
  { say: "We sell an AI product and need engineers on site with our biggest customers to get it working in their environment.", opts: ["fde", "ds", "coe-lead", "model-risk"], why: "Embedded, customer-facing engineering is the forward deployed engineer role." },
  { say: "The board asked for a list of every AI system we run and how each is controlled. We have nothing.", opts: ["ai-gov", "ai-eng", "rpa-dev", "analytics-eng"], why: "Inventory, policy and risk review belong to AI governance." },
  { say: "We have seven proofs of concept and cannot get one deployed and monitored.", opts: ["mlops", "context-eng", "ba-process", "ai-trainer-people"], why: "Deployment and monitoring is MLOps or LLMOps work." },
  { say: "We want software that reads incoming invoices, matches them to POs and posts them, with a person approving exceptions.", opts: ["agent-dev", "ds", "data-steward", "caio"], why: "An end-to-end workflow with tools and approvals is agent development." },
  { say: "Security will not let our agent touch email until someone proves it cannot be tricked.", opts: ["ai-sec", "lowcode-dev", "analytics-eng", "ai-pm"], why: "Testing and hardening against attacks is AI security." },
  { say: "Every time we change the prompt, we have no idea if answers got better or worse.", opts: ["eval-eng", "data-arch", "adoption", "rpa-dev"], why: "Measuring quality across changes is evaluation engineering." },
  { say: "Finance has 40 UiPath bots that break every month.", opts: ["rpa-dev", "ml-eng", "ai-gov", "fde"], why: "Maintaining and modernizing bots is automation development." },
  { say: "We are fine-tuning a model for radiology notes and need clinicians to rate its outputs.", opts: ["ai-trainer-model", "ai-trainer-people", "integration", "coe-lead"], why: "Expert rating of model outputs is model-side AI training." },
  { say: "We need someone to run hands-on sessions teaching our claims adjusters to use the new assistant.", opts: ["ai-trainer-people", "ai-trainer-model", "mlops", "data-eng"], why: "Teaching employees to use AI is workforce enablement." },
  { say: "Each department has thirty ideas for AI and nobody is deciding which to build.", opts: ["ai-pm", "ai-platform", "data-steward", "conv-design"], why: "Prioritizing use cases and defining success is product management." },
  { say: "Five teams are each paying for their own model access and nobody knows the total bill.", opts: ["ai-platform", "ds", "ai-trainer-model", "ba-process"], why: "Shared access, logging and cost control is AI platform engineering." },
  { say: "Our HR team wants a simple app and an agent in Teams. We already own Power Platform.", opts: ["lowcode-dev", "ml-eng", "model-risk", "ai-arch"], why: "Building on a licensed low-code platform suits a low-code developer." },
  { say: "The agent demo is great. It just cannot read or update anything in SAP.", opts: ["integration", "context-eng", "adoption", "ds"], why: "Connecting agents to enterprise systems is integration engineering." },
  { say: "We want to predict which customers will cancel next quarter from our own data.", opts: ["ds", "agent-dev", "ai-gov", "lowcode-dev"], why: "Predictive modeling on company data is data science." },
  { say: "We need one design for how all our AI gets built: which platform, how it is secured, what it costs.", opts: ["ai-arch", "ai-trainer-people", "rpa-dev", "analytics-eng"], why: "End-to-end design and platform choices belong to an AI architect." },
  { say: "Our bank's regulator expects independent validation before the model goes live.", opts: ["model-risk", "ai-eng", "coe-lead", "conv-design"], why: "Independent validation is model risk management." },
];

/* Candidate statements. `real: true` means it sounds like credible production
   experience. */
const CLAIMS = [
  { t: "We kept a test set of 600 real tickets and re-scored the assistant on every release.", real: true, why: "Concrete evals with numbers are a strong production signal." },
  { t: "I am an expert in ChatGPT, Claude, Gemini, LangChain, LlamaIndex, CrewAI, Pinecone and 14 other tools.", real: false, why: "A tool list with no outcomes. Ask what was built and who used it." },
  { t: "I trained a large language model from scratch at my last startup. There were twelve of us.", real: false, why: "Training an LLM from scratch costs far more than a small firm can spend. Ask what they actually did." },
  { t: "Cost per conversation was too high, so we routed simple questions to a smaller model and cached repeats.", real: true, why: "Specific cost trade-offs come from running a live system." },
  { t: "The agent could draft refunds, and anything over fifty dollars went to a person for approval.", real: true, why: "Clear permission boundaries show real deployment thinking." },
  { t: "Our AI was 100 percent accurate.", real: false, why: "No production AI system is. A real builder quotes a measured rate and how they measured it." },
  { t: "Retrieval kept pulling the wrong policy version, so we added document dates and filtered on them.", real: true, why: "A specific failure and a specific fix." },
  { t: "We leveraged cutting-edge generative AI synergies to transform the enterprise.", real: false, why: "No detail at all. Ask for one concrete system." },
  { t: "I built the ingestion pipeline myself. A teammate owned the front end.", real: true, why: "Clear on personal contribution." },
  { t: "It never went live, but the demo impressed leadership.", real: false, why: "Honest, and it is pilot experience. Present it as that." },
  { t: "When the vendor retired the model we were on, I ran our evals against the replacement before we switched.", real: true, why: "Model migration with testing is real operating experience." },
  { t: "I completed nine AI certificates this year, so I am ready to lead your platform.", real: false, why: "Courses show interest. Leading a platform needs delivery history." },
  { t: "Security found a prompt injection path through uploaded PDFs, so we stripped hidden text and limited what the agent could call.", real: true, why: "Names a real attack and a sensible mitigation." },
  { t: "I do not really do testing. The model is smart enough.", real: false, why: "Skipping evaluation is the clearest sign of demo-level work." },
  { t: "Adoption stalled at 20 percent until we built role-specific examples with each team lead.", real: true, why: "Measured adoption and a specific intervention." },
  { t: "We used agents.", real: false, why: "Too vague to assess. Ask what the agent did and what it was allowed to touch." },
];

/* Scripted calls. Each turn: the other person speaks, you pick a reply.
   pts: 3 best, 1 acceptable, 0 poor. */
const CALLS = [
  {
    id: "cio", kind: "Client", title: "The vague AI req",
    who: "Dana, VP of IT at a regional insurer",
    setup: "Dana has budget approval and has asked three agencies for 'AI people'.",
    turns: [
      { line: "We need a couple of AI people. Can you send me some resumes this week?", opts: [
        { t: "Absolutely. I will have five over by Friday.", pts: 0, fb: "Fast, and you know nothing. So do the other two agencies." },
        { t: "I can. So I send the right ones, what is the business outcome this work is meant to move?", pts: 3, fb: "Outcome first. You have set yourself apart in one sentence." },
        { t: "Sure. Do you want machine learning engineers or data scientists?", pts: 1, fb: "A reasonable question asked too early. She may not know yet." },
      ]},
      { line: "Claims. Adjusters spend hours reading documents. We ran a pilot with an assistant that summarizes files.", opts: [
        { t: "Great, so you need a prompt engineer.", pts: 0, fb: "You jumped to a title on thin evidence." },
        { t: "How did the pilot go? What stopped it from going live?", pts: 3, fb: "The blocker will name the role." },
        { t: "Which LLM did you use?", pts: 1, fb: "Useful later. It does not tell you what is missing." },
      ]},
      { line: "Adjusters liked it, but it sometimes cited the wrong policy version. And compliance has not signed off.", opts: [
        { t: "That sounds like the model is not good enough. You should switch vendors.", pts: 0, fb: "You are guessing at architecture. Wrong versions usually point to data and retrieval." },
        { t: "So two gaps: the data behind it, and proof for compliance that answers are right. Which cloud is this on?", pts: 3, fb: "You restated the need clearly and moved to the stack." },
        { t: "Compliance is always slow. Shall I send AI engineers anyway?", pts: 0, fb: "You dismissed the blocker that will sink the project." },
      ]},
      { line: "Azure. We are a Microsoft shop. Honestly I am not sure what titles I need.", opts: [
        { t: "From what you have described: a data engineer to fix the document pipeline, an AI engineer with Azure experience to rebuild retrieval, and someone to build evaluation so compliance has evidence.", pts: 3, fb: "A specific, reasoned plan tied to her own words." },
        { t: "You need an AI architect, three ML engineers, a data scientist and a governance team.", pts: 0, fb: "Over-selling. She asked for a couple of people and has one pilot." },
        { t: "Let me send a mix and you can tell me which you like.", pts: 1, fb: "It keeps things moving and gives away your advantage." },
      ]},
      { line: "That is clearer than our own job description. What do you need from me?", opts: [
        { t: "Thirty minutes with the pilot lead to confirm the stack, and whether this is funded as contract or permanent. I will come back with a shortlist and what the market looks like for each role.", pts: 3, fb: "Clear next step, a technical check, and you promised market insight." },
        { t: "Just a signed agreement.", pts: 1, fb: "Fine, though you skipped the detail your recruiter needs." },
        { t: "Nothing. I have it from here.", pts: 0, fb: "You still do not know budget, timeline or contract type." },
      ]},
    ],
  },
  {
    id: "objection", kind: "Client", title: "We will do it in-house",
    who: "Marcus, Director of Engineering at a logistics company",
    setup: "Marcus has 40 engineers and a mandate to add agents to the dispatch platform.",
    turns: [
      { line: "Thanks, but we are going to upskill our own engineers. We do not need outside AI talent.", opts: [
        { t: "Upskilling rarely works for AI. You will fall behind.", pts: 0, fb: "You told him his plan is wrong. He will stop listening." },
        { t: "That is a sound plan, and your engineers know the platform. Who leads the first build while they are learning?", pts: 3, fb: "Agree, then find the gap." },
        { t: "Understood. I will check back next quarter.", pts: 1, fb: "Polite, and you left without learning anything." },
      ]},
      { line: "Fair question. Nobody here has shipped an agent before. We have a date in Q2.", opts: [
        { t: "Then you need to hire a full agent team right away.", pts: 0, fb: "He just told you he wants to grow his own people." },
        { t: "One option: a contract engineer who has shipped agents in production, pairing with your team for six months so the knowledge stays.", pts: 3, fb: "Fits his plan and solves the deadline." },
        { t: "Q2 is tight. Have you thought about pushing the date?", pts: 0, fb: "Not your call, and it offers no help." },
      ]},
      { line: "Maybe. But contract rates for these people are steep.", opts: [
        { t: "I can find someone cheaper if you are flexible on experience.", pts: 1, fb: "Possible, though it gives up the thing he needs: someone who has done it." },
        { t: "They are, because few people have shipped this. What would missing Q2 cost? If it helps, we can scope it to the first release only.", pts: 3, fb: "Reframes rate against outcome and offers a smaller commitment." },
        { t: "That is just the market. Take it or leave it.", pts: 0, fb: "True and unhelpful." },
      ]},
      { line: "What would I even look for in that person?", opts: [
        { t: "Someone who knows a lot of AI tools.", pts: 0, fb: "Tool lists are the weakest signal." },
        { t: "Someone who can describe an agent they put in production: what it was allowed to do, how they tested it, and what broke. Backend depth matters as much as AI.", pts: 3, fb: "You sound like a partner who knows how to screen." },
        { t: "A PhD in machine learning.", pts: 0, fb: "Wrong profile. This is an engineering job." },
      ]},
    ],
  },
  {
    id: "screen", kind: "Candidate", title: "Real or resume padding",
    who: "Priya, AI Engineer, six years of experience",
    setup: "Her resume lists 'built enterprise GenAI platform'. You have ten minutes.",
    turns: [
      { line: "I built our company's GenAI platform. Happy to walk you through my background.", opts: [
        { t: "Great. Which tools do you know?", pts: 1, fb: "You will get a list. It will not tell you what she did." },
        { t: "Tell me about one system on it that real users relied on. Who used it?", pts: 3, fb: "Straight to production evidence." },
        { t: "Perfect, that is exactly what my client needs. What rate are you looking for?", pts: 0, fb: "You have verified nothing." },
      ]},
      { line: "An assistant for our field technicians, about 900 of them. It answers repair questions from our manuals.", opts: [
        { t: "Which parts did you build yourself?", pts: 3, fb: "Separates her work from the team's." },
        { t: "Wow, 900 users. Impressive.", pts: 0, fb: "Encouraging, and you learned nothing new." },
        { t: "Was that on Azure?", pts: 1, fb: "Worth knowing. Ask after you understand her role." },
      ]},
      { line: "The retrieval pipeline and the evaluation suite. Another engineer did the mobile app.", opts: [
        { t: "How did you know the answers were good?", pts: 3, fb: "The single best question for an AI engineer." },
        { t: "So you did not do the full stack?", pts: 0, fb: "Sounds like criticism of an honest answer." },
        { t: "Good. Can you start in two weeks?", pts: 1, fb: "Too soon. One more question would confirm depth." },
      ]},
      { line: "We had 400 real technician questions with answers our senior techs approved. We scored every release against them and tracked the wrong-answer rate.", opts: [
        { t: "And what went wrong along the way?", pts: 3, fb: "Real builders have scars. Her answer will confirm it." },
        { t: "I do not really follow the technical part, but it sounds good.", pts: 0, fb: "You do not need to judge the detail. Saying this costs you credibility." },
        { t: "Great. What are you looking for in your next role?", pts: 1, fb: "A good question. You could have confirmed one more thing first." },
      ]},
      { line: "Early on it mixed up two product lines. We added product tags to every chunk and filtered on them. Wrong answers dropped by more than half.", opts: [
        { t: "That is the kind of detail my client will want to hear. Here is what I know about the role: funded through next year, two systems live, Azure, reports to the CTO.", pts: 3, fb: "You confirmed she is real, then sold the role with the facts candidates care about." },
        { t: "Excellent. I will submit you today.", pts: 1, fb: "She is strong, and you have told her nothing about the job." },
        { t: "It is a great opportunity with a great company.", pts: 0, fb: "Strong candidates pass on vague roles." },
      ]},
    ],
  },
  {
    id: "adjacent", kind: "Candidate", title: "The adjacent mover",
    who: "Tom, Senior Backend Engineer, nine years of experience",
    setup: "No AI title. Your client needs an agent developer and the pool is thin.",
    turns: [
      { line: "I should say up front, I have never had 'AI' in my job title.", opts: [
        { t: "Then this probably is not a fit. Thanks for your time.", pts: 0, fb: "You may have just passed on your best candidate." },
        { t: "That is fine. Have you built anything with AI, at work or on the side?", pts: 3, fb: "Look for the evidence of the move." },
        { t: "No problem, we can adjust your resume.", pts: 0, fb: "Never. Misrepresenting a candidate costs the client's trust." },
      ]},
      { line: "At work I built an agent that triages our on-call alerts and opens tickets. The team has used it for five months.", opts: [
        { t: "What is it allowed to do on its own, and how did you test it?", pts: 3, fb: "Checks both safety thinking and evaluation." },
        { t: "That counts. I will call you an AI engineer.", pts: 0, fb: "Overselling. Present the facts." },
        { t: "Which framework?", pts: 1, fb: "Fine, and less revealing than how it behaves." },
      ]},
      { line: "It can open and label tickets. It cannot close them or page anyone without a person. I replayed three months of old alerts to test it.", opts: [
        { t: "Where do you feel least experienced on the AI side?", pts: 3, fb: "You need the gap so you can present him honestly." },
        { t: "Perfect. You are basically a senior AI engineer.", pts: 0, fb: "One project does not make that true." },
        { t: "Great. What is your rate?", pts: 1, fb: "You still need the gap before you pitch him." },
      ]},
      { line: "Evaluation at scale, and retrieval. I have only done small versions.", opts: [
        { t: "I will present you as that: nine years of backend, one agent in production for five months, with evaluation and retrieval as growth areas. Comfortable?", pts: 3, fb: "An honest trade-off the client can weigh. This wins interviews." },
        { t: "I will leave that part out.", pts: 0, fb: "The client will find it in the interview and stop trusting your submittals." },
        { t: "Maybe take a course first and call me back.", pts: 1, fb: "He is already viable. Let the client decide." },
      ]},
    ],
  },
];
