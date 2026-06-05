import ProtectedRoute from "./ProtectedRoute";

export default function RoleBasedRoute({ children, roles }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}
