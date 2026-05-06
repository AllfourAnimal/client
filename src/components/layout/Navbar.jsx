import { useAuth } from '../../context/AuthContext';

function Navbar({
  activePage,
  onNavigateHome,
  onNavigateAnimalList,
  onNavigateReviews,
  onNavigateProfile,
}) {
  const { logout, username } = useAuth();
  const activeButtonClass = 'text-[#8e4e14] font-bold border-b-2 border-[#8e4e14] pb-1 transition-colors duration-300';
  const inactiveClass = 'text-[#534439] font-medium hover:text-[#8e4e14] transition-colors duration-300';

  const renderNavLink = (page, label, onClick) => (
    <button className={activePage === page ? activeButtonClass : inactiveClass} onClick={onClick} type="button">
      {label}
    </button>
  );

  return (
    <header className="bg-[#f7f9ff] fixed top-0 w-full z-50">
      <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
        <div className="text-2xl font-bold text-[#091d2e] flex items-center gap-2">
          <button className="flex items-center gap-2" onClick={onNavigateHome} type="button">
            <span
              className="material-symbols-outlined text-[#8e4e14]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              pets
            </span>
            All4Animal
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {renderNavLink('home', '\uD648', onNavigateHome)}
          {renderNavLink('animal-list', '\uB3D9\uBB3C \uBAA9\uB85D', onNavigateAnimalList)}
          {renderNavLink('review-list', '\uC785\uC591 \uD6C4\uAE30', onNavigateReviews)}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative group">
            <span className="material-symbols-outlined text-[#534439] cursor-pointer p-2 rounded-full hover:bg-surface-container transition-all">
              notifications
            </span>
          </div>
          <button
            className="flex items-center space-x-2 bg-surface-container-low px-4 py-2 rounded-full hover:scale-95 transition-all"
            onClick={onNavigateProfile}
            type="button"
          >
            <span className="material-symbols-outlined text-[#8e4e14]">account_circle</span>
            <span className="text-sm font-semibold">{username || '\uD504\uB85C\uD544'}</span>
          </button>
          <button
            className="flex items-center space-x-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-full hover:bg-red-100 hover:text-red-800 hover:scale-95 transition-all"
            onClick={logout}
            type="button"
          >
            <span className="material-symbols-outlined text-red-600">logout</span>
            <span className="text-sm font-semibold">{'\uB85C\uADF8\uC544\uC6C3'}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
