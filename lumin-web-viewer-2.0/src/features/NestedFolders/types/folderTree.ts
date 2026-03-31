import {
  TreeNodeData as MantineTreeNodeData,
  RenderTreeNodePayload as MantineRenderTreeNodePayload,
} from 'lumin-ui/kiwi-ui';

import { DestinationLocation } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { GetTooltipContentProps } from './tooltip';
import { RootTypes, TreeNodeTypes } from '../constants';

type AdditionalData = {
  hasFolders: boolean;
  rootType: RootTypes;
  avatarRemoteId: string;
  destinationType: DestinationLocation;
  isCopyModal: boolean;
  isPersonalTargetSelected: boolean;
  belongToDestination: DestinationLocation;
  getTooltipContent: (payload: GetTooltipContentProps) => string;
  getNestedFolders: (payload: { rootType: RootTypes; orgId?: string; teamId?: string }) => Promise<void>;
};

type ExtraTreeNodeProps = {
  type: TreeNodeTypes;
  additionalData?: Partial<AdditionalData>;
};

export type TreeNodeData = MantineTreeNodeData & ExtraTreeNodeProps;

export type NodeInfo = MantineRenderTreeNodePayload['node'] & ExtraTreeNodeProps;

export type RenderTreeNodePayload = MantineRenderTreeNodePayload & {
  node: NodeInfo;
  tooltip?: string;
  disabled?: boolean;
};

export type NestedPlainData = {
  _id: string;
  name: string;
  type: TreeNodeTypes;
  children: NestedPlainData[];
};

export type NestedFolderData = {
  [RootTypes.Personal]: NestedPlainData[];
  [RootTypes.Organization]: NestedPlainData[];
  [RootTypes.Team]: {
    _id: string;
    name: string;
    children: NestedPlainData[];
  }[];
};
