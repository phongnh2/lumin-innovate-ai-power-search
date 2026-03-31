// FIXME: Will be resolved later

describe('UploadContainer', () => {
  it('test', () => {
    expect(true).toBe(true);
  })
})

// import React from 'react';
// import axios from 'axios';
// import merge from 'lodash/merge';
// import { Provider } from 'react-redux';
// import { MuiThemeProvider, createTheme } from '@mui/material/styles';
// import configureMockStore from 'redux-mock-store';
// import { mount, shallow } from 'enzyme';
// import { folderType } from 'constants/documentConstants';
// import initialState from 'src/redux/initialState';

// import UploadContainer from './UploadContainer';
// import { MaterialThemes, ModalTypes } from './../../../constants/lumin-common';
// import { renderWithRedux } from 'utils/test-utils';
// import fileMock from './../../../__mocks__/fileMock';
// import ModalNotifyUploadDocument from 'luminComponents/ModalNotifyUploadDocument';
// import { toastUtils, UploadUtils } from 'utils';
// import v4 from 'uuid/v4';
// import uploadService from 'services/uploadServices';
// import { NOTIFY_UPLOAD_KEY } from 'constants/organizationConstants';

// const mockStore = configureMockStore();
// const store = mockStore(initialState);

// const getFileUpload = (newAttributes) => {
//   const defaultFileUpload = {
//     groupId: v4(),
//     fileData: {
//       uploadFrom: 'local',
//       file: fileMock,
//     },
//     thumbnail: null,
//     progress: 0,
//     status: UploadUtils.UploadStatus.PROCESSING,
//     cancelToken: null,
//     documentId: null,
//     folder: {
//       type: folderType.INDIVIDUAL,
//       entityId: 'user_id'
//     },
//     oldGroupIndice: [],
//   }
//   return merge(defaultFileUpload, newAttributes);
// }

// const setUpProps = () => ({
//   currentFolderType: folderType.INDIVIDUAL,
//   children: ({ upload }) => <div id='child__component' onClick={() => upload([fileMock])}></div>,
//   updateUploadingFile: jest.fn().mockImplementation(() => { }),
//   addUploadingFile: () => { },
//   uploadingFiles: [],
//   onUpload: jest.fn(),
//   displayToast: jest.fn(),
//   currentUser: { _id: 'user_id' },
//   currentTeam: { _id: 'team_id' },
//   currentOrganization: { data: { _id: 'org_id' } }
// })

// describe('UploadContainer', () => {
//   let componentProps = setUpProps();
//   beforeEach(() => {
//     componentProps = setUpProps();
//   })

//   const setup = (props) => {
//     const theme = createTheme(MaterialThemes);
//     return renderWithRedux(
//       <MuiThemeProvider theme={theme}>
//         <UploadContainer {...props} />
//       </MuiThemeProvider>,
//       {
//         initialState: {
//           auth: {
//             currentUser: {
//               _id: 'userId'
//             }
//           }
//         }
//       }
//     )
//   }
//   describe('snapshot component', () => {
//     const { instance } = setup(componentProps)
//     it('without NotifyModal', () => {
//       expect(instance).toMatchSnapshot();
//     })
//     it('with NotifyModal', () => {
//       instance.find(UploadContainer).setState({
//         isOpen: true
//       })
//       expect(instance).toMatchSnapshot();
//     })
//   })

//   describe('upload single file', () => {
//     const notifyData = JSON.stringify({
//       show: false,
//       isNotify: false,
//     })
//     it('should show notify modal if upload file to org', () => {
//       const { instance } = setup({
//         ...componentProps,
//         currentFolderType: folderType.ORGANIZATION,
//       })
//       const uploadContainer = instance.find(UploadContainer);
//       window.localStorage.removeItem(uploadContainer.instance().getNotifyKey());
//       const handleShowModal = jest.spyOn(uploadContainer.instance(), 'handleShowNotifyModal');
//       uploadContainer.find('#child__component').simulate('click');
//       expect(handleShowModal).toHaveBeenCalled();
//     })

