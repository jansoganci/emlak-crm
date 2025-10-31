import { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  AlertCircle,
  Bell,
  Check,
  Calendar,
  Home,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { remindersService, ReminderWithDetails } from '../../lib/serviceProxy';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { COLORS } from '@/config/colors';
import { EmptyState } from '../../components/common/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

export const Reminders = () => {
  const [reminders, setReminders] = useState<ReminderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<ReminderWithDetails | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await remindersService.getAllReminders();
      setReminders(data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
      setError('Failed to load reminders. Please try again.');
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsContacted = async (contractId: string) => {
    try {
      setActionLoading(contractId);
      await remindersService.markAsContacted(contractId);
      toast.success('Marked as contacted');
      loadReminders();
    } catch (error) {
      console.error('Failed to mark as contacted:', error);
      toast.error('Failed to update reminder');
    } finally {
      setActionLoading(null);
      setShowContactDialog(false);
    }
  };

  const { overdue: overdueReminders, upcoming: upcomingReminders, scheduled: scheduledReminders, expired: expiredContracts } = remindersService.categorizeReminders(reminders);

  const getReminderBadge = (reminder: ReminderWithDetails) => {
    const urgency = remindersService.getReminderUrgencyCategory(reminder.days_until_end);
    
    switch (urgency) {
      case 'expired':
        return <Badge variant="destructive">Contract Ended</Badge>;
      case 'urgent':
        return <Badge className={COLORS.reminders.overdue}>Urgent - {reminder.days_until_end} days left</Badge>;
      case 'soon':
        return <Badge className={COLORS.warning.dark}>Soon - {reminder.days_until_end} days left</Badge>;
      case 'upcoming':
        return <Badge className={COLORS.reminders.upcoming}>{reminder.days_until_end} days left</Badge>;
    }
  };

  const ReminderCard = ({ reminder }: { reminder: ReminderWithDetails }) => {
    const property = reminder.property;
    const owner = property?.owner;
    const tenant = reminder.tenant;

    return (
      <Card className={`shadow-lg ${COLORS.border.light} ${COLORS.card.bgBlur} hover:shadow-xl transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className={`h-5 w-5 ${COLORS.primary.text}`} />
                {property?.address || 'Unknown Property'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                Tenant: {tenant?.name || 'Unknown'}
              </CardDescription>
            </div>
            {getReminderBadge(reminder)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className={`${COLORS.muted.textLight} flex items-center gap-1`}>
                <Calendar className="h-4 w-4" />
                Contract End Date
              </p>
              <p className="font-medium">{format(new Date(reminder.end_date), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className={`${COLORS.muted.textLight} flex items-center gap-1`}>
                <Bell className="h-4 w-4" />
                Reminder Set For
              </p>
              <p className="font-medium">
                {reminder.reminder_date ? format(new Date(reminder.reminder_date), 'MMM dd, yyyy') : 'No date set'}
              </p>
            </div>
            <div>
              <p className={`${COLORS.muted.textLight} flex items-center gap-1`}>
                <DollarSign className="h-4 w-4" />
                Current Rent
              </p>
              <p className="font-medium">${reminder.rent_amount?.toFixed(2) || '0.00'}</p>
            </div>
            {reminder.expected_new_rent && (
              <div>
                <p className={`${COLORS.muted.textLight} flex items-center gap-1`}>
                  <DollarSign className="h-4 w-4" />
                  Expected New Rent
                </p>
                <p className={`font-medium ${COLORS.success.text}`}>${reminder.expected_new_rent.toFixed(2)}</p>
              </div>
            )}
          </div>

          {owner && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2">Property Owner Contact:</p>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <User className={`h-4 w-4 ${COLORS.muted.textLight}`} />
                  {owner.name}
                </p>
                {owner.email && (
                  <p className="flex items-center gap-2">
                    <Mail className={`h-4 w-4 ${COLORS.muted.textLight}`} />
                    <a href={`mailto:${owner.email}`} className={`${COLORS.primary.text} hover:underline`}>
                      {owner.email}
                    </a>
                  </p>
                )}
                {owner.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className={`h-4 w-4 ${COLORS.muted.textLight}`} />
                    <a href={`tel:${owner.phone}`} className={`${COLORS.primary.text} hover:underline`}>
                      {owner.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {reminder.reminder_notes && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-1 flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Notes:
              </p>
              <p className={`text-sm ${COLORS.gray.text600}`}>{reminder.reminder_notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => {
                setSelectedReminder(reminder);
                setShowContactDialog(true);
              }}
              disabled={actionLoading === reminder.id}
              className={`flex-1 ${COLORS.success.bgGradient} ${COLORS.success.bgGradientHover}`}
            >
              <Check className="h-4 w-4 mr-2" />
              {actionLoading === reminder.id ? 'Processing...' : 'Mark as Contacted'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <MainLayout title="Reminders">
      <PageContainer>
        <div className="space-y-4">
          <div className="grid w-full grid-cols-4 max-w-2xl">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                    </div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <MainLayout title="Reminders">
        <PageContainer>
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <AlertCircle className={`h-16 w-16 ${COLORS.danger.text}`} />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Error Loading Reminders</h3>
              <p className={`text-sm ${COLORS.muted.textLight} mb-4`}>{error}</p>
              <Button onClick={loadReminders} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reminders">
      <PageContainer>
        {reminders.length === 0 ? (
          <EmptyState
            title="No Active Reminders"
            description="Enable rent increase reminders when creating or editing contracts to track when to contact property owners about rent increases."
            icon={<Bell className={`h-16 w-16 ${COLORS.muted.text}`} />}
            showAction={false}
          />
        ) : (
          <Tabs defaultValue={overdueReminders.length > 0 ? "overdue" : upcomingReminders.length > 0 ? "upcoming" : "scheduled"} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overdue" className="relative">
              Overdue
              {overdueReminders.length > 0 && (
                <Badge className={`ml-2 ${COLORS.reminders.overdue} ${COLORS.text.white}`}>{overdueReminders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingReminders.length > 0 && (
                <Badge className={`ml-2 ${COLORS.reminders.upcoming} ${COLORS.text.white}`}>{upcomingReminders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled
              {scheduledReminders.length > 0 && (
                <Badge className={`ml-2 ${COLORS.reminders.scheduled} ${COLORS.text.white}`}>{scheduledReminders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired
              {expiredContracts.length > 0 && (
                <Badge className={`ml-2 ${COLORS.reminders.expired} ${COLORS.text.white}`}>{expiredContracts.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overdue" className="space-y-4">
            {overdueReminders.length === 0 ? (
              <EmptyState
                title="All Clear!"
                description="No overdue reminders"
                icon={<Check className={`h-12 w-12 ${COLORS.success.text}`} />}
                showAction={false}
              />
            ) : (
              <>
                <div className={`${COLORS.danger.bgLight} border ${COLORS.danger.border} rounded-lg p-4 shadow-md`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`h-5 w-5 ${COLORS.danger.text} mt-0.5`} />
                    <div>
                      <h3 className={`font-semibold ${COLORS.danger.textDark}`}>Action Required</h3>
                      <p className={`text-sm ${COLORS.danger.textDark} mt-1`}>
                        You have {overdueReminders.length} overdue reminder{overdueReminders.length !== 1 && 's'}.
                        Contact the property owner{overdueReminders.length !== 1 && 's'} about rent increases.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {overdueReminders.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingReminders.length === 0 ? (
              <EmptyState
                title="Nothing Coming Up"
                description="No upcoming reminders"
                icon={<Calendar className={`h-12 w-12 ${COLORS.muted.text}`} />}
                showAction={false}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledReminders.length === 0 ? (
              <EmptyState
                title="No Scheduled Reminders"
                description="No reminders are scheduled for the future"
                icon={<Bell className={`h-12 w-12 ${COLORS.muted.text}`} />}
                showAction={false}
              />
            ) : (
              <>
                <div className={`${COLORS.info.bgLight} border ${COLORS.border.DEFAULT_class} rounded-lg p-4 shadow-md`}>
                  <div className="flex items-start gap-3">
                    <Bell className={`h-5 w-5 ${COLORS.info.text} mt-0.5`} />
                    <div>
                      <h3 className={`font-semibold ${COLORS.gray.text900}`}>Scheduled Reminders</h3>
                      <p className={`text-sm ${COLORS.gray.text700} mt-1`}>
                        These reminders are scheduled for future dates. You'll be notified when it's time to contact the property owner.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {scheduledReminders.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            {expiredContracts.length === 0 ? (
              <EmptyState
                title="No Expired Contracts"
                description="No expired contracts with pending reminders"
                icon={<FileText className={`h-12 w-12 ${COLORS.muted.text}`} />}
                showAction={false}
              />
            ) : (
              <>
                <div className={`${COLORS.gray.bg50} border ${COLORS.gray.border200} rounded-lg p-4 shadow-md`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`h-5 w-5 ${COLORS.gray.text600} mt-0.5`} />
                    <div>
                      <h3 className={`font-semibold ${COLORS.gray.text900}`}>Expired Contracts</h3>
                      <p className={`text-sm ${COLORS.gray.text700} mt-1`}>
                        These contracts have ended. Mark as contacted to clear them from reminders.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {expiredContracts.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        )}

        <AlertDialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Contacted</AlertDialogTitle>
              <AlertDialogDescription>
                Have you contacted the property owner about the rent increase for this property? This will remove the
                reminder from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedReminder && handleMarkAsContacted(selectedReminder.id)}
                className={`${COLORS.success.bg} hover:${COLORS.success.dark}`}
              >
                Yes, Mark as Contacted
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageContainer>
    </MainLayout>
  );
};
