import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type AnalyticsEventType = 'impression' | 'signup';

export const logAnalyticsEvent = async (type: AnalyticsEventType) => {
  try {
    // Check session storage to prevent duplicate impressions in the same session
    if (type === 'impression') {
      const hasViewed = sessionStorage.getItem('newsletter_viewed');
      if (hasViewed) return;
      sessionStorage.setItem('newsletter_viewed', 'true');
    }

    await addDoc(collection(db, 'analyticsEvents'), {
      type,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      path: window.location.pathname
    });
  } catch (err) {
    console.error("Failed to log analytics event:", err);
  }
};
