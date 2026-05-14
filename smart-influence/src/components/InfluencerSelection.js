import { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import '../App.css';

const TAGS_API_URL = 'https://localhost:7237/api/Tag';

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
  const [analysisMessage, setAnalysisMessage] = useState('');
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

  const showUnavailableMessage = () => {
    setAnalysisMessage('Ця функціональність ще не працює. Вона буде доступна у наступній версії.');
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
            <input
              type="text"
              placeholder="Наприклад: натуральна косметика для молодої аудиторії в Європі"
            />
          </label>

          <div className="filters">
            <h3>Налаштування та фільтри</h3>
            <label>
              Платформа
              <select defaultValue="facebook">
                <option value="facebook">Facebook</option>
              </select>
            </label>
            <label>
              Країна
              <input type="text" placeholder="Україна / Poland / Germany" />
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
              <input type="number" placeholder="10000" />
            </label>
            <label>
              Максимум підписників
              <input type="number" placeholder="500000" />
            </label>
            <label>
              <span className="label-with-tooltip">
                Мін. engagement rate (%)
                <span className="tooltip-wrapper">
                  <button
                    className="info-tooltip-button"
                    type="button"
                    aria-label="Що таке engagement rate"
                  >
                    i
                  </button>
                  <span className="tooltip-content" role="tooltip">
                    Engagement rate показує, яка частка аудиторії взаємодіє з контентом:
                    ставить вподобання, коментує або поширює дописи. Вищий показник
                    означає активнішу аудиторію.
                  </span>
                </span>
              </span>
              <input type="number" min="0" max="100" step="0.1" placeholder="2.5" />
            </label>
            <button className="primary-button" type="button" onClick={showUnavailableMessage}>
              Запустити аналіз
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
