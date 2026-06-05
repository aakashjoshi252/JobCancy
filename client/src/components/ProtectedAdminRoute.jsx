import RoleBasedRoute from "../routes/RoleBasedRoute";

export default function ProtectedAdminRoute({ children }) {
  return <RoleBasedRoute roles={["admin"]}>{children}</RoleBasedRoute>;
}
