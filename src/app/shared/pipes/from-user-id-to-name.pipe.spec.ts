import { FromUserIdToNamePipe } from './from-user-id-to-name.pipe';
import { UserService } from '../services/user.service';

describe('FromUserIdToNamePipe', () => {
  it('create an instance', () => {
    const mockUserService = jasmine.createSpyObj('UserService', ['someMethod']);
    const pipe = new FromUserIdToNamePipe(mockUserService as unknown as UserService);
    expect(pipe).toBeTruthy();
  });
});
