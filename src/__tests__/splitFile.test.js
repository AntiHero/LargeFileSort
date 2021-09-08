const fs = require('fs');

const splitFile = require('../splitFile');

jest.mock('fs');
jest.mock('fs/promises');

it('should be a function', () => {
  expect(splitFile).toBeInstanceOf(Function);
});

describe('check functionality',() => {
  it('should throw an error if arg types are invalid', async () => {
    try {
      await splitFile(4);
    } catch (e) {
      expect(e.message).toMatch('Invalid');
    }

    try {
      await splitFile('.', '.');
    } catch (e) {
      expect(e.message).toMatch('Invalid');
    }
  });

  it('should not throw an error if file exists', () => {
    expect(() => splitFile('./testFile.txt')).not.toThrowError(/File|exists/);
  });
  
  it('should create splitted files', () => {
    splitFile('./testFile.txt', 2);

    const names = ['chunk1.txt', 'chunk2.txt'];

    names.forEach((name) => {
      expect(fs.existsSync(`./${name}`)).toBeTruthy();
    })
  });
});
