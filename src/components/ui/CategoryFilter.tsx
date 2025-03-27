// src/components/ui/CategoryFilter.tsx
import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Adicione tipagem TypeScript
interface CategoryFilterProps {
  categories: string[]
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
}

const CategoryFilter: React.FC<CategoryFilterProps> = memo(
  ({ categories, selectedCategories, onCategoryChange }) => {
    const { t } = useTranslation()
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const filterContentRef = useRef<HTMLDivElement>(null)
    const [filterHeight, setFilterHeight] = useState(0)

    console.log('CategoryFilter received:', { categories, selectedCategories })
    // Measure the height of filter content when it changes
    useEffect(() => {
      if (isFilterOpen && filterContentRef.current) {
        setFilterHeight(filterContentRef.current.offsetHeight)
      } else {
        setFilterHeight(0)
      }
    }, [isFilterOpen, categories, selectedCategories])

    const toggleFilter = useCallback(() => {
      setIsFilterOpen((prev) => !prev)
    }, [])

    const clearAllFilters = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        onCategoryChange([])
      },
      [onCategoryChange],
    )

    const toggleCategory = useCallback(
      (category: string) => {
        if (selectedCategories.includes(category)) {
          onCategoryChange(selectedCategories.filter((c) => c !== category))
        } else {
          onCategoryChange([...selectedCategories, category])
        }
      },
      [selectedCategories, onCategoryChange],
    )

    // If there are no categories, don't render anything
    if (categories.length === 0) {
      return null
    }

    // Check if we should show the "Clear All" button (2+ selections)
    const showClearAll = selectedCategories.length >= 2

    return (
      <div className="w-full mb-6">
        <div className="relative w-full">
          {/* Button container */}
          <div className="flex justify-end items-center">
            {/* Clear All button */}
            <AnimatePresence>
              {showClearAll && isFilterOpen && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 font-light mr-3"
                  type="button"
                >
                  {t('filter.clearAll', 'Clear all')}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Filter button */}
            <button
              onClick={toggleFilter}
              type="button"
              className="inline-flex items-center px-3 border border-gray-300 hover:border-gray-400 text-sm text-gray-700 rounded-lg transition-colors duration-200 font-light bg-white cursor-pointer"
              aria-expanded={isFilterOpen}
              aria-controls="category-filter-options"
              style={{ height: '40px' }}
            >
              <span>{t('filter.filterBy', 'Filter by')}</span>
              <svg
                className={`ml-1.5 h-4 w-4 transform transition-transform duration-200 ${
                  isFilterOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Animated container for filter options */}
          <motion.div
            className="w-full overflow-hidden"
            animate={{
              height: filterHeight,
              marginTop: isFilterOpen ? 16 : 0,
              opacity: isFilterOpen ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <div
              ref={filterContentRef}
              id="category-filter-options"
              className="w-full"
            >
              <div
                className="flex flex-wrap justify-end"
                style={{ gap: '0.5rem' }}
              >
                {isFilterOpen &&
                  categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`cursor-pointer text-sm rounded-md transition-colors duration-200 font-light flex items-center ${
                        selectedCategories.includes(category)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{
                        height: '32px',
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem',
                      }}
                    >
                      <span>{category}</span>
                      {selectedCategories.includes(category) && (
                        <span className="inline-flex items-center justify-center ml-1.5">
                          <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  },
)

export default React.memo(CategoryFilter)
