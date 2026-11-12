/* The curriculum. Ten modules; each is a handful of short lesson cards and a
   five-question quiz. Every lesson ends with a line the rep can actually say
   on a call. Product names move fast — lessons stick to vendors and product
   families rather than model version numbers so they age slowly. */

const MODULES = [
  {
    id: "foundations",
    title: "AI Foundations",
    blurb: "How the technology works, in the words clients use.",
    lessons: [
      {
        t: "AI, machine learning, generative AI",
        body: [
          "AI is the umbrella term. Machine learning is the part that learns patterns from data, such as fraud scores, demand forecasts and recommendations. Companies have hired for it for over a decade.",
          "Generative AI is the newer layer. It produces text, code, images and audio. It runs on large language models (LLMs) such as GPT, Claude, Gemini and Llama.",
          "Most enterprises now have both. A bank's credit model is classic ML. Its internal assistant that drafts emails is generative AI. They need different people.",
        ],
        say: "When you say AI, is this predictive models on your own data, or generative AI and assistants? The team looks different for each.",
      },
      {
        t: "How an LLM works",
        body: [
          "An LLM predicts the next piece of text. Text is split into tokens, which are roughly word fragments. Vendors bill per token in and per token out, so token volume is the cost driver.",
          "The context window is how much text the model can consider at once: the instructions, the documents you hand it and the conversation so far. Anything outside the window, the model does not know.",
          "A model's knowledge stops at its training cutoff. It knows nothing about a client's private data unless that data is put in front of it.",
        ],
        say: "Is the model going to need your internal data to be useful? That tells me whether you need data and retrieval skills, or just application skills.",
      },
      {
        t: "Three ways to make a model yours",
        body: [
          "Prompting: write better instructions and examples. Cheapest and fastest. This has grown into context engineering, which is deciding what information the model sees at each step.",
          "RAG (retrieval-augmented generation): search the company's documents, then hand the relevant passages to the model with the question. This is how most enterprise assistants answer from internal knowledge.",
          "Fine-tuning: further train a model on your own examples to change its behavior or style. More expensive, needs ML skills, and is used far less often than clients expect.",
        ],
        say: "Most teams get there with retrieval before they ever fine-tune. Which approach is your team planning?",
      },
      {
        t: "Hallucinations and evals",
        body: [
          "A hallucination is a confident answer that is wrong. It is a normal property of how LLMs work, so production systems are built to catch and reduce it.",
          "Evals are the tests for AI systems. A team keeps a set of real questions with known good answers and scores the system against it every time something changes.",
          "A team with no evals cannot tell whether a change made things better or worse. Asking about evals is the fastest way to tell a serious AI team from a demo team.",
        ],
        say: "How are you measuring whether the answers are right today? Who owns that?",
      },
      {
        t: "Open, closed, hosted, self-hosted",
        body: [
          "Closed models such as GPT, Claude and Gemini are reached through an API. Open-weight models such as Llama and Mistral can be downloaded and run on your own hardware.",
          "Most enterprises reach models through their cloud: Microsoft Foundry, Amazon Bedrock or Google Vertex AI. That keeps data, billing and security inside a contract they already have.",
          "Self-hosting gives more control and needs far more skill: GPUs, serving software and platform engineers. Regulated and defense clients ask for it most.",
        ],
        say: "Which cloud is your AI work running in? That narrows the candidate pool right away.",
      },
    ],
    quiz: [
      { q: "A client says their chatbot 'makes things up'. What is the standard term?", a: ["Overfitting", "Hallucination", "Token drift", "Latency"], c: 1, why: "A hallucination is a confident but wrong answer. It is expected behavior that teams reduce with retrieval, guardrails and evals." },
      { q: "A client wants an assistant that answers from their 40,000 policy documents. Which approach do most teams start with?", a: ["Fine-tuning a model on the documents", "Training a new model from scratch", "RAG: retrieve relevant passages and pass them to the model", "Buying more GPUs"], c: 2, why: "RAG is the default for answering from private documents. Fine-tuning changes behavior, and it is a poor way to load facts." },
      { q: "What mostly drives the bill on an LLM API?", a: ["Number of user accounts", "Tokens in and out", "Number of prompts saved", "Model download size"], c: 1, why: "Usage is metered in tokens: the text sent in plus the text generated." },
      { q: "Which question best separates a production AI team from a demo team?", a: ["Which model do you like best?", "How do you evaluate whether outputs are correct?", "Do you use dark mode?", "How many prompts have you written?"], c: 1, why: "Evals are how real teams know a system works and keeps working." },
      { q: "A defense contractor cannot send data to an outside API. What are they most likely to need?", a: ["A prompt library", "Self-hosted open-weight models and platform engineers to run them", "A no-code chatbot builder", "More Copilot licenses"], c: 1, why: "Self-hosting open-weight models keeps data in their environment, and it needs GPU and platform skills." },
    ],
  },
  {
    id: "platforms",
    title: "Platforms & Tools",
    blurb: "The vendor map, and what each name on a req tells you.",
    lessons: [
      {
        t: "The model labs",
        body: [
          "OpenAI (GPT, ChatGPT), Anthropic (Claude), Google (Gemini), Meta (Llama, open-weight), Mistral, xAI (Grok) and Cohere build the models.",
          "Clients rarely hire for one model. Skills transfer between them, and most production systems are built so the model can be swapped.",
          "Treat a model name on a req as a preference. The real requirements sit in the layers around it.",
        ],
        say: "If a strong candidate built the same thing on a different model, would you see them? Most teams say yes.",
      },
      {
        t: "The three clouds",
        body: [
          "Microsoft: Microsoft Foundry (formerly Azure AI Foundry) with Azure OpenAI, plus Microsoft 365 Copilot and Copilot Studio. Strongest where the client already runs on Microsoft.",
          "AWS: Amazon Bedrock for model access and agents, SageMaker for training and hosting ML models, Amazon Q for assistants.",
          "Google Cloud: Vertex AI for models and ML, Gemini across Workspace, and Gemini Enterprise for agents. The cloud is the hardest requirement on most reqs, because security approvals are tied to it.",
        ],
        say: "Azure, AWS or Google? And is that a hard requirement, or where you happen to be today?",
      },
      {
        t: "Data platforms",
        body: [
          "Databricks and Snowflake are the two names you will hear most. Both store and process company data and both now build and serve AI on top of it.",
          "Microsoft Fabric and Google BigQuery play the same role inside their clouds. Around them sit pipeline tools: dbt, Airflow, Fivetran and Kafka.",
          "Vector databases store text as numbers so it can be searched by meaning. Pinecone, Weaviate, Qdrant and pgvector are the usual ones. They are the search half of RAG.",
        ],
        say: "Where does the data for this live today, and is it ready for an AI system to use?",
      },
      {
        t: "AI inside business apps",
        body: [
          "The software clients already own now ships with agents: Salesforce Agentforce, ServiceNow AI Agents, Workday, SAP Joule and Microsoft 365 Copilot.",
          "These need configuration, integration, data clean-up and governance. The work goes to people who know the platform first and AI second.",
          "This is a large and under-served market. A Salesforce architect who has shipped Agentforce is worth more to that client than a general AI engineer.",
        ],
        say: "Are you building your own AI, or switching on the AI in platforms you already own? Or both?",
      },
      {
        t: "The builder's toolbox",
        body: [
          "Frameworks for building apps and agents: LangChain and LangGraph, LlamaIndex, CrewAI, Microsoft Agent Framework, and the agent SDKs from OpenAI, Anthropic and Google.",
          "Coding assistants: GitHub Copilot, Cursor, Claude Code and OpenAI Codex. Many clients now expect every engineer to work with one.",
          "Evaluation and monitoring: LangSmith, Langfuse, Arize, Braintrust, MLflow and Weights & Biases. A candidate who names these has usually run something in production.",
        ],
        say: "What is the team building with today? I will match on the framework where it matters and flex where it does not.",
      },
    ],
    quiz: [
      { q: "A req lists 'Amazon Bedrock'. Which cloud is the client on?", a: ["Azure", "AWS", "Google Cloud", "Oracle"], c: 1, why: "Bedrock is AWS's service for model access and agents." },
      { q: "Which pair are the two data platforms you will hear most on AI reqs?", a: ["Databricks and Snowflake", "Cursor and Copilot", "Zapier and Make", "Pinecone and Jira"], c: 0, why: "Databricks and Snowflake hold the data and increasingly run the AI on top of it." },
      { q: "What is a vector database used for?", a: ["Hosting websites", "Searching text by meaning, usually for RAG", "Storing payroll", "Training GPUs"], c: 1, why: "Vector databases power semantic search, which is the retrieval step in RAG." },
      { q: "A client is rolling out Salesforce Agentforce. Who is usually the best first candidate?", a: ["A research scientist with a PhD", "A Salesforce architect or developer with Agentforce delivery experience", "A GPU cluster engineer", "A data annotator"], c: 1, why: "AI inside a business platform is led by people who know that platform." },
      { q: "On most reqs, which requirement is hardest to flex?", a: ["The exact model", "The cloud platform", "The coding assistant", "The laptop brand"], c: 1, why: "Security approvals, data and contracts are tied to the cloud. Model and framework skills transfer more easily." },
    ],
  },
  {
    id: "roles",
    title: "The AI Roster",
    blurb: "Who does what, and which role the client actually needs.",
    lessons: [
      {
        t: "The builders",
        body: [
          "AI Engineer: builds applications on top of existing models. Software engineer first. Works with APIs, RAG, agents and evals. This is the highest-volume AI req.",
          "ML Engineer: trains, tunes and deploys models. Deeper math and infrastructure. Data Scientist: analysis, experiments and predictive models.",
          "Clients often write 'ML Engineer' when they mean 'AI Engineer'. Ask whether the person will train models or build with existing ones.",
        ],
        say: "Will this person be training models, or building products on top of models that already exist?",
      },
      {
        t: "The forward deployed engineer",
        body: [
          "A forward deployed engineer (FDE) is embedded with a customer or business unit and builds working software against their real problem. The role started at Palantir and is now common at AI labs and software vendors.",
          "It mixes strong engineering with consulting skills: discovery, stakeholder handling and shipping fast in someone else's messy environment.",
          "Enterprises ask for the same shape under other titles: AI solutions engineer, applied AI engineer, embedded AI engineer. The mix is rare, so screen for both halves.",
        ],
        say: "Do you need someone who builds to a spec, or someone who sits with the business, finds the problem and ships the fix?",
      },
      {
        t: "The data team",
        body: [
          "Data Engineer: builds the pipelines that move and clean data. AI projects stall most often here, which makes this the most dependable AI-adjacent req.",
          "Analytics Engineer: models data for reporting, often with dbt. Data Architect: designs how data is stored and shared. Data Steward: owns quality and definitions.",
          "If a client's AI pilot gives poor answers, the cause is usually the data. Offer the data team before a second AI engineer.",
        ],
        say: "When the pilot gave a bad answer, was the model wrong or was the data behind it wrong?",
      },
      {
        t: "Platform and operations",
        body: [
          "MLOps or LLMOps Engineer: gets models and AI apps deployed, monitored and updated safely. AI Platform Engineer: runs the shared infrastructure, including GPUs and model gateways.",
          "AI Architect: designs the whole system and chooses the platforms. Evaluation Engineer or AI QA: builds the tests that prove the system works.",
          "These reqs appear when a client moves from pilot to production. A client with five pilots and nothing live is usually missing this layer.",
        ],
        say: "How many of your pilots have reached production? What stopped the others?",
      },
      {
        t: "Govern, secure, adopt",
        body: [
          "AI Governance Lead: sets policy, keeps the inventory of AI systems, runs risk reviews and tracks regulation. AI Security Engineer: defends AI systems and tests them by attacking them.",
          "AI Trainer has two meanings. One trains the model, by labeling data and rating answers, and is often a subject expert. The other trains the workforce to use AI. Always ask which.",
          "AI Product Manager and Change or Adoption Lead decide what gets built and get people to use it. Low adoption is the most common reason AI spend disappoints.",
        ],
        say: "When you say AI trainer, do you mean someone improving the model, or someone teaching your people to use it?",
      },
    ],
    quiz: [
      { q: "A client wants someone to 'build a support assistant on Claude using our knowledge base'. Which title fits best?", a: ["Data Scientist", "AI Engineer", "Research Scientist", "Data Steward"], c: 1, why: "Building an application on an existing model with retrieval is AI engineering." },
      { q: "What sets a forward deployed engineer apart?", a: ["They only write documentation", "They are embedded with the customer and combine engineering with consulting", "They work only on hardware", "They manage the sales pipeline"], c: 1, why: "FDEs build in the customer's environment and own the problem end to end." },
      { q: "A pilot gives wrong answers because source records are duplicated and out of date. Who should you offer first?", a: ["Another AI Engineer", "A Data Engineer", "A Prompt Engineer", "An AI Product Manager"], c: 1, why: "Poor data is the usual cause. Data engineering fixes the input." },
      { q: "A client says 'we need an AI trainer'. What do you ask first?", a: ["What is the bill rate?", "Do you mean training the model or training your people?", "Which GPU do you use?", "Is it remote?"], c: 1, why: "The title covers two very different jobs: model data work and workforce enablement." },
      { q: "A client has six pilots and none in production. Which layer are they most likely missing?", a: ["Platform, MLOps and evaluation", "More data scientists", "A second chatbot vendor", "Graphic design"], c: 0, why: "Getting to production needs deployment, monitoring and evaluation skills." },
    ],
  },
  {
    id: "data",
    title: "Data Foundations",
    blurb: "Why every AI project is a data project first.",
    lessons: [
      {
        t: "AI is only as good as the data",
        body: [
          "An AI system answers from what it is given. If the documents are stale, duplicated or badly permissioned, the answers will be too.",
          "Data readiness means the data is findable, clean, current, and access-controlled. Few companies are there when they start.",
          "This is why data engineering demand rises with every AI budget. It is the most reliable opening in an AI conversation.",
        ],
        say: "If I asked your AI a question today, would it be answering from clean, current data?",
      },
      {
        t: "Pipelines, warehouses, lakehouses",
        body: [
          "A pipeline moves data from where it is created to where it is used. ETL and ELT describe the order of extract, transform and load.",
          "A warehouse stores structured tables for reporting. A lake stores raw files. A lakehouse combines them, and is the model behind Databricks, Snowflake and Fabric.",
          "Listen for the stack: SQL and Python everywhere, then Spark, dbt, Airflow and Kafka. Those are the screening keywords for data engineers.",
        ],
        say: "Is your data platform settled, or is that being built alongside the AI work?",
      },
      {
        t: "Unstructured data and retrieval",
        body: [
          "Most company knowledge is unstructured: PDFs, emails, tickets, contracts and call transcripts. Generative AI is the first technology that reads it well.",
          "To use it, teams split documents into chunks, turn each chunk into an embedding (a list of numbers that captures meaning) and store those in a vector database.",
          "Good retrieval is hard. Chunking, ranking and permissions decide answer quality. Candidates who have tuned retrieval are valuable.",
        ],
        say: "How much of what the AI needs is sitting in documents rather than databases?",
      },
      {
        t: "Governance and access",
        body: [
          "Data governance decides who can see what, where data came from and how long it is kept. Tools include Unity Catalog, Microsoft Purview and Collibra.",
          "AI raises the stakes. An assistant connected to everything will happily show a salary file to anyone who asks, unless permissions are right.",
          "Many Copilot rollouts pause for this reason. The fix is data governance and clean-up work, which is steady project demand.",
        ],
        say: "Before you switched Copilot on, did anyone review what it can see?",
      },
    ],
    quiz: [
      { q: "What is an embedding?", a: ["A type of GPU", "A list of numbers that captures the meaning of text", "A software license", "A dashboard"], c: 1, why: "Embeddings let systems search by meaning, which powers retrieval." },
      { q: "A Copilot rollout is paused because staff could surface confidential HR files. What work fixes it?", a: ["Buying a bigger model", "Data governance and permissions clean-up", "A new logo", "More prompt training"], c: 1, why: "The assistant exposes whatever permissions allow. Governance and access clean-up is the fix." },
      { q: "Which stack most clearly signals a data engineer?", a: ["Figma, Sketch, Canva", "SQL, Python, Spark, dbt, Airflow", "Excel, Word, Outlook", "Jira, Confluence, Slack"], c: 1, why: "Those are the core pipeline and transformation tools." },
      { q: "Why does data engineering demand rise with AI budgets?", a: ["AI replaces data engineers", "AI systems depend on clean, current, accessible data", "Data engineers train LLMs from scratch", "It does not"], c: 1, why: "Data readiness is the precondition for useful AI." },
      { q: "A lakehouse is best described as:", a: ["A vacation benefit", "A platform combining raw file storage with warehouse-style tables", "A type of chatbot", "A security framework"], c: 1, why: "It joins the data lake and the warehouse. Databricks, Snowflake and Fabric all follow this model." },
    ],
  },
  {
    id: "automation",
    title: "Low-Code, No-Code & Automation",
    blurb: "The fastest-moving work, often owned outside IT.",
    lessons: [
      {
        t: "The spectrum",
        body: [
          "No-code tools build with clicks and plain language. Low-code adds some scripting. Pro-code is traditional software development.",
          "Power Apps, Mendix, OutSystems and Appian build applications. Zapier, Make, n8n and Workato connect systems. Power Automate does both inside Microsoft.",
          "The buyer is often a business function such as finance, HR or operations. That gives you a second door into the account.",
        ],
        say: "Who is asking for this, IT or the business? And who will maintain it once it is live?",
      },
      {
        t: "RPA and intelligent automation",
        body: [
          "Robotic process automation (RPA) uses software bots to click through screens the way a person would. UiPath, Automation Anywhere and Power Automate lead it.",
          "RPA is rigid: when the screen changes, the bot breaks. Adding AI lets automation read documents and handle exceptions. Vendors call this intelligent or agentic automation.",
          "Clients with large RPA estates are modernizing them. They need RPA developers who have added AI skills, plus business analysts who map the process.",
        ],
        say: "How many bots are you running, and how much effort goes into keeping them working?",
      },
      {
        t: "Copilot Studio and the Power Platform",
        body: [
          "Microsoft's Power Platform is Power Apps, Power Automate, Power BI and Copilot Studio. Copilot Studio is where clients build their own agents on Microsoft.",
          "Because most enterprises already license it, this is where a great deal of first agent work happens.",
          "The roles: Power Platform developer, Copilot Studio developer, solution architect and platform administrator. Certifications such as PL-200 and PL-400 help you screen.",
        ],
        say: "Are your teams already building in Power Platform? Who governs what gets built?",
      },
      {
        t: "Citizen developers and guardrails",
        body: [
          "A citizen developer is a business user who builds their own apps and automations. AI app builders such as Lovable, Bolt, Replit and v0 have made this faster.",
          "Uncontrolled, it produces hundreds of unowned apps touching sensitive data. Clients respond with a center of excellence (CoE) that sets rules and reviews builds.",
          "A CoE needs a lead, an architect, an administrator and trainers. It is often a multi-seat project sale.",
        ],
        say: "Do you know how many apps and automations your business users have built? Who reviews them?",
      },
    ],
    quiz: [
      { q: "What does RPA do?", a: ["Trains large language models", "Uses software bots to perform screen-based tasks the way a person would", "Hosts databases", "Tests network security"], c: 1, why: "RPA automates repetitive clicks and keystrokes across existing applications." },
      { q: "Which tool is Microsoft's platform for building custom agents?", a: ["Copilot Studio", "UiPath", "Snowflake", "Cursor"], c: 0, why: "Copilot Studio is the agent builder within the Power Platform." },
      { q: "A client has 300 apps built by business users and no oversight. What do they need?", a: ["More licenses", "A center of excellence with governance, architecture and admin roles", "A research scientist", "Nothing"], c: 1, why: "A CoE brings standards, review and ownership to citizen development." },
      { q: "Why is automation often a second door into an account?", a: ["It needs no approval", "The buyer is often a business function rather than IT", "It is always free", "Recruiters build the bots"], c: 1, why: "Finance, HR and operations leaders frequently sponsor automation work." },
      { q: "What is the main weakness of classic RPA?", a: ["It needs GPUs", "It is rigid and breaks when screens or processes change", "It cannot run on Windows", "It requires a PhD"], c: 1, why: "Bots follow fixed steps. AI adds the flexibility to handle variation." },
    ],
  },
  {
    id: "agents",
    title: "Agentic AI",
    blurb: "Agents, tools, harnesses and orchestration without the hype.",
    lessons: [
      {
        t: "What an agent is",
        body: [
          "A chatbot answers. An agent acts. An agent is a model that is given a goal and tools, then works in a loop: decide a step, use a tool, read the result, decide the next step.",
          "Tools are what let it act: search, run code, query a database, send an email, update a ticket.",
          "The more an agent is allowed to do on its own, the more testing, permissions and oversight it needs. Autonomy is a dial the client sets.",
        ],
        say: "What would the agent be allowed to do on its own, and where does a person need to approve?",
      },
      {
        t: "Harnesses",
        body: [
          "The harness is the software around the model that makes it an agent. It runs the loop, supplies tools, manages what is in the context window, enforces permissions and keeps memory.",
          "Claude Code, OpenAI Codex and Cursor are harnesses for coding. Companies also build their own for their own workflows. The same model performs very differently in a good harness.",
          "You will also hear 'eval harness'. That is the test rig that runs an AI system against a set of cases and scores it. Both meanings signal real engineering.",
        ],
        say: "Is your team building its own agent harness or using an off-the-shelf one?",
      },
      {
        t: "Orchestration and multi-agent systems",
        body: [
          "Orchestration is coordinating many steps, tools or agents to finish a larger job. One common design is an orchestrator agent that hands tasks to specialist agents.",
          "Frameworks include LangGraph, CrewAI, Microsoft Agent Framework and the vendor agent SDKs. Workflow engines such as Temporal keep long jobs reliable.",
          "This is distributed systems work. Strong backend engineers who have learned agents often outperform people who know only prompts.",
        ],
        say: "Is this one agent doing one job, or several working together across systems?",
      },
      {
        t: "MCP and connecting agents to systems",
        body: [
          "The Model Context Protocol (MCP) is an open standard for connecting AI to tools and data. Build a connector once, and any compatible assistant can use it.",
          "It began at Anthropic and is now supported across the major vendors. Agent-to-agent protocols such as A2A cover how agents from different vendors talk to each other.",
          "For clients, this is integration work: wrapping internal systems so agents can use them safely. Integration engineers with API experience fit well.",
        ],
        say: "Which internal systems does the agent need to reach, and do those have APIs today?",
      },
      {
        t: "Keeping agents safe and useful",
        body: [
          "Human in the loop means a person approves certain actions, such as sending money or emailing a customer. Guardrails are automatic checks on inputs and outputs.",
          "Observability means recording every step an agent takes so failures can be traced. Without it nobody can explain what the agent did.",
          "Production agent teams need evaluation engineers and platform skills as much as builders. That is where projects are short-staffed.",
        ],
        say: "When an agent gets something wrong, how would your team find out and trace why?",
      },
    ],
    quiz: [
      { q: "What separates an agent from a chatbot?", a: ["Agents are always voice-based", "Agents use tools in a loop to take actions toward a goal", "Agents never use LLMs", "Agents are cheaper"], c: 1, why: "An agent decides, acts with tools, checks the result and repeats." },
      { q: "In agent engineering, a harness is:", a: ["A GPU rack", "The software around the model that runs the loop, tools, context and permissions", "A sales methodology", "A data warehouse"], c: 1, why: "The harness turns a model into a working agent. Claude Code and Codex are examples." },
      { q: "What is MCP?", a: ["A Microsoft certification", "An open standard for connecting AI to tools and data", "A type of GPU", "A pricing model"], c: 1, why: "The Model Context Protocol standardizes how assistants connect to external systems." },
      { q: "A client wants several specialist agents coordinated across finance systems. Which background transfers best?", a: ["Graphic design", "Backend and distributed systems engineering", "Desktop support", "Copywriting"], c: 1, why: "Orchestration is a distributed systems problem: state, retries, failure handling." },
      { q: "'Human in the loop' means:", a: ["A person approves or reviews certain agent actions", "People type every response", "The agent is switched off", "Users rate the logo"], c: 0, why: "It is the control point where a person signs off on higher-risk actions." },
    ],
  },
  {
    id: "security",
    title: "Security & Governance",
    blurb: "The risks clients worry about and the people who manage them.",
    lessons: [
      {
        t: "New risks",
        body: [
          "Prompt injection: hidden instructions in a document, email or web page that trick the AI into doing something it should not. It tops the OWASP Top 10 for LLM Applications.",
          "Data leakage: sensitive data pasted into public tools, or an assistant revealing data to the wrong person. Shadow AI is staff using unapproved AI tools.",
          "Agents add risk because they can act. An agent with access to email and files can be turned against its owner by one poisoned message.",
        ],
        say: "Has security reviewed what your AI tools can reach, and what happens if someone feeds one a malicious document?",
      },
      {
        t: "Securing AI systems",
        body: [
          "Red teaming is attacking your own AI to find weaknesses before someone else does. Guardrails filter harmful inputs and outputs.",
          "Least privilege applies to agents too: give each agent only the access its task needs, and treat it as an identity to be managed.",
          "The talent is hybrid: application security or cloud security people who have learned how LLMs fail. MITRE ATLAS and the OWASP lists are the keywords.",
        ],
        say: "Who on the security team owns AI today? Is that a dedicated person or a side job?",
      },
      {
        t: "Governance frameworks",
        body: [
          "NIST AI Risk Management Framework: the main US reference, voluntary, organized as govern, map, measure, manage. ISO/IEC 42001: a certifiable management system standard for AI.",
          "EU AI Act: law that sorts AI uses by risk and puts the heaviest duties on high-risk uses such as hiring, credit and medical decisions. It applies to companies serving the EU. Its deadlines phase in over several years, so check current dates.",
          "US states and sector regulators add their own rules. Clients in finance, healthcare and HR technology feel this first.",
        ],
        say: "Which regulations is your AI program being built to meet? Who is tracking them?",
      },
      {
        t: "What a governance program does",
        body: [
          "It keeps an inventory of every AI system, rates each for risk, reviews high-risk ones before launch and monitors them afterward.",
          "It produces documentation: what the system does, what data it used, how it was tested, who is accountable. It also reviews vendors' AI.",
          "Roles: AI Governance Lead, AI Risk Analyst, Responsible AI Lead, Model Risk Manager in banks, and privacy counsel. Many come from compliance, privacy or audit.",
        ],
        say: "Do you have a list of every AI system in use across the company? Who signs off before a new one goes live?",
      },
    ],
    quiz: [
      { q: "A hidden line in a PDF tells an assistant to forward the user's files. What is this attack?", a: ["Phishing", "Prompt injection", "SQL injection", "Denial of service"], c: 1, why: "Prompt injection plants instructions in content the AI reads." },
      { q: "'Shadow AI' refers to:", a: ["Dark mode", "Staff using unapproved AI tools", "A model with no training data", "Backup servers"], c: 1, why: "It is unsanctioned AI use, and a common source of data leakage." },
      { q: "Which is a certifiable management system standard for AI?", a: ["ISO/IEC 42001", "HTML5", "PL-400", "MCP"], c: 0, why: "ISO/IEC 42001 sets requirements for an AI management system and can be audited." },
      { q: "Where do most AI governance candidates come from?", a: ["Game design", "Compliance, privacy, risk and audit", "Help desk", "Sales"], c: 1, why: "Governance builds on existing risk and compliance disciplines, plus AI literacy." },
      { q: "Red teaming an AI system means:", a: ["Rebranding it", "Attacking it deliberately to find weaknesses", "Training it on red images", "Turning it off at night"], c: 1, why: "Red teams probe for failures such as jailbreaks, leakage and unsafe actions." },
    ],
  },
  {
    id: "lifecycle",
    title: "Pilot to Production",
    blurb: "The stages of an AI program and who is needed at each.",
    lessons: [
      {
        t: "Four stages of maturity",
        body: [
          "Exploring: leadership interest, a few licenses, no owner. Piloting: several proofs of concept, small team, nothing live.",
          "Scaling: first systems in production, a platform team forming, governance catching up. Operating: AI is part of normal delivery, with budgets and metrics.",
          "Place the client on this scale early. It tells you which roles they need now and which come next.",
        ],
        say: "Would you say you are exploring, piloting, scaling, or running AI as business as usual?",
      },
      {
        t: "Why pilots stall",
        body: [
          "The common causes: poor data, no clear owner, no way to measure quality, security review late in the process, and no plan for adoption.",
          "Each cause maps to a role. Data: data engineer. Ownership: AI product manager. Quality: evaluation engineer. Security: AI security. Adoption: change lead.",
          "When a client says the pilot 'did not really go anywhere', ask what stopped it. The answer names the req.",
        ],
        say: "What stopped the last pilot from going live?",
      },
      {
        t: "Build, buy, or partner",
        body: [
          "Buy: turn on AI in tools they own, such as Copilot or Agentforce. Needs platform specialists, governance and adoption.",
          "Build: custom applications and agents. Needs AI engineers, data engineers, platform and evaluation. Partner: a consultancy or vendor delivers, and the client needs people who can own it afterward.",
          "Most clients do all three. Ask about each, because each has its own budget holder.",
        ],
        say: "What are you buying off the shelf, what are you building yourselves, and what is a partner delivering?",
      },
      {
        t: "The operating team",
        body: [
          "Once AI is live it needs running: monitoring cost and quality, updating prompts and models, handling incidents, retraining users.",
          "Model versions are retired by vendors on a schedule, so systems need regular migration and re-testing. This is recurring work.",
          "Contract and managed-team models fit here. A standing pod of AI engineer, evaluator and platform engineer is easier to sell than one-off hires.",
        ],
        say: "Who looks after the system after go-live? Is that the same team that built it?",
      },
    ],
    quiz: [
      { q: "A client has several proofs of concept, a small team and nothing live. Which stage?", a: ["Exploring", "Piloting", "Scaling", "Operating"], c: 1, why: "Proofs of concept without production use is the piloting stage." },
      { q: "A pilot stalled because nobody could show the answers were accurate. Which role closes that gap?", a: ["Evaluation engineer", "Network administrator", "Scrum master", "UX designer"], c: 0, why: "Evaluation engineers build the tests that measure quality." },
      { q: "A client is 'turning on Copilot for 8,000 staff'. Which mix fits best?", a: ["Research scientists", "Platform specialists, data governance and adoption leads", "GPU engineers", "Game developers"], c: 1, why: "Buying AI in an existing platform needs configuration, governance and change management." },
      { q: "Why is running AI recurring work?", a: ["It is not", "Models are retired, prompts drift, costs and quality need monitoring", "Licenses expire daily", "Laws require weekly rebuilds"], c: 1, why: "Live systems need monitoring, migration and re-testing as models and data change." },
      { q: "What is the best follow-up to 'our pilot did not go anywhere'?", a: ["That is a shame", "What stopped it from going live?", "Do you want resumes?", "Who was the vendor?"], c: 1, why: "The blocker tells you which role is missing." },
    ],
  },
  {
    id: "client",
    title: "Client Conversations",
    blurb: "Discovery, credibility and handling the objections you will hear.",
    lessons: [
      {
        t: "Lead with the business problem",
        body: [
          "Clients do not buy AI. They buy shorter handle times, faster claims, fewer manual hours. Start with what they are trying to change.",
          "Then find the stage, the stack and the blocker. Those three facts turn a vague 'AI person' into a req you can fill.",
          "You are not expected to be an engineer. You are expected to ask the questions an informed partner would ask.",
        ],
        say: "What is the business outcome this is meant to move, and how will you know it worked?",
      },
      {
        t: "The discovery set",
        body: [
          "Outcome: what changes if this works? Stage: exploring, piloting, scaling or operating? Stack: which cloud, which data platform, which tools?",
          "Team: who is on it today and what is missing? Blocker: what has slowed you down? Timeline and budget: is this funded, and by whom?",
          "Six questions, ten minutes. Write the answers into the req notes so your recruiter can screen against them.",
        ],
        say: "Can I ask six quick questions so I send you the right people rather than a stack of resumes?",
      },
      {
        t: "Turn a title into a role",
        body: [
          "Titles in AI are unsettled. 'AI engineer', 'ML engineer' and 'prompt engineer' can all mean the same job at different companies.",
          "Ask what the person will do in the first 90 days, what they will own, and what they must have built before. Those answers define the role.",
          "Then read it back in plain words. Clients trust a partner who can restate the need more clearly than the job description did.",
        ],
        say: "Ninety days in, what has this person shipped?",
      },
      {
        t: "Common objections",
        body: [
          "'We will upskill our own people.' Agree, then ask who leads the work while they learn. Offer a contractor who builds and transfers knowledge.",
          "'We are waiting for the technology to settle.' Data, governance and platform work pays off whichever model wins. Start there.",
          "'The rate is too high.' Scarcity is real for people with production experience. Compare the rate to the cost of a stalled program, or reshape the role around the must-haves.",
        ],
        say: "That makes sense. Who is carrying the work while the team gets up to speed?",
      },
      {
        t: "Be credible and say when you do not know",
        body: [
          "Use the right word only when you know what it means. One misused term costs more trust than ten plain questions earn.",
          "It is fine to say you will check with your technical recruiter. It is not fine to guess at a client's architecture.",
          "Bring something each time: what similar clients are hiring for, how long searches are taking, which skills are scarce. Market insight is what you are selling.",
        ],
        say: "I do not want to guess at that. Let me confirm with our technical team and come back today.",
      },
    ],
    quiz: [
      { q: "What is the best opening for an AI discovery call?", a: ["Which LLM do you use?", "What business outcome is this meant to move?", "How many resumes do you want?", "Is your budget approved?"], c: 1, why: "Outcome first. It frames everything else and shows you are a partner." },
      { q: "A client says 'we will just upskill our team'. What is the strongest reply?", a: ["That never works", "Agree, then ask who leads delivery while they learn", "Lower your rate", "End the call"], c: 1, why: "It respects the plan and surfaces the gap you can fill." },
      { q: "A client asks for a 'prompt engineer'. What should you do?", a: ["Search that title only", "Ask what the person will ship in 90 days and what they will own", "Tell them the title is wrong", "Send a data scientist"], c: 1, why: "Titles vary. The work defines the role." },
      { q: "You are asked a technical question you cannot answer. What do you do?", a: ["Guess confidently", "Change the subject", "Say you will confirm with your technical team and follow up the same day", "Repeat buzzwords"], c: 2, why: "Honesty protects credibility. Follow through fast." },
      { q: "'We are waiting for AI to settle.' Which work can you position now?", a: ["Nothing", "Data, governance and platform work that pays off under any model", "A ten-year research lab", "More waiting"], c: 1, why: "Foundational work is model-independent and reduces later risk." },
    ],
  },
  {
    id: "candidate",
    title: "Candidate Conversations",
    blurb: "Screening for real experience and selling the role well.",
    lessons: [
      {
        t: "Production beats projects",
        body: [
          "Anyone can build a demo in a weekend. The scarce experience is shipping something that real users depend on.",
          "Ask what it was, who used it, how many users, how long it ran, and what broke. Strong candidates answer with specifics and numbers.",
          "Weak answers stay at the level of tool names. Listen for outcomes and trade-offs.",
        ],
        say: "Tell me about an AI system you built that real users relied on. Who used it and what happened after launch?",
      },
      {
        t: "Four screening questions that work",
        body: [
          "How did you know it was working? Listen for evals, test sets and metrics. How did you handle wrong answers? Listen for guardrails, retrieval fixes, human review.",
          "What did it cost to run and how did you bring that down? Listen for token usage, caching, model choice. What would you do differently? Listen for honest lessons.",
          "You do not need to judge the technical detail. You need to hear whether the answers are concrete.",
        ],
        say: "How did you know the system was giving good answers?",
      },
      {
        t: "Red flags",
        body: [
          "Claims to have 'trained an LLM' at a company that could not have afforded it. Usually they called an API or fine-tuned a small model. Ask what exactly they did.",
          "A long list of tools with no outcomes. Every project described as 'we'. Only coursework and personal projects presented as work experience.",
          "No view on what went wrong. Real projects have scars, and real builders talk about them.",
        ],
        say: "On that project, which parts did you build yourself?",
      },
      {
        t: "What AI candidates want",
        body: [
          "They ask whether the work is real. Is it funded? Is there an executive sponsor? Will it reach production?",
          "They ask about the environment: access to data, choice of tools and models, budget for compute, and whether a coding assistant is allowed.",
          "Get these answers from the client before you call candidates. The best ones have options and will pass on a vague role.",
        ],
        say: "This one is funded through next year, reports to the CTO, and has two systems live already.",
      },
      {
        t: "Adjacent talent",
        body: [
          "Production AI experience is scarce. Strong software engineers, data engineers and security engineers who have added AI skills fill many reqs well.",
          "Look for proof of the adjacent move: a shipped internal tool, an agent that automates part of their own job, contributions to an AI project.",
          "Present them honestly to the client: strong fundamentals, AI experience of this kind, gap here. Clients accept a clear trade-off more readily than an oversold resume.",
        ],
        say: "They have eight years of backend work and shipped two agent projects this year. The gap is evaluation, and here is how they plan to close it.",
      },
    ],
    quiz: [
      { q: "Which answer most suggests real production experience?", a: ["I am passionate about AI", "I have used every framework", "It served 4,000 agents, we tracked accuracy weekly, and cut cost per ticket by a third", "I completed five courses"], c: 2, why: "Users, measurement and outcomes are the signals of production work." },
      { q: "A candidate at a 30-person firm says they 'trained an LLM from scratch'. What do you do?", a: ["Submit immediately", "Ask what exactly they did: API use, fine-tuning or training", "Reject immediately", "Ignore it"], c: 1, why: "The claim is unlikely as stated. Clarify the actual work." },
      { q: "Which question best tests whether a candidate can run AI in production?", a: ["What is your favorite model?", "How did you know it was working?", "Do you like Python?", "Have you used ChatGPT?"], c: 1, why: "It reveals whether they measured quality with evals and metrics." },
      { q: "What should you learn from the client before calling top AI candidates?", a: ["Office snack options", "Funding, sponsor, path to production, data access and tools", "The CEO's hometown", "Nothing"], c: 1, why: "Strong candidates screen the role. Vague answers lose them." },
      { q: "A backend engineer has shipped two internal agent tools but has no AI title. How do you present them?", a: ["Hide the gap", "State strengths, the AI work done and the gap clearly", "Change their title on the resume", "Do not present them"], c: 1, why: "An honest trade-off builds trust and often wins the interview." },
    ],
  },
];
