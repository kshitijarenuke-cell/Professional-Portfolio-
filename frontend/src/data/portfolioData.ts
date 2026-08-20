import type { SkillItem, Milestone, Achievement, Repository } from '../types';

export const PERSONAL_INFO = {
  name: "Kshitija Renuke",
  role: "Full-Stack Developer & Creative Technologist",
  tagline: "Bridging architectural rigor, modern web engineering, and thoughtful digital craft.",
  bio: "I am a Computer Science & Engineering undergraduate with a solid diploma foundation and hands-on experience building full-stack applications, intelligent AI workflows, and interactive web experiences. Focused on scalable architectures, clean codebases, and intuitive user interfaces.",
  careerObjective: "Seeking Full-Stack Developer and Software Engineering opportunities to contribute to high-impact web applications, distributed backend services, and next-generation interactive products.",
  location: "India • Available for Remote & Onsite",
  email: "kshitijarenuke@gmail.com",
  github: "https://github.com/kshitijarenuke-cell",
  linkedin: "https://www.linkedin.com/in/kshitija-renuke-5596452b4/",
  twitter: "https://twitter.com/kshitijarenuke",
  resumeUrl: "#resume",
  status: "Available for Software Engineering Internships & Full-Time Roles",
  education: [
    {
      degree: "B.Tech in Computer Science & Engineering",
      institution: "University Department of Technology",
      period: "2023 – 2026",
      status: "Pursuing"
    },
    {
      degree: "Diploma in Computer Engineering",
      institution: "Government Polytechnic",
      period: "2020 – 2023",
      status: "Completed with Distinction"
    }
  ],
  disciplines: [
    {
      title: "Frontend Architecture",
      desc: "Component-driven applications with React, modern state management, responsive Tailwind systems, and smooth UI animations."
    },
    {
      title: "Backend & Cloud Services",
      desc: "RESTful API services, Node.js/Express backends, authentication pipelines, microservices, and serverless architectures."
    },
    {
      title: "Database Modeling",
      desc: "Document modeling in MongoDB, relational schemas in SQL/PostgreSQL, and real-time syncing with Firebase Firestore."
    },
    {
      title: "Creative Development & AI",
      desc: "Interactive 3D WebGL visuals, procedural animations, and LLM integrations for intelligent data automation."
    }
  ]
};

