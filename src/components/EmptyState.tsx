
import React from "react";
import { Database, ServerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "database" | "server";
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No services found",
  description = "Get started by adding your first remote service",
  icon = "database",
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        {icon === "database" ? (
          <Database className="h-12 w-12 text-slate-400" />
        ) : (
          <ServerOff className="h-12 w-12 text-slate-400" />
        )}
      </div>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-500 mb-6 max-w-md">{description}</p>
      <Link to="/add-service">
        <Button className="bg-teal-500 hover:bg-teal-600">Add New Service</Button>
      </Link>
    </div>
  );
};

export default EmptyState;
