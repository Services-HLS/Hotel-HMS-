// pages/UpgradeFlow.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Shield, Zap, CheckCircle } from 'lucide-react';

const UpgradeFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Optional: You can add a delay for better UX
    const timer = setTimeout(() => {
      handleRedirect();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleRedirect = () => {
    // Clear current session
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const hotelName = currentUser?.hotelName || 'your hotel';
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentHotel');
    localStorage.removeItem('authToken');
    
    toast({
      title: "Upgrade to Pro",
      description: `Register ${hotelName} for Pro features`,
    });
    
    // Navigate to login with state
    navigate('/login', { 
      state: { showRegisterModal: true },
      replace: true 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Upgrade to Pro
          </CardTitle>
          <CardDescription className="text-gray-600">
            Redirecting to Pro registration...
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Pro Features List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Pro Features You'll Get:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Advanced Financial Reports & Analytics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Unlimited Data Storage
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                WhatsApp Automation & Reminders
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Staff Management & Permissions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Priority Support & Updates
              </li>
            </ul>
          </div>

          {/* Loading Indicator */}
          <div className="flex flex-col items-center justify-center space-y-4 pt-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500 text-center">
              Preparing registration form...
            </p>
          </div>

          {/* Manual Redirect Button */}
          <Button
            onClick={handleRedirect}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
          >
            Continue to Registration
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <p className="text-xs text-gray-400 text-center">
            You'll be redirected automatically in a few seconds
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradeFlow;