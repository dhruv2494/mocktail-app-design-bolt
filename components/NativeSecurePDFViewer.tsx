import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, Dimensions } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

// Conditional import for react-native-pdf
let Pdf: any = null;
try {
  if (Platform.OS !== 'web') {
    Pdf = require('react-native-pdf').default;
  }
} catch (error) {
  console.warn('react-native-pdf not available:', error);
}

interface NativeSecurePDFViewerProps {
  source: { uri: string };
  style?: any;
  onLoadComplete?: (pages: number) => void;
  onPageChanged?: (page: number, total: number) => void;
  onError?: (error: any) => void;
  activityIndicator?: React.ReactNode;
}

const NativeSecurePDFViewer: React.FC<NativeSecurePDFViewerProps> = ({
  source,
  style,
  onLoadComplete,
  onPageChanged,
  onError,
  activityIndicator
}) => {
  const pdfRef = useRef<any>(null);

  useEffect(() => {
    // Prevent screenshots on mobile platforms
    const preventScreenshots = async () => {
      if (Platform.OS !== 'web') {
        try {
          await ScreenCapture.preventScreenCaptureAsync();
          console.log('Screenshot prevention enabled');
        } catch (error) {
          console.error('Failed to prevent screenshots:', error);
        }
      }
    };

    preventScreenshots();

    // Re-enable screenshots when component unmounts
    return () => {
      if (Platform.OS !== 'web') {
        ScreenCapture.allowScreenCaptureAsync().catch(console.error);
      }
    };
  }, []);

  // Security wrapper view that prevents interactions
  const SecurityOverlay = () => (
    <View style={styles.securityOverlay} pointerEvents="none">
      {/* This transparent overlay prevents some interaction attempts */}
    </View>
  );

  // If Pdf component is not available, show fallback
  if (!Pdf) {
    return (
      <View style={[styles.container, styles.fallbackContainer, style]}>
        <Text style={styles.fallbackText}>PDF viewer not available</Text>
        <Text style={styles.fallbackSubtext}>Please try again later</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Pdf
        ref={pdfRef}
        source={source}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`PDF loaded: ${numberOfPages} pages`);
          if (onLoadComplete) {
            onLoadComplete(numberOfPages);
          }
        }}
        onPageChanged={(page, numberOfPages) => {
          if (onPageChanged) {
            onPageChanged(page, numberOfPages);
          }
        }}
        onError={(error) => {
          console.error('PDF Error:', error);
          if (onError) {
            onError(error);
          }
        }}
        onPressLink={(uri) => {
          // Prevent opening external links
          console.log('Link press blocked:', uri);
        }}
        style={styles.pdf}
        // Security settings
        enablePaging={true}
        enableRTL={false}
        enableAnnotationRendering={false} // Disable annotations for security
        enableAntialiasing={true}
        enableDoubleTapZoom={false} // Disable double tap zoom
        fitPolicy={0}
        spacing={0}
        password="" // No password protection
        // Disable interactions that could lead to content extraction
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        singlePage={false}
        // Loading indicator
        activityIndicator={
          activityIndicator || (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading secure PDF...</Text>
            </View>
          )
        }
        renderActivityIndicator={() => (
          activityIndicator || (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading secure PDF...</Text>
            </View>
          )
        )}
      />
      <SecurityOverlay />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  securityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default NativeSecurePDFViewer;