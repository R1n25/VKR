import React from 'react';
import { InertiaLink, usePage } from '@inertiajs/inertia-react';
import styles from './styles.module.css';

const ShowCategory = () => {
  const { category, parts_count } = usePage().props;

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className={styles.sectionTitle}>Просмотр категории</h1>
        <div>
          <InertiaLink href={route('categories.edit', category.id)} className={`btn btn-warning me-2 ${styles.actionButton}`}>
            <i className="fas fa-edit"></i> Редактировать
          </InertiaLink>
          <InertiaLink href={route('categories.index')} className={`btn btn-secondary ${styles.actionButton}`}>
            <i className="fas fa-arrow-left"></i> Назад к списку
          </InertiaLink>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className={`card mb-4 ${styles.categoryCard}`}>
            <div className="card-header">
              <h5 className="mb-0">Информация о категории</h5>
            </div>
            <div className="card-body">
              <table className="table table-bordered">
                <tbody>
                  <tr className={styles.tableRow}>
                    <th style={{ width: '200px' }}>ID</th>
                    <td>{category.id}</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <th>Название</th>
                    <td>{category.name}</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <th>Родительская категория</th>
                    <td>
                      {category.parent ? (
                        <InertiaLink href={route('categories.show', category.parent.id)}>
                          {category.parent.name}
                        </InertiaLink>
                      ) : (
                        <span className="text-muted">Корневая категория</span>
                      )}
                    </td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <th>Описание</th>
                    <td>
                      {category.description ? (
                        <p className="mb-0">{category.description}</p>
                      ) : (
                        <span className="text-muted">Описание отсутствует</span>
                      )}
                    </td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <th>Количество запчастей</th>
                    <td>
                      <span className={`badge bg-info ${styles.customBadge}`}>{parts_count}</span>
                    </td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <th>Дата создания</th>
                    <td>{new Date(category.created_at).toLocaleString()}</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <th>Дата обновления</th>
                    <td>{new Date(category.updated_at).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {category.children && category.children.length > 0 && (
            <div className={`card mb-4 ${styles.categoryCard}`}>
              <div className="card-header">
                <h5 className="mb-0">Подкатегории ({category.children.length})</h5>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {category.children.map(child => (
                    <InertiaLink 
                      key={child.id}
                      href={route('categories.show', child.id)}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      {child.name}
                      <span className={`badge bg-secondary rounded-pill ${styles.customBadge}`}>
                        {child.parts_count || 0} запчастей
                      </span>
                    </InertiaLink>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-4">
          <div className={`card mb-4 ${styles.categoryCard}`}>
            <div className="card-header">
              <h5 className="mb-0">Изображение категории</h5>
            </div>
            <div className="card-body text-center">
              {category.image_url ? (
                <img 
                  src={category.image_url} 
                  alt={category.name} 
                  className={`img-fluid ${styles.categoryImage}`}
                />
              ) : (
                <div className={styles.placeholderImage}>
                  <i className="fas fa-image fa-3x mb-2 text-muted"></i>
                  <p className="text-muted">Изображение отсутствует</p>
                </div>
              )}
            </div>
          </div>

          <div className={`card ${styles.categoryCard}`}>
            <div className="card-header">
              <h5 className="mb-0">Действия</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <InertiaLink 
                  href={route('categories.edit', category.id)} 
                  className={`btn btn-warning ${styles.actionButton}`}
                >
                  <i className="fas fa-edit"></i> Редактировать
                </InertiaLink>
                
                <InertiaLink 
                  href={route('parts.index', { category_id: category.id })} 
                  className={`btn btn-info ${styles.actionButton}`}
                >
                  <i className="fas fa-list"></i> Показать запчасти
                </InertiaLink>
                
                <InertiaLink 
                  href={route('categories.create', { parent_id: category.id })} 
                  className={`btn btn-success ${styles.actionButton}`}
                >
                  <i className="fas fa-plus"></i> Добавить подкатегорию
                </InertiaLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowCategory;

// CSS можно добавить через отдельный файл стилей или через styled-components
// Пример стилей:
/*
.category-image {
  max-height: 300px;
  object-fit: contain;
}
*/ 