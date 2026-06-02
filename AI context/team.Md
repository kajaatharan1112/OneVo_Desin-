{
  "documentMeta": {
    "purpose": "Enterprise Nexus HRMS visual design system — use with AI context/rule.Md for architecture and coding standards.",
    "implementationPath": "src/theme/tokens/nexus-tokens.css",
    "semanticAliases": "src/theme/semantic.css maps legacy --accent, --surface-* vars to Nexus tokens",
    "defaultTheme": "dark (data-theme on body per darkModePrimary)",
    "lightThemeGuide": "AI context/lite-team.Md",
    "themeSwitcher": "Navbar ThemeSwitcher — src/shared/components/theme-switcher",
    "rule": "Never hardcode hex colors in components. Always use CSS variables from Nexus tokens or semantic aliases defined in index.css."
  },
  "themeName": "Enterprise Nexus HRMS Theme",
  "themeType": "Professional B2B Work Management + HRMS",
  "industry": "IT Enterprise SaaS",
  "designStyle": "Modern Enterprise Glassmorphism Minimal",
  "themeGoal": "Create a premium enterprise-grade HRMS + Project Management UI focused on clarity, productivity, professionalism, scalability, and low eye strain for long-duration office usage.",

  "coreDesignPrinciples": {
    "minimal": true,
    "professional": true,
    "enterpriseFocused": true,
    "highReadability": true,
    "lowVisualNoise": true,
    "consistentSpacing": true,
    "accessibleContrast": true,
    "modularComponents": true,
    "responsive": true,
    "darkModePrimary": true
  },

  "colorSystem": {
    "totalMainColors": 5,
    "rule": "Never use random colors. Entire application must stay within defined enterprise palette.",

    "primary": {
      "name": "Enterprise Blue",
      "hex": "#1E4FC0",
      "hexPrevious": "#2563EB",
      "usage": [
        "Primary buttons",
        "Active navigation",
        "Focused input border",
        "Charts primary data",
        "Links",
        "Important highlights"
      ]
    },

    "secondary": {
      "name": "Deep Slate",
      "hex": "#0F172A",
      "usage": [
        "Sidebar background",
        "Header background",
        "Dark containers",
        "Dark mode surfaces"
      ]
    },

    "accent": {
      "name": "Soft Cyan",
      "hex": "#06B6D4",
      "usage": [
        "Hover effects",
        "Progress indicators",
        "Switch active glow",
        "Analytics highlights"
      ]
    },

    "success": {
      "name": "Soft Emerald",
      "hex": "#10B981",
      "usage": [
        "Success states",
        "Completed tasks",
        "Approved leave",
        "Positive KPI indicators"
      ]
    },

    "danger": {
      "name": "Muted Red",
      "hex": "#EF4444",
      "usage": [
        "Errors",
        "Delete actions",
        "Late task warnings",
        "Critical alerts"
      ]
    }
  },

  "neutralPalette": {
    "background": "#F8FAFC",
    "surface": "#FFFFFF",
    "surfaceDark": "#1E293B",
    "border": "#E2E8F0",
    "textPrimary": "#0F172A",
    "textSecondary": "#64748B",
    "textMuted": "#94A3B8"
  },

  "layoutRules": {
    "borderRadius": {
      "cards": "20px",
      "buttons": "14px",
      "inputs": "12px",
      "modals": "24px"
    },

    "spacingSystem": {
      "baseUnit": 8,
      "rule": "All paddings and margins must use multiples of 8"
    },

    "containerRules": {
      "maxWidth": "1600px",
      "dashboardPadding": "24px",
      "sectionGap": "24px",
      "cardGap": "20px"
    }
  },

  "glassmorphismRules": {
    "enabled": true,

    "glassCard": {
      "background": "rgba(255,255,255,0.7)",
      "backdropFilter": "blur(18px)",
      "border": "1px solid rgba(255,255,255,0.2)",
      "shadow": "0 8px 32px rgba(15,23,42,0.08)"
    },

    "darkGlassCard": {
      "background": "rgba(15,23,42,0.75)",
      "backdropFilter": "blur(20px)",
      "border": "1px solid rgba(255,255,255,0.08)",
      "shadow": "0 8px 30px rgba(0,0,0,0.35)"
    }
  },

  "shadowSystem": {
    "rule": "Avoid heavy shadows. Enterprise UI should feel lightweight and premium.",

    "outerShadow": {
      "sm": "0 1px 2px rgba(15,23,42,0.04)",
      "md": "0 4px 12px rgba(15,23,42,0.08)",
      "lg": "0 12px 24px rgba(15,23,42,0.12)"
    },

    "innerShadow": {
      "light": "inset 0 1px 2px rgba(255,255,255,0.3)",
      "dark": "inset 0 2px 4px rgba(0,0,0,0.12)"
    },

    "hoverShadow": {
      "cards": "0 10px 25px rgba(37,99,235,0.12)",
      "buttons": "0 4px 14px rgba(37,99,235,0.25)"
    }
  },

  "buttonSystem": {
    "primaryButton": {
      "background": "#2563EB",
      "textColor": "#FFFFFF",
      "hoverBackground": "#1D4ED8",
      "shadow": "0 4px 14px rgba(37,99,235,0.25)",
      "height": "44px",
      "fontWeight": 600
    },

    "secondaryButton": {
      "background": "#FFFFFF",
      "border": "1px solid #CBD5E1",
      "textColor": "#0F172A",
      "hoverBackground": "#F1F5F9"
    },

    "dangerButton": {
      "background": "#EF4444",
      "textColor": "#FFFFFF"
    },

    "ghostButton": {
      "background": "transparent",
      "hoverBackground": "rgba(37,99,235,0.08)"
    }
  },

  "switchSystem": {
    "style": "Modern iOS Enterprise",

    "inactive": {
      "background": "#CBD5E1",
      "thumb": "#FFFFFF"
    },

    "active": {
      "background": "#06B6D4",
      "thumb": "#FFFFFF",
      "glow": "0 0 12px rgba(6,182,212,0.45)"
    },

    "transition": "all 0.25s ease"
  },

  "inputSystem": {
    "background": "#FFFFFF",
    "border": "1px solid #CBD5E1",
    "focusBorder": "#2563EB",
    "focusRing": "0 0 0 4px rgba(37,99,235,0.12)",
    "placeholderColor": "#94A3B8",
    "height": "46px"
  },

  "sidebarTheme": {
    "background": "#0F172A",
    "textColor": "#CBD5E1",
    "activeItemBackground": "rgba(37,99,235,0.15)",
    "activeItemBorder": "4px solid #2563EB",
    "hoverBackground": "rgba(255,255,255,0.06)",
    "iconColor": "#94A3B8",
    "activeIconColor": "#FFFFFF"
  },

  "topbarTheme": {
    "background": "rgba(255,255,255,0.75)",
    "blur": "20px",
    "borderBottom": "1px solid rgba(226,232,240,0.8)"
  },

  "cardDesignRules": {
    "background": "#FFFFFF",
    "borderRadius": "20px",
    "padding": "20px",
    "border": "1px solid #E2E8F0",
    "shadow": "0 4px 12px rgba(15,23,42,0.06)",

    "hoverEffect": {
      "translateY": "-2px",
      "shadow": "0 12px 24px rgba(37,99,235,0.08)"
    }
  },

  "tableDesignSystem": {
    "headerBackground": "#F8FAFC",
    "rowHover": "#EFF6FF",
    "border": "#E2E8F0",
    "textColor": "#334155",
    "headerTextColor": "#0F172A",
    "rowHeight": "52px"
  },

  "chartTheme": {
    "primaryChartColor": "#2563EB",
    "secondaryChartColor": "#06B6D4",
    "successChartColor": "#10B981",
    "warningChartColor": "#F59E0B",
    "dangerChartColor": "#EF4444",
    "gridLineColor": "#E2E8F0"
  },

  "notificationTheme": {
    "info": "#2563EB",
    "success": "#10B981",
    "warning": "#F59E0B",
    "danger": "#EF4444"
  },

  "typographySystem": {
    "fontFamily": "'Inter', 'Segoe UI', sans-serif",

    "headingWeights": {
      "h1": 700,
      "h2": 700,
      "h3": 600
    },

    "bodyWeight": 400,

    "fontSizes": {
      "h1": "32px",
      "h2": "24px",
      "h3": "20px",
      "body": "14px",
      "small": "12px"
    },

    "lineHeight": 1.5
  },

  "animationRules": {
    "duration": "0.25s",
    "timing": "ease-in-out",

    "allowedAnimations": [
      "fade",
      "soft-scale",
      "slide-up",
      "hover-lift"
    ],

    "forbiddenAnimations": [
      "bounce",
      "flash",
      "excessive rotation",
      "heavy parallax"
    ]
  },

  "dashboardStructureRules": {
    "headerHeight": "72px",
    "sidebarWidth": "192px",
    "notificationPanelWidth": "192px (matches sidebar via --nexus-rail-width)",

    "dashboardSections": [
      "KPI Cards",
      "Task Analytics",
      "Employee Activity",
      "Notifications",
      "Project Progress",
      "Attendance Insights"
    ]
  },

  "darkModeRules": {
    "enabled": true,

    "background": "#020617",
    "surface": "#0F172A",
    "cardBackground": "#1E293B",
    "textPrimary": "#F8FAFC",
    "textSecondary": "#CBD5E1",
    "border": "rgba(255,255,255,0.08)"
  },

  "codingRules": {
    "neverHardcodeColors": true,
    "alwaysUseThemeVariables": true,
    "neverUseInlineStyles": true,
    "componentBasedStyling": true,
    "useGlobalSpacingSystem": true,
    "useDesignTokens": true,

    "folderStructure": {
      "theme": "/src/theme",
      "tokens": "/src/theme/tokens",
      "components": "/src/components",
      "layouts": "/src/layouts"
    },

    "scssRules": [
      "Use CSS variables",
      "Create reusable mixins",
      "Never duplicate shadows",
      "Never duplicate button styles",
      "Centralize spacing tokens",
      "Use semantic naming"
    ]
  },

  "themeImplementationGuide": {
    "step1": "Create design token system",
    "step2": "Create global CSS variables",
    "step3": "Implement typography system",
    "step4": "Implement spacing system",
    "step5": "Build reusable button components",
    "step6": "Build reusable card components",
    "step7": "Create dark mode engine",
    "step8": "Create responsive breakpoints",
    "step9": "Optimize accessibility contrast",
    "step10": "Create animation utility classes"
  },

  "enterpriseUXRules": [
    "Never overload dashboard",
    "Maximum 5 KPI cards per row",
    "Avoid more than 2 accent colors in same view",
    "Important actions must use primary color",
    "Danger actions must always use red",
    "Keep charts minimal",
    "Maintain whitespace",
    "Reduce cognitive load",
    "Avoid neon colors",
    "Avoid gaming-style UI"
  ],

  "responsiveRules": {
    "mobile": "Single column layout",
    "tablet": "2-column grid",
    "desktop": "4-column grid",

    "breakpoints": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    }
  }
}
