import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MovieCard from '../components/MovieCard';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePaginatedMovies } from '../hooks/usePaginatedMovies';
import { searchMovies } from '../services/tmdb-service';

type Props = {
  onMoviePress: (movieId: number) => void;
};

const SearchMoviesScreen = ({onMoviePress}: Props) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const fetcher = useMemo(
    () => (page: number) => searchMovies(debouncedQuery, page),
    [debouncedQuery],
  );

  const {
    movies,
    error,
    initialLoading,
    loadingMore,
    refreshing,
    loadNext,
    refresh,
    resetAndLoad,
  } = usePaginatedMovies(fetcher);

  useEffect(() => {
    if (!debouncedQuery) {
      return;
    }
    resetAndLoad();
  }, [debouncedQuery, resetAndLoad]);

  const onEndReached = useCallback(() => {
    if (!debouncedQuery || loadingMore || initialLoading) {
      return;
    }
    loadNext();
  }, [debouncedQuery, initialLoading, loadNext, loadingMore]);

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Search movies</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by title"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      {!debouncedQuery ? (
        <View style={styles.centered}>
          <Text style={styles.message}>Start typing to search movies...</Text>
        </View>
      ) : (
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
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={styles.footerLoader} /> : null
          }
          ListEmptyComponent={
            !initialLoading ? (
              <View style={styles.centered}>
                <Text style={styles.message}>No results found.</Text>
              </View>
            ) : null
          }
        />
      )}

      {initialLoading ? <ActivityIndicator style={styles.searchLoader} /> : null}
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
  input: {
    margin: 12,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    backgroundColor: '#1e293b',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: '#cbd5e1',
  },
  footerLoader: {
    marginVertical: 16,
  },
  searchLoader: {
    marginBottom: 10,
  },
  error: {
    color: '#fca5a5',
    textAlign: 'center',
    margin: 8,
  },
});

export default SearchMoviesScreen;
