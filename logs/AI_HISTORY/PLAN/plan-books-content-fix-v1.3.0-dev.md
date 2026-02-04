# Book Intelligence Report Data Fixes

Fix the "no relevant data" issue in book reports by implementing actual text extraction and allowing agents to analyze real book content instead of just titles.

## User Review Required

> [!IMPORTANT]
> - New dependencies (`pdf-parse`, `mammoth`) will be installed to handle file extraction.
> - The `books` database schema will be modified to include a `content` TEXT column.
> - Initial transcription might take time for large files.

## Proposed Changes

### Database Schema

#### [MODIFY] [init-db.js](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/scripts/migrate/init-db.js)
- Add `content` TEXT column to the `books` table definition.

### Backend - Text Extraction

#### [NEW] [extractor.js](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/src/utils/extractor.js)
- Implement `extractTextFromFile` using `pdf-parse` and `mammoth`.

#### [MODIFY] [books.routes.js](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/src/routes/books.routes.js)
- Implement `GET /api/books/:id/content` to return extracted text.
- Update `POST /scan` and `POST /` to trigger text extraction when a book is added.

### AI Agents

#### [MODIFY] [index.js (Agents)](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/src/agents/index.js)
- Update `runReaderAgent`, `runExtractorAgent`, and `runPhrasesAgent` to fetch book content.
- Update prompts to include book content for higher relevance.

### Dashboard Frontend

#### [MODIFY] [Books.jsx](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/dashboard/src/pages/Books.jsx)
- Enhance the Intelligence Report modal to show multiple card types (Key Points, Quotes) alongside the Summary.

## Verification Plan

### Automated Tests
- `npm run test:unit src/utils/extractor.test.js` (to be created)

### Manual Verification
- Upload a PDF/DOCX or scan the existing ones.
- Check the `books` table (`sqlite3`) to confirm the `content` column is populated.
- Run a "Reader" task and verify the summary is more detailed and relevant.
- Open the Intelligence Report and verify it shows the new sections.
