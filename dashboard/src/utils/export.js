/**
 * Export book analysis to Markdown format
 * Generates a downloadable .md file with book summary, insights, and quotes
 */

export function exportBookToMarkdown(book, cards) {
  // Get different types of cards
  const summary = cards.find(c => c.type === 'summary')?.content || 'No summary available'
  const keyPoints = cards.filter(c => c.type === 'key_points')
  const quotes = cards.filter(c => c.type === 'quotes')
  
  // Generate markdown content
  const markdown = `# ${book.name}

**Categoría**: ${book.category}  
**Formato**: ${book.format.toUpperCase()}  
**Procesado**: ${new Date(book.created_at).toLocaleDateString()}  
**Exportado**: ${new Date().toLocaleDateString()}

---

## 📖 Resumen

${summary}

---

${keyPoints.length > 0 ? `## 💡 Insights Clave

${keyPoints.map(card => card.content).join('\n\n')}

---

` : ''}${quotes.length > 0 ? `## 💬 Citas Memorables

${quotes.map(card => card.content).join('\n\n')}

---

` : ''}
## 📊 Metadata

- **ID**: ${book.id}
- **Tamaño**: ${(book.size / 1024 / 1024).toFixed(2)} MB
- **Total de análisis**: ${cards.length} cards generadas
- **Procesado con**: AMROIS v1.0

---

*Exportado desde AMROIS - Sistema de Gestión Inteligente de Biblioteca Personal*  
*https://amrois.com*
`.trim()

  return markdown
}

export function downloadMarkdown(book, cards) {
  const markdown = exportBookToMarkdown(book, cards)
  
  // Create blob and download
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${book.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function exportBookToPDF(book, cards) {
  // TODO: Implement PDF export using jsPDF or similar
  console.log('PDF export not yet implemented')
}

export function exportBookToJSON(book, cards) {
  const data = {
    book: {
      id: book.id,
      name: book.name,
      category: book.category,
      format: book.format,
      created_at: book.created_at
    },
    analysis: {
      summary: cards.find(c => c.type === 'summary')?.content,
      key_points: cards.filter(c => c.type === 'key_points').map(c => c.content),
      quotes: cards.filter(c => c.type === 'quotes').map(c => c.content)
    },
    metadata: {
      total_cards: cards.length,
      exported_at: new Date().toISOString(),
      exported_from: 'AMROIS v1.0'
    }
  }
  
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${book.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
