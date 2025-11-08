import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/login";
import PortfolioAssetsPage from "./pages/portfolio/asset";
import PortfolioAssetPage from "./pages/portfolio/asset/[id]/page";
import PortfolioDividendsPage from "./pages/portfolio/dividends/page";
import PortfolioLayout from "./pages/portfolio/layout";
import PortfolioOverviewPage from "./pages/portfolio/overview";
import PortfolioReturnsPage from "./pages/portfolio/returns/page";
import TaxIncomePage from "./pages/portfolio/tax-income/page";
import PortfolioTransactionsPage from "./pages/portfolio/trades/page";
import UserConfigurationPage from "./pages/portfolio/user-configurations/page";
import PortfolioPatrimonyEvolution from "./pages/portfolio/wealth/page";
import { ThemeRegistry } from "./theme";

const router = createBrowserRouter([
  {
    path: "/portfolio",
    element: <PortfolioLayout />,
    children: [
      { path: "overview", element: <PortfolioOverviewPage /> },
      { path: "asset", element: <PortfolioAssetsPage /> },
      { path: "asset/:id", element: <PortfolioAssetPage /> },
      { path: "dividends", element:  <PortfolioDividendsPage /> },
      { path: "returns", element:  <PortfolioReturnsPage /> },
      { path: "tax-income", element:  <TaxIncomePage /> },
      { path: "trades", element:  <PortfolioTransactionsPage /> },
      { path: "wealth", element:  <PortfolioPatrimonyEvolution /> },
      { path: "user-configurations", element: <UserConfigurationPage /> },
    ],
  },
  {
    path: "/login", 
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Navigate to="/portfolio/overview" replace /> 
  },
  {
    path: "/*",
    element: <div>404 Not Found</div>,
  }
]);

function App() {
  return (
    <AuthProvider>
      <ThemeRegistry>
        <RouterProvider router={router} />
      </ThemeRegistry>
    </AuthProvider>
  );
}

export default App;
