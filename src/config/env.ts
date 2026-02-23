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
  console.log('[ENV] TMDB_API_KEY:', TMDB_API_KEY ? 'SET' : 'MISSING');
  console.log('[ENV] TMDB_LANGUAGE:', TMDB_LANGUAGE || 'MISSING');
  console.log('[ENV] TMDB_REGION:', TMDB_REGION || 'MISSING');
  
  if (!TMDB_API_KEY) {
    const errorMsg = 'TMDB_API_KEY is missing. Add it to your .env file and rebuild.';
    console.error('[ENV]', errorMsg);
    return errorMsg;
  }
  return null;
};
