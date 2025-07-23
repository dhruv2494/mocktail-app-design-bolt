import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Download, Share2, BookOpen } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetPDFByIdQuery, useGetPDFDownloadUrlMutation } from '@/store/api/pdfApi';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

export default function PDFViewerScreen() {
  const { pdfId } = useLocalSearchParams<{ pdfId: string }>();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const Colors = getTheme(isDarkMode);

  const {
    data: pdfResponse,
    isLoading,
    isError,
    error,
  } = useGetPDFByIdQuery(pdfId!, {
    skip: !pdfId,
  });

  const [getPDFDownloadUrl, { isLoading: isDownloading }] = useGetPDFDownloadUrlMutation();

  const pdf = pdfResponse?.data;

  const handleDownload = async () => {
    if (!pdf) return;

    try {
      const response = await getPDFDownloadUrl(pdf.id).unwrap();
      
      Alert.alert(
        'Download Ready',
        `PDF: ${response.data.filename}\nSize: ${(response.data.size / 1024 / 1024).toFixed(2)} MB`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: () => {
              // Here you would implement actual file download using expo-file-system
              console.log('Download URL:', response.data.download_url);
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Download Error',
        error?.data?.message || 'Failed to get download URL'
      );
    }
  };

  const handleShare = () => {
    // Implement sharing functionality
    Alert.alert('Share', 'Sharing functionality will be implemented here');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const styles = getStyles(Colors);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <SkeletonLoader width={120} height={20} borderRadius={4} />
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.pdfInfo}>
            <SkeletonLoader width="80%" height={24} borderRadius={4} />
            <SkeletonLoader width="60%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
            <SkeletonLoader width="100%" height={14} borderRadius={4} style={{ marginTop: 12 }} />
            <SkeletonLoader width="90%" height={14} borderRadius={4} style={{ marginTop: 4 }} />
          </View>

          <View style={styles.viewerContainer}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primaryLight} />
              <Text style={styles.loadingText}>Loading PDF...</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !pdf) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <BookOpen size={64} color={Colors.danger} />
          <Text style={styles.errorTitle}>Failed to load PDF</Text>
          <Text style={styles.errorDescription}>
            {(error as any)?.data?.message || 'The PDF could not be loaded. Please try again.'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {pdf.title}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Share2 size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={Colors.textPrimary} />
            ) : (
              <Download size={20} color={Colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* PDF Info */}
        <View style={styles.pdfInfo}>
          <Text style={styles.pdfTitle}>{pdf.title}</Text>
          <View style={styles.pdfMeta}>
            <Text style={styles.metaText}>Size: {formatFileSize(pdf.file_size)}</Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Text style={styles.metaText}>
              {pdf.access_level === 'premium' ? 'Premium' : 'Free'}
            </Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Text style={styles.metaText}>
              {formatDate(pdf.created_at)}
            </Text>
          </View>
          {pdf.description && (
            <Text style={styles.pdfDescription}>{pdf.description}</Text>
          )}
        </View>

        {/* PDF Viewer Container */}
        <View style={styles.viewerContainer}>
          <View style={styles.comingSoonContainer}>
            <BookOpen size={64} color={Colors.primaryLight} />
            <Text style={styles.comingSoonTitle}>PDF Viewer</Text>
            <Text style={styles.comingSoonDescription}>
              PDF viewing functionality will be integrated here using a library like react-native-pdf or expo-document-picker.
            </Text>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Download size={16} color={Colors.white} />
              )}
              <Text style={styles.downloadButtonText}>
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  pdfInfo: {
    padding: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  pdfTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  pdfMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSubtle,
  },
  metaSeparator: {
    fontSize: 14,
    color: Colors.textSubtle,
    marginHorizontal: 8,
  },
  pdfDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    lineHeight: 20,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSubtle,
    marginTop: 16,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.danger,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
});