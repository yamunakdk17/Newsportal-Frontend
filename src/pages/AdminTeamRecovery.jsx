import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LoaderCircle, RefreshCw, RotateCcw } from 'lucide-react';

import AdminSidebar from '@/components/layout/AdminSidebar';
import NotificationToast from '@/components/admin/NotificationToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { getAdminUsers, isDeletedAdmin } from '@/lib/adminUsers';

const normalizeRole = (role) =>
  String(role ?? '')
    .toLowerCase()
    .replace(/[\s_-]/g, '');

const roleLabel = (user) =>
  normalizeRole(user?.role) === 'superadmin' ? 'Super-Admin' : 'Admin';

const formatDeletedAt = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value || '')
    : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
};

export default function AdminTeamRecovery() {
  const navigate = useNavigate();
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restoringIds, setRestoringIds] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [notification, setNotification] = useState({ type: 'error', message: '' });

  const showErrorNotification = useCallback((message) => {
    setNotification({ type: 'error', message });
  }, []);

  const showSuccessNotification = useCallback((message) => {
    setNotification({ type: 'success', message });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification((current) => ({ ...current, message: '' }));
  }, []);

  useEffect(() => {
    if (!notification.message) return undefined;

    const timeout = window.setTimeout(clearNotification, 5000);
    return () => window.clearTimeout(timeout);
  }, [notification, clearNotification]);

  const fetchDeletedUsers = useCallback(async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await api.get('/admin/admins');

      if (response.data?.success === false) {
        showErrorNotification(response.data?.message || 'Unable to load deleted users.');
        return;
      }

      setDeletedUsers(getAdminUsers(response).filter(isDeletedAdmin));
    } catch (error) {
      showErrorNotification(
        error.response?.data?.message || error.message || 'Unable to load deleted users.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showErrorNotification]);

  useEffect(() => {
    fetchDeletedUsers();
  }, [fetchDeletedUsers]);

  const handleRestore = async (user) => {
    const userId = user?.id;

    if (userId === null || userId === undefined) return;

    const id = String(userId);
    if (restoringIds.has(id)) return;

    try {
      setRestoringIds((current) => new Set(current).add(id));
      clearNotification();

      const response = await api.patch(
        `/admin/admins/${encodeURIComponent(id)}/restore`,
      );

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to restore user.');
        return;
      }

      const restoredUser = response.data?.data?.user ?? response.data?.data;

      if (
        String(restoredUser?.id ?? '') === id &&
        restoredUser.deleted_at !== null &&
        restoredUser.deleted_at !== undefined
      ) {
        showErrorNotification('The user is still deleted according to the server.');
        return;
      }

      setDeletedUsers((current) =>
        current.filter((member) => String(member.id) !== id),
      );
      showSuccessNotification('User restored successfully');
    } catch (error) {
      showErrorNotification(
        error.response?.data?.message || error.message || 'Unable to restore user.',
      );
    } finally {
      setRestoringIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const visibleUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return deletedUsers;

    return deletedUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        roleLabel(user).toLowerCase().includes(term),
    );
  }, [deletedUsers, query]);

  return (
    <>
      <AdminSidebar />

      <main className="min-h-screen min-w-0 xl:ml-[250px] 2xl:ml-[270px]">
        <div className="min-h-screen bg-[#F6F8FA] font-geist">
          <header className="border-b border-[#EEF0F2] bg-white">
            <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 xl:p-6">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/team')}
                  aria-label="Back to users"
                  className="size-9 rounded-xl border-[#D8DBDF] bg-white p-0 text-[#4A4E54] shadow-none hover:bg-slate-50">
                  <ArrowLeft className="size-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold leading-tight text-[#16181A] sm:text-2xl">
                    User Recovery
                  </h1>
                  <p className="mt-1 text-xs leading-[1.4] text-[#4A4E54] sm:text-sm">
                    Restore soft-deleted team members.
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center gap-2 lg:max-w-[520px]">
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search deleted users"
                  aria-label="Search deleted users"
                  className="h-10 flex-1 rounded-xl border-[#EAEBED] bg-[#F8F9FA] text-xs text-[#16181A] shadow-none placeholder:text-[#A5ABB2] focus-visible:ring-1 focus-visible:ring-[#2168CD]"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchDeletedUsers({ showLoader: false })}
                  disabled={refreshing}
                  aria-label="Refresh deleted users"
                  className="h-9 rounded-xl border-[#D8DBDF] bg-white px-3 text-[#4A4E54] shadow-none hover:bg-slate-50">
                  <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5 xl:p-6">
            <NotificationToast notification={notification} />

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-[#16181A]">Deleted Users</span>
              <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[#16181A] shadow-sm">
                {visibleUsers.length}
              </span>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-[#EEF0F2] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.025)]">
              <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(110px,0.8fr)_minmax(150px,0.9fr)_minmax(140px,0.8fr)] items-center gap-4 bg-[#2168CD] px-4 py-3 text-xs leading-[1.4] text-white sm:px-5 md:grid">
                <span className="font-medium">Name</span>
                <span className="font-medium">Email</span>
                <span className="font-medium">Role</span>
                <span className="font-medium">Deleted</span>
                <span className="font-medium">Action</span>
              </div>

              {loading ? (
                <div className="flex min-h-40 items-center justify-center gap-2 text-xs text-[#69707A]">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading deleted users...
                </div>
              ) : visibleUsers.length === 0 ? (
                <p className="px-5 py-8 text-xs text-[#4A4E54]">
                  {query ? 'No users match your search.' : 'No deleted users found.'}
                </p>
              ) : (
                visibleUsers.map((user) => {
                  const id = String(user.id);
                  const restoring = restoringIds.has(id);

                  return (
                    <div
                      key={id}
                      className="flex flex-col gap-2.5 border-t border-[#EEF0F2] px-4 py-4 first:border-t-0 sm:px-5 md:grid md:min-h-[68px] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(110px,0.8fr)_minmax(150px,0.9fr)_minmax(140px,0.8fr)] md:items-center md:gap-4 md:py-3">
                      <p className="truncate text-xs font-semibold text-[#16181A]">
                        <span className="mr-2 font-medium text-[#8A9098] md:hidden">Name:</span>
                        {user.name || '—'}
                      </p>
                      <p className="truncate text-xs text-[#3F444B]">
                        <span className="mr-2 font-medium text-[#8A9098] md:hidden">Email:</span>
                        {user.email || '—'}
                      </p>
                      <p className="text-xs text-[#3F444B]">
                        <span className="mr-2 font-medium text-[#8A9098] md:hidden">Role:</span>
                        {roleLabel(user)}
                      </p>
                      <p className="text-xs text-[#3F444B]">
                        <span className="mr-2 font-medium text-[#8A9098] md:hidden">Deleted:</span>
                        {formatDeletedAt(user.deleted_at)}
                      </p>
                      <div>
                        <Button
                          type="button"
                          onClick={() => handleRestore(user)}
                          disabled={restoring}
                          className="h-8 gap-1.5 rounded-xl bg-[#2168CD] px-3 text-[11px] font-medium text-white shadow-none hover:bg-[#1B58B0]">
                          {restoring ? (
                            <LoaderCircle className="size-3 animate-spin" />
                          ) : (
                            <RotateCcw className="size-3" />
                          )}
                          {restoring ? 'Restoring...' : 'Restore'}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
