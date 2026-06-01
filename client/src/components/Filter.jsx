import { useState, useEffect } from "react";
import { BASE_URL } from "../Redux/Constants/BASE_URL";
import MobileFilter from "./MobileFilter";
import DesktopFilter from "./DesktopFilter";

const Filter = ({
  sortOption,
  setSortOption,
  selectedCategory,
  setSelectedCategory,
  selectedColors,
  setSelectedColors,
  searchQuery,
  setSearchQuery,
}) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const options = ['Price: High to Low', 'Price: Low to High', 'Relevance'];

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/products/categories`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchColors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/products/colors`);
        if (!response.ok) {
          throw new Error("Failed to fetch colors");
        }
        const data = await response.json();
        setColors(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
    fetchColors();
  }, []);

  return isMobileView ? (
    <MobileFilter
      sortOption={sortOption}
      setSortOption={setSortOption}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedColors={selectedColors}
      setSelectedColors={setSelectedColors}
      categories={categories}
      colors={colors}
      options={options}
    />
  ) : (
    <DesktopFilter
      sortOption={sortOption}
      setSortOption={setSortOption}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedColors={selectedColors}
      setSelectedColors={setSelectedColors}
      categories={categories}
      colors={colors}
      options={options}
    />
  );
};

export default Filter;