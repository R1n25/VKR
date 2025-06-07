import React, { useState, useRef } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { InertiaLink, usePage } from '@inertiajs/inertia-react';
import styles from './styles.module.css';

const CreateCategory = () => {
  const { errors, categories } = usePage().props;
  const [values, setValues] = useState({
    name: '',
    description: '',
    parent_id: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const key = e.target.name;
    const value = e.target.type === 'file' ? e.target.files[0] : e.target.value;

    if (e.target.type === 'file' && value) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(value);
    }

    setValues(values => ({
      ...values,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    Inertia.post(route('categories.store'), {
      ...values,
      image: values.image
    }, {
      forceFormData: true
    });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className={styles.sectionTitle}>Создание новой категории</h1>
        <InertiaLink href={route('categories.index')} className={`btn btn-secondary ${styles.actionButton}`}>
          <i className="fas fa-arrow-left"></i> Назад к списку
        </InertiaLink>
      </div>

      <div className={`card ${styles.categoryCard}`}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Название категории</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Описание</label>
                  <textarea 
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    rows="4"
                  ></textarea>
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="parent_id" className="form-label">Родительская категория</label>
                  <select 
                    className={`form-select ${errors.parent_id ? 'is-invalid' : ''}`}
                    id="parent_id"
                    name="parent_id"
                    value={values.parent_id}
                    onChange={handleChange}
                  >
                    <option value="">Корневая категория</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.parent_id && <div className="invalid-feedback">{errors.parent_id}</div>}
                </div>
              </div>

              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Изображение категории</label>
                  <div 
                    className={styles.imageUploadContainer}
                    onClick={handleImageClick}
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Предпросмотр" 
                        className={`img-fluid mb-2 ${styles.categoryPreview}`}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <i className="fas fa-image fa-3x mb-2"></i>
                        <p>Нажмите, чтобы выбрать изображение</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="d-none"
                      id="image"
                      name="image"
                      ref={fileInputRef}
                      onChange={handleChange}
                      accept="image/*"
                    />
                  </div>
                  {errors.image && <div className="text-danger mt-1">{errors.image}</div>}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className={`btn btn-primary ${styles.actionButton}`}>
                <i className="fas fa-save"></i> Сохранить категорию
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;

// CSS можно добавить через отдельный файл стилей или через styled-components
// Пример стилей:
/*
.category-preview {
  max-height: 200px;
  object-fit: contain;
}

.image-upload-container {
  cursor: pointer;
  transition: all 0.2s;
}

.image-upload-container:hover {
  background-color: #f8f9fa;
}
*/ 