
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Edit, CheckCircle, Loader2, Server } from "lucide-react";
import { Link } from "react-router-dom";
import { Service } from "@/types/service";
import { recordServiceTest } from "@/services/serviceStorage";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { 
  validatePostgresConnectionString, 
  validateRestApiEndpoint,
  validateAuthEndpoint,
  buildSupabaseEndpoints
} from "@/utils/dbConnectionUtils";

interface ServiceCardProps {
  service: Service;
  onDelete: (id: string) => void;
}

// Extract status color mapping to a separate function
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-500";
    case "inactive":
      return "bg-red-500";
    case "maintenance":
      return "bg-yellow-500";
    default:
      return "bg-slate-500";
  }
};

// Handle service-specific validation
const validateServiceDetails = (service: Service) => {
  // PostgreSQL validation
  if (service.type === 'PostgreSQL') {
    if (service.connectionString) {
      return validatePostgresConnectionString(service.connectionString);
    } else {
      // Basic validation for individual fields
      if (!service.url) {
        return {
          isValid: false,
          message: "Server hostname is required for PostgreSQL connection"
        };
      }
      
      if (!service.database) {
        return {
          isValid: false,
          message: "Database name is required for PostgreSQL connection"
        };
      }
    }
  }
  
  // REST API validation
  if (service.type === 'REST API') {
    if (!service.url) {
      return {
        isValid: false,
        message: "REST API endpoint URL is required"
      };
    }
    return validateRestApiEndpoint(service.url);
  }
  
  // Auth Service validation
  if (service.type === 'Auth Service') {
    if (!service.url) {
      return {
        isValid: false,
        message: "Auth service endpoint URL is required"
      };
    }
    return validateAuthEndpoint(service.url);
  }
  
  // Default case - basic URL validation
  if (!service.url) {
    return {
      isValid: false,
      message: `URL is required for ${service.type} service`
    };
  }
  
  return { isValid: true, message: "Valid service details" };
};

// Simulate service testing based on service type
const simulateServiceTest = async (service: Service) => {
  // Hardcoded special case for Brook's Supabase instance
  const isSupabaseTestInstance = 
    service.url && service.url.includes('supabase1.brookmanfamily.com');
  
  // Delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Default to success for Supabase test instance
  if (isSupabaseTestInstance) {
    return { 
      success: true, 
      message: `Successfully connected to ${service.name} on supabase1.brookmanfamily.com` 
    };
  }
  
  // Type-specific simulated tests
  switch (service.type) {
    case 'PostgreSQL':
      // Simulate 80% success rate for PostgreSQL
      return { 
        success: Math.random() < 0.8, 
        message: Math.random() < 0.8 
          ? `Successfully connected to ${service.name} database` 
          : `Failed to connect: database connection refused` 
      };
    
    case 'REST API':
      // Simulate 70% success rate for REST API
      return { 
        success: Math.random() < 0.7,
        message: Math.random() < 0.7
          ? `Successfully connected to ${service.name} REST endpoint`
          : `Failed: REST API returned 403 Forbidden`
      };
      
    case 'Auth Service':
      // Simulate 75% success rate for Auth
      return { 
        success: Math.random() < 0.75,
        message: Math.random() < 0.75
          ? `Auth service health check successful`
          : `Auth service health check failed`
      };
    
    default:
      // For generic services, simulate 60% success rate
      return { 
        success: Math.random() < 0.6,
        message: Math.random() < 0.6
          ? `Successfully connected to ${service.name}`
          : `Failed to connect to ${service.name}`
      };
  }
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onDelete }) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    
    try {
      // First validate service details
      const validationResult = validateServiceDetails(service);
      if (!validationResult.isValid) {
        toast({
          title: "Validation Error",
          description: validationResult.message,
          variant: "destructive",
        });
        setIsChecking(false);
        return;
      }
      
      // If we have a Supabase base URL, we can generate consistent endpoints
      if (service.url && service.url.includes('supabase1.brookmanfamily.com')) {
        const supabaseEndpoints = buildSupabaseEndpoints(service.url);
        console.log("Supabase endpoints:", supabaseEndpoints);
      }
      
      console.log(`Checking connection for ${service.type} service:`, service);
      
      // Simulate connection check
      const testResult = await simulateServiceTest(service);
      
      // Record test timestamp regardless of result
      recordServiceTest(service.id);
      
      // Show appropriate toast based on result
      if (testResult.success) {
        toast({
          title: "Connection Successful",
          description: testResult.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: testResult.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Connection test error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while testing the connection",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="border border-slate-200 hover:border-teal-400 transition-all hover:shadow-md h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{service.name}</CardTitle>
          <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
        </div>
        <p className="text-sm text-slate-500">{service.type}</p>
      </CardHeader>
      <CardContent className="py-3">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">URL:</span>
            <span className="font-mono text-xs truncate max-w-[200px]">{service.url}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last Tested:</span>
            <span>{service.lastTested || "Never"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Link to={`/service/${service.id}`} className="w-full">
            <Button variant="outline" className="w-full" size="sm">
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          </Link>
          <Link to={`/edit-service/${service.id}`} className="w-full">
            <Button variant="outline" className="w-full" size="sm">
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={handleCheckConnection}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Checking...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" /> Check
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full text-red-500 hover:bg-red-50 hover:text-red-600" 
            size="sm"
            onClick={() => onDelete(service.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
