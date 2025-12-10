import { useState, useMemo } from 'react';
import { FiFolder, FiChevronRight, FiChevronDown } from 'react-icons/fi';

function CategoryItem({ category, categories, selectedCategoryId, onSelect, level = 0 }) {
  // Filter children - handle null, undefined, and 0 properly
  const children = categories.filter((c) => {
    const cParentId = c.parent_id;
    const categoryId = category.id;
    return cParentId !== null && cParentId !== undefined && cParentId === categoryId;
  });
  
  const hasChildren = children.length > 0;
  const isExpanded = true; // Always show children for now
  const isSelected = selectedCategoryId === category.id;
  const isChild = level > 0;

  return (
    <div>
      <button
        onClick={() => onSelect(category.id)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
          isSelected
            ? 'bg-brand-50 text-brand-700 font-medium'
            : 'text-ink-soft hover:bg-cloud/60'
        } ${isChild ? 'text-xs' : ''}`}
        style={{ paddingLeft: `${0.75 + level * 1.5}rem` }}
      >
        {hasChildren ? (
          isExpanded ? (
            <FiChevronDown className="h-4 w-4 flex-shrink-0" />
          ) : (
            <FiChevronRight className="h-4 w-4 flex-shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        {hasChildren ? (
          <FiFolder className={`h-4 w-4 flex-shrink-0 ${isExpanded ? 'text-brand-700' : ''}`} />
        ) : isChild ? (
          <span className="h-4 w-4 flex-shrink-0 flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-subtle" />
          </span>
        ) : (
          <span className="h-4 w-4 flex-shrink-0" />
        )}
        <span className="truncate">{category.name}</span>
      </button>
      {hasChildren && isExpanded && (
        <div className="border-l border-sand/40 ml-2">
          {children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ExpenseCategorySidebar({ categories = [], selectedCategoryId, onSelectCategory }) {
  const rootCategories = useMemo(
    () => categories.filter((c) => {
      // Only show categories with no parent (null, undefined, or 0)
      const parentId = c.parent_id;
      return parentId === null || parentId === undefined || parentId === 0;
    }),
    [categories]
  );

  return (
    <div className="flex flex-col border-r border-sand/60 bg-white" style={{ minHeight: '600px' }}>
      <div className="flex-shrink-0 border-b border-sand/60 p-4">
        <h2 className="text-sm font-semibold text-ink">Kategorier</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(600px - 60px)' }}>
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
            selectedCategoryId === null
              ? 'bg-brand-50 text-brand-700 font-medium'
              : 'text-ink-soft hover:bg-cloud/60'
          }`}
        >
          <span className="w-4" />
          <span>Alle utgifter</span>
        </button>
        {rootCategories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={onSelectCategory}
          />
        ))}
        {rootCategories.length === 0 && (
          <p className="px-3 py-2 text-xs text-ink-subtle">Ingen kategorier</p>
        )}
      </div>
    </div>
  );
}

