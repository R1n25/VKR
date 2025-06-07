import React, { useState, useEffect, useRef } from 'react';
import { InertiaLink, usePage } from '@inertiajs/inertia-react';
import { Inertia } from '@inertiajs/inertia';
import { Modal } from 'bootstrap';
import styles from './styles.module.css';

const CategoriesIndex = () => {
  const { categories } = usePage().props;
  const [search, setSearch] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const deleteModalRef = useRef(null);
  const bsModal = useRef(null);

  useEffect(() => {
    if (deleteModalRef.current) {
      bsModal.current = new Modal(deleteModalRef.current);
    }
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(
        categories.filter(category => 
          category.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, categories]);

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    bsModal.current.show();
  };

  const deleteCategory = () => {
    Inertia.delete(route('categories.destroy', categoryToDelete.id), {
      onSuccess: () => {
        bsModal.current.hide();
        setCategoryToDelete(null);
      }
    });
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className={styles.sectionTitle}>Список категорий запчастей</h1>
        <div>
          <InertiaLink href={route('categories.create')} className={`btn btn-primary ${styles.actionButton}`}>
            <i className="fas fa-plus"></i> Добавить категорию
          </InertiaLink>
          <button className={`btn btn-secondary ms-2 ${styles.actionButton}`}>
            <i className="fas fa-code"></i> Blade-версия
          </button>
        </div>
      </div>

      <div className={`card ${styles.categoryCard}`}>
        <div className="card-body">
          <div className={styles.searchContainer}>
            <i className={`fas fa-search ${styles.searchIcon}`}></i>
            <input 
              type="text" 
              className={`form-control ${styles.searchInput}`}
              placeholder="Поиск по названию" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.tableContainer}>
            <table className="table table-striped">
              <thead className={styles.tableHeader}>
                <tr>
                  <th>ID</th>
                  <th>Изображение</th>
                  <th>Название</th>
                  <th>Родительская категория</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(category => (
                    <tr key={category.id} className={styles.tableRow}>
                      <td>{category.id}</td>
                      <td>
                        <img 
                          src={category.image_url || '/images/no-image.png'} 
                          alt={category.name} 
                          className={styles.categoryThumbnail}
                        />
                      </td>
                      <td>{category.name}</td>
                      <td>{category.parent ? category.parent.name : 'Корневая категория'}</td>
                      <td>
                        <div className={styles.actionButtonsContainer}>
                          <InertiaLink 
                            href={route('categories.show', category.id)} 
                            className={`btn btn-sm btn-info ${styles.actionButton}`}
                          >
                            Просмотр
                          </InertiaLink>
                          <InertiaLink 
                            href={route('categories.edit', category.id)} 
                            className={`btn btn-sm btn-warning ${styles.actionButton}`}
                          >
                            Редактировать
                          </InertiaLink>
                          <button 
                            onClick={() => confirmDelete(category)} 
                            className={`btn btn-sm btn-danger ${styles.actionButton}`}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">Категории не найдены</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" ref={deleteModalRef}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className={`modal-header ${styles.modalHeader}`}>
              <h5 className="modal-title">Подтверждение удаления</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {categoryToDelete && (
                <p>Вы действительно хотите удалить категорию "{categoryToDelete.name}"?</p>
              )}
            </div>
            <div className={`modal-footer ${styles.modalFooter}`}>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
              <button type="button" className="btn btn-danger" onClick={deleteCategory}>Удалить</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesIndex;

// CSS можно добавить через отдельный файл стилей или через styled-components
// Пример стилей:
/*
.category-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}
*/ 