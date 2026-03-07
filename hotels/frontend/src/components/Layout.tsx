

// components/Layout.tsx - MODIFIED VERSION
import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/lib/storage';
import { hasPermission, isAdmin } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Hotel,
  LayoutDashboard,
  Bed,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  HelpCircle,
  Receipt,
  Wallet,
  BarChart3,
  ChevronDown,
  ChevronRight,
  DollarSign,
  TrendingUp,
  IndianRupee,
  Home,
  Building2,
  CalendarDays,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/Logo';
import { useEffect } from 'react'; // Add useEffect
// ... keep other imports ...
import { Loader2 } from 'lucide-react'; // Add this import if not already there

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [incomeExpensesOpen, setIncomeExpensesOpen] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  // Add this near the top of your Layout component, after getting currentUser
  console.log('👤 Current User in Layout:', {
    name: currentUser?.name,
    role: currentUser?.role,
    source: currentUser?.source,
    hasToken: !!localStorage.getItem('authToken')
  });

  // Add this useEffect to monitor changes
  useEffect(() => {
    const checkUser = () => {
      const user = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');
      console.log('🔍 Layout - Checking storage:', {
        hasUser: !!user,
        hasToken: !!token,
        userData: user ? JSON.parse(user) : null
      });
    };

    checkUser();
  }, []);

  // ✅ ADD THIS STATE for hotel logo
  // const [hotelLogo, setHotelLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [hotelLogo, setHotelLogo] = useState<string | null>(() => {
    // Try to get logo from localStorage first (cached)
    try {
      const stored = localStorage.getItem('hotelLogo');
      return stored ? stored : null; // Don't parse, it's already a string
    } catch {
      return null;
    }
  });


  // Check if user is from Google Sheets (Basic plan)
  const isGoogleSheetsUser = currentUser?.source === 'google_sheets';



  useEffect(() => {
    // Listen for subscription expired events
    const handleSubscriptionExpired = (event: any) => {
      console.log('📢 Subscription expired event received in Layout');

      // Update user in state if needed
      if (event.detail?.user) {
        // You might want to update some state here
      }

      // Optionally show a toast or notification
      // toast({
      //   title: "Trial Expired",
      //   description: "Your trial has expired. Please reactivate your account.",
      //   variant: "destructive"
      // });
    };

    window.addEventListener('subscription:expired', handleSubscriptionExpired);

    return () => {
      window.removeEventListener('subscription:expired', handleSubscriptionExpired);
    };
  }, []);

  // Update the fetchHotelLogo function to handle 403 errors properly
  // In Layout.tsx - Update the fetchHotelLogo function
  // In Layout.tsx - Update the fetchHotelLogo function
  useEffect(() => {
    console.log('🔄 Checking if we need to fetch logo...');

    // Only fetch for database users
    if (currentUser?.source === 'database' && currentUser?.hotel_id) {
      console.log('✅ User is database user, checking logo...');

      // If we already have logo in localStorage, use it
      if (hotelLogo) {
        console.log('✅ Logo already cached, using from localStorage');
        return; // Don't fetch again!
      }

      console.log('🔄 No cached logo, fetching from server...');

      const fetchHotelLogo = async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) return;

          // Fetch hotel logo from backend
          const response = await fetch(`${API_URL}/hotels/${currentUser.hotel_id}/logo`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
            },
            cache: 'no-store'
          });

          // Handle 403 specifically - could be subscription expired
          if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            console.log('⚠️ Logo fetch returned 403:', errorData);

            // Check if this is subscription expired
            const errorMessage = errorData.message?.toLowerCase() || '';
            const errorCode = errorData.code?.toLowerCase() || '';

            const isSubscriptionExpired =
              errorCode.includes('subscription_expired') ||
              errorCode.includes('trial_expired') ||
              errorMessage.includes('subscription expired') ||
              errorMessage.includes('trial expired') ||
              errorData.status === 'suspended';

            if (isSubscriptionExpired) {
              console.log('⚠️ Subscription expired detected in logo fetch');

              // Update user in localStorage
              const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
              const updatedUser = {
                ...currentUserData,
                isTrialExpired: true,
                status: 'suspended',
                subscription_status: 'expired'
              };
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));

              // Dispatch event
              window.dispatchEvent(new CustomEvent('subscription:expired', {
                detail: { user: updatedUser }
              }));

              // DON'T redirect to login, just return
              return;
            }

            // For other 403 errors, don't redirect either
            console.log('⚠️ Other 403 error in logo fetch, skipping');
            return;
          }

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.logo_image) {
              console.log('✅ Logo fetched successfully, saving to cache');

              // Save to state
              setHotelLogo(result.data.logo_image);

              // Save to localStorage for future use
              localStorage.setItem('hotelLogo', result.data.logo_image);

              // Also update currentUser with logo
              const updatedUser = {
                ...currentUser,
                logo_image: result.data.logo_image
              };
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
          }
        } catch (error) {
          console.error('Error fetching hotel logo:', error);
          // Don't redirect on error
        }
      };

      fetchHotelLogo();
    }
  }, [currentUser, API_URL, hotelLogo]);
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('hotelLogo');
    localStorage.removeItem('currentHotel');
    localStorage.removeItem('selectedHotel');
    navigate('/login');
  };

  // Add this with your other useState declarations in Layout.tsx
  const [functionHallEnabled, setFunctionHallEnabled] = useState<boolean>(() => {
    // Get saved preference from localStorage
    const saved = localStorage.getItem('functionHallEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Add this useEffect to listen for toggle events
  useEffect(() => {
    const handleFunctionHallToggle = (event: CustomEvent) => {
      setFunctionHallEnabled(event.detail.enabled);
    };

    window.addEventListener('functionHallToggle' as any, handleFunctionHallToggle);

    return () => {
      window.removeEventListener('functionHallToggle' as any, handleFunctionHallToggle);
    };
  }, []);


  // ========== AUTO-LOGOUT ON INACTIVITY (30 MINS) ==========
  useEffect(() => {
    // 30 minutes in milliseconds
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('🕒 Inactivity timeout reached (30 mins). Logging out...');
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that count as activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Initialize timer
    resetTimer();

    // Add listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]); // navigate is stable, but adding it for completeness


  // Main navigation items (visible to all logged-in users with permissions)
  // const mainNavItems = [
  //   {
  //     path: '/roombooking',
  //     icon: Calendar,
  //     label: 'Book a Room',
  //     requires: 'create_booking'
  //   },

  //   {
  //     path: '/advance-bookings',
  //     icon: CalendarDays, // Import CalendarDays from lucide-react
  //     label: 'Advance Booking',
  //     requires: 'create_booking' // or create a new permission like 'manage_advance_bookings'
  //   },
  //    {
  //     path: '/bookings',
  //     icon: Calendar,
  //     label: 'My Bookings',
  //     requires: 'view_bookings'
  //   },
  //   {
  //     path: '/dashboard',
  //     icon: LayoutDashboard,
  //     label: 'Dashboard',
  //     requires: 'view_dashboard'
  //   },      
  //   {
  //     path: '/rooms',
  //     icon: Bed,
  //     label: 'Rooms',
  //     requires: 'view_rooms'
  //   },
  //   // ✅ ADD FUNCTION ROOMS HERE - Only for PRO/Database users
  //   // ...(currentUser?.source === 'database' ? [{
  //   //   path: '/function-rooms',
  //   //   icon: Building2, // Make sure to import Building2 from lucide-react
  //   //   label: 'Function hall',
  //   //   requires: 'view_rooms' // or create a new permission 'manage_function_rooms'
  //   // }] : []),
  //   // Replace the existing Function Rooms menu item with this conditional version
  //   // In Layout.tsx - Function Rooms menu item with disabled styling
  //   ...(currentUser?.source === 'database' ? [{
  //     path: '/function-rooms',
  //     icon: Building2,
  //     label: 'Function hall',
  //     requires: 'view_rooms',
  //     disabled: !functionHallEnabled // Add this property
  //   }] : []),

  //   {
  //     path: '/customers',
  //     icon: Users,
  //     label: 'Guest Details',
  //     requires: 'view_customers'
  //   },
  //   //   ...(currentUser?.source === 'database' ? [{
  //   //   path: '/wallet',
  //   //   icon: Wallet,
  //   //   label: 'My Wallet',
  //   //   requires: 'view_dashboard'
  //   // }] : []),
  //   // // ✅ ADD REFERRALS MENU ITEM - ONLY FOR DATABASE USERS
  //   // ...(currentUser?.source === 'database' ? [{
  //   //   path: '/referrals',
  //   //   icon: Users,
  //   //   label: 'Refer & Earn',
  //   //   requires: 'view_dashboard'
  //   // }] : [])
  // ];

  // Main navigation items (visible to all logged-in users with permissions)
  const mainNavItems = [
    {
      path: '/roombooking',
      icon: Calendar,
      label: 'Book a Room',
      requires: 'create_booking',
      highlight: true // Add this property for highlighting
    },
    {
      path: '/advance-bookings',
      icon: CalendarDays,
      label: 'Advance Bookings',
      requires: 'create_booking'
    },
    {
      path: '/bookings',
      icon: Calendar,
      label: 'My Bookings',
      requires: 'view_bookings'
    },   
  
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Overview',
      requires: 'view_dashboard'
    },
    {
      path: '/rooms',
      icon: Bed,
      label: 'Rooms',
      requires: 'view_rooms'
    },
    // Function Hall - Only for PRO/Database users
    ...(currentUser?.source === 'database' ? [{
      path: '/function-rooms',
      icon: Building2,
      label: 'Function Hall',
      requires: 'view_rooms',
      disabled: !functionHallEnabled
    }] : []),
    {
      path: '/customers',
      icon: Users,
      label: 'Guest Details',
      requires: 'view_customers'
    }
  ];

  // Income & Expenses sub-items
  const incomeExpensesItems = [
    {
      path: '/collections',
      icon: IndianRupee,
      label: 'Collections',
      requires: 'view_collections'
    },
    {
      path: '/expenses',
      icon: Receipt,
      label: 'Expenses',
      requires: 'view_expenses'
    },
    {
      path: '/salaries',
      icon: Wallet,
      label: 'Salaries',
      requires: 'view_salaries'
    },
    {
      path: '/housekeeping',
      icon: Home,
      label: 'Housekeeping',
      requires: 'manage_housekeeping'
    }
  ];

  // Other navigation items (visible based on permissions)
  const otherNavItems = [
    {
      path: '/contact',
      icon: HelpCircle,
      label: 'Contact Support',
      requires: 'view_dashboard' // All logged-in users can see contact
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
      requires: 'manage_hotel_settings'
    }
  ];

  // Reports item - ONLY FOR ADMIN (and only for Pro users, not Google Sheets)
  const reportsNavItem = {
    path: '/reports',
    icon: BarChart3,
    label: 'Reports',
    requires: 'view_reports'
  };

  // Function to check if item should be visible
  const shouldShowItem = (item: any) => {
    // Hide Reports for Google Sheets users entirely
    if (item.path === '/reports' && isGoogleSheetsUser) {
      return false;
    }

    // Special case for Reports - only show to admin (and only Pro users)
    if (item.path === '/reports') {
      return isAdmin();
    }

    // Admin can see everything (except if Google Sheets user)
    if (isAdmin() && !isGoogleSheetsUser) return true;

    // For non-admin users, check specific permission
    if (item.requires) {
      return hasPermission(item.requires as any);
    }

    return true;
  };

  // Filter navigation items based on user permissions
  const filterNavItems = (items: any[]) => {
    return items.filter(item => shouldShowItem(item));
  };

  const isActive = (path: string) => location.pathname === path;
  const isInIncomeExpenses = () =>
    location.pathname.startsWith('/collections') ||
    location.pathname.startsWith('/expenses') ||
    location.pathname.startsWith('/salaries') ||
    location.pathname.startsWith('/housekeeping');

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          {/* <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Logo 
              size="lg" 
              variant="icon"
              quality="high"
              className="shadow-xl ring-4 ring-primary/20 ring-offset-2 ring-offset-background transform hover:scale-105 transition-transform duration-200"
            />
          </div> */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center 
  ${logoLoading ? 'bg-gray-100' : ''} 
  overflow-hidden relative`}>

            {/* Loading state */}
            {logoLoading && (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            )}

            {/* Show hotel's custom logo if available */}
            {!logoLoading && hotelLogo && (
              <img
                src={hotelLogo}
                alt={currentUser?.name || "Hotel Logo"}
                className="w-full h-full object-contain p-1.5"
                onError={(e) => {
                  // If hotel logo fails to load, hide it
                  console.log("Hotel logo failed to load");
                  e.currentTarget.style.display = 'none';
                  // Default HMS logo will show behind
                }}
              />
            )}

            {/* Default HMS Logo - shows if no custom logo or custom logo fails */}
            {!logoLoading && (!hotelLogo || isGoogleSheetsUser) && (
              <Logo
                size="lg"
                variant="icon"
                quality="high"
                className="shadow-xl ring-4 ring-primary/20 ring-offset-2 ring-offset-background"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm truncate">{currentUser?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${isGoogleSheetsUser
                ? 'bg-blue-100 text-blue-800'
                : isAdmin()
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-green-100 text-green-800'
                }`}>
                {isGoogleSheetsUser ? 'Basic Plan' : isAdmin() ? 'Admin' : 'Staff'}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {currentUser?.hotelName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {/* Main Navigation - Always shown to authorized users */}
        {filterNavItems(mainNavItems).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const isDisabled = item.disabled || false; // Check if item is disabled
          const isHighlighted = item.highlight;

          return (
            <button
              key={item.path}
              onClick={() => !isDisabled && handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors 
        ${active && !isDisabled
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : isDisabled
                    ? 'text-gray-400 cursor-not-allowed opacity-60 hover:bg-transparent'
                    : isHighlighted && !active  // ADD THIS CONDITION
                      ? 'bg-amber-500 text-white hover:bg-amber-600 font-semibold border-2 border-amber-400 shadow-md'  // HIGHLIGHTED STYLE
                      : 'text-foreground hover:bg-secondary'
                }`}
              disabled={isDisabled}
              title={isDisabled ? 'Function Hall is disabled. Enable it from Dashboard Quick Actions' : ''}
            >
              <Icon className={`w-5 h-5 ${isDisabled ? 'text-gray-400' : ''} ${isHighlighted && !active && !isDisabled ? 'text-white' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {isDisabled && (
                <span className="ml-auto text-xs text-gray-400">(Off)</span>
              )}
              {active && !isDisabled && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"></div>
              )}
             
              
            </button>
          );
        })}
        {/* Income & Expenses Group - Hide for Google Sheets users */}
        {!isGoogleSheetsUser && (
          <div className="pt-2">
            <button
              onClick={() => setIncomeExpensesOpen(!incomeExpensesOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isInIncomeExpenses()
                ? 'bg-secondary text-foreground'
                : 'text-foreground hover:bg-secondary'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium">Income & Expenses</span>
              </div>
              {incomeExpensesOpen || isInIncomeExpenses() ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {(incomeExpensesOpen || isInIncomeExpenses()) && (
              <div className="ml-6 mt-1 space-y-1 border-l border-border pl-4">
                {/* Show only the items that user has permission for */}
                {incomeExpensesItems
                  .filter(item => {
                    // Admin can see all items
                    if (isAdmin()) return true;
                    // Staff can only see items they have permission for
                    if (item.requires) {
                      return hasPermission(item.requires as any);
                    }
                    return true;
                  })
                  .map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active
                          ? 'bg-primary/10 text-primary border-l-2 border-primary -ml-4 pl-5'
                          : 'text-foreground hover:bg-secondary'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                        {active && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </button>
                    );
                  })}

                {/* Show message if user has no permissions for any items */}
                {incomeExpensesItems.filter(item => {
                  if (isAdmin()) return false; // Don't show message for admin
                  if (item.requires) {
                    return hasPermission(item.requires as any);
                  }
                  return true;
                }).length === 0 && !isAdmin() && (
                    <div className="px-3 py-2 text-sm text-muted-foreground italic">
                      No access permissions granted
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* Reports - ONLY FOR ADMIN and ONLY FOR PRO USERS (not Google Sheets) */}
        {isAdmin() && !isGoogleSheetsUser && (
          <button
            onClick={() => handleNavigate('/reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/reports')
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground hover:bg-secondary'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Reports</span>
            {isActive('/reports') && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"></div>
            )}
          </button>
        )}

        {/* Other Navigation Items */}
        {filterNavItems(otherNavItems).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground hover:bg-secondary'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {active && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"></div>
              )}
            </button>
          );
        })}

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 mt-6"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {/* Logo and hotel info */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                {hotelLogo ? (
                  <img
                    src={hotelLogo}
                    alt={currentUser?.name || "Hotel Logo"}
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  <Logo
                    size="md"
                    variant="icon"
                    quality="high"
                    className="shadow-md ring-2 ring-primary/10"
                  />
                )}
              </div>
              <div>
                <h2 className="font-bold text-sm">{currentUser?.name}</h2>
                <p className="text-xs text-muted-foreground">{currentUser?.hotelName}</p>
              </div>
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  {/* NEW HEADER WITH CLOSE BUTTON */}
                  <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        {hotelLogo ? (
                          <img
                            src={hotelLogo}
                            alt={currentUser?.name || "Hotel Logo"}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <Logo
                            size="md"
                            variant="icon"
                            quality="high"
                            className="shadow-md ring-2 ring-primary/10"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-xs truncate">{currentUser?.name || 'User'}</h2>
                        <p className="text-xs text-muted-foreground truncate">{currentUser?.hotelName || 'Hotel'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-secondary flex-shrink-0"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </Button>
                  </div>

                  {/* NAVIGATION MENU - COPY ALL YOUR NAVIGATION ITEMS HERE */}
                  <div className="flex-1 overflow-y-auto">
                    <nav className="p-4 space-y-1">
                      {/* Copy all your navigation items from SidebarContent here */}
                      {/* Main Navigation */}

                      {filterNavItems(mainNavItems).map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const isDisabled = item.disabled || false;
                        const isHighlighted = item.highlight;  // ADD THIS

                        return (
                          <button
                            key={item.path}
                            onClick={() => !isDisabled && handleNavigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors 
        ${active && !isDisabled
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : isDisabled
                                  ? 'text-gray-400 cursor-not-allowed opacity-60 hover:bg-transparent'
                                  : isHighlighted && !active  // ADD THIS CONDITION
                                    ? 'bg-amber-500 text-white hover:bg-amber-600 font-semibold border-2 border-amber-400 shadow-md'  // HIGHLIGHTED STYLE
                                    : 'text-foreground hover:bg-secondary'
                              }`}
                            disabled={isDisabled}
                            title={isDisabled ? 'Function Hall is disabled. Enable it from Dashboard Quick Actions' : ''}
                          >
                            <Icon className={`w-5 h-5 ${isDisabled ? 'text-gray-400' : ''} ${isHighlighted && !active && !isDisabled ? 'text-white' : ''}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                            {isDisabled && (
                              <span className="ml-auto text-xs text-gray-400">(Off)</span>
                            )}
                            {active && !isDisabled && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"></div>
                            )}
                          
                          </button>
                        );
                      })}

                      {/* Income & Expenses Group */}
                      {!isGoogleSheetsUser && (
                        <div className="pt-2">
                          <button
                            onClick={() => setIncomeExpensesOpen(!incomeExpensesOpen)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isInIncomeExpenses()
                              ? 'bg-secondary text-foreground'
                              : 'text-foreground hover:bg-secondary'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                                <TrendingUp className="w-3 h-3 text-white" />
                              </div>
                              <span className="font-medium text-sm">Income & Expenses</span>
                            </div>
                            {incomeExpensesOpen || isInIncomeExpenses() ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          {(incomeExpensesOpen || isInIncomeExpenses()) && (
                            <div className="ml-6 mt-1 space-y-1 border-l border-border pl-4">
                              {incomeExpensesItems
                                .filter(item => {
                                  if (isAdmin()) return true;
                                  if (item.requires) {
                                    return hasPermission(item.requires as any);
                                  }
                                  return true;
                                })
                                .map((item) => {
                                  const Icon = item.icon;
                                  const active = isActive(item.path);

                                  return (
                                    <button
                                      key={item.path}
                                      onClick={() => handleNavigate(item.path)}
                                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active
                                        ? 'bg-primary/10 text-primary border-l-2 border-primary -ml-4 pl-5'
                                        : 'text-foreground hover:bg-secondary'
                                        }`}
                                    >
                                      <Icon className="w-4 h-4" />
                                      <span className="text-sm">{item.label}</span>
                                      {active && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-primary"></div>
                                      )}
                                    </button>
                                  );
                                })}

                              {incomeExpensesItems.filter(item => {
                                if (isAdmin()) return false;
                                if (item.requires) {
                                  return hasPermission(item.requires as any);
                                }
                                return true;
                              }).length === 0 && !isAdmin() && (
                                  <div className="px-3 py-2 text-sm text-muted-foreground italic">
                                    No access permissions granted
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reports */}
                      {isAdmin() && !isGoogleSheetsUser && (
                        <button
                          onClick={() => handleNavigate('/reports')}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/reports')
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-foreground hover:bg-secondary'
                            }`}
                        >
                          <BarChart3 className="w-5 h-5" />
                          <span className="font-medium text-sm">Reports</span>
                          {isActive('/reports') && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"></div>
                          )}
                        </button>
                      )}

                      {/* Other Navigation Items */}
                      {filterNavItems(otherNavItems).map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-foreground hover:bg-secondary'
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                            {active && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"></div>
                            )}
                          </button>
                        );
                      })}

                      {/* Logout Button */}
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full justify-start gap-3 mt-6"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm">Logout</span>
                      </Button>
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-card border-r border-border flex flex-col">
          <SidebarContent />
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''}`}>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;