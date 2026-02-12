import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { 
  Bell, Search, LogOut, Menu, User,
  LayoutDashboard, Users, GraduationCap, BookOpen, Award, Calendar, Settings 
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active, badge, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`
      group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200
      ${active 
        ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
    `}
  >
    <div className="flex items-center space-x-3">
      <Icon size={20} className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge && (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${active ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
        {badge}
      </span>
    )}
  </Link>
);

const Navbar = () => {
  const { isAuthenticated, user, logout, message, clearMessage, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.innerWidth >= 768;
    }
    return false;
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      clearMessage();
    }
  }, [message, clearMessage]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        document.body.style.transition = 'padding-left 300ms ease-in-out';
        document.body.style.paddingLeft = isSidebarOpen ? '18rem' : '0';
      } else {
        document.body.style.paddingLeft = '0';
        document.body.style.transition = 'none';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.paddingLeft = '0';
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsSidebarOpen(false);
  };

  const getNavLinks = () => {
    const role = user?.role?.toUpperCase();
    const links = [];
    
    if (role) {
      links.push({ icon: LayoutDashboard, label: "Dashboard", path: `/${role === 'ADMIN' ? 'admin' : role === 'FACULTY' ? 'faculty' : 'student'}/dashboard` });
    }

    if (role === 'ADMIN') {
      links.push(
        { icon: Users, label: "Students", path: "/students" },
        { icon: GraduationCap, label: "Faculty", path: "/facultys" },
        { icon: BookOpen, label: "Courses", path: "/courses" },
        { icon: Award, label: "Performance", path: "/performance" },
        { icon: Calendar, label: "Events", path: "/events", badge: "3" },
        { icon: Settings, label: "Settings", path: "/settings" }
      );
    } else if (role === 'FACULTY') {
      links.push(
        { icon: Users, label: "Students", path: "/students" },
        { icon: BookOpen, label: "Courses", path: "/courses" },
        { icon: Calendar, label: "Events", path: "/events" }
      );
    } else if (role === 'STUDENT') {
      links.push(
        { icon: BookOpen, label: "Courses", path: "/courses" },
        { icon: Award, label: "Performance", path: "/performance" },
        { icon: Calendar, label: "Events", path: "/events" }
      );
    }
    return links;
  };

  const navLinks = getNavLinks();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavItemClick = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-6 md:px-8 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <button 
              onClick={toggleSidebar}
              className={`
                text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-300 ease-in-out focus:outline-none overflow-hidden
                ${isSidebarOpen ? 'w-0 p-0 opacity-0' : 'w-10 p-2 opacity-100'}
              `}
            >
              <Menu size={24} /> 
            </button> 
          )}
          <div className="h-10 w-10 bg-linear-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <Link  className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hover:text-indigo-600 transition-colors">
              SmartSMS
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              School Management
            </p>
          </Link>
        </div>

        {/* Right Section - User Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <button className="relative p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>

              {/* Divider */}
              <div className={`hidden md:block w-px bg-slate-200 transition-all duration-300 ${isSidebarOpen ? 'h-0 opacity-0' : 'h-8 opacity-100'}`}></div>

              {/* User Info */}
              <div className={`
                hidden md:flex items-center space-x-3 bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100
                transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap
                ${isSidebarOpen ? 'max-w-0 px-0 opacity-0 border-0' : 'max-w-75 px-4 py-2 opacity-100'}
              `}>
                <div className="relative shrink-0">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=6366f1&color=fff`}
                    alt="Profile" 
                    className="h-9 w-9 rounded-xl ring-2 ring-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 truncate">
                    {user?.name}
                  </span>
                  <span className="text-xs text-slate-500">{user?.role || 'User'}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`
                  flex items-center space-x-2 bg-linear-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 
                  transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap
                  ${isSidebarOpen ? 'max-w-0 px-0 opacity-0' : 'max-w-37.5 px-4 py-2.5 opacity-100'}
                `}
              >
                <LogOut size={18} className="shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {location.pathname !== '/login' && (
                <Link 
                  to="/login" 
                  className="flex items-center space-x-2 bg-linear-to-r from-indigo-600 to-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  <User size={18} />
                  <span>Login</span>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>

    {/* Sidebar Overlay */}
    {isSidebarOpen && (
      <div 
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}

    {/* Sidebar */}
    <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          <div className="flex items-center justify-between mb-6 px-2">
             <span className="text-xl font-bold text-slate-800">Menu</span>
             <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
               <LogOut size={20} className="rotate-180"/>
             </button>
          </div>

          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Main Menu</p>
          
          {navLinks.map((link) => (
            <SidebarItem 
              key={link.label}
              icon={link.icon} 
              label={link.label} 
              to={link.path}
              active={location.pathname === link.path}
              badge={link.badge}
              onClick={handleNavItemClick}
            />
          ))}
        </nav>

        {/* User Profile Section */}
        {isAuthenticated && (
          <div className="absolute bottom-0 w-full p-4 bg-linear-to-t from-white to-transparent">
            <div className="bg-linear-to-br from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100 mb-3 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=6366f1&color=fff`}
                    alt="Profile" 
                    className="h-12 w-12 rounded-xl ring-2 ring-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'user@school.com'}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 p-3 text-red-500 bg-red-100 hover:text-red-600 hover:bg-red-200 transition-all w-full rounded-xl group"
            >
              <LogOut size={18} className="group-hover:animate-pulse" />
              <span className="font-medium text-sm">Log Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Navbar;