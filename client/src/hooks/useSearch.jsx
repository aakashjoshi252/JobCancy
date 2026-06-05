import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useJobSearch = (jobs, initialFilters = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get search params from URL
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState({
    searchQuery: searchParams.get('search') || initialFilters.searchQuery || "",
    location: searchParams.get('location') || initialFilters.location || "",
    jewelryCategory: searchParams.get('category') || initialFilters.jewelryCategory || "All Categories",
    experience: searchParams.get('experience') || initialFilters.experience || "All Levels",
    jobType: searchParams.get('type') || initialFilters.jobType || "All Types",
    ...initialFilters
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    if (filters.location) params.set('location', filters.location);
    if (filters.jewelryCategory && filters.jewelryCategory !== "All Categories") {
      params.set('category', filters.jewelryCategory);
    }
    if (filters.experience && filters.experience !== "All Levels") {
      params.set('experience', filters.experience);
    }
    if (filters.jobType && filters.jobType !== "All Types") {
      params.set('type', filters.jobType);
    }
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [filters, location.pathname]);

  // Filter jobs based on criteria
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchQuery = filters.searchQuery?.toLowerCase().trim() || "";
      
      const matchesSearch = !searchQuery || 
        job.title?.toLowerCase().includes(searchQuery) ||
        job.companyName?.toLowerCase().includes(searchQuery) ||
        job.description?.toLowerCase().includes(searchQuery) ||
        job.jewelryCategory?.toLowerCase().includes(searchQuery) ||
        job.jewelrySpecialization?.some(spec => spec?.toLowerCase().includes(searchQuery)) ||
        job.skills?.some(skill => skill?.toLowerCase().includes(searchQuery));

      const matchesLocation = !filters.location ||
        job.jobLocation?.toLowerCase().includes(filters.location.toLowerCase().trim());

      const matchesCategory = !filters.jewelryCategory || 
        filters.jewelryCategory === "All Categories" ||
        job.jewelryCategory === filters.jewelryCategory;

      const matchesExperience = !filters.experience || 
        filters.experience === "All Levels" ||
        job.experience === filters.experience;

      const matchesJobType = !filters.jobType || 
        filters.jobType === "All Types" ||
        job.jobType === filters.jobType;

      return matchesSearch && matchesLocation && matchesCategory && matchesExperience && matchesJobType;
    });
  }, [jobs, filters]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      location: "",
      jewelryCategory: "All Categories",
      experience: "All Levels",
      jobType: "All Types",
    });
    setShowFilters(false);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      value && 
      value !== "All Categories" && 
      value !== "All Levels" && 
      value !== "All Types" && 
      key !== 'searchQuery' && 
      key !== 'location'
    ).length;
  };

  const navigateWithFilters = (path, filterValues) => {
    const params = new URLSearchParams();
    if (filterValues.searchQuery) params.set('search', filterValues.searchQuery);
    if (filterValues.location) params.set('location', filterValues.location);
    if (filterValues.jewelryCategory && filterValues.jewelryCategory !== "All Categories") {
      params.set('category', filterValues.jewelryCategory);
    }
    if (filterValues.experience && filterValues.experience !== "All Levels") {
      params.set('experience', filterValues.experience);
    }
    if (filterValues.jobType && filterValues.jobType !== "All Types") {
      params.set('type', filterValues.jobType);
    }
    
    navigate(`${path}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return {
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    showFilters,
    setShowFilters,
    filteredJobs,
    handleFilterChange,
    resetFilters,
    getActiveFilterCount,
    navigateWithFilters
  };
};