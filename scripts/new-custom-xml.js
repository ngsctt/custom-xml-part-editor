import { newXML } from './utils';
import { NS_CUSTOM_XML, NS_RELATIONSHIPS } from './constants';

function newCustomXMLPart (number = 1, namespace = window.location.href, rootTag = 'CustomProperties') {
  const dsID = self.crypto.randomUUID();

  const part = newXML({standalone: true});
  const props = newXML({standalone: true});
  const rels = newXML({standalone: true});
  
  const partRoot = part.createElementNS(namespace, rootTag);
  
  const propsRelPath = '';
  const dsItem = props.createElementNS(NS_CUSTOM_XML, 'ds:datastoreItem');
  dsItem.setAttributeNS(NS_CUSTOM_XML, 'ds:itemID', `{${dsID.toUpperCase()}}`);
  const schemaRefs = props.createElementNS(NS_CUSTOM_XML, 'ds:schemaRefs');
  const schemaRef = props.createElementNS(NS_CUSTOM_XML, 'ds:schemaRef');
  dsItem.setAttributeNS(NS_CUSTOM_XML, 'ds:uri', namespace);
  schemaRefs.append(schemaRef);
  dsItem.append(schemaRefs);
  props.append(dsItem);
  
  const relsRoot = rels.createElementNS(NS_RELATIONSHIPS, 'Relationships');
  const rel = rels.createElementNS(NS_RELATIONSHIPS, 'Relationship');
  rel.setAttributeNS(NS_RELATIONSHIPS, 'Id', 'rId1');
  rel.setAttributeNS(NS_RELATIONSHIPS, 'Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps');
  rel.setAttributeNS(NS_RELATIONSHIPS, 'Target', propsRelPath);
  relsRoot.append(rel);
  rels.append(relsRoot);

  return { part, props, rels }
}