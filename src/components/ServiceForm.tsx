
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Service } from "@/types/service";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Define the base schema for consistent typing
const serviceSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.string().min(1, { message: "Service type is required" }),
  url: z.string().min(1, { message: "URL/hostname is required" }),
  connectionString: z.string().optional(),
  apiKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  status: z.string().default("Inactive"),
  notes: z.string().optional(),
  database: z.string().optional(),
  port: z.union([
    z.number().positive(),
    z.string().transform(val => val === "" ? undefined : Number(val))
  ]).optional(),
  sslMode: z.enum(['disable', 'require', 'prefer', 'verify-ca', 'verify-full']).optional(),
});

// Define the schema type for TypeScript
type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: Service;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [useConnectionString, setUseConnectionString] = React.useState(
    !!initialData?.connectionString
  );
  const [selectedServiceType, setSelectedServiceType] = React.useState(
    initialData?.type || "PostgreSQL" // Default to PostgreSQL for better user experience
  );

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData || {
      name: "",
      type: "PostgreSQL", // Default to PostgreSQL
      url: "",
      connectionString: "",
      apiKey: "",
      username: "",
      password: "",
      status: "Inactive",
      notes: "",
      database: "",
      port: 5432,
      sslMode: "prefer",
    },
  });

  const handleSubmit = (data: ServiceFormValues) => {
    try {
      // Handle PostgreSQL connection string if provided
      if (selectedServiceType === 'PostgreSQL' && useConnectionString && data.connectionString) {
        // Check basic format before submitting
        if (!data.connectionString.startsWith('postgresql://')) {
          // Try to fix common typo of postgresql:// vs postgres://
          if (data.connectionString.startsWith('postgres://')) {
            data.connectionString = data.connectionString.replace('postgres://', 'postgresql://');
          } else {
            toast({
              title: "Invalid Connection String Format",
              description: "Connection string must start with postgresql://",
              variant: "destructive",
            });
            return;
          }
        }
        
        // Don't require strict parsing - allow the string to pass through
        console.log("Using connection string:", data.connectionString);
      }

      // If using individual fields for PostgreSQL, ensure port is numeric
      if (typeof data.port === 'string' && data.port) {
        data.port = parseInt(data.port);
        if (isNaN(data.port as number)) {
          toast({
            title: "Invalid Port",
            description: "Port must be a valid number",
            variant: "destructive",
          });
          return;
        }
      }
      
      onSubmit(data);
    } catch (error) {
      console.error("Error processing form:", error);
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isPostgresService = selectedServiceType === 'PostgreSQL';

  // Helper function to build connection string from individual fields
  const buildConnectionString = () => {
    if (!isPostgresService) return;
    
    const { username, password, url, port, database, sslMode } = form.getValues();
    if (!url || !database) return;
    
    // Only build connection string if we have enough data
    const userPart = username ? username : '';
    const passwordPart = password ? `:${password}` : '';
    const authPart = userPart ? `${userPart}${passwordPart}@` : '';
    const portPart = port ? `:${port}` : '';
    const sslPart = sslMode ? `?sslmode=${sslMode}` : '';
    
    const connectionString = `postgresql://${authPart}${url}${portPart}/${database}${sslPart}`;
    form.setValue('connectionString', connectionString);
  };

  // Test connection with Brook's values
  const fillTestValues = () => {
    form.setValue('name', 'Supabase PostgreSQL');
    form.setValue('type', 'PostgreSQL');
    form.setValue('url', 'supabase1.brookmanfamily.com');
    form.setValue('port', 5432);
    form.setValue('database', 'supabase');
    form.setValue('username', 'supabase');
    form.setValue('password', 'supabase');
    form.setValue('status', 'Active');
    
    // Also set the connection string
    form.setValue('connectionString', 'postgresql://supabase:supabase@supabase1.brookmanfamily.com:5432/supabase');
    
    // Trigger validation
    form.trigger();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name</FormLabel>
                <FormControl>
                  <Input placeholder="My PostgreSQL Database" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedServiceType(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                    <SelectItem value="Database">Other Database</SelectItem>
                    <SelectItem value="Authentication">Authentication</SelectItem>
                    <SelectItem value="Storage">Storage</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="Hosting">Hosting</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isPostgresService ? 'Server Hostname' : 'Service URL'}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={isPostgresService ? "supabase1.brookmanfamily.com" : "https://example.com"} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isPostgresService && (
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5432"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="supabase"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="useConnectionString" 
            checked={useConnectionString}
            onCheckedChange={(checked) => setUseConnectionString(checked as boolean)}
          />
          <Label htmlFor="useConnectionString">Use connection string instead of individual fields</Label>
        </div>

        {useConnectionString ? (
          <FormField
            control={form.control}
            name="connectionString"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connection String</FormLabel>
                <FormControl>
                  <Input
                    placeholder="postgresql://supabase:supabase@supabase1.brookmanfamily.com:5432/supabase"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
                {isPostgresService && (
                  <p className="text-xs text-slate-500 mt-1">
                    Format: postgresql://username:password@hostname:port/database
                  </p>
                )}
              </FormItem>
            )}
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {isPostgresService && (
              <FormField
                control={form.control}
                name="sslMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SSL Mode</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value || 'prefer'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select SSL mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="disable">Disable</SelectItem>
                        <SelectItem value="require">Require</SelectItem>
                        <SelectItem value="prefer">Prefer</SelectItem>
                        <SelectItem value="verify-ca">Verify CA</SelectItem>
                        <SelectItem value="verify-full">Verify Full</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="supabase"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="supabase"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about this service"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={fillTestValues}>
            Fill Test Values
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Service" : "Add Service"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceForm;
