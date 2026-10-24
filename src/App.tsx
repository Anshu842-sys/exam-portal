import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DepartmentManagement } from './pages/admin/DepartmentManagement';
import { SubjectManagement } from './pages/admin/SubjectManagement';
import { FacultyManagement } from './pages/admin/FacultyManagement';
import { StudentManagement } from './pages/admin/StudentManagement';
import { RoomManagement } from './pages/admin/RoomManagement';
import { ExamManagement } from './pages/admin/ExamManagement';
import { MarksVerification } from './pages/admin/MarksVerification';
import { ReportsPage } from './pages/admin/ReportsPage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { AssignedExams } from './pages/faculty/AssignedExams';
import { FacultyMarksEntry } from './pages/faculty/FacultyMarksEntry';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentResults } from './pages/student/StudentResults';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentAIAssistant } from './pages/student/StudentAIAssistant';

// Common Pages
import { NotificationsPage } from './pages/NotificationsPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const MainRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/login';
  });

  // Sync route with window hash for bookmarking and history support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        setCurrentPath(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  // Default redirect when auth status changes
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (currentPath !== '/login') {
          navigate('/login');
        }
      } else {
        if (currentPath === '/login' || currentPath === '/') {
          if (user?.role === 'admin') navigate('/admin/dashboard');
          else if (user?.role === 'faculty') navigate('/faculty/dashboard');
          else navigate('/student/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner label="Initializing Exam Cell Management System..." />
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  // Role validation helper
  const isAuthorized = (path: string): boolean => {
    if (!user) return false;
    if (path.startsWith('/admin') && user.role !== 'admin') return false;
    if (path.startsWith('/faculty') && user.role !== 'faculty') return false;
    if (path.startsWith('/student') && user.role !== 'student') return false;
    return true;
  };

  // Render Page Content based on currentPath
  const renderContent = () => {
    if (!isAuthorized(currentPath)) {
      return (
        <UnauthorizedPage
          onGoBack={() => {
            if (user?.role === 'admin') navigate('/admin/dashboard');
            else if (user?.role === 'faculty') navigate('/faculty/dashboard');
            else navigate('/student/dashboard');
          }}
        />
      );
    }

    switch (currentPath) {
      // Admin Routes
      case '/admin/dashboard':
        return <AdminDashboard onNavigate={navigate} />;
      case '/admin/departments':
        return <DepartmentManagement />;
      case '/admin/subjects':
        return <SubjectManagement />;
      case '/admin/faculty':
        return <FacultyManagement />;
      case '/admin/students':
        return <StudentManagement />;
      case '/admin/rooms':
        return <RoomManagement />;
      case '/admin/exams':
        return <ExamManagement />;
      case '/admin/marks':
        return <MarksVerification />;
      case '/admin/reports':
        return <ReportsPage />;

      // Faculty Routes
      case '/faculty/dashboard':
        return <FacultyDashboard onNavigate={navigate} />;
      case '/faculty/exams':
        return <AssignedExams />;
      case '/faculty/marks':
        return <FacultyMarksEntry />;

      // Student Routes
      case '/student/dashboard':
        return <StudentDashboard onNavigate={navigate} />;
      case '/student/exams':
      case '/student/timetable':
        return <StudentTimetable />;
      case '/student/results':
        return <StudentResults />;
      case '/student/profile':
        return <StudentProfile />;
      case '/student/assistant':
        return <StudentAIAssistant />;

      // Common Routes
      case '/notifications':
        return <NotificationsPage />;

      default:
        // Default route fallback based on role
        if (user?.role === 'admin') return <AdminDashboard onNavigate={navigate} />;
        if (user?.role === 'faculty') return <FacultyDashboard onNavigate={navigate} />;
        return <StudentDashboard onNavigate={navigate} />;
    }
  };

  return (
    <AppLayout currentPath={currentPath} onNavigate={navigate}>
      {renderContent()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainRouter />
      </NotificationProvider>
    </AuthProvider>
  );
}
