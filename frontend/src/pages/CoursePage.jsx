import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronRight, Clock, ArrowLeft, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCourseById, getLessonStreamUrl } from '../api/courseApi';

function getDifficultyClass(d) {
  if (d === 'Beginner')     return 'badge badge-beginner';
  if (d === 'Intermediate') return 'badge badge-intermediate';
  return 'badge badge-advanced';
}

function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeLesson, setActiveLesson] = useState(null); // { moduleId, lessonId, title, duration }
  const [lessonContent, setLessonContent] = useState('');
  const [streaming, setStreaming]     = useState(false);
  const [openModules, setOpenModules] = useState({});
  const [doneLessons, setDoneLessons] = useState(new Set());

  const eventSourceRef = useRef(null);

  // Fetch course on mount
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await getCourseById(id);
        setCourse(data.course);
        // Open all modules by default
        const open = {};
        data.course.modules.forEach((m) => { open[m.moduleId] = true; });
        setOpenModules(open);
        // Auto-select first lesson
        const firstMod = data.course.modules[0];
        if (firstMod?.lessons?.length) {
          const fl = firstMod.lessons[0];
          setActiveLesson({ moduleId: firstMod.moduleId, moduleTitle: firstMod.title, ...fl });
        }
      } catch {
        toast.error('Could not load course.');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
    return () => eventSourceRef.current?.close();
  }, [id]);

  // Stream lesson content when activeLesson changes
  const streamLesson = useCallback((lesson) => {
    if (!lesson) return;

    // Close any existing stream
    eventSourceRef.current?.close();
    setLessonContent('');
    setStreaming(true);

    const url = getLessonStreamUrl(id, lesson.lessonId);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.text) {
        setLessonContent((prev) => prev + data.text);
      }
      if (data.done) {
        setStreaming(false);
        setDoneLessons((prev) => new Set([...prev, lesson.lessonId]));
        es.close();
      }
    };

    es.onerror = () => {
      setStreaming(false);
      toast.error('Failed to load lesson content.');
      es.close();
    };
  }, [id]);

  useEffect(() => {
    if (activeLesson) streamLesson(activeLesson);
  }, [activeLesson?.lessonId]);

  const toggleModule = (moduleId) => {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading course…</span>
      </div>
    );
  }

  return (
    <div className="course-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: 14 }}
            onClick={() => navigate('/courses')}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="sidebar-title">{course.title}</div>
          <span className={getDifficultyClass(course.difficulty)}>{course.difficulty}</span>
        </div>

        {course.modules.map((mod) => (
          <div key={mod.moduleId} className="module-group">
            <button
              className="module-title-btn"
              onClick={() => toggleModule(mod.moduleId)}
            >
              {mod.title}
              {openModules[mod.moduleId]
                ? <ChevronDown size={13} />
                : <ChevronRight size={13} />}
            </button>

            {openModules[mod.moduleId] && mod.lessons.map((lesson) => {
              const isActive = activeLesson?.lessonId === lesson.lessonId;
              const isDone   = doneLessons.has(lesson.lessonId);
              return (
                <div
                  key={lesson.lessonId}
                  className={`lesson-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                  onClick={() => {
                    if (!isActive) {
                      setActiveLesson({ moduleId: mod.moduleId, moduleTitle: mod.title, ...lesson });
                    }
                  }}
                >
                  <div className="lesson-dot" />
                  {lesson.title}
                </div>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Lesson Viewer */}
      <section className="lesson-viewer">
        {activeLesson ? (
          <>
            {/* Breadcrumb */}
            <div className="lesson-breadcrumb">
              <BookOpen size={13} />
              <span>{activeLesson.moduleTitle}</span>
              <ChevronRight size={12} />
              {activeLesson.title}
            </div>

            {/* Title */}
            <div className="lesson-title-row">
              <h1 className="lesson-title">{activeLesson.title}</h1>
            </div>

            {/* Meta */}
            <div className="lesson-meta">
              <div className="lesson-duration">
                <Clock size={13} />
                {activeLesson.duration}
              </div>
              {streaming && (
                <div className="generating-banner">
                  <span className="pulse-dot" />
                  Generating lesson content…
                </div>
              )}
            </div>

            {/* Content */}
            <div className="lesson-content">
              {lessonContent ? (
                <>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {lessonContent}
                  </ReactMarkdown>
                  {streaming && <span className="typing-cursor" />}
                </>
              ) : (
                <div className="loading-screen">
                  <div className="spinner" />
                  <span>Generating lesson content…</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👈</div>
            <h3>Select a lesson</h3>
            <p>Pick any lesson from the sidebar to begin learning.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default CoursePage;
