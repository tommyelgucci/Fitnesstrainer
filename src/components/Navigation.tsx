import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

interface NavigationProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Navigation({ darkMode, setDarkMode }: NavigationProps) {
  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <span className="hidden font-bold text-gray-900 dark:text-white sm:inline">
            FitnessB Exam
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ul className="hidden flex-1 items-center gap-6 md:flex md:ml-8">
            <li>
              <Link to="/" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/lecciones" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Lecciones
              </Link>
            </li>
            <li>
              <Link to="/flashcards" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
                Flashcards
              </Link>
            </li>
            <li>
              <Link to="/quiz" className="text-gray-700 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400">
                Quiz
              </Link>
            </li>
            <li>
              <Link to="/exam" className="text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400">
                Examen
              </Link>
            </li>
          </ul>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
