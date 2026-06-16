const API_BASE_URL = 'http://localhost:5001/api';

export async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${input}`, init);

  if (!response.ok) {
    const fallbackMessage = 'Request failed';

    try {
      const data = (await response.json()) as { error?: { message?: string } };
      throw new Error(data.error?.message ?? fallbackMessage);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(fallbackMessage);
    }
  }

  return (await response.json()) as T;
}
