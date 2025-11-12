import { Ionicons } from '@expo/vector-icons';
import { AudioPlayer, useAudioPlayer } from 'expo-audio';
import { memo, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { usePlayerContext } from '../providers/PlayerProvider';

const Player = () => {

    const { track } = usePlayerContext();
    if (!track) {
        return null;
    }

    const image = track.album.images?.[0];
    const player = useAudioPlayer(track?.preview_url);

    const [isPause, setIsPause] = useState(false);
    const [playerData, setPlayerData] = useState<AudioPlayer>();

    useEffect(() => {
        playTrack();
    }, [track]);

    const playTrack = async () => {
        player.seekTo(0);
        if (!track?.preview_url) {
            return;
        }
        // console.log('playTrack', JSON.stringify(player, null, 2))
        player.play();
        setPlayerData(player)
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
        // console.log('playerData', playerData);
    }

    return (
        <View style={styles.container}>
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
                    onPress={isPause ? playTrack : onPlayPause}
                    disabled={!track?.preview_url}
                    name={isPause ? 'play' : 'pause'}
                    size={22}
                    color={track?.preview_url ? 'white' : 'gray'}
                />
            </View>
        </View>
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
    title: {
        color: 'white',
    },
    subtitle: {
        color: 'lightgray',
        fontSize: 12,
    },
    image: {
        height: '100%',
        aspectRatio: 1,
        marginRight: 10,
        borderRadius: 5,
    },
});

export default memo(Player);
