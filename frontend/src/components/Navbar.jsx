import { NavLink } from 'react-router-dom';
import { BookOpen, Library } from 'lucide-react';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <NavLink to="/" className="navbar-brand">
          <div className="navbar-logo">📚</div>
          Course<span className="accent">AI</span>
        </NavLink>

        <div className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <BookOpen size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Build
          </NavLink>
          <NavLink
            to="/courses"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Library size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            My Courses
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