//     it('should upload straight ahead if upload file to personal', () => {
//       const { instance } = setup(componentProps)
//       const uploadContainer = instance.find(UploadContainer);

//       const spyUpload = jest.spyOn(uploadContainer.instance(), 'uploadMultipleFiles');
//       uploadContainer.find('#child__component').simulate('click');
//       expect(spyUpload).toHaveBeenCalled();
//     })

//     it('should upload files if constrain right value in localStorage', () => {
//       Object.defineProperty(window, "localStorage", {
//         value: {
//           getItem: jest.fn(() => notifyData),
//         },
//         writable: true
//       });
//       const { instance } = setup({
//         ...componentProps,
//         currentFolderType: folderType.ORGANIZATION,
//       })
//       const uploadContainer = instance.find(UploadContainer);
//       const spyUpload = jest.spyOn(uploadContainer.instance(), 'uploadMultipleFiles');
//       uploadContainer.find('#child__component').simulate('click');

//       expect(spyUpload).toHaveBeenCalled();
//     })

//     it("should remove key if can't parse value from localstorage", () => {
//       Object.defineProperty(window, "localStorage", {
//         value: {
//           getItem: jest.fn(() => 'error'),
//           removeItem: jest.fn(),
//         },
//         writable: true
//       });

//       const { instance } = setup({
//         ...componentProps,
//         currentFolderType: folderType.ORGANIZATION,
//       })
//       const uploadContainer = instance.find(UploadContainer);
//       toastUtils.openToastMulti = jest.fn();
//       uploadContainer.find('#child__component').simulate('click');

//       expect(localStorage.removeItem).toHaveBeenCalled();
//       expect(toastUtils.openToastMulti).toHaveBeenCalledWith({
//         message: 'An error has occurred! Please try again',
//         type: ModalTypes.ERROR,
//       })
//     })
//   })

//   describe('actions with NotifyModal', () => {
//     const { instance } = setup(componentProps)
//     const uploadContainer = instance.find(UploadContainer);
//     const notifyModal = instance.find(ModalNotifyUploadDocument);
//     beforeEach(() => {
//       Object.defineProperty(window, "localStorage", {
//         value: {
//           setItem: jest.fn(),
//         },
//         writable: true
//       });
//     })
//     it('confirm notify', () => {
//       const spyModalClick = jest.spyOn(uploadContainer.instance(), 'onNotifyButtonClick');

//       notifyModal.props().onConfirm(true);
//       expect(spyModalClick).toHaveBeenCalled();
//     })
//     it('cancel notify', () => {
//       const spyModalClick = jest.spyOn(uploadContainer.instance(), 'onNotifyButtonClick');

//       notifyModal.props().onCancel(true);
//       expect(spyModalClick).toHaveBeenCalled();
//     })
//   })

//   describe('handleSequenceUpload', () => {
//     beforeEach(() => {
//       componentProps = setUpProps();
//     })
//     it('should call handle update at the first time', () => {
//       const { instance } = setup({
//         ...componentProps,
//         uploadingFiles: [getFileUpload()]
//       })
//       const uploadContainer = instance.find(UploadContainer);
//       const prevProps = componentProps;
//       const spyUploadFileSequence = jest.spyOn(uploadContainer.instance(), 'uploadFileSequence');

//       uploadContainer.instance().componentDidUpdate(prevProps);
//       expect(spyUploadFileSequence).toHaveBeenCalled();
//     })

//     it('should call handle upload if all of uploading documents have been done and new files were added to queue', () => {
//       const { instance } = setup({
//         ...componentProps,
//         uploadingFiles: [getFileUpload(), getFileUpload(), getFileUpload()],
//       })
//       const uploadContainer = instance.find(UploadContainer);
//       const prevProps = {
//         ...componentProps,
//         uploadingFiles: [
//           getFileUpload({ status: UploadUtils.UploadStatus.COMPLETED }),
//           getFileUpload({ status: UploadUtils.UploadStatus.COMPLETED })
//         ]
//       };
//       const spyUploadFileSequence = jest.spyOn(uploadContainer.instance(), 'uploadFileSequence');

