import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Dashboard Tabs
import CashFlowTab from '@/components/dashboard/CashFlowTab';
import InventoryTab from '@/components/dashboard/InventoryTab';
import PerformanceTab from '@/components/dashboard/PerformanceTab';
import ChannelTab from '@/components/dashboard/ChannelTab';
import InventoryAdvisorTab from '@/components/dashboard/InventoryAdvisorTab';

import { 
  LayoutDashboard, 
  BarChart3,
  LineChart, 
  PieChart,
  ShoppingBag, 
  Settings, 
  LogOut, 
  ChevronDown, 
  User, 
  Bell, 
  Menu,
  X
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [notificationCount] = useState(3);
  const [activeTab, setActiveTab] = useState('cash-flow');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    toast.success('You have been logged out');
    navigate('/');
  };
  
  const handleShowNotifications = () => {
    toast.info('You have 3 new notifications', {
      description: 'Payment received, inventory alert, and growth opportunity'
    });
  };

  const navItems = [
    { icon: LineChart, label: 'Cash Flow', id: 'cash-flow' },
    { icon: ShoppingBag, label: 'Inventory', id: 'inventory' },
    { icon: BarChart3, label: 'Performance', id: 'performance' },
    { icon: PieChart, label: 'Channel', id: 'channel' },
    { icon: LayoutDashboard, label: 'Inventory Advisor', id: 'inventory-advisor' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r border-border p-4">
        <Link to="/" className="flex items-center gap-2 px-2 py-4">
          <img 
            src="https://storage.googleapis.com/fenado-ai-farm-public/generated/f822c49b-0faf-4632-b39c-b7c53da01628.webp" 
            alt="VyaparFlow Logo" 
            className="h-8 w-8"
          />
          <span className="text-xl font-semibold text-foreground">VyaparFlow</span>
        </Link>
        
        <Separator className="my-4" />
        
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === item.id ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
        
        <Separator className="my-4" />
        
        <Button 
          variant="outline" 
          className="justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            
            <Link to="/" className="md:hidden flex items-center">
              <img 
                src="https://storage.googleapis.com/fenado-ai-farm-public/generated/f822c49b-0faf-4632-b39c-b7c53da01628.webp" 
                alt="VyaparFlow Logo" 
                className="h-8 w-8 mr-2"
              />
              <span className="text-lg font-semibold">VyaparFlow</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShowNotifications}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-primary-foreground text-xs flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Priya S.</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info('Profile view not implemented in prototype')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Settings view not implemented in prototype')}>Account Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-b border-border">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === item.id ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        )}

        {/* Dashboard content */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pb-10"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsContent value="cash-flow" className="m-0">
                <CashFlowTab />
              </TabsContent>
              
              <TabsContent value="inventory" className="m-0">
                <InventoryTab />
              </TabsContent>
              
              <TabsContent value="performance" className="m-0">
                <PerformanceTab />
              </TabsContent>
              
              <TabsContent value="channel" className="m-0">
                <ChannelTab />
              </TabsContent>
              
              <TabsContent value="inventory-advisor" className="m-0">
                <InventoryAdvisorTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </ScrollArea>
      </div>
    </div>
  );
}