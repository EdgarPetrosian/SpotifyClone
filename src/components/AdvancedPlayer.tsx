import Slider from '@react-native-community/slider';
import { useAudioPlayer } from 'expo-audio';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePlayerContext } from '../providers/PlayerProvider';

const AdvancedPlayer = () => {

  const { track } = usePlayerContext();
  const player = useAudioPlayer(track?.preview_url, { downloadFirst: false });

  if (!track) {
    return null;
  }

  const image = track.album.images?.[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [statusText, setStatusText] = useState('Idle');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);

  // Update playback status
  useEffect(() => {
    const interval = setInterval(() => {
      if (!player) return;
      const { playing, isLoaded, duration, currentTime } = player;
      if (!isLoaded) {
        setStatusText('Loading...');
      } else if (playing) {
        setStatusText('Playing');
      } else {
        setStatusText('Paused');
      }

      setIsPlaying(!!playing);
      setDuration(duration || 0);
      setPosition(currentTime || 0);
    }, 500);
    return () => clearInterval(interval);
  }, [player]);

  // Play / Pause
  const handlePlayPause = useCallback(async () => {
    if (!player) return;
    if (player.playing) {
      await player.pause();
    } else {
      await player.play();
    }
  }, [player]);

  // Stop playback
  const handleStop = useCallback(async () => {
    if (!player) return;
    await player.pause();
    await player.seekTo(0);
  }, [player]);

  // Seek forward/backward
  const handleSeek = async (newPosition: number) => {
    if (!player) return;
    await player.seekTo(newPosition);
  };

  // Change volume
  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    if (player) {
      await player.setVolume(value);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎶 Advanced Audio Player</Text>
      <Text style={styles.status}>{statusText}</Text>

      {/* Progress Bar */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        minimumTrackTintColor="#1DB954"
        maximumTrackTintColor="#444"
        thumbTintColor="#1DB954"
        onSlidingComplete={handleSeek}
      />
      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => handleSeek(Math.max(position - 10, 0))}>
          <Text style={styles.buttonText}>⏪ 10s</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePlayPause}>
          <Text style={styles.buttonText}>{isPlaying ? '⏸️ Pause' : '▶️ Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => handleSeek(Math.min(position + 10, duration))}>
          <Text style={styles.buttonText}>10s ⏩</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>⏹️ Stop</Text>
        </TouchableOpacity>
      </View>

      {/* Volume Control */}
      <Text style={styles.volumeText}>🔊 Volume</Text>
      <Slider
        style={styles.volumeSlider}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#333"
        thumbTintColor="#007AFF"
        onValueChange={handleVolumeChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    margin: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  status: {
    color: '#bbb',
    fontSize: 14,
    marginVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: '#ccc',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  volumeText: {
    color: '#ccc',
    marginBottom: 4,
  },
  volumeSlider: {
    width: '100%',
  },
});

export default memo(AdvancedPlayer);
