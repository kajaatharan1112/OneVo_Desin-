{
  "project_type": "Enterprise React 19 Architecture Standards",
  "version": "React 19+",
  "architecture_style": "Feature Driven Scalable Architecture",
  "description": "Comprehensive enterprise-grade React project rules and standards for maintaining multiple designs and scalable applications inside one project.",
  "core_principles": {
    "rules": [
      "Single Responsibility Principle must be followed everywhere",
      "Each component should handle only one responsibility",
      "Business logic must never stay inside JSX",
      "Avoid massive page components",
      "Reusable logic must move into hooks or services",
      "Feature-first architecture is mandatory",
      "Avoid duplicated UI and logic",
      "Strict TypeScript usage everywhere",
      "Performance-first development",
      "Accessibility-first development",
      "Reusable and configurable UI system",
      "Theme scalability must exist from day one",
      "Avoid tight coupling between components",
      "Everything must be scalable for future modules",
      "Code readability is more important than short code",
      "Folder structure must explain architecture itself"
    ]
  },
  "recommended_architecture": {
    "pattern": "Feature Driven Clean Architecture",
    "layers": [
      {
        "name": "Core Layer",
        "purpose": "Application-wide global systems",
        "contains": [
          "api clients",
          "auth",
          "theme engine",
          "error handling",
          "routing",
          "global providers",
          "logger",
          "environment configs"
        ]
      },
      {
        "name": "Shared Layer",
        "purpose": "Reusable shared resources",
        "contains": [
          "ui components",
          "hooks",
          "utils",
          "constants",
          "types",
          "icons",
          "animations",
          "validators"
        ]
      },
      {
        "name": "Feature Layer",
        "purpose": "Business modules",
        "contains": [
          "dashboard",
          "employees",
          "reports",
          "analytics",
          "settings"
        ]
      },
      {
        "name": "Layout Layer",
        "purpose": "Application shell structure",
        "contains": [
          "sidebar",
          "navbar",
          "footer",
          "breadcrumbs",
          "shell"
        ]
      }
    ]
  },
  "folder_structure_rules": {
    "rules": [
      "Never dump everything inside components folder",
      "Each feature must be isolated",
      "Avoid deeply nested folder structures",
      "One component per folder",
      "Component folders must use kebab-case",
      "Never mix business logic and UI logic",
      "Hooks must stay inside hooks folder",
      "API integrations must stay inside services folder",
      "Enums must stay inside enums folder",
      "Constants must stay centralized",
      "Types and interfaces must stay organized"
    ],
    "recommended_structure": {
      "src": {
        "app": {},
        "core": {},
        "shared": {},
        "features": {},
        "layouts": {},
        "store": {},
        "theme": {},
        "routes": {},
        "assets": {},
        "styles": {}
      }
    }
  },
  "component_rules": {
    "must_follow": [
      "Component must remain small and focused",
      "Avoid god components",
      "Separate smart and dumb components",
      "Presentation components should only render UI",
      "Container components should manage orchestration",
      "Avoid excessive prop drilling",
      "Use context carefully",
      "Never call APIs directly inside reusable UI components",
      "Avoid unnecessary re-renders",
      "Use memoization carefully",
      "Avoid inline function recreation in large lists",
      "Avoid duplicated JSX structures",
      "Keep hooks clean and isolated",
      "Never use any type"
    ],
    "naming_convention": {
      "component": "employee-card.tsx",
      "hook": "use-employee.ts",
      "service": "employee.service.ts",
      "store": "employee.store.ts",
      "enum": "theme-mode.enum.ts",
      "type": "employee.types.ts"
    }
  },
  "page_management_rules": {
    "rules": [
      "Pages should only coordinate sections",
      "Large pages must be split into reusable sections",
      "Avoid massive dashboard pages",
      "Each section should become reusable component",
      "Page-level state should stay minimal",
      "Heavy business logic must move into hooks/services",
      "Route-based code splitting is mandatory"
    ]
  },
  "state_management_rules": {
    "recommended": [
      "Zustand",
      "Redux Toolkit",
      "React Context",
      "TanStack Query"
    ],
    "rules": [
      "Local UI state should stay inside components",
      "Shared feature state should stay inside stores",
      "Avoid unnecessary global state",
      "Never mutate state directly",
      "Use immutable updates",
      "Server state and UI state must be separated",
      "Avoid deeply nested reducers",
      "Async API state should use TanStack Query",
      "Avoid prop drilling"
    ]
  },
  "routing_rules": {
    "rules": [
      "Every major feature must be lazy loaded",
      "Use route-level code splitting",
      "Protect private routes",
      "Keep route hierarchy clean",
      "Avoid deeply nested routes",
      "Feature routes should stay inside feature folders",
      "Route names must be semantic"
    ]
  },
  "theme_management_rules": {
    "theme_architecture": {
      "mode_support": [
        "light",
        "dark",
        "high-contrast",
        "brand-theme"
      ],
      "rules": [
        "Never hardcode colors",
        "Use CSS variables only",
        "Theme tokens must be centralized",
        "Typography must use token system",
        "Spacing system must be standardized",
        "Border radius system must be reusable",
        "Support runtime theme switching",
        "Support multiple client branding"
      ]
    },
    "css_variable_example": {
      "--primary-color": "#4f46e5",
      "--background-color": "#0f172a",
      "--text-color": "#f8fafc",
      "--card-radius": "16px"
    }
  },
  "styling_rules": {
    "recommended": [
      "TailwindCSS",
      "CSS Modules",
      "SCSS Modules"
    ],
    "rules": [
      "Never use inline styles for large systems",
      "Avoid global CSS pollution",
      "Avoid !important",
      "Use design tokens",
      "Create reusable spacing system",
      "Create typography system",
      "Use mobile-first responsive strategy",
      "Keep styles scoped",
      "Maintain UI consistency"
    ]
  },
  "design_system_rules": {
    "must_have": [
      "Reusable buttons",
      "Reusable cards",
      "Reusable modals",
      "Reusable form controls",
      "Reusable tables",
      "Reusable loaders",
      "Reusable skeleton loaders",
      "Reusable notifications",
      "Reusable empty states"
    ],
    "design_tokens": [
      "colors",
      "spacing",
      "radius",
      "typography",
      "font weights",
      "shadow",
      "z-index",
      "animation duration"
    ]
  },
  "api_rules": {
    "rules": [
      "Never hardcode API URLs",
      "Use environment variables",
      "Centralize API layer",
      "Use Axios instance or fetch wrapper",
      "Use typed API responses",
      "Handle errors globally",
      "Retry critical requests carefully",
      "Never expose secrets in frontend",
      "Map DTOs properly",
      "Avoid direct API usage inside components"
    ]
  },
  "performance_rules": {
    "critical_rules": [
      "Use lazy loading",
      "Use React Suspense",
      "Use code splitting",
      "Optimize bundle size",
      "Avoid unnecessary re-renders",
      "Use memo carefully",
      "Use virtualization for large lists",
      "Optimize images",
      "Avoid huge third-party libraries",
      "Use server components if applicable",
      "Use streaming SSR when needed"
    ]
  },
  "security_rules": {
    "must_follow": [
      "Never trust user input",
      "Sanitize dangerous HTML",
      "Protect against XSS",
      "Use secure authentication flows",
      "Avoid storing sensitive tokens insecurely",
      "Validate forms properly",
      "Hide internal errors in production",
      "Use CSP headers",
      "Never expose secrets in frontend"
    ]
  },
  "form_rules": {
    "recommended": [
      "React Hook Form",
      "Zod"
    ],
    "rules": [
      "Centralize validation logic",
      "Use schema validation",
      "Avoid duplicated form logic",
      "Disable submit during API calls",
      "Handle loading and error states",
      "Create reusable validators"
    ]
  },
  "testing_rules": {
    "rules": [
      "Critical components must have tests",
      "Business logic must have unit tests",
      "Avoid untested complex hooks",
      "Use integration testing for flows",
      "Mock API calls correctly",
      "Avoid flaky tests"
    ],
    "recommended": [
      "Vitest",
      "Jest",
      "React Testing Library",
      "Playwright",
      "Cypress"
    ]
  },
  "coding_standard_rules": {
    "typescript_rules": [
      "Strict mode enabled",
      "No implicit any",
      "Prefer readonly when possible",
      "Avoid massive utility files",
      "Avoid magic numbers",
      "Use enums/constants properly",
      "Keep functions short",
      "Use early returns",
      "Avoid deeply nested conditions"
    ],
    "jsx_rules": [
      "Avoid logic-heavy JSX",
      "Keep render trees clean",
      "Use semantic HTML",
      "Accessibility attributes are mandatory",
      "Avoid duplicated JSX"
    ]
  },
  "react19_special_rules": {
    "must_follow": [
      "Use React Server Components where applicable",
      "Use Actions for async form handling",
      "Use Suspense properly",
      "Prefer concurrent rendering patterns",
      "Avoid legacy class components",
      "Use useTransition carefully",
      "Use streaming SSR for enterprise apps",
      "Use partial hydration if framework supports it",
      "Optimize client/server boundary",
      "Use modern React compiler-friendly patterns"
    ]
  },
  "enterprise_team_rules": {
    "rules": [
      "Every PR must be reviewed",
      "Maintain coding guideline documents",
      "Maintain reusable component inventory",
      "Maintain changelog",
      "Use proper branching strategy",
      "Avoid direct production pushes",
      "Audit dependencies regularly",
      "Document architecture decisions",
      "Maintain stable dependency versions"
    ]
  },
  "git_rules": {
    "branch_strategy": [
      "main",
      "develop",
      "feature/*",
      "hotfix/*",
      "release/*"
    ],
    "commit_examples": [
      "feat(auth): add refresh token handling",
      "fix(theme): resolve dark mode flicker",
      "refactor(dashboard): optimize rendering",
      "chore(deps): update react 19 packages"
    ]
  },
  "documentation_rules": {
    "must_have": [
      "README",
      "Architecture documentation",
      "Environment setup guide",
      "Theme customization guide",
      "API integration documentation",
      "Deployment guide",
      "Folder structure documentation",
      "Coding standards documentation"
    ]
  },
  "ui_consistency_rules": {
    "rules": [
      "All buttons must use same spacing system",
      "All inputs must use same heights",
      "Use same animation timings globally",
      "Use unified icon system",
      "Maintain typography consistency",
      "Maintain spacing rhythm"
    ]
  },
  "anti_patterns": {
    "never_do": [
      "Massive global stores",
      "Huge utility dumping files",
      "Business logic inside JSX",
      "Deep prop drilling",
      "Hardcoded colors",
      "Hardcoded spacing",
      "Copy-paste UI development",
      "Massive App.tsx",
      "Using any type everywhere",
      "Huge monolithic services",
      "Too many global contexts"
    ]
  },
  "scalability_rules": {
    "future_ready_rules": [
      "Support microfrontend migration",
      "Support multilingual architecture",
      "Support multi-theme systems",
      "Support role-based rendering",
      "Keep APIs abstracted",
      "Use configurable layouts",
      "Design every module for reuse"
    ]
  },
  "recommended_tools": {
    "frameworks": [
      "Next.js",
      "Vite"
    ],
    "ui": [
      "TailwindCSS",
      "ShadCN UI",
      "Material UI"
    ],
    "state": [
      "Zustand",
      "Redux Toolkit",
      "TanStack Query"
    ],
    "quality": [
      "ESLint",
      "Prettier",
      "SonarQube"
    ]
  },
  "special_enterprise_rules": {
    "must_follow": [
      "Every reusable component must support variants",
      "Every API call must support loading and error handling",
      "Every page must support responsive layouts",
      "Every feature must support scalability",
      "Every design must support theme adaptation",
      "Every module must remain independently maintainable"
    ]
  },
  "deployment_rules": {
    "hosting": "Vercel",
    "vercel_link": "https://onevo-desin.vercel.app",
    "mandatory_rule": "This application is already hosted on Vercel. You MUST always obtain explicit permission from the user before deploying, updating, or pushing any changes to Vercel."
  },
  "final_enterprise_rule": {
    "main_rule": "If a new developer cannot understand the project architecture within one day, the architecture has failed."
  }
}