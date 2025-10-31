import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Calendar,
  Edit,
  BarChart3,
  Code,
  Activity,
  Sun,
  Moon,
  Globe,
  Save,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProfileSkeleton, StatsSkeleton } from '../components/ui/Skeleton';
import { useAuthStore } from '../store/authStore';
import { useUserStats } from '../hooks/useReviews';

// Language options for default preference
const languageOptions = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'c++', label: 'C++', icon: '⚡' },
  { value: 'c#', label: 'C#', icon: '🔷' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
];

// Mock chart data (in real app, this would come from useUserStats)
const generateChartData = (totalReviews: number) => {
  const data = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: format(date, 'MMM dd'),
      reviews: Math.floor(Math.random() * (totalReviews / 7 + 1)),
    });
  }

  return data;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useUserStats();

  // Local state for preferences
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [defaultLanguage, setDefaultLanguage] = useState('javascript');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    const savedLanguage =
      localStorage.getItem('defaultLanguage') || 'javascript';

    setTheme(savedTheme);
    setDefaultLanguage(savedLanguage);
  }, []);

  const handleSavePreferences = async () => {
    setIsUpdatingPreferences(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage
      localStorage.setItem('theme', theme);
      localStorage.setItem('defaultLanguage', defaultLanguage);

      toast.success('Preferences updated successfully!');
    } catch {
      toast.error('Failed to update preferences');
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch {
      toast.error('Failed to delete account');
      setShowDeleteModal(false);
    }
  };

  const handleEditProfile = () => {
    toast.info('Profile editing coming soon!');
  };

  // Don't render if user data not available
  if (!user) {
    return null;
  }

  const chartData = stats ? generateChartData(stats.totalReviews) : [];

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view your code review statistics.
          </p>
        </div>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card title="Account Information">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {user.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleEditProfile}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </Card>

          {/* Statistics Card */}
          <Card title="Statistics">
            {statsLoading ? (
              <StatsSkeleton />
            ) : statsError ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">
                  Failed to load statistics
                </div>
                <Button variant="secondary" size="sm">
                  Try Again
                </Button>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Main Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 sm:p-6 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.totalReviews}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Total Reviews
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950 p-4 sm:p-6 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.languagesUsed.length}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                      Languages Used
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950 p-4 sm:p-6 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.recentActivity.length}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Recent Reviews
                    </div>
                  </div>
                </div>

                {/* Languages Used */}
                {stats.languagesUsed.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
                      Languages Used
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {stats.languagesUsed.map((language) => {
                        const langOption = languageOptions.find(
                          (opt) => opt.value === language.toLowerCase()
                        );
                        return (
                          <Badge
                            key={language}
                            variant="info"
                            className="flex items-center gap-1"
                          >
                            {langOption?.icon && <span>{langOption.icon}</span>}
                            {language.charAt(0).toUpperCase() +
                              language.slice(1)}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {stats.recentActivity.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Recent Activity
                    </h4>
                    <div className="space-y-3">
                      {stats.recentActivity.slice(0, 5).map((review) => {
                        const totalIssues =
                          review.analysisResult.summary.securityIssues +
                          review.analysisResult.summary.performanceIssues +
                          review.analysisResult.summary.bestPracticeIssues +
                          review.analysisResult.summary
                            .refactoringOpportunities;

                        return (
                          <div
                            key={review.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <Code className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {review.fileName || 'Code Snippet'}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-4">
                                <span>{review.language}</span>
                                <span>{totalIssues} issues found</span>
                                <span>
                                  {formatDistanceToNow(
                                    new Date(review.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/history/${review.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Chart */}
                {chartData.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Reviews Over Time (Last 7 Days)
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="reviews"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>
                  No statistics available yet. Start analyzing code to see your
                  stats!
                </p>
                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={() => navigate('/')}
                >
                  Start Analyzing
                </Button>
              </div>
            )}
          </Card>

          {/* Preferences Card */}
          <Card title="Preferences">
            <div className="space-y-4 sm:space-y-6">
              {/* Theme Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    variant={theme === 'light' ? 'primary' : 'secondary'}
                    onClick={() => setTheme('light')}
                    className="flex items-center justify-center sm:justify-start gap-2 min-h-[44px]"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'primary' : 'secondary'}
                    onClick={() => setTheme('dark')}
                    className="flex items-center justify-center sm:justify-start gap-2 min-h-[44px]"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                </div>
              </div>

              {/* Default Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Default Language
                </label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    min-h-[44px] text-base"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSavePreferences}
                  loading={isUpdatingPreferences}
                  disabled={isUpdatingPreferences}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
                >
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone Card */}
          <Card title="Danger Zone" className="border-red-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-1">
                    Delete Account
                  </h4>
                  <p className="text-sm text-red-700 mb-4">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5" />
            <div>
              <p className="text-gray-900 mb-3">
                Are you absolutely sure you want to delete your account?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Your profile and account information</li>
                  <li>• All your code reviews and analysis history</li>
                  <li>• Your preferences and settings</li>
                  <li>• All associated data and statistics</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                Please type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mt-2"
                onChange={() => {
                  // You could add confirmation logic here
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Profile;
