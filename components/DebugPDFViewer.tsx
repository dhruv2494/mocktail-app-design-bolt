import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenCapture from 'expo-screen-capture';

interface DebugPDFViewerProps {
  source: { uri: string };
  style?: any;
  onLoadComplete?: (pages: number) => void;
  onError?: (error: any) => void;
}

const DebugPDFViewer: React.FC<DebugPDFViewerProps> = ({
  source,
  style,
  onLoadComplete,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
    console.log('PDF Debug:', info);
  };

  useEffect(() => {
    addDebugInfo(`PDF URL: ${source.uri}`);
    
    // Prevent screenshots
    const preventScreenshots = async () => {
      if (Platform.OS !== 'web') {
        try {
          await ScreenCapture.preventScreenCaptureAsync();
          addDebugInfo('Screenshot prevention enabled');
        } catch (error) {
          addDebugInfo(`Screenshot prevention failed: ${error}`);
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

  // Try different approaches based on platform
  const getHtml = () => {
    const pdfUrl = source.uri;
    
    // For web platform, try using embed directly
    if (Platform.OS === 'web') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; }
            html, body { 
              width: 100%; 
              height: 100vh; 
              overflow: hidden;
            }
            #pdf-container {
              width: 100%;
              height: 100vh;
              display: flex;
              flex-direction: column;
            }
            #debug {
              background: #333;
              color: #fff;
              padding: 10px;
              font-family: monospace;
              font-size: 12px;
              max-height: 100px;
              overflow-y: auto;
            }
            embed, object {
              flex: 1;
              width: 100%;
              height: 100%;
            }
            .error {
              color: red;
              padding: 20px;
              text-align: center;
            }
          </style>
          <script>
            window.onerror = function(msg, url, line) {
              document.getElementById('debug').innerHTML += '<br>Error: ' + msg;
              return true;
            };
            
            function log(msg) {
              var debug = document.getElementById('debug');
              if (debug) {
                debug.innerHTML += '<br>' + new Date().toLocaleTimeString() + ': ' + msg;
              }
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'debug',
                  message: msg
                }));
              }
            }
            
            window.onload = function() {
              log('Page loaded');
              
              // Try to detect if PDF loaded
              var embed = document.querySelector('embed');
              if (embed) {
                log('Embed element found');
                
                embed.addEventListener('load', function() {
                  log('Embed loaded');
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'loaded'
                    }));
                  }
                });
                
                embed.addEventListener('error', function(e) {
                  log('Embed error: ' + e.message);
                });
              }
              
              // Fallback: assume loaded after delay
              setTimeout(function() {
                log('Timeout reached, assuming loaded');
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'loaded'
                  }));
                }
              }, 3000);
            };
          </script>
        </head>
        <body>
          <div id="pdf-container">
            <div id="debug">Loading PDF from: ${pdfUrl}</div>
            <embed 
              src="${pdfUrl}" 
              type="application/pdf"
              width="100%"
              height="100%"
            />
          </div>
        </body>
        </html>
      `;
    }
    
    // For mobile, use a different approach
    return `
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
          .container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .message {
            text-align: center;
            padding: 20px;
            font-family: -apple-system, sans-serif;
          }
          .url {
            font-size: 12px;
            color: #666;
            word-break: break-all;
            margin-top: 10px;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
        <script>
          // Log function
          function log(msg) {
            console.log(msg);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'debug',
                message: msg
              }));
            }
          }
          
          window.onload = function() {
            log('Mobile view loaded');
            log('PDF URL: ${pdfUrl}');
            
            // Try creating iframe
            var iframe = document.createElement('iframe');
            iframe.src = '${pdfUrl}';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            
            iframe.onload = function() {
              log('Iframe loaded');
              document.querySelector('.message').style.display = 'none';
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'loaded'
                }));
              }
            };
            
            iframe.onerror = function(e) {
              log('Iframe error: ' + e);
            };
            
            document.querySelector('.container').appendChild(iframe);
          };
        </script>
      </head>
      <body>
        <div class="container">
          <div class="message">
            <h3>Loading PDF...</h3>
            <p class="url">${pdfUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'debug') {
        addDebugInfo(`WebView: ${data.message}`);
      } else if (data.type === 'loaded') {
        addDebugInfo('PDF loaded successfully');
        setIsLoading(false);
        if (onLoadComplete) {
          onLoadComplete(1);
        }
      } else if (data.type === 'error') {
        addDebugInfo(`Error: ${data.message}`);
        if (onError) {
          onError(new Error(data.message));
        }
      }
    } catch (error) {
      addDebugInfo(`Message parse error: ${error}`);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: getHtml() }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadStart={() => {
          addDebugInfo('WebView load started');
        }}
        onLoadEnd={() => {
          addDebugInfo('WebView load ended');
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          addDebugInfo(`WebView error: ${JSON.stringify(nativeEvent)}`);
          if (onError) {
            onError(nativeEvent);
          }
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          addDebugInfo(`HTTP error: ${nativeEvent.statusCode} - ${nativeEvent.description}`);
        }}
        // Settings
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        // Disable cache to ensure fresh load
        cacheEnabled={false}
        incognito={true}
      />
      
      {showDebug && (
        <View style={styles.debugOverlay}>
          <TouchableOpacity 
            style={styles.debugHeader}
            onPress={() => setShowDebug(false)}
          >
            <Text style={styles.debugTitle}>Debug Info (tap to hide)</Text>
          </TouchableOpacity>
          <View style={styles.debugContent}>
            {debugInfo.map((info, index) => (
              <Text key={index} style={styles.debugText}>{info}</Text>
            ))}
          </View>
        </View>
      )}
      
      {!showDebug && (
        <TouchableOpacity 
          style={styles.debugToggle}
          onPress={() => setShowDebug(true)}
        >
          <Text style={styles.debugToggleText}>Show Debug</Text>
        </TouchableOpacity>
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
  debugOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    maxHeight: 200,
  },
  debugHeader: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  debugTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugContent: {
    padding: 10,
    maxHeight: 150,
  },
  debugText: {
    color: '#0f0',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 2,
  },
  debugToggle: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  debugToggleText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default DebugPDFViewer;