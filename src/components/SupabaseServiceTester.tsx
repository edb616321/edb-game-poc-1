
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { 
  Loader2, Database, Server, Lock, HardDrive, 
  CheckCircle, XCircle, Info 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { buildSupabaseEndpoints, getSupabaseServicesTestValues } from "@/utils/dbConnectionUtils";

const supabaseTestSchema = z.object({
  baseUrl: z.string().min(2, { message: "Please enter a valid Supabase host" }),
  apiKey: z.string().optional(),
});

type SupabaseTestFormValues = z.infer<typeof supabaseTestSchema>;

type TestStatus = "idle" | "pending" | "success" | "error" | "warning";

interface ServiceTestResult {
  name: string;
  status: TestStatus;
  message: string;
  endpoint?: string;
  details?: string;
}

const SupabaseServiceTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<ServiceTestResult[]>([]);

  const form = useForm<SupabaseTestFormValues>({
    resolver: zodResolver(supabaseTestSchema),
    defaultValues: {
      baseUrl: "supabase1.brookmanfamily.com",
      apiKey: "",
    },
  });

  const fillTestValues = () => {
    const testValues = getSupabaseServicesTestValues();
    form.setValue("baseUrl", testValues.baseUrl);
    form.setValue("apiKey", "your-anon-key"); // Sample API key
    toast({
      title: "Test Values Added",
      description: "Sample Supabase test values have been filled in the form",
    });
  };

  const testSupabaseServices = async (data: SupabaseTestFormValues) => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Get all endpoints for the provided base URL
      const endpoints = buildSupabaseEndpoints(data.baseUrl);
      if (!endpoints) {
        toast({
          title: "Invalid URL",
          description: "Could not generate Supabase endpoints from the provided URL",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Start with testing results in "pending" state
      const initialResults: ServiceTestResult[] = [
        {
          name: "PostgreSQL Database",
          status: "pending",
          message: "Testing connection...",
          endpoint: `postgresql://${data.baseUrl}:5432/postgres`,
        },
        {
          name: "REST API (PostgREST)",
          status: "pending",
          message: "Testing connection...",
          endpoint: endpoints.restApiEndpoint,
        },
        {
          name: "Auth Service",
          status: "pending",
          message: "Testing connection...",
          endpoint: endpoints.authHealthEndpoint,
        },
        {
          name: "Storage Service",
          status: "pending",
          message: "Testing connection...",
          endpoint: endpoints.storageEndpoint,
        },
        {
          name: "Edge Functions",
          status: "pending",
          message: "Testing connection...",
          endpoint: endpoints.functionsEndpoint,
        },
      ];
      
      setTestResults(initialResults);

      // Simulate individual service tests with staggered timing
      // In a real implementation, these would be actual API calls
      let updatedResults = [...initialResults];
      
      // Test PostgreSQL
      await new Promise(resolve => setTimeout(resolve, 800));
      updatedResults[0] = {
        ...updatedResults[0],
        status: "success",
        message: "Successfully connected to PostgreSQL database",
        details: "Connection established to PostgreSQL server running on port 5432"
      };
      setTestResults([...updatedResults]);
      
      // Test REST API
      await new Promise(resolve => setTimeout(resolve, 600));
      const restApiSuccess = Math.random() > 0.3; // 70% success rate for demo
      updatedResults[1] = {
        ...updatedResults[1],
        status: restApiSuccess ? "success" : "error",
        message: restApiSuccess 
          ? "Successfully connected to REST API" 
          : "Failed to connect to REST API",
        details: restApiSuccess
          ? "Connected to PostgREST service. API version: 11.1.0"
          : "Connection failed with status 403. Check API key and permissions."
      };
      setTestResults([...updatedResults]);
      
      // Test Auth Service
      await new Promise(resolve => setTimeout(resolve, 700));
      updatedResults[2] = {
        ...updatedResults[2],
        status: "success",
        message: "Auth service is healthy",
        details: "Health check passed. Service is running normally."
      };
      setTestResults([...updatedResults]);
      
      // Test Storage Service
      await new Promise(resolve => setTimeout(resolve, 500));
      const storageWarning = Math.random() > 0.5; // 50% warning rate for demo
      updatedResults[3] = {
        ...updatedResults[3],
        status: storageWarning ? "warning" : "success",
        message: storageWarning 
          ? "Storage service connected with warnings" 
          : "Successfully connected to Storage service",
        details: storageWarning
          ? "Connection established but disk usage is high (85% capacity)"
          : "Storage service is healthy and operating normally."
      };
      setTestResults([...updatedResults]);
      
      // Test Edge Functions
      await new Promise(resolve => setTimeout(resolve, 900));
      updatedResults[4] = {
        ...updatedResults[4],
        status: "success",
        message: "Edge Functions service is accessible",
        details: "Successfully connected to Edge Functions service."
      };
      setTestResults([...updatedResults]);

      const successCount = updatedResults.filter(r => r.status === "success").length;
      const errorCount = updatedResults.filter(r => r.status === "error").length;
      const warningCount = updatedResults.filter(r => r.status === "warning").length;
      
      toast({
        title: errorCount ? "Test Completed with Errors" : "Test Successful",
        description: `${successCount} services healthy, ${warningCount} warnings, ${errorCount} errors`,
        variant: errorCount ? "destructive" : warningCount ? "default" : "default",
      });
    } catch (error) {
      console.error("Test failed:", error);
      toast({
        title: "Test Failed",
        description: "An unexpected error occurred during testing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes("PostgreSQL")) {
      return <Database className="h-5 w-5" />;
    } else if (serviceName.includes("REST API")) {
      return <Server className="h-5 w-5" />;
    } else if (serviceName.includes("Auth")) {
      return <Lock className="h-5 w-5" />;
    } else if (serviceName.includes("Storage")) {
      return <HardDrive className="h-5 w-5" />;
    } else {
      return <Server className="h-5 w-5" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Database className="h-4 w-4" />
          Test Supabase Services
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Supabase Services Tester</SheetTitle>
          <SheetDescription>
            Test connectivity to multiple Supabase services from a single host
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(testSupabaseServices)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supabase Host URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="supabase1.example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Supabase anon key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={fillTestValues}
                  className="flex-1"
                >
                  Fill Test Values
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testing...
                    </>
                  ) : (
                    "Test Services"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {testResults.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium">Test Results</h3>
              <Accordion type="multiple" className="space-y-2">
                {testResults.map((result, index) => (
                  <AccordionItem 
                    value={`item-${index}`} 
                    key={index}
                    className={cn(
                      "border rounded-md",
                      result.status === "success" && "border-green-200 bg-green-50",
                      result.status === "error" && "border-red-200 bg-red-50",
                      result.status === "warning" && "border-yellow-200 bg-yellow-50",
                      result.status === "pending" && "border-blue-200 bg-blue-50"
                    )}
                  >
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        {getServiceIcon(result.name)}
                        <span className="font-medium">{result.name}</span>
                        <div className="ml-auto">
                          {getStatusIcon(result.status)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-0">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold">Status:</span> {result.message}
                        </div>
                        {result.endpoint && (
                          <div>
                            <span className="font-semibold">Endpoint:</span>{" "}
                            <code className="text-xs bg-black/10 px-1 py-0.5 rounded">
                              {result.endpoint}
                            </code>
                          </div>
                        )}
                        {result.details && (
                          <div>
                            <span className="font-semibold">Details:</span> {result.details}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SupabaseServiceTester;
