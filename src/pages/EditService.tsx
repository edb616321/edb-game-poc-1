
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceById, updateService } from "@/services/serviceStorage";
import ServiceForm from "@/components/ServiceForm";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";

const EditService = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const foundService = getServiceById(id);
      if (foundService) {
        setService(foundService);
      } else {
        toast({
          title: "Error",
          description: "Service not found",
          variant: "destructive",
        });
        navigate("/");
      }
    }
    setIsLoading(false);
  }, [id, navigate, toast]);

  const handleSubmit = async (data: any) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const updatedService = updateService(id, data);
      if (updatedService) {
        toast({
          title: "Service updated",
          description: `${updatedService.name} has been updated successfully`,
        });
        navigate(`/service/${id}`);
      } else {
        throw new Error("Failed to update service");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!service) {
    return <div className="text-center mt-10">Service not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/service/${id}`)}
          className="mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Service
        </Button>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold mb-6">Edit Service</h1>
          <ServiceForm 
            initialData={service} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </div>
      </main>
    </div>
  );
};

export default EditService;
