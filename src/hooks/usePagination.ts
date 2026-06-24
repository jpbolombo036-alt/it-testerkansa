import { useState, useMemo } from 'react'

export function usePagination<T>(items: T[], itemsPerPage: number = 25) {
  const [currentPage, setCurrentPage] = useState(0)

  const paginatedItems = useMemo(() => {
    const start = currentPage * itemsPerPage
    return items.slice(start, start + itemsPerPage)
  }, [items, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))

  return {
    currentPage,
    setCurrentPage,
    paginatedItems,
    totalPages,
    totalItems: items.length
  }
}