import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

function getSavedItems() {
  try {
    const saved = JSON.parse(localStorage.getItem('bicicleal-cart') || 'null')
    if (Array.isArray(saved)) return saved
    return Array.isArray(saved?.state?.items) ? saved.state.items : []
  } catch {
    return []
  }
}

export const useCartStore = create(
  persist(
    (set) => ({
      items: getSavedItems(),
      addItem: (product) => set((state) => {
        const existing = state.items.find((item) => item.id === product.id)
        if (existing) {
          return {
            items: state.items.map((item) =>
              item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
            ),
          }
        }

        return {
          items: [...state.items, {
            id: product.id,
            titulo: product.nombre,
            precio: Number(product.precio || 0),
            cantidad: 1,
          }],
        }
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'bicicleal-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)