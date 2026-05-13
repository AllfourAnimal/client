import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HeartButton from './HeartButton';
import { getAdoptionStatusLabel } from '../../adoptionStatus';
import { getAnimalSexLabel } from '../../animalSex';
import { useAdoptions } from '../../context/AdoptionContext';

const CURRENT_YEAR = new Date().getFullYear();

function getAgeLabel(birthYear) {
  if (!birthYear) return '';

  const age = CURRENT_YEAR - birthYear;
  if (Number.isNaN(age)) return '';

  return age >= 1 ? `${age}살` : '1살 미만';
}

function AnimalCard({ animal, imageSrc, isFavorited, onToggleFavorite, compact = false }) {
  const navigate = useNavigate();
  const { getAdoptionForAnimal } = useAdoptions();
  const adoption = getAdoptionForAnimal(animal.animalId);
  const adoptionStatus = getAdoptionStatusLabel(animal, adoption);
  const tags = [
    getAgeLabel(animal.animal_age),
    getAnimalSexLabel(animal.animal_sex),
  ].filter(Boolean);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setImgLoaded(false);
    if (imgRef.current?.complete) {
      setImgLoaded(true);
    }
  }, [imageSrc]);

  return (
    <div
      className="isolate bg-surface-container-lowest rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-2 border border-outline-variant/10 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
      onClick={() => navigate(`/animals/${animal.animalId}`)}
    >
      <div className={`relative ${compact ? 'h-60' : 'h-72'} overflow-hidden rounded-t-3xl bg-surface-container-low flex items-center justify-center transform-gpu`}>
        {imageSrc ? (
          <>
            {!imgLoaded && (
              <span className="relative inline-flex h-12 w-12 items-center justify-center text-primary" aria-label="이미지 로딩 중" role="status">
                <span className="absolute h-12 w-12 animate-spin rounded-full border-4 border-current/20 border-t-current" />
              </span>
            )}
            <img
              ref={imgRef}
              src={imageSrc}
              alt={`${animal.species} ${animal.animalId}`}
              className={`w-full h-full object-cover transition-transform duration-500 will-change-transform transform-gpu group-hover:scale-110 ${imgLoaded ? '' : 'hidden'}`}
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20">pets</span>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm">
          {adoptionStatus}
        </div>
        <HeartButton isFavorited={isFavorited} onToggle={() => onToggleFavorite(animal.animalId, animal, isFavorited)} />
      </div>
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-2">
          <h3 className={`font-bold text-on-surface ${compact ? 'text-xl' : 'text-2xl'}`}>
            {animal.species || '동물'}
          </h3>
          <div className="flex flex-wrap items-end gap-2 pb-0.5">
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
        </div>
        <p className="text-on-secondary-container text-sm font-medium">
          공고번호: {animal.desertionNo || '-'}
        </p>
      </div>
    </div>
  );
}

export default AnimalCard;
