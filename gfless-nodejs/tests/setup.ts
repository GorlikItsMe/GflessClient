import * as fs from 'fs';
import * as path from 'path';

// Setup test environment
beforeAll(() => {
  // Create test directory if it doesn't exist
  const testDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
});

afterAll(() => {
  // Clean up test files
  const testDir = path.join(__dirname, 'temp');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});

// Increase timeout for native addon operations
jest.setTimeout(30000);