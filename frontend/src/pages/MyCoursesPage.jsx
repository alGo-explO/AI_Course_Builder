import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllCourses, deleteCourse } from '../api/courseApi';

function getDifficultyClass(d) {
  if (d === 'Beginner')     return 'badge badge-beginner';
  if (d === 'Intermediate') return 'badge badge-intermediate';
  return 'badge badge-advanced';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const { data } = await getAllCourses();
      setCourses(data.courses);
    } catch {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c._id !== id));
      toast.success('Course deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading your courses…</span>
      </div>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">My Courses</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>
            <Plus size={15} /> New Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses yet</h3>
            <p>Head back to the home page and generate your first AI course.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <Plus size={16} /> Create a Course
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => {
              const totalLessons = course.modules?.reduce(
                (acc, m) => acc + (m.lessons?.length || 0), 0
              ) || 0;

              return (
                <div
                  key={course._id}
                  className="course-card fade-in"
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  <div className="course-card-header">
                    <h3 className="course-card-title">{course.title}</h3>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => handleDelete(e, course._id)}
                      title="Delete course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="course-card-desc">{course.description}</p>

                  <div className="course-card-meta">
                    <span className={getDifficultyClass(course.difficulty)}>
                      {course.difficulty}
                    </span>
                    <div className="course-card-stats">
                      <BookOpen size={13} />
                      {course.modules?.length || 0} modules · {totalLessons} lessons
                    </div>
                    <div className="course-card-stats">
                      <Clock size={13} />
                      {timeAgo(course.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyCoursesPage;
