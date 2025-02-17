import { useAuth } from "./Contexts/AuthContext.js"; // ✅ Ensure lowercase 'context' & .js extension
import AppRoutes from "./Routes/AppRoutes.js"; // ✅ Ensure lowercase 'routes' & .js extension

const App = () => {
  const { user } = useAuth();

  return (
    <div className="h-screen flex flex-col">
      <AppRoutes />
    </div>
  );
};

export default App;
