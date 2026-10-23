import { execSync } from 'node:child_process';
import { Pool } from 'pg';
import 'dotenv/config';
import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Runs the suite against a dedicated `quiz_builder_test` database so the
 * developer's local `quiz_builder` data is never touched.
 */
function useTestDatabase(): string {
  const sourceUrl = process.env.DATABASE_URL;
  if (!sourceUrl) {
    throw new Error('DATABASE_URL must be set (add backend/.env before running tests)');
  }
  const testUrl = new URL(sourceUrl);
  testUrl.pathname = '/quiz_builder_test';
  process.env.DATABASE_URL = testUrl.toString();
  return testUrl.toString();
}

async function ensureTestDatabase(): Promise<void> {
  const adminUrl = new URL(useTestDatabase());
  adminUrl.pathname = '/postgres';
  const pool = new Pool({ connectionString: adminUrl.toString() });
  try {
    await pool.query('CREATE DATABASE quiz_builder_test');
  } catch (error) {
    const name = (error as { code?: string }).code;
    if (name !== '42P04') {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

let app: Express;
let prisma: PrismaClient;

beforeAll(async () => {
  await ensureTestDatabase();
  execSync('npx prisma migrate deploy', {
    cwd: process.cwd(),
    stdio: 'ignore',
  });
  ({ prisma } = await import('../src/config/prisma'));
  const { createApp } = await import('../src/app');
  app = createApp();
  await prisma.quiz.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

let quizCounter = 0;
function uniqueTitle(): string {
  quizCounter += 1;
  return `Test quiz ${Date.now()}-${quizCounter}`;
}

describe('Quiz API', () => {
  it('responds to the health check', async () => {
    const response = await request(app).get('/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('creates and reads a quiz with all question types', async () => {
    const payload = {
      title: uniqueTitle(),
      questions: [
        { type: 'boolean', text: 'Question one?', correctAnswer: 'true' },
        { type: 'boolean', text: 'Question two?', correctAnswer: false },
        { type: 'input', text: 'Question three?', correctAnswer: 'Tokyo' },
        {
          type: 'checkbox',
          text: 'Question four?',
          options: ['one', 'two', 'three'],
          correctAnswers: ['one', 'three'],
        },
      ],
    };

    const created = await request(app).post('/quizzes').send(payload).expect(201);

    expect(created.body.id).toBeDefined();
    expect(created.body.title).toBe(payload.title);
    expect(created.body.questions).toHaveLength(4);

    const detail = await request(app).get(`/quizzes/${created.body.id}`).expect(200);

    expect(detail.body.questions[0]).toMatchObject({
      type: 'boolean',
      correctAnswer: true,
    });
    expect(detail.body.questions[1]).toMatchObject({
      type: 'boolean',
      correctAnswer: false,
    });
    expect(detail.body.questions[2]).toMatchObject({
      type: 'input',
      correctAnswer: 'Tokyo',
    });
    expect(detail.body.questions[3]).toMatchObject({
      type: 'checkbox',
      options: ['one', 'two', 'three'],
      correctAnswers: ['one', 'three'],
    });

    await request(app).delete(`/quizzes/${created.body.id}`).expect(204);
  });

  it('lists quizzes and includes a newly created one', async () => {
    const created = await request(app)
      .post('/quizzes')
      .send({
        title: uniqueTitle(),
        questions: [{ type: 'input', text: 'Only question?', correctAnswer: 'yes' }],
      })
      .expect(201);

    const list = await request(app).get('/quizzes').expect(200);

    const match = list.body.find((quiz: { id: string }) => quiz.id === created.body.id);
    expect(match).toMatchObject({ title: created.body.title, questionCount: 1 });

    await request(app).delete(`/quizzes/${created.body.id}`).expect(204);
  });

  it('rejects a quiz with a missing title', async () => {
    const response = await request(app)
      .post('/quizzes')
      .send({
        title: '   ',
        questions: [{ type: 'input', text: 'Question?', correctAnswer: 'yes' }],
      })
      .expect(400);

    expect(response.body.error).toBe('Validation failed');
    const fields = response.body.issues.map((issue: { field: string }) => issue.field);
    expect(fields).toContain('title');
  });

  it('rejects a quiz without questions', async () => {
    const response = await request(app)
      .post('/quizzes')
      .send({ title: uniqueTitle(), questions: [] })
      .expect(400);

    const fields = response.body.issues.map((issue: { field: string }) => issue.field);
    expect(fields).toContain('questions');
  });

  it('rejects checkbox answers that are not part of the options', async () => {
    const response = await request(app)
      .post('/quizzes')
      .send({
        title: uniqueTitle(),
        questions: [
          {
            type: 'checkbox',
            text: 'Pick one?',
            options: ['a', 'b'],
            correctAnswers: ['a', 'nope'],
          },
        ],
      })
      .expect(400);

    expect(response.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'questions.0.correctAnswers',
        }),
      ]),
    );
  });

  it('rejects a checkbox question with duplicates and empty options', async () => {
    const response = await request(app)
      .post('/quizzes')
      .send({
        title: uniqueTitle(),
        questions: [
          {
            type: 'checkbox',
            text: 'Pick one?',
            options: ['a', 'a'],
            correctAnswers: ['a'],
          },
        ],
      })
      .expect(400);

    expect(response.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'questions.0.options',
          message: 'Options must be unique',
        }),
      ]),
    );
  });

  it('returns 404 for an unknown quiz id', async () => {
    await request(app).get('/quizzes/does-not-exist').expect(404);
  });

  it('deletes a quiz and returns 404 on repeated deletes', async () => {
    const created = await request(app)
      .post('/quizzes')
      .send({
        title: uniqueTitle(),
        questions: [{ type: 'input', text: 'Question?', correctAnswer: 'answer' }],
      })
      .expect(201);

    await request(app).delete(`/quizzes/${created.body.id}`).expect(204);
    await request(app).get(`/quizzes/${created.body.id}`).expect(404);
    await request(app).delete(`/quizzes/${created.body.id}`).expect(404);
  });

  it('returns 404 for unknown routes', async () => {
    await request(app).get('/definitely/not/here').expect(404);
  });
});
