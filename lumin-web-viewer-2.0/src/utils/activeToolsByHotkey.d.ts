declare function activeToolsByHotkey({
  toolElement,
  subToolElement,
  subTool,
}: {
  toolElement: string;
  subToolElement?: string;
  subTool?: string;
}): Promise<void>;

export default activeToolsByHotkey;
