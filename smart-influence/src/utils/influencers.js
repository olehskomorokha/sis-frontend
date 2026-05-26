export const SAVED_INFLUENCERS_STORAGE_KEY = 'smartInfluenceSavedInfluencers';
export const RECOMMENDED_INFLUENCERS_STORAGE_KEY = 'smartInfluenceRecommendedInfluencers';

export const parseChannelsResponse = (data) => {
  const channels = Array.isArray(data)
    ? data
    : data?.channels?.$values || data?.Channels?.$values || data?.channels || data?.Channels || [];

  return Array.isArray(channels) ? channels : [];
};

export const getChannelKey = (channel) => channel.channelUrl || channel.channelName;

export const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return Number(value).toLocaleString('uk-UA');
};

export const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return `${(Number(value) * 100).toFixed(2)}%`;
};

export const readSavedInfluencers = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_INFLUENCERS_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const readRecommendedInfluencers = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RECOMMENDED_INFLUENCERS_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};
