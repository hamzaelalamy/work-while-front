import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchMarketOverview,
    fetchTopSectors,
    fetchTopSkills,
    fetchLocationTrends,
    fetchApplicationStatusDistribution,
    clearError,
} from '../redux/slices/analyticsSlice';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Users, Briefcase, Building, Activity, RefreshCw, AlertCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7c7c', '#a78bfa'];

const formatNumber = (n) => (n == null ? '0' : Number(n).toLocaleString());
const formatSalary = (v) => (v == null || Number.isNaN(v) ? '—' : `${Math.round(Number(v)).toLocaleString()} MAD`);

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: color }}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm mb-1">{title}</p>
                <h3 className="text-2xl font-bold">{formatNumber(value)}</h3>
            </div>
            <div className="p-2 rounded-full opacity-20" style={{ backgroundColor: color }}>
                <Icon className="w-6 h-6" style={{ color }} />
            </div>
        </div>
    </div>
);

const AnalyticsDashboardPage = () => {
    const dispatch = useDispatch();
    const {
        overview,
        sectors,
        skills,
        locations,
        applicationStatus,
        loading,
        error,
    } = useSelector((state) => state.analytics);

    const fetchAll = useCallback(() => {
        dispatch(clearError());
        dispatch(fetchMarketOverview());
        dispatch(fetchTopSectors());
        dispatch(fetchTopSkills());
        dispatch(fetchLocationTrends());
        dispatch(fetchApplicationStatusDistribution());
    }, [dispatch]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        document.title = 'Analytics | WorkWhile';
        return () => { document.title = 'WorkWhile'; };
    }, []);

    if (loading && !overview) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error && !overview) {
        return (
            <div className="container mx-auto px-4 py-8 pt-20 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Could not load analytics</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        type="button"
                        onClick={fetchAll}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw className="w-4 h-4" /> Try again
                    </button>
                </div>
            </div>
        );
    }

    const sourceDistribution = overview?.sourceDistribution ?? [];

    return (
        <div className="container mx-auto px-4 py-8 pt-20 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Activity className="w-8 h-8 text-blue-600" />
                    Market Insights Dashboard
                </h1>
                <button
                    type="button"
                    onClick={fetchAll}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Jobs" value={overview?.totalJobs} icon={Briefcase} color="#0088FE" />
                <StatCard title="Active Jobs" value={overview?.activeJobs} icon={Activity} color="#00C49F" />
                <StatCard title="Active Companies" value={overview?.totalCompanies} icon={Building} color="#00C49F" />
                <StatCard title="Total Candidates" value={overview?.totalCandidates} icon={Users} color="#FFBB28" />
                <StatCard title="Total Applications" value={overview?.totalApplications} icon={TrendingUp} color="#FF8042" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Sectors */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-6">Top Sectors by Volume & Salary</h2>
                    <div className="h-80">
                        {sectors?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sectors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="_id" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                    <Tooltip
                                        formatter={(value, name) =>
                                            name === 'Avg Salary (MAD)' ? formatSalary(value) : formatNumber(value)
                                        }
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="count" name="Job Count" fill="#8884d8" />
                                    <Bar yAxisId="right" dataKey="avgSalary" name="Avg Salary (MAD)" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No sector data yet</div>
                        )}
                    </div>
                </div>

                {/* Source Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-6">Internal vs External Data Source</h2>
                    <div className="h-80 flex justify-center items-center">
                        {sourceDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {sourceDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatNumber(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-gray-500">No source distribution data yet</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Application Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-6">Application Status Distribution</h2>
                    <div className="h-80 flex justify-center items-center">
                        {applicationStatus?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={applicationStatus}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {applicationStatus.map((entry, index) => (
                                            <Cell key={`cell-${entry._id}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatNumber(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-gray-500">No application status data yet</div>
                        )}
                    </div>
                </div>

                {/* Top Skills */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-6">Most In-Demand Skills</h2>
                    <div className="h-80">
                        {skills?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={skills}
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="_id" type="category" width={100} />
                                    <Tooltip formatter={(value) => formatNumber(value)} />
                                    <Bar dataKey="count" fill="#ff7300" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No skills data yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Locations */}
            <div className="mt-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-6">Top Locations by Job Count</h2>
                    <div className="h-80">
                        {locations?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={locations.filter((l) => l._id != null && l._id !== '')}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="_id" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => formatNumber(value)}
                                        labelFormatter={(label) => `Location: ${label}`}
                                        content={({ active, payload }) =>
                                            active && payload?.[0] ? (
                                                <div className="bg-white border rounded shadow p-2">
                                                    <p className="font-medium">{payload[0].payload._id}</p>
                                                    <p>Jobs: {formatNumber(payload[0].payload.count)}</p>
                                                    <p>Avg salary: {formatSalary(payload[0].payload.avgSalary)}</p>
                                                </div>
                                            ) : null
                                        }
                                    />
                                    <Bar dataKey="count" name="Job Count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No location data yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboardPage;
