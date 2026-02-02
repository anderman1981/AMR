/**
 * Form Extractor Utility
 * Extracts interactive forms and questions from book content using Ollama AI
 */

/**
 * Extracts forms from book text using Ollama
 * @param {string} text - Book content text
 * @param {string} bookName - Name of the book
 * @returns {Promise<Array>} Array of extracted forms
 */
export async function extractFormsFromText(text, bookName) {
  try {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3'

    // Build prompt for form extraction
    const prompt = `Analyze the following book content and identify any interactive forms, worksheets, reflection questions, or exercises.

Book: "${bookName}"

Content:
${text.substring(0, 8000)}

For each form/worksheet found, extract:
1. A descriptive title for the form
2. The page/section reference (if mentioned)
3. All questions or prompts

Format your response as a JSON array like this:
[
  {
    "title": "Form Title",
    "pageNumber": 10,
    "questions": [
      {"id": "q1", "text": "Question text?", "type": "text"},
      {"id": "q2", "text": "Another question?", "type": "text"}
    ]
  }
]

Question types can be: "text", "textarea", "yes_no", "rating", "multiple_choice"

If no forms are found, return an empty array: []

IMPORTANT: Return ONLY valid JSON, no additional text.`

    // Call Ollama API
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more consistent JSON
          num_predict: 2000
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.response

    // Parse the AI response
    return parseFormQuestions(aiResponse)

  } catch (error) {
    console.error('Error extracting forms:', error)
    throw error
  }
}

/**
 * Parses AI response into structured form objects
 * @param {string} aiResponse - Raw AI response
 * @returns {Array} Parsed forms array
 */
function parseFormQuestions(aiResponse) {
  try {
    // Try to extract JSON from the response
    // Sometimes AI adds extra text, so we look for JSON array
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
    
    if (!jsonMatch) {
      console.warn('No JSON array found in AI response')
      return []
    }

    const forms = JSON.parse(jsonMatch[0])
    
    // Validate and normalize the structure
    return forms.map((form, idx) => ({
      title: form.title || `Formulario ${idx + 1}`,
      pageNumber: form.pageNumber || null,
      questions: (form.questions || []).map((q, qIdx) => ({
        id: q.id || `q${qIdx + 1}`,
        text: q.text || '',
        type: q.type || 'text'
      }))
    })).filter(form => form.questions.length > 0)

  } catch (error) {
    console.error('Error parsing form questions:', error)
    console.error('AI Response:', aiResponse)
    return []
  }
}

/**
 * Validates form structure
 * @param {Object} form - Form object to validate
 * @returns {boolean} True if valid
 */
export function validateForm(form) {
  return (
    form &&
    typeof form.title === 'string' &&
    Array.isArray(form.questions) &&
    form.questions.length > 0 &&
    form.questions.every(q => q.id && q.text)
  )
}
