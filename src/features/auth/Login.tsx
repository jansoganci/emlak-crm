import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { ROUTES, APP_NAME } from '../../config/constants';
import { Building2 } from 'lucide-react';
import { COLORS } from '@/config/colors';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, enableDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Account created successfully! Please sign in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        await signIn(email, password);
        toast.success('Login successful');
        navigate(ROUTES.DASHBOARD);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : isSignUp ? 'Sign up failed' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    enableDemoMode();
    navigate(ROUTES.DASHBOARD);
  };

  return (
    // Note: PageContainer intentionally NOT used here - auth pages require full-screen centered layout
    // without navbar/sidebar, which is standard UX for login/signup flows
    <div className={`flex items-center justify-center min-h-screen ${COLORS.gray.bg50}`}>
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 ${COLORS.primary.bgLight} rounded-full`}>
              <Building2 className={`h-8 w-8 ${COLORS.primary.text}`} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create a new account to get started' : 'Sign in to your account to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? 'Create a password (min. 6 characters)' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>

          {/* Demo Mode Button - Only show on sign in mode */}
          {!isSignUp && (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoMode}
                disabled={loading}
                className="w-full border-dashed"
              >
                🚀 Try Demo Mode
              </Button>
              <p className="text-xs text-center mt-2 text-gray-500">
                Skip login and explore the app with sample data
              </p>
            </div>
          )}

          <div className="mt-4 text-center text-sm">
            <span className={COLORS.gray.text600}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            {' '}
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword('');
              }}
              className="font-medium h-auto p-0"
              disabled={loading}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
