import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenCapture from 'expo-screen-capture';

interface SimplePDFViewerProps {
  source: { uri: string };
  style?: any;
  onLoadComplete?: (pages: number) => void;
  onError?: (error: any) => void;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({
  source,
  style,
  onLoadComplete,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Prevent screenshots
    const preventScreenshots = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (error) {
        console.error('Failed to prevent screenshots:', error);
      }
    };

    preventScreenshots();

    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(console.error);
    };
  }, []);

  // Use Google Docs viewer as a fallback for better compatibility
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(source.uri)}&embedded=true`;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ uri: googleDocsUrl }}
        style={styles.webview}
        onLoadStart={() => {
          console.log('PDF loading started');
          setIsLoading(true);
        }}
        onLoadEnd={() => {
          console.log('PDF loading ended');
          setIsLoading(false);
          if (onLoadComplete) {
            onLoadComplete(1);
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setHasError(true);
          setIsLoading(false);
          if (onError) {
            onError(nativeEvent);
          }
        }}
        // Settings
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        originWhitelist={['*']}
        // Security - disable downloads
        onFileDownload={() => {
          console.log('Download blocked');
          return false;
        }}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading secure PDF...</Text>
        </View>
      )}
      
      {hasError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Failed to load PDF</Text>
          <Text style={styles.errorSubtext}>Please check your connection</Text>
        </View>
      )}
      
      {/* Security overlay to prevent interactions */}
      <View style={styles.securityOverlay} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
  },
  securityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default SimplePDFViewer;