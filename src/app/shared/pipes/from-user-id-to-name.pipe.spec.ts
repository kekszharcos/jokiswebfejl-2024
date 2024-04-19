import { FromUserIdToNamePipe } from './from-user-id-to-name.pipe';

describe('FromUserIdToNamePipe', () => {
  it('create an instance', () => {
    const pipe = new FromUserIdToNamePipe();
    expect(pipe).toBeTruthy();
  });
});
