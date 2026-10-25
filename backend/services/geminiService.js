const { GoogleGenAI } = require('@google/genai');

// Helper to get initialized Gemini client using current process.env
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend/.env');
  }
  return new GoogleGenAI({ apiKey });
};

// Models with fallback for high demand
const MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
].filter(Boolean);

/**
 * Generate a full course structure (outline) from a user prompt.
 * Returns a structured JSON object.
 */
const generateCourseStructure = async (prompt, difficulty = 'Beginner') => {
  const ai = getGeminiClient();

  const systemInstruction = `You are an expert curriculum designer. 
Generate a structured course outline in valid JSON format only. 
No markdown fences, no explanations — only raw JSON.`;

  const userInput = `Create a detailed course outline for the following topic: "${prompt}"
Difficulty level: ${difficulty}

Return ONLY a JSON object with this exact structure:
{
  "title": "Course Title",
  "description": "A brief 2-3 sentence description of the course",
  "modules": [
    {
      "moduleId": "m1",
      "title": "Module Title",
      "lessons": [
        {
          "lessonId": "m1l1",
          "title": "Lesson Title",
          "duration": "estimated duration like 10 min"
        }
      ]
    }
  ]
}

Generate 3-5 modules, each with 2-4 lessons. Make titles specific and educational.`;

  let lastError;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userInput,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      console.warn(`generateCourseStructure with model ${model} failed:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError;
};

/**
 * Generate detailed lesson content for a specific lesson.
 * Streams the response via SSE.
 */
const generateLessonContentStream = async (courseTitle, moduleTitle, lessonTitle, difficulty, res) => {
  const ai = getGeminiClient();

  const userInput = `You are an expert teacher creating a detailed lesson for an online course.

Course: "${courseTitle}"
Module: "${moduleTitle}"  
Lesson: "${lessonTitle}"
Difficulty: ${difficulty}

Write a comprehensive lesson covering:
1. **Introduction** - What this lesson covers and why it matters
2. **Core Concepts** - Explain the key ideas clearly with examples
3. **Code Examples** - Provide practical, well-commented code examples (use proper markdown code blocks with language labels)
4. **Common Mistakes** - List 2-3 mistakes beginners make and how to avoid them
5. **Practice Exercise** - Give one hands-on exercise for the student to try

Use clear markdown formatting. Make it engaging, educational, and practical.`;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let streamStarted = false;
  let lastError;

  for (const model of MODELS) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: userInput,
      });

      for await (const chunk of responseStream) {
        streamStarted = true;
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    } catch (error) {
      console.warn(`generateLessonContentStream with model ${model} failed:`, error.message || error);
      lastError = error;
      if (streamStarted) {
        break;
      }
    }
  }

  res.write(`data: ${JSON.stringify({ error: lastError?.message || 'Error generating lesson content' })}\n\n`);
  res.end();
};

module.exports = { generateCourseStructure, generateLessonContentStream };
