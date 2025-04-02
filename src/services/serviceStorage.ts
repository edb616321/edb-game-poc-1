
import { Service } from '@/types/service';

// Key for localStorage
const SERVICES_STORAGE_KEY = 'service-nexus-services';

// Get all services from localStorage
export const getAllServices = (): Service[] => {
  const servicesJSON = localStorage.getItem(SERVICES_STORAGE_KEY);
  return servicesJSON ? JSON.parse(servicesJSON) : [];
};

// Get a single service by ID
export const getServiceById = (id: string): Service | undefined => {
  const services = getAllServices();
  return services.find(service => service.id === id);
};

// Save a new service
export const saveService = (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service => {
  const services = getAllServices();
  const now = new Date().toISOString();
  
  const newService: Service = {
    ...service,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  
  services.push(newService);
  localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  
  return newService;
};

// Update an existing service
export const updateService = (id: string, serviceData: Partial<Service>): Service | undefined => {
  const services = getAllServices();
  const index = services.findIndex(service => service.id === id);
  
  if (index === -1) return undefined;
  
  const updatedService: Service = {
    ...services[index],
    ...serviceData,
    updatedAt: new Date().toISOString(),
  };
  
  services[index] = updatedService;
  localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  
  return updatedService;
};

// Delete a service
export const deleteService = (id: string): boolean => {
  const services = getAllServices();
  const filteredServices = services.filter(service => service.id !== id);
  
  if (filteredServices.length === services.length) {
    return false; // No service was removed
  }
  
  localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(filteredServices));
  return true;
};

// Record a test attempt
export const recordServiceTest = (id: string): Service | undefined => {
  return updateService(id, { lastTested: new Date().toISOString() });
};
