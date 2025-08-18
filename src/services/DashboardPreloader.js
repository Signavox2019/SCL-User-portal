import BaseUrl from '../Api';
import axios from 'axios';

class DashboardPreloader {
  constructor() {
    this.cache = new Map();
    this.isPreloading = false;
  }

  // Pre-fetch data for user dashboard
  async preloadUserDashboard() {
    if (this.isPreloading) return;
    this.isPreloading = true;
    console.log('🔄 Starting user dashboard preload...');

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${BaseUrl}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.cache.set('userDashboard', {
        data: response.data,
        timestamp: Date.now()
      });
      console.log('✅ User dashboard preload completed');
    } catch (error) {
      console.error('❌ Failed to preload user dashboard:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // Pre-fetch data for admin dashboard
  async preloadAdminDashboard() {
    if (this.isPreloading) return;
    this.isPreloading = true;
    console.log('🔄 Starting admin dashboard preload...');

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [userRes, courseRes, enrollRes, eventRes, batchRes, profRes, ticketRes] = await Promise.all([
        axios.get(`${BaseUrl}/users/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/courses/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/enrollments/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/events/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/tickets/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/batches/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/professors/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      this.cache.set('adminDashboard', {
        data: {
          userStats: userRes.data,
          courseStats: courseRes.data,
          enrollStats: enrollRes.data,
          eventStats: eventRes.data,
          batchStats: batchRes.data,
          professorStats: profRes.data,
          ticketStats: ticketRes.data,
        },
        timestamp: Date.now()
      });
      console.log('✅ Admin dashboard preload completed');
    } catch (error) {
      console.error('❌ Failed to preload admin dashboard:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // Pre-fetch data for support dashboard
  async preloadSupportDashboard() {
    if (this.isPreloading) return;
    this.isPreloading = true;
    console.log('🔄 Starting support dashboard preload...');

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [userRes, courseRes, enrollRes, eventRes, batchRes, profRes, ticketRes, assignedTicketsRes, batchesRes] = await Promise.all([
        axios.get(`${BaseUrl}/users/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/courses/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/enrollments/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/events/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/batches/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/professors/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/tickets/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/tickets/my-assigned-tickets`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BaseUrl}/batches/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      this.cache.set('supportDashboard', {
        data: {
          userStats: userRes.data,
          courseStats: courseRes.data,
          enrollStats: enrollRes.data,
          eventStats: eventRes.data,
          batchStats: batchRes.data,
          professorStats: profRes.data,
          ticketStats: ticketRes.data,
          assignedTickets: assignedTicketsRes.data,
          batches: batchesRes.data.batches || [],
        },
        timestamp: Date.now()
      });
      console.log('✅ Support dashboard preload completed');
    } catch (error) {
      console.error('❌ Failed to preload support dashboard:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // Get cached data
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 seconds cache
      return cached.data;
    }
    return null;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(key) {
    this.cache.delete(key);
  }
}

// Create a singleton instance
const dashboardPreloader = new DashboardPreloader();
export default dashboardPreloader; 