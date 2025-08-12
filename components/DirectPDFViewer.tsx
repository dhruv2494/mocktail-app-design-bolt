import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenCapture from 'expo-screen-capture';

interface DirectPDFViewerProps {
  source: { uri: string };
  style?: any;
  onLoadComplete?: (pages: number) => void;
  onError?: (error: any) => void;
}

const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({
  source,
  style,
  onLoadComplete,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent screenshots on mobile
    const preventScreenshots = async () => {
      if (Platform.OS !== 'web') {
        try {
          await ScreenCapture.preventScreenCaptureAsync();
        } catch (error) {
          console.error('Failed to prevent screenshots:', error);
        }
      }
    };

    preventScreenshots();

    return () => {
      if (Platform.OS !== 'web') {
        ScreenCapture.allowScreenCaptureAsync().catch(console.error);
      }
    };
  }, []);

  // Create an HTML page that embeds the PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; }
        html, body { 
          width: 100%; 
          height: 100%; 
          overflow: hidden;
          background: #f5f5f5;
        }
        /* Disable selection and right-click */
        body {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        .pdf-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .pdf-frame {
          width: 100%;
          height: 100%;
          border: none;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #666;
        }
        /* Security overlay */
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: transparent;
          pointer-events: none;
        }
      </style>
      <script>
        // Disable right-click
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Disable text selection
        document.addEventListener('selectstart', e => e.preventDefault());
        
        // Disable print/save
        document.addEventListener('keydown', e => {
          if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'a')) {
            e.preventDefault();
          }
        });
        
        // Notify when loaded
        window.onload = function() {
          setTimeout(function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'loaded'
              }));
            }
          }, 1000);
        };
      </script>
    </head>
    <body>
      <div class="pdf-container">
        <div class="loading" id="loading">Loading PDF...</div>
        <iframe 
          class="pdf-frame"
          src="${source.uri}#toolbar=0&navpanes=0&scrollbar=0"
          onload="document.getElementById('loading').style.display='none';"
        ></iframe>
        <div class="overlay"></div>
      </div>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loaded') {
        setIsLoading(false);
        if (onLoadComplete) {
          onLoadComplete(1);
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadEnd={() => {
          console.log('WebView loaded');
          setIsLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setIsLoading(false);
          if (onError) {
            onError(nativeEvent);
          }
        }}
        // Settings
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        originWhitelist={['*']}
        // Allow file URLs
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default DirectPDFViewer;