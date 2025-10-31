import { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { remindersService } from '../../lib/serviceProxy';
import { COLORS } from '@/config/colors';

interface NavbarProps {
  title: string;
  onMenuClick: () => void;
}

export const Navbar = ({ title, onMenuClick }: NavbarProps) => {
  const [reminderCount, setReminderCount] = useState(0);
  const navigate = useNavigate();

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

  return (
    <header className={`sticky top-0 z-30 ${COLORS.card.bg} border-b ${COLORS.border.DEFAULT_class} shadow-sm`}>
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className={`text-xl font-semibold ${COLORS.gray.text900}`}>{title}</h1>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => navigate('/reminders')}
        >
          <Bell className="h-5 w-5" />
          {reminderCount > 0 && (
            <Badge className={`absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 ${COLORS.danger.bg} ${COLORS.text.white} text-xs border-2 border-white`}>
              {reminderCount > 9 ? '9+' : reminderCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
};
