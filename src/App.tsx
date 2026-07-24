import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/globals.css';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import LeitnerDemo from './components/Leitner/LeitnerDemo';
import LeccionesIndex from './components/Lecciones/LeccionesIndex';
import CapituloDetail from './components/Lecciones/CapituloDetail';
import FlashcardBrowser from './components/Flashcards/FlashcardBrowser';
import QuizBrowser from './components/Quiz/QuizBrowser';
import ExamBrowser from './components/Exam/ExamBrowser';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('fitness-trainer:darkMode');
    if (saved) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('fitness-trainer:darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
          <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />

          <main className="flex-1 p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/lecciones" element={<LeccionesIndex />} />
              <Route path="/lecciones/:capitulo_id" element={<CapituloDetail />} />
              <Route path="/flashcards" element={<FlashcardBrowser />} />
              <Route path="/quiz" element={<QuizBrowser />} />
              <Route path="/exam" element={<ExamBrowser />} />
              <Route path="/leitner-demo" element={<LeitnerDemo />} />
            </Routes>
          </main>

          <footer className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <p>FitnesstrainerB Exam Study App</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
