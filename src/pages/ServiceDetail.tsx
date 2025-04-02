import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getServiceById, recordServiceTest, deleteService } from "@/services/serviceStorage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Key, 
  User, 
  Lock,
  RefreshCcw,
  Eye,
  EyeOff,
  ClipboardCopy,
  Database
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
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

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  const loadService = () => {
    if (!id) return;
    
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
    setIsLoading(false);
  };

  const handleTest = () => {
    if (!id) return;
    
    const updated = recordServiceTest(id);
    if (updated) {
      setService(updated);
      toast({
        title: "Service tested",
        description: "Test timestamp has been updated",
      });
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!id) return;
    
    const deleted = deleteService(id);
    if (deleted) {
      toast({
        title: "Service deleted",
        description: "The service has been removed successfully",
      });
      navigate("/");
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the service",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label} copied to clipboard`,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!service) {
    return <div className="text-center mt-10">Service not found</div>;
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-1">{service.name}</CardTitle>
                    <CardDescription className="text-sm flex items-center">
                      <span className="mr-3">{service.type}</span>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/edit-service/${service.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600" 
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Service URL</h3>
                    <div className="flex items-center gap-2">
                      <p className="font-mono break-all">{service.url}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={() => copyToClipboard(service.url, "URL")}
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                      <a 
                        href={service.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-teal-500 hover:text-teal-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {service.type === "PostgreSQL" && (
                      <Link to={`/database-client/${service.id}`}>
                        <Button 
                          variant="outline" 
                          className="text-teal-500 border-teal-500"
                        >
                          <Database className="h-4 w-4 mr-1" /> Open Database Client
                        </Button>
                      </Link>
                    )}
                    <Button 
                      onClick={handleTest} 
                      variant="outline" 
                      className="text-teal-500 border-teal-500"
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" /> Record Test
                    </Button>
                  </div>
                </div>

                {service.type === "PostgreSQL" && (service.database || service.port) && (
                  <div className="mb-6 bg-slate-50 p-3 rounded-md border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">PostgreSQL Details</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {service.database && (
                        <div>
                          <span className="text-xs text-slate-500 block">Database</span>
                          <span className="font-mono">{service.database}</span>
                        </div>
                      )}
                      {service.port && (
                        <div>
                          <span className="text-xs text-slate-500 block">Port</span>
                          <span className="font-mono">{service.port}</span>
                        </div>
                      )}
                      {service.sslMode && (
                        <div>
                          <span className="text-xs text-slate-500 block">SSL Mode</span>
                          <span className="font-mono">{service.sslMode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {service.apiKey && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-500">API Key</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-sm bg-slate-50 p-2 rounded border border-slate-200 flex items-center">
                        <Key className="h-3 w-3 text-slate-400 mr-2 flex-shrink-0" />
                        {showApiKey ? (
                          <span className="truncate flex-1">{service.apiKey}</span>
                        ) : (
                          <span className="flex-1">••••••••••••••••••••••••</span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(service.apiKey || "", "API Key")}
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {(service.username || service.password) && (
                  <div className="space-y-1">
                    {service.username && (
                      <div className="mb-2">
                        <h3 className="text-sm font-medium text-slate-500">Username</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 font-mono text-sm bg-slate-50 p-2 rounded border border-slate-200 flex items-center">
                            <User className="h-3 w-3 text-slate-400 mr-2 flex-shrink-0" />
                            <span className="truncate">{service.username}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => copyToClipboard(service.username || "", "Username")}
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {service.password && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500">Password</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 font-mono text-sm bg-slate-50 p-2 rounded border border-slate-200 flex items-center">
                            <Lock className="h-3 w-3 text-slate-400 mr-2 flex-shrink-0" />
                            {showPassword ? (
                              <span className="truncate flex-1">{service.password}</span>
                            ) : (
                              <span className="flex-1">••••••••••••••••</span>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => copyToClipboard(service.password || "", "Password")}
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {service.notes && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Notes</h3>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 whitespace-pre-wrap">
                      {service.notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.lastTested && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Last Tested</h3>
                    <p>{formatDate(service.lastTested)}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Created</h3>
                  <p>{formatDate(service.createdAt)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Last Modified</h3>
                  <p>{formatDate(service.updatedAt)}</p>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start">
                <Separator className="mb-4" />
                <Link to={`/edit-service/${service.id}`} className="w-full">
                  <Button className="w-full" variant="outline">Edit Service</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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

export default ServiceDetail;
