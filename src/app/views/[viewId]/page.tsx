import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function ViewPage({ params }: { params: { viewId: string } }) {
  return <DashboardShell viewId={params.viewId} />;
}
