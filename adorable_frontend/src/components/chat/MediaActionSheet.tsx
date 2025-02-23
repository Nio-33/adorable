import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Camera, Image as ImageIcon, Video, X } from 'lucide-react-native';
import { Icon } from '../common/Icon';

interface MediaActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectPhoto: () => void;
  onTakePhoto: () => void;
  onSelectVideo: () => void;
  onRecordVideo: () => void;
}

export const MediaActionSheet: React.FC<MediaActionSheetProps> = ({
  visible,
  onClose,
  onSelectPhoto,
  onTakePhoto,
  onSelectVideo,
  onRecordVideo,
}) => {
  if (Platform.OS === 'ios') {
    if (visible) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose Photo', 'Record Video', 'Choose Video'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              onTakePhoto();
              break;
            case 2:
              onSelectPhoto();
              break;
            case 3:
              onRecordVideo();
              break;
            case 4:
              onSelectVideo();
              break;
          }
        }
      );
    }
    return null;
  }

  if (!visible) {return null;}

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Share Media</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon icon={X} size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.options}>
          <TouchableOpacity style={styles.option} onPress={onTakePhoto}>
            <Icon icon={Camera} size={32} color="#007AFF" />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onSelectPhoto}>
            <Icon icon={ImageIcon} size={32} color="#007AFF" />
            <Text style={styles.optionText}>Choose Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onRecordVideo}>
            <Icon icon={Video} size={32} color="#007AFF" />
            <Text style={styles.optionText}>Record Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onSelectVideo}>
            <Icon icon={Video} size={32} color="#007AFF" />
            <Text style={styles.optionText}>Choose Video</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  option: {
    width: '50%',
    padding: 16,
    alignItems: 'center',
  },
  optionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1a1a1a',
  },
});
