
import React from "react";
import Dashboard from "./Dashboard";
import PortTester from "@/components/PortTester";
import SupabaseServiceTester from "@/components/SupabaseServiceTester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Service Testing Tools</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Port Tester Card */}
          <Card className="shadow-md border-teal-100">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 pb-2">
              <CardTitle className="text-lg font-medium text-teal-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plug">
                  <path d="M12 22v-5"></path>
                  <path d="M9 8V2"></path>
                  <path d="M15 8V2"></path>
                  <path d="M18 8v6a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8z"></path>
                </svg>
                Port Connectivity Tester
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-slate-600 mb-4">
                Test if a specific port is open and accessible on a remote host.
                Useful for troubleshooting network connectivity issues.
              </p>
              <PortTester />
            </CardContent>
          </Card>
          
          {/* Supabase Service Tester Card */}
          <Card className="shadow-md border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 pb-2">
              <CardTitle className="text-lg font-medium text-indigo-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-database">
                  <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
                Supabase Services Tester
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-slate-600 mb-4">
                Test connectivity to multiple Supabase services including PostgreSQL, 
                REST API, Auth, Storage, and Edge Functions.
              </p>
              <SupabaseServiceTester />
            </CardContent>
          </Card>
        </div>
        
        <Dashboard />
      </div>
    </>
  );
};

export default Index;
