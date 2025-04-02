
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { PlusCircle, Database, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-slate-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-teal-400">
          Service Nexus Control
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "default" : "outline"} 
              className={`${
                location.pathname === "/" 
                  ? "bg-teal-500 text-white hover:bg-teal-600" 
                  : "bg-transparent text-teal-400 border-teal-400 hover:bg-teal-400/10"
              }`}
            >
              Dashboard
            </Button>
          </Link>
          <Link to="/index">
            <Button 
              variant={location.pathname === "/index" ? "default" : "outline"} 
              className={`${
                location.pathname === "/index" 
                  ? "bg-teal-500 text-white hover:bg-teal-600" 
                  : "bg-transparent text-teal-400 border-teal-400 hover:bg-teal-400/10"
              }`}
            >
              <Network className="h-4 w-4 mr-2" />
              Service Tester
            </Button>
          </Link>
          <Link to="/add-service">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
