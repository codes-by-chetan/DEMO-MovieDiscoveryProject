import React, {useCallback, useEffect} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MovieCard from '../components/MovieCard';
import {usePaginatedMovies} from '../hooks/usePaginatedMovies';
import { fetchPopularMovies } from '../services/tmdb-service';

type Props = {
  onMoviePress: (movieId: number) => void;
};

const PopularMoviesScreen = ({onMoviePress}: Props) => {
  const {
    movies,
    error,
    initialLoading,
    loadingMore,
    refreshing,
    loadNext,
    refresh,
    resetAndLoad,
  } = usePaginatedMovies(fetchPopularMovies);

  useEffect(() => {    
    resetAndLoad();
  }, [resetAndLoad]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && !initialLoading) {
      loadNext();
    }
  }, [initialLoading, loadNext, loadingMore]);

  if (initialLoading && movies.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={movies}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <MovieCard movie={item} onPress={onMoviePress} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.6}
        refreshing={refreshing}
        onRefresh={refresh}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={11}
        ListHeaderComponent={
          <Text style={styles.header}>Popular movies</Text>
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={styles.footerLoader} /> : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No movies found.</Text>
          </View>
        }
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginHorizontal: 12,
    marginTop: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    marginVertical: 16,
  },
  emptyText: {
    color: '#cbd5e1',
  },
  error: {
    color: '#fca5a5',
    textAlign: 'center',
    margin: 8,
  },
});

export default PopularMoviesScreen;
