import React, { useState, useEffect, useCallback } from 'react';
import './EquipmentSection.css';
import { Link } from 'react-router-dom';

const SKELETON_COUNT = 6;
const PLACEHOLDER_IMG = 'https://via.placeholder.com/640x400/efefef/aaaaaa?text=Equipment';

function normalizeImageUrl(url) {
  if (!url) return PLACEHOLDER_IMG;
  const asString = String(url);
  // prefix site domain if backend returns relative path
  if (asString.startsWith('http://') || asString.startsWith('https://')) return asString;
  if (asString.startsWith('//')) return `https:${asString}`;
  if (asString.startsWith('/')) return `https://recensa.ru${asString}`;
  if (asString.startsWith('storage/')) return `https://recensa.ru/${asString}`;
  return `https://recensa.ru/${asString.replace(/^\.+\/?/, '')}`;
}

function stripHtml(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]*>/g, '').trim();
}

function mapApiEquipment(item, indexFallback) {
  const id = item?.id ?? indexFallback;
  const title = item?.title || item?.name || item?.label || 'Оборудование';
  const descriptionRaw = item?.description || item?.short_description || '';
  const description = stripHtml(descriptionRaw);
  const imageRaw = item?.image_card || item?.image || item?.img || item?.cover || (Array.isArray(item?.images) ? item.images[0] : null);
  const image = normalizeImageUrl(imageRaw) || PLACEHOLDER_IMG;
  return { id, title, description, image };
}

const EquipmentSection = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const fetchEquipments = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/equipments/', { signal });
      if (!response.ok) throw new Error('Failed to load');
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map((it, idx) => mapApiEquipment(it, idx)) : [];
      setEquipments(normalized.length ? normalized : getFallbackEquipments());
    } catch (e) {
      console.error('Error fetching equipments:', e);
      setError('Не удалось загрузить оборудование');
      setEquipments(getFallbackEquipments());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchEquipments(controller.signal);
    return () => controller.abort();
  }, [fetchEquipments]);

  function getFallbackEquipments() {
    return [
      { id: 1, title: 'СЕРИЯ RPOOL', description: 'Бассейновое от 1000 м3/ч до 32 000 м3/ч', image: PLACEHOLDER_IMG },
      { id: 2, title: 'СЕРИЯ RCDUCT', description: 'Канальное от 100 м3/ч до 10 000 м³/ч', image: PLACEHOLDER_IMG },
      { id: 3, title: 'СМЕСИТЕЛЬНЫЕ УЗЛЫ', description: 'Водяные узлы для систем вентиляции и кондиционирования', image: PLACEHOLDER_IMG },
      { id: 4, title: 'СЕРИЯ RCLEAN', description: 'Медицинское гигиеническое исполнение', image: PLACEHOLDER_IMG },
      { id: 5, title: 'СЕРИЯ RCROOF', description: 'Крышное оборудование для больших помещений', image: PLACEHOLDER_IMG },
      { id: 6, title: 'СЕРИЯ RCN', description: 'Общепромышленное от 1000 м3/ч до 100000 м3/ч', image: PLACEHOLDER_IMG },
    ];
  }

  const displayedEquipments = showAll ? equipments : equipments.slice(0, 6);

  return (
    <div className="equipment-section">
      <div className="container">
        <h2 className="section-title">ОБОРУДОВАНИЕ</h2>

        {error && !loading && equipments.length === 0 && (
          <div className="error-banner">{error}</div>
        )}

        <div className="equipment-grid">
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={`s-${i}`} className="equipment-card is-skeleton">
                  <div className="equipment-image skeleton-block" />
                  <div className="equipment-content">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                    <div className="skeleton-btn" />
                  </div>
                </div>
              ))
            : displayedEquipments.map((equipment) => (
                <Link 
                  to={`/equipment/${equipment.id}`} 
                  key={equipment.id} 
                  className="equipment-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="equipment-image">
                    <img src={equipment.image} alt={equipment.title} title={equipment.title} />
                  </div>
                  <div className="equipment-content">
                    <h3 className="equipment-title">{equipment.title}</h3>
                    {equipment.description && (
                      <p className="equipment-description">{equipment.description}</p>
                    )}
                    <button className="request-button" type="button">ОСТАВИТЬ ЗАЯВКУ</button>
                  </div>
                </Link>
            ))}
        </div>

        {!loading && equipments.length > 6 && (
          <button
            className="view-all-button"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? 'СКРЫТЬ' : 'СМОТРЕТЬ ВСЕ'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EquipmentSection;
