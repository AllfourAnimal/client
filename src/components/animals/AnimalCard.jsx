import HeartButton from './HeartButton';

const CURRENT_YEAR = new Date().getFullYear();

function getAgeLabel(birthYear) {
  const age = CURRENT_YEAR - birthYear;
  return age >= 1 ? `${age}살` : '1살 미만';
}

function getSexLabel(sex) {
  if (!sex) return '';
  return sex.toUpperCase() === 'MALE' ? '수컷' : '암컷';
}

function AnimalCard({ animal, imageSrc, isFavorited, onToggleFavorite, onNavigateAnimalDetails, compact = false }) {
  const tags = [
    getAgeLabel(animal.animal_age),
    animal.species,
    getSexLabel(animal.animal_sex),
  ].filter(Boolean);

  return (
    <div
      className="bg-surface-container-lowest rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-2 border border-outline-variant/10 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
      onClick={() => onNavigateAnimalDetails(animal.animalId)}
    >
      <div className={`relative ${compact ? 'h-60' : 'h-72'} overflow-hidden bg-surface-container-low flex items-center justify-center`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${animal.species} ${animal.animalId}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20">pets</span>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm">
          {animal.adopted ? '입양완료' : '보호중'}
        </div>
        <HeartButton isFavorited={isFavorited} onToggle={() => onToggleFavorite(animal.animalId)} />
      </div>
      <div className="p-6">
        <h3 className={`font-bold text-on-surface mb-2 ${compact ? 'text-xl' : 'text-2xl'}`}>
          {animal.animalId}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
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
          <p className="text-on-surface-variant text-sm leading-relaxed">설명란</p>
        )}
      </div>
    </div>
  );
}

export default AnimalCard;
