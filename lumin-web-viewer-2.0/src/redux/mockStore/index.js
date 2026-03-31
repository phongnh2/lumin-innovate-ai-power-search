import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import initialState from 'src/redux/initialState';
import { PLAN_TYPE } from 'constants/plan';

const createStore = () => configureMockStore([thunk])(createState({}));

const createState = ({ auth = {}, ...rest}) => Object.assign(initialState, {
  auth: {
    ...initialState.auth,
    currentUser: {
      _id: '5d9e94a7069633b7aa54e034',
      signatures: [
        'signatures/ec4b0e1e-aeb8-4a45-bb4b-655cb326c829.png',
        'signatures/667c849f-5ec8-4b13-97db-908237b0a0de.png',
        'signatures/a39189fd-d7e4-477c-8e51-4115e6667250.png',
        'signatures/732ff0b4-1c00-40a9-bb99-eb3bb2f71e5a.png',
        'signatures/b0c22367-43d8-4eb4-9b91-aac3f93f2e81.png',
        'signatures/fd5dae9e-6b52-4228-ad0a-a597ffc04253.png',],
      payment: PLAN_TYPE.FREE,
    },
    ...auth,
  },
}, rest);

export {
  createStore,
  createState,
};
