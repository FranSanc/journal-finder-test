# Dead Code Analysis Report
**Project**: journal-finder-test  
**Analysis Date**: 2026-05-20  
**Scope**: All files in src/ directory

---

## Summary
Found **12 dead code issues** across 8 files:
- 9 unused imports (mostly unnecessary React imports)
- 1 unused named export
- 2 undefined variables that will cause runtime errors

---

## CRITICAL ISSUES (Will Cause Runtime Errors)

### 1. PageNotFound.jsx - Lines 28-30
**File**: [src/lib/PageNotFound.jsx](src/lib/PageNotFound.jsx#L28)  
**Severity**: 🔴 CRITICAL - ReferenceError at runtime  
**Issue**: Using undefined variables `isFetched` and `authData`

```jsx
{isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
```

**Problem**: Neither `isFetched` nor `authData` are defined in the component. This will throw:
```
ReferenceError: isFetched is not defined
```

**Fix**: Either:
1. Remove the condition entirely if admin feature is not needed
2. Define these variables using a hook or state
3. Import them from an auth context

---

## UNUSED IMPORTS

### 2. SearchForm.jsx - Line 7
**File**: [src/components/finder/SearchForm.jsx](src/components/finder/SearchForm.jsx#L7)  
**Severity**: 🟡 MEDIUM  
**Imports**: `FileText`, `Target`, `Focus`, `Hash`, `Sparkles` from lucide-react  
**Status**: All 5 icons are imported but **never used** in the component

```jsx
import { Search, Sparkles, FileText, Target, Focus, Hash } from "lucide-react";
```

**Used icons**: Only `Search` is used (line 192)  
**Unused icons**: `Sparkles`, `FileText`, `Target`, `Focus`, `Hash`

**Fix**: Remove the unused imports:
```jsx
import { Search } from "lucide-react";
```

---

### 3. ResultsGrid.jsx - Line 1
**File**: [src/components/finder/ResultsGrid.jsx](src/components/finder/ResultsGrid.jsx#L1)  
**Severity**: 🟡 LOW  
**Import**: `React` from "react"  
**Status**: Unused - Modern React with JSX transform doesn't require React import for JSX

```jsx
import React from "react";
```

**Fix**: Remove this line as JSX is automatically transpiled by Vite

---

### 4. Layout.jsx - Line 1
**File**: [src/Layout.jsx](src/Layout.jsx#L1)  
**Severity**: 🟡 LOW  
**Import**: `React` from "react"  
**Status**: Unused - Modern React with JSX transform doesn't require React import for JSX

```jsx
import React from "react";
```

**Fix**: Remove this line as JSX is automatically transpiled by Vite

---

### 5. JournalCard.jsx - Line 1
**File**: [src/components/finder/JournalCard.jsx](src/components/finder/JournalCard.jsx#L1)  
**Severity**: 🟡 LOW  
**Import**: `React` from "react"  
**Status**: Unused - Modern React with JSX transform doesn't require React import for JSX

```jsx
import React from "react";
```

**Fix**: Remove this line as JSX is automatically transpiled by Vite

---

### 6. SavedSearchesList.jsx - Line 1
**File**: [src/components/finder/SavedSearchesList.jsx](src/components/finder/SavedSearchesList.jsx#L1)  
**Severity**: 🟡 LOW  
**Import**: `React` from "react"  
**Status**: Unused - Modern React with JSX transform doesn't require React import for JSX

```jsx
import React from "react";
```

**Fix**: Remove this line as JSX is automatically transpiled by Vite

---

### 7. SaveSearchDialog.jsx - Line 1
**File**: [src/components/finder/SaveSearchDialog.jsx](src/components/finder/SaveSearchDialog.jsx#L1)  
**Severity**: 🟡 LOW  
**Import**: `React` from "react"  
**Status**: Unused - Modern React with JSX transform doesn't require React import for JSX

```jsx
import React, { useState } from "react";
```

**Fix**: Remove React from this import:
```jsx
import { useState } from "react";
```

---

### 8. UserNotRegisteredError.jsx - Line 1
**File**: [src/components/UserNotRegisteredError.jsx](src/components/UserNotRegisteredError.jsx#L1)  
**Severity**: 🟡 LOW  
**Import**: `React` from "react"  
**Status**: Unused - Modern React with JSX transform doesn't require React import for JSX

```jsx
import React from 'react';
```

**Fix**: Remove this line as JSX is automatically transpiled by Vite

---

### 9. BrowseJournals.jsx - Line 1
**File**: [src/pages/BrowseJournals.jsx](src/pages/BrowseJournals.jsx#L1)  
**Severity**: 🟡 LOW  
**Import**: `React` from "react"  
**Status**: Unused - Modern React with JSX transform doesn't require React import for JSX

```jsx
import React, { useState, useEffect } from "react";
```

**Fix**: Remove React from this import:
```jsx
import { useState, useEffect } from "react";
```

---

### 10. main.jsx - Line 1
**File**: [src/main.jsx](src/main.jsx#L1)  
**Severity**: 🟡 LOW  
**Import**: `React` from "react"  
**Status**: Unused - Modern React with JSX transform doesn't require React import for JSX

```jsx
import React from 'react'
```

**Fix**: Remove this line as JSX is automatically transpiled by Vite

---

## UNUSED EXPORTS

### 11. utils.js - Line 9
**File**: [src/lib/utils.js](src/lib/utils.js#L9)  
**Severity**: 🟡 LOW  
**Export**: `isIframe`  
**Status**: Exported but never imported or used anywhere in the codebase

```jsx
export const isIframe = window.self !== window.top;
```

**Usage**: Grep search found 0 imports of `isIframe` anywhere in the project

**Fix**: Either:
1. Remove the export if it's not needed
2. Use it somewhere in the application

---

## VERIFIED AS CORRECT (NOT DEAD CODE)

✅ **hooks/use-mobile.jsx** - The `useIsMobile` hook is actually used in [src/components/ui/sidebar.jsx](src/components/ui/sidebar.jsx#L6)

✅ **All other React hooks and state variables** - All useState and useEffect calls are properly used

✅ **All icons in JournalCard.jsx** - `ExternalLink`, `TrendingUp`, `Users` are all used

✅ **All icons in SavedSearchesList.jsx** - `Trash2`, `Play`, `BookmarkIcon` are all used

✅ **All icons in BrowseFilters.jsx** - `Search`, `Filter`, `SortAsc` are all used

✅ **All icons in ResultsGrid.jsx** - `ArrowLeft`, `Search`, `Bookmark` are all used

✅ **All icons in JournalFinder.jsx** - `Search`, `Sparkles`, `Bookmark` are all used

---

## Recommendations by Priority

### 🔴 CRITICAL (Fix Immediately)
1. **Fix PageNotFound.jsx** - Remove or properly define `isFetched` and `authData` variables (Lines 28-30)

### 🟡 MEDIUM
2. **Fix SearchForm.jsx** - Remove unused icon imports: `Sparkles, FileText, Target, Focus, Hash` (Line 7)

### 🟢 LOW (Code Cleanup)
3. **Remove unnecessary React imports** - Clean up 7 files with unused React imports (a common issue with ESM/Vite setup)
4. **Consider removing `isIframe` export** - If not planned for future use, remove from utils.js

---

## Impact Assessment

| Issue | Impact | Effort to Fix |
|-------|--------|---------------|
| PageNotFound undefined vars | 🔴 CRITICAL - Runtime error | 5 min |
| SearchForm unused imports | 🟡 MEDIUM - Code clutter | 2 min |
| Unused React imports (7 files) | 🟢 LOW - Bundle size impact | 5 min |
| Unused isIframe export | 🟢 LOW - None | 1 min |

---

## File-by-File Cleanup Checklist

- [ ] PageNotFound.jsx - Fix undefined variables
- [ ] SearchForm.jsx - Remove 5 unused icon imports
- [ ] ResultsGrid.jsx - Remove React import
- [ ] Layout.jsx - Remove React import
- [ ] JournalCard.jsx - Remove React import
- [ ] SavedSearchesList.jsx - Remove React import
- [ ] SaveSearchDialog.jsx - Remove React from import, keep useState
- [ ] UserNotRegisteredError.jsx - Remove React import
- [ ] BrowseJournals.jsx - Remove React from import, keep useState/useEffect
- [ ] main.jsx - Remove React import
- [ ] utils.js - Decide on isIframe export
