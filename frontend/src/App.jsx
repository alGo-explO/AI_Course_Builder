import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CoursePage from './pages/CoursePage';
import MyCoursesPage from './pages/MyCoursesPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/courses"     element={<MyCoursesPage />} />
        <Route path="/course/:id"  element={<CoursePage />} />
      </Routes>
    </>
  );
}

export default App;
