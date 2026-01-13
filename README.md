# Chroma Viewer

A modern web UI for browsing and exploring ChromaDB vector database collections.

![Chroma Viewer Screenshot](./public/screenshot.png)

## Features

- **Connection Management**: Connect to any ChromaDB instance via host and port
- **Collection Browser**: View all collections with record counts
- **Record Viewer**: Browse records with pagination support
- **Text Search**: Search documents by content with text matching
- **Semantic Search**: Find similar documents using vector embeddings
- **Metadata Filtering**: Filter records by metadata fields with support for multiple operators
- **Advanced Filters**: Edit raw Chroma where clauses as JSON
- **Record Details**: View full document content, metadata, and embeddings
- **Find Similar**: One-click semantic search to find related documents
- **Data Export**: Export records to JSON or CSV format
- **Dark Mode**: Full dark/light theme support
- **Keyboard Shortcuts**: Navigate efficiently with keyboard shortcuts

## Getting Started

### Prerequisites

- Node.js 18.x or later
- A running ChromaDB instance

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/chroma-viewer.git
cd chroma-viewer

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start the production server
npm start
```

## How to Use

### Connect to ChromaDB

1. When you first open the app, you'll be redirected to the Settings page
2. Enter your ChromaDB host (e.g., `localhost`) and port (e.g., `8000`)
3. Click "Test Connection" to verify connectivity
4. Click "Connect" to save your connection

### Browse Collections

1. Select a collection from the dropdown in the header
2. View records in the paginated table
3. Use the page size selector to adjust records per page
4. Navigate between pages using the pagination controls

### Search Records

1. Enter a search term in the search bar
2. Toggle between Text search and Semantic search:
   - **Text Search**: Finds documents containing the exact text
   - **Semantic Search**: Finds semantically similar documents using embeddings
3. Click the search button or press Enter to search
4. Click "Clear search" to return to browsing mode

### Filter Records

1. Click "Add Filter" to create a new filter
2. Select a metadata field, operator, and value
3. Add multiple filters to narrow down results
4. Click "Advanced" to edit filters as raw JSON
5. Click "Clear all" to remove all filters

### View Record Details

1. Click the menu icon on any row
2. Select "View Details" to see the full record
3. View the complete document, metadata, and embedding
4. Use the "Copy" buttons to copy values to clipboard

### Find Similar Documents

1. Click the menu icon on any row
2. Select "Find Similar" to search for semantically similar documents
3. Results are ranked by similarity (distance shown)

### Export Data

1. Click the "Export" button above the table
2. Choose JSON or CSV format
3. The file will download with the current view's data

### Keyboard Shortcuts

- `/` - Focus the search bar
- `Esc` - Clear search and filters
- `Left Arrow` - Previous page
- `Right Arrow` - Next page

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **Data Tables**: [TanStack Table](https://tanstack.com/table)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database Client**: [ChromaDB](https://www.trychroma.com/) JavaScript client
- **Validation**: [Zod](https://zod.dev/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

## Project Structure

```
chroma-viewer/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── collections/   # Collections endpoint
│   │   ├── records/       # Records endpoint
│   │   ├── search/        # Search endpoint
│   │   └── metadata/      # Metadata endpoint
│   ├── settings/          # Settings page
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── connection/       # Connection-related components
│   ├── data-table/       # Table components
│   ├── filters/          # Filter components
│   ├── record/           # Record display components
│   ├── search/           # Search components
│   └── layout/           # Layout components
├── lib/                   # Utilities and hooks
│   ├── hooks/            # Custom React hooks
│   ├── chroma.ts         # ChromaDB client utilities
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # General utilities
└── types/                 # TypeScript types
```

## License

MIT License - see [LICENSE](LICENSE) for details.
