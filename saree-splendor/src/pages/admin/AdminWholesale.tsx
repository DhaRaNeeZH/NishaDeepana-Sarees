import React from 'react';
import { Search, Download, Mail, Phone, Calendar, DollarSign, Package, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

// Mock wholesale inquiries data
const wholesaleInquiries = [
    {
        id: 'WS001',
        companyName: 'Elegant Fashions Pvt Ltd',
        contactPerson: 'Rajesh Kumar',
        email: 'rajesh@elegantfashions.com',
        phone: '+91 98765 43210',
        orderVolume: 150,
        estimatedValue: 450000,
        category: 'Kanjeevaram',
        status: 'pending',
        inquiryDate: '2024-02-10',
        notes: 'Interested in bulk order for wedding season'
    },
    {
        id: 'WS002',
        companyName: 'Saree Palace Boutique',
        contactPerson: 'Priya Sharma',
        email: 'priya@sareepalace.com',
        phone: '+91 98654 32109',
        orderVolume: 75,
        estimatedValue: 225000,
        category: 'Banarasi',
        status: 'approved',
        inquiryDate: '2024-02-08',
        notes: 'Regular customer - previous orders completed successfully'
    },
    {
        id: 'WS003',
        companyName: 'Traditional Wear Exports',
        contactPerson: 'Amit Patel',
        email: 'amit@traditionalwear.com',
        phone: '+91 98543 21098',
        orderVolume: 200,
        estimatedValue: 800000,
        category: 'Mixed',
        status: 'in-negotiation',
        inquiryDate: '2024-02-12',
        notes: 'Looking for export quality pieces'
    },
    {
        id: 'WS004',
        companyName: 'Shree Collections',
        contactPerson: 'Meera Reddy',
        email: 'meera@shreecollections.com',
        phone: '+91 98432 10987',
        orderVolume: 50,
        estimatedValue: 150000,
        category: 'Patola',
        status: 'rejected',
        inquiryDate: '2024-02-05',
        notes: 'Unable to meet minimum order quantity requirements'
    },
    {
        id: 'WS005',
        companyName: 'Ethnic Emporium',
        contactPerson: 'Sunita Joshi',
        email: 'sunita@ethnicemporium.com',
        phone: '+91 98321 09876',
        orderVolume: 100,
        estimatedValue: 350000,
        category: 'Chanderi',
        status: 'processing',
        inquiryDate: '2024-02-15',
        notes: 'First order - promotional discount applied'
    },
];

export const AdminWholesale: React.FC = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<string>('all');

    let filteredInquiries = wholesaleInquiries.filter(inquiry =>
        inquiry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (statusFilter !== 'all') {
        filteredInquiries = filteredInquiries.filter(i => i.status === statusFilter);
    }

    const statusCounts = {
        all: wholesaleInquiries.length,
        pending: wholesaleInquiries.filter(i => i.status === 'pending').length,
        approved: wholesaleInquiries.filter(i => i.status === 'approved').length,
        'in-negotiation': wholesaleInquiries.filter(i => i.status === 'in-negotiation').length,
        processing: wholesaleInquiries.filter(i => i.status === 'processing').length,
        rejected: wholesaleInquiries.filter(i => i.status === 'rejected').length,
    };

    const totalInquiryValue = wholesaleInquiries.reduce((sum, i) => sum + i.estimatedValue, 0);
    const totalVolume = wholesaleInquiries.reduce((sum, i) => sum + i.orderVolume, 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-300';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'in-negotiation': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'pending': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="h-4 w-4" />;
            case 'rejected': return <XCircle className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-beige-light">
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon via-maroon-light to-maroon-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Wholesale Management</h1>
                            <p className="text-beige">{wholesaleInquiries.length} inquiries • {filteredInquiries.length} showing</p>
                        </div>
                        <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </Button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-white/10 border-white/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-8 w-8 text-gold" />
                                    <div>
                                        <p className="text-beige text-sm">Total Value</p>
                                        <p className="text-2xl font-bold">₹{(totalInquiryValue / 100000).toFixed(1)}L</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 border-white/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Package className="h-8 w-8 text-gold" />
                                    <div>
                                        <p className="text-beige text-sm">Total Volume</p>
                                        <p className="text-2xl font-bold">{totalVolume} Units</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 border-white/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-gold" />
                                    <div>
                                        <p className="text-beige text-sm">Pending Actions</p>
                                        <p className="text-2xl font-bold">{statusCounts.pending + statusCounts['in-negotiation']}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <Card
                            key={status}
                            className="hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => setStatusFilter(status)}
                        >
                            <CardContent className="pt-6 text-center">
                                <p className="text-2xl font-bold text-maroon mb-1">{count}</p>
                                <p className="text-xs text-gray-600 capitalize">{status.replace('-', ' ')}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card className="mb-6 border-maroon/20">
                    <CardHeader className="bg-gradient-to-r from-maroon/5 to-gold/5">
                        <CardTitle className="text-maroon">Filters & Search</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="Search by ID, company name, or contact person..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-12 border-maroon/30 focus:border-maroon"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {Object.keys(statusCounts).map(status => (
                                    <Button
                                        key={status}
                                        variant={statusFilter === status ? 'default' : 'outline'}
                                        onClick={() => setStatusFilter(status)}
                                        size="sm"
                                        className={statusFilter === status ? 'bg-maroon hover:bg-maroon-dark' : 'border-maroon/30 text-maroon hover:bg-maroon/10'}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Inquiries Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredInquiries.map((inquiry) => (
                        <Card key={inquiry.id} className="border-t-4 border-t-maroon hover:shadow-xl transition-all">
                            <CardHeader className="bg-gradient-to-r from-maroon/5 to-transparent">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg text-maroon mb-1">{inquiry.companyName}</CardTitle>
                                        <p className="text-sm text-gray-600">{inquiry.id}</p>
                                    </div>
                                    <Badge className={`border ${getStatusColor(inquiry.status)} flex items-center gap-1`}>
                                        {getStatusIcon(inquiry.status)}
                                        {inquiry.status.toUpperCase().replace('-', ' ')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-maroon" />
                                        <div>
                                            <p className="font-semibold">{inquiry.contactPerson}</p>
                                            <p className="text-xs text-gray-600">{inquiry.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-maroon" />
                                        <p className="text-gray-700">{inquiry.phone}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-maroon">{inquiry.orderVolume}</p>
                                        <p className="text-xs text-gray-600">Units</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gold-dark">₹{(inquiry.estimatedValue / 1000).toFixed(0)}K</p>
                                        <p className="text-xs text-gray-600">Value</p>
                                    </div>
                                    <div className="text-center">
                                        <Badge variant="outline" className="border-maroon/30 text-maroon">
                                            {inquiry.category}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 pt-3 border-t">
                                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-600">Inquiry Date: {new Date(inquiry.inquiryDate).toLocaleDateString()}</p>
                                        <p className="text-sm text-gray-700 mt-1">{inquiry.notes}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3">
                                    <Button size="sm" className="flex-1 bg-maroon hover:bg-maroon-dark">
                                        View Details
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 border-maroon text-maroon hover:bg-maroon/10">
                                        Contact
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredInquiries.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-16">
                            <p className="text-gray-500 text-lg">No wholesale inquiries found matching your criteria.</p>
                            <Button
                                className="mt-4 bg-maroon hover:bg-maroon-dark"
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                }}
                            >
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};
