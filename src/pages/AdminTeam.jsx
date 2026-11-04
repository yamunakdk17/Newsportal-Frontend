import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, RefreshCw, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

import api from '@/services/api';
import AdminSidebar from '@/components/layout/AdminSidebar';

const GRID =
  'md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(100px,0.8fr)_minmax(180px,1fr)] md:items-center md:gap-4';

const TEXT = 'text-xs leading-[1.4]';

const normalizeRole = (role) =>
  String(role ?? '')
    .toLowerCase()
    .replace(/[\s_-]/g, '');

const isSuperAdmin = (member) => normalizeRole(member.role) === 'superadmin';

const roleLabel = (member) => (isSuperAdmin(member) ? 'Super-Admin' : 'Admin');

function getInitialForm() {
  return {
    name: '',
    email: '',
    password: '',
  };
}

export default function Team() {
  const reduce = useReducedMotion();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedMember, setSelectedMember] = useState(null);

  const [form, setForm] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMembers = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError('');

      const response = await api.get('/admin/admins');

      console.log('Admins response:', response.data);

      const list = response.data?.data?.data ?? response.data?.data ?? [];

      setMembers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);

      setError(
        err.response?.data?.message || err.message || 'Unable to load team members.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedMember(null);
    setForm(getInitialForm());
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setModalMode('edit');
    setSelectedMember(member);

    setForm({
      name: member.name || '',
      email: member.email || '',
      password: '',
    });

    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setSelectedMember(null);
    setForm(getInitialForm());
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }

    if (modalMode === 'create' && !form.password.trim()) {
      setError('Password is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (modalMode === 'create') {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: 'admin',
        };

        const response = await api.post('/admin/admins', payload);

        console.log('Create admin response:', response.data);
      } else {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        const response = await api.put(`/admin/admins/${selectedMember.id}`, payload);

        console.log('Update admin response:', response.data);
      }

      setModalOpen(false);
      setSelectedMember(null);
      setForm(getInitialForm());

      await fetchMembers({
        showLoader: false,
      });
    } catch (err) {
      console.error('Save admin error:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          `Unable to ${modalMode === 'create' ? 'create' : 'update'} admin.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member) => {
    if (isSuperAdmin(member)) {
      setError('Super Admin cannot be deleted.');
      return;
    }

    const confirmed = window.confirm(`Delete ${member.name}?`);

    if (!confirmed) return;

    try {
      setDeletingId(member.id);
      setError('');

      const response = await api.delete(`/admin/admins/${member.id}`);

      console.log('Delete admin response:', response.data);

      setMembers((current) => current.filter((m) => m.id !== member.id));
    } catch (err) {
      console.error('Delete admin error:', err);

      setError(err.response?.data?.message || err.message || 'Unable to delete member.');
    } finally {
      setDeletingId(null);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return members;

    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(q) ||
        member.email?.toLowerCase().includes(q) ||
        roleLabel(member).toLowerCase().includes(q),
    );
  }, [members, query]);

  return (
    <>
      <AdminSidebar />

      <main className="min-h-screen min-w-0 xl:ml-[250px] 2xl:ml-[270px]">
        <div className="min-h-screen bg-[#F6F8FA] font-geist">
          {/* HEADER */}
          <header className="border-b border-[#EEF0F2] bg-white">
            <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 xl:p-6">
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight text-[#16181A] sm:text-2xl">
                  Team
                </h1>

                <p className="mt-1 text-xs leading-[1.4] text-[#4A4E54] sm:text-sm">
                  Manage your editorial team members.
                </p>
              </div>

              <div className="w-full lg:max-w-[430px]">
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#A5ABB2]"
                  />

                  <Input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search team members"
                    aria-label="Search team members"
                    className="h-10 rounded-xl border-[#EAEBED] bg-[#F8F9FA] pl-9 text-xs text-[#16181A] shadow-none placeholder:text-[#A5ABB2] focus-visible:ring-1 focus-visible:ring-[#2168CD]"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5 xl:p-6">
            {/* TOP ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-[#16181A]">Total Members</span>

                <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[#16181A] shadow-sm">
                  {members.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    fetchMembers({
                      showLoader: false,
                    })
                  }
                  disabled={refreshing}
                  aria-label="Refresh team members"
                  className="h-9 rounded-xl border-[#D8DBDF] bg-white px-3 text-[#4A4E54] shadow-none hover:bg-slate-50">
                  <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>

                <Button
                  type="button"
                  onClick={openCreateModal}
                  className="h-9 gap-1.5 rounded-xl bg-[#2168CD] px-3 text-xs font-medium text-white shadow-none hover:bg-[#1B58B0]">
                  <Plus className="size-3.5" />
                  Add an Admin
                </Button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                <p role="alert" className="text-[11px] font-semibold text-[#981733]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => setError('')}
                  className="shrink-0 text-red-500 hover:text-red-700"
                  aria-label="Close error">
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* MAIN */}
            <div className="flex min-w-0 flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:gap-5">
              {/* TABLE */}
              <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#EEF0F2] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.025)]">
                {/* DESKTOP HEADER */}
                <div
                  className={`hidden bg-[#2168CD] px-4 py-3 text-white md:grid sm:px-5 ${GRID} ${TEXT}`}>
                  <span className="font-medium">Name</span>

                  <span className="font-medium">Email</span>

                  <span className="font-medium">Role</span>

                  <span className="font-medium">Action</span>
                </div>

                <div className="flex flex-col">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="border-t border-[#EEF0F2] px-4 py-3.5 first:border-t-0 sm:px-5">
                        <Skeleton className="h-9 w-full rounded-xl" />
                      </div>
                    ))
                  ) : visible.length === 0 ? (
                    <div className="px-5 py-8">
                      <p className="text-xs text-[#4A4E54]">
                        {query ? 'No members match your search.' : 'No team members yet.'}
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence initial={!reduce} mode="popLayout">
                      {visible.map((member) => {
                        const protectedRow = isSuperAdmin(member);

                        return (
                          <motion.div
                            key={member.id}
                            layout={!reduce}
                            initial={
                              reduce
                                ? false
                                : {
                                    opacity: 0,
                                    y: 5,
                                  }
                            }
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.2,
                              ease: 'easeOut',
                            }}
                            className={`flex flex-col gap-2.5 border-t border-[#EEF0F2] px-4 py-4 first:border-t-0 sm:px-5 md:min-h-[68px] md:py-3 ${GRID} ${TEXT}`}>
                            {/* NAME */}
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-[#16181A]">
                                {member.name || '—'}
                              </p>

                              <p className="mt-0.5 text-[10px] text-[#9AA0A8] md:hidden">
                                Team member
                              </p>
                            </div>

                            {/* EMAIL */}
                            <p className="min-w-0 truncate text-xs">
                              <span className="mr-2 font-medium text-[#8A9098] md:hidden">
                                Email:
                              </span>

                              <span className="text-[#3F444B]">
                                {member.email || '—'}
                              </span>
                            </p>

                            {/* ROLE */}
                            <div>
                              <span className="mr-2 font-medium text-[#8A9098] md:hidden">
                                Role:
                              </span>

                              <span
                                className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-semibold ${
                                  protectedRow
                                    ? 'bg-blue-50 text-[#2168CD]'
                                    : 'bg-slate-100 text-[#4A4E54]'
                                }`}>
                                {roleLabel(member)}
                              </span>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-2">
                              {protectedRow ? (
                                <span className="inline-flex h-8 items-center rounded-lg bg-slate-100 px-3 text-[10px] font-medium text-[#69707A]">
                                  Protected
                                </span>
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => openEditModal(member)}
                                    aria-label={`Edit ${member.name}`}
                                    className="h-8 gap-1.5 rounded-xl border-[#D8DBDF] bg-white px-2.5 text-[11px] font-normal text-[#16181A] shadow-none hover:bg-slate-50">
                                    <Pencil className="size-3" />
                                    Edit
                                  </Button>

                                  <Button
                                    type="button"
                                    onClick={() => handleDelete(member)}
                                    disabled={deletingId === member.id}
                                    aria-label={`Delete ${member.name}`}
                                    className="h-8 gap-1.5 rounded-xl bg-[#F5365C] px-2.5 text-[11px] font-normal text-white shadow-none hover:bg-[#DC2A4F]">
                                    {deletingId === member.id ? (
                                      <LoaderCircle className="size-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="size-3" />
                                    )}
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* ROLE INFO */}
              <motion.aside
                initial={
                  reduce
                    ? false
                    : {
                        opacity: 0,
                        y: 8,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                  delay: 0.05,
                  ease: 'easeOut',
                }}
                className="w-full rounded-2xl border border-[#EEF0F2] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.025)] sm:p-5 2xl:w-[350px] 2xl:shrink-0">
                <h2 className="text-sm font-bold leading-tight text-[#16181A]">
                  Team roles
                </h2>

                <div className="mt-3 flex flex-col gap-2.5">
                  <div className="rounded-xl bg-[#F6F8FA] p-3">
                    <h3 className="text-xs font-semibold text-[#16181A]">Super admin</h3>

                    <p className="mt-1 text-[10px] leading-[1.5] text-[#4A4E54]">
                      Can edit and delete admins, and cannot be removed by others.
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F6F8FA] p-3">
                    <h3 className="text-xs font-semibold text-[#16181A]">Admin</h3>

                    <p className="mt-1 text-[10px] leading-[1.5] text-[#4A4E54]">
                      Manages articles and categories. Select Edit to change account
                      details.
                    </p>
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/45 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              initial={
                reduce
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.97,
                      y: 8,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: 8,
              }}
              className="fixed inset-0 z-[101] flex items-center justify-center overflow-y-auto p-4">
              <div
                className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                onClick={(event) => event.stopPropagation()}>
                {/* MODAL HEADER */}
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#16181A]">
                      {modalMode === 'create' ? 'Add an Admin' : 'Edit Admin'}
                    </h2>

                    <p className="mt-1 text-[11px] leading-[1.4] text-[#4A4E54]">
                      {modalMode === 'create'
                        ? 'Create a new editorial team member.'
                        : 'Update this admin account.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Close">
                    <X className="size-3.5" />
                  </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="team-name" className="text-xs">
                      Name
                    </Label>

                    <Input
                      id="team-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter admin name"
                      disabled={saving}
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="team-email" className="text-xs">
                      Email
                    </Label>

                    <Input
                      id="team-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter admin email"
                      disabled={saving}
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="team-password" className="text-xs">
                      Password
                      {modalMode === 'edit' && (
                        <span className="ml-1 text-[10px] font-normal text-slate-400">
                          (leave blank to keep current)
                        </span>
                      )}
                    </Label>

                    <Input
                      id="team-password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={
                        modalMode === 'create' ? 'Enter password' : 'Enter new password'
                      }
                      disabled={saving}
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>

                  {/* FORM ACTIONS */}
                  <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      disabled={saving}
                      className="h-9 rounded-xl px-4 text-xs">
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={saving}
                      className="h-9 rounded-xl bg-[#2168CD] px-5 text-xs hover:bg-[#1B58B0]">
                      {saving && <LoaderCircle className="mr-2 size-3.5 animate-spin" />}

                      {saving
                        ? 'Saving...'
                        : modalMode === 'create'
                          ? 'Create Admin'
                          : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
