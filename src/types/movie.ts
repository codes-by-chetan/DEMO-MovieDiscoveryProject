export type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
};


export type Genre = {
  id: number;
  name: string;
};

export type MovieDetails = Movie & {
  runtime: number | null;
  genres: Genre[];
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

export type Review = {
  id: string;
  author: string;
  content: string;
  created_at: string;
};

export type PagedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};
