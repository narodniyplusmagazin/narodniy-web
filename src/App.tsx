import { Route, Routes } from 'react-router-dom';
import './App.css';
import { HomeScreen } from './pages/home/index';
import { RegistrationScreen } from './pages/registration';
import { LoginScreen } from './pages/login';
import { ProfileScreen } from './pages/profile';
import { SubscriptionScreen } from './pages/subscription';
import { QRScreen } from './pages/qr/QrScreen';
import { PrivacyPolicyScreen } from './pages/privacy-policy';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { BottomNavigation } from './shared/components/BottomNavigation';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/registration" element={<RegistrationScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
        <Route path="/qrPage" element={<QRScreen />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <SubscriptionScreen />
            </ProtectedRoute>
          }
        />
      </Routes>
      <BottomNavigation />
    </>
  );
}

export default App;
