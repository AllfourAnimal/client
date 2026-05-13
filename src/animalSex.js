export function getAnimalSexLabel(sex) {
  if (!sex) return '';

  const value = String(sex).trim().toUpperCase();
  if (value === 'MALE' || value === 'M') return '수컷';
  if (value === 'FEMALE' || value === 'F') return '암컷';
  if (value === 'NEUTERED' || value === 'N') return '중성';

  return String(sex);
}

export function getAnimalSexIcon(sex) {
  const label = getAnimalSexLabel(sex);
  if (label === '수컷') return 'male';
  if (label === '암컷') return 'female';
  if (label === '중성') return '⚲';

  return 'wc';
}
