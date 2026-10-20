// src/risk/attack-mapping.ts

export interface MitreTechnique {
  id: string;
  name: string;
}

// A static dictionary mapping common malware/threat tags to MITRE techniques
const TAG_MAPPING: Record<string, MitreTechnique> = {
  'emotet': { id: 'T1566', name: 'Phishing' },
  'dridex': { id: 'T1566', name: 'Phishing' },
  'qakbot': { id: 'T1566', name: 'Phishing' },
  'c2': { id: 'T1071', name: 'Application Layer Protocol' },
  'command-and-control': { id: 'T1071', name: 'Application Layer Protocol' },
  'ransomware': { id: 'T1486', name: 'Data Encrypted for Impact' },
  'scanner': { id: 'T1595', name: 'Active Scanning' },
  'brute-force': { id: 'T1110', name: 'Brute Force' },
  'ssh': { id: 'T1110', name: 'Brute Force' },
  'botnet': { id: 'T1583', name: 'Acquire Infrastructure' },
  'phishing': { id: 'T1566', name: 'Phishing' },
};

/**
 * Extracts MITRE techniques based on tags found in provider results.
 */
export function extractMitreTechniques(tags: string[]): MitreTechnique[] {
  const techniques = new Set<string>();
  const results: MitreTechnique[] = [];

  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase();
    // Check if the tag contains any of our known keys
    for (const [key, technique] of Object.entries(TAG_MAPPING)) {
      if (normalizedTag.includes(key)) {
        if (!techniques.has(technique.id)) {
          techniques.add(technique.id);
          results.push(technique);
        }
      }
    }
  }

  return results;
}