export const INTEGRATION_CONNECTIONS_KEY = "nashir_mock_integration_connections";

function safeNormalize(value = "") {
  return String(value)
    .toLowerCase()
    .replace("whatsapp business", "whatsapp")
    .replace("googleads", "google_ads")
    .replace("metaads", "meta_ads")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getProviderKey(connection) {
  return safeNormalize(connection.providerId || connection.id || connection.name || connection.providerName || connection);
}

export function getChannelConnectionStatus(value) {
  const raw = typeof value === "string" ? value : value?.status || value?.mode || "";

  if (["connected", "connected_mock", "approved", "linked"].includes(raw)) {
    return "connected";
  }

  if (["pending", "pending_oauth", "pending_connection", "waiting"].includes(raw)) {
    return "pending_oauth";
  }

  if (["failed", "error"].includes(raw)) {
    return "failed";
  }

  return "disconnected";
}

function normalizeConnection(value, fallbackKey = "", fallbackUpdatedAt = "") {
  const providerId = safeNormalize(value?.providerId || fallbackKey);

  if (value && typeof value === "object") {
    return {
      ...value,
      providerId,
      status: getChannelConnectionStatus(value),
      updatedAt: value.updatedAt || fallbackUpdatedAt || "حالة محفوظة",
    };
  }

  return {
    providerId,
    status: getChannelConnectionStatus(value),
    updatedAt: fallbackUpdatedAt || "حالة محفوظة",
  };
}

function normalizeConnections(connections = {}, fallbackUpdatedAt = "") {
  if (Array.isArray(connections)) {
    return connections.reduce((acc, item) => {
      const key = getProviderKey(item);
      if (!key) return acc;
      acc[key] = normalizeConnection(item, key, fallbackUpdatedAt);
      return acc;
    }, {});
  }

  if (!connections || typeof connections !== "object") return {};

  return Object.entries(connections).reduce((acc, [key, value]) => {
    const normalizedKey = safeNormalize(key);
    if (!normalizedKey) return acc;
    acc[normalizedKey] = normalizeConnection(value, normalizedKey, fallbackUpdatedAt);
    return acc;
  }, {});
}

export function buildDefaultIntegrationConnections(seed = {}) {
  return normalizeConnections(seed);
}

export function readIntegrationConnections(seed = {}) {
  if (typeof window === "undefined") return buildDefaultIntegrationConnections(seed);

  try {
    const raw = window.localStorage.getItem(INTEGRATION_CONNECTIONS_KEY);
    if (!raw) return buildDefaultIntegrationConnections(seed);

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return normalizeConnections(parsed);
    }

    if (parsed?.connections && typeof parsed.connections === "object") {
      return normalizeConnections(parsed.connections, parsed.updatedAt);
    }

    if (parsed && typeof parsed === "object") {
      const legacyConnections = Object.entries(parsed).reduce((acc, [key, value]) => {
        if (["version", "source", "updatedAt", "preferredChannels", "connections"].includes(key)) {
          return acc;
        }

        acc[key] = value;
        return acc;
      }, {});

      return normalizeConnections(legacyConnections, parsed.updatedAt);
    }

    return buildDefaultIntegrationConnections(seed);
  } catch {
    return buildDefaultIntegrationConnections(seed);
  }
}

export function writeIntegrationConnections(nextConnections = {}, preferredChannels = []) {
  const normalized = normalizeConnections(nextConnections);

  if (typeof window === "undefined") return normalized;

  window.localStorage.setItem(
    INTEGRATION_CONNECTIONS_KEY,
    JSON.stringify({
      version: 1,
      source: "nashir_ui_prototype_shared_oauth_mock",
      updatedAt: new Date().toISOString(),
      preferredChannels,
      connections: normalized,
    })
  );

  window.dispatchEvent(new Event("nashir-integration-connections-updated"));

  return normalized;
}

export function upsertIntegrationConnection(connection, preferredChannels = []) {
  const current = readIntegrationConnections();
  const key = getProviderKey(connection);
  if (!key) return current;

  const next = {
    ...current,
    [key]: normalizeConnection(connection, key, new Date().toISOString()),
  };

  return writeIntegrationConnections(next, preferredChannels);
}

export function getIntegrationConnection(providerId, seed = {}) {
  const connections = readIntegrationConnections(seed);
  return connections[safeNormalize(providerId)] || null;
}
