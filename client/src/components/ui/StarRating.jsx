import { HiStar, HiOutlineStar } from 'react-icons/hi2';

const StarRating = ({ rating, count, size = 'w-4 h-4' }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= Math.round(rating) ? (
            <HiStar key={star} className={`${size} text-yellow-400`} />
          ) : (
            <HiOutlineStar key={star} className={`${size} text-yellow-400`} />
          )
        )}
      </div>
      {count !== undefined && (
        <span className="text-sm text-gray-500">({count})</span>
      )}
    </div>
  );
};

export default StarRating;
