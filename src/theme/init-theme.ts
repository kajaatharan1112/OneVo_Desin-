import { applyThemeToDocument, getInitialTheme } from '../core/theme/apply-theme';

/** Run before React paint to avoid theme flash */
applyThemeToDocument(getInitialTheme());
