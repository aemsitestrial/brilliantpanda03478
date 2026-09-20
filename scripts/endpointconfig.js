function getConfigValue(key, fallback) {
  const config = typeof window !== 'undefined' ? window.hlx?.config : undefined;
  return config?.[key] ?? fallback;
}

// Endpoint configuration functions
function getAEMPublish() {
  return getConfigValue('aem.publish', '');
}

function getAEMAuthor() {
  return getConfigValue('aem.author', '');
}

export { getAEMPublish, getAEMAuthor };
