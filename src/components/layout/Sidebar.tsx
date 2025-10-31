import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ROUTES, APP_NAME } from '../../config/constants';
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  UserCheck,
  Bell,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { remindersService } from '../../lib/serviceProxy';
import { COLORS } from '@/config/colors';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Properties', href: ROUTES.PROPERTIES, icon: Home },
  { name: 'Owners', href: ROUTES.OWNERS, icon: Users },
  { name: 'Tenants', href: ROUTES.TENANTS, icon: UserCheck },
  { name: 'Reminders', href: ROUTES.REMINDERS, icon: Bell },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { signOut, user } = useAuth();
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    loadReminderCount();
    const interval = setInterval(loadReminderCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadReminderCount = async () => {
    try {
      const reminders = await remindersService.getActiveReminders();
      setReminderCount(reminders.length);
    } catch (error) {
      console.error('Failed to load reminder count:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          `fixed top-0 left-0 h-full ${COLORS.card.bg} border-r ${COLORS.border.DEFAULT_class} z-50 transition-transform duration-300 ease-in-out w-64 flex flex-col shadow-xl`,
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className={`flex items-center justify-between p-4 border-b ${COLORS.border.DEFAULT_class} ${COLORS.primary.bgGradient}`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 ${COLORS.card.bg}/20 rounded-lg backdrop-blur-sm`}>
              <Building2 className={`h-5 w-5 ${COLORS.text.white}`} />
            </div>
            <span className={`font-semibold ${COLORS.text.white}`}>{APP_NAME}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden h-auto w-auto p-1 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => onClose()}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                    : `${COLORS.gray.text700} ${COLORS.primary.hover}`
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.name === 'Reminders' && reminderCount > 0 && (
                    <Badge className={cn(
                      "ml-auto h-5 px-2 text-xs",
                      isActive ? `${COLORS.card.bg} ${COLORS.primary.text}` : `${COLORS.danger.bg} ${COLORS.text.white}`
                    )}>
                      {reminderCount > 9 ? '9+' : reminderCount}
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`p-4 border-t ${COLORS.border.DEFAULT_class}`}>
          <div className="flex items-center gap-3 mb-3 px-3 py-2">
            <div className={`h-8 w-8 rounded-full ${COLORS.gray.bg200} flex items-center justify-center`}>
              <span className={`text-sm font-medium ${COLORS.gray.text600}`}>
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${COLORS.gray.text900} truncate`}>
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};
