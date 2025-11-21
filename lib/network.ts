// lib/network.ts
/**
 * A robust fetch wrapper that throws on HTTP errors and safely parses JSON responses.
 * This centralizes error handling and simplifies API calls in components.
 *
 * @param input RequestInfo | URL
 * @param init RequestInit
 * @returns A promise that resolves to the parsed JSON data.
 */
export async function safeFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const responseText = await response.text();

  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    if (responseText) {
      try {
        // Try to parse a structured error from the response body
        const errorJson = JSON.parse(responseText);
        errorMsg = errorJson.error || errorJson.message || responseText.slice(0, 200);
      } catch {
        // The error response was not JSON, use the raw text
        errorMsg = responseText.slice(0, 200);
      }
    }
    throw new Error(errorMsg);
  }

  if (!responseText) {
    // Handle successful but empty responses (e.g. 204 No Content)
    return null as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch (e) {
    throw new Error(`Failed to parse successful JSON response: ${responseText.slice(0, 200)}`);
  }
}
