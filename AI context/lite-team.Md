{
  "documentMeta": {
    "purpose": "Enterprise Nexus Light Theme — use with AI context/team.Md (dark) and rule.Md for architecture.",
    "implementationPath": "src/theme/tokens/nexus-tokens.css ([data-theme='light'])",
    "pairedDarkTheme": "AI context/team.Md",
    "rule": "Never hardcode hex in components. Toggle via navbar ThemeSwitcher; body data-theme light | dark."
  },
  "themeName": "Enterprise Nexus Light Theme",
  "themeType": "Professional B2B HRMS + Work Management",
  "mode": "Light Theme",

  "themeObjective": {
    "goal": "Create a clean enterprise-grade light UI for long office usage with low eye strain, high readability, strong hierarchy, and premium SaaS appearance.",
    "targetUsers": [
      "HR Managers",
      "Project Managers",
      "Developers",
      "Team Leads",
      "Enterprise Employees"
    ]
  },

  "lightThemeDesignPhilosophy": {
    "minimal": true,
    "professional": true,
    "airyLayout": true,
    "highWhitespaceUsage": true,
    "lowNoiseInterface": true,
    "businessFocused": true,
    "dataReadable": true,
    "premiumSaaSLook": true
  },

  "coreLightThemeRules": {
    "rule1": "Never use pure white background for entire screen",
    "rule2": "Use soft gray backgrounds to reduce eye strain",
    "rule3": "Cards must be slightly elevated from background",
    "rule4": "Use subtle shadows only",
    "rule5": "Primary blue should guide attention",
    "rule6": "Spacing is more important than borders",
    "rule7": "Avoid excessive gradients",
    "rule8": "Glass effect should remain soft and minimal",
    "rule9": "Text contrast must remain enterprise readable",
    "rule10": "Use muted colors instead of saturated colors"
  },

  "backgroundSystem": {
    "mainBackground": "#D1D6DC",
    "secondaryBackground": "#D4D8DD",
    "surfaceBackground": "#DCDFE3",
    "sidebarBackground": "#DCDFE3",
    "topbarBackground": "rgba(220,223,227,0.94)",
    "note": "Dull off-white surfaces — avoid pure #FFFFFF for long office use",

    "rules": {
      "mainScreen": "Use soft gray background",
      "cards": "Always use white surfaces",
      "sections": "Use subtle background difference",
      "analyticsPanels": "Use glass or elevated cards"
    }
  },

  "colorPalette": {
    "primary": {
      "name": "Enterprise Blue",
      "hex": "#1E4FC0",
      "hexPrevious": "#2563EB",
      "usage": [
        "Primary CTA buttons",
        "Active menu",
        "Focused states",
        "Links",
        "Charts",
        "Progress indicators"
      ]
    },

    "secondary": {
      "name": "Slate Gray",
      "hex": "#475569",
      "usage": [
        "Secondary text",
        "Inactive icons",
        "Labels",
        "Table metadata"
      ]
    },

    "accent": {
      "name": "Soft Cyan",
      "hex": "#06B6D4",
      "usage": [
        "Hover states",
        "Switches",
        "Analytics highlights",
        "Micro interactions"
      ]
    },

    "success": {
      "hex": "#10B981"
    },

    "warning": {
      "hex": "#F59E0B"
    },

    "danger": {
      "hex": "#EF4444"
    }
  },

  "textHierarchy": {
    "primaryText": "#0F172A",
    "secondaryText": "#475569",
    "mutedText": "#94A3B8",
    "disabledText": "#CBD5E1",

    "rules": {
      "headings": "Always use dark slate",
      "body": "Use medium slate",
      "metadata": "Use muted gray",
      "avoidPureBlack": true
    }
  },

  "shadowSystem": {
    "rule": "Light theme shadows must be soft, diffused, and premium.",

    "smallShadow": "0 1px 2px rgba(15,23,42,0.04)",
    "mediumShadow": "0 4px 12px rgba(15,23,42,0.06)",
    "largeShadow": "0 10px 24px rgba(15,23,42,0.08)",

    "hoverShadow": "0 12px 28px rgba(37,99,235,0.10)",

    "forbidden": [
      "Heavy black shadows",
      "Hard shadows",
      "Multiple stacked shadows"
    ]
  },

  "glassEffectRules": {
    "enabled": true,

    "lightGlass": {
      "background": "rgba(255,255,255,0.72)",
      "backdropFilter": "blur(18px)",
      "border": "1px solid rgba(255,255,255,0.6)",
      "shadow": "0 8px 24px rgba(15,23,42,0.05)"
    },

    "usageRules": [
      "Use only for topbar",
      "Use for floating widgets",
      "Use for modals",
      "Do not overuse glass cards"
    ]
  },

  "layoutRules": {
    "dashboardPadding": "24px",
    "sectionSpacing": "24px",
    "cardSpacing": "20px",
    "gridGap": "20px",

    "containerRules": {
      "maxWidth": "1600px",
      "centerContent": true
    }
  },

  "cardDesignSystem": {
    "background": "#DCDFE3",
    "border": "1px solid rgba(226,232,240,0.9)",
    "borderRadius": "20px",
    "padding": "20px",

    "shadow": "0 4px 12px rgba(15,23,42,0.05)",

    "hoverEffect": {
      "translateY": "-2px",
      "shadow": "0 10px 24px rgba(37,99,235,0.08)"
    },

    "innerSpacingRules": {
      "headerBottomGap": "16px",
      "contentGap": "12px"
    }
  },

  "buttonSystem": {
    "primaryButton": {
      "background": "#2563EB",
      "textColor": "#FFFFFF",
      "hoverBackground": "#1D4ED8",
      "shadow": "0 4px 14px rgba(37,99,235,0.20)",
      "borderRadius": "14px"
    },

    "secondaryButton": {
      "background": "#FFFFFF",
      "border": "1px solid #CBD5E1",
      "textColor": "#0F172A",
      "hoverBackground": "#F8FAFC"
    },

    "ghostButton": {
      "background": "transparent",
      "hoverBackground": "rgba(37,99,235,0.06)"
    },

    "dangerButton": {
      "background": "#EF4444",
      "textColor": "#FFFFFF"
    },

    "rules": [
      "Never use gradient buttons",
      "Avoid glowing buttons",
      "Maintain consistent height",
      "Primary action should dominate visually"
    ]
  },

  "inputDesignRules": {
    "background": "#FFFFFF",
    "border": "1px solid #CBD5E1",
    "focusBorder": "#2563EB",
    "focusRing": "0 0 0 4px rgba(37,99,235,0.10)",
    "placeholderColor": "#94A3B8",
    "height": "46px",
    "borderRadius": "12px",

    "rules": [
      "Avoid dark input fields in light mode",
      "Focus state must be clearly visible",
      "Inputs should feel lightweight"
    ]
  },

  "sidebarRules": {
    "background": "#FFFFFF",
    "borderRight": "1px solid #E2E8F0",

    "menuItem": {
      "textColor": "#475569",
      "iconColor": "#64748B",
      "hoverBackground": "#F1F5F9",
      "activeBackground": "rgba(37,99,235,0.08)",
      "activeTextColor": "#2563EB",
      "activeBorder": "4px solid #2563EB"
    },

    "rules": [
      "Sidebar should feel lightweight",
      "Use whitespace instead of separators",
      "Active state should be obvious"
    ]
  },

  "topbarRules": {
    "background": "rgba(255,255,255,0.82)",
    "blur": "20px",
    "borderBottom": "1px solid rgba(226,232,240,0.8)",

    "rules": [
      "Topbar should remain sticky",
      "Glass effect allowed",
      "Use soft blur only"
    ]
  },

  "tableDesignRules": {
    "headerBackground": "#F8FAFC",
    "rowHover": "#EFF6FF",
    "borderColor": "#E2E8F0",
    "headerText": "#0F172A",
    "bodyText": "#475569",

    "rules": [
      "Avoid strong table borders",
      "Use row hover feedback",
      "Keep tables highly readable"
    ]
  },

  "switchDesignRules": {
    "inactiveBackground": "#CBD5E1",
    "activeBackground": "#06B6D4",
    "thumbColor": "#FFFFFF",
    "activeGlow": "0 0 10px rgba(6,182,212,0.30)",

    "rules": [
      "Switch transitions must be smooth",
      "Avoid neon glow",
      "Thumb should remain pure white"
    ]
  },

  "typographySystem": {
    "fontFamily": "'Inter', 'Segoe UI', sans-serif",

    "headingWeights": {
      "h1": 700,
      "h2": 600,
      "h3": 600
    },

    "bodyWeight": 400,

    "fontSizes": {
      "h1": "32px",
      "h2": "24px",
      "h3": "20px",
      "body": "14px",
      "caption": "12px"
    },

    "lineHeight": 1.5
  },

  "dashboardUXRules": {
    "maximumCardsPerRow": 5,
    "minimumCardHeight": "140px",
    "chartSpacing": "24px",

    "rules": [
      "Do not overload dashboard",
      "Use progressive disclosure",
      "Highlight important KPIs only",
      "Keep analytics visually balanced",
      "Important actions should stay above fold"
    ]
  },

  "animationRules": {
    "duration": "0.25s",
    "timingFunction": "ease-in-out",

    "allowedAnimations": [
      "fade",
      "hover lift",
      "soft scale",
      "slide up"
    ],

    "forbiddenAnimations": [
      "bounce",
      "flash",
      "excessive motion",
      "gaming animations"
    ]
  },

  "codingRules": {
    "neverUseHardcodedColors": true,
    "alwaysUseThemeTokens": true,
    "useCSSVariables": true,
    "avoidInlineStyles": true,
    "componentDrivenDesign": true,

    "themeFolderStructure": {
      "tokens": "/src/theme/tokens",
      "colors": "/src/theme/colors",
      "typography": "/src/theme/typography",
      "shadows": "/src/theme/shadows",
      "components": "/src/components"
    },

    "scssRules": [
      "Use semantic variable names",
      "Reuse shadow variables",
      "Never duplicate styles",
      "Create utility classes",
      "Use spacing tokens only"
    ]
  },

  "implementationFlow": {
    "step1": "Create design tokens",
    "step2": "Create color variables",
    "step3": "Create typography system",
    "step4": "Create reusable shadows",
    "step5": "Create button variants",
    "step6": "Create layout system",
    "step7": "Create responsive utilities",
    "step8": "Create dark/light switch engine",
    "step9": "Optimize accessibility",
    "step10": "Create animation utilities"
  },

  "enterpriseRestrictions": {
    "forbidden": [
      "Neon colors",
      "Gaming UI",
      "Heavy gradients",
      "Random animations",
      "Overlapping shadows",
      "Too many accent colors",
      "Over-designed cards"
    ]
  },

  "responsiveRules": {
    "mobile": "Single column",
    "tablet": "2-column layout",
    "desktop": "4-5 column grid",

    "breakpoints": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    }
  }
}
