import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Download, Eye, FileText, Calendar, Filter, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PDFsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const Colors = getTheme(isDarkMode);

  const categories = [
    { key: 'All', label: t.pdfs.categories.all },
    { key: 'Study Material', label: t.pdfs.categories.studyMaterial },
    { key: 'Previous Papers', label: t.pdfs.categories.previousPapers },
    { key: 'Solutions', label: t.pdfs.categories.solutions },
    { key: 'Notes', label: t.pdfs.categories.notes }
  ];

  const pdfData = [
    {
      id: 1,
      title: 'PSI Exam Complete Guide 2024',
      category: 'Study Material',
      size: '2.5 MB',
      pages: 45,
      downloads: 1250,
      rating: 4.8,
      uploadDate: '2024-01-15',
      description: 'Comprehensive guide covering all topics for PSI examination with detailed explanations and examples.',
      tags: ['PSI', 'Complete Guide', 'Exam Prep'],
      isPremium: false,
    },
    {
      id: 2,
      title: 'Mathematics Formula Sheet',
      category: 'Notes',
      size: '1.2 MB',
      pages: 12,
      downloads: 2100,
      rating: 4.9,
      uploadDate: '2024-01-10',
      description: 'Essential mathematical formulas and shortcuts for competitive exams.',
      tags: ['Mathematics', 'Formulas', 'Quick Reference'],
      isPremium: false,
    },
    {
      id: 3,
      title: 'PSI Previous Year Papers (2020-2023)',
      category: 'Previous Papers',
      size: '3.8 MB',
      pages: 68,
      downloads: 890,
      rating: 4.7,
      uploadDate: '2024-01-08',
      description: 'Collection of previous year question papers with detailed solutions.',
      tags: ['PSI', 'Previous Papers', 'Solutions'],
      isPremium: true,
    },
    {
      id: 4,
      title: 'General Knowledge Handbook',
      category: 'Study Material',
      size: '4.2 MB',
      pages: 89,
      downloads: 1560,
      rating: 4.6,
      uploadDate: '2024-01-05',
      description: 'Comprehensive general knowledge covering current affairs, history, geography, and science.',
      tags: ['GK', 'Current Affairs', 'Handbook'],
      isPremium: false,
    },
    {
      id: 5,
      title: 'English Grammar & Vocabulary',
      category: 'Study Material',
      size: '2.1 MB',
      pages: 34,
      downloads: 1340,
      rating: 4.5,
      uploadDate: '2024-01-03',
      description: 'Essential English grammar rules and vocabulary for competitive exams.',
      tags: ['English', 'Grammar', 'Vocabulary'],
      isPremium: false,
    },
    {
      id: 6,
      title: 'Reasoning Shortcuts & Tricks',
      category: 'Notes',
      size: '1.8 MB',
      pages: 28,
      downloads: 1890,
      rating: 4.8,
      uploadDate: '2024-01-01',
      description: 'Quick tricks and shortcuts for solving reasoning problems efficiently.',
      tags: ['Reasoning', 'Shortcuts', 'Tricks'],
      isPremium: true,
    },
  ];

  const filteredPDFs = pdfData.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pdf.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const categoryKey = categories.find(c => c.key === selectedCategory)?.key;
    const matchesCategory = categoryKey === 'All' || pdf.category === categoryKey;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (pdfId: number) => {
    // Handle PDF download
    console.log('Downloading PDF:', pdfId);
  };

  const handlePreview = (pdfId: number) => {
    router.push(`/pdf-viewer?pdfId=${pdfId}`);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.pdfs.title}</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={t.pdfs.searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.key && styles.categoryTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PDF List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredPDFs.map((pdf) => (
          <View key={pdf.id} style={styles.pdfCard}>
            {/* Header */}
            <View style={styles.pdfHeader}>
              <View style={styles.pdfHeaderLeft}>
                <View style={styles.pdfIconContainer}>
                  <FileText size={24} color={Colors.primaryLight} />
                </View>
                <View style={styles.pdfInfo}>
                  <Text style={styles.pdfTitle}>{pdf.title}</Text>
                  <View style={styles.pdfMeta}>
                    <Text style={styles.pdfSize}>{pdf.size}</Text>
                    <Text style={styles.pdfSeparator}>•</Text>
                    <Text style={styles.pdfPages}>{pdf.pages} {t.pdfs.pages}</Text>
                    {pdf.isPremium && (
                      <>
                        <Text style={styles.pdfSeparator}>•</Text>
                        <View style={styles.premiumBadge}>
                          <Text style={styles.premiumText}>{t.pdfs.premium}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.ratingContainer}>
                <Star size={14} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.rating}>{pdf.rating}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.pdfDescription}>{pdf.description}</Text>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {pdf.tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Download size={14} color="#6B7280" />
                <Text style={styles.statText}>{pdf.downloads} {t.pdfs.downloads}</Text>
              </View>
              <View style={styles.statItem}>
                <Calendar size={14} color="#6B7280" />
                <Text style={styles.statText}>{formatDate(pdf.uploadDate)}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.previewButton}
                onPress={() => handlePreview(pdf.id)}
              >
                <Eye size={16} color={Colors.blue500} />
                <Text style={styles.previewButtonText}>{t.pdfs.preview}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.downloadButton,
                  pdf.isPremium && styles.premiumDownloadButton
                ]}
                onPress={() => handleDownload(pdf.id)}
              >
                <Download size={16} color={Colors.white} />
                <Text style={styles.downloadButtonText}>
                  {pdf.isPremium ? t.pdfs.premiumDownload : t.pdfs.download}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Empty State */}
        {filteredPDFs.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.gray400} />
            <Text style={styles.emptyTitle}>{t.pdfs.noPDFsFound}</Text>
            <Text style={styles.emptyDescription}>
              {t.pdfs.tryAdjusting}
            </Text>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
    maxHeight: 60,

  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryLight,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSubtle,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pdfCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pdfHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  pdfIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.chip,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pdfMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfSize: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
  pdfSeparator: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginHorizontal: 6,
  },
  pdfPages: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
  premiumBadge: {
    backgroundColor: Colors.premiumBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 10,
    color: Colors.premiumText,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  pdfDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagChip: {
    backgroundColor: Colors.chip,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  previewButtonText: {
    fontSize: 14,
    color: Colors.primaryLight,
    fontWeight: '500',
    marginLeft: 4,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  premiumDownloadButton: {
    flex: 0,
    backgroundColor: Colors.warning,
    width: '60%',
  },
  downloadButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    textAlign: 'center',
  },
});