import { Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Complete WebBrowser auth session if returning from OAuth redirect
WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_CONFIG = {
  // Can be populated via .env: EXPO_PUBLIC_GOOGLE_CLIENT_ID
  clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
};

export interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  error?: string;
}

/**
 * Initiates the Google OAuth flow on Mobile
 */
export async function promptGoogleAuth(): Promise<GoogleAuthResult> {
  // If no Google Client ID is configured yet, provide clear developer guidance
  if (!GOOGLE_CONFIG.clientId) {
    Alert.alert(
      'Google Cloud Credentials Needed',
      'Google Sign-In is ready on the backend and mobile app! To activate live Google sign-in with your real account, add your Google OAuth Client ID to your mobile app .env (EXPO_PUBLIC_GOOGLE_CLIENT_ID).\n\nWould you like guidance on creating your Google Cloud Client ID?',
      [{ text: 'OK' }]
    );
    return {
      success: false,
      error: 'GOOGLE_CLIENT_ID_NOT_CONFIGURED'
    };
  }

  try {
    // When clientId is set, use Google Identity OAuth endpoint
    const redirectUri = Platform.select({
      ios: 'nexora-provider:/oauthredirect',
      android: 'nexora-provider:/oauthredirect',
      default: typeof window !== 'undefined' ? window.location.origin : ''
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CONFIG.clientId)}` +
      `&response_type=id_token` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&nonce=${Math.random().toString(36).substring(2)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      // Parse id_token from URL fragment
      const fragment = result.url.split('#')[1] || result.url.split('?')[1];
      const params = new URLSearchParams(fragment);
      const idToken = params.get('id_token');

      if (idToken) {
        return { success: true, idToken };
      }
    }

    return { success: false, error: 'User cancelled or failed authentication' };
  } catch (err: any) {
    console.error('Google Auth prompt error:', err);
    return { success: false, error: err?.message || 'Google Auth Error' };
  }
}
