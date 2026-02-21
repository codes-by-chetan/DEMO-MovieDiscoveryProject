import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Modal, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MovieDetailsScreen from '../screens/MovieDetailsScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import UserReviewScreen from '../screens/UserReviewScreen';

type Route =
  | { name: 'Home' }
  | { name: 'MovieDetails'; movieId: number }
  | { name: 'PostReview'; movieId: number; movieTitle: string };

type HomeTabsProps = {
    activeTab: 'popular' | 'search';
  openMovie: (movieId: number) => void;
   onTabPress: (tab: 'popular' | 'search') => void;
};

const HomeTabs = ({ openMovie,onTabPress,activeTab }: HomeTabsProps) => {

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ flex: 1, display: activeTab === 'popular' ? 'flex' : 'none' }}>
          <HomeScreen onMoviePress={openMovie} />
        </View>
        <View style={{ flex: 1, display: activeTab === 'search' ? 'flex' : 'none' }}>
          <SearchScreen onMoviePress={openMovie} />
        </View>
      </View>


      <View style={styles.tabBar}>
        <Pressable
          onPress={() => onTabPress('popular')}
          style={[styles.tab, activeTab === 'popular' && styles.tabActive]}>
          <Text
            style={[styles.tabText, activeTab === 'popular' && styles.tabTextActive]}>
            Popular
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onTabPress('search')}
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}>
          <Text
            style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
            Search
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<Route[]>([{ name: 'Home' }]);
  const [networkVisible, setNetworkVisible] = useState(false);
const [tabHistory, setTabHistory] = useState<Array<'popular' | 'search'>>([]);
  const [activeTab, setActiveTab] = useState<'popular' | 'search'>('popular');

  const lastUiNavActionAt = useRef(0);
  
  useEffect(() => {
    const handler = () => setNetworkVisible(true);
    networkHandlers.push(handler);
    return () => {
      const idx = networkHandlers.indexOf(handler);
      if (idx >= 0) networkHandlers.splice(idx, 1);
    };
  }, []);

  const currentRoute = history[history.length - 1];

  const goBack = useCallback(() => {
    lastUiNavActionAt.current = Date.now();
    setHistory(current => (current.length > 1 ? current.slice(0, -1) : current));
  },[]);

    const handleTabPress = useCallback((tab: 'popular' | 'search') => {
    setActiveTab(current => {
      if (current === tab) {
        return current;
      }

      lastUiNavActionAt.current = Date.now();
      setTabHistory(existing => [...existing, current]);
      return tab;
    });
  }, []);

   const handleHardwareBack = useCallback(() => {
    if (Date.now() - lastUiNavActionAt.current < 350) {
      return true;
    }

    if (currentRoute.name !== 'Home') {
      goBack();
      return true;
    }

    if (tabHistory.length > 0) {
      const previousTab = tabHistory[tabHistory.length - 1];
      setTabHistory(current => current.slice(0, -1));
      setActiveTab(previousTab);
      return true;
    }

    return false;
  }, [currentRoute.name, goBack, tabHistory]);

  
  useEffect(() => {

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);

    return () => subscription.remove();
  }, [handleHardwareBack]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
  },[])
  
  const openMovie = (movieId: number) => {
    setHistory(current => [...current, { name: 'MovieDetails', movieId }]);
  };

  const openPostReview = (movieId: number, movieTitle: string) => {
    setHistory(current => [...current, { name: 'PostReview', movieId, movieTitle }]);
  };

  const headerTitle = useMemo(() => {
    if (currentRoute.name === 'MovieDetails') {
      return 'Movie details';
    }
    if (currentRoute.name === 'PostReview') {
      return 'Write review';
    }
    return 'Movie Discovery';
  }, [currentRoute.name]);


  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {currentRoute.name !== 'Home' ? (
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
      ) : null}

      <View style={styles.content}>
        {currentRoute.name === 'Home' && (
          <HomeTabs onTabPress={handleTabPress} activeTab={activeTab}openMovie={openMovie} />
        )}

        {currentRoute.name === 'MovieDetails' && (
          <MovieDetailsScreen
            movieId={currentRoute.movieId}
            onWriteReview={openPostReview}
          />
        )}

        {currentRoute.name === 'PostReview' && (
          <UserReviewScreen
            movieId={currentRoute.movieId}
            movieTitle={currentRoute.movieTitle}
            onDone={goBack}
          />
        )}
      </View>
        <NetworkPopover visible={networkVisible} onClose={() => setNetworkVisible(false)} />
    </View>
  );
};

  const networkHandlers: Array<() => void> = [];

  export function showNetworkPopover() {
    networkHandlers.forEach(h => h());
  }

  const NetworkPopover = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    return (
      <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Can't load data?</Text>
            <Text style={styles.modalText}>
              If movie data isn't appearing, your network may be forcing a public DNS
              (for example dns.google). Try switching your device to your private DNS provider.
              See the project README for detailed steps.
            </Text>
            <View style={styles.modalActions}>
              <Pressable onPress={onClose} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  backButtonText: {
    color: '#93c5fd',
    fontWeight: '700',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#eff6ff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0b1220',
    borderRadius: 12,
    padding: 16,
    maxWidth: 520,
    width: '100%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalText: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#93c5fd',
    fontWeight: '700',
  },
});

export default AppNavigator;
