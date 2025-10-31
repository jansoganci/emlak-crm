# Bolt.new Remediation Plan – Architecture & Color Compliance

Purpose: Turn the audit report into a precise, executable plan Bolt can follow to bring the codebase to full compliance with our Global Instructions (modular UI, centralized COLORS, templates, and consistency).

Scope: src/ directory (all TS/TSX files)

Overall strategy
- Execute in phases to minimize risk: P1 (Colors), P2 (Reusable components), P3 (Consistency gaps), P4 (Template extraction).
- Keep changes isolated, commit per phase, and re-run a quick audit after each phase.

---

## Phase 1 – Critical Color Fixes (Highest ROI, Low Risk)

Goal: Eliminate hard-coded color usage and enforce COLORS across the worst offenders.

Instructions for Bolt (apply in order):

1) Reminders.tsx – Replace all hardcoded colors with COLORS
- File: src/features/reminders/Reminders.tsx
- Changes (examples; repeat for every instance):
  - `border-gray-100 bg-white/80` → `${COLORS.border.light} ${COLORS.card.bgBlur}`
  - `text-gray-500` → `${COLORS.muted.textLight}`
  - `text-gray-600` → `${COLORS.gray.text600}`
  - `text-gray-700` → `${COLORS.gray.text700}`
  - `text-gray-300` → `${COLORS.text.light}`
  - `bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800` → `${COLORS.success.bgGradient} ${COLORS.success.bgGradientHover}`
  - Slate badge `bg-slate-600 text-white` → `${COLORS.reminders.scheduled}` (or `${COLORS.primary.bg}` if using blue)
  - Info box: `bg-slate-50 border-slate-200 text-slate-*` → use `${COLORS.info.bgLight}` and matching text/border from COLORS
  - Expired section: replace all gray/orange direct classes with COLORS equivalents

2) Contracts – Replace orange/gray hardcodes
- File: src/features/contracts/Contracts.tsx
- File: src/features/contracts/ContractDialog.tsx
- Examples:
  - `bg-orange-50/50` → `${COLORS.warning.bgLight}/50`
  - `text-gray-500` → `${COLORS.muted.textLight}`
  - `text-gray-700` → `${COLORS.gray.text700}`
  - `text-orange-600` icons/text → `${COLORS.warning.text}`

3) PhotoUpload – Fix template literal bug + colors
- File: src/components/properties/PhotoUpload.tsx
- Fix broken template literal:
  - BROKEN: ``border-${COLORS.primary.DEFAULT}``
  - FIX: ``${COLORS.border.DEFAULT_class} hover:${COLORS.border.dark} ${COLORS.gray.bg50}``
- Replace remaining `text-gray-*`, `bg-gray-*`, `border-gray-*` with COLORS equivalents.

4) Tenants – Gray text/icons to COLORS
- File: src/features/tenants/Tenants.tsx
- Replace all `text-gray-400/500/600/700` with `${COLORS.muted.textLight}` or `${COLORS.gray.text[600|700]}` appropriately.

5) Sidebar overlay tints to COLORS
- File: src/components/layout/Sidebar.tsx
- `bg-black/50` → create/use `${COLORS.card.bg}/50` overlay (or add specific OVERLAY constant in COLORS if needed)
- `bg-white/20` and `hover:bg-white/20` → `${COLORS.card.bg}/20` and `hover:${COLORS.card.bg}/20`

Acceptance criteria (Phase 1)
- No hex/rgb/hsl or Tailwind color utilities remain in modified files; all come from COLORS.
- Build passes; visuals unchanged or improved.

---

## Phase 2 – Reuse Existing Components (EmptyState, TableActionButtons)

Goal: Remove duplicated UI patterns by using already-created shared components.

Instructions for Bolt:

1) Replace Empty States with EmptyState component
- Files and ranges to update:
  - Properties.tsx: lines ~208–225
  - Owners.tsx: lines ~154–171
  - Tenants.tsx: lines ~202–219
  - Contracts.tsx: lines ~260–277
  - Reminders.tsx: multiple instances (empty states in each tab)
- Pattern:
  - BEFORE: Card + centered icon/title/description with gray classes
  - AFTER:
    ```tsx
    <EmptyState
      title="Title"
      description="Description"
      icon={<Bell className={`h-16 w-16 ${COLORS.muted.text}`} />}
      actionLabel="Add Item"
      onAction={handleAdd}
      showAction={!searchQuery}
    />
    ```

