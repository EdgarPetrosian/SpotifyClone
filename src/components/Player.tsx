import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';

import { tracks } from '@/src/constants/tracks';
import { usePlayerContext } from '../providers/PlayerProvider';
const { width, height } = Dimensions.get('window');

const Player = () => {

    const { track } = usePlayerContext();
    if (!track) {
        return null;
    }

    const image = track.album.images?.[0];
    const player = useAudioPlayer(track?.preview_url);
    const status = useAudioPlayerStatus(player);
    const [isPause, setIsPause] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [statusText, setStatusText] = useState('Idle');
    const [currentIndex, setCurrentIndex] = useState(0);

    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);

    const [showScreen, setShowScreen] = useState(false);
    const translateY = useRef(new Animated.Value(height)).current;

    const openScreen = () => {
        setShowScreen(true);
        Animated.timing(translateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    const closeScreen = () => {
        Animated.timing(translateY, {
            toValue: height,
            duration: 400,
            useNativeDriver: true,
        }).start(() => setShowScreen(false));
    };

    useEffect(() => {
        playTrack();
    }, [track]);

    useEffect(() => {
        if (!status.playing && !isPause) {
            setIsPause(true)
        }
    }, [status.playing]);

    // Update playback status
    useEffect(() => {
        const interval = setInterval(() => {
            if (!player) return;
            const { playing, isLoaded, duration, currentTime } = player;
            if (!track.preview_url) {
                return setStatusText("Preview not available");
            }
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

    const playTrack = async () => {
        player.seekTo(0);
        if (!track?.preview_url) {
            return;
        }
        player.play();
        setIsPause(player?.paused)
    };

    const onPlayPause = async () => {
        if (!track?.preview_url) {
            return;
        }

        player.pause();
        setIsPause(player?.paused)
    };

    const addToFavorite = () => {
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Play / Pause
    const handlePlayPause = useCallback(() => {
        if (!player) return;
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
    }, [player]);

    // Play / Next
    const handlePlayNext = useCallback(() => {
        const nextIndex = (currentIndex + 1) % tracks.length;
        const nextTrack = tracks[nextIndex];
        setCurrentIndex(nextIndex);
        if (!nextTrack?.preview_url) {
            console.warn("No preview available for next track");
            return;
        }
        // 🔥 THIS IS THE IMPORTANT LINE
        player.play();
    }, [currentIndex, player]);

    // Seek forward/backward
    const handleSeek = async (newPosition: number) => {
        if (!player) return;
        await player.seekTo(newPosition);
    };

    const toggleMute = () => {
        if (!player) return;

        if (muted) {
            player.volume = 1.0;   // unmute (or your previous volume)
            setMuted(false);
        } else {
            player.volume = 0.0;   // mute
            setMuted(true);
        }
    };

    // 👇 Detect swipe down
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) {
                    translateY.setValue(gesture.dy); // follow finger
                }
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 120) {
                    // if swiped down enough, close
                    closeScreen();
                } else {
                    // otherwise snap back
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <>
            <TouchableOpacity style={styles.container}
                onPress={openScreen}>
                <View style={styles.player}>
                    {image && <Image source={{ uri: image.url }} style={styles.image} />}

                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>{track.name}</Text>
                        <Text style={styles.subtitle}>{track.artists[0]?.name}</Text>
                    </View>

                    <Ionicons
                        onPress={addToFavorite}
                        name={'heart-outline'}
                        size={20}
                        color={'white'}
                        style={{ marginHorizontal: 10 }}
                    />
                    <Ionicons
                        onPress={isPlaying ? onPlayPause : playTrack}
                        disabled={!track?.preview_url}
                        name={isPlaying ? 'pause' : 'play'}
                        size={22}
                        color={track?.preview_url ? 'white' : 'gray'}
                    />
                </View>
            </TouchableOpacity>
            {showScreen && (
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.overlay,
                        { transform: [{ translateY }] },
                    ]}
                >
                    <Text style={styles.modalText}>Now Playing</Text>
                    {image && <Image source={{ uri: image.url }} style={styles.nowPlayingImage} />}
                    <Text style={styles.titleAnimatedView}>{track.name}</Text>
                    <View>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={duration || 1}
                            value={position}
                            minimumTrackTintColor="#ffffff"
                            maximumTrackTintColor="rgba(242, 242, 242, 0.2)"
                            thumbTintColor="#ffffff"
                            onSlidingComplete={handleSeek}
                        />
                        <View style={{ width: width / 1.2, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#fff' }}>{formatTime(status.currentTime)}</Text>
                            <Text style={{ color: '#fff' }}>{formatTime(status.duration)}</Text>
                        </View>
                    </View>
                    <View style={styles.controls}>
                        <View />
                        <TouchableOpacity style={styles.buttonPlay} onPress={handlePlayPause}>
                            <Ionicons
                                disabled={!track?.preview_url}
                                name={isPlaying ? 'pause' : 'play'}
                                size={60}
                                color={track?.preview_url ? 'white' : 'gray'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonPlayNext} onPress={handlePlayNext}>
                            <Ionicons
                                disabled={!track?.preview_url}
                                name={'play'}
                                size={60}
                                color={track?.preview_url ? 'white' : 'gray'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonVolume} onPress={toggleMute}>
                            <Ionicons
                                disabled={!track?.preview_url}
                                name={muted ? "volume-mute" : "volume-high"}
                                size={50}
                                color={'white'}
                            />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        top: -75,
        height: 75,
        padding: 10,
    },
    player: {
        backgroundColor: '#286660',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
        padding: 3,
        paddingRight: 15,
    },
    titleAnimatedView: {
        color: 'white',
        paddingHorizontal: 20
    },
    title: {
        color: 'white',
        paddingTop: 10
    },
    subtitle: {
        color: 'lightgray',
        fontSize: 12,
        paddingBottom: 10
    },
    image: {
        height: '100%',
        aspectRatio: 1,
        marginRight: 10,
        borderRadius: 5,
    },
    nowPlayingImage: {
        height: '50%',
        aspectRatio: 1,
        marginRight: 10,
        borderRadius: 5,
    },
    buttonPlay: {
        backgroundColor: '#222',
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#222',
        padding: 12,
        borderRadius: 8
    },
    text: {
        color: '#fff',
        fontSize: 16
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        top: -1 * height,
        backgroundColor: '#b23739',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

        paddingTop: 150,
        paddingBottom: 150,
        elevation: 5,
        zIndex: 100
    },
    modalText: {
        fontSize: 20,
        marginBottom: 20,
        color: "#fff",
    },
    closeButton: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginVertical: 15,
        paddingRight: 30
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    slider: {
        width: width / 1.2,
        height: 20,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonPlayNext: {
        borderRightWidth: 2,
        borderRightColor: '#fff',
        justifyContent: 'center',
        height: 60
    },
    buttonVolume: {
        justifyContent: 'center',
        height: 60
    },
});

export default memo(Player);
