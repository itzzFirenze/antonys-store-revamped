import { useState, useEffect } from "react";

const MobileFilter = ({
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
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [tempSelectedCategory, setTempSelectedCategory] = useState([]);
  const [tempSelectedColors, setTempSelectedColors] = useState([]);
  const [tempSortOption, setTempSortOption] = useState(sortOption);
  const [animatingItems, setAnimatingItems] = useState([]);

  useEffect(() => {
    if (isBottomSheetOpen) {
      if (activeSheet === 'category') {
        setTempSelectedCategory([...selectedCategory]);
      } else if (activeSheet === 'color') {
        setTempSelectedColors([...selectedColors]);
      } else if (activeSheet === 'sort') {
        setTempSortOption(sortOption);
      }
    }
  }, [isBottomSheetOpen, activeSheet, selectedCategory, selectedColors, sortOption]);

  const handleSelectSort = (option) => {
    setTempSortOption(option);
  };

  const handleToggleCategory = (category) => {
    setTempSelectedCategory((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleToggleColor = (color) => {
    setTempSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const openBottomSheet = (sheetName) => {
    setActiveSheet(sheetName);
    setIsBottomSheetOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setActiveSheet(null);
    document.body.style.overflow = 'unset';
  };

  const handleApplyFilters = () => {
    if (activeSheet === 'category') {
      setSelectedCategory(tempSelectedCategory);
    } else if (activeSheet === 'color') {
      setSelectedColors(tempSelectedColors);
    } else if (activeSheet === 'sort') {
      setSortOption(tempSortOption);
    }
    closeBottomSheet();
  };

  const MobileBottomSheet = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isBottomSheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={closeBottomSheet}
    >
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 transform ${
          isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              {activeSheet === 'sort' ? 'Sort By' :
               activeSheet === 'category' ? 'Categories' :
               activeSheet === 'color' ? 'Colors' : ''}
            </h2>
            <button onClick={closeBottomSheet} className="text-gray-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {activeSheet === 'sort' && (
              <div className="space-y-4">
                {options.map((option) => (
                  <label key={option} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-fuchsia-800"
                      checked={tempSortOption === option}
                      onChange={() => handleSelectSort(option)}
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {activeSheet === 'category' && (
              <div className="space-y-4">
                {categories.map((category) => (
                  <label key={category} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-fuchsia-800 rounded"
                      checked={tempSelectedCategory.includes(category)}
                      onChange={() => handleToggleCategory(category)}
                    />
                    <span className="text-gray-900">{category}</span>
                  </label>
                ))}
              </div>
            )}

            {activeSheet === 'color' && (
              <div className="space-y-4">
                {colors.map((color) => (
                  <label key={color} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-fuchsia-800 rounded"
                      checked={tempSelectedColors.includes(color)}
                      onChange={() => handleToggleColor(color)}
                    />
                    <span className="text-gray-900">{color}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 border-t">
            <button
              onClick={handleApplyFilters}
              className="w-full bg-fuchsia-800 text-white py-3 rounded-lg font-medium transition transform active:scale-95 hover:bg-fuchsia-900"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const MobileFilterBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex justify-between items-center z-40 pl-8 pr-8">
      <button
        onClick={() => openBottomSheet('sort')}
        className="flex flex-col items-center space-y-1"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <span className="text-xs">Sort</span>
      </button>

      <button
        onClick={() => openBottomSheet('category')}
        className="flex flex-col items-center space-y-1 relative"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="text-xs">Category</span>
        {selectedCategory.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-fuchsia-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {selectedCategory.length}
          </span>
        )}
      </button>

      <button
        onClick={() => openBottomSheet('color')}
        className="flex flex-col items-center space-y-1 relative"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span className="text-xs">Color</span>
        {selectedColors.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-fuchsia-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {selectedColors.length}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <>
      <div className="pb-20" />
      <MobileFilterBar />
      <MobileBottomSheet />
    </>
  );
};

export default MobileFilter;