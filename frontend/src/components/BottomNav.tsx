import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Sword, RotateCcw, BarChart2 } from 'lucide-react';
import './BottomNav.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: Home,       label: 'Trang chủ',  id: 'nav-home' },
  { path: '/learn',     icon: BookOpen,   label: 'Học',        id: 'nav-learn' },
  { path: '/practice',  icon: Sword,      label: 'Luyện tập', id: 'nav-practice' },
  { path: '/review',    icon: RotateCcw,  label: 'Ôn tập',    id: 'nav-review' },
  { path: '/progress',  icon: BarChart2,  label: 'Tiến độ',   id: 'nav-progress' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map(({ path, icon: Icon, label, id }) => {
        const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
        return (
          <button
            key={path}
            id={id}
            className={`bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
          >
            <Icon size={22} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
