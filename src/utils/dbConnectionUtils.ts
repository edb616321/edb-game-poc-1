
/**
 * Utility functions for handling database connection strings and validation
 */

/**
 * Validates a PostgreSQL connection string format
 * @param connectionString The connection string to validate
 * @returns An object with validation result and optional corrected string
 */
export const validatePostgresConnectionString = (connectionString: string) => {
  if (!connectionString) {
    return { 
      isValid: false, 
      message: "Connection string is empty",
      correctedString: connectionString 
    };
  }

  // Check if it starts with postgresql://
  if (!connectionString.startsWith('postgresql://')) {
    // Try to fix common typo of postgresql:// vs postgres://
    if (connectionString.startsWith('postgres://')) {
      return {
        isValid: true,
        message: "Fixed 'postgres://' to 'postgresql://'",
        correctedString: connectionString.replace('postgres://', 'postgresql://')
      };
    }
    
    return {
      isValid: false,
      message: "Connection string should start with postgresql://",
      correctedString: connectionString
    };
  }

  return { 
    isValid: true, 
    message: "Valid connection string",
    correctedString: connectionString 
  };
};

/**
 * Builds a PostgreSQL connection string from individual components
 */
export const buildPostgresConnectionString = ({
  username,
  password,
  url,
  port,
  database,
  sslMode
}: {
  username?: string;
  password?: string;
  url: string;
  port?: number | string;
  database: string;
  sslMode?: string;
}) => {
  if (!url || !database) return '';
  
  // Only build connection string if we have enough data
  const userPart = username ? username : '';
  const passwordPart = password ? `:${password}` : '';
  const authPart = userPart ? `${userPart}${passwordPart}@` : '';
  const portPart = port ? `:${port}` : '';
  const sslPart = sslMode ? `?sslmode=${sslMode}` : '';
  
  return `postgresql://${authPart}${url}${portPart}/${database}${sslPart}`;
};

/**
 * Validates a Supabase REST API endpoint format
 * @param endpoint The REST API endpoint to validate
 * @returns An object with validation result and message
 */
export const validateRestApiEndpoint = (endpoint: string) => {
  if (!endpoint) {
    return { 
      isValid: false, 
      message: "REST API endpoint is empty"
    };
  }

  // Very basic validation - should contain "rest"
  if (!endpoint.includes('/rest')) {
    return {
      isValid: false,
      message: "REST API endpoint should include '/rest' path"
    };
  }

  return { 
    isValid: true, 
    message: "Valid REST API endpoint"
  };
};

/**
 * Validates a Supabase Auth endpoint format
 * @param endpoint The Auth endpoint to validate
 * @returns An object with validation result and message
 */
export const validateAuthEndpoint = (endpoint: string) => {
  if (!endpoint) {
    return { 
      isValid: false, 
      message: "Auth endpoint is empty"
    };
  }

  // Very basic validation - should contain "auth"
  if (!endpoint.includes('/auth')) {
    return {
      isValid: false,
      message: "Auth endpoint should include '/auth' path"
    };
  }

  return { 
    isValid: true, 
    message: "Valid Auth endpoint"
  };
};

/**
 * Validates a Supabase Storage endpoint format
 * @param endpoint The Storage endpoint to validate
 * @returns An object with validation result and message
 */
export const validateStorageEndpoint = (endpoint: string) => {
  if (!endpoint) {
    return { 
      isValid: false, 
      message: "Storage endpoint is empty"
    };
  }

  // Very basic validation - should contain "storage"
  if (!endpoint.includes('/storage')) {
    return {
      isValid: false,
      message: "Storage endpoint should include '/storage' path"
    };
  }

  return { 
    isValid: true, 
    message: "Valid Storage endpoint"
  };
};

/**
 * Validates a Supabase Functions endpoint format
 * @param endpoint The Functions endpoint to validate
 * @returns An object with validation result and message
 */
export const validateFunctionsEndpoint = (endpoint: string) => {
  if (!endpoint) {
    return { 
      isValid: false, 
      message: "Functions endpoint is empty"
    };
  }

  // Very basic validation - should contain "functions"
  if (!endpoint.includes('/functions')) {
    return {
      isValid: false,
      message: "Functions endpoint should include '/functions' path"
    };
  }

  return { 
    isValid: true, 
    message: "Valid Functions endpoint"
  };
};

/**
 * Builds Supabase service endpoints from a base URL
 * @param baseUrl The base Supabase URL (e.g., supabase1.brookmanfamily.com)
 * @returns An object containing endpoints for different Supabase services
 */
export const buildSupabaseEndpoints = (baseUrl: string) => {
  if (!baseUrl) return null;
  
  // Remove protocol if included
  const cleanUrl = baseUrl.replace(/^(https?:\/\/)/, '');
  
  return {
    restApiEndpoint: `http://${cleanUrl}/rest/v1`,
    authEndpoint: `http://${cleanUrl}/auth/v1`,
    authHealthEndpoint: `http://${cleanUrl}/auth/v1/health`,
    storageEndpoint: `http://${cleanUrl}/storage/v1`,
    functionsEndpoint: `http://${cleanUrl}/functions/v1`
  };
};

/**
 * Sample test values for a PostgreSQL connection
 */
export const getTestConnectionValues = () => {
  return {
    name: 'Supabase PostgreSQL',
    type: 'PostgreSQL',
    url: 'supabase1.brookmanfamily.com',
    port: 5432,
    database: 'supabase',
    username: 'supabase',
    password: 'supabase',
    status: 'Active',
    connectionString: 'postgresql://supabase:supabase@supabase1.brookmanfamily.com:5432/supabase'
  };
};

/**
 * Sample test values for additional Supabase services
 */
export const getSupabaseServicesTestValues = () => {
  const baseUrl = 'supabase1.brookmanfamily.com';
  
  return {
    baseUrl,
    services: {
      postgresql: {
        name: 'PostgreSQL Database',
        url: baseUrl,
        port: 5432,
        database: 'supabase',
        username: 'supabase',
        password: 'supabase',
        connectionString: 'postgresql://supabase:supabase@supabase1.brookmanfamily.com:5432/supabase',
        testMethod: 'Connection string'
      },
      rest: {
        name: 'REST API (PostgREST)',
        endpoint: `http://${baseUrl}/rest/v1`,
        apiKey: 'your-anon-key',
        testMethod: 'GET request'
      },
      auth: {
        name: 'Auth Service',
        endpoint: `http://${baseUrl}/auth/v1`,
        healthEndpoint: `http://${baseUrl}/auth/v1/health`,
        testMethod: 'Health check'
      },
      storage: {
        name: 'Storage Service',
        endpoint: `http://${baseUrl}/storage/v1`,
        testMethod: 'GET request'
      },
      functions: {
        name: 'Edge Functions',
        endpoint: `http://${baseUrl}/functions/v1`,
        sampleFunction: 'hello-world',
        testMethod: 'Function invocation'
      }
    }
  };
};

/**
 * Validates basic PostgreSQL connection details
 */
export const validateConnectionDetails = (service: {
  type: string;
  connectionString?: string;
  url?: string;
  database?: string;
  username?: string;
}) => {
  // For PostgreSQL services
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
      
      // Don't strictly require username/password - some connections might use other auth methods
      if (!service.username) {
        return {
          isValid: true,
          message: "Warning: Username is missing. Connection might fail if authentication is required."
        };
      }
    }
  }
  
  return { isValid: true, message: "Valid connection details" };
};