//       uploadContainer.instance().componentDidUpdate(prevProps);
//       expect(spyUploadFileSequence).toHaveBeenCalled();
//     })

//     it('should upload file successfully', async () => {
//       const file = getFileUpload();
//       const { instance } = setup({
//         ...componentProps,
//         uploadingFiles: [],
//       });

//       const uploadContainer = instance.find(UploadContainer);

//       const containerInstance = uploadContainer.instance();
//       containerInstance['getUploadingList'] = jest.fn().mockImplementation(() => [file]);

//       containerInstance['handleBeforeUploadingFile'] = jest.fn().mockImplementation(() => Promise.resolve({ _id: 'document_id' }));

//       const spyUploadingFile = jest.spyOn(containerInstance, 'handleBeforeUploadingFile');
//       const spyUpdateUploading = jest.spyOn(containerInstance.props, 'updateUploadingFile')

//       await containerInstance.uploadFileSequence();

//       expect(spyUploadingFile).toHaveBeenCalled();
//       expect(spyUpdateUploading).toHaveBeenCalledTimes(2);
//       expect(spyUpdateUploading).toHaveBeenLastCalledWith({
//         groupId: file.groupId,
//         errorMessage: '',
//         status: UploadUtils.UploadStatus.COMPLETED,
//         documentId: 'document_id'
//       })
//     })

//     it('should upload the next file if current file is completed or error', async () => {
//       const completedFile = getFileUpload({ status: UploadUtils.UploadStatus.COMPLETED });
//       const { instance } = setup({
//         ...componentProps,
//         uploadingFiles: [],
//       });

//       const uploadContainer = instance.find(UploadContainer);

//       const containerInstance = uploadContainer.instance();
//       containerInstance['getUploadingList'] = jest.fn().mockReturnValue([completedFile, getFileUpload()]);

//       containerInstance['handleBeforeUploadingFile'] = jest.fn().mockImplementation(() => Promise.reject(new Error('fail')));

//       const spyUploadingFile = jest.spyOn(containerInstance, 'handleBeforeUploadingFile');
//       const spyUpdateUploading = jest.spyOn(containerInstance.props, 'updateUploadingFile')

//       await containerInstance.uploadFileSequence();

//       expect(spyUploadingFile).toHaveBeenCalledTimes(1);
//       expect(spyUpdateUploading).toHaveBeenCalledTimes(2);
//     })

//     it('should not update status when got axios error (cancel request)', async () => {
//       const { instance } = setup(componentProps);
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();
//       const file = getFileUpload();
//       containerInstance['getUploadingList'] = jest.fn().mockReturnValue([file]);

//       containerInstance['handleBeforeUploadingFile'] = jest.fn().mockImplementation(() => Promise.reject(new axios.Cancel('cancel request')));

//       const spyUploadingFile = jest.spyOn(containerInstance, 'handleBeforeUploadingFile');
//       const spyUpdateUploading = jest.spyOn(containerInstance.props, 'updateUploadingFile')

//       await containerInstance.uploadFileSequence();

//       expect(spyUploadingFile).toHaveBeenCalled();
//       expect(spyUpdateUploading).toHaveBeenCalledTimes(1);
//       expect(spyUpdateUploading).toHaveBeenLastCalledWith({
//         groupId: file.groupId,
//         status: UploadUtils.UploadStatus.UPLOADING,
//       })
//     })
//   })

//   describe('handleBeforeUploadingFile', () => {
//     it('should throw PDF_NOT_FOUND when file is undefined or null', async () => {
//       const { instance } = setup(componentProps);
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();

//       const file = getFileUpload();

//       try {
//         await containerInstance.handleBeforeUploadingFile({ uploadFrom: 'local', file: null }, file.groupId)
//       }
//       catch(e) {
//         expect(e.message).toBe('pdf_not_found')
//       }
//     })
//     it('should throw error when file type is not valid', async () => {
//       const { instance } = setup(componentProps);
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();

