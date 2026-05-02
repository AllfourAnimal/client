function HeartButton({ isFavorited, onToggle }) {
  return (
    <button
      className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
    >
      <span
        className={`material-symbols-outlined transition-colors ${
          isFavorited ? 'text-red-500' : 'text-on-surface-variant hover:text-red-500'
        }`}
        style={{
          fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        }}
      >
        favorite
      </span>
    </button>
  );
}

export default HeartButton;
