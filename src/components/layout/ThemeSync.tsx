import { useEffect } from 'react'
import { useAppStore } from '../../store/store'

export function ThemeSync() {
  const darkMode = useAppStore((s) => s.darkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return null
}
