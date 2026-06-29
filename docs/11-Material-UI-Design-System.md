# Material UI Design System

Project Name: AI Invoice & Receipt Intake Assistant

Version: 1.0

Design Framework:
Material Design 3 (M3)

UI Library:
Material UI (MUI) v7

Prepared By:
UI/UX Design Team

Status:
Draft

---

# Table of Contents

1. Design Philosophy
2. Design Principles
3. Brand Identity
4. Color System
5. Typography
6. Layout System
7. Spacing System
8. Elevation
9. Iconography
10. Responsive Design
11. Accessibility
12. Theme Configuration
13. Component Guidelines
14. Dashboard Layout
15. Future Enhancements

---

# 1. Design Philosophy

The application follows Google's Material Design 3 guidelines while adapting the interface for finance professionals and business users.

The primary objectives are:

• Simplicity

• Consistency

• Accessibility

• Productivity

• Minimal Learning Curve

The interface should feel modern, clean, and professional without overwhelming users.

---

# 2. Design Principles

## Clarity

Information should be easy to scan and understand.

---

## Consistency

All screens use the same spacing, typography, color system, and component behavior.

---

## Feedback

Every user action receives immediate visual feedback.

Examples

- Upload Progress
- Success Snackbar
- Error Alert
- Loading Skeleton
- Processing Badge

---

## Accessibility

Every component must support:

- Keyboard navigation
- Screen readers
- Focus indicators
- High contrast
- WCAG 2.1 AA compliance

---

## Performance

Components should minimize unnecessary rendering and support virtualization for large datasets.

---

# 3. Brand Identity

## Brand Personality

Professional

Reliable

Modern

AI-Powered

Minimal

---

## Logo Usage

Primary Logo

Horizontal

Secondary Logo

Square

Icon

Monochrome

---

## Brand Voice

Confident

Helpful

Professional

Friendly

---

# 4. Color System

## Primary Palette

Primary

#1976D2

Primary Light

#42A5F5

Primary Dark

#1565C0

---

## Secondary Palette

Secondary

#7B1FA2

Secondary Light

#BA68C8

Secondary Dark

#6A1B9A

---

## Success

#2E7D32

---

## Warning

#ED6C02

---

## Error

#D32F2F

---

## Info

#0288D1

---

## Neutral Scale

Gray 50

#FAFAFA

Gray 100

#F5F5F5

Gray 200

#EEEEEE

Gray 300

#E0E0E0

Gray 400

#BDBDBD

Gray 500

#9E9E9E

Gray 600

#757575

Gray 700

#616161

Gray 800

#424242

Gray 900

#212121

---

## Semantic Colors

Processing

Blue

Completed

Green

Rejected

Red

Manual Review

Orange

Draft

Gray

---

# Dark Theme

Background

#121212

Surface

#1E1E1E

Card

#252525

Border

#333333

Primary

#90CAF9

# 5. Typography

Font Family

Roboto

Fallback

System Sans

---

## Display

Display Large

57px

Display Medium

45px

Display Small

36px

---

## Headings

H1

32px

H2

28px

H3

24px

H4

20px

H5

18px

H6

16px

---

## Body

Body Large

16px

Body Medium

14px

Body Small

12px

---

## Labels

Button

14px

Caption

12px

Badge

11px

Table Header

13px

---

## Font Weights

Regular

400

Medium

500

SemiBold

600

Bold

700

---

## Line Heights

Display

64px

Heading

40px

Body

24px

---

# 6. Layout System

Maximum Content Width

1440px

---

Container Padding

Desktop

32px

Tablet

24px

Mobile

16px

---

Grid System

12 Columns

8px Base Grid

---

Sidebar Width

Expanded

280px

Collapsed

72px

---

Header Height

72px

---

Footer Height

64px

---

# 7. Spacing System

Base Unit

8px

Spacing Scale

4

8

12

16

24

32

40

48

64

96

128

---

Component Padding

Button

16px × 24px

Card

24px

Dialog

32px

Form

24px

Table Cell

16px


# 8. Elevation

Level 0

Flat

---

Level 1

Cards

---

Level 2

App Bar

---

Level 3

Dialogs

---

Level 4

Navigation Drawer

---

Level 5

Modals

---

Shadows follow Material Design defaults.

---

# 9. Iconography

Primary Icon Set

Material Symbols Rounded

Secondary

Lucide Icons

---

Icon Sizes

16px

20px

24px

32px

48px

---

Common Icons

Upload

Download

Search

Settings

Delete

Edit

Notification

Dashboard

Analytics

Export

Billing

User

Organization

AI

OCR

---

# 10. Responsive Design

