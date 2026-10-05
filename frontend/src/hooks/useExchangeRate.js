import { useQuery } from '@tanstack/react-query'

export function useExchangeRate() {
  return useQuery({
    queryKey: ['exchange-rate'],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.bluelytics.com.ar/v2/latest')
        if (!response.ok) return 1100
        const data = await response.json()
        return data?.oficial?.value_sell || 1100
      } catch {
        return 1100
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}