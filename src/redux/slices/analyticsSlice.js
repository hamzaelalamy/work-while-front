import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Environment aware URL handling
const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    return window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api/v1'
        : 'https://workwhile-backend.onrender.com/api/v1'; // Fallback
};

const API_URL = getApiUrl();

const authConfig = (getState) => {
    const { auth } = getState();
    return { headers: { Authorization: `Bearer ${auth.token}` } };
};

export const fetchMarketOverview = createAsyncThunk(
    "analytics/fetchOverview",
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await axios.get(`${API_URL}/analytics/overview`, authConfig(getState));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchTopSectors = createAsyncThunk(
    "analytics/fetchSectors",
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await axios.get(`${API_URL}/analytics/sectors`, authConfig(getState));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchTopSkills = createAsyncThunk(
    "analytics/fetchSkills",
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await axios.get(`${API_URL}/analytics/skills`, authConfig(getState));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchJobTrends = createAsyncThunk(
    "analytics/fetchTrends",
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await axios.get(`${API_URL}/analytics/trends`, authConfig(getState));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchLocationTrends = createAsyncThunk(
    "analytics/fetchLocations",
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await axios.get(`${API_URL}/analytics/locations`, authConfig(getState));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchApplicationStatusDistribution = createAsyncThunk(
    "analytics/fetchApplicationStatus",
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await axios.get(`${API_URL}/analytics/application-status`, authConfig(getState));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const analyticsSlice = createSlice({
    name: "analytics",
    initialState: {
        overview: null,
        sectors: [],
        skills: [],
        trends: [],
        locations: [],
        applicationStatus: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMarketOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMarketOverview.fulfilled, (state, action) => {
                state.loading = false;
                state.overview = action.payload;
                state.error = null;
            })
            .addCase(fetchMarketOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load overview';
            })
            .addCase(fetchTopSectors.fulfilled, (state, action) => {
                state.sectors = action.payload;
            })
            .addCase(fetchTopSkills.fulfilled, (state, action) => {
                state.skills = action.payload;
            })
            .addCase(fetchJobTrends.fulfilled, (state, action) => {
                state.trends = action.payload;
            })
            .addCase(fetchLocationTrends.fulfilled, (state, action) => {
                state.locations = action.payload;
            })
            .addCase(fetchApplicationStatusDistribution.fulfilled, (state, action) => {
                state.applicationStatus = action.payload;
            });
    },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
