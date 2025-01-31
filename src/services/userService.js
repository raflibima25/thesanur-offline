import { apiClient } from "./apiClient";

export const getUser = async (id) => {
  return apiClient(`/api/users/${id}`);
};
