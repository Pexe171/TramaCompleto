'use client';

import { createContext, useContext } from 'react';

const defaultSession = {
  status: 'loading',
  user: null,
  permissions: {
    canViewAdmin: false,
    canManageContent: false,
    canManageUsers: false,
    isPrimaryAdmin: false,
    isReadOnly: true,
  },
  primaryAdminEmail: null,
};

export const AdminSessionContext = createContext(defaultSession);

export const useAdminSession = () => useContext(AdminSessionContext);

export const getDefaultAdminSession = () => ({ ...defaultSession });
