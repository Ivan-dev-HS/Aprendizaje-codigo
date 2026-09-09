import type { Request, Response } from "express";
import {
  gitCommandSchema,
  runJsSchema,
  runSqlSchema,
  savePlaygroundSnapshotSchema,
  terminalCommandSchema,
} from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { labsService } from "./labs.service.js";

function userId(req: Request): string {
  if (!req.user) throw HttpError.unauthorized();
  return req.user.sub;
}

export const labsController = {
  async runJs(req: Request, res: Response) {
    const { code } = runJsSchema.parse(req.body);
    const result = await labsService.runJs(code);
    res.status(200).json(result);
  },

  async runSql(req: Request, res: Response) {
    const { sql } = runSqlSchema.parse(req.body);
    const result = await labsService.runSql(sql);
    res.status(200).json(result);
  },

  async listSqlDatasets(_req: Request, res: Response) {
    const datasets = await labsService.listSqlDatasets();
    res.status(200).json({ items: datasets });
  },

  async listPlaygroundSnapshots(req: Request, res: Response) {
    const items = await labsService.listPlaygroundSnapshots(userId(req));
    res.status(200).json({ items });
  },

  async getPlaygroundSnapshot(req: Request, res: Response) {
    const snapshot = await labsService.getPlaygroundSnapshot(
      userId(req),
      req.params.id as string,
    );
    res.status(200).json({ snapshot });
  },

  async createPlaygroundSnapshot(req: Request, res: Response) {
    const input = savePlaygroundSnapshotSchema.parse(req.body);
    const snapshot = await labsService.savePlaygroundSnapshot(userId(req), input);
    res.status(201).json({ snapshot });
  },

  async updatePlaygroundSnapshot(req: Request, res: Response) {
    const input = savePlaygroundSnapshotSchema.parse(req.body);
    const snapshot = await labsService.savePlaygroundSnapshot(
      userId(req),
      input,
      req.params.id as string,
    );
    res.status(200).json({ snapshot });
  },

  async deletePlaygroundSnapshot(req: Request, res: Response) {
    await labsService.deletePlaygroundSnapshot(userId(req), req.params.id as string);
    res.status(204).send();
  },

  async getTerminalState(req: Request, res: Response) {
    const state = await labsService.getTerminalState(userId(req));
    res.status(200).json(state);
  },

  async runTerminalCommand(req: Request, res: Response) {
    const input = terminalCommandSchema.parse(req.body);
    const state = await labsService.runTerminalCommand(userId(req), input);
    res.status(200).json(state);
  },

  async getGitState(req: Request, res: Response) {
    const state = await labsService.getGitState(userId(req));
    res.status(200).json(state);
  },

  async runGitCommand(req: Request, res: Response) {
    const input = gitCommandSchema.parse(req.body);
    const state = await labsService.runGitCommand(userId(req), input);
    res.status(200).json(state);
  },
};
