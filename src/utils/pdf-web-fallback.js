import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';

// Web fallback component for react-native-pdf
const PdfWebFallback = ({ source, style, onLoadComplete, ...props }) => {
  const handleOpenPdf = () => {
    if (source?.uri) {
      Linking.openURL(source.uri);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.title}>📄 PDF Document</Text>
        <Text style={styles.message}>
          PDF viewing is not supported in web browser.
        </Text>
        {source?.uri && (
          <TouchableOpacity style={styles.button} onPress={handleOpenPdf}>
            <Text style={styles.buttonText}>Open PDF in New Tab</Text>
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
});

// Export the component as default to replace react-native-pdf
export default PdfWebFallback;