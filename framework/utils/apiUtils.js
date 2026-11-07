export async function getJson(url, requestOptions = {}) {
  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText} (${url})`);
  }

  return response.json();
}
