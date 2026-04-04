import { useAppStore } from '../../store/store'

type Role = 'Viewer' | 'Admin'

interface RoleGateProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const role = useAppStore((s) => s.role)
  if (!allowedRoles.includes(role)) return null
  return <>{children}</>
}
