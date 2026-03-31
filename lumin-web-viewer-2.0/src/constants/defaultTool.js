import { isIOS, isAndroid } from 'helpers/device';

const defaultTool = isIOS || isAndroid ? 'Pan' : 'AnnotationEdit';

export default defaultTool;
