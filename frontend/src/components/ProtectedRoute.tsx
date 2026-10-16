import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import type { ReactNode } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen label="Loading session..." />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
