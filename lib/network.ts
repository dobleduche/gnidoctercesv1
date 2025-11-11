// lib/network.ts
/**
 * A robust fetch wrapper that safely parses JSON responses.
 * It reads the response as text, then attempts to parse it as JSON.
 * This prevents errors from malformed JSON or non-JSON responses (like HTML error pages).
 * 
 * @param input RequestInfo | URL
 * @param init RequestInit
 * @returns A promise that resolves to an object containing the original Response and the parsed data.
 */
export async function safeFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<{ response: Response, data: T }> {
  const response = await fetch(input, init);
  const rawText = await response.text();
  
  let data: T;

  try {
    if (!rawText) {
        // Create a default error structure if the body is empty.
        data = { error: "Received empty response from server." } as T;
    } else {
        data = JSON.parse(rawText.trim()) as T;
    }
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Problematic content:', `"${rawText.slice(0, 500)}..."`);
    // If parsing fails, construct an error object to be returned.
    // The caller can then inspect response.ok to decide how to proceed.
    data = { error: `Failed to parse JSON. Server returned: ${rawText.slice(0, 200)}` } as T;
  }
  
  return { response, data };
}
