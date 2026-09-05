import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import useDashboardData from '../hooks/useDashboardData';
import DashboardHeader from '../components/DashboardHeader';
import KpiGrid from '../components/KpiGrid';
import FinancialOverview from '../components/FinancialOverview';
import SpaceOverview from '../components/SpaceOverview';
import SpaceDistributionChart from '../components/SpaceDistributionChart';
import PaymentStatusChart from '../components/PaymentStatusChart';
import DuePayments from '../components/DuePayments';
import RecentActivity from '../components/RecentActivity';
import DashboardSkeleton from '../components/DashboardSkeleton';
import DashboardError from '../components/DashboardError';

const DashboardPage = () => {
  const { data, isLoading, isError, refetch, isFetching } = useDashboardData();
  const pageRef = useRef(null);

  useGSAP(
    () => {
      if (!isLoading && !isError && data) {
        gsap.fromTo(
          '.dash-section',
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.08,
            ease: 'power2.out'
          }
        );
      }
    },
    { scope: pageRef, dependencies: [isLoading, isError, data] }
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return <DashboardError onRetry={refetch} />;
  }

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Header Banner */}
      <div className="dash-section">
        <DashboardHeader onRefresh={refetch} isFetching={isFetching} />
      </div>

      {/* Primary KPI Grid */}
      <div className="dash-section">
        <KpiGrid data={data} />
      </div>

      {/* Financial Overview */}
      <div className="dash-section">
        <FinancialOverview data={data} />
      </div>

      {/* Charts Section */}
      <div className="dash-section grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpaceDistributionChart data={data} />
        <PaymentStatusChart data={data} />
      </div>

      {/* Space & Due Payments Section */}
      <div className="dash-section grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpaceOverview data={data} />
        <DuePayments data={data} />
      </div>

      {/* Recent Activity Timeline */}
      <div className="dash-section">
        <RecentActivity data={data} />
      </div>
    </div>
  );
};

export default DashboardPage;
