// utils/executeDocker.js

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export async function execute(code, language, stdin) {
  // Generate a unique execution ID
  const executionId = uuidv4();
  const codeDir = path.join('/tmp', 'user_code', executionId);
  await fs.promises.mkdir(codeDir, { recursive: true });

  // Language configurations
  const languageConfig = {
    python: {
      image: 'python:3.10',
      extension: '.py',
      cmd: (file) => `python3 ${file}`,
    },
    javascript: {
      image: 'node:20',
      extension: '.js',
      cmd: (file) => `node ${file}`,
    },
    java: {
      image: 'openjdk:21',
      extension: '.java',
      compile: (file) => `javac ${file}`,
      cmd: (className) => `java ${className}`,
    },
    c: {
      image: 'gcc:latest',
      extension: '.c',
      compile: (file) => `gcc ${file} -o output`,
      cmd: () => `./output`,
    },
    cpp: {
      image: 'gcc:latest',
      extension: '.cpp',
      compile: (file) => `g++ ${file} -o output`,
      cmd: () => `./output`,
    },
    ruby: {
      image: 'ruby:3.2',
      extension: '.rb',
      cmd: (file) => `ruby ${file}`,
    },
    go: {
      image: 'golang:1.20',
      extension: '.go',
      cmd: (file) => `go run ${file}`,
    },
    php: {
      image: 'php:8.2-cli',
      extension: '.php',
      cmd: (file) => `php ${file}`,
    },
    swift: {
      image: 'swift:5.7',
      extension: '.swift',
      compile: (file) => `swiftc ${file} -o output`,
      cmd: () => `./output`,
    },
    rust: {
      image: 'rust:1.70',
      extension: '.rs',
      compile: (file) => `rustc ${file} -o output`,
      cmd: () => `./output`,
    },
    perl: {
      image: 'perl:5.36',
      extension: '.pl',
      cmd: (file) => `perl ${file}`,
    },
    // For TypeScript, Kotlin, and Scala
    // custom Docker images may be required
  };

  const config = languageConfig[language];
  if (!config) {
    throw new Error('Language not supported');
  }

  try {
    // Write code to file
    const codeFile = `Main${config.extension}`;
    const codePath = path.join(codeDir, codeFile);
    await fs.promises.writeFile(codePath, code);

    // Prepare Docker run command
    let dockerCmd = '';
    let compileCmd = config.compile ? config.compile(codeFile) + ' && ' : '';
    let runCmd;

    if (language === 'java') {
      // Adjust for Java class name
      const classNameMatch = code.match(/public\s+class\s+(\w+)/);
      if (!classNameMatch) {
        throw new Error('Public class not found in Java code');
      }
      const className = classNameMatch[1];
      runCmd = config.cmd(className);
    } else if (language === 'c' || language === 'cpp') {
      // Run compiled executable
      runCmd = config.cmd();
    } else {
      // Use full file name for interpreted languages
      runCmd = config.cmd(codeFile);
    }

    // Handle stdin
    if (stdin) {
      runCmd = `echo "${stdin}" | ` + runCmd;
    }

    // Build the full Docker command
    dockerCmd = `docker run --rm --network none \
      -v "${codeDir}":/usr/src/app \
      -w /usr/src/app \
      ${config.image} \
      /bin/sh -c "timeout 10s ${compileCmd}${runCmd}"`;
    // console.log(dockerCmd);

    // Execute the command
    const { stdout, stderr } = await execAsync(dockerCmd);

    // Return combined output
    return stdout + stderr;
  } catch (error) {
    throw new Error(error.stderr || error.message);
  } finally {
    // Clean up the temporary directory
    await fs.promises.rm(codeDir, { recursive: true, force: true });
  }
}