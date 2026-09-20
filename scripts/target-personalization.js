function getAlloy() {
  return typeof window !== 'undefined' && typeof window.alloy === 'function'
    ? window.alloy
    : null;
}

function getTargetConfig(blockName = 'list') {
  const config = typeof window !== 'undefined' ? window.hlx?.config : undefined;
  const target = config?.target?.[blockName] || config?.target || {};
  return {
    decisionScope: target.decisionScope || 'tcs-personalized-list',
    decisionTimeout: Number(target.decisionTimeout) || 1500,
    allowedPersonas: target.allowedPersonas || '',
    allowedIntents: target.allowedIntents || '',
  };
}

function setPersonalizationAttributes(element, enabled, status, persona) {
  if (!element) return;
  if (!enabled) {
    element.removeAttribute('data-personalization');
    element.removeAttribute('data-personalization-status');
    element.removeAttribute('data-persona');
    return;
  }

  element.setAttribute('data-personalization', 'enabled');
  element.setAttribute('data-personalization-status', status);
  if (persona) element.setAttribute('data-persona', persona);
  else element.removeAttribute('data-persona');
}

function withTimeout(promise, timeout) {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = window.setTimeout(() => resolve(null), timeout);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    window.clearTimeout(timer);
  });
}

function getPropositions(response) {
  return (
    response?.propositions || response?.personalization?.propositions || []
  );
}

function extractDecision(response, scope) {
  const proposition = getPropositions(response).find(
    (entry) => entry.scope === scope,
  );
  if (!proposition) return null;
  const item = proposition.items?.find((entry) => entry?.data);
  let data = item?.data || proposition.data || item || proposition;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      data = null;
    }
  }
  if (
    data?.content
    && typeof data.content === 'object'
    && data.qualified === undefined
  ) {
    data = { ...proposition, ...data.content };
  } else if (data && typeof data === 'object') {
    data = { ...proposition, ...data };
  }
  return {
    data,
    proposition,
  };
}

function splitValues(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function isNotExpired(expiry) {
  const timestamp = new Date(expiry).valueOf();
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

function isAllowed(value, allowed) {
  return !allowed.length || allowed.includes(String(value || '').toLowerCase());
}

function isValidDecision(decision, config) {
  if (!decision?.data || decision.data.qualified !== true) return false;
  if (!isNotExpired(decision.data.expiry)) return false;
  if (!isAllowed(decision.data.persona, splitValues(config.allowedPersonas))) return false;
  if (!isAllowed(decision.data.intent, splitValues(config.allowedIntents))) return false;
  return true;
}

async function getDecision(config) {
  const alloy = getAlloy();
  if (!alloy || !config.decisionScope) return null;

  try {
    const response = await withTimeout(
      alloy('sendEvent', {
        personalization: {
          decisionScopes: [config.decisionScope],
          defaultPersonalizationEnabled: false,
        },
      }),
      config.decisionTimeout,
    );
    const decision = extractDecision(response, config.decisionScope);
    return isValidDecision(decision, config) ? decision : null;
  } catch (error) {
    return null;
  }
}

async function sendPropositionDisplay(decision) {
  const alloy = getAlloy();
  if (!alloy || !decision?.proposition) return;

  try {
    await alloy('sendEvent', {
      xdm: {
        eventType: 'decisioning.propositionDisplay',
        _experience: {
          decisioning: {
            propositions: [
              {
                id: decision.proposition.id,
                scope: decision.proposition.scope,
                scopeDetails: decision.proposition.scopeDetails,
              },
            ],
          },
        },
      },
    });
  } catch (error) {
    // Analytics failure must not affect the rendered personalized content.
  }
}

export {
  getDecision,
  getTargetConfig,
  sendPropositionDisplay,
  setPersonalizationAttributes,
};
