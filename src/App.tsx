import { Route, Routes } from 'react-router-dom';
import './App.css';
import { HomeScreen } from './pages/home/index';
import { RegistrationScreen } from './pages/registration';
import { LoginScreen } from './pages/login';
import { ProfileScreen } from './pages/profile';
import { SubscriptionScreen } from './pages/subscription';
import QRScreen from './pages/qr/QrScreen';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { BottomNavigation } from './shared/components/BottomNavigation';
import { MobileOnlyMessage } from './shared/components/MobileOnlyMessage';

function App() {
  // Detect if user is on mobile device
  // const isMobile =
  //   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  //     navigator.userAgent
  //   );

  // // If not mobile, show only the mobile-only message
  // if (!isMobile) {
  //   return <MobileOnlyMessage />;
  // }

  // console.log(isMobile);

  // If mobile, show the app normally
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/registration" element={<RegistrationScreen />} />
        <Route path="/login" element={<LoginScreen />} />
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
        <Route
          path="/qr"
          element={
            <ProtectedRoute>
              <QRScreen />
            </ProtectedRoute>
          }
        />
      </Routes>
      <BottomNavigation />
    </>
  );
}

export default App;
