const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  title:    { type: String, required: true },
  duration: { type: String, default: '10 min' },
  content:  { type: String, default: '' }, // generated on-demand
});

const ModuleSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  title:    { type: String, required: true },
  lessons:  [LessonSchema],
});

const CourseSchema = new mongoose.Schema({
  prompt:      { type: String, required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  difficulty:  { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  modules:     [ModuleSchema],
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', CourseSchema);