export const SKILL_CATEGORIES: { category: SkillItem['category']; skills: SkillItem[] }[] = [
  {
    category: 'Frontend',
    skills: [
      {
        name: 'React',
        category: 'Frontend',
        description: 'Component architecture, custom hooks, context state management, and modern concurrent patterns.',
        highlights: ['Modular component hierarchies', 'Performance tuning & code splitting', 'Three.js / Canvas integration'],
        projects: ['DocCraft AI', 'Workout Planner Pro', 'LearnNova AI']
      },
      {
        name: 'JavaScript (ESNext)',
        category: 'Frontend',
        description: 'Asynchronous event-driven programming, Promises, DOM APIs, Canvas 2D, and functional paradigms.',
        highlights: ['Async/Await & Web APIs', 'Event delegation & closures', 'Modern ES6+ syntax'],
        projects: ['Dynamic Toll Pricing', 'DocCraft AI']
      },
      {
        name: 'TypeScript',
        category: 'Frontend',
        description: 'Strict static typing, interfaces, generics, and scalable type safety across client and server.',
        highlights: ['Strict type definitions', 'Generic utility types', 'API contract synchronization'],
        projects: ['Portfolio Universe', 'DocCraft AI']
      },
      {
        name: 'Tailwind CSS',
        category: 'Frontend',
        description: 'Utility-first styling, design token management, fluid responsive breakpoints, and dark/light theme systems.',
        highlights: ['Custom design systems', 'Responsive fluid layouts', 'Zero-runtime CSS footprint'],
        projects: ['DocCraft AI', 'Workout Planner Pro', 'LearnNova AI']
      },
      {
        name: 'HTML5 & CSS3',
        category: 'Frontend',
        description: 'Semantic markup, accessibility (WCAG AA), CSS grid/flexbox mechanics, and hardware-accelerated animations.',
        highlights: ['Semantic accessibility', '3D CSS transforms', 'Responsive viewports'],
        projects: ['All Projects']
      }
    ]
  },
  {
    category: 'Backend',
    skills: [
      {
        name: 'Node.js',
        category: 'Backend',
        description: 'Event-driven server-side runtime, stream handling, middleware pipelines, and file system automation.',
        highlights: ['Asynchronous I/O optimization', 'Stream-based data processing', 'Modular server architectures'],
        projects: ['DocCraft AI', 'Dynamic Toll Pricing', 'LearnNova AI']
      },
      {
        name: 'Express.js',
        category: 'Backend',
        description: 'RESTful API routing, centralized error handlers, CORS configuration, and JWT authentication middleware.',
        highlights: ['RESTful endpoint design', 'JWT authentication & session guards', 'Input validation middleware'],
        projects: ['Dynamic Toll Pricing', 'DocCraft AI']
      },
      {
        name: 'RESTful APIs',
        category: 'Backend',
        description: 'Designing structured HTTP endpoints, status code contracts, pagination, and predictable JSON responses.',
        highlights: ['Stateless API architecture', 'Pagination & filtering specs', 'Standardized error payloads'],
        projects: ['DocCraft AI', 'Dynamic Toll Pricing']
      }
    ]
  },
  {
    category: 'Database',
    skills: [
      {
        name: 'MongoDB',
        category: 'Database',
        description: 'NoSQL document modeling, Mongoose ODM schemas, compound indexes, and aggregation pipelines.',
        highlights: ['Aggregation pipelines', 'Index optimization', 'Document validation rules'],
        projects: ['DocCraft AI', 'Dynamic Toll Pricing']
      },
      {
        name: 'Firebase / Firestore',
        category: 'Database',
        description: 'Real-time document listeners, Firebase Authentication, Cloud Security Rules, and serverless triggers.',
        highlights: ['Real-time snapshot subscriptions', 'Secure client-side rules', 'Auth provider integrations'],
        projects: ['Workout Planner Pro', 'LearnNova AI']
      },
      {
        name: 'SQL & Relational DBs',
        category: 'Database',
        description: 'Relational schema design, normalization (1NF-3NF), multi-table JOIN queries, and transaction integrity.',
        highlights: ['Normalized table design', 'Complex JOIN queries', 'ACID transaction constraints'],
        projects: ['Academic Projects', 'Database Systems']
      }
    ]
  },
  {
    category: 'Programming',
    skills: [
      {
        name: 'Python',
        category: 'Programming',
        description: 'Data manipulation, algorithmic problem solving, scripting, and integrating AI/ML model endpoints.',
        highlights: ['Data structures & algorithms', 'Scripting & automation', 'AI model integration'],
        projects: ['DocCraft AI', 'LearnNova AI']
      },
      {
        name: 'Dart & Flutter',
        category: 'Programming',
        description: 'Object-oriented programming, cross-platform mobile UI composition, and reactive state management.',
        highlights: ['Cross-platform widget trees', 'State management patterns', 'Mobile UI fluidity'],
        projects: ['Mobile Prototypes']
      },
      {
        name: 'C / C++',
        category: 'Programming',
        description: 'Core foundational data structures, pointer memory management, OOP principles, and low-level algorithms.',
        highlights: ['Memory pointers & structures', 'Time/space complexity analysis', 'Object-oriented fundamentals'],
        projects: ['Academic Foundations']
      }
    ]
  },
  {
    category: 'Tools',
    skills: [
      {
        name: 'Git & GitHub',
        category: 'Tools',
        description: 'Distributed version control, feature-branch workflows, pull request reviews, and merge conflict resolution.',
        highlights: ['Branching & release workflows', 'Clean commit history', 'Open-source collaboration'],
        projects: ['All Projects']
      },
      {
        name: 'Postman',
        category: 'Tools',
        description: 'API endpoint testing, environment variable management, automated collection runs, and mock servers.',
        highlights: ['Automated test collections', 'Environment config switching', 'API documentation generation'],
        projects: ['DocCraft AI', 'Dynamic Toll Pricing']
      },
      {
        name: 'Figma',
        category: 'Tools',
        description: 'User interface design, wireframing, component auto-layout, interactive prototyping, and design systems.',
        highlights: ['Design token systems', 'Interactive wireframing', 'Developer handoff specs'],
        projects: ['All UI Designs']
      },
      {
        name: 'Vite & Build Tools',
        category: 'Tools',
        description: 'Modern build pipelines, asset bundling, ES modules, tree-shaking, and fast development environments.',
        highlights: ['Lightning-fast HMR builds', 'Production bundle optimization', 'Plugin ecosystem config'],
        projects: ['Portfolio', 'React Apps']
      }
    ]
  }
];