Breakpoints

xs

0

sm

600

md

900

lg

1200

xl

1536

---

Desktop

Sidebar

Top Navigation

Multi-column Layout

---

Tablet

Collapsible Sidebar

Responsive Grid

---

Mobile

Bottom Navigation

Single Column

Floating Actions

---

# Responsive Rules

Cards stack vertically.

Tables become horizontally scrollable.

Charts resize automatically.

Dialogs switch to full-screen on mobile.


# 11. Accessibility

Target Standard

WCAG 2.1 AA

---

Requirements

Keyboard Navigation

Visible Focus

Screen Reader Labels

ARIA Attributes

Contrast Ratio

Minimum 4.5:1

---

Forms

Error messages linked to inputs.

Labels always visible.

Required fields indicated.

---

Tables

Keyboard accessible.

Sortable columns announce state.

---

Charts

Alternative text.

Data tables.

Color-independent meaning.

---

# 12. Theme Configuration

Theme Mode

Light

Dark

System

---

Border Radius

Small

6px

Medium

10px

Large

16px

Extra Large

24px

---

Transitions

Fast

150ms

Normal

250ms

Slow

350ms

---

Animation

Fade

Slide

Grow

Collapse

Skeleton Loading

```

Example Theme

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976D2"
    },
    secondary: {
      main: "#7B1FA2"
    }
  },
  shape: {
    borderRadius: 10
  }
});
```

---

# 13. Component Guidelines

## Buttons

Variants

Contained

Outlined

Text

FAB

Icon Button

---

Sizes

Small

Medium

Large

---

States

Default

Hover

Focused

Pressed

Disabled

Loading

---

## Text Fields

Outlined

Filled

Password

Search

Textarea

---

Validation

Success

Warning

Error

Helper Text

---

## Cards

Invoice Card

Analytics Card

Summary Card

Subscription Card

---

## Tables

Sticky Header

Sorting

Filtering

Pagination

Column Resize

Virtualization

Bulk Selection

---

## Dialogs

Confirmation

Delete

Upload

Settings

Invite User

---

## Snackbar

Success

Warning

Error

Information

---

## Chips

Status

Category

Priority

Vendor

Plan

---

## Badges

Unread Notifications

Queue Count

Subscription Usage

---

## Progress Indicators

Linear Progress

Circular Progress

Skeleton Loader

Upload Progress

---

# 14. Dashboard Layout

Structure

```text
+------------------------------------------------------+
| Top App Bar                                          |
+-------------+----------------------------------------+
| Sidebar     | Dashboard Header                       |
|             +----------------------------------------+
|             | KPI Cards                              |
|             +----------------------------------------+
|             | Charts             | Recent Activity   |
|             +--------------------+-------------------+
|             | Invoice Table                          |
|             +----------------------------------------+
```

---

Dashboard Widgets

- Total Invoices
- Processed Today
- Pending Review
- Monthly Expenses
- AI Accuracy
- OCR Success Rate
- Subscription Usage
- Recent Uploads
- Vendor Breakdown
- Expense Categories

---

# 15. Figma Structure

Pages

01 Foundations

02 Components

03 Patterns

04 Dashboard

05 Authentication

06 Invoice Module

07 Settings

08 Admin

09 Mobile

10 Prototype

---

# 16. Design Tokens

Colors

Typography

Spacing

Border Radius

Elevation

Opacity

Transitions

Z-Index

Breakpoints

---

# 17. Motion Guidelines

Animation Duration

Fast

150ms

Normal

250ms

Slow

350ms

---

Use Motion For

Drawer

Dialogs

Snackbars

Cards

Page Transitions

Loading

Avoid excessive animation during data-heavy workflows.

---

# 18. UI Quality Checklist

✓ Responsive

✓ Accessible

✓ Keyboard Friendly

✓ Consistent Typography

✓ Material Design 3 Compliant

✓ Dark Mode Support

✓ Error States

✓ Loading States

✓ Empty States

✓ Success States

✓ Offline States

✓ Mobile Friendly

---

# Document Summary

This Material UI Design System establishes a consistent visual language for the AI Invoice & Receipt Intake Assistant. It defines branding, color palettes, typography, spacing, responsive behavior, accessibility requirements, design tokens, component usage, and dashboard layout guidelines to ensure a cohesive, scalable, and accessible user experience across the entire application.

---

# Version History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Complete Material UI Design System |

---

# Approval

| Role | Status |
|------|--------|
| UI/UX Lead | Approved |
| Product Designer | Pending |
| Frontend Lead | Pending |
| Accessibility Reviewer | Pending |
| Product Owner | Pending |
