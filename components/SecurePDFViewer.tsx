import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenCapture from 'expo-screen-capture';
import NativeSecurePDFViewer from './NativeSecurePDFViewer';

interface SecurePDFViewerProps {
  source: { uri: string };
  style?: any;
  onLoadComplete?: (pages: number) => void;
  onPageChanged?: (page: number) => void;
  onError?: (error: any) => void;
  activityIndicator?: React.ReactNode;
}

const SecurePDFViewer: React.FC<SecurePDFViewerProps> = ({
  source,
  style,
  onLoadComplete,
  onPageChanged,
  onError,
  activityIndicator
}) => {
  // Temporarily disable native PDF viewer due to library issues
  // TODO: Re-enable when react-native-pdf is properly configured
  /*
  if (Platform.OS !== 'web') {
    return (
      <NativeSecurePDFViewer
        source={source}
        style={style}
        onLoadComplete={onLoadComplete}
        onPageChanged={onPageChanged}
        onError={onError}
        activityIndicator={activityIndicator}
      />
    );
  }
  */

  // Web implementation continues below
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    // Prevent screenshots on this screen
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

    // Re-enable screenshots when component unmounts
    return () => {
      if (Platform.OS !== 'web') {
        ScreenCapture.allowScreenCaptureAsync().catch(console.error);
      }
    };
  }, []);

  // Custom HTML for secure PDF viewing
  const getHtml = () => {
    const pdfUrl = source.uri;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body, html {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #f5f5f5;
          }
          
          /* Disable text selection and context menu */
          body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
          }
          
          /* Disable right-click */
          body {
            oncontextmenu: return false;
          }
          
          #pdf-container {
            width: 100%;
            height: 100%;
            position: relative;
          }
          
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
          
          /* Overlay to prevent interactions */
          .security-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            pointer-events: none;
            background: transparent;
          }
          
          /* Loading indicator */
          .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #666;
          }
          
          /* Error message */
          .error {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #d32f2f;
            padding: 20px;
          }
        </style>
        <script>
          // Disable right-click context menu
          document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
          });
          
          // Disable text selection
          document.addEventListener('selectstart', function(e) {
            e.preventDefault();
            return false;
          });
          
          // Disable drag
          document.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
          });
          
          // Notify when PDF loads
          window.addEventListener('load', function() {
            setTimeout(function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'loaded',
                  pages: 1
                }));
              }
            }, 1000);
          });
          
          // Add load event to embed element
          window.addEventListener('DOMContentLoaded', function() {
            var embed = document.querySelector('embed');
            if (embed) {
              embed.addEventListener('load', function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'loaded',
                    pages: 1
                  }));
                }
              });
            }
          });
          
          // Disable print
          window.addEventListener('beforeprint', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          });
          
          // Disable keyboard shortcuts
          document.addEventListener('keydown', function(e) {
            // Disable Ctrl+P (print), Ctrl+S (save), Ctrl+A (select all)
            if (e.ctrlKey && (e.keyCode === 80 || e.keyCode === 83 || e.keyCode === 65)) {
              e.preventDefault();
              return false;
            }
            // Disable F12 (dev tools)
            if (e.keyCode === 123) {
              e.preventDefault();
              return false;
            }
          });
        </script>
      </head>
      <body>
        <div id="pdf-container">
          <object 
            data="${source.uri}"
            type="application/pdf"
            width="100%"
            height="100%"
            style="position: absolute; top: 0; left: 0; border: none;">
            <p style="text-align: center; padding: 20px; color: #666;">
              PDF loading...
            </p>
          </object>
          <div class="security-overlay"></div>
        </div>
      </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'loaded') {
        setIsLoading(false);
        if (onLoadComplete) {
          onLoadComplete(data.pages || 1);
        }
      } else if (data.type === 'error') {
        setIsLoading(false);
        if (onError) {
          onError(new Error('Failed to load PDF'));
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: getHtml() }}
        style={styles.webview}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          if (onError) {
            onError(nativeEvent);
          }
        }}
        // Security settings
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="never"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Disable file access
        allowFileAccess={false}
        allowFileAccessFromFileURLs={false}
        allowUniversalAccessFromFileURLs={false}
        // Loading indicator
        renderLoading={() => (
          activityIndicator || <ActivityIndicator size="large" color="#3B82F6" />
        )}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          {activityIndicator || <ActivityIndicator size="large" color="#3B82F6" />}
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
});

export default SecurePDFViewer;