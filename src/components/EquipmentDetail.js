import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './EquipmentSection.css';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/1200x700/efefef/aaaaaa?text=Equipment';

function normalizeImageUrl(url) {
  if (!url) return PLACEHOLDER_IMG;
  const asString = String(url);
  if (asString.startsWith('http://') || asString.startsWith('https://')) return asString;
  if (asString.startsWith('//')) return `https:${asString}`;
  if (asString.startsWith('/')) return `https://recensa.ru${asString}`;
  if (asString.startsWith('storage/')) return `https://recensa.ru/${asString}`;
  return `https://recensa.ru/${asString.replace(/^\.+\/?/, '')}`;
}

function mapApiEquipment(item) {
  return {
    id: item?.id,
    title: item?.title || item?.name || item?.label || 'Оборудование',
    description: item?.description || item?.short_description || '',
    fullDescription: item?.full_description || item?.description_full || item?.description || '',
    image: normalizeImageUrl(
      item?.image_card || item?.image || item?.img || item?.cover || (Array.isArray(item?.images) ? item.images[0] : null)
    ),
  };
}

const EquipmentDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchItem(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItem = async (signal) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/equipments/', { signal });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const list = Array.isArray(data) ? data.map(mapApiEquipment) : [];
      const found = list.find((x) => String(x.id) === String(id));
      if (!found) throw new Error('Товар не найден');
      setItem(found);
    } catch (e) {
      console.error(e);
      setError('Не удалось загрузить товар');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="equipment-section">
        <div className="container">
          <div className="loading">Загрузка…</div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="equipment-section">
        <div className="container">
          <div className="error-banner">{error || 'Ошибка'}</div>
          <Link className="view-all-button" to="/">Назад</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="equipment-section">
      <div className="container">
        <h2 className="section-title">{item.title}</h2>
        <div className="equipment-card" style={{ overflow: 'hidden' }}>
          <div className="equipment-image" style={{ aspectRatio: '16 / 9' }}>
            <img src={item.image} alt={item.title} />
          </div>
          <div className="equipment-content">
            {item.description && (
              <p className="equipment-description">{item.description}</p>
            )}
            {item.fullDescription && (
              <div dangerouslySetInnerHTML={{ __html: item.fullDescription }} />
            )}
          </div>
        </div>
        <Link className="view-all-button" to="/">Назад к оборудованию</Link>
      </div>
    </div>
  );
};

export default EquipmentDetail;


