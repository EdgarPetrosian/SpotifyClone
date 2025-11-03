import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import TrackListItem from '@/src/components/TrackListItem';
import { tracks } from '@/src/constants/tracks';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabSearchScreen() {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name="search" size={16} color="gray" />
        <TextInput
          value={search}
          placeholder="What do you want to listen to?"
          onChangeText={setSearch}
          style={styles.input}
        />
        <Text>Cancel</Text>
      </View>

      <FlatList
        data={tracks}
        renderItem={({ item }) => <TrackListItem track={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#121314',
    color: 'white',
    flex: 1,
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 5,
  },
});
