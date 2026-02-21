import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

type Props = {
  movieId: number;
  movieTitle: string;
  onDone: () => void;
};


type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${progress}%` }]} />
    </View>
  );
};


const UserReviewScreen = ({ movieId, movieTitle, onDone: _onDone }: Props) => {
  const [author, setAuthor] = useState('');
  const [review, setReview] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const disabled = useMemo(
    () =>
      uploadState === 'uploading' ||
      !author.trim() ||
      review.trim().length < 20 ||
      !imageUri,
    [author, imageUri, review, uploadState],
  );

  const pickImage = async () => {
    setFeedback(null);

    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (response.didCancel) {
      setFeedback('Image selection cancelled.');
      return;
    }

    if (response.errorCode) {
      setFeedback(`Image picker failed: ${response.errorCode}`);
      return;
    }

    const uri = response.assets?.[0]?.uri;
    if (!uri) {
      setFeedback('No image selected. Please pick an image.');
      return;
    }

    setImageUri(uri);
    setFeedback('Image selected successfully.');

  };


  const submit = () => {
    setUploadState('uploading');
    setUploadProgress(0);
    setFeedback('Uploading your review...');

    const shouldFail = review.toLowerCase().includes('#fail');
    let progress = 0;

    const timer = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(timer);
        if (shouldFail) {
          setUploadState('error');
          setFeedback('Upload failed. Remove #fail from text and try again.');
          return;
        }

        setUploadState('success');
        setFeedback(`Review uploaded for ${movieTitle} (ID: ${movieId}).`);
      }
    }, 300);
  };

  return (

    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Post a review</Text>
          <Text style={styles.subtitle}>{movieTitle}</Text>

          <TextInput
            value={author}
            onChangeText={setAuthor}
            placeholder="Your name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Write at least 20 characters"
            placeholderTextColor="#94a3b8"
            style={[styles.input, styles.multiline]}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Pressable style={styles.secondaryButton} onPress={pickImage}>
            <Text style={styles.buttonText}>Pick image from gallery</Text>
          </Pressable>

          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          ) : null}

          {uploadState === 'uploading' ? <ProgressBar progress={uploadProgress} /> : null}

          <Pressable
            disabled={disabled}
            onPress={submit}
            style={[styles.button, disabled && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>
              {uploadState === 'uploading' ? 'Uploading...' : 'Upload review'}
            </Text>
          </Pressable>


          {feedback ? (
            <Text
              style={[
                styles.feedback,
                uploadState === 'error' && styles.error,
                uploadState === 'success' && styles.success,
              ]}>
              {feedback}
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View >
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 12,
  },
  keyboardContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    marginTop: 12,
    marginBottom: 16,
    color: '#cbd5e1',
    fontStyle: 'italic',
    fontSize: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    backgroundColor: '#1e293b',
    marginBottom: 12,
  },
  multiline: {
    minHeight: 140,
  },
  button: {
    marginTop: 4,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 10,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#475569',
  },
  buttonText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
  preview: {
    marginTop: 12,
    height: 160,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  progressTrack: {
    marginTop: 12,
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  feedback: {
    marginTop: 10,
    color: '#cbd5e1',
  },
  error: {
    color: '#fca5a5',
  },
  success: {
    color: '#86efac',
  },
});

export default UserReviewScreen;
