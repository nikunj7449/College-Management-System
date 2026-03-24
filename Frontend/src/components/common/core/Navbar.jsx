import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/AuthContext';
import {
  Bell, Search, LogOut, Menu, User,
  LayoutDashboard, Users, GraduationCap, BookOpen, Award, Calendar, Settings, Shield, MessageSquare, IndianRupee,
  ClipboardCheck
} from 'lucide-react';

import { ChevronDown, Circle, Check } from 'lucide-react';
import { hasPermission } from '../../../utils/permissionUtils';
import useNotifications from '../../../hooks/useNotifications';

const SidebarItem = ({ icon: Icon, label, to, active, badge, onClick, children, isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const hasActiveChild = children?.some(child => {
    if (child.activePattern) return location.pathname.startsWith(child.activePattern);
    return location.pathname === child.path;
  });

  // Initialize isOpen to true if we're already on a child route, otherwise false
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  // Auto-close dropdown when navigating to a different main tab
  useEffect(() => {
    if (!hasActiveChild) {
      setIsOpen(false);
    }
  }, [location.pathname, hasActiveChild]);

  const isItemActive = active || hasActiveChild;

  const handleToggle = (e) => {
    if (children) {
      // We prevent default navigation when clicking a parent item with a dropdown.
      e.preventDefault();

      if (isSidebarOpen) {
        setIsOpen(!isOpen);
      }
      // If sidebar is closed, we don't open it anymore, we rely on the CSS hover flyout.
    } else {
      onClick?.();
    }
  };

  return (
    <div
      title={!isSidebarOpen && !children ? label : undefined}
      className={`group relative flex flex-col`}
    >
      <Link
        to={to}
        onClick={handleToggle}
        className={`
            flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200
            ${isItemActive && (!children || isSidebarOpen || (!isSidebarOpen && children))
            ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
          `}
      >
        <div className="flex items-center">
          <Icon size={20} className={`${isItemActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors shrink-0`} />
          <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'max-w-40 opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'}`}>
            {label}
          </span>
        </div>

        {isSidebarOpen && (
          <div className="flex items-center transition-opacity duration-300 opacity-100">
            {badge && !children && (
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isItemActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                {badge}
              </span>
            )}
            {children && (
              <ChevronDown
                size={16}
                className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isItemActive ? 'text-indigo-200' : 'text-slate-400'}`}
              />
            )}
          </div>
        )}
      </Link>

      {/* Dropdown Children */}
      {children && (
        <div
          className={`
            ${isSidebarOpen
              ? `overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`
              : `absolute left-full top-0 w-56 pl-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] transform origin-left -translate-x-2 scale-95 group-hover:translate-x-0 group-hover:scale-100`
            }
          `}
        >
          <div className={`${!isSidebarOpen ? 'bg-white rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] ring-1 ring-slate-900/5 relative' : ''}`}>
            {/* Flyout Header With Arrow Pointer - Only visible when collapsed */}
            {!isSidebarOpen && (
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 rounded-t-xl relative z-10">
                <p className="text-xs font-bold text-slate-800 tracking-wider uppercase">{label}</p>
                <div className="absolute top-[18px] -left-[6px] w-[13px] h-[13px] bg-slate-50 border-l border-b border-slate-200/80 transform rotate-45 rounded-bl-[2px]"></div>
              </div>
            )}

            <div className={`${isSidebarOpen ? 'mt-1 mb-2 space-y-1' : 'py-2 px-2 space-y-1'}`}>
              {children.map((child, idx) => {
                const isChildActive = child.activePattern
                  ? location.pathname.startsWith(child.activePattern)
                  : location.pathname === child.path;
                return (
                  <Link
                    key={idx}
                    to={child.path}
                    onClick={(e) => {
                      if (child.label === 'Edit Event' && child.path === '/events') {
                        toast.warning('Please select an event to edit from the list');
                      }
                      onClick?.();
                    }}
                    className={`
                      group/child flex items-center py-2 pr-4 pl-9 rounded-xl text-sm font-medium transition-all duration-300
                      ${isChildActive
                        ? 'text-indigo-700 bg-indigo-50 shadow-sm ring-1 ring-indigo-100/50'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                    `}
                  >
                    {!isSidebarOpen && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 group-hover/child:scale-125 transition-transform" />}
                    {isSidebarOpen && (
                      <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                        <div className={`
                          w-1.5 h-1.5 rounded-full transition-all duration-300
                          ${isChildActive ? 'bg-indigo-600 scale-[1.5] ring-4 ring-indigo-100' : 'bg-slate-300 group-hover/child:bg-slate-400 group-hover/child:scale-110'}
                        `} />
                      </div>
                    )}
                    <span className={`${isChildActive ? 'translate-x-0.5 font-bold' : ''} transition-transform duration-300`}>
                      {child.label}
                    </span>

                    {isChildActive && (
                      <div className="ml-auto opacity-70">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { isAuthenticated, user, logout, message, clearMessage, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(isAuthenticated);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const authPaths = ['/login', '/forgot-password', '/reset-password'];
    if (authPaths.includes(location.pathname)) return false;

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
      const authPaths = ['/login', '/forgot-password', '/reset-password'];
      if (authPaths.includes(location.pathname)) {
        document.body.style.paddingLeft = '0';
        return;
      }
      document.body.style.transition = 'padding-left 300ms ease-in-out';
      if (window.innerWidth >= 768) {
        document.body.style.paddingLeft = isSidebarOpen ? '18rem' : '5rem';
      } else {
        document.body.style.paddingLeft = '5rem';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.paddingLeft = '0';
    };
  }, [isSidebarOpen, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsSidebarOpen(false);
  };

  const getNavLinks = () => {
    const roleName = user?.role?.name?.toUpperCase() || '';
    if (!roleName) return [];

    // Fallback for legacy local storage or missing sidebar configuration
    if (!user?.role?.sidebarConfig || !Array.isArray(user.role.sidebarConfig) || user.role.sidebarConfig.length === 0) {
      const dashboardRole = (roleName === 'ADMIN' || roleName === 'SUPERADMIN') ? 'admin' : (roleName === 'FACULTY' ? 'faculty' : 'student');
      return [{ icon: LayoutDashboard, label: "Dashboard", path: `/${dashboardRole}/dashboard` }];
    }

    const iconMap = {
      'DASHBOARD': LayoutDashboard,
      'STUDENT': Users,
      'FACULTY': GraduationCap,
      'USER_MANAGEMENT': Shield,
      'ROLES_PERMISSIONS': Shield,
      'SYSTEM_MODULES': Shield,
      'COURSE': BookOpen,
      'ATTENDANCE': Calendar,
      'PERFORMANCE': Award,
      'EVENT': Calendar,
      'EXAMS': ClipboardCheck,
      'REMARKS': MessageSquare,
      'FEE_MANAGEMENT': IndianRupee,
      'FEE': IndianRupee,
      'MY_FEES': IndianRupee,
      'PROFILE': User
    };

    const getPath = (key) => {
      if (key === 'DASHBOARD') {
        const dashboardRole = (roleName === 'ADMIN' || roleName === 'SUPERADMIN') ? 'admin' : (roleName === 'FACULTY' ? 'faculty' : 'student');
        return `/${dashboardRole}/dashboard`;
      }
      if (key === 'STUDENT') return roleName === 'FACULTY' ? "/faculty/students" : "/students";
      if (key === 'FACULTY') return roleName === 'STUDENT' ? "/student/faculties" : "/facultys";
      if (key === 'USER_LIST') return "/user-management";
      if (key === 'ROLES_PERMISSIONS') return "/superadmin/roles";
      if (key === 'SYSTEM_MODULES') return "/superadmin/modules";
      if (key === 'COURSE') return roleName === 'FACULTY' ? "/faculty/courses" : roleName === 'STUDENT' ? "/student/courses" : "/courses";
      if (key === 'ATTENDANCE') return roleName === 'FACULTY' ? "/faculty/attendance" : roleName === 'STUDENT' ? "/student/attendance" : "/attendance";
      if (key === 'PERFORMANCE' || key === 'EXAM') return roleName === 'STUDENT' ? "/student/exams" : "/performance";
      if (key === 'EVENT' || key === 'EVENT_VIEW') return roleName === 'STUDENT' ? "/student/events" : "/events";
      if (key === 'EVENT_CREATE') return "/events/add";
      if (key === 'EVENT_UPDATE') {
        const isEditing = location.pathname.startsWith("/events/edit/");
        if (!isEditing) {
          // If we're not already editing, we can return a "dummy" path or handle it via onClick
          return "/events";
        }
        return location.pathname;
      }
      if (key === 'EXAMS') return "/exams";
      if (key === 'REMARKS') return roleName === 'STUDENT' ? "/student/remarks" : "/remarks";
      if (key === 'FEE_CATEGORIES') return "/fees/categories";
      if (key === 'FEE_STRUCTURE') return "/fees/structures";
      if (key === 'STUDENT_FEES') return "/fees/students";
      if (key === 'FEE_REPORTS') return "/fees/reports";
      if (key === 'MY_FEES') return "/student/fees";
      if (key === 'PROFILE') {
        if (roleName === 'FACULTY') return "/faculty/profile";
        if (roleName === 'ADMIN' || roleName === 'SUPERADMIN') return "/admin/profile";
        return "/student/profile";
      }
      return "#";
    };

    const moduleMapping = {
      'STUDENT': 'STUDENT',
      'FACULTY': 'FACULTY',
      'COURSE': 'COURSE',
      'ATTENDANCE': 'ATTENDANCE',
      'PERFORMANCE': 'PERFORMANCE',
      'EVENT': 'EVENT',
      'USER_LIST': 'USER',
      'ROLES_PERMISSIONS': 'ROLE',
      'SYSTEM_MODULES': 'MODULE',
      'EXAMS': 'EXAM',
      'REMARKS': 'REMARK',
      'FEE_CATEGORIES': 'FEE',
      'FEE_STRUCTURE': 'FEE',
      'STUDENT_FEES': 'FEE',
      'FEE_REPORTS': 'FEE'
    };

    const actionMapping = {
      'EVENT_VIEW': 'read',
      'EVENT_CREATE': 'create',
      'EVENT_UPDATE': 'update'
    };

    const sortedConfig = [...user.role.sidebarConfig].sort((a, b) => a.order - b.order);
    const links = [];

    sortedConfig.forEach(item => {
      if (!item.visible) return;

      // Only check parent-level permission if it doesn't have children that might have different permissions
      // For EVENT, it still falls back to parent if child isn't in mapping.
      if (item.key !== 'DASHBOARD' && (!item.children || item.children.length === 0)) {
        const permModule = moduleMapping[item.key];
        if (permModule && !hasPermission(user, permModule, 'read')) {
          // Special exception: Students can always read their own remarks regardless of module permission
          if (!(roleName === 'STUDENT' && item.key === 'REMARKS')) {
            return;
          }
        }
      }

      let linkObj = {
        icon: iconMap[item.key] || LayoutDashboard,
        label: item.label,
        path: getPath(item.key)
      };

      if (item.children && item.children.length > 0) {
        const validChildren = [];
        item.children.forEach(child => {
          if (!child.visible) return;

          const action = actionMapping[child.key] || 'read';
          // Use child's mapped module, fallback to parent's mapped module
          const childModule = moduleMapping[child.key] || moduleMapping[item.key];

          if (childModule && !hasPermission(user, childModule, action)) {
            return;
          }

          let childObj = {
            label: child.label,
            path: getPath(child.key)
          };
          if (child.key === 'EVENT_UPDATE') {
            childObj.activePattern = "/events/edit/";
          }
          validChildren.push(childObj);
        });

        if (validChildren.length > 0) {
          linkObj.children = validChildren;
          links.push(linkObj);
        }
      } else {
        links.push(linkObj);
      }
    });

    if (roleName === 'STUDENT' && !links.find(l => l.label.toUpperCase().includes('REMARK'))) {
      links.push({ icon: MessageSquare, label: "My Remarks", path: "/student/remarks" });
    }

    if (roleName === 'ADMIN' || roleName === 'SUPERADMIN') {
      links.push({ icon: Settings, label: "Settings", path: "/settings" });
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
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-20 flex items-center justify-between px-6 md:px-8 sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-linear-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <Link to={`/${user?.role?.name?.toLowerCase()}/dashboard`} className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight hover:text-indigo-600 transition-colors">
                SmartCMS
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                College Management
              </p>
            </Link>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'text-indigo-600 bg-indigo-50 shadow-inner' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 h-4 min-w-4 flex items-center justify-center bg-rose-500 text-[10px] font-bold text-white rounded-full border-2 border-white px-0.5 transform translate-x-1.5 -translate-y-1.5 shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <>
                      <div
                        className="fixed inset-0 z-50 pointer-events-auto"
                        onClick={() => setShowNotifications(false)}
                      />
                      <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[51] overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => { markAllAsRead(); setShowNotifications(false); }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-[min(400px,70vh)] overflow-y-auto scrollbar-thin">
                          {notifications.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                              <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                              <p className="text-slate-400 text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-50">
                              {notifications.slice(0, 3).map((notif) => (
                                <div
                                  key={notif._id}
                                  onClick={() => {
                                    if (!notif.isRead) markAsRead(notif._id);
                                    if (notif.link) {
                                      navigate(notif.link);
                                      setShowNotifications(false);
                                    }
                                  }}
                                  className={`px-5 py-4 cursor-pointer transition-all hover:bg-slate-50/80 flex gap-3 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                                >
                                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.type === 'FEE' ? 'bg-amber-100 text-amber-600' :
                                    notif.type === 'EXAM' ? 'bg-purple-100 text-purple-600' :
                                      notif.type === 'URGENT' ? 'bg-rose-100 text-rose-600' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    {notif.type === 'FEE' ? <IndianRupee size={18} /> :
                                      notif.type === 'EXAM' ? <Award size={18} /> :
                                        <Bell size={18} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className={`text-xs font-bold truncate ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</p>
                                      {!notif.isRead && <div className="shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-1"></div>}
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{notif.message}</p>
                                    <div className="flex items-center mt-2 gap-2">
                                      <span className="text-[10px] text-slate-400 font-medium">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                      {notif.priority === 'HIGH' && <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">Priority</span>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-center">
                            <button
                              onClick={() => { navigate('/notifications'); setShowNotifications(false); }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                            >
                              View All Notifications
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

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
                    <span className="text-xs text-slate-500">{user?.role?.name || user?.role || 'User'}</span>
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
                {!['/login', '/forgot-password', '/reset-password'].includes(location.pathname) && (
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!['/login', '/forgot-password', '/reset-password'].includes(location.pathname) && (
        <aside className={`
          fixed inset-y-0 left-0 z-50 bg-white shadow-xl
          transition-all duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'w-72 border-r border-slate-200 overflow-hidden' : 'w-20 overflow-visible'}
        `}>

          {/* Navigation */}
          <nav className={`flex-1 px-4 py-6 space-y-1 ${isSidebarOpen ? 'overflow-y-auto overflow-x-hidden' : 'overflow-visible'} scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent`}>
            <div className={`flex items-center mb-6 px-2 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
              {isSidebarOpen && <span className="text-xl font-bold text-slate-800">Menu</span>}
              <button onClick={toggleSidebar} className="p-1 hover:bg-slate-100 rounded-lg shrink-0 text-slate-500 hover:text-slate-800 transition-colors">
                {isSidebarOpen ? <LogOut size={20} className="rotate-180" /> : <Menu size={20} />}
              </button>
            </div>

            {navLinks.map((link) => (
              <SidebarItem
                key={link.label}
                icon={link.icon}
                label={link.label}
                to={link.path}
                active={location.pathname === link.path && !link.children} // Only strictly active if it has no children. Children handle their own active state.
                badge={link.badge}
                onClick={handleNavItemClick}
                children={link.children}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
              />
            ))}
          </nav>

          {/* User Profile Section */}
          {isAuthenticated && (
            <div className="w-full relative h-[152px] border-t border-slate-100 shrink-0 overflow-hidden bg-white">
              <div
                className={`
                  absolute top-0 left-0 w-72 p-4 pb-6 transition-all duration-300 ease-in-out flex flex-col justify-center h-full
                  ${isSidebarOpen ? 'translate-x-0 opacity-100 visible' : '-translate-x-full opacity-0 invisible'}
                `}
              >
                <div className={`bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 mb-3 hover:shadow-md transition-shadow p-4`}>
                  <div className="flex items-center">
                    <div className="relative shrink-0">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=6366f1&color=fff`}
                        alt="Profile"
                        className="h-12 w-12 rounded-xl ring-2 ring-white shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || 'user@school.com'}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center justify-center p-3 text-red-500 bg-red-100 hover:text-red-600 hover:bg-red-200 transition-all rounded-xl group w-full space-x-2`}
                  title="Log Out"
                >
                  <LogOut size={18} className="group-hover:animate-pulse shrink-0" />
                  <span className="font-medium text-sm">Log Out</span>
                </button>
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
};

export default Navbar;