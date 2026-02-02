import fs from 'fs/promises'
import path from 'path'
import { createRequire } from 'module'
import mammoth from 'mammoth'

const require = createRequire(import.meta.url)
const pdf = require('pdf-parse')

/**
 * Extracts text from various document formats (PDF, DOCX, TXT)
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  
  try {
    const dataBuffer = await fs.readFile(filePath)
    
    if (ext === '.pdf') {
      const data = await pdf(dataBuffer)
      return data.text
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer: dataBuffer })
      return result.value
    } else if (ext === '.txt') {
      return dataBuffer.toString('utf8')
    } else {
      throw new Error(`Unsupported file format for extraction: ${ext}`)
    }
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error)
    throw error
  }
}
