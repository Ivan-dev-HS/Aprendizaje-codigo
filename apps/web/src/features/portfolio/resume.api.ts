import type {
  ResumeEducationItem,
  ResumeExperienceItem,
  ResumeLinkItem,
  ResumeView,
} from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export interface UpdateResumeInput {
  summary?: string;
  experience?: ResumeExperienceItem[];
  education?: ResumeEducationItem[];
  links?: ResumeLinkItem[];
}

export const resumeApi = {
  async getMine() {
    const { data } = await apiClient.get<{ resume: ResumeView }>("/resume/me");
    return data.resume;
  },

  async updateMine(input: UpdateResumeInput) {
    const { data } = await apiClient.patch<{ resume: ResumeView }>("/resume/me", input);
    return data.resume;
  },
};
