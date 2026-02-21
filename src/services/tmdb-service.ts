import axios from 'axios';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_REGION,
  TMDB_BASE_URL,
  TMDB_IMAGE_BASE_URL,
} from '../constants/api';
import { CastMember, Movie, MovieDetails, PagedResponse, Review } from '../types/movie';
import { env, validateEnv } from '../config/env';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 15000
});

const assertApiKey = () => {
  const validationError = validateEnv();
  if (validationError) {
    throw new Error(validationError);
  }
};

const withAuth = <T extends Record<string, unknown>>(params?: T) => ({
  api_key: env.tmdbApiKey,
  language: env.language || DEFAULT_LANGUAGE,
  region: env.region || DEFAULT_REGION,
  ...params,
});

const wait = (ms: number) => new Promise(resolve => setTimeout(() => resolve(undefined), ms));

const isRetriableError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  return error.response.status >= 500;
};

const getReadableError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return 'Unexpected error while contacting TMDB.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  if (!error.response) {
    return 'Cannot connect to TMDB. Check internet access or DNS configuration.';
  }

  if (error.response.status === 401) {
    return 'TMDB API key is invalid or unauthorized.';
  }

  if (error.response.status === 429) {
    return 'TMDB rate limit reached. Please retry in a few seconds.';
  }

  if (error.response.status >= 500) {
    return 'TMDB is temporarily unavailable. Please try again shortly.';
  }

  return `TMDB request failed (${error.response.status}).`;
};

const requestWithRetry = async <T>(
  request: () => Promise<{ data: T }>,
  retries = 2,
): Promise<T> => {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await request();
      return response.data;
    } catch (error) {
      if (attempt === retries || !isRetriableError(error)) {
        throw new Error(getReadableError(error));
      }
      await wait(400 * (attempt + 1));
      attempt += 1;
    }
  }

  throw new Error('Unexpected network state.');
};

export const imageUrl = (path: string | null) =>
  path ? `${TMDB_IMAGE_BASE_URL}${path}` : undefined;

export const fetchPopularMovies = async (page: number) => {
  assertApiKey();
  return requestWithRetry(() =>
    tmdbClient.get<PagedResponse<Movie>>('/movie/popular', {
      params: withAuth({ page }),
    }),
  );
};

export const searchMovies = async (query: string, page: number) => {
  assertApiKey();

  return requestWithRetry(() =>
    tmdbClient.get<PagedResponse<Movie>>('/search/movie', {
      params: withAuth({
        query,
        page,
        include_adult: false,
      }),
    }),

  );
};

export const fetchMovieDetailsBundle = async (
  movieId: number,
  reviewPage: number,
): Promise<{
  details: MovieDetails;
  cast: CastMember[];
  reviews: PagedResponse<Review>;
}> => {
  assertApiKey();
  return requestWithRetry(async () => {
    const [detailsResponse, creditsResponse, reviewsResponse] = await Promise.all([
      tmdbClient.get<MovieDetails>(`/movie/${movieId}`, {
        params: withAuth(),
      }),
      tmdbClient.get<{ cast: CastMember[] }>(`/movie/${movieId}/credits`, {
        params: withAuth(),
      }),
      tmdbClient.get<PagedResponse<Review>>(`/movie/${movieId}/reviews`, {
        params: withAuth({ page: reviewPage }),
      }),
    ]);

    return {
      data: {
        details: detailsResponse.data,
        cast: creditsResponse.data.cast,
        reviews: reviewsResponse.data,
      },
    };
  });
};

export const fetchMovieReviews = async (movieId: number, page: number) => {
  assertApiKey();
  return requestWithRetry(() =>
    tmdbClient.get<PagedResponse<Review>>(`/movie/${movieId}/reviews`, {
      params: withAuth({ page }),

    }),
  );
};
