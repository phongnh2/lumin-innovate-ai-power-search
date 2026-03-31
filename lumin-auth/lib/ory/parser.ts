import { UiNodeInputAttributes, UiNodeInputAttributesTypeEnum } from '@ory/client';
import { filterNodesByGroups, isUiNodeInputAttributes } from '@ory/integrations/ui';

import { SelfServiceFlow, TOryUiNodeGroup } from '@/interfaces/ory';

export const constructFlowCsrfToken = (flow: SelfServiceFlow, groups?: TOryUiNodeGroup | Array<TOryUiNodeGroup>): string => {
  const { nodes } = flow.ui;
  const attr: UiNodeInputAttributes = filterNodesByGroups({
    nodes,
    groups
  })
    .filter(_node => isUiNodeInputAttributes(_node.attributes))
    .map<UiNodeInputAttributes>(_node => _node.attributes as UiNodeInputAttributes)
    .find(_attrs => _attrs.type === UiNodeInputAttributesTypeEnum.Hidden) as UiNodeInputAttributes;
  return attr.value;
};
