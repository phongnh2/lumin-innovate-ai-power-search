import SocketService from '../socketServices';

export class ConvertDocumentSocketService extends SocketService {
  convertToOfficeFile = (): {
    emitter: (data: { fileName: string }) => void;
    listener: (key: string, callback: (params: { preSignedUrl: string; errorMessage: string }) => void) => void;
    clean: (key: string) => void;
  } => ({
    emitter: (data) => {
      this.socket.emit(`conversion`, data);
    },
    listener: (key, callback) => {
      this.socket.on(`convertToOfficeFile-${key}`, callback);
    },
    clean: (key) => {
      this.socket.removeListener({ message: `convertToOfficeFile-${key}` });
    },
  });
}

const convertDocumentSocketService = new ConvertDocumentSocketService();

export default convertDocumentSocketService;
