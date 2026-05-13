import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeClass = 'text-[#8e4e14] font-bold border-b-2 border-[#8e4e14] pb-1 transition-colors duration-300';
  const inactiveClass = 'text-[#534439] font-medium hover:text-[#8e4e14] transition-colors duration-300';

  const navClass = (path, exact = false) =>
    (exact ? pathname === path : pathname.startsWith(path)) ? activeClass : inactiveClass;

  return (
    <header className="bg-[#f7f9ff] fixed top-0 w-full z-50">
      <nav className="relative grid grid-cols-[auto_1fr_auto] items-center w-full px-4 sm:px-8 py-4 max-w-screen-2xl mx-auto">
        <div className="text-2xl font-bold text-[#091d2e] flex items-center gap-2 justify-self-start whitespace-nowrap">
          <button className="flex items-center gap-2" onClick={() => navigate('/')} type="button">
            <span
              className="material-symbols-outlined text-[#8e4e14]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              pets
            </span>
            All4Animal
          </button>
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center space-x-8 md:flex">
          <button type="button" className={navClass('/', true)} onClick={() => navigate('/')}>홈</button>
          <button type="button" className={navClass('/animals')} onClick={() => navigate('/animals')}>동물 목록</button>
          <button type="button" className={navClass('/reviews')} onClick={() => navigate('/reviews')}>입양 후기</button>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 justify-self-end">
          <button
            className="flex items-center gap-2 bg-surface-container-low px-3 py-2 lg:px-4 rounded-full hover:scale-95 transition-all"
            onClick={() => navigate('/profile')}
            type="button"
            aria-label="프로필"
          >
            <span className="material-symbols-outlined text-[#8e4e14]">account_circle</span>
            <span className="hidden whitespace-nowrap text-sm font-semibold lg:inline">{username || '프로필'}</span>
          </button>
          <button
            className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-3 py-2 lg:px-4 rounded-full hover:bg-red-100 hover:text-red-800 hover:scale-95 transition-all"
            onClick={logout}
            type="button"
            aria-label="로그아웃"
          >
            <span className="material-symbols-outlined text-red-600">logout</span>
            <span className="hidden whitespace-nowrap text-sm font-semibold lg:inline">로그아웃</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
