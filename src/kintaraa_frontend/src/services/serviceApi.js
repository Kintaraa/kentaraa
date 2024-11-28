import { api } from './api';

export const ServiceType = {
  Legal: 'Legal',
  Medical: 'Medical',
  Counseling: 'Counseling',
  Police: 'Police'
};

export const Priority = {
  Emergency: 'Emergency',
  High: 'High',
  Medium: 'Medium',
  Low: 'Low'
};

export const serviceApi = {
  // Service Requests
  submitServiceRequest: async (serviceType, description, priority) => {
    try {
      return await api.backendActor.submit_service_request({
        service_type: serviceType,
        description,
        priority
      });
    } catch (error) {
      console.error('Error submitting service request:', error);
      throw error;
    }
  },

  getServiceRequest: async (id) => {
    try {
      return await api.backendActor.get_service_request(id);
    } catch (error) {
      console.error('Error getting service request:', error);
      throw error;
    }
  },

  getUserServiceRequests: async (principal) => {
    try {
      return await api.backendActor.get_user_service_requests(principal);
    } catch (error) {
      console.error('Error getting user service requests:', error);
      throw error;
    }
  },

  // Appointments
  scheduleAppointment: async (serviceType, datetime, notes) => {
    try {
      return await api.backendActor.schedule_appointment({
        service_type: serviceType,
        datetime,
        notes
      });
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  },

  getAppointment: async (id) => {
    try {
      return await api.backendActor.get_appointment(id);
    } catch (error) {
      console.error('Error getting appointment:', error);
      throw error;
    }
  },

  getUserAppointments: async (principal) => {
    try {
      return await api.backendActor.get_user_appointments(principal);
    } catch (error) {
      console.error('Error getting user appointments:', error);
      throw error;
    }
  },

  updateAppointmentStatus: async (id, status) => {
    try {
      return await api.backendActor.update_appointment_status({
        id,
        status
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  updateRequestStatus: async (id, status) => {
    try {
      return await api.backendActor.update_request_status({
        id,
        status
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }
};