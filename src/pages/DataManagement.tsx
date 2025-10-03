import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db } from '@/lib/database';
import { Download, Upload, Trash2, Database, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Save, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DataManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      setIsExporting(true);
      const data = db.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smb_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          if (!data.version || !data.transactions || !data.products) {
            throw new Error('Invalid backup file format');
          }

          db.importData(data);
          toast.success('Data imported successfully');
          window.location.reload();
        } catch (error) {
          toast.error('Invalid backup file');
        } finally {
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read file');
        setIsImporting(false);
      };

      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to import data');
      setIsImporting(false);
    }
  };

  const handleClearData = () => {
    try {
      db.clearAllData();
      toast.success('All data cleared successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to clear data');
    }
  };

  const getStorageInfo = () => {
    const transactions = db.getTransactions();
    const products = db.getProducts();
    const categories = db.getCategories();

    return {
      transactions: transactions.length,
      products: products.length,
      categories: categories.length,
      size: new Blob([JSON.stringify(db.exportData())]).size,
    };
  };

  const storageInfo = getStorageInfo();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Data Management</h1>
        <p className="text-slate-600 mt-1">Backup, restore, and manage your business data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{storageInfo.transactions}</p>
            <p className="text-xs text-slate-500 mt-1">Total records</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{storageInfo.products}</p>
            <p className="text-xs text-slate-500 mt-1">In inventory</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{storageInfo.categories}</p>
            <p className="text-xs text-slate-500 mt-1">Organized</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Storage Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">
              {(storageInfo.size / 1024).toFixed(1)} KB
            </p>
            <p className="text-xs text-slate-500 mt-1">Total data</p>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          Your data is stored locally in your browser. Regular backups are recommended to prevent data loss.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download a complete backup of your business data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Export includes:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  All transactions (income & expenses)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Complete product inventory
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Categories and preferences
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Metadata and timestamps
                </li>
              </ul>
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Import Data
            </CardTitle>
            <CardDescription>
              Restore data from a previous backup file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                Importing will replace all current data. Make sure to export a backup first.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="import-file" className="text-sm text-slate-600">
                Select backup file (.json)
              </Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
              />
            </div>
            {isImporting && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                <span className="ml-2 text-sm text-slate-600">Importing data...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect all your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900 text-sm">
                <strong>Warning:</strong> Clearing data is permanent and cannot be undone. All transactions, products, and settings will be deleted.
              </AlertDescription>
            </Alert>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full md:w-auto">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your transactions,
                    products, categories, and preferences. Make sure you have exported a backup before
                    proceeding.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offline Mode</CardTitle>
          <CardDescription>Your data works offline automatically</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">Always Available</h3>
              <p className="text-sm text-slate-600 mb-3">
                All your data is stored locally in your browser's storage. You can access and manage
                your business data even without an internet connection. Changes are saved instantly
                and persist across browser sessions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                  No Internet Required
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-700">
                  Instant Saves
                </Badge>
                <Badge variant="outline" className="border-violet-500 text-violet-700">
                  Persistent Storage
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