export const REPOSITORIES: Repository[] = [
  {
    id: "repo-1",
    name: "doccraft-ai",
    description: "Intelligent document automation, parsing, and semantic extraction engine built with React, Node.js, and Python.",
    language: "TypeScript",
    tags: ["React", "Node.js", "AI", "MongoDB"],
    url: "https://github.com/kshitijarenuke/doccraft-ai",
    updated: "2025"
  },
  {
    id: "repo-2",
    name: "dynamic-toll-pricing",
    description: "Real-time congestion-based highway tariff calculation algorithm and simulation dashboard.",
    language: "JavaScript",
    tags: ["Express", "React", "WebSockets", "Algorithms"],
    url: "https://github.com/kshitijarenuke/dynamic-toll-pricing",
    updated: "2024"
  },
  {
    id: "repo-3",
    name: "workout-planner-pro",
    description: "Progressive overload fitness tracking and custom routine builder with Firebase Firestore real-time sync.",
    language: "TypeScript",
    tags: ["React", "Firebase", "TailwindCSS", "PWA"],
    url: "https://github.com/kshitijarenuke/workout-planner-pro",
    updated: "2024"
  },
  {
    id: "repo-4",
    name: "learnnova-ai",
    description: "Interactive knowledge visualizer and spaced-repetition active recall study platform.",
    language: "JavaScript",
    tags: ["React", "D3.js", "Node.js", "Python"],
    url: "https://github.com/kshitijarenuke/learnnova-ai",
    updated: "2025"
  },
  {
    id: "repo-5",
    name: "fullstack-starter-kit",
    description: "Modular boilerplate for rapid full-stack web applications with React, Express, JWT, and MongoDB.",
    language: "TypeScript",
    tags: ["Node.js", "React", "JWT", "Boilerplate"],
    url: "https://github.com/kshitijarenuke/fullstack-starter-kit",
    updated: "2024"
  },
  {
    id: "repo-6",
    name: "algorithm-visualizers",
    description: "Interactive browser visualizations of core sorting, graph traversal, and dynamic programming algorithms.",
    language: "JavaScript",
    tags: ["Canvas", "Data Structures", "Algorithms"],
    url: "https://github.com/kshitijarenuke/algorithm-visualizers",
    updated: "2024"
  }
];

