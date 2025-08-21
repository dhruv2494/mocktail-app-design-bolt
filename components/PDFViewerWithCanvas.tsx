import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenCapture from 'expo-screen-capture';

interface PDFViewerWithCanvasProps {
  source: { uri: string };
  style?: any;
  onLoadComplete?: (pages: number) => void;
  onPageChanged?: (page: number) => void;
  onError?: (error: any) => void;
  activityIndicator?: React.ReactNode;
}

const PDFViewerWithCanvas: React.FC<PDFViewerWithCanvasProps> = ({
  source,
  style,
  onLoadComplete,
  onPageChanged,
  onError,
  activityIndicator
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent screenshots on mobile platforms
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

  const getHtml = () => {
    const pdfUrl = source.uri;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Secure PDF Viewer</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body, html {
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          /* Disable text selection */
          body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
          }
          
          #pdf-container {
            width: 100%;
            min-height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            position: relative;
          }
          
          .page-container {
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            position: relative;
          }
          
          canvas {
            display: block;
            max-width: 100%;
            height: auto;
          }
          
          .loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3B82F6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .error {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #d32f2f;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          /* Security overlay */
          .security-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            pointer-events: none;
            background: transparent;
          }
          
          /* Page info */
          .page-info {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
          }
        </style>
        <script>
          // Security measures
          document.addEventListener('contextmenu', e => e.preventDefault());
          document.addEventListener('selectstart', e => e.preventDefault());
          document.addEventListener('dragstart', e => e.preventDefault());
          document.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.keyCode === 80 || e.keyCode === 83 || e.keyCode === 65)) {
              e.preventDefault();
            }
          });
          
          // PDF.js workerSrc
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          let pdfDoc = null;
          let currentPage = 1;
          let totalPages = 0;
          let rendering = false;
          
          // Load PDF
          async function loadPDF() {
            try {
              const loadingTask = pdfjsLib.getDocument('${pdfUrl}');
              
              loadingTask.promise.then(function(pdf) {
                pdfDoc = pdf;
                totalPages = pdf.numPages;
                
                // Hide loading
                document.getElementById('loading').style.display = 'none';
                
                // Notify React Native
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'loaded',
                    pages: totalPages
                  }));
                }
                
                // Render all pages
                renderAllPages();
                
              }).catch(function(error) {
                console.error('Error loading PDF:', error);
                showError('Failed to load PDF: ' + error.message);
              });
              
            } catch (error) {
              console.error('Error:', error);
              showError('Failed to initialize PDF viewer');
            }
          }
          
          async function renderAllPages() {
            const container = document.getElementById('pdf-container');
            
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
              await renderPage(pageNum, container);
            }
            
            updatePageInfo();
          }
          
          async function renderPage(pageNumber, container) {
            try {
              const page = await pdfDoc.getPage(pageNumber);
              const scale = 1.5;
              const viewport = page.getViewport({ scale });
              
              // Create page container
              const pageContainer = document.createElement('div');
              pageContainer.className = 'page-container';
              pageContainer.setAttribute('data-page', pageNumber);
              
              // Create canvas
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              pageContainer.appendChild(canvas);
              container.appendChild(pageContainer);
              
              // Render PDF page
              const renderContext = {
                canvasContext: context,
                viewport: viewport
              };
              
              await page.render(renderContext).promise;
              
            } catch (error) {
              console.error('Error rendering page ' + pageNumber + ':', error);
            }
          }
          
          function showError(message) {
            document.getElementById('loading').style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.innerHTML = '<h3>Error</h3><p>' + message + '</p>';
            document.body.appendChild(errorDiv);
            
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: message
              }));
            }
          }
          
          function updatePageInfo() {
            const pageInfo = document.getElementById('page-info');
            if (pageInfo) {
              pageInfo.textContent = 'Pages: ' + totalPages;
            }
          }
          
          // Initialize when DOM is ready
          document.addEventListener('DOMContentLoaded', loadPDF);
        </script>
      </head>
      <body>
        <div id="loading" class="loading">
          <div class="loading-spinner"></div>
          <div>Loading PDF...</div>
        </div>
        
        <div id="pdf-container"></div>
        
        <div class="page-info" id="page-info"></div>
        
        <div class="security-overlay"></div>
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
          onError(new Error(data.message || 'Failed to load PDF'));
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
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
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Disable file access
        allowFileAccess={false}
        allowFileAccessFromFileURLs={false}
        allowUniversalAccessFromFileURLs={false}
        // Allow loading from any origin
        originWhitelist={['*']}
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

export default PDFViewerWithCanvas;