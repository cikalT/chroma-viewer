# Chroma DB Viewer - Implementation Plan

## Overview

A beautiful, functional web-based viewer for Chroma DB collections. Connect to any Chroma instance, browse records, search semantically, and filter by metadata.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** (App Router) | Full-stack React framework |
| **TypeScript** | Type safety |
| **shadcn/ui** | UI component library |
| **Tailwind CSS** | Styling |
| **TanStack Table** | Data table with sorting, filtering, pagination |
| **chromadb** | Official Chroma client (server-side) |
| **Zod** | Schema validation |
| **nuqs** | URL state management |
| **sonner** | Toast notifications |

## Project Structure

```
chroma-viewer/
├── app/
│   ├── page.tsx                    # Main viewer page
│   ├── settings/page.tsx           # Connection settings
│   ├── layout.tsx                  # Root layout with providers
│   ├── globals.css                 # Tailwind + custom styles
│   └── api/
│       ├── collections/route.ts    # List collections
│       ├── records/route.ts        # Get records (paginated)
│       ├── search/route.ts         # Text & semantic search
│       └── metadata/route.ts       # Get metadata schema
├── components/
│   ├── data-table/
│   │   ├── data-table.tsx          # Main table component
│   │   ├── columns.tsx             # Column definitions
│   │   ├── pagination.tsx          # Pagination controls
│   │   └── row-actions.tsx         # Row action buttons
│   ├── filters/
│   │   ├── filter-bar.tsx          # Filter container
│   │   ├── filter-chip.tsx         # Individual filter chip
│   │   └── advanced-filter.tsx     # Raw JSON filter editor
│   ├── search/
│   │   ├── search-bar.tsx          # Search input + mode toggle
│   │   └── search-mode-toggle.tsx  # Text vs Semantic toggle
│   ├── connection/
│   │   ├── connection-form.tsx     # Host/port input form
│   │   ├── connection-status.tsx   # Status indicator
│   │   └── collection-selector.tsx # Collection dropdown
│   ├── record/
│   │   ├── record-detail.tsx       # Expanded record view
│   │   ├── document-cell.tsx       # Truncated document display
│   │   └── metadata-badges.tsx     # Metadata key-value badges
│   └── ui/                         # shadcn components
├── lib/
│   ├── chroma.ts                   # Chroma client wrapper
│   ├── utils.ts                    # Utility functions
│   ├── validations.ts              # Zod schemas
│   └── hooks/
│       ├── use-connection.ts       # Connection state hook
│       └── use-chroma.ts           # Chroma query hooks
├── types/
│   └── index.ts                    # TypeScript types
└── public/
    └── favicon.ico
```

## Features

### 1. Connection Management

- **No environment variables required** - fully UI-configured
- User enters Host and Port on settings page
- Connection stored in localStorage
- Passed to API routes via headers: `X-Chroma-Host`, `X-Chroma-Port`
- Recent connections saved for quick switching
- Connection status indicator (green/red dot)

### 2. Collection Browser

- Dropdown selector populated from `/api/collections`
- Shows collection name + record count
- Auto-selects first collection on initial load

### 3. Data Table

- **Columns:** ID, Document (truncated), Metadata (badges), Actions
- **Server-side pagination:** 10/25/50/100 per page
- **Sorting:** By ID, metadata fields, distance (search results)
- **Expandable rows:** Full document, all metadata, raw embedding
- **Copy buttons:** On ID, document, metadata

### 4. Search

**Two modes:**

1. **Text Search**
   - Filters documents containing the search text
   - Uses Chroma's `where_document: { $contains: query }`

2. **Semantic Search**
   - Finds similar documents by meaning
   - Uses Chroma's `query({ queryTexts: [query] })`
   - Shows distance/similarity score

**"Find Similar" button** on each row - searches using that record's embedding

### 5. Metadata Filtering

- **Auto-discovery:** Scans collection to detect available fields
- **Filter types:** equals, not equals, greater than, less than, in list
- **Filter chips:** Visual representation of active filters
- **Advanced mode:** Raw JSON editor for Chroma's `where` clause

### 6. Export

- Download current view as JSON or CSV
- Respects current filters and search

## API Design

### `GET /api/collections`

**Headers:** `X-Chroma-Host`, `X-Chroma-Port`

**Response:**
```json
{
  "collections": [
    { "name": "my-docs", "count": 1234 },
    { "name": "embeddings", "count": 567 }
  ]
}
```

### `GET /api/records`

**Headers:** `X-Chroma-Host`, `X-Chroma-Port`

**Query Params:**
- `collection` (required)
- `page` (default: 1)
- `pageSize` (default: 10)
- `sortBy` (optional)
- `sortOrder` (asc/desc)
- `where` (JSON string, optional)
- `whereDocument` (JSON string, optional)