export const JOURNEY_MILESTONES: Milestone[] = [
  {
    id: "m-diploma",
    year: "2020 – 2023",
    title: "Diploma in Computer Engineering",
    role: "Foundational Engineering",
    organization: "Government Polytechnic",
    location: "Maharashtra, India",
    description: "Built strong fundamentals in Computer Science, including Object-Oriented Programming, Data Structures, Relational Database Management Systems, Computer Networks, and Microprocessors.",
    achievements: [
      "Graduated with Distinction (Top 5% rank in graduating class)",
      "Co-organized the annual technical symposium and developed the web registration system",
      "Created early software prototypes in C++, Java, and PHP/MySQL"
    ],
    techStack: ["C++", "Java", "SQL", "HTML5", "CSS3", "JavaScript"],
    type: "education"
  },
  {
    id: "m-internship",
    year: "2023",
    title: "Full-Stack Development Intern",
    role: "Software Engineering Intern",
    organization: "Tech Innovations Lab",
    location: "Hybrid",
    description: "Worked closely with senior engineers on building responsive web user interfaces, integrating RESTful backend endpoints, and writing test suites.",
    achievements: [
      "Developed reusable React components following modular design system standards",
      "Connected secure backend endpoints using JWT authentication and Express middleware",
      "Participated in Agile sprint planning, daily standups, code reviews, and Git workflows"
    ],
    techStack: ["React", "Node.js", "Express", "MongoDB", "Git", "Postman"],
    type: "experience"
  },
  {
    id: "m-btech",
    year: "2023 – 2026",
    title: "B.Tech in Computer Science & Engineering",
    role: "Undergraduate Degree",
    organization: "University Department of Technology",
    location: "India",
    description: "Advancing knowledge in Distributed Systems, Cloud Computing, Database Engineering, Algorithms, and Artificial Intelligence while building production-grade software projects.",
    achievements: [
      "Consistently strong academic performance in core CS courses",
      "Developed full-stack course projects and participated in collegiate hackathons",
      "Active contributor in collegiate coding clubs and technical peer mentorship"
    ],
    techStack: ["Python", "JavaScript", "TypeScript", "React", "Node.js", "Data Structures"],
    type: "education"
  },
  {
    id: "m-projects",
    year: "2024 – 2025",
    title: "Full-Stack & Intelligent Web Systems",
    role: "Project Developer",
    organization: "Personal & Academic Lab",
    location: "Remote",
    description: "Engineered comprehensive software applications including DocCraft AI, Dynamic Toll Pricing System, and Workout Planner Pro, focusing on real-world utility and clean architecture.",
    achievements: [
      "Shipped 4 complete full-stack web applications with cloud databases and responsive UIs",
      "Integrated AI embeddings and NLP workflows for intelligent document analysis",
      "Documented architectural diagrams, API contracts, and open-source repositories on GitHub"
    ],
    techStack: ["React", "Node.js", "Python", "MongoDB", "Firebase", "Tailwind CSS"],
    type: "project"
  },
  {
    id: "m-present",
    year: "Present",
    title: "Continuous Growth & Industry Opportunities",
    role: "Full-Stack Developer",
    organization: "Open to High-Impact Opportunities",
    location: "Global / Remote",
    description: "Continuously deepening expertise in modern web frameworks, cloud deployments, backend microservices, and human-centered interactive experiences.",
    achievements: [
      "Ready to deliver immediate value to engineering teams in software development and full-stack engineering",
      "Active on GitHub and constantly building, learning, and refining software solutions"
    ],
    techStack: ["TypeScript", "React", "Node.js", "Python", "Cloud Databases"],
    type: "experience"
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    title: "AWS Certified Cloud Foundations",
    issuer: "Amazon Web Services (AWS)",
    date: "2024",
    category: "certification",
    description: "Validated foundational knowledge of AWS Cloud infrastructure, security models, compute services (EC2, Lambda), storage (S3), and networking fundamentals.",
    skills: ["Cloud Computing", "AWS S3", "AWS Lambda", "IAM Security", "Cloud Architecture"],
    credentialId: "AWS-CF-VALIDATED",
    verifyUrl: "https://aws.amazon.com/verification",
    imageUrl: "/aws_cert.jpg"
  },
  {
    id: "ach-2",
    title: "Generative AI & LLM Systems Specialization",
    issuer: "DeepLearning.AI",
    date: "2025",
    category: "certification",
    description: "Completed comprehensive training on prompt engineering, Retrieval-Augmented Generation (RAG), vector databases, and API integration with modern LLM models.",
    skills: ["Prompt Engineering", "RAG Pipelines", "Vector Databases", "Python", "AI Integration"],
    credentialId: "DLAI-GENAI-SPECIALIST",
    verifyUrl: "https://www.deeplearning.ai",
    imageUrl: "/ai_cert.jpg"
  },
  {
    id: "ach-3",
    title: "Inter-Collegiate Hackathon Finalist",
    issuer: "Smart Tech Innovation Sprint",
    date: "2024",
    category: "hackathon",
    description: "Selected as top finalist for architecting and presenting the Dynamic Toll Pricing prototype in a 36-hour continuous software development sprint.",
    skills: ["Rapid Prototyping", "Dynamic Algorithms", "Team Collaboration", "Technical Pitching"],
    credentialId: "SPRINT-FINALIST-2024",
    imageUrl: "/hackathon_cert.jpg"
  },
  {
    id: "ach-4",
    title: "Academic Excellence in Computer Engineering",
    issuer: "State Board of Technical Education",
    date: "2023",
    category: "award",
    description: "Awarded Distinction honors for standing in the top 5% of the graduating Computer Engineering diploma cohort with consistent top-tier grades.",
    skills: ["Data Structures", "Database Management", "Object-Oriented Programming", "Computer Networks"],
    imageUrl: "/academic_cert.jpg"
  }
];
