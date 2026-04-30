import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container mt-4 fade-in">
                <Dashboard />
              </div>
            </>
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container mt-4 fade-in">
                <Projects />
              </div>
            </>
          </ProtectedRoute>
        } />

        <Route path="/projects/:id/tasks" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container mt-4 fade-in">
                <Tasks />
              </div>
            </>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
