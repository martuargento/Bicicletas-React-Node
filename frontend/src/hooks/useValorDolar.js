import { useEffect, useState } from 'react'

export function useValorDolar() {
  const [valor, setValor] = useState(1100)

  useEffect(() => {
    const cargarValor = async () => {
      try {
        const respuesta = await fetch('https://api.bluelytics.com.ar/v2/latest')
        if (!respuesta.ok) return
        const data = await respuesta.json()
        if (data?.oficial?.value_sell) setValor(data.oficial.value_sell)
      } catch {
        setValor(1100)
      }
    }

    cargarValor()
  }, [])

  return valor
}