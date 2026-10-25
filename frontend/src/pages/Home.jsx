import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateCourse } from '../api/courseApi';

const SUGGESTIONS = [
  'Pointers in C++',
  'React Hooks',
  'Machine Learning basics',
  'SQL for beginners',
  'Docker & containers',
  'Async JavaScript',
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

function Home() {
  const [prompt, setPrompt] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a topic to learn.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Generating your course outline…');

    try {
      const { data } = await generateCourse(prompt.trim(), difficulty);
      toast.success('Course created!', { id: toastId });
      navigate(`/course/${data.course._id}`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Try again.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate();
  };

  return (
    <main className="page">
      <div className="container">
        {/* Hero */}
        <section className="hero">
          <div className="hero-tag">
            <Sparkles size={12} />
            Powered by Gemini AI
          </div>
          <h1>
            Learn anything with<br />
            <span className="gradient">AI-generated courses</span>
          </h1>
          <p>
            Type what you want to learn. Get a full course with modules,
            lessons, and explanations — generated in seconds.
          </p>

          {/* Prompt Input */}
          <div className="prompt-card">
            <textarea
              className="prompt-textarea"
              placeholder={'Try "teach me pointers in C++" or "explain React hooks for a beginner"…'}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
            />
            <div className="prompt-footer">
              <div className="difficulty-pills">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    className={`pill ${difficulty === d ? 'active' : ''}`}
                    onClick={() => setDifficulty(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Generating…
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Generate Course
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="suggestions">
            <label>Try:</label>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="suggestion-chip"
                onClick={() => setPrompt(`Teach me ${s}`)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Feature Pills */}
        <section style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 48 }}>
          {[
            { icon: '🧩', label: 'Structured modules' },
            { icon: '💡', label: 'Detailed explanations' },
            { icon: '💻', label: 'Code examples' },
            { icon: '✏️', label: 'Practice exercises' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                padding: '10px 18px', borderRadius: 999,
                fontSize: '0.85rem', color: 'var(--text-secondary)',
              }}
            >
              <span>{icon}</span> {label}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Home;
