
import React, { useState, useEffect } from "react";
import { Service } from "@/types/service";
import { getAllServices, deleteService } from "@/services/serviceStorage";
import Header from "@/components/Header";
import ServiceCard from "@/components/ServiceCard";
import EmptyState from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Database, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    const loadedServices = getAllServices();
    setServices(loadedServices);
  };

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      const deleted = deleteService(serviceToDelete);
      if (deleted) {
        toast({
          title: "Service deleted",
          description: "The service has been removed successfully",
        });
        loadServices();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the service",
          variant: "destructive",
        });
      }
      setServiceToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setServiceToDelete(null);
    setDeleteDialogOpen(false);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) || 
      service.url.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || service.type === typeFilter;
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get unique service types and statuses for filters
  const serviceTypes = Array.from(new Set(services.map(service => service.type)));
  const serviceStatuses = Array.from(new Set(services.map(service => service.status)));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Remote Services</h1>
          <div className="flex items-center">
            <Badge variant="outline" className="flex items-center gap-1 mr-2">
              <Database className="h-3 w-3" />
              <span>{services.length} Services</span>
            </Badge>
            <button 
              onClick={loadServices}
              className="p-2 rounded-full hover:bg-slate-200 transition-colors"
              title="Refresh services"
            >
              <RefreshCw className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>

        {services.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or URL..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {serviceStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredServices.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-10 text-center border border-slate-200">
                <h3 className="text-xl font-medium mb-2">No matching services</h3>
                <p className="text-slate-500">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              service and remove all of its data from local storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
