import { backendActor } from './api';

export const ServiceType = {
  Legal: { Legal: null },
  Medical: { Medical: null },
  Counseling: { Counseling: null },
  Police: { Police: null }
};

export const Priority = {
  Emergency: 'Emergency',
  High: 'High',
  Medium: 'Medium',
  Low: 'Low'
};

export const serviceApi = {

  getServiceRequest: async (id) => {
    try {
      return await backendActor.get_service_request(id);
    } catch (error) {
      console.error('Error getting service request:', error);
      throw error;
    }
  },

  getUserServiceRequests: async (principal) => {
    try {
      return await backendActor.get_user_service_requests(principal);
    } catch (error) {
      console.error('Error getting user service requests:', error);
      throw error;
    }
  },

  // Appointments
  scheduleAppointment: async (serviceType, datetime, notes) => {
    try {
      return await backendActor.schedule_appointment({
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
      return await backendActor.get_appointment(id);
    } catch (error) {
      console.error('Error getting appointment:', error);
      throw error;
    }
  },

  getUserAppointments: async (principal) => {
    try {
      return await backendActor.get_user_appointments(principal);
    } catch (error) {
      console.error('Error getting user appointments:', error);
      throw error;
    }
  },

  updateAppointmentStatus: async (id, status) => {
    try {
      return await backendActor.update_appointment_status({
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
      return await backendActor.update_request_status({
        id,
        status
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }

  }
  ,

  ServiceType: {
    Legal: 'legal',
    Medical: 'medical', 
    Counseling: 'counseling',
    Police: 'police'
  },

  getServiceStats: async (serviceType) => {
    try {
      return await backendActor.get_service_stats({ [serviceType]: null });
    } catch (error) {
      console.error('Error getting service stats:', error);
      throw error;
    }
  },

  getAllProviders: async () => {
    try {
      return await backendActor.get_all_providers();
    } catch (error) {
      console.error('Error getting all providers:', error);
      throw error; 
    }
  },
  addProvider: async (providerData) => {
    try {
      return await backendActor.add_provider(providerData);
    } catch (error) {
      console.error('Error adding provider:', error);
      throw error;
    }
  }
};