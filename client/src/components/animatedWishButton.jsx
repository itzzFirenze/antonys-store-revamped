import React, { useState } from 'react';

const AnimatedWishlistButton = ({ isInWishlist, onToggle, disabled }) => {
   const [isAnimating, setIsAnimating] = useState(false);

   const handleClick = () => {
      if (disabled) return;
      setIsAnimating(true);
      onToggle();
      // Reset animation state after animation completes
      setTimeout(() => setIsAnimating(false), 300);
   };

   return (
      <button
         onClick={handleClick}
         disabled={disabled}
         className={`
        wishlist-button
        flex items-center justify-center
        space-x-2 py-3 px-6
        rounded-lg text-gray-100
        transition-all duration-300 ease-in-out
        ${disabled
               ? 'bg-gray-400 cursor-not-allowed'
               : isInWishlist
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-fuchsia-800 hover:bg-fuchsia-900'
            }
        ${isAnimating ? 'scale-110' : 'scale-100'}
        min-w-[260px]
      `}
      >
         <div
            className={`
          w-6 h-6
          transition-transform duration-300 ease-bounce
          ${isAnimating ? 'scale-125' : 'scale-100'}
        `}
         >
            <img
               src={isInWishlist ? "/icons/heart-filled.png" : "/icons/heart-outline.png"}
               alt={isInWishlist ? "In Wishlist" : "Not in Wishlist"}
               className="w-full h-full"
            />
         </div>
         <span className="text-center">
            {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
         </span>
      </button>
   );
};

export default AnimatedWishlistButton;