import * as Handlebars from 'handlebars';
import * as moment from 'moment';

const MAX_USER_NAME = 30;

interface IHandlebarsOptions {
  fn(data: any): string
  data: Record<string, any>
}

interface IComment {
  userName: string,
  time: Date,
  comment: string
}

const truncateName = (name: string) => `${name.slice(0, MAX_USER_NAME)}${name.length > MAX_USER_NAME ? '...' : ''}`;

const renderDocumentComments = (list: (IComment & { displayTime?: boolean })[], options: IHandlebarsOptions) => {
  let result = '';
  const ClassMapping = {
    0: 'items--first',
    [list.length - 1]: 'items--last',
  };
  list.forEach((item, index) => {
    const optionData = {
      ...item,
      class: list.length === 1 ? 'items--first items--last' : ClassMapping[index],
      isNew: !item.displayTime && index === list.length - 1,
      formatedTime: moment(item.time).format('DD/MM/YYYY, h:mm a'),
      userName: truncateName(item.userName),
    };
    result += options.fn(optionData);
  });

  return result;
};

const setVar = (varName: string, varValue: any, options: IHandlebarsOptions) => {
  options.data.root[varName] = varValue;
};
const concat = (...args) => {
  let outStr = '';
  args.forEach((arg) => {
    if (typeof arg === 'object') {
      return;
    }
    outStr += arg;
  });
  return outStr;
};

const lower = (str: string) => (typeof str === 'string' ? str.toLowerCase() : str);

const pluralize = (single: string, plural: string, count: number) => {
  if (typeof count !== 'number') {
    return single;
  }
  return count === 1 ? single : plural;
};

// REGISTRATION
const helpers = {
  renderDocumentComments,
  setVar,
  concat,
  lower,
  pluralize,
};

const register = (): void => {
  Object.entries(helpers).forEach(([key, func]) => {
    Handlebars.registerHelper(key, func);
  });
  Handlebars.registerHelper('eq', (...args) => {
    const argumentList: [unknown] = Array.prototype.slice.call(args, 0, -1);
    return argumentList.every((expression) => argumentList[0] === expression);
  });
  Handlebars.registerHelper('neq', (args1, args2, _) => args1 !== args2);
};

export default {
  register,
};
