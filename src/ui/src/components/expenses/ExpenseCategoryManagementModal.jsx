import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { ExpenseCategoryModal } from './ExpenseCategoryModal';

export function ExpenseCategoryManagementModal({ isOpen, onClose, categories = [], onCreateCategory, onEditCategory, onDeleteCategory }) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryModalMode, setCategoryModalMode] = useState('create');

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryModalMode('create');
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryModalMode('edit');
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (payload) => {
    try {
      if (categoryModalMode === 'edit' && payload.id) {
        await onEditCategory?.(payload);
      } else {
        await onCreateCategory?.(payload);
      }
      setIsCategoryModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  // Build category tree
  const categoryTree = categories.reduce((acc, cat) => {
    if (!cat.parent_id) {
      acc.push({ ...cat, children: [] });
    } else {
      const parent = acc.find((p) => p.id === cat.parent_id);
      if (parent) {
        parent.children.push(cat);
      } else {
        acc.push({ ...cat, children: [] });
      }
    }
    return acc;
  }, []);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Behandle utgiftskategorier"
        description="Opprett, rediger eller slett utgiftskategorier. Du kan lage underkategorier ved å velge en overordnet kategori."
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              className="text-sm font-medium text-ink-subtle hover:text-ink"
              onClick={onClose}
            >
              Lukk
            </button>
            <button
              type="button"
              onClick={openCreateCategory}
              className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card"
            >
              Ny kategori
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {categoryTree.length === 0 ? (
            <p className="text-sm text-ink-subtle">Ingen kategorier opprettet ennå.</p>
          ) : (
            <div className="space-y-2">
              {categoryTree.map((category) => (
                <div key={category.id} className="space-y-1">
                  <div className="flex items-center justify-between rounded-lg border border-sand/60 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{category.name}</p>
                      {category.children.length > 0 && (
                        <p className="mt-1 text-xs text-ink-subtle">
                          {category.children.length} underkategori{category.children.length !== 1 ? 'er' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditCategory(category)}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Rediger
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCategory?.(category)}
                        className="text-sm font-medium text-rose-600 hover:underline"
                      >
                        Slett
                      </button>
                    </div>
                  </div>
                  {category.children.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {category.children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between rounded-lg border border-sand/40 bg-cloud/30 px-4 py-2">
                          <p className="text-sm text-ink-soft">{child.name}</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditCategory(child)}
                              className="text-sm font-medium text-accent hover:underline"
                            >
                              Rediger
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCategory?.(child)}
                              className="text-sm font-medium text-rose-600 hover:underline"
                            >
                              Slett
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
      <ExpenseCategoryModal
        isOpen={isCategoryModalOpen}
        mode={categoryModalMode}
        initialCategory={editingCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCategorySubmit}
        categories={categories}
      />
    </>
  );
}

