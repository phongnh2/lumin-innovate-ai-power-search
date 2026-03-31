import { useLocation } from "react-router";

import { matchPaths } from "helpers/matchPaths";

import { ROUTE_MATCH } from "constants/Routers";

const useAgreementListModuleMatch = () => {
  const location = useLocation();

  const isInAgreementListModulePage = Boolean(
    matchPaths(
      [ROUTE_MATCH.AGREEMENT_GEN_LIST_MODULE].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );

  return { isInAgreementListModulePage };

};

export default useAgreementListModuleMatch;