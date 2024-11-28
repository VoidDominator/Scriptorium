// utils/executeDocker.ts

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

interface LanguageConfig {
  image: string;
  extension: string;
  cmd: (file: string) => string;
  compile?: (file: string) => string;
}

type SupportedLanguage =
  | 'python'
  | 'javascript'
  | 'java'
  | 'c'
  | 'cpp'
  | 'ruby'
  | 'go'
  | 'php'
  | 'swift'
  | 'rust'
  | 'perl';

const languageConfig: Record<SupportedLanguage, LanguageConfig> = {
  python: {
    image: 'python:3.10',
    extension: '.py',
    cmd: (file: string) => `python3 ${file}`,
  },
  javascript: {
    image: 'node:20',
    extension: '.js',
    cmd: (file: string) => `node ${file}`,
  },
  java: {
    image: 'openjdk:21',
    extension: '.java',
    compile: (file: string) => `javac ${file}`,
    cmd: (className: string) => `java ${className}`,
  },
  c: {
    image: 'gcc:latest',
    extension: '.c',
    compile: (file: string) => `gcc ${file} -o output`,
    cmd: () => './output',
  },
  cpp: {
    image: 'gcc:latest',
    extension: '.cpp',
    compile: (file: string) => `g++ ${file} -o output`,
    cmd: () => './output',
  },
  ruby: {
    image: 'ruby:3.2',
    extension: '.rb',
    cmd: (file: string) => `ruby ${file}`,
  },
  go: {
    image: 'golang:1.20',
    extension: '.go',
    cmd: (file: string) => `go run ${file}`,
  },
  php: {
    image: 'php:8.2-cli',
    extension: '.php',
    cmd: (file: string) => `php ${file}`,
  },
  swift: {
    image: 'swift:5.7',
    extension: '.swift',
    compile: (file: string) => `swiftc ${file} -o output`,
    cmd: () => './output',
  },
  rust: {
    image: 'rust:1.70',
    extension: '.rs',
    compile: (file: string) => `rustc ${file} -o output`,
    cmd: () => './output',
  },
  perl: {
    image: 'perl:5.36',
    extension: '.pl',
    cmd: (file: string) => `perl ${file}`,
  },
};

export async function execute(
  code: string,
  language: SupportedLanguage,
  stdin?: string
): Promise<string> {
  const executionId: string = uuidv4();
  const codeDir: string = path.join('/tmp', 'user_code', executionId);
  await fs.promises.mkdir(codeDir, { recursive: true });

  const config = languageConfig[language];
  if (!config) {
    throw new Error('Language not supported');
  }

  try {
    const codeFile = `Main${config.extension}`;
    const codePath = path.join(codeDir, codeFile);
    await fs.promises.writeFile(codePath, code);

    let dockerCmd = '';
    let compileCmd = config.compile ? config.compile(codeFile) + ' && ' : '';
    let runCmd: string;

    if (language === 'java') {
      const classNameMatch = code.match(/public\s+class\s+(\w+)/);
      if (!classNameMatch) {
        throw new Error('Public class not found in Java code');
      }
      const className = classNameMatch[1];
      runCmd = config.cmd(className);
    } else if (language === 'c' || language === 'cpp') {
      runCmd = config.cmd('');
    } else {
      runCmd = config.cmd(codeFile);
    }

    if (stdin) {
      runCmd = `echo "${stdin}" | ${runCmd}`;
    }

    dockerCmd = `docker run --rm --network none \
      -v "${codeDir}":/usr/src/app \
      -w /usr/src/app \
      ${config.image} \
      /bin/sh -c "timeout 10s ${compileCmd}${runCmd}"`;

    const { stdout, stderr } = await execAsync(dockerCmd);
    return stdout + stderr;
  } catch (error: any) {
    throw new Error(error.stderr || error.message);
  } finally {
    await fs.promises.rm(codeDir, { recursive: true, force: true });
  }
}