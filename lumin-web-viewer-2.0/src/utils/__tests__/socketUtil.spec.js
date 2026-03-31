import socketUtils from '../socketUtil';
jest.mock('../../socket');
import { socket } from '../../socket';

describe('socketUtils', () => {
  describe('socketEmitSendEmailComment', () => {
    it('should trigger socket emit', () => {
      const spy = jest.fn();
      socket.emit = spy;
      socketUtils.socketEmitSendEmailComment();
      expect(spy).toHaveBeenCalled();
    });
  });
  describe('socketEmitSendEmailMention', () => {
    it('should trigger socket emit', () => {
      const spy = jest.fn();
      socket.emit = spy;
      socketUtils.socketEmitSendEmailMention();
      expect(spy).toHaveBeenCalled();
    });
  });
  describe('socketEmitSendEmailReply', () => {
    it('should trigger socket emit', () => {
      const spy = jest.fn();
      socket.emit = spy;
      socketUtils.socketEmitSendEmailReply();
      expect(spy).toHaveBeenCalled();
    });
  });
});
