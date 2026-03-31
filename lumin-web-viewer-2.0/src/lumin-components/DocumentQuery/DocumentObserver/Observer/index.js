import PersonalDocumentObserverIns from './PersonalDocumentObserver';
import TeamDocumentObserverIns from './TeamDocumentObserver';
import StarredDocumentObserverIns from './StarredDocumentObserver';
import OrganizationDocumentObserverIns from './OrganizationDocumentObserver';

const PersonalDocumentObserver = new PersonalDocumentObserverIns();
const TeamDocumentObserver = new TeamDocumentObserverIns();
const StarredDocumentObserver = new StarredDocumentObserverIns();
const OrganizationDocumentObserver = new OrganizationDocumentObserverIns();

export {
  PersonalDocumentObserver,
  TeamDocumentObserver,
  StarredDocumentObserver,
  OrganizationDocumentObserver,
};
