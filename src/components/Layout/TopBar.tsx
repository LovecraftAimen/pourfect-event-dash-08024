import { Bell, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-14 md:h-16 border-b border-border bg-card flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <User className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin')}>
              <Settings className="mr-2 h-4 w-4" />
              Painel de Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
