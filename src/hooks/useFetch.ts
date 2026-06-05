import { useEffect, useState } from 'react'
import api from '../api/axios'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    api
      .get<T>(url)
      .then((response) => {
        if (mounted) {
          setData(response.data)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message)
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [url])

  return { data, loading, error } as UseFetchResult<T>
}
