const express = require('express');
const router = express.Router();
const {
  generateCourse,
  getAllCourses,
  getCourseById,
  streamLessonContent,
  deleteCourse,
} = require('../controllers/courseController');

router.post('/generate', generateCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.get('/:courseId/lessons/:lessonId/stream', streamLessonContent);
router.delete('/:id', deleteCourse);

module.exports = router;
