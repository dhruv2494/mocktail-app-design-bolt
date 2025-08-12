import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Platform } from 'react-native';

// Web fallback component for react-native-pdf
const PdfWebFallback = ({ source, style, onLoadComplete, onError, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (onLoadComplete) {
      // Simulate PDF load completion with 1 page for web
      setTimeout(() => {
        setIsLoading(false);
        onLoadComplete(1);
      }, 1000);
    }
  }, [onLoadComplete]);

  const handleOpenPdf = () => {
    if (source?.uri) {
      Linking.openURL(source.uri);
    }
  };

  // For web platform, we can use an iframe to display PDFs inline
  if (Platform.OS === 'web' && source?.uri) {
    return (
      <View style={[styles.container, style]}>
        <iframe
          src={source.uri}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#f5f5f5'
          }}
          onLoad={() => {
            setIsLoading(false);
            if (onLoadComplete) onLoadComplete(1);
          }}
          onError={() => {
            setHasError(true);
            if (onError) onError(new Error('Failed to load PDF'));
          }}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}
      </View>
    );
  }

  // Fallback for non-web platforms or error cases
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.title}>📄 PDF Document</Text>
        <Text style={styles.message}>
          {hasError 
            ? 'Failed to load PDF. Please try opening it externally.'
            : 'PDF viewing is not supported in this environment.'}
        </Text>
        {source?.uri && (
          <TouchableOpacity style={styles.button} onPress={handleOpenPdf}>
            <Text style={styles.buttonText}>Open PDF Externally</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

// Export the component as default to replace react-native-pdf
export default PdfWebFallback;