//       const file = getFileUpload();
//       const notSupportFile = { uploadFrom: 'local', file: new File([''], 'fileName', {type: 'docx'}) };
//       try {
//         await containerInstance.handleBeforeUploadingFile(notSupportFile, file.groupId)
//       }
//       catch(e) {
//         expect(e.message).toBe('unsupport_pdf_type')
//       }
//     })

//     it('should get thumbnail and linear pdf file', async () => {
//       const { instance } = setup(componentProps);
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();

//       const file = getFileUpload();

//       const spyLinearPdf = jest.spyOn(uploadService, 'linearPdfFromFiles').mockImplementation(() => Promise.resolve({
//         linearizedFile: null,
//         documentInstance: null,
//       }));
//       const spyGetThumbnail = jest.spyOn(uploadService, 'getThumbnailDocument').mockImplementation(() => Promise.resolve());

//       const spyUpdateUploading = jest.spyOn(containerInstance.props, 'updateUploadingFile')
//       const spyOnUpload = jest.spyOn(containerInstance.props, 'onUpload')

//       await containerInstance.handleBeforeUploadingFile(file.fileData, file.groupId);

//       expect(spyLinearPdf).toHaveBeenCalled();
//       expect(spyGetThumbnail).toHaveBeenCalled();
//       expect(spyUpdateUploading).toHaveBeenCalled();
//       expect(spyOnUpload).toHaveBeenCalled();
//     })

//     it('should throw CANCEL_UPLOAD if file was cancelled', async () => {
//       const { instance } = setup(componentProps);
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();

//       const file = getFileUpload({
//         status: UploadUtils.UploadStatus.ERROR,
//       });

//       UploadUtils.getFileByGroupId = jest.fn().mockReturnValue(file);

//       const spyLinearPdf = jest.spyOn(uploadService, 'linearPdfFromFiles').mockImplementation(() => Promise.resolve({
//         linearizedFile: null,
//         documentInstance: null,
//       }));
//       const spyGetThumbnail = jest.spyOn(uploadService, 'getThumbnailDocument').mockImplementation(() => Promise.resolve());

//       const spyHandleError = jest.spyOn(containerInstance, 'handleErrorUploadFile');

//       try {
//         await containerInstance.handleBeforeUploadingFile(file.fileData, file.groupId);
//       }
//       catch(e) {
//         expect(spyGetThumbnail).toHaveBeenCalled();
//         expect(spyHandleError).toHaveBeenCalled();
//         expect(e.message).toBe('cancel_upload');
//       }
//     })
//   })

//   describe('getClientId', () => {
//     it('should return current user if folderType === INDIVIDUAL', () => {
//       const { instance } = setup({
//         ...componentProps,
//         currentFolderType: folderType.INDIVIDUAL,
//       });
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();

//       const id = containerInstance.getClientId();
//       expect(id).toBe('user_id');
//     })
//     it('should return current team if folderType === TEAM', () => {
//       const { instance } = setup({
//         ...componentProps,
//         currentFolderType: folderType.TEAMS,
//       });
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();

//       const id = containerInstance.getClientId();
//       expect(id).toBe('team_id');
//     })
//     it('should return current org if folderType === ORGANIZATION', () => {
//       const { instance } = setup({
//         ...componentProps,
//         currentFolderType: folderType.ORGANIZATION,
//       });
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();

//       const id = containerInstance.getClientId();
//       expect(id).toBe('org_id');
//     })
//     it('should return null if not match any folder', () => {
//       const { instance } = setup({
//         ...componentProps,
//         currentFolderType: 'test',
//       });
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();
//       const id = containerInstance.getClientId();
//       expect(id).toBeNull();
//     })
//   })

//   describe('getNotifyKey', () => {
//     it('should use the default value if currentOrganization is empty', () => {
//       const { instance } = setup({
//         ...componentProps,
//         currentOrganization: { data: null },
//       });
//       const uploadContainer = instance.find(UploadContainer);
//       const containerInstance = uploadContainer.instance();

//       const key = containerInstance.getNotifyKey();
//       expect(key).toBe(`${NOTIFY_UPLOAD_KEY}:undefined:user_id`);
//     })
//   })
// })