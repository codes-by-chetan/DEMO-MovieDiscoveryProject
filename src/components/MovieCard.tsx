import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Movie} from '../types/movie';
import { imageUrl } from '../services/tmdb-service';

type Props = {
  movie: Movie;
  onPress: (movieId: number) => void;
};

const MovieCard = ({movie, onPress}: Props) => {
  return (
    <Pressable style={styles.card} onPress={() => onPress(movie.id)}>
      <Image
        source={movie.poster_path ? {uri: imageUrl(movie.poster_path)} : undefined}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {movie.title}
        </Text>
        <Text style={styles.meta}>{movie.release_date || 'Unknown date'}</Text>
        <Text style={styles.meta}>⭐ {movie.vote_average.toFixed(1)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
  },
  poster: {
    width: 90,
    height: 130,
    backgroundColor: '#374151',
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  title: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: '#d1d5db',
    fontSize: 13,
  },
});

export default React.memo(MovieCard);
