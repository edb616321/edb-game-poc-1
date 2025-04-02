
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveService } from "@/services/serviceStorage";
import ServiceForm from "@/components/ServiceForm";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";

const AddService = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const newService = saveService(data);
      toast({
        title: "Service added",
        description: `${newService.name} has been added successfully`,
      });
      navigate("/");
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold mb-6">Add New Service</h1>
          <ServiceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  );
};

export default AddService;
