const Course = require('../models/Course');
const { generateCourseStructure, generateLessonContentStream } = require('../services/geminiService');

// POST /api/courses/generate
// Generate a new course from a user prompt
const generateCourse = async (req, res) => {
  try {
    const { prompt, difficulty = 'Beginner' } = req.body;

    if (!prompt || prompt.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide a valid prompt.' });
    }

    // Generate course structure from Gemini
    const courseData = await generateCourseStructure(prompt.trim(), difficulty);

    // Save to DB
    const course = new Course({
      prompt: prompt.trim(),
      title: courseData.title,
      description: courseData.description,
      difficulty,
      modules: courseData.modules,
    });

    await course.save();

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error('generateCourse error:', error.message);
    res.status(500).json({ error: 'Failed to generate course. Please try again.' });
  }
};

// GET /api/courses
// Fetch all saved courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}, 'title description difficulty prompt createdAt modules').sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    console.error('getAllCourses error:', error.message);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

// GET /api/courses/:id
// Fetch a single course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json({ success: true, course });
  } catch (error) {
    console.error('getCourseById error:', error.message);
    res.status(500).json({ error: 'Failed to fetch course.' });
  }
};

// GET /api/courses/:courseId/lessons/:lessonId/stream
// Stream lesson content via SSE
const streamLessonContent = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    // Find the lesson across modules
    let targetLesson = null;
    let targetModule = null;

    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.lessonId === lessonId);
      if (lesson) {
        targetLesson = lesson;
        targetModule = mod;
        break;
      }
    }

    if (!targetLesson) return res.status(404).json({ error: 'Lesson not found.' });

    // If content already exists, return it immediately (no re-generation)
    if (targetLesson.content && targetLesson.content.length > 100) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
      res.write(`data: ${JSON.stringify({ text: targetLesson.content })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }

    // Stream new content from Gemini, then save it
    let fullContent = '';
    const originalWrite = res.write.bind(res);

    // Intercept writes to accumulate content
    res.write = (chunk) => {
      originalWrite(chunk);
      try {
        const str = chunk.toString();
        const match = str.match(/data: (.+)\n\n/);
        if (match) {
          const data = JSON.parse(match[1]);
          if (data.text) fullContent += data.text;
        }
      } catch (_) {}
    };

    const originalEnd = res.end.bind(res);
    res.end = async (...args) => {
      // Save the generated content
      if (fullContent.length > 50) {
        await Course.updateOne(
          { _id: courseId, 'modules.lessons.lessonId': lessonId },
          { $set: { 'modules.$[].lessons.$[lesson].content': fullContent } },
          { arrayFilters: [{ 'lesson.lessonId': lessonId }] }
        );
      }
      originalEnd(...args);
    };

    await generateLessonContentStream(
      course.title,
      targetModule.title,
      targetLesson.title,
      course.difficulty,
      res
    );
  } catch (error) {
    console.error('streamLessonContent error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate lesson content.' });
    }
  }
};

// DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course.' });
  }
};

module.exports = { generateCourse, getAllCourses, getCourseById, streamLessonContent, deleteCourse };
