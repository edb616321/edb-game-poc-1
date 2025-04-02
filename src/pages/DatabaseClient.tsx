
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Database, Table, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceById } from "@/services/serviceStorage";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DatabaseClient = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [selectedSchema, setSelectedSchema] = useState<string>("public");
  const [schemas, setSchemas] = useState<string[]>(["public", "information_schema"]);
  const [tables, setTables] = useState<string[]>([]);
  const [connecting, setConnecting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const foundService = getServiceById(id);
      if (foundService) {
        setService(foundService);
        if (foundService.database) {
          setSelectedDatabase(foundService.database);
        }
      } else {
        toast({
          title: "Error",
          description: "Service not found",
          variant: "destructive",
        });
        navigate("/");
      }
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  const handleConnect = () => {
    setConnecting(true);
    console.log("Attempting to connect to:", service);
    
    // Log connection details for debugging
    if (service.connectionString) {
      console.log("Using connection string:", service.connectionString);
    } else {
      console.log("Using connection details:", {
        host: service.url,
        port: service.port,
        database: service.database,
        user: service.username,
        ssl: service.sslMode
      });
    }
    
    // Simulate connection and data loading
    setTimeout(() => {
      // Mock tables that would be fetched from the database
      const mockTables = [
        "users", 
        "orders", 
        "products", 
        "categories", 
        "customers", 
        "inventory", 
        "transactions"
      ];
      setTables(mockTables);
      setConnecting(false);
      
      toast({
        title: "Connected",
        description: `Successfully connected to ${service.name}`,
      });
    }, 1500);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!service) {
    return <div className="text-center mt-10">Service not found</div>;
  }

  if (service.type !== "PostgreSQL") {
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
          
          <Card>
            <CardHeader>
              <CardTitle>Incompatible Service</CardTitle>
              <CardDescription>
                This client only supports PostgreSQL services. The selected service is of type: {service.type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(`/service/${id}`)}>
                View Service Details
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
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
        
        <div className="grid gap-6 grid-cols-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-1">
                    <div className="flex items-center">
                      <Database className="mr-2 h-5 w-5 text-teal-500" />
                      {service.name}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {service.url}{service.port ? `:${service.port}` : ""}
                    {service.database ? ` / ${service.database}` : ""}
                  </CardDescription>
                </div>
                
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  variant="outline"
                  className="text-teal-500 border-teal-500"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              <Tabs defaultValue="browser" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="browser">Browser</TabsTrigger>
                  <TabsTrigger value="query">Query Tool</TabsTrigger>
                </TabsList>
                
                <TabsContent value="browser">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">Database</label>
                        <Select 
                          value={selectedDatabase} 
                          onValueChange={setSelectedDatabase}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Database" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={service.database || "postgres"}>
                              {service.database || "postgres"}
                            </SelectItem>
                            <SelectItem value="template1">template1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium block mb-2">Schema</label>
                        <Select 
                          value={selectedSchema} 
                          onValueChange={setSelectedSchema}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Schema" />
                          </SelectTrigger>
                          <SelectContent>
                            {schemas.map(schema => (
                              <SelectItem key={schema} value={schema}>
                                {schema}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Tables</h3>
                        {tables.length === 0 ? (
                          <div className="text-sm text-gray-500 italic">
                            {connecting ? "Loading tables..." : "Connect to view tables"}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {tables.map(table => (
                              <div 
                                key={table} 
                                className="flex items-center p-2 rounded hover:bg-slate-100 cursor-pointer text-sm"
                              >
                                <Table className="h-4 w-4 mr-2 text-slate-500" />
                                {table}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:col-span-3 bg-white border border-slate-200 rounded-md p-4 min-h-[400px]">
                      {tables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Database className="h-12 w-12 text-slate-300 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Data to Display</h3>
                          <p className="text-slate-500 max-w-md">
                            Connect to the database and select a table to view its contents.
                          </p>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <h3 className="font-medium mb-4">Select a table to view data</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {tables.map(table => (
                              <div 
                                key={table} 
                                className="border border-slate-200 rounded p-3 hover:bg-slate-50 cursor-pointer"
                              >
                                <div className="flex items-center">
                                  <Table className="h-4 w-4 mr-2 text-teal-500" />
                                  <span className="font-medium">{table}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  {Math.floor(Math.random() * 100)} rows
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="query">
                  <div className="space-y-4">
                    <div className="bg-slate-900 text-slate-50 p-4 rounded-md h-40 font-mono text-sm">
                      -- Write your SQL query here
                      SELECT * FROM users LIMIT 10;
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2">Clear</Button>
                      <Button>Run Query</Button>
                    </div>
                    
                    <div className="border border-slate-200 rounded-md p-4 min-h-[200px]">
                      <div className="text-center text-slate-500">
                        Query results will appear here
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DatabaseClient;
