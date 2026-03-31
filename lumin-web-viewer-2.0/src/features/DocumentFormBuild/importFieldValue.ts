import core from 'core';

const template =
  '<?xml version="1.0" encoding="UTF-8" ?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n<fields><field name="{name}">\n<value>{value}</value>\n</field>\n</fields></xfdf>';

const parser = new DOMParser();
const serializer = new XMLSerializer();
export default async function importFieldValue(name: string, value: string): Promise<void> {
  const annotManager = core.getAnnotationManager();
  const xfdfElements = parser.parseFromString(template, 'text/xml');
  xfdfElements.querySelector('field').setAttribute('name', name);
  xfdfElements.querySelector('value').textContent = value;
  const xfdfString = serializer.serializeToString(xfdfElements);
  await annotManager.importAnnotations(xfdfString);
}