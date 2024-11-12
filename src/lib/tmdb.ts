const API_KEY = '194d885d6be15594b97e2d1f3b2526be';
const BASE_URL = 'https://api.themoviedb.org/3';

// Create a cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function cachedFetch(url: string, signal?: AbortSignal) {
  const cacheKey = url;
  
  if (apiCache.has(cacheKey)) {
    const { data, timestamp } = apiCache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
    apiCache.delete(cacheKey);
  }

  const response = await fetch(url, { 
    signal,
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'public, max-age=300'
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Only cache successful responses
  if (response.ok) {
    apiCache.set(cacheKey, { 
      data, 
      timestamp: Date.now() 
    });
  }

  return data;
}

export async function fetchHorrorMovies(page = 1, year?: number, signal?: AbortSignal) {
  const yearQuery = year ? `&primary_release_year=${year}` : '';
  const url = `${BASE_URL}/discover/movie?` +
    `api_key=${API_KEY}` +
    `&with_genres=27` +
    `${yearQuery}` +
    `&page=${page}` +
    `&sort_by=popularity.desc` +
    `&include_adult=false` +
    `&include_video=true` +
    `&language=en-US`;

  return cachedFetch(url, signal);
}

export async function fetchMovieDetails(movieId: number, signal?: AbortSignal) {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`;
  return cachedFetch(url, signal);
}

export async function fetchMovieTrailer(movieId: number, signal?: AbortSignal) {
  const url = `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`;
  const data = await cachedFetch(url, signal);
  return data.results.find((video: any) => 
    video.type === 'Trailer' && video.site === 'YouTube'
  ) || data.results[0];
}