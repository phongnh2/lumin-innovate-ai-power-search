import core from 'core';

import logger from 'helpers/logger';

import { getTextPosition } from 'features/EditorChatBot/utils/getTextPosition';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { LOGGER } from 'constants/lumin-common';

import { hexToColor } from 'features/EditorChatBot/ai/tools/hexToColor';
import { addComments } from 'features/EditorChatBot/ai/tools/addComments';

jest.mock('core', () => ({
  getCurrentUser: jest.fn().mockReturnValue('test-user'),
  addAnnotations: jest.fn(),
  getAnnotationManager: jest.fn().mockReturnValue({
    drawAnnotationsFromList: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('features/EditorChatBot/utils/getTextPosition');

jest.mock('features/EditorChatBot/ai/tools/hexToColor');

const mockTextHighlightAnnotation = jest.fn();
const mockStickyAnnotation = jest.fn();
const mockColor = jest.fn();

beforeAll(() => {
  global.window = Object.create(window);
  global.window.Core = {
    Annotations: {
      TextHighlightAnnotation: mockTextHighlightAnnotation,
      StickyAnnotation: mockStickyAnnotation,
      Color: mockColor,
    },
    Tools: {
      TextAnnotationCreateTool: {
        AUTO_SET_TEXT: true,
      },
    },
  } as any;
});

describe('addComments', () => {
  const mockHighlightAnnotation = {
    StrokeColor: null as any,
    setContents: jest.fn(),
    setCustomData: jest.fn(),
  };

  const mockStickyAnnotationInstance = {
    StrokeColor: null as any,
    setContents: jest.fn(),
    setCustomData: jest.fn(),
  };

  const mockQuads = [
    [
      { x1: 100, y1: 200, x2: 150, y2: 200, x3: 150, y3: 190, x4: 100, y4: 190 },
      { x1: 150, y1: 200, x2: 200, y2: 200, x3: 200, y3: 190, x4: 150, y4: 190 },
    ],
  ];

  const mockTextPosition = new Map();
  mockTextPosition.set(1, {
    textToReplace: new Set(['test text']),
    position: mockQuads,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockTextHighlightAnnotation.mockReturnValue(mockHighlightAnnotation);
    mockStickyAnnotation.mockReturnValue(mockStickyAnnotationInstance);
    mockColor.mockReturnValue({ r: 3, g: 89, b: 112, a: 1 });
    
    (getTextPosition as jest.Mock).mockResolvedValue(mockTextPosition);
    (hexToColor as jest.Mock).mockReturnValue({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('should successfully add comment with highlight annotation', async () => {
    const params = {
      text: '  test text  ',
      page: 1,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    const result = await addComments(params);

    expect(getTextPosition).toHaveBeenCalledWith(1, 'test text');
    expect(mockTextHighlightAnnotation).toHaveBeenCalledWith({
      Quads: mockQuads[0],
      PageNumber: 1,
      Author: 'test-user',
    });

    expect(hexToColor).toHaveBeenCalledWith('#FF0000');
    expect(mockHighlightAnnotation.StrokeColor).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(mockHighlightAnnotation.setContents).toHaveBeenCalledWith('test text');
    expect(mockHighlightAnnotation.setCustomData).toHaveBeenCalledWith(
      CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key,
      'test text'
    );

    expect(result).toBe('Comment has been added successfully.');
  });

  it('should create sticky annotation with correct properties', async () => {
    const params = {
      text: 'test text',
      page: 1,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    await addComments(params);

    expect(mockStickyAnnotation).toHaveBeenCalledWith({
      PageNumber: 1,
      Author: 'test-user',
    });

    expect(mockStickyAnnotationInstance.setContents).toHaveBeenCalledWith('This is a test comment');
    expect(mockStickyAnnotationInstance.setCustomData).toHaveBeenCalledWith(
      CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key,
      'test text'
    );
  });

  it('should add annotations to core and draw them', async () => {
    const params = {
      text: 'test text',
      page: 1,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    await addComments(params);

    expect(core.addAnnotations).toHaveBeenCalledWith([
      mockHighlightAnnotation,
      mockStickyAnnotationInstance,
    ]);

    expect(core.getAnnotationManager().drawAnnotationsFromList).toHaveBeenCalledWith([
      mockHighlightAnnotation,
      mockStickyAnnotationInstance,
    ]);
  });

  it('should handle multiple quads', async () => {
    const multipleQuads = [
      [{ x1: 100, y1: 200, x2: 150, y2: 200, x3: 150, y3: 190, x4: 100, y4: 190 }],
      [{ x1: 200, y1: 300, x2: 250, y2: 300, x3: 250, y3: 290, x4: 200, y4: 290 }],
    ];

    const mockTextPositionMultiple = new Map();
    mockTextPositionMultiple.set(1, {
      textToReplace: new Set(['test text']),
      position: multipleQuads,
    });

    (getTextPosition as jest.Mock).mockResolvedValue(mockTextPositionMultiple);

    const params = {
      text: 'test text',
      page: 1,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    await addComments(params);

    expect(mockTextHighlightAnnotation).toHaveBeenCalledTimes(2);
    expect(mockStickyAnnotation).toHaveBeenCalledTimes(2);

    expect(core.addAnnotations).toHaveBeenCalledWith(expect.arrayContaining([
      mockHighlightAnnotation,
      mockStickyAnnotationInstance,
      mockHighlightAnnotation,
      mockStickyAnnotationInstance,
    ]));
  });

  it('should handle case when AUTO_SET_TEXT is false', async () => {
    global.window.Core.Tools.TextAnnotationCreateTool.AUTO_SET_TEXT = false;

    const params = {
      text: 'test text',
      page: 1,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    await addComments(params);

    expect(mockHighlightAnnotation.setContents).not.toHaveBeenCalled();

    global.window.Core.Tools.TextAnnotationCreateTool.AUTO_SET_TEXT = true;
  });

  it('should handle errors from getTextPosition', async () => {
    (getTextPosition as jest.Mock).mockRejectedValue(new Error('Text not found'));

    const params = {
      text: 'test text',
      page: 1,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    const result = await addComments(params);

    expect(logger.logError).toHaveBeenCalledWith({
      error: expect.any(Error),
      reason: LOGGER.Service.EDITOR_CHATBOT,
    });

    expect(result).toBe('Failed to add comment. Please try again.');
  });

  it('should handle errors from core.addAnnotations', async () => {
    (core.addAnnotations as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to add annotations');
    });

    const params = {
      text: 'test text',
      page: 1,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    const result = await addComments(params);

    expect(logger.logError).toHaveBeenCalledWith({
      error: expect.any(Error),
      reason: LOGGER.Service.EDITOR_CHATBOT,
    });

    expect(result).toBe('Failed to add comment. Please try again.');
  });

  it('should handle errors from drawAnnotationsFromList', async () => {
    (core.getAnnotationManager().drawAnnotationsFromList as jest.Mock).mockRejectedValue(
      new Error('Failed to draw annotations')
    );

    const params = {
      text: 'test text',
      page: 1,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    const result = await addComments(params);

    expect(logger.logError).toHaveBeenCalledWith({
      error: expect.any(Error),
      reason: LOGGER.Service.EDITOR_CHATBOT,
    });

    expect(result).toBe('Failed to add comment. Please try again.');
  });

  it('should trim whitespace from text input', async () => {
    const params = {
      text: '   test text with spaces   ',
      page: 1,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    await addComments(params);

    expect(getTextPosition).toHaveBeenCalledWith(1, 'test text with spaces');
    expect(mockHighlightAnnotation.setContents).toHaveBeenCalledWith('test text with spaces');
  });

  it('should handle different page numbers', async () => {
    const mockQuadsPage2 = [
      [
        { x1: 100, y1: 200, x2: 150, y2: 200, x3: 150, y3: 190, x4: 100, y4: 190 },
      ],
    ];

    const mockTextPositionPage2 = new Map();
    mockTextPositionPage2.set(2, {
      textToReplace: new Set(['test text']),
      position: mockQuadsPage2,
    });

    (getTextPosition as jest.Mock).mockResolvedValue(mockTextPositionPage2);

    const params = {
      text: 'test text',
      page: 2,
      color: '#FF0000',
      comment: 'This is a test comment',
    };

    await addComments(params);

    expect(getTextPosition).toHaveBeenCalledWith(2, 'test text');
    expect(mockTextHighlightAnnotation).toHaveBeenCalledWith({
      Quads: mockQuadsPage2[0],
      PageNumber: 2,
      Author: 'test-user',
    });
    expect(mockStickyAnnotation).toHaveBeenCalledWith({
      PageNumber: 2,
      Author: 'test-user',
    });
  });
});
