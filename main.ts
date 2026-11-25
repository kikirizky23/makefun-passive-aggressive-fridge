// Notes From a Passive-Aggressive Fridge — one note from a smart
// fridge that has had enough of its owner's door-staring habit.
//
// The joke runs in three beats. First the relatable ritual: the owner
// opens the door, stares, closes it, opens it again, taking nothing.
// Then the fridge pulls rank with its own sensor log — fourteen visits
// today, zero decisions made — the smug appliance keeping receipts.
// Then the sting lands somewhere nobody expects: it is not just the
// fridge keeping score any more, the cheese has joined in. The grudge
// stays small and domestic (indecision at the door, nothing bigger),
// the detail stays concrete (the door, the log, the cheese), and the
// note never explains itself. It reads like something the fridge
// actually left on its door screen.
//
// The program writes exactly that one line to entry.txt and exits.
// No arguments, no input, no network, no clock, no dice — running it
// twice gives the same bytes twice. Node standard library only.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const NOTE =
  'You opened the door, stared, closed it, opened it again. I have logged 14 visits today and zero decisions. The cheese is judging you too.';

// The gate accepts a single line of 1 to 200 characters.
const LIMIT = 200;
const FILE = 'entry.txt';

function countChars(text: string): number {
  // Code points, not UTF-16 units: a character outside the basic
  // multilingual plane is one character to the gate, not two.
  return [...text].length;
}

function whatsWrongWith(text: string): string | null {
  if (countChars(text) === 0) return 'the note is empty';
  if (countChars(text) > LIMIT) {
    return `the note is ${countChars(text)} characters, past the ${LIMIT} limit`;
  }
  if (text.includes('\n') || text.includes('\r')) {
    return 'the note has to be one line, with no line break inside it';
  }
  if (text.trim() !== text) {
    return 'the note must not begin or end with a blank space';
  }
  if (/^\s*$/.test(text)) return 'the note cannot be only blank space';
  return null;
}

function whereToWrite(): string {
  // The harness tells the program where its output goes; run by hand,
  // it writes under /output like the grader expects.
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv !== undefined && fromEnv !== '' ? fromEnv : '/output';
}

function run(): void {
  const fault = whatsWrongWith(NOTE);
  if (fault !== null) {
    process.stderr.write(`fridge-note: ${fault}\n`);
    process.exit(1);
  }
  const folder = whereToWrite();
  if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
  const path = join(folder, FILE);
  writeFileSync(path, NOTE, 'utf-8');
  const written = readFileSync(path, 'utf-8');
  if (written !== NOTE) {
    process.stderr.write('fridge-note: the file on disk is not the note\n');
    process.exit(1);
  }
  const hash = createHash('sha256').update(written, 'utf-8').digest('hex');
  process.stdout.write(
    `fridge-note: wrote ${path} (${countChars(NOTE)} characters, sha256 ${hash})\n`,
  );
}

run();
