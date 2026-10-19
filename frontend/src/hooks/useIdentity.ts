import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { generateGuestIdentity, getStoredIdentityId, setStoredIdentityId } from "@/lib/identity";
import type { DemoUser } from "@/types/user";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

async function fetchUsers(): Promise<DemoUser[]> {
  const { data } = await api.get<ApiSuccess<DemoUser[]>>("/users");
  return data.data;
}

async function createUserRequest(input: { name: string; email: string }): Promise<DemoUser> {
  const { data } = await api.post<ApiSuccess<DemoUser>>("/users", input);
  return data.data;
}

/**
 * There's no login/auth in this app yet. This hook stands in for "who is
 * acting right now": it persists a chosen user id in localStorage and
 * auto-creates one demo user on first visit so every verify/report/book/
 * submit call has a real `userId` to send. Switching identity (see
 * IdentitySwitcher) is how a single person can demo "another user
 * verifies it" against the real backend/database.
 */
export function useIdentity() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(() => getStoredIdentityId());

  const usersQuery = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const createMutation = useMutation({
    mutationFn: createUserRequest,
    onSuccess: (user) => {
      queryClient.setQueryData<DemoUser[]>(["users"], (prev) => (prev ? [...prev, user] : [user]));
      setStoredIdentityId(user.id);
      setActiveId(user.id);
    },
  });

  // Bootstrap: once we know the real user list, make sure `activeId`
  // actually points at someone. If not (first visit, or the stored id
  // no longer exists), create a fresh guest identity automatically.
  useEffect(() => {
    if (!usersQuery.data) return;
    const stillExists = activeId && usersQuery.data.some((u) => u.id === activeId);
    if (stillExists) return;
    if (createMutation.isPending) return;

    createMutation.mutate(generateGuestIdentity());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersQuery.data, activeId]);

  const activeUser = useMemo(
    () => usersQuery.data?.find((u) => u.id === activeId) ?? null,
    [usersQuery.data, activeId]
  );

  function switchTo(id: string) {
    setStoredIdentityId(id);
    setActiveId(id);
  }

  function createNewIdentity() {
    createMutation.mutate(generateGuestIdentity());
  }

  return {
    activeUser,
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading || (!activeUser && createMutation.isPending),
    switchTo,
    createNewIdentity,
  };
}
