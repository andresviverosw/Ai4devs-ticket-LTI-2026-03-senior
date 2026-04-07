import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { candidateCreateSchema } from '../validation/candidate.schemas';
import * as candidateService from '../services/candidate.service';
import { ensureUploadDirs } from '../middlewares/upload.middleware';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createCandidate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = candidateCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        error: true,
        message: parsed.error.errors[0]?.message ?? 'Validation failed',
      });
      return;
    }

    const created = await candidateService.createCandidateWithRelations(
      parsed.data,
    );
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
}

export async function autocomplete(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const field = String(req.query.field ?? '');
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (field !== 'education' && field !== 'company') {
      res.status(422).json({
        error: true,
        message: 'Query "field" must be "education" or "company".',
      });
      return;
    }

    if (q.length < 1) {
      res.json({ suggestions: [] });
      return;
    }

    const suggestions =
      field === 'education'
        ? await candidateService.autocompleteInstitutions(q)
        : await candidateService.autocompleteCompanies(q);

    res.json({ suggestions });
  } catch (e) {
    next(e);
  }
}

export async function uploadCv(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(id)) {
      res.status(422).json({ error: true, message: 'Invalid candidate id.' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: true, message: 'File is required (field name: file).' });
      return;
    }

    ensureUploadDirs();

    const candidate = await candidateService.findCandidateById(id);
    if (!candidate) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(404).json({ error: true, message: 'Candidate not found.' });
      return;
    }

    const relativePath = path
      .relative(process.cwd(), file.path)
      .replace(/\\/g, '/');

    if (candidate.cvFilePath) {
      const oldAbs = path.isAbsolute(candidate.cvFilePath)
        ? candidate.cvFilePath
        : path.join(process.cwd(), candidate.cvFilePath);
      if (fs.existsSync(oldAbs)) {
        try {
          fs.unlinkSync(oldAbs);
        } catch {
          /* ignore */
        }
      }
    }

    await candidateService.setCandidateCvPath(id, relativePath);

    res.status(200).json({
      error: false,
      message: 'CV uploaded successfully.',
      cvUploaded: true,
    });
  } catch (e) {
    next(e);
  }
}
