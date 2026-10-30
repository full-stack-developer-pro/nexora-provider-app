import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraColors } from '@/constants/theme';

export default function IndexScreen() {
  const { provider, isLoading, status } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <NexoraLogo size="xl" subtitle="PARTNER & SELLER ECOSYSTEM" inverted={true} />
        <ActivityIndicator
          size="large"
          color={NexoraColors.primary}
          style={styles.spinner}
        />
      </View>
    );
  }

  if (!provider) {
    return <Redirect href="/(auth)/login" />;
  }

  if (status === 'approved') {
    return <Redirect href="/(tabs)" />;
  }

  if (!provider.primaryCategory) {
    return <Redirect href="/onboarding/trades" />;
  }

  if (!provider.documents || provider.documents.length === 0) {
    return <Redirect href="/onboarding/kyc" />;
  }

  return <Redirect href="/onboarding/pending" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NexoraColors.midnightDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 32,
  },
});
