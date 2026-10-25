import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const generateCourse = (prompt, difficulty) =>
  API.post('/courses/generate', { prompt, difficulty });

export const getAllCourses = () => API.get('/courses');

export const getCourseById = (id) => API.get(`/courses/${id}`);

export const deleteCourse = (id) => API.delete(`/courses/${id}`);

export const getLessonStreamUrl = (courseId, lessonId) =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses/${courseId}/lessons/${lessonId}/stream`;
