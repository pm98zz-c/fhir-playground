import Client from 'fhir-kit-client'

const client = new Client({ baseUrl: 'https://hapi.fhir.org/baseR4', requestOptions: { referrerPolicy: "no-referrer" } })

// Hardcoded data. IDs are also hardcoded to avoid clogging the server with duplicate resources.
const practitioners = [
  {
    "resourceType": "Practitioner",
    "id": "7190791",
    "identifier": [
      {
        "use": "official",
        "type": {
          "text": "UZI-nummer"
        },
        "system": "urn:oid:2.16.528.1.1007.3.1",
        "value": "12345678901"
      }
    ],
    "active": true,
    "name": [
      {
        "use": "official",
        "text": "Dokter Bronsig",
        "family": "Bronsig",
        "given": [
          "Arend"
        ],
        "prefix": [
          "Dr."
        ]
      }
    ],
    "telecom": [
      {
        "system": "phone",
        "value": "+31715269111",
        "use": "work"
      }
    ],
    "address": [
      {
        "use": "work",
        "line": [
          "Walvisbaai 3",
          "C4 - Automatisering"
        ],
        "city": "Den helder",
        "postalCode": "2333ZA",
        "country": "NLD"
      }
    ],
    "gender": "male",
    "birthDate": "1956-12-24",
    "qualification": [
      {
        "code": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "41672002",
              "display": "Pulmonologist"
            }
          ]
        }
      }
      ,
      {
        "resourceType": "Practitioner",
        "id": "7190792",
        "identifier": [
          {
            "use": "official",
            "system": "urn:oid:2.16.528.1.1007.3.1",
            "value": "730291637"
          },
          {
            "use": "usual",
            "system": "urn:oid:2.16.840.1.113883.2.4.6.3",
            "value": "174BIP3JH438"
          }
        ],
        "name": [
          {
            "use": "official",
            "family": "Voigt",
            "given": [
              "Pieter"
            ],
            "suffix": [
              "MD"
            ]
          }
        ],
        "telecom": [
          {
            "system": "phone",
            "value": "0205569336",
            "use": "work"
          },
          {
            "system": "email",
            "value": "p.voigt@bmc.nl",
            "use": "work"
          },
          {
            "system": "fax",
            "value": "0205669382",
            "use": "work"
          }
        ],
        "address": [
          {
            "use": "work",
            "line": [
              "Galapagosweg 91"
            ],
            "city": "Den Burg",
            "postalCode": "9105 PZ",
            "country": "NLD"
          }
        ],
        "gender": "male",
        "birthDate": "1979-04-29"
      }
    ]
  }
]

const organization = {
  "resourceType": "Organization",
  "id": "7190795",
  "text": {
    "status": "generated",
    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n      \n      <p>Gastroenterology @ Acme Hospital. ph: +1 555 234 3523, email: \n        <a href=\"mailto:gastro@acme.org\">gastro@acme.org</a>\n      </p>\n    \n    </div>"
  },
  "identifier": [
    {
      "system": "http://www.acme.org.au/units",
      "value": "Gastro"
    }
  ],
  "name": "Gastroenterology",
  "telecom": [
    {
      "system": "phone",
      "value": "+1 555 234 3523",
      "use": "mobile"
    },
    {
      "system": "email",
      "value": "gastro@acme.org",
      "use": "work"
    }
  ]
}

const practitionerRole = {
  "resourceType": "PractitionerRole",
  "id": "example",
  "active": true,
  "practitioner": {
    "reference": "Practitioner/example",
  },
  "organization": {
    "reference": "Organization/example"
  },
  "code": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/v2-0286",
          "code": "RP"
        }
      ]
    }
  ],
  "specialty": [
    {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "408443003",
          "display": "General medical practice"
        }
      ]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "(03) 5555 6473",
      "use": "work"
    },
    {
      "system": "email",
      "value": "adam.southern@example.org",
      "use": "work"
    }
  ]
}

const practitionerRoleIDs = [
  "7190955",
  "7190956",
]

function Setup() {
  // Create org and practitioners. We blindly assume they exist already and do not bother for error handling.
  client.update({ resourceType: "Organization", id: organization.id, body: organization }).then((response) => {
    console.log(response)
  })
  practitioners.forEach((practitioner) => {
    client.update({ resourceType: "Practitioner", id: practitioner.id, body: practitioner }).then((response) => {
      console.log(response)
    })
  })
  practitioners.forEach((practitioner, index) => {
    let role = practitionerRole
    role.practitioner.reference = "Practitioner/" + practitioner.id
    role.organization.reference = "Organization/" + organization.id
    role.id = practitionerRoleIDs[index]
    client.update({ resourceType: "PractitionerRole", id: role.id, body: role }).then((response) => {
      console.log(response)
    })
  })
}

export default Setup