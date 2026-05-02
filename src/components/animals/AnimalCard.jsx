import HeartButton from './HeartButton';

function AnimalCard({ animal, isFavorited, onToggleFavorite, onNavigateAnimalDetails, compact = false }) {
  return (
    <div
      className="bg-surface-container-lowest rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-2 border border-outline-variant/10 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
      onClick={() => onNavigateAnimalDetails(animal.name)}
    >
      <div className={`relative ${compact ? 'h-60' : 'h-72'} overflow-hidden`}>
        <img
          alt={`강아지 ${animal.name}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={animal.src}
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm">
          {animal.status}
        </div>
        <HeartButton isFavorited={isFavorited} onToggle={() => onToggleFavorite(animal.name)} />
      </div>
      <div className="p-6">
        <h3 className={`font-bold text-on-surface mb-2 ${compact ? 'text-xl' : 'text-2xl'}`}>
          {animal.name}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {animal.tags.map((tag) => (
            <span
              key={tag}
              className={`bg-surface-container-low text-on-secondary-container text-xs font-semibold rounded-full ${
                compact ? 'px-2 py-1' : 'px-3 py-1'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        {!compact && (
          <p className="text-on-surface-variant text-sm leading-relaxed">{animal.description}</p>
        )}
      </div>
    </div>
  );
}

export default AnimalCard;
