import { useState, useEffect, useRef } from "react";

const DesktopFilter = ({
  sortOption,
  setSortOption,
  selectedCategory,
  setSelectedCategory,
  selectedColors,
  setSelectedColors,
  categories,
  colors,
  options
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const filtersContainerRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState(12);
  const [animatingItems, setAnimatingItems] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      if (filtersContainerRef.current) {
        const totalFilters = selectedCategory.length + selectedColors.length;
        setHasOverflow(totalFilters > visibleFilters);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [selectedCategory, selectedColors, visibleFilters]);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleSelectSort = (option) => {
    setSortOption(option);
    setOpenDropdown(null);
  };

  const handleToggleCategory = (category) => {
    setSelectedCategory((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleToggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const handleRemoveCategory = (category) => {
    setSelectedCategory(selectedCategory.filter((c) => c !== category));
  };

  const handleRemoveColor = (color) => {
    setSelectedColors(selectedColors.filter((c) => c !== color));
  };

  const renderFilterChips = () => {
    const allFilters = [
      ...selectedCategory.map(category => ({ type: 'category', value: category })),
      ...selectedColors.map(color => ({ type: 'color', value: color }))
    ];

    const visibleFilterChips = showAllFilters ? allFilters : allFilters.slice(0, visibleFilters);
    const remainingCount = allFilters.length - visibleFilters;

    return (
      <div className="flex items-center flex-wrap gap-2" ref={filtersContainerRef}>
        {visibleFilterChips.map(({ type, value }) => {
          const isAnimating = animatingItems.some(
            item => item.type === type && item.value === value
          );
          
          return (
            <div
              key={`${type}-${value}`}
              className={`flex items-center space-x-2 bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs ${
                isAnimating ? 'animate-pulse bg-fuchsia-100' : ''
              }`}
            >
              <span>{value}</span>
              <button
                onClick={() => type === 'category' ? handleRemoveCategory(value) : handleRemoveColor(value)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        })}

        {hasOverflow && !showAllFilters && (
          <button
            onClick={() => setShowAllFilters(true)}
            className="text-fuchsia-800 hover:text-fuchsia-900 text-sm font-medium"
          >
            +{remainingCount} more
          </button>
        )}

        {showAllFilters && (
          <button
            onClick={() => setShowAllFilters(false)}
            className="text-fuchsia-800 hover:text-fuchsia-900 text-sm font-medium"
          >
            Show less
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="border-t border-b border-gray-200 py-4 bg-gray-100 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex justify-end dropdown-container">
            <div className="relative">
              <button
                type="button"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none flex items-center space-x-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown('sort');
                }}
              >
                <span>Sort</span>
                {sortOption && (
                  <>
                    <span className="mx-1">:</span>
                    <span className="text-gray-900">{sortOption}</span>
                  </>
                )}
                <svg
                  className={`w-4 h-4 text-gray-500 transform transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openDropdown === 'sort' && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {options.map((option) => (
                      <button
                        key={option}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                        onClick={() => handleSelectSort(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative dropdown-container">
              <button
                type="button"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none flex items-center space-x-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown('category');
                }}
              >
                <span>Category</span>
                {selectedCategory.length > 0 && (
                  <span className="bg-gray-200 text-gray-700 rounded-md px-1.5 py-0.5 text-xs font-medium">
                    {selectedCategory.length}
                  </span>
                )}
                <svg
                  className={`w-4 h-4 text-gray-500 transform transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openDropdown === 'category' && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                    {Array.isArray(categories) && categories.map((category) => (
                      <label key={category} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-fuchsia-800 border-gray-300 rounded"
                          checked={selectedCategory.includes(category)}
                          onChange={() => handleToggleCategory(category)}
                        />
                        <span className="ml-2 truncate">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="relative dropdown-container">
              <button
                type="button"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none flex items-center space-x-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown('color');
                }}
              >
                <span>Color</span>
                {selectedColors.length > 0 && (
                  <span className="bg-gray-200 text-gray-700 rounded-md px-1.5 py-0.5 text-xs font-medium">
                    {selectedColors.length}
                  </span>
                )}
                <svg
                  className={`w-4 h-4 text-gray-500 transform transition-transform ${openDropdown === 'color' ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openDropdown === 'color' && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                    {colors.map((color) => (
                      <label key={color} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-fuchsia-800 border-gray-300 rounded"
                          checked={selectedColors.includes(color)}
                          onChange={() => handleToggleColor(color)}
                        />
                        <span className="ml-2 truncate">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {renderFilterChips()}
        </div>
      </div>
    </div>
  );
};

export default DesktopFilter;