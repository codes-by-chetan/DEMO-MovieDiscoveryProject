import {
  TMDB_API_KEY,
  TMDB_LANGUAGE,
  TMDB_REGION,
} from '@env';

export const env = {
  tmdbApiKey: TMDB_API_KEY,
  language: TMDB_LANGUAGE,
  region: TMDB_REGION,
};

export const validateEnv = () => {
  console.log('hello',TMDB_API_KEY)
  if (!TMDB_API_KEY) {
    return 'TMDB_API_KEY is missing. Add it to your .env file.';
  }
  return null;
};