**Response:**
```json
{
  "records": [
    {
      "id": "doc-1",
      "document": "Hello world...",
      "metadata": { "type": "text", "source": "api" },
      "embedding": [0.1, 0.2, ...]
    }
  ],
  "total": 1234,
  "page": 1,
  "pageSize": 10
}
```

### `POST /api/search`

**Headers:** `X-Chroma-Host`, `X-Chroma-Port`

**Body:**
```json
{
  "collection": "my-docs",
  "query": "machine learning",
  "type": "semantic",
  "limit": 10,
  "where": {}
}
```

**Response:**
```json
{
  "results": [...],
  "distances": [0.123, 0.456, ...]
}
```

### `GET /api/metadata`

**Headers:** `X-Chroma-Host`, `X-Chroma-Port`

**Query Params:** `collection`

**Response:**
```json
{
  "fields": [
    { "name": "type", "type": "string", "sampleValues": ["text", "pdf", "html"] },
    { "name": "pageCount", "type": "number", "sampleValues": [1, 5, 10] }
  ]
}
```

## UI/UX Design

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Chroma Viewer    [Collection ▼]  [🌙]  [⚙️ Settings]   │
├─────────────────────────────────────────────────────────────┤
│  ● Connected to localhost:8000                              │
│  Collection: my-docs (1,234 records)                        │
├─────────────────────────────────────────────────────────────┤
│  Search: [________________________] [Text|Semantic] [🔍]    │
│  Filters: [type = "text" ×] [+ Add Filter] [Advanced]       │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-10 of 456 filtered (1,234 total)    [Export ▼]   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ID      │ Document           │ Metadata       │ Actions ││
│  │─────────│────────────────────│────────────────│─────────││
│  │ doc-1   │ "Hello world..."   │ type: text     │ [≋] [📋]││
│  │         │                    │ source: api    │         ││
│  │─────────│────────────────────│────────────────│─────────││
│  │ doc-2   │ "Another doc..."   │ type: pdf      │ [≋] [📋]││
│  │         │                    │ pages: 5       │         ││
│  └─────────────────────────────────────────────────────────┘│
│  [< Prev]  Page 1 of 46  [Next >]      [10 ▼] per page     │
└─────────────────────────────────────────────────────────────┘
```

### Visual Design

- **Dark mode by default** with light mode toggle
- **Monospace font** for IDs, JSON, embeddings
- **Syntax highlighting** for JSON in advanced filter and expanded views
- **Color-coded metadata badges:**
  - String: blue
  - Number: green
  - Boolean: purple
  - Array: orange
- **Smooth animations** for hover states, transitions, loading
- **Skeleton loaders** instead of spinners

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Esc` | Clear search/filters |
| `←` `→` | Previous/Next page |
| `Enter` | Execute search |

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Invalid host/port | Error toast, stay on settings |
| Connection lost | Banner with retry button |
| Timeout (10s) | "Server not responding" message |
| No collections | "No collections found" empty state |
| Empty collection | "No records" empty state |
| No search results | "No matches" empty state |
| Invalid filter JSON | Inline validation error |

## Implementation Steps

### Phase 1: Project Setup
1. Initialize Next.js 14 with TypeScript
2. Install and configure Tailwind CSS
3. Install and configure shadcn/ui
4. Set up project structure (folders, types)

### Phase 2: Connection & API
5. Create Chroma client wrapper (`lib/chroma.ts`)
6. Implement `/api/collections` route
7. Implement `/api/records` route
8. Implement `/api/search` route
9. Implement `/api/metadata` route
10. Add Zod validation for all routes

### Phase 3: Core UI
11. Create connection form component
12. Create settings page
13. Create collection selector
14. Create basic data table with TanStack Table
15. Add pagination controls
16. Add sorting functionality

### Phase 4: Search & Filters
17. Create search bar with mode toggle
18. Implement text search
19. Implement semantic search
20. Add "Find Similar" row action
21. Create filter bar with auto-discovery
22. Create filter chip components
23. Implement advanced JSON filter editor

### Phase 5: Polish
24. Add expanded row view
25. Add document/metadata copy buttons
26. Implement export (JSON/CSV)
27. Add dark/light mode toggle
28. Add keyboard shortcuts
29. Add loading skeletons
30. Add toast notifications
31. Add connection status indicator
32. Responsive adjustments

### Phase 6: Final
33. Error handling polish
34. Testing with real Chroma instance
35. README documentation
36. Final cleanup

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "chromadb": "^1.8.0",
    "@tanstack/react-table": "^8.11.0",
    "nuqs": "^1.17.0",
    "zod": "^3.22.0",
    "sonner": "^1.3.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## Notes

- **No environment variables required** for Chroma connection - fully UI-driven
- **Public-ready** - deploy anywhere, users bring their own Chroma
- **Server-side Chroma client** - avoids CORS issues
- **URL state** with nuqs - shareable filtered views
