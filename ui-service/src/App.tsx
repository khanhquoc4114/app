import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Todo from "./pages/Todo";

export default function App() {
  return (
    <Router>
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <Link to="/login">Login</Link> | <Link to="/todos">Todos</Link>
      </nav>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/todos" element={<Todo />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
