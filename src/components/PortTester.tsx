
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
import { Loader2, Plug, CheckCircle, XCircle, Radio, CircleSlash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const portTestSchema = z.object({
  host: z.string().min(2, { message: "Please enter a valid host or IP" }),
  port: z.coerce
    .number()
    .int()
    .min(1, { message: "Port must be at least 1" })
    .max(65535, { message: "Port cannot exceed 65535" }),
});

type PortTestFormValues = z.infer<typeof portTestSchema>;

interface PortTestResult {
  timestamp: string;
  // First test - port reachability
  isPortOpen: boolean;
  portMessage: string;
  // Second test - application listening
  isListening: boolean | null;
  listeningMessage: string;
  // Details
  connectionDetails: string;
}

// Common open ports that should always be shown as open
const COMMON_OPEN_PORTS = [80, 443, 22, 21, 25, 3306, 8080, 8443];

const PortTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<PortTestResult | null>(null);

  const form = useForm<PortTestFormValues>({
    resolver: zodResolver(portTestSchema),
    defaultValues: {
      host: "",
      port: 443,
    },
  });

  const simulatePortTest = async (data: PortTestFormValues) => {
    setIsLoading(true);
    setTestResult(null);

    // In a real-world scenario, we would call an API endpoint
    // that would perform the actual ping/telnet-like check.
    // For now, we'll simulate the response with a delay and consistent results

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Test 1: Basic port reachability (ping)
      // Always show common ports as open for better demo consistency
      const isPortOpen = COMMON_OPEN_PORTS.includes(data.port);
      let isListening = null;
      
      // Test 2: Service listening check (only if port is open)
      if (isPortOpen) {
        // For ports 80 and 443, always show as listening
        isListening = [80, 443].includes(data.port);
      }
      
      const timestamp = new Date().toISOString();
      
      // Construct messages for each test
      let portMessage = "";
      let listeningMessage = "";
      let connectionDetails = "";
      
      if (isPortOpen) {
        portMessage = `Port ${data.port} is reachable on ${data.host}`;
        connectionDetails = "Connection established to remote host.";
        
        if (isListening === true) {
          listeningMessage = `Service is listening on port ${data.port}`;
          connectionDetails += " Service responded to connection attempt.";
        } else if (isListening === false) {
          listeningMessage = `No service appears to be listening on port ${data.port}`;
          connectionDetails += " Connection established but no response from any service.";
        }
      } else {
        portMessage = `Connection to ${data.host} on port ${data.port} failed.`;
        listeningMessage = "Listening test could not be performed";
        connectionDetails = "No response received from target host within timeout period. The port might be closed or filtered by a firewall.";
      }

      setTestResult({
        timestamp,
        isPortOpen,
        portMessage,
        isListening,
        listeningMessage,
        connectionDetails,
      });

      // Use appropriate toast based on the test outcomes
      if (!isPortOpen) {
        toast({
          title: "Port Closed",
          description: portMessage,
          variant: "destructive",
        });
      } else if (isListening === false) {
        toast({
          title: "Port Open, Not Listening",
          description: `${portMessage}, but ${listeningMessage.toLowerCase()}`,
          variant: "default",
        });
      } else if (isListening === true) {
        toast({
          title: "Port Open & Listening",
          description: `${portMessage} and ${listeningMessage.toLowerCase()}`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Test failed",
        description: "An error occurred while testing the port",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plug className="h-4 w-4" />
          Quick Port Test
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Quick Port Test</SheetTitle>
          <SheetDescription>
            Check if a specific port is open and listening on a remote host.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(simulatePortTest)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host or IP Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example.com or 192.168.1.1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={65535}
                        placeholder="443"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testing...
                  </>
                ) : (
                  "Test Port"
                )}
              </Button>
            </form>
          </Form>

          {testResult && (
            <div className="mt-6 space-y-4">
              {/* Test 1: Port Reachability Results */}
              <Card className={cn(
                testResult.isPortOpen ? "bg-green-50" : "bg-red-50"
              )}>
                <CardHeader className={cn(
                  "pb-2",
                  testResult.isPortOpen ? "text-green-700" : "text-red-700"
                )}>
                  <CardTitle className="text-base flex items-center gap-2">
                    {testResult.isPortOpen ? (
                      <>
                        <CheckCircle className="h-5 w-5" /> Port Reachable
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" /> Port Closed
                      </>
                    )}
                  </CardTitle>
                  <CardDescription
                    className={testResult.isPortOpen ? "text-green-600" : "text-red-600"}
                  >
                    {new Date(testResult.timestamp).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <p>{testResult.portMessage}</p>
                </CardContent>
              </Card>

              {/* Test 2: Service Listening Results (only shown if port is open) */}
              {testResult.isPortOpen && (
                <Card className={cn(
                  testResult.isListening === true ? "bg-green-50" : 
                  testResult.isListening === false ? "bg-yellow-50" : "bg-gray-50"
                )}>
                  <CardHeader className={cn(
                    "pb-2",
                    testResult.isListening === true ? "text-green-700" : 
                    testResult.isListening === false ? "text-yellow-700" : "text-gray-700"
                  )}>
                    <CardTitle className="text-base flex items-center gap-2">
                      {testResult.isListening === true ? (
                        <>
                          <Radio className="h-5 w-5" /> Service Listening
                        </>
                      ) : testResult.isListening === false ? (
                        <>
                          <CircleSlash className="h-5 w-5" /> Not Listening
                        </>
                      ) : (
                        <>
                          <CircleSlash className="h-5 w-5" /> Listening Test Skipped
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p>{testResult.listeningMessage}</p>
                  </CardContent>
                </Card>
              )}

              {/* Additional Details Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Connection Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-muted-foreground">{testResult.connectionDetails}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PortTester;
