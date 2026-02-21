import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CastMember, MovieDetails, Review } from '../types/movie';
import { fetchMovieDetailsBundle, fetchMovieReviews, imageUrl } from '../services/tmdb-service';
import ReviewItem from '../components/ReviewItem';

type Props = {
  movieId: number;
  onWriteReview: (movieId: number, movieTitle: string) => void;
};

const MovieDetailsScreen = ({ movieId, onWriteReview }: Props) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const bundle = await fetchMovieDetailsBundle(movieId, 1);

        if (!mounted) {
          return;
        }

        setDetails(bundle.details);
        setCast(bundle.cast.slice(0, 10));
        setReviews(bundle.reviews.results);
        setReviewsPage(bundle.reviews.page);
        setReviewTotalPages(bundle.reviews.total_pages);
      } catch (caughtError) {
        if (mounted) {
          const message = caughtError instanceof Error ? caughtError.message : 'Failed to load movie details.';
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [movieId]);

  const loadMoreReviews = useCallback(async () => {
    if (loadingMoreReviews || reviewsPage >= reviewTotalPages) {
      return;
    }

    try {
      setLoadingMoreReviews(true);
      const response = await fetchMovieReviews(movieId, reviewsPage + 1);
      setReviews(current => [...current, ...response.results]);
      setReviewsPage(response.page);
      setReviewTotalPages(response.total_pages);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to load more reviews.';
      setError(message);
    } finally {
      setLoadingMoreReviews(false);
    }
  }, [loadingMoreReviews, movieId, reviewTotalPages, reviewsPage]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || 'No data found.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={details.backdrop_path ? { uri: imageUrl(details.backdrop_path) } : undefined}
          style={styles.backdrop}
        />
        <Text style={styles.title}>{details.title}</Text>
        <Text style={styles.meta}>
          {details.release_date} • {details.runtime ?? 'N/A'} min
        </Text>
        <Text style={styles.meta}>Genres: {details.genres.map(g => g.name).join(', ')}</Text>
        <Text style={styles.meta}>
          Rating: {details.vote_average.toFixed(1)} ({details.vote_count} votes)
        </Text>
        <Text style={styles.overview}>{details.overview || 'No overview available.'}</Text>



        <Text style={styles.sectionTitle}>Cast</Text>
        <FlatList
          horizontal
          data={cast}
          keyExtractor={item => `${item.id}-${item.character}`}
          renderItem={({ item }) => (
            <View style={styles.castCard}>
              <Image
                source={
                  item.profile_path
                    ? { uri: imageUrl(item.profile_path)! }
                    : require('../../assets/avatar.png')
                }
                style={styles.castImage}
              />
              <Text numberOfLines={1} style={styles.castName}>
                {item.name}
              </Text>
              <Text numberOfLines={1} style={styles.castCharacter}>
                {item.character}
              </Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />

        <Text style={styles.sectionTitle}>Reviews</Text>
        <Pressable
          style={styles.button}
          onPress={() => onWriteReview(details.id, details.title)}>
          <Text style={styles.buttonText}>Post a review</Text>
        </Pressable>
        {reviews.length === 0 ? (
          <Text style={styles.meta}>No reviews yet.</Text>
        ) : (
          reviews.map(review => <ReviewItem key={`${review.id}-${review.created_at}`} review={review} />)
        )}

        {reviewsPage < reviewTotalPages ? (
          <Pressable style={styles.loadMoreButton} onPress={loadMoreReviews}>
            <Text style={styles.buttonText}>
              {loadingMoreReviews ? 'Loading...' : 'Load more reviews'}
            </Text>
          </Pressable>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 12,
    paddingBottom: 24,
    gap: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    height: 220,
    borderRadius: 14,
    backgroundColor: '#334155',
  },
  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '800',
  },
  meta: {
    color: '#cbd5e1',
  },
  overview: {
    color: '#e2e8f0',
    lineHeight: 21,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    color: '#f8fafc',
    fontSize: 19,
    fontWeight: '700',
  },
  castCard: {
    width: 110,
    marginRight: 12,
  },
  castImage: {
    width: 110,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  castName: {
    color: '#f8fafc',
    marginTop: 6,
  },
  castCharacter: {
    color: '#94a3b8',
    fontSize: 12,
  },
  
  button: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  loadMoreButton: {
    marginTop: 10,
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
  error: {
    color: '#fca5a5',
  },
});

export default MovieDetailsScreen;
