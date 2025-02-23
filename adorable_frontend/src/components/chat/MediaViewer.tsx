import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import { X, Play, Pause } from 'lucide-react-native';
import { Icon } from '../common/Icon';

interface MediaViewerProps {
  visible: boolean;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  visible,
  mediaUrl,
  mediaType,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setLoading(false);
  };

  const togglePlayPause = () => {
    setPlaying(!playing);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon icon={X} size={24} color="#fff" />
        </TouchableOpacity>

        {mediaType === 'image' ? (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.media}
            resizeMode="contain"
            onLoadEnd={handleLoadEnd}
          />
        ) : (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: mediaUrl }}
              style={styles.media}
              resizeMode="contain"
              paused={!playing}
              onLoad={handleLoadEnd}
              onError={handleVideoError}
              repeat={true}
              controls={Platform.OS === 'android'}
            />
            {Platform.OS === 'ios' && !loading && !videoError && (
              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={togglePlayPause}
              >
                <Icon
                  icon={playing ? Pause : Play}
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  media: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
}); 