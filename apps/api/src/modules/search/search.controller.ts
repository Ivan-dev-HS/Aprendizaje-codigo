import type { Request, Response } from "express";
import { searchQuerySchema } from "@codeforge/validators";
import { globalSearch } from "./search.service.js";

export const searchController = {
  async search(req: Request, res: Response) {
    const { q } = searchQuerySchema.parse(req.query);
    const items = await globalSearch(q);
    res.status(200).json({ items });
  },
};
