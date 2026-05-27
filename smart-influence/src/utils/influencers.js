export const parseChannelsResponse = (data) => {
  const channels = Array.isArray(data)
    ? data
    : data?.channels?.$values || data?.Channels?.$values || data?.channels || data?.Channels || [];

  return Array.isArray(channels) ? channels : [];
};

export const getChannelKey = (channel) =>
  channel.channelUrl || channel.channelName || channel.channelId || channel.ChannelId;

export const getClientIdFromToken = (token) => {
  const normalizedToken = typeof token === 'string' ? token.trim() : '';

  if (!normalizedToken) {
    return '';
  }

  try {
    const payload = normalizedToken.split('.')[1];

    if (!payload) {
      return '';
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );
    const decodedPayload = JSON.parse(atob(paddedPayload));

    return (
      decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      decodedPayload.nameidentifier ||
      decodedPayload.nameid ||
      decodedPayload.sub ||
      ''
    );
  } catch {
    return '';
  }
};

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
