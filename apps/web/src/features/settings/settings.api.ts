import type { AuthUser } from "@codeforge/types";
import type { DeleteAccountInput, UpdateProfileInput } from "@codeforge/validators";
import { apiClient } from "../../lib/api-client";

export const settingsApi = {
  async updateProfile(input: UpdateProfileInput) {
    const { data } = await apiClient.patch<{ user: AuthUser }>("/users/me", input);
    return data.user;
  },

  async deleteAccount(input: DeleteAccountInput) {
    await apiClient.delete("/users/me", { data: input });
  },
};
