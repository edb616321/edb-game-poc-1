
export interface Service {
  id: string;
  name: string;
  type: string;
  url: string;
  connectionString?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  status: string;
  notes?: string;
  lastTested?: string;
  createdAt: string;
  updatedAt: string;
  // PostgreSQL specific fields
  database?: string;
  port?: number;
  sslMode?: 'disable' | 'require' | 'prefer' | 'verify-ca' | 'verify-full';
}
