// usePagination - Custom hook for paginated data
// Provides pagination state and helpers for lists

import { useState, useCallback, useMemo } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

interface UsePaginationOptions<T> {
  data: T[];
  initialPage?: number;
  initialLimit?: number;
}

interface UsePaginationReturn<T> {
  // State
  pagination: PaginationState;
  
  // Computed
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  paginatedData: T[];
  
  // Actions
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

export function usePagination<T>({
  data,
  initialPage = 1,
  initialLimit = 10
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: data.length
  });

  // Update total when data changes
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / pagination.limit);
  }, [data.length, pagination.limit]);

  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;

  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = Math.min(startIndex + pagination.limit, data.length);

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setPagination(prev => ({ ...prev, page: validPage }));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [hasPrevPage]);

  const setLimit = useCallback((limit: number) => {
    const newLimit = Math.max(1, Math.min(limit, 100));
    const newTotalPages = Math.ceil(data.length / newLimit);
    const newPage = Math.min(pagination.page, newTotalPages);
    
    setPagination({
      page: newPage > 0 ? newPage : 1,
      limit: newLimit,
      total: data.length
    });
  }, [data.length, pagination.page]);

  const reset = useCallback(() => {
    setPagination({
      page: initialPage,
      limit: initialLimit,
      total: data.length
    });
  }, [initialPage, initialLimit, data.length]);

  return {
    pagination,
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    setLimit,
    reset
  };
}

export default usePagination;
