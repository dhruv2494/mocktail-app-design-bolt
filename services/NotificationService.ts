import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, AUTH_CONFIG } from '@/config/constants';

// Conditional imports for expo-notifications
let Device: any = null;
let Notifications: any = null;

try {
  if (Platform.OS !== 'web') {
    Device = require('expo-device');
    Notifications = require('expo-notifications');
  }
} catch (error) {
  console.warn('Expo notifications not available, notifications will be disabled:', error);
}

// Configure how notifications are handled when the app is in the foreground
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  type?: 'quiz_reminder' | 'test_result' | 'new_content' | 'subscription' | 'general';
  priority?: 'default' | 'high' | 'max';
  sound?: boolean;
  vibrate?: boolean;
}

export interface NotificationPreferences {
  quizReminders: boolean;
  testResults: boolean;
  newContent: boolean;
  subscriptionUpdates: boolean;
  generalNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
}

class NotificationService {
  private expoPushToken: string | null = null;
  private isInitialized = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.log('📋 Notification service already initialized');
        return true;
      }

      // Check if notifications are available
      if (!Notifications || !Device) {
        console.log('📵 Expo notifications not available on this platform, marking as initialized');
        this.isInitialized = true;
        return true;
      }

      console.log('🚀 Initializing notification service...');

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('⚠️ Notification permissions not granted, continuing without push notifications');
        // Still mark as initialized to prevent repeated attempts
        this.isInitialized = true;
        return true;
      }

      // Get push token (only on physical devices)
      if (Device.isDevice) {
        const token = await this.registerForPushNotifications();
        if (token) {
          this.expoPushToken = token;
          await this.saveTokenToStorage(token);
          await this.registerTokenWithBackend(token);
        } else {
          console.warn('⚠️ Could not get push token, continuing without push notifications');
        }
      } else {
        console.log('📱 Running on simulator/emulator - skipping push token registration');
      }

      // Set up notification listeners (works on all devices)
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to initialize notification service:', error);
      
      // Don't fail completely - just log the error and continue
      console.warn('⚠️ Continuing app startup despite notification service error');
      this.isInitialized = true; // Mark as initialized to prevent retry loops
      return true; // Return true to not block app startup
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Notifications || !Device) {
        console.log('Notifications not available on this platform');
        return false;
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.warn('Push notification permissions not granted');
          return false;
        }

        // For Android, set notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
          });

          // Create specific channels for different notification types
          await this.createNotificationChannels();
        }

        return true;
      } else {
        console.warn('Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Create Android notification channels
   */
  private async createNotificationChannels() {
    if (!Notifications) return;
    
    const channels = [
      {
        id: 'quiz_reminders',
        name: 'Quiz Reminders',
        description: 'Notifications about upcoming quizzes and tests',
        importance: Notifications.AndroidImportance.HIGH,
      },
      {
        id: 'test_results',
        name: 'Test Results',
        description: 'Notifications about test results and scores',
        importance: Notifications.AndroidImportance.HIGH,
      },
      {
        id: 'new_content',
        name: 'New Content',
        description: 'Notifications about new tests, PDFs, and content',
        importance: Notifications.AndroidImportance.DEFAULT,
      },
      {
        id: 'subscription',
        name: 'Subscription Updates',
        description: 'Notifications about subscription status and renewals',
        importance: Notifications.AndroidImportance.HIGH,
      },
      {
        id: 'general',
        name: 'General',
        description: 'General app notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: channel.importance,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Notifications || !Device) {
        console.log('Notifications not available on this platform');
        return null;
      }

      if (!Device.isDevice) {
        console.warn('Must use physical device for push notifications');
        return null;
      }

      // Add more defensive error handling
      const projectId = '9964aa41-ae13-4306-92b4-9c3a933ee85b';
      console.log('🔍 Attempting to get push token with projectId:', projectId);

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      console.log('📱 Expo Push Token received:', token.data);
      return token.data;
    } catch (error: any) {
      console.error('Error getting push token:', error);
      
      // Check for specific error types and provide better error messages
      if (error.message && error.message.includes('VALIDATION_ERROR')) {
        console.error('❌ Project ID validation failed. Please check app.json configuration.');
      } else if (error.message && error.message.includes('getConstans')) {
        console.error('❌ React Native module error. This might be a simulator/emulator issue.');
        console.warn('💡 Try running on a physical device or restart Metro bundler.');
      }
      
      return null;
    }
  }

  /**
   * Set up notification listeners
   */
  private setupNotificationListeners() {
    if (!Notifications) {
      console.log('Notifications not available, skipping listener setup');
      return;
    }

    // Notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Notification tapped/opened
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);
      this.handleNotificationTapped(response);
    });
  }

  /**
   * Handle notification received while app is in foreground
   */
  private handleNotificationReceived(notification: any) {
    const { request } = notification;
    const { content, identifier } = request;

    // Store notification in local storage for in-app notification list
    this.storeNotificationLocally({
      id: identifier,
      title: content.title || '',
      body: content.body || '',
      data: content.data,
      type: content.data?.type || 'general',
    });
  }

  /**
   * Handle notification tapped
   */
  private handleNotificationTapped(response: any) {
    const { notification } = response;
    const { data } = notification.request.content;

    // Navigate based on notification type
    if (data?.type && data?.navigationData) {
      this.handleNotificationNavigation(data.type, data.navigationData);
    }
  }

  /**
   * Handle navigation based on notification type
   */
  private handleNotificationNavigation(type: string, navigationData: any) {
    // This would integrate with your navigation service
    // For now, just log the navigation intent
    console.log('🧭 Navigation requested:', { type, navigationData });

    // Example navigation logic:
    switch (type) {
      case 'quiz_reminder':
        // Navigate to specific quiz
        // router.push(`/test/quiz?testId=${navigationData.testId}`);
        break;
      case 'test_result':
        // Navigate to results
        // router.push(`/test/results?resultId=${navigationData.resultId}`);
        break;
      case 'new_content':
        // Navigate to new content
        // router.push(`/test-series?category=${navigationData.category}`);
        break;
      default:
        // Navigate to home
        // router.push('/');
        break;
    }
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      if (!Notifications) {
        console.log('Notifications not available, storing notification data locally');
        await this.storeNotificationLocally(notificationData);
        return true;
      }

      const preferences = await this.getNotificationPreferences();
      
      // Check if this type of notification is enabled
      if (!this.isNotificationTypeEnabled(notificationData.type, preferences)) {
        console.log('Notification type disabled:', notificationData.type);
        return false;
      }

      // Check quiet hours
      if (preferences.quietHoursEnabled && this.isInQuietHours(preferences)) {
        console.log('Notification suppressed due to quiet hours');
        return false;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: preferences.soundEnabled && (notificationData.sound !== false),
          priority: this.mapPriorityToAndroid(notificationData.priority),
        },
        trigger: null, // Send immediately
      });

      console.log('📤 Local notification sent:', notificationId);
      return true;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return false;
    }
  }

  /**
   * Schedule notification for later
   */
  async scheduleNotification(
    notificationData: NotificationData,
    scheduledDate: Date
  ): Promise<string | null> {
    try {
      if (!Notifications) {
        console.log('Notifications not available, cannot schedule notification');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
        },
        trigger: {
          date: scheduledDate,
        },
      });

      console.log('⏰ Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      if (!Notifications) {
        console.log('Notifications not available, cannot cancel notification');
        return false;
      }

      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Notification cancelled:', notificationId);
      return true;
    } catch (error) {
      console.error('Error cancelling notification:', error);
      return false;
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<any[]> {
    try {
      if (!Notifications) {
        console.log('Notifications not available, returning empty array');
        return [];
      }

      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Register push token with backend
   */
  private async registerTokenWithBackend(token: string): Promise<boolean> {
    try {
      const authToken = await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      if (!authToken) {
        console.warn('No auth token found, cannot register push token');
        return false;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/register-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          pushToken: token,
          platform: Platform.OS,
          deviceInfo: {
            deviceName: Device.deviceName,
            osName: Device.osName,
            osVersion: Device.osVersion,
          },
        }),
      });

      if (response.ok) {
        console.log('✅ Push token registered with backend');
        return true;
      } else {
        console.error('❌ Failed to register push token with backend');
        return false;
      }
    } catch (error) {
      console.error('Error registering push token with backend:', error);
      return false;
    }
  }

  /**
   * Save token to local storage
   */
  private async saveTokenToStorage(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('expo_push_token', token);
    } catch (error) {
      console.error('Error saving push token to storage:', error);
    }
  }

  /**
   * Get saved token from storage
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expo_push_token');
    } catch (error) {
      console.error('Error getting stored push token:', error);
      return null;
    }
  }

  /**
   * Store notification locally for in-app notification list
   */
  private async storeNotificationLocally(notification: NotificationData): Promise<void> {
    try {
      const existingNotifications = await this.getLocalNotifications();
      const updatedNotifications = [
        {
          ...notification,
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...existingNotifications.slice(0, 99), // Keep only latest 100
      ];

      await AsyncStorage.setItem('local_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error storing notification locally:', error);
    }
  }

  /**
   * Get local notifications
   */
  async getLocalNotifications(): Promise<any[]> {
    try {
      const notifications = await AsyncStorage.getItem('local_notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error getting local notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      await AsyncStorage.setItem('local_notifications', JSON.stringify(updatedNotifications));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const preferences = await AsyncStorage.getItem('notification_preferences');
      return preferences ? JSON.parse(preferences) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const currentPreferences = await this.getNotificationPreferences();
      const updatedPreferences = { ...currentPreferences, ...preferences };
      
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(updatedPreferences));
      console.log('✅ Notification preferences updated');
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Get default notification preferences
   */
  private getDefaultPreferences(): NotificationPreferences {
    return {
      quizReminders: true,
      testResults: true,
      newContent: true,
      subscriptionUpdates: true,
      generalNotifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    };
  }

  /**
   * Check if notification type is enabled
   */
  private isNotificationTypeEnabled(type: string | undefined, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'quiz_reminder':
        return preferences.quizReminders;
      case 'test_result':
        return preferences.testResults;
      case 'new_content':
        return preferences.newContent;
      case 'subscription':
        return preferences.subscriptionUpdates;
      case 'general':
      default:
        return preferences.generalNotifications;
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(preferences: NotificationPreferences): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const startTime = this.parseTimeString(preferences.quietHoursStart);
    const endTime = this.parseTimeString(preferences.quietHoursEnd);

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Parse time string to number (HHMM format)
   */
  private parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  }

  /**
   * Map priority to Android priority
   */
  private mapPriorityToAndroid(priority?: string): any {
    if (!Notifications) return 'default';
    
    switch (priority) {
      case 'high':
        return Notifications.AndroidNotificationPriority.HIGH;
      case 'max':
        return Notifications.AndroidNotificationPriority.MAX;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;