import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { toast } from 'sonner';

export const USERS_QUERY_KEY = ['users'];

/**
 * Hook to fetch paginated users list with search & filters
 * @param {{ page?: number, limit?: number, search?: string, role?: string, status?: string }} params
 */
export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.list(params),
    placeholderData: (previousData) => previousData
  });
};

/**
 * Hook to fetch single user details
 * @param {string} userId
 */
export const useUser = (userId) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userService.getById(userId),
    enabled: Boolean(userId)
  });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => userService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success(res?.message || 'User created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create user';
      toast.error(message);
    }
  });
};

/**
 * Hook to update user profile/information
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      }
      toast.success(res?.message || 'User updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error(message);
    }
  });
};

/**
 * Hook to activate / deactivate a user
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => userService.updateStatus(id, status),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      }
      toast.success(res?.message || 'User status updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user status';
      toast.error(message);
    }
  });
};

/**
 * Hook to update user role
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }) => userService.updateRole(id, role),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      }
      toast.success(res?.message || 'User role updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user role';
      toast.error(message);
    }
  });
};

/**
 * Hook to update non-admin user permissions
 */
export const useUpdateUserPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permissions }) => userService.updatePermissions(id, permissions),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      }
      toast.success(res?.message || 'User permissions updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user permissions';
      toast.error(message);
    }
  });
};

/**
 * Hook to reset a user's password
 */
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newPassword }) => userService.resetPassword(id, newPassword),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      }
      toast.success(res?.message || 'Password reset successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    }
  });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => userService.delete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success(res?.message || 'User deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    }
  });
};
