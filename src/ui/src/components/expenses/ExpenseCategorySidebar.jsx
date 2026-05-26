import { useState, useMemo } from 'react';
import { IconFolder, IconChevronRight, IconChevronDown } from '@tabler/icons-react';

function CategoryItem({ category, categories, selectedCategoryId, onSelect, level = 0 }) {
  const children = categories.filter((c) => {
    const cParentId = c.parent_id;
    const categoryId = category.id;
    return cParentId !== null && cParentId !== undefined && cParentId === categoryId;
  });

  const hasChildren = children.length > 0;
  const isExpanded = true;
  const isSelected = selectedCategoryId === category.id;
  const isChild = level > 0;

  return (
    <div>
      <button
        onClick={() => onSelect(category.id)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${isChild ? 'text-xs' : ''}`}
        style={{
          paddingLeft: `${0.75 + level * 1.5}rem`,
          background: isSelected ? 'var(--f-green-bg)' : 'transparent',
          color: isSelected ? 'var(--f-green-text)' : 'var(--f-text-soft)',
          fontWeight: isSelected ? 500 : 400,
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
      >
        {hasChildren ? (
          isExpanded ? (
            <IconChevronDown className="h-4 w-4 flex-shrink-0" />
          ) : (
            <IconChevronRight className="h-4 w-4 flex-shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        {hasChildren ? (
          <IconFolder className="h-4 w-4 flex-shrink-0" style={{ color: isSelected ? 'var(--f-green-text)' : 'var(--f-text-subtle)' }} />
        ) : isChild ? (
          <span className="h-4 w-4 flex-shrink-0 flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--f-text-subtle)' }} />
          </span>
        ) : (
          <span className="h-4 w-4 flex-shrink-0" />
        )}
        <span className="truncate">{category.name}</span>
      </button>
      {hasChildren && isExpanded && (
        <div className="ml-2" style={{ borderLeft: '1px solid var(--f-border-faint)' }}>
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
      const parentId = c.parent_id;
      return parentId === null || parentId === undefined || parentId === 0;
    }),
    [categories]
  );

  return (
    <div className="flex flex-col" style={{ minHeight: '600px', borderRight: '1px solid var(--f-border-subtle)' }}>
      <div className="flex-shrink-0 p-4" style={{ borderBottom: '1px solid var(--f-border-subtle)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--f-text-body)' }}>Kategorier</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(600px - 60px)' }}>
        <button
          onClick={() => onSelectCategory(null)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition"
          style={{
            background: selectedCategoryId === null ? 'var(--f-green-bg)' : 'transparent',
            color: selectedCategoryId === null ? 'var(--f-green-text)' : 'var(--f-text-soft)',
            fontWeight: selectedCategoryId === null ? 500 : 400,
          }}
          onMouseEnter={e => { if (selectedCategoryId !== null) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { if (selectedCategoryId !== null) e.currentTarget.style.background = 'transparent'; }}
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
          <p className="px-3 py-2 text-xs" style={{ color: 'var(--f-text-subtle)' }}>Ingen kategorier</p>
        )}
      </div>
    </div>
  );
}
