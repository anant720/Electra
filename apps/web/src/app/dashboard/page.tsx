import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your voter readiness dashboard. Track registration, deadlines, and civic preparedness across 5 countries.',
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardClient />
    </ProtectedRoute>
  );
}
