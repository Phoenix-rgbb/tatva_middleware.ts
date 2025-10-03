import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, TriangleAlert as AlertTriangle, Search, CreditCard as Edit, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    lowStockThreshold: '10',
    description: '',
  });

  useEffect(() => {
    loadProducts();
    const unsubscribe = db.subscribe(() => loadProducts());
    return unsubscribe;
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter]);

  const loadProducts = () => {
    const allProducts = db.getProducts();
    setProducts(allProducts);

    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));
    setCategories(uniqueCategories);
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.sellingPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingProduct) {
        db.updateProduct(editingProduct.id, {
          name: formData.name,
          category: formData.category,
          sku: formData.sku,
          costPrice: parseFloat(formData.costPrice) || 0,
          sellingPrice: parseFloat(formData.sellingPrice),
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
          description: formData.description,
        });
        toast.success('Product updated successfully');
      } else {
        db.addProduct({
          name: formData.name,
          category: formData.category,
          sku: formData.sku || `SKU-${Date.now()}`,
          costPrice: parseFloat(formData.costPrice) || 0,
          sellingPrice: parseFloat(formData.sellingPrice),
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
          description: formData.description,
        });
        toast.success('Product added successfully');
      }

      resetForm();
      setIsAddDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      sku: '',
      costPrice: '',
      sellingPrice: '',
      stockQuantity: '',
      lowStockThreshold: '10',
      description: '',
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      sku: product.sku,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stockQuantity: product.stockQuantity.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      description: product.description || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      db.deleteProduct(id);
      toast.success('Product deleted successfully');
    }
  };

  const lowStockProducts = products.filter(p => p.stockQuantity <= p.lowStockThreshold);
  const totalValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.stockQuantity), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.costPrice * p.stockQuantity), 0);
  const potentialProfit = totalValue - totalCost;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-600 mt-1">Manage your product catalog and stock levels</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProduct(null); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product details' : 'Add a new product to your inventory'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Enter category"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price (₹)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="0.00"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  placeholder="10"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingProduct ? 'Update' : 'Add'} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{lowStockProducts.length}</p>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">₹{totalValue.toLocaleString()}</p>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Potential Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">₹{potentialProfit.toLocaleString()}</p>
              <TrendingUp className="w-8 h-8 text-violet-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-900">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map(product => (
                <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">Stock: {product.stockQuantity} units</p>
                  </div>
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    Low Stock
                  </Badge>
                </div>
              ))}
              {lowStockProducts.length > 3 && (
                <p className="text-sm text-amber-700 text-center mt-2">
                  +{lowStockProducts.length - 3} more items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Catalog</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                    No products found. Add your first product to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map(product => {
                  const margin = product.sellingPrice > 0
                    ? ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1)
                    : 0;
                  const isLowStock = product.stockQuantity <= product.lowStockThreshold;

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-slate-600">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={isLowStock ? 'text-amber-600 font-semibold' : ''}>
                          {product.stockQuantity}
                        </span>
                      </TableCell>
                      <TableCell>₹{product.costPrice.toFixed(2)}</TableCell>
                      <TableCell>₹{product.sellingPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={Number(margin) > 20 ? 'text-emerald-600 font-semibold' : ''}>
                          {margin}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
