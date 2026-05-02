function Navbar({
  activePage,
  isCurrentPage = false,
  onNavigateHome,
  onNavigateAnimalList,
  onNavigateReviews,
  onNavigateProfile,
}) {
  const activeStaticClass = 'text-[#8e4e14] font-bold border-b-2 border-[#8e4e14] pb-1 cursor-default';
  const activeButtonClass = 'text-[#8e4e14] font-bold border-b-2 border-[#8e4e14] pb-1 transition-colors duration-300';
  const inactiveClass = 'text-[#534439] font-medium hover:text-[#8e4e14] transition-colors duration-300';

  const renderNavLink = (page, label, onClick) => {
    if (activePage === page) {
      return isCurrentPage
        ? <span className={activeStaticClass}>{label}</span>
        : <button className={activeButtonClass} onClick={onClick}>{label}</button>;
    }
    return <button className={inactiveClass} onClick={onClick}>{label}</button>;
  };

  return (
    <header className="bg-[#f7f9ff] fixed top-0 w-full z-50">
      <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
        <div className="text-2xl font-bold text-[#091d2e] flex items-center gap-2">
          {activePage === 'home' && isCurrentPage ? (
            <span className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[#8e4e14]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                pets
              </span>
              All4Animal
            </span>
          ) : (
            <button className="flex items-center gap-2" onClick={onNavigateHome}>
              <span
                className="material-symbols-outlined text-[#8e4e14]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                pets
              </span>
              All4Animal
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {renderNavLink('home', '홈', onNavigateHome)}
          {renderNavLink('animal-list', '동물 목록', onNavigateAnimalList)}
          {renderNavLink('review-list', '입양 후기', onNavigateReviews)}
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
          >
            <span className="material-symbols-outlined text-[#8e4e14]">account_circle</span>
            <span className="text-sm font-semibold">프로필</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
