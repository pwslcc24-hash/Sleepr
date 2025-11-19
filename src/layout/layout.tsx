import { Outlet, Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Moon, Home, Plus, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { sleeprApi } from "@/api/mockApi";

export default function Layout() {
  const location = useLocation();
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => sleeprApi.auth.me(),
  });

  const handleLogout = () => {
    sleeprApi.auth.logout();
  };

  const navItems = [
    { name: "Feed", url: createPageUrl("Feed"), icon: Home },
    { name: "Add Sleep", url: createPageUrl("AddSleep"), icon: Plus },
    { name: "Profile", url: createPageUrl("Profile"), icon: User },
  ];

  const isActive = (url: string) => location.pathname === url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Feed")} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Sleepr
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.name} to={item.url}>
                  <Button
                    variant={isActive(item.url) ? "default" : "ghost"}
                    className={
                      isActive(item.url)
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "hover:bg-slate-100"
                    }
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              ))}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="md:hidden border-t border-slate-200">
          <div className="flex justify-around py-2 px-4">
            {navItems.map((item) => (
              <Link key={item.name} to={item.url} className="flex-1">
                <Button
                  variant="ghost"
                  className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${
                    isActive(item.url) ? "text-indigo-600" : "text-slate-600"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            💡 <strong>Developer Note:</strong> Garmin Health API integration placeholder is ready.
            Connect your Garmin device from your Profile page (test data generator available).
          </p>
          {currentUser && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Logged in as {currentUser.full_name}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
