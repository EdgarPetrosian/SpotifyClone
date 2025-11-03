import { Tabs } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { HapticTab } from '@/src/components/haptic-tab';
import Player from '@/src/components/Player';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#000000',
        },
      }}
      tabBar={(props) => (
        <View>
          <Player />
          <BottomTabBar {...props} />
        </View>
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
