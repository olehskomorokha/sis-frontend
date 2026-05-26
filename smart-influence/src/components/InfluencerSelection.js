import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../App.css';
import {
  parseChannelsResponse,
  RECOMMENDED_INFLUENCERS_STORAGE_KEY,
} from '../utils/influencers';

const TAGS_API_URL = 'https://localhost:7237/api/Elasticsearch/bloggerTags';
const RECOMMENDATIONS_API_URL = 'https://localhost:7237/api/Influencer/recommendations';

const COUNTRIES = [
  { value: 'UA', label: 'Україна' },
];

const getTagName = (tag) => {
  if (typeof tag === 'string') {
    return tag;
  }

  if (!tag || typeof tag !== 'object') {
    return '';
  }

  return tag.name || tag.tagName || tag.title || tag.value || tag.label || String(tag.id || '');
};

const parseTagsResponse = (responseText) => {
  try {
    const parsed = JSON.parse(responseText);
    const list = Array.isArray(parsed) ? parsed : parsed?.$values || parsed?.items || parsed?.data || [];

    return list
      .map(getTagName)
      .map((tag) => tag.trim())
      .filter(Boolean);
  } catch {
    return responseText
      .split(/[\n,;]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
};

function InfluencerSelection() {
  const navigate = useNavigate();
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('UA');
  const [minFollowersCount, setMinFollowersCount] = useState('');
  const [minAvgViews, setMinAvgViews] = useState('');
  const [resultCount, setResultCount] = useState('10');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [tagsError, setTagsError] = useState('');
  const [areTagsLoading, setAreTagsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadTags = async () => {
      try {
        setAreTagsLoading(true);
        setTagsError('');

        const response = await fetch(TAGS_API_URL, {
          headers: {
            accept: 'text/plain',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Could not load tags');
        }

        const responseText = await response.text();
        const tags = [...new Set(parseTagsResponse(responseText))];
        setAvailableTags(tags);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setTagsError('Не вдалося завантажити теги з бази даних.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setAreTagsLoading(false);
        }
      }
    };

    loadTags();

    return () => controller.abort();
  }, []);

  const runAnalysis = async () => {
    if (!description.trim()) {
      setAnalysisMessage('Додайте опис продукту або кампанії перед запуском аналізу.');
      return;
    }

    const token = localStorage.getItem('token');
    const payload = {
      description: description.trim(),
      country,
      tags: selectedTags,
      minFollowersCount: minFollowersCount === '' ? null : Number(minFollowersCount),
      minAvgViews: minAvgViews === '' ? null : Number(minAvgViews),
      resultCount: resultCount === '' ? 10 : Number(resultCount),
    };

    try {
      setIsAnalyzing(true);
      setAnalysisMessage('');

      const response = await fetch(RECOMMENDATIONS_API_URL, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Could not run analysis');
      }

      const data = await response.json();
      const recommendedChannels = parseChannelsResponse(data);

      if (recommendedChannels.length === 0) {
        setAnalysisMessage('За цими параметрами канали не знайдено.');
        return;
      }

      sessionStorage.setItem(RECOMMENDED_INFLUENCERS_STORAGE_KEY, JSON.stringify(recommendedChannels));
      navigate('/influencer-recommendations', { state: { channels: recommendedChannels } });
    } catch (error) {
      console.error('Recommendation error:', error);
      setAnalysisMessage('Не вдалося виконати аналіз. Перевірте, чи запущений backend та Elasticsearch.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tagsForSearch = useMemo(() => {
    const normalizedSearch = tagSearch.trim().toLowerCase();

    return availableTags
      .filter((tag) => !selectedTags.includes(tag))
      .filter((tag) => tag.toLowerCase().includes(normalizedSearch))
      .slice(0, 8);
  }, [availableTags, selectedTags, tagSearch]);

  const addSelectedTag = (tag) => {
    if (tag && availableTags.includes(tag) && !selectedTags.includes(tag)) {
      setSelectedTags((currentTags) => [...currentTags, tag]);
      setTagSearch('');
      setIsTagMenuOpen(false);
    }
  };

  const removeSelectedTag = (tagToRemove) => {
    setSelectedTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagSearchKeyDown = (event) => {
    if (event.key === 'Enter' && tagsForSearch.length > 0) {
      event.preventDefault();
      addSelectedTag(tagsForSearch[0]);
    }

    if (event.key === 'Escape') {
      setIsTagMenuOpen(false);
    }
  };

  const isTagSearchDisabled = areTagsLoading || Boolean(tagsError) || availableTags.length === 0;
  const shouldShowTagMenu = isTagMenuOpen && !isTagSearchDisabled;

  return (
    <div className="page">
      <Header />

      <main className="main-content selection-content">
        <section className="card">
          <p className="eyebrow">Підбір інфлуенсерів</p>
          <h2>Пошук потенційних інфлуенсерів</h2>
          <p>
            Введіть нішу, бренд або ключову тему, а потім уточніть параметри аудиторії,
            щоб система могла сформувати релевантний список кандидатів.
          </p>

          <label className="full-width">
            <span className="label-with-tooltip">
              Опис продукту
              <span className="tooltip-wrapper">
                <button
                  className="info-tooltip-button"
                  type="button"
                  aria-label="Що писати в описі продукту"
                >
                  i
                </button>
                <span className="tooltip-content" role="tooltip">
                  Опишіть продукт або послугу, для якої потрібно підібрати інфлуенсерів:
                  нішу, цільову аудиторію, особливості бренду та тему рекламної кампанії.
                </span>
              </span>
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Наприклад: натуральна косметика для молодої аудиторії в Європі"
            />
          </label>

          <div className="filters">
            <h3>Налаштування та фільтри</h3>
            <label>
              Країна
              <select value={country} onChange={(event) => setCountry(event.target.value)}>
                {COUNTRIES.map((country) => (
                  <option value={country.value} key={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-group">
              <label htmlFor="tag-search">Теги продукту</label>
              <div className="tag-search">
                <input
                  id="tag-search"
                  type="text"
                  value={tagSearch}
                  disabled={isTagSearchDisabled}
                  placeholder={areTagsLoading ? 'Завантаження тегів...' : 'Beauty, Health, Cars, etc.'}
                  autoComplete="off"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={shouldShowTagMenu}
                  aria-controls="tag-search-options"
                  onChange={(event) => {
                    setTagSearch(event.target.value);
                    setIsTagMenuOpen(true);
                  }}
                  onFocus={() => setIsTagMenuOpen(true)}
                  onBlur={() => setIsTagMenuOpen(false)}
                  onKeyDown={handleTagSearchKeyDown}
                />
                {shouldShowTagMenu && (
                  <div className="tag-dropdown" id="tag-search-options" role="listbox">
                    {tagsForSearch.length > 0 ? (
                      tagsForSearch.map((tag) => (
                        <button
                          className="tag-option"
                          type="button"
                          role="option"
                          aria-selected="false"
                          key={tag}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addSelectedTag(tag)}
                        >
                          {tag}
                        </button>
                      ))
                    ) : (
                      <div className="tag-empty-state">
                        Такого тегу немає в базі даних
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedTags.length > 0 && (
              <div className="selected-tags" aria-label="Обрані теги">
                {selectedTags.map((tag) => (
                  <span className="tag-chip" key={tag}>
                    {tag}
                    <button
                      type="button"
                      aria-label={`Видалити тег ${tag}`}
                      onClick={() => removeSelectedTag(tag)}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
            {tagsError && <p className="form-message">{tagsError}</p>}

            <label>
              Мінімум підписників
              <input
                type="number"
                min="0"
                value={minFollowersCount}
                onChange={(event) => setMinFollowersCount(event.target.value)}
                placeholder="10000"
              />
            </label>
            <label>
              Середня кількість переглядів
              <input
                type="number"
                min="0"
                value={minAvgViews}
                onChange={(event) => setMinAvgViews(event.target.value)}
                placeholder="5000"
              />
            </label>
            <label>
              Кількість каналів
              <input
                type="number"
                min="1"
                value={resultCount}
                onChange={(event) => setResultCount(event.target.value)}
                placeholder="10"
              />
            </label>
            <button className="primary-button" type="button" onClick={runAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? 'Аналіз триває...' : 'Запустити аналіз'}
            </button>
            {analysisMessage && <p className="form-message">{analysisMessage}</p>}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default InfluencerSelection;
