import { useState, useEffect, useMemo } from 'react';
import { Home, BarChart2, Users, Settings, Sun, Moon, Search, ChevronsUpDown, ChevronUp, ChevronDown, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- MOCK DATA (can be moved to a separate file) ---
const initialMetrics = [
    { id: 1, title: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', Icon: DollarSign },
    { id: 2, title: 'Active Users', value: '+2350', change: '+180.1% from last month', Icon: Users },
    { id: 3, title: 'Conversions', value: '+12,234', change: '+19% from last month', Icon: TrendingUp },
    { id: 4, title: 'Growth Rate', value: '+57.3%', change: '+2.1% from last month', Icon: Activity }
];
const revenueData = [ { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 5000 }, { name: 'Apr', revenue: 4500 }, { name: 'May', revenue: 6000 }, { name: 'Jun', revenue: 5500 }, { name: 'Jul', revenue: 7000 }, { name: 'Aug', revenue: 6500 }, { name: 'Sep', revenue: 7500 }, { name: 'Oct', revenue: 8000 }, { name: 'Nov', revenue: 9000 }, { name: 'Dec', revenue: 8500 }, ];
const userDemographicsData = [ { name: '18-24', value: 400 }, { name: '25-34', value: 300 }, { name: '35-44', value: 300 }, { name: '45+', value: 200 }, ];
const initialTableData = [ { id: 1, campaign: 'Summer Sale', channel: 'Google Ads', conversions: 1200, cost: 2500, status: 'Active' }, { id: 2, campaign: 'Newsletter Promo', channel: 'Email', conversions: 850, cost: 500, status: 'Active' }, { id: 3, campaign: 'Q3 Social Push', channel: 'Facebook', conversions: 2100, cost: 4000, status: 'Paused' }, { id: 4, campaign: 'Black Friday', channel: 'Instagram', conversions: 5500, cost: 8000, status: 'Completed' }, { id: 5, campaign: 'New Year Offer', channel: 'Google Ads', conversions: 3100, cost: 4200, status: 'Active' }, { id: 6, campaign: 'Spring Refresh', channel: 'Facebook', conversions: 1500, cost: 2800, status: 'Active' }, { id: 7, campaign: 'Influencer Collab', channel: 'YouTube', conversions: 4200, cost: 12000, status: 'Completed' }, { id: 8, campaign: 'Content Marketing', channel: 'Blog', conversions: 600, cost: 1200, status: 'Paused' }, ];

// --- REUSABLE UI COMPONENTS ---
const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const MetricCard = ({ metric }) => (
    <Card>
        <div className="p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.title}</h3>
                <metric.Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.change}</p>
        </div>
    </Card>
);

const LoadingSkeleton = ({ className }) => <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}></div>;

const MetricCardSkeleton = () => (
    <Card><div className="p-6"><LoadingSkeleton className="h-4 w-2/3 mb-4" /><LoadingSkeleton className="h-8 w-1/2 mb-2" /><LoadingSkeleton className="h-3 w-3/4" /></div></Card>
);

const ChartCard = ({ title, children, className }) => (
    <Card className={className}><div className="p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3><div className="h-72">{children}</div></div></Card>
);

const DataTable = ({ data, columns }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'conversions', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('');
    const ROWS_PER_PAGE = 5;

    const filteredData = useMemo(() => data.filter(item => item.campaign.toLowerCase().includes(filter.toLowerCase())), [data, filter]);
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [filteredData, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [sortedData, currentPage]);
    
    const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ChevronsUpDown className="h-4 w-4 ml-2 opacity-30" />;
        if (sortConfig.direction === 'ascending') return <ChevronUp className="h-4 w-4 ml-2" />;
        return <ChevronDown className="h-4 w-4 ml-2" />;
    };

    const StatusPill = ({ status }) => {
        const statusClasses = { 'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', 'Paused': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', 'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
        return <span className={`px-2 py-0.5 text-xs font-medium rounded-full inline-block ${statusClasses[status]}`}>{status}</span>
    };

    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Performance</h3>
                     <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Filter campaigns..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"/></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>{columns.map(col => <th key={col.key} scope="col" className="px-6 py-3"><div className="flex items-center cursor-pointer" onClick={() => requestSort(col.key)}>{col.label}{getSortIcon(col.key)}</div></th>)}</tr>
                        </thead>
                        <tbody>{paginatedData.map(item => <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.campaign}</td><td className="px-6 py-4">{item.channel}</td><td className="px-6 py-4">{item.conversions.toLocaleString()}</td><td className="px-6 py-4">${item.cost.toLocaleString()}</td><td className="px-6 py-4"><StatusPill status={item.status} /></td></tr>)}</tbody>
                    </table>
                </div>
                 <div className="flex justify-between items-center pt-4">
                    <span className="text-sm text-gray-700 dark:text-gray-400">Showing {paginatedData.length} of {sortedData.length} results</span>
                    <div className="inline-flex items-center -space-x-px"><button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700">Prev</button><span className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">{currentPage} / {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700">Next</button></div>
                </div>
            </div>
        </Card>
    )
};

// --- MAIN APP COMPONENT ---
function App() {
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);
    
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const tableColumns = [ { key: 'campaign', label: 'Campaign' }, { key: 'channel', label: 'Channel' }, { key: 'conversions', label: 'Conversions' }, { key: 'cost', label: 'Cost' }, { key: 'status', label: 'Status' } ];
    const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700"><h1 className="text-xl font-bold text-gray-800 dark:text-white">ADmyBRAND</h1></div>
                <nav className="flex-1 px-4 py-4 space-y-2"><a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"><Home className="mr-3 h-5 w-5" /> Dashboard</a><a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><BarChart2 className="mr-3 h-5 w-5" /> Analytics</a><a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Users className="mr-3 h-5 w-5" /> Audience</a><a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Settings className="mr-3 h-5 w-5" /> Settings</a></nav>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                 <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
                     <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Dashboard Overview</h2>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                            {/* FIX: Directly use Sun or Moon component instead of the undefined Icon component */}
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <img className="h-8 w-8 rounded-full object-cover" src="https://i.pravatar.cc/40?img=4" alt="User avatar" />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">{loading ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />) : initialMetrics.map(metric => <MetricCard key={metric.id} metric={metric} />)}</div>
                    <div className="grid gap-6 mb-6 lg:grid-cols-5">
                        <ChartCard title="Revenue Overview" className="lg:col-span-3">
                            {loading ? <LoadingSkeleton className="h-full w-full"/> : <ResponsiveContainer width="100%" height="100%"><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.3)" /><XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}K`} /><Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#4b5563' : '#e5e7eb' }}/><Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer>}
                        </ChartCard>
                        <ChartCard title="User Demographics" className="lg:col-span-2">
                            {loading ? <LoadingSkeleton className="h-full w-full"/> : <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={userDemographicsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>{userDemographicsData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#4b5563' : '#e5e7eb' }}/><Legend iconSize={10} /></PieChart></ResponsiveContainer>}
                        </ChartCard>
                    </div>
                    <div>{loading ? <Card><div className="p-6"><LoadingSkeleton className="h-96 w-full"/></div></Card> : <DataTable data={initialTableData} columns={tableColumns} />}</div>
                </main>
            </div>
        </div>
    );
}

export default App;
