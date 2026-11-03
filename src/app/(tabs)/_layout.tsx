import React from 'react';
import { Tabs } from 'expo-router';
import { NexoraTabBar } from '@/components/navigation/NexoraTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <NexoraTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dispatches',
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
