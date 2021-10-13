import { register } from 'ts-node';
import testTSConfig from './test/tsconfig.json';

register({
  files: true,
  transpileOnly: true,
  project: './test/tsconfig.json'
});