export const getAdminUsers = (response) => {
  const payload = response?.data;
  const data = payload?.data;
  const candidates = [
    payload,
    data,
    data?.data,
    data?.users,
    data?.admins,
    payload?.users,
    payload?.admins,
  ];

  return candidates.find(Array.isArray) || [];
};

export const isActiveAdmin = (user) =>
  user?.deleted_at === null || user?.deleted_at === undefined;

export const isDeletedAdmin = (user) =>
  user?.deleted_at !== null && user?.deleted_at !== undefined;