2) Replace per-row table action buttons with TableActionButtons
- Files:
  - Properties.tsx, Owners.tsx, Tenants.tsx, Contracts.tsx
- Replace the repeated TooltipProvider + Button blocks with:
  ```tsx
  <TableActionButtons
    onEdit={() => handleEdit(item)}
    onDelete={() => handleDelete(item)}
    onView={optionalHandler}
  />
  ```
- Ensure hover states use COLORS via the shared component.

Acceptance criteria (Phase 2)
- All empty states use EmptyState component.
- All action button groups use TableActionButtons.
- LOC reduction (~300+ lines) with no lost functionality.

---

## Phase 3 – Consistency Fixes

Goal: Close remaining gaps noted by the audit.

Instructions for Bolt:

1) PageContainer for Login
- File: src/features/auth/Login.tsx
- Wrap page content with `<PageContainer>` to align with other pages (or justify exclusion in a comment if intentionally different).

2) Reminders Tabs compliance
- Ensure TabsTrigger neon effects are active-state only and COLORS-aware (Change #5)
- Standardize tab badge colors via `${COLORS.reminders}` values (overdue/upcoming/scheduled/expired)

3) Button component compliance
- Verify Change #1 (neon) and Change #3 (outline) use COLORS (already marked PASS). Re-confirm no stray hardcoded colors.

Acceptance criteria (Phase 3)
- All main pages use PageContainer (or documented exception).
- Reminders tabs meet Change #5 spec and COLORS usage.

---

## Phase 4 – Template Extraction (ListPageTemplate)

Goal: Eliminate large-scale duplication across list pages using a shared template.

Instructions for Bolt:

1) Create `src/components/templates/ListPageTemplate.tsx`
- Props (from audit recommendation): `title, items, loading, searchQuery, onSearchChange, filterValue, onFilterChange, filterOptions, onAdd, addButtonLabel, emptyState, renderTableHeaders, renderTableRow, deleteDialog`
- Include hooks for filter/search wiring and consistent layout, and surface slots for custom content.

2) Refactor list pages to use the template
- Files: Properties.tsx, Owners.tsx, Tenants.tsx, Contracts.tsx
- Migrate repeated blocks (search input with icon, filter dropdown, add button, loading card, empty state, table structure, delete dialog) into the template usage.

Acceptance criteria (Phase 4)
- ~800 LOC duplication eliminated.
- All 4 list pages share a unified structure with minimal page-local code.

---

## Global Constraints (apply in every phase)
- Do NOT introduce hex/rgb/hsl/Tailwind color utilities in components; always use `${COLORS.*}` or helpers from colors.ts
- Keep TypeScript strict and typed props for all components
- Maintain visual parity or improvements; no regressions
- Commit per phase with clear messages; re-run audit after each phase

---

## “Apply Fixes” Prompt Blocks (copy/paste to Bolt)

### Apply P1 – Colors
"""
Apply Phase 1 fixes exactly as specified in remediation_plan.md.
Target files: Reminders.tsx, Contracts.tsx, ContractDialog.tsx, PhotoUpload.tsx, Tenants.tsx, Sidebar.tsx.
Replace ALL hardcoded colors with COLORS equivalents. Fix the PhotoUpload template literal.
Do not skip any instance. Keep behavior and layout unchanged.
"""

### Apply P2 – Reusable Components
"""
Apply Phase 2 fixes exactly as specified in remediation_plan.md.
Replace empty states with EmptyState and per-row action clusters with TableActionButtons across the listed files.
Ensure all colors/classes come from COLORS or component-internal helpers.
"""

### Apply P3 – Consistency
"""
Apply Phase 3 fixes exactly as specified in remediation_plan.md.
Add PageContainer to Login (or document intended exception). Ensure Reminders tabs are COLORS-aware and match Change #5.
"""

### Apply P4 – Template Extraction
"""
Create ListPageTemplate.tsx and refactor the four list pages to use it, following the props and structure in remediation_plan.md.
Keep functionality identical, reduce duplication, and ensure COLORS usage throughout.
"""

---

## Acceptance Checklist (final)
- [ ] All colors consolidated under COLORS, no hardcoded color utilities remain
- [ ] EmptyState and TableActionButtons used everywhere applicable
- [ ] PageContainer used on all main pages (or exception documented)
- [ ] Reminders tabs: active neon + standardized badges via COLORS
- [ ] Button neon/outline variants are COLORS-aware
- [ ] List pages refactored to template (or scheduled if deferred)
- [ ] Build passes; manual smoke test on all pages


