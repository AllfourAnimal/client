const COMPLETED_ADOPTION_STATUSES = new Set(['APPROVED', 'COMPLETED']);

export function getAdoptionStatusLabel(animal, adoption) {
  if (animal?.adopted) {
    return '입양 완료';
  }

  const adoptionStatus = String(adoption?.status || '').toUpperCase();
  if (COMPLETED_ADOPTION_STATUSES.has(adoptionStatus)) {
    return '입양 완료';
  }

  if (adoption) {
    return '입양 문의중';
  }

  return '입양 가능';
}
