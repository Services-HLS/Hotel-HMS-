


import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, RefreshCw, Download, Eye, FileText, FileDown, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GridRenderCellParams } from '@mui/x-data-grid';

// URLs
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzexlVpr_2umhzBdpoW4juzQo4rj2zB1pU3vlz6wqY78YQX3d2BFntfiV7dgLf6PvC/exec';
const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Customer {
  customerId: string;
  name: string;
  phone: string;
  email: string;
  idNumber: string;
  createdAt: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  customer_gst_no?: string;
  purpose_of_visit?: string;
  other_expenses?: number;
  expense_description?: string;
  source?: string; // 'database' or 'google_sheets'
}

/** ✅ Handles dd/mm/yyyy, yyyy-mm-dd, and ISO date formats */
function parseDateString(value: string): string {
  if (!value) return '';

  const isoParsed = new Date(value);
  if (!isNaN(isoParsed.getTime())) {
    return isoParsed.toLocaleDateString('en-GB');
  }

  const match = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/
  );
  if (match) {
    const [, dd, mm, yyyy, hh = '00', min = '00', ss = '00'] = match;
    const d = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      Number(ss)
    );
    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-GB');
  }

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, yyyy, mm, dd] = iso;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-GB');
  }

  return value;
}

const Customers = () => {
  const { toast } = useToast();
  const [currentUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  });
  
  const spreadsheetId = currentUser?.spreadsheetId;
  const userSource = currentUser?.source;
  const userPlan = currentUser?.plan;
  const hotelId = currentUser?.hotelId;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // ✅ JSONP helper for Google Sheets
  const loadScript = (src: string) =>
    new Promise<any>((resolve, reject) => {
      const callbackName = 'cb_' + Date.now();
      (window as any)[callbackName] = (data: any) => {
        resolve(data);
        delete (window as any)[callbackName];
        const script = document.getElementById(callbackName);
        if (script && script.parentNode) script.parentNode.removeChild(script);
      };
      const script = document.createElement('script');
      script.src =
        src + (src.includes('?') ? '&' : '?') + 'callback=' + callbackName;
      script.id = callbackName;
      script.onerror = () => {
        reject(new Error('Failed to load script'));
        delete (window as any)[callbackName];
        if (script && script.parentNode) script.parentNode.removeChild(script);
      };
      document.body.appendChild(script);
    });

  // ✅ Fetch from Backend Database (Pro Plan)
  const fetchFromBackend = async (): Promise<Customer[]> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${NODE_BACKEND_URL}/customers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform backend data to match our interface
      const transformedCustomers = data.data.map((customer: any) => ({
        customerId: customer.id.toString(),
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        idNumber: customer.id_number || '',
        createdAt: parseDateString(customer.created_at),
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        customer_gst_no: customer.customer_gst_no || '',
        purpose_of_visit: customer.purpose_of_visit || '',
        other_expenses: customer.other_expenses || 0,
        expense_description: customer.expense_description || '',
        source: 'database'
      }));

      return transformedCustomers;
    } catch (error) {
      console.error('Error fetching from backend:', error);
      throw error;
    }
  };

  // ✅ Fetch from Google Sheets (Free Plan)
  const fetchFromGoogleSheets = async (): Promise<Customer[]> => {
    if (!spreadsheetId) return [];
    
    try {
      const custRes = await loadScript(
        `${APPS_SCRIPT_URL}?action=getCustomers&spreadsheetid=${encodeURIComponent(
          spreadsheetId
        )}`
      );

      if (Array.isArray(custRes.customers)) {
        const normalized = custRes.customers.map((c: any, i: number) => {
          const createdAt =
            c.createdAt ||
            c.CreatedAt ||
            c.created_at ||
            c['Created At'] ||
            '';

          return {
            customerId: c.customerId || c.id || `CUST-${i + 1}`,
            name: c.name || '',
            phone: c.phone ? String(c.phone) : '',
            email: c.email || '',
            idNumber: c.idNumber || '',
            createdAt: parseDateString(createdAt),
            source: 'google_sheets'
          } as Customer;
        });

        return normalized;
      }
      return [];
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      throw error;
    }
  };

  // ✅ Generate PDF for Single Customer
  const generateCustomerPDF = async (customer: Customer) => {
    try {
      setGeneratingPdf(true);
      
      if (userSource === 'database' || userPlan === 'pro') {
        // Generate PDF from backend
        const token = localStorage.getItem('authToken');
        const response = await fetch(
          `${NODE_BACKEND_URL}/customers/${customer.customerId}/pdf`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to generate PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Customer_${customer.name}_${customer.customerId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "PDF downloaded successfully"
        });
      } else {
        // For Google Sheets users, generate client-side PDF
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Add customer details to PDF
        doc.setFontSize(20);
        doc.text('Customer Details', 20, 20);
        
        doc.setFontSize(12);
        let y = 40;
        
        const details = [
          `Customer ID: ${customer.customerId}`,
          `Name: ${customer.name}`,
          `Phone: ${customer.phone}`,
          `Email: ${customer.email || 'N/A'}`,
          `ID Number: ${customer.idNumber || 'N/A'}`,
          `Joined Date: ${customer.createdAt || 'N/A'}`,
        ];
        
        details.forEach((detail) => {
          doc.text(detail, 20, y);
          y += 10;
        });
        
        // Add timestamp
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 180);
        
        doc.save(`Customer_${customer.name}_${customer.customerId}.pdf`);
        
        toast({
          title: "Success",
          description: "PDF generated successfully"
        });
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setGeneratingPdf(false);
      setPdfDialogOpen(false);
    }
  };

  // ✅ Generate PDF for All Customers (Database Users Only)
  const generateAllCustomersPDF = async () => {
    if (userSource !== 'database' && userPlan !== 'pro') {
      toast({
        title: "Feature unavailable",
        description: "Bulk PDF export is only available for Pro Plan users",
        variant: "destructive"
      });
      return;
    }

    try {
      setDownloadingAll(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${NODE_BACKEND_URL}/customers/export/pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `All_Customers_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "All customers PDF downloaded successfully"
      });
    } catch (error: any) {
      console.error('Error generating PDF for all customers:', error);
      
      // Fallback: Generate client-side PDF if backend fails
      if (filteredCustomers.length > 0) {
        const { jsPDF } = await import('jspdf');
        const { autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('All Customers Report', 14, 22);
        
        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
        
        // Prepare table data
        const tableData = filteredCustomers.map(customer => [
          customer.customerId,
          customer.name,
          customer.phone,
          customer.email || 'N/A',
          customer.idNumber || 'N/A',
          customer.createdAt,
          customer.address || 'N/A',
          customer.customer_gst_no || 'N/A'
        ]);
        
        // Create table
        autoTable(doc, {
          head: [['Customer ID', 'Name', 'Phone', 'Email', 'ID Number', 'Joined Date', 'Address', 'GST No']],
          body: tableData,
          startY: 40,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        
        doc.save(`All_Customers_${new Date().toISOString().split('T')[0]}.pdf`);
        
        toast({
          title: "Success",
          description: "Generated PDF locally with available data"
        });
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  // ✅ Export to Excel (Database Users Only)
  const exportToExcel = async () => {
    if (userSource !== 'database' && userPlan !== 'pro') {
      toast({
        title: "Feature unavailable",
        description: "Excel export is only available for Pro Plan users",
        variant: "destructive"
      });
      return;
    }

    try {
      setDownloadingAll(true);
      
      // Try backend export first
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${NODE_BACKEND_URL}/customers/export/excel`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Customers_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Excel file downloaded successfully"
        });
      } else {
        // Fallback: Generate CSV if backend export not available
        generateCSV();
      }
    } catch (error: any) {
      console.error('Error exporting to Excel:', error);
      // Fallback to CSV
      generateCSV();
    } finally {
      setDownloadingAll(false);
    }
  };

  // ✅ Generate CSV as fallback
  const generateCSV = () => {
    if (filteredCustomers.length === 0) {
      toast({
        title: "No data",
        description: "No customers to export",
        variant: "destructive"
      });
      return;
    }

    try {
      const headers = [
        'Customer ID',
        'Name',
        'Phone',
        'Email',
        'ID Number',
        'Joined Date',
        'Address',
        'City',
        'State',
        'Pincode',
        'GST No',
        'Purpose of Visit',
        'Other Expenses',
        'Expense Description'
      ];

      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const customer of filteredCustomers) {
        const row = [
          customer.customerId,
          `"${customer.name.replace(/"/g, '""')}"`,
          customer.phone,
          `"${customer.email || ''}"`,
          `"${customer.idNumber || ''}"`,
          customer.createdAt,
          `"${customer.address || ''}"`,
          `"${customer.city || ''}"`,
          `"${customer.state || ''}"`,
          customer.pincode || '',
          `"${customer.customer_gst_no || ''}"`,
          `"${customer.purpose_of_visit || ''}"`,
          customer.other_expenses || 0,
          `"${customer.expense_description || ''}"`
        ];
        csvRows.push(row.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Customers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "CSV file downloaded successfully"
      });
    } catch (error: any) {
      console.error('Error generating CSV:', error);
      toast({
        title: "Error",
        description: `Failed to generate CSV: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // ✅ View Customer Details
  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPdfDialogOpen(true);
  };

  // ✅ Main fetch function
  const fetchCustomers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log("🔄 Fetching customers for user:", {
        source: userSource,
        plan: userPlan
      });

      let customersData: Customer[] = [];

      if (userSource === 'database' || userPlan === 'pro') {
        console.log("📊 Fetching from backend database...");
        customersData = await fetchFromBackend();
      } else {
        console.log("📊 Fetching from Google Sheets...");
        customersData = await fetchFromGoogleSheets();
      }

      setCustomers(customersData);
      
      if (isRefresh) {
        toast({
          title: "Success",
          description: `Customers refreshed successfully (${customersData.length} customers)`
        });
      }

    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: `Failed to load customers: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    await fetchCustomers(true);
  };

  useEffect(() => {
    fetchCustomers();
  }, [userSource, userPlan]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(term) ||
        (c.phone || '').includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.idNumber || '').toLowerCase().includes(term) ||
        (c.address || '').toLowerCase().includes(term) ||
        (c.customer_gst_no || '').toLowerCase().includes(term) ||
        (c.purpose_of_visit || '').toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  // Show user plan info
  const userPlanInfo = userPlan === 'pro' 
    ? { label: 'Pro Plan', color: 'text-green-600', bgColor: 'bg-green-100' }
    : { label: 'Free Plan', color: 'text-blue-600', bgColor: 'bg-blue-100' };

  // ✅ Replace your columns definition with this corrected version
  const columns: GridColDef[] = [
    { 
      field: 'customerId', 
      headerName: 'Customer ID', 
      width: 180,
      renderCell: (params) => {
        const customer = params.row as Customer;
        return (
          <div className="flex items-center gap-2">
            <span>{customer.customerId}</span>
          </div>
        );
      },
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 200 
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      width: 150 
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 220 
    },
    { 
      field: 'idNumber', 
      headerName: 'ID Number', 
      width: 160 
    },
    ...(userSource === 'database' || userPlan === 'pro' ? [
      {
        field: 'address',
        headerName: 'Address',
        width: 250,
        valueGetter: (_, row) => {
          const customer = row as Customer;
          if (!customer) return '';
          const parts = [];
          if (customer.address) parts.push(customer.address);
          if (customer.city) parts.push(customer.city);
          if (customer.state) parts.push(customer.state);
          if (customer.pincode) parts.push(customer.pincode);
          return parts.join(', ');
        },
      },
    ] : []),
    {
      field: 'createdAt',
      headerName: 'Joined On',
      width: 180,
      renderCell: (params) => {
        const customer = params.row as Customer;
        const dateValue = customer.createdAt;
        return (
          <div className="w-full h-full flex items-center justify-start">
            {dateValue || '—'}
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const customer = params.row as Customer;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => viewCustomerDetails(customer)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateCustomerPDF(customer)}
              disabled={generatingPdf}
              title="Download PDF"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Customer Management</h1>
             
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Bulk Export Dropdown (Database Users Only) */}
            {(userSource === 'database' || userPlan === 'pro') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={downloadingAll || customers.length === 0}
                    className="flex items-center gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    Export All
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={generateAllCustomersPDF}
                    disabled={downloadingAll}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download as PDF ({customers.length} customers)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={exportToExcel}
                    disabled={downloadingAll}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Download as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing || downloadingAll}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search customers by name, phone, email, ID, address, GST, or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              {/* <div className="text-sm text-muted-foreground">
                Showing {filteredCustomers.length} of {customers.length} customers
                {searchTerm && ` matching "${searchTerm}"`}
                {(userSource === 'database' || userPlan === 'pro') && (
                  <div className="text-xs text-green-600 mt-1">
                    Bulk export available for all {customers.length} customers
                  </div>
                )}
              </div> */}
            </div>
          </CardHeader>

          <CardContent className="relative min-h-[600px] flex items-center justify-center">
            {(loading || refreshing || downloadingAll) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-10">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground font-medium text-base">
                  {loading ? 'Loading customer data...' : 
                   refreshing ? 'Refreshing customers...' : 
                   'Downloading export...'}
                </p>
              </div>
            )}

            <AnimatePresence>
              {!loading && !refreshing && !downloadingAll && (
                <motion.div
                  key="data-grid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ height: 600, width: '100%' }}
                >
                  {filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <p className="text-lg mb-2">No customers found</p>
                      <p className="text-sm">
                        {searchTerm ? 'Try adjusting your search terms' : 'No customers available in the system'}
                      </p>
                    </div>
                  ) : (
                    <DataGrid
                      rows={filteredCustomers}
                      columns={columns}
                      getRowId={(row) => `${row.source}-${row.customerId}`}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 10 },
                        },
                      }}
                      pageSizeOptions={[5, 10, 25]}
                      disableRowSelectionOnClick
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details & PDF Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer ID:</span>
                      <span className="font-medium">{selectedCustomer.customerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedCustomer.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID Number:</span>
                      <span className="font-medium">{selectedCustomer.idNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined Date:</span>
                      <span className="font-medium">{selectedCustomer.createdAt}</span>
                    </div>
                  </div>
                </div>

                {(userSource === 'database' || userPlan === 'pro') && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Address & Additional Details</h3>
                    <div className="space-y-3">
                      {selectedCustomer.address && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Address:</span>
                          <span className="font-medium text-right">{selectedCustomer.address}</span>
                        </div>
                      )}
                      {selectedCustomer.city && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">City:</span>
                          <span className="font-medium">{selectedCustomer.city}</span>
                        </div>
                      )}
                      {selectedCustomer.state && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">State:</span>
                          <span className="font-medium">{selectedCustomer.state}</span>
                        </div>
                      )}
                      {selectedCustomer.pincode && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pincode:</span>
                          <span className="font-medium">{selectedCustomer.pincode}</span>
                        </div>
                      )}
                      {selectedCustomer.customer_gst_no && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GST No:</span>
                          <span className="font-medium">{selectedCustomer.customer_gst_no}</span>
                        </div>
                      )}
                      {selectedCustomer.purpose_of_visit && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Purpose of Visit:</span>
                          <span className="font-medium">{selectedCustomer.purpose_of_visit}</span>
                        </div>
                      )}
                      {selectedCustomer.other_expenses && selectedCustomer.other_expenses > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Other Expenses:</span>
                          <span className="font-medium">₹{selectedCustomer.other_expenses}</span>
                        </div>
                      )}
                      {selectedCustomer.expense_description && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expense Description:</span>
                          <span className="font-medium">{selectedCustomer.expense_description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPdfDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => generateCustomerPDF(selectedCustomer)}
                  disabled={generatingPdf}
                  className="flex items-center gap-2"
                >
                  {generatingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {generatingPdf ? 'Generating PDF...' : 'Download PDF'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Customers;