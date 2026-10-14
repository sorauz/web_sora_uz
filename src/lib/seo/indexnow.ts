/**
 * IndexNow Protocol Client
 *
 * Automatically notifies search engines (Yandex, Bing, Naver, Seznam)
 * immediately when URLs are added, updated, or deleted.
 * Documentation: https://www.indexnow.org/documentation
 */

export const DEFAULT_INDEXNOW_KEY = "c83b49e19d7a46f28945a8df39b561c2";
export const DEFAULT_INDEXNOW_HOST = "sora.uz";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

export interface IndexNowResult {
  success: boolean;
  statusCode?: number;
  message: string;
  submittedCount: number;
  urlList: string[];
}

/**
 * Normalizes input URL strings to fully-qualified absolute URLs for sora.uz
 */
export function normalizeIndexNowUrls(urls: string | string[], host = DEFAULT_INDEXNOW_HOST): string[] {
  const list = Array.isArray(urls) ? urls : [urls];
  const uniqueUrls = new Set<string>();

  for (const raw of list) {
    if (!raw || typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      uniqueUrls.add(trimmed);
    } else {
      const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      uniqueUrls.add(`https://${host}${path}`);
    }
  }

  return Array.from(uniqueUrls);
}

/**
 * Submits updated URLs to the IndexNow protocol endpoint.
 * This runs safely and non-blockingly, catching any network issues.
 */
export async function submitToIndexNow(
  urls: string | string[],
  options?: {
    host?: string;
    key?: string;
    keyLocation?: string;
  }
): Promise<IndexNowResult> {
  const host = options?.host || process.env.INDEXNOW_HOST || DEFAULT_INDEXNOW_HOST;
  const key = options?.key || process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
  const keyLocation = options?.keyLocation || `https://${host}/${key}.txt`;

  const urlList = normalizeIndexNowUrls(urls, host);

  if (urlList.length === 0) {
    return {
      success: false,
      message: "No valid URLs provided to submit to IndexNow",
      submittedCount: 0,
      urlList: [],
    };
  }

  const payload: IndexNowPayload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // 200 OK: URL submitted successfully
    // 202 Accepted: URL received, IndexNow key is pending verification
    if (response.status === 200 || response.status === 202) {
      return {
        success: true,
        statusCode: response.status,
        message:
          response.status === 200
            ? "URLs submitted successfully to IndexNow"
            : "URLs accepted by IndexNow (key validation pending)",
        submittedCount: urlList.length,
        urlList,
      };
    }

    const text = await response.text().catch(() => "");
    return {
      success: false,
      statusCode: response.status,
      message: `IndexNow returned status ${response.status}: ${text || response.statusText}`,
      submittedCount: 0,
      urlList,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // Log error for monitoring, but never crash calling process
    console.warn(`[IndexNow Warning] Failed to dispatch URLs to IndexNow: ${message}`);
    return {
      success: false,
      message: `IndexNow dispatch failed: ${message}`,
      submittedCount: 0,
      urlList,
    };
  }
}
