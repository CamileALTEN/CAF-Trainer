import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileContextType {
  role: string;
  setRole: (role: string) => void;
}

const ProfileContext = createContext<ProfileContextType>(null!);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string>('caf');
  return <ProfileContext.Provider value={{ role, setRole }}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext);