/* Salesforce AI Agent: details for its section.
   Every figure is from the public repository (github.com/0KRK0/SAA-Salesforce-Agent).
   The risk decisions below are not written by hand: they are the output of the
   repository's own engine (backend/app/risk/engine.py, classify()) run with the
   real tool declarations and the default project policy, then stored here. */

export type SaaEnv = 'sandbox' | 'prod' | 'prodok';

export interface SaaDecision {
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approval: boolean;
  blocked: boolean;
  category: string;
  reasons: string[];
  why?: string;
  alternatives?: string[];
  count?: number;
  roles?: string[];
  ttl?: number;
  separate?: boolean;
}

export interface SaaScenario { id: string; label: string; tool: string; declared: string; writes: boolean; d: Record<SaaEnv, SaaDecision> }

export const saa = {
  repo: 'https://github.com/0KRK0/SAA-Salesforce-Agent',
  loop: ['Understand', 'Inspect the org', 'Plan', 'Select tools', 'Execute', 'Observe', 'Validate', 'Approval, when required', 'Execute the change', 'Verify in Salesforce', 'Report'],
  numbers: [
    { v: '52', k: 'tools' },
    { v: '20', k: 'of them change something' },
    { v: '687', k: 'automated tests' },
    { v: '10', k: 'model providers' },
  ],
  tools: [
    { risk: 'LOW', n: 32 },
    { risk: 'MEDIUM', n: 13 },
    { risk: 'HIGH', n: 7 },
  ],
  envs: [
    { id: 'sandbox' as SaaEnv, label: 'Sandbox' },
    { id: 'prod' as SaaEnv, label: 'Production, not cleared' },
    { id: 'prodok' as SaaEnv, label: 'Production, cleared' },
  ],
  binding: [
    { k: 'The exact change', v: 'A SHA-256 hash of the tool name and its canonical arguments. Change one argument and the approval authorizes nothing.' },
    { k: 'The org as it was', v: 'A fingerprint of the org state the change was proposed against. If the org moved while the change waited, it is refused and proposed again.' },
    { k: 'A deadline', v: 'Approvals expire, sooner the riskier: 60 minutes for a medium-risk record change, 15 for a real deployment or a permission change, as little as 10 for critical ones.' },
    { k: 'Enough people', v: 'A quorum per category and risk tier. Permission changes and real deployments need two distinct people from eligible roles.' },
    { k: 'Not yourself', v: 'Separation of duties: the person who asked cannot approve a high-risk change when the project requires it, and never a critical one.' },
  ],
  subsystems: ['Schema and SOQL', 'Records', 'Metadata and fields', 'Record-triggered Flows', 'Apex: write, compile-check, test, coverage', 'Data quality and Bulk API 2.0', 'Org debugger', 'Dependency analysis', 'Reports', 'Permissions and access audit', 'Change sets: diff, deploy, verify, rollback plan', 'Jira, GitHub and Bitbucket'],
  honest: [
    'Its tests run against doubles. Integration with a real org is manual and sandbox-first, as the README says.',
    'It is open-source code, not a hosted service: no payments are taken, and no SOC 2 or ISO 27001 is claimed.',
    'AWS Bedrock, Google Vertex and SAML are not implemented; selecting one fails at startup instead of pretending.',
  ],
  scenarios: [
  {
    "id": "read",
    "label": "Describe the Account object",
    "tool": "describe_object",
    "declared": "LOW",
    "writes": false,
    "d": {
      "sandbox": {
        "risk": "LOW",
        "approval": false,
        "blocked": false,
        "category": "data",
        "reasons": [
          "Base risk for describe_object is LOW."
        ]
      },
      "prod": {
        "risk": "LOW",
        "approval": false,
        "blocked": false,
        "category": "data",
        "reasons": [
          "Base risk for describe_object is LOW."
        ]
      },
      "prodok": {
        "risk": "LOW",
        "approval": false,
        "blocked": false,
        "category": "data",
        "reasons": [
          "Base risk for describe_object is LOW."
        ]
      }
    }
  },
  {
    "id": "query",
    "label": "Find the 10 newest Accounts",
    "tool": "query_salesforce",
    "declared": "LOW",
    "writes": false,
    "d": {
      "sandbox": {
        "risk": "LOW",
        "approval": false,
        "blocked": false,
        "category": "data",
        "reasons": [
          "Base risk for query_salesforce is LOW."
        ]
      },
      "prod": {
        "risk": "LOW",
        "approval": false,
        "blocked": false,
        "category": "data",
        "reasons": [
          "Base risk for query_salesforce is LOW."
        ]
      },
      "prodok": {
        "risk": "LOW",
        "approval": false,
        "blocked": false,
        "category": "data",
        "reasons": [
          "Base risk for query_salesforce is LOW."
        ]
      }
    }
  },
  {
    "id": "update",
    "label": "Update one Opportunity's stage",
    "tool": "update_record",
    "declared": "MEDIUM",
    "writes": true,
    "d": {
      "sandbox": {
        "risk": "MEDIUM",
        "approval": true,
        "blocked": false,
        "category": "data",
        "reasons": [
          "Base risk for update_record is MEDIUM."
        ],
        "count": 1,
        "roles": [
          "PROJECT_ADMIN",
          "SALESFORCE_ADMIN",
          "DEVELOPER",
          "USER"
        ],
        "ttl": 3600,
        "separate": false
      },
      "prod": {
        "risk": "HIGH",
        "approval": true,
        "blocked": false,
        "category": "data",
        "reasons": [
          "Target org is production."
        ],
        "count": 1,
        "roles": [
          "PROJECT_ADMIN",
          "SALESFORCE_ADMIN"
        ],
        "ttl": 1800,
        "separate": false
      },
      "prodok": {
        "risk": "HIGH",
        "approval": true,
        "blocked": false,
        "category": "data",
        "reasons": [
          "Target org is production."
        ],
        "count": 1,
        "roles": [
          "PROJECT_ADMIN",
          "SALESFORCE_ADMIN"
        ],
        "ttl": 1800,
        "separate": false
      }
    }
  },
  {
    "id": "field",
    "label": "Add a custom field to Account",
    "tool": "create_field",
    "declared": "MEDIUM",
    "writes": true,
    "d": {
      "sandbox": {
        "risk": "MEDIUM",
        "approval": true,
        "blocked": false,
        "category": "deployment",
        "reasons": [
          "Base risk for create_field is MEDIUM."
        ],
        "count": 1,
        "roles": [
          "PROJECT_ADMIN",
          "SALESFORCE_ADMIN",
          "RELEASE_MANAGER"
        ],
        "ttl": 3600,
        "separate": false
      },
      "prod": {
        "risk": "HIGH",
        "approval": true,
        "blocked": true,
        "category": "deployment",
        "reasons": [
          "Target org is production.",
          "Metadata changes to production are disabled."
        ],
        "why": "This project does not permit production changes. A project administrator can enable it under Settings for this project only. Target a sandbox in the meantime.",
        "alternatives": [
          "Run it against a sandbox",
          "Prepare a release instead",
          "Ask an administrator to enable production changes"
        ]
      },
      "prodok": {
        "risk": "HIGH",
        "approval": true,
        "blocked": false,
        "category": "deployment",
        "reasons": [
          "Target org is production."
        ],
        "count": 2,
        "roles": [
          "PROJECT_ADMIN",
          "SALESFORCE_ADMIN",
          "RELEASE_MANAGER"
        ],
        "ttl": 900,
        "separate": false
      }
    }
  },
  {
    "id": "perm",
    "label": "Grant a permission set to a user",
    "tool": "modify_permissions",
    "declared": "HIGH",
    "writes": true,
    "d": {
      "sandbox": {
        "risk": "HIGH",
        "approval": true,
        "blocked": false,
        "category": "security",
        "reasons": [
          "Base risk for modify_permissions is HIGH."
        ],
        "count": 2,
        "roles": [
          "PROJECT_ADMIN",
          "SECURITY_ADMIN",
          "SALESFORCE_ADMIN"
        ],
        "ttl": 900,
        "separate": false
      },
      "prod": {
        "risk": "HIGH",
        "approval": true,
        "blocked": true,
        "category": "security",
        "reasons": [
          "Target org is production.",
          "Metadata changes to production are disabled."
        ],
        "why": "This project does not permit production changes. A project administrator can enable it under Settings for this project only. Target a sandbox in the meantime.",
        "alternatives": [
          "Run it against a sandbox",
          "Prepare a release instead",
          "Ask an administrator to enable production changes"
        ]
      },
      "prodok": {
        "risk": "HIGH",
        "approval": true,
        "blocked": false,
        "category": "security",
        "reasons": [
          "Target org is production."
        ],
        "count": 2,
        "roles": [
          "PROJECT_ADMIN",
          "SECURITY_ADMIN",
          "SALESFORCE_ADMIN"
        ],
        "ttl": 900,
        "separate": false
      }
    }
  },
  {
    "id": "deploy",
    "label": "Deploy a change set (not check-only)",
    "tool": "deploy_change_set",
    "declared": "HIGH",
    "writes": true,
    "d": {
      "sandbox": {
        "risk": "HIGH",
        "approval": true,
        "blocked": false,
        "category": "deployment",
        "reasons": [
          "Real (non-validation) metadata deployment."
        ],
        "count": 2,
        "roles": [
          "PROJECT_ADMIN",
          "SALESFORCE_ADMIN",
          "RELEASE_MANAGER"
        ],
        "ttl": 900,
        "separate": false
      },
      "prod": {
        "risk": "HIGH",
        "approval": true,
        "blocked": true,
        "category": "deployment",
        "reasons": [
          "Target org is production.",
          "Metadata changes to production are disabled."
        ],
        "why": "This project does not permit production changes. A project administrator can enable it under Settings for this project only. Target a sandbox in the meantime.",
        "alternatives": [
          "Run it against a sandbox",
          "Prepare a release instead",
          "Ask an administrator to enable production changes"
        ]
      },
      "prodok": {
        "risk": "HIGH",
        "approval": true,
        "blocked": false,
        "category": "deployment",
        "reasons": [
          "Target org is production.",
          "Real (non-validation) metadata deployment."
        ],
        "count": 2,
        "roles": [
          "PROJECT_ADMIN",
          "SALESFORCE_ADMIN",
          "RELEASE_MANAGER"
        ],
        "ttl": 900,
        "separate": false
      }
    }
  }
] as SaaScenario[],
};
