
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ServerOff } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center p-8 max-w-md">
        <div className="bg-white p-6 rounded-full inline-flex mb-6">
          <ServerOff className="h-12 w-12 text-slate-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-slate-800">404 - Not Found</h1>
        <p className="text-xl text-slate-600 mb-8">
          The service you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/">
          <Button className="bg-teal-500 hover:bg-teal-600">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
