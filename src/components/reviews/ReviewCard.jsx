function ReviewCard({ review, onNavigateReviewDetails }) {
  return (
    <article className="bg-surface-container-lowest rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:shadow-xl group border border-surface-container">
      <div className="relative h-64 overflow-hidden">
        <img
          alt={review.alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={review.image}
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
          {review.certified ? '입양 인증' : '입양 미인증'}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4 text-xs text-on-surface-variant font-medium">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">person</span>
            {review.author}
          </span>
          <span className="w-1 h-1 bg-outline-variant rounded-full" />
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {review.date}
          </span>
        </div>
        <h3 className="font-headline text-xl font-bold mb-3 text-on-surface group-hover:text-primary transition-colors">
          {review.title}
        </h3>
        <p className="text-on-surface-variant line-clamp-2 mb-6 font-body text-sm">
          {review.excerpt}
        </p>
        <button
          className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm"
          onClick={() => onNavigateReviewDetails && onNavigateReviewDetails(review.id)}
        >
          더 읽어보기{' '}
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </article>
  );
}

export default ReviewCard;
