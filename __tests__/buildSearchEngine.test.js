import { test, expect } from '@jest/globals';
import buildSearchEngine from '../src/BuildSearchEngine.js';

test('Stage1:test1', () => {
  const doc1 = { id: 'doc1', text: "I can't shoot straight unless I've had a pint!" };
  const doc2 = { id: 'doc2', text: "Don't shoot shoot shoot that thing at me." };
  const doc3 = { id: 'doc3', text: "I'm your shooter." };
  const docs = [doc1, doc2, doc3];
  const searchEngine = buildSearchEngine(docs);

  expect(searchEngine.search('shoot')).toStrictEqual(['doc2', 'doc1']);
});

test('Stage2:test1', () => {
  const doc1 = { id: 'doc1', text: "I can't shoot straight unless I've had a pint!" };
  const docs = [doc1];
  const searchEngine = buildSearchEngine(docs);

  expect(searchEngine.search('pint!')).toStrictEqual(['doc1']);
});

test('Stage3:test1', () => {
  const doc1 = { id: 'doc1', text: "I can't shoot straight unless I've had a pint!" };
  const doc2 = { id: 'doc2', text: "Don't shoot shoot shoot that thing at me." };
  const doc3 = { id: 'doc3', text: "I'm your shooter." };
  const docs = [doc1, doc2, doc3];
  const searchEngine = buildSearchEngine(docs);

  expect(searchEngine.search('shoot')).toStrictEqual(['doc2', 'doc1']);
});

test('Stage4:test1', () => {
  const doc1 = { id: 'doc1', text: "I can't shoot straight unless I've had a pint!" };
  const doc2 = { id: 'doc2', text: "Don't shoot shoot shoot that thing at me." };
  const doc3 = { id: 'doc3', text: "I'm your shooter." };
  const docs = [doc1, doc2, doc3];
  const searchEngine = buildSearchEngine(docs);

  expect(searchEngine.search('shoot at me')).toStrictEqual(['doc2', 'doc1']);
});
