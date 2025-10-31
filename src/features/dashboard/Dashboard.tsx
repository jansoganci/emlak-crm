import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StatCard } from '../../components/dashboard/StatCard';
import { Building2, Chrome as Home, Users, FileText, CircleAlert as AlertCircle, Bell, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import { propertiesService, ownersService, tenantsService, contractsService, remindersService } from '../../lib/serviceProxy';
import { ReminderWithDetails } from '../../lib/serviceProxy';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '@/config/colors';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    occupied: 0,
    totalOwners: 0,
    totalTenants: 0,
    activeContracts: 0,
    expiringSoon: 0,
  });
  const [reminders, setReminders] = useState<ReminderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [propertyStats, owners, tenantStats, contractStats, upcomingReminders] = await Promise.all([
        propertiesService.getStats(),
        ownersService.getAll(),
        tenantsService.getStats(),
        contractsService.getStats(),
        remindersService.getUpcomingReminders(60),
      ]);

      setStats({
        totalProperties: propertyStats.total,
        occupied: propertyStats.occupied,
        totalOwners: owners.length,
        totalTenants: tenantStats.total,
        activeContracts: contractStats.active,
        expiringSoon: contractStats.expiringSoon,
      });
      setReminders(upcomingReminders);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Dashboard">
      <PageContainer>
        <div>
          <h2 className={`text-3xl font-bold ${COLORS.gray.text900}`}>Welcome back</h2>
          <p className={`${COLORS.gray.text600} mt-1`}>Here's what's happening with your properties today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            description={stats.totalProperties === 0 ? 'No properties yet' : 'Total properties'}
            icon={<Building2 className={`h-4 w-4 ${COLORS.text.white}`} />}
            iconColor="teal"
            loading={loading}
          />

          <StatCard
            title="Occupied"
            value={stats.occupied}
            description="Currently rented"
            icon={<Home className={`h-4 w-4 ${COLORS.text.white}`} />}
            iconColor="green"
            loading={loading}
          />

          <StatCard
            title="Total Tenants"
            value={stats.totalTenants}
            description="Total tenants"
            icon={<Users className={`h-4 w-4 ${COLORS.text.white}`} />}
            iconColor="blue"
            loading={loading}
          />

          <StatCard
            title="Active Contracts"
            value={stats.activeContracts}
            description="Current leases"
            icon={<FileText className={`h-4 w-4 ${COLORS.text.white}`} />}
            iconColor="orange"
            loading={loading}
          />
        </div>

        {reminders.length > 0 && (
          <Card className={`shadow-lg ${COLORS.warning.border} ${COLORS.warning.bgGradientBr} backdrop-blur-sm`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 ${COLORS.warning.dark} rounded-lg`}>
                    <Bell className={`h-5 w-5 ${COLORS.text.white}`} />
                  </div>
                  <div>
                    <CardTitle className={COLORS.warning.textDarker}>Rent Increase Reminders</CardTitle>
                    <CardDescription className={COLORS.warning.textDark}>
                      {reminders.length} reminder{reminders.length > 1 ? 's' : ''} for upcoming rent increases
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/reminders')}
                  className={`${COLORS.warning.borderHover} ${COLORS.warning.hoverBg}`}
                >
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.slice(0, 3).map((reminder) => {
                const urgency = remindersService.getReminderUrgencyCategory(reminder.days_until_end);
                return (
                  <div
                    key={reminder.id}
                    className={`flex items-center justify-between p-3 ${COLORS.card.bg} rounded-lg border ${COLORS.warning.border} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Home className={`h-4 w-4 ${COLORS.warning.text}`} />
                        <p className={`font-medium ${COLORS.gray.text900}`}>{reminder.property?.address}</p>
                      </div>
                      <div className={`flex items-center gap-4 text-sm ${COLORS.gray.text600}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Ends: {format(new Date(reminder.end_date), 'MMM dd, yyyy')}
                        </span>
                        {reminder.expected_new_rent && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${reminder.rent_amount?.toFixed(0)} → ${reminder.expected_new_rent.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={
                        urgency === 'urgent'
                          ? COLORS.danger.bg
                          : urgency === 'soon'
                          ? COLORS.warning.dark
                          : COLORS.primary.bg
                      }
                    >
                      {reminder.days_until_end} days
                    </Badge>
                  </div>
                );
              })}
              {reminders.length > 3 && (
                <p className={`text-sm ${COLORS.warning.textDark} text-center pt-2`}>
                  And {reminders.length - 3} more reminder{reminders.length - 3 > 1 ? 's' : ''}...
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {stats.expiringSoon > 0 && (
          <Card className={`shadow-lg ${COLORS.warning.border} ${COLORS.warning.bgLight}/50 backdrop-blur-sm`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className={`h-5 w-5 ${COLORS.warning.text}`} />
                <CardTitle className={COLORS.warning.textDarker}>Contracts Expiring Soon</CardTitle>
              </div>
              <CardDescription className={COLORS.warning.textDark}>
                You have {stats.expiringSoon} contract{stats.expiringSoon > 1 ? 's' : ''} expiring within the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-sm ${COLORS.warning.textDark}`}>Review your contracts page to take action on expiring leases.</p>
            </CardContent>
          </Card>
        )}

        <Card className={`shadow-lg ${COLORS.border.light} ${COLORS.card.bgBlur}`}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started by adding your first property or owner</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-sm ${COLORS.gray.text600}`}>Use the navigation menu to manage properties, owners, tenants, and contracts.</p>
          </CardContent>
        </Card>
      </PageContainer>
    </MainLayout>
  );
};
