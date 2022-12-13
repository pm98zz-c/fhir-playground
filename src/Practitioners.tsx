import { Practitioner, PractitionerRole } from 'fhir/r4'
import client from './client'

// Truncated version of https://terminology.hl7.org/5.0.0/CodeSystem-v2-0265.json.html
// Enough for demonstration purposes.
const specialities = [
  {
    "id": "2593",
    "code": "AMB",
    "display": "Ambulatory",
    "definition": "Ambulatory",
    "property": [
      {
        "code": "status",
        "valueCode": "A"
      }
    ]
  },
  {
    "id": "2594",
    "code": "PSY",
    "display": "Psychiatric",
    "definition": "Psychiatric",
    "property": [
      {
        "code": "status",
        "valueCode": "A"
      }
    ]
  },
  {
    "id": "2595",
    "code": "PPS",
    "display": "Pediatric psychiatric",
    "definition": "Pediatric psychiatric",
    "property": [
      {
        "code": "status",
        "valueCode": "A"
      }
    ]
  },
  {
    "id": "2596",
    "code": "REH",
    "display": "Rehabilitation",
    "definition": "Rehabilitation",
    "property": [
      {
        "code": "status",
        "valueCode": "A"
      }
    ]
  }
]

function Practitioners({ orgID }: { orgID: string }) {
  // Not clean in theory, as we could have the children triggered
  // before the parent is rendered. But in practice, the remote request means it can't happen.
  gatherPractitioners(orgID)
  return (
    <div className="container">
      <section>
        <h3>Practitioners</h3>
        <table id="practitioners">
          <thead>
            <tr>
              <th>Name</th>
              {/* <th>Specialities</th> */}
              <th>Location</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Remove from organization</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </section>
      <section>
        <h3>Search</h3>
        <input type="text" id="practitioner-search" placeholder="Practitioner's name" />
        <input type="submit" value="Search" onClick={() => searchPractitioners(orgID)} />
        <table id="results">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Add to organization</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </section>
    </div>
  )
}

function gatherPractitioners(orgID: string) {
  client.search({
    resourceType: 'PractitionerRole',
    searchParams: { organization: orgID, _include: "PractitionerRole:practitioner" },
  })
    .then((data) => {
      // Reset table and repopulate.
      const table = document.getElementById('practitioners') as HTMLTableElement
      if (table === null || table instanceof HTMLTableElement === false) {
        return
      }
      const tbody = table.getElementsByTagName('tbody')[0]
      tbody.innerHTML = ''
      if (data.entry === undefined) {
        return
      }
      // We also gather the relationships (PractitionerRole) for later use
      const relationships: Map<string, PractitionerRole> = new Map()
      for (let i = 0; i < data.entry.length; i++) {
        let entity = data.entry[i].resource
        if (entity.resourceType === 'Practitioner') {
          renderPractitioner(entity, tbody)
        }
        if (entity.resourceType === 'PractitionerRole') {
          relationships.set(entity.id, entity)
        }
      }
      injectRelationShips(relationships)
    })
    .catch((err) => {
      console.log(err)
    })
}

function injectRelationShips(relationships: Map<string, PractitionerRole>) {
  // Now inject the relationships into the table.
  // That's ugly but an afterthought, soz.
  relationships.forEach((relationship) => {
    const practitionerID = relationship.practitioner?.reference?.split('/')[1]
    if (practitionerID === undefined) {
      return
    }
    const practitionerRow = document.getElementById(practitionerID) as HTMLTableRowElement
    if (practitionerRow === null) {
      return
    }
    if (relationship.specialty === undefined) {
      return
    }
    if (relationship.specialty.length === 0) {
      return
    }
    const speciality = relationship.specialty[0]
    const specialityDisplay = speciality.coding?.[0].display
    // The if/else is to cope with duplicates (which shouldn't happen in the first place, but...)
    if (practitionerRow.cells.length < 4) {
      practitionerRow.insertCell(3).innerHTML = specialityDisplay ?? ''
    } else {
      practitionerRow.cells[3].innerHTML = specialityDisplay ?? ''
    }
    const removeButton = document.createElement('input')
    removeButton.setAttribute('type', 'submit')
    removeButton.setAttribute('value', 'Remove')
    const roleID = relationship.id
    if (roleID === undefined) {
      return
    }
    removeButton.setAttribute('id', roleID)
    const removeCell = document.createElement('td')
    removeCell.appendChild(removeButton)
    practitionerRow.appendChild(removeCell)
    removeButton.addEventListener('click', () => {
      client.delete({ resourceType: 'PractitionerRole', id: roleID })
        .then(() => {
          window.location.reload()
        }).catch((err) => {
          console.log(err)
        })
    })
  })
}


function renderPractitioner(practitioner: Practitioner, parent: HTMLElement) {
  if (practitioner.id === undefined) {
    return
  }
  const practitionerRow = document.createElement('tr')
  practitionerRow.setAttribute('id', practitioner.id)
  const name = getName(practitioner)
  if (name.length < 1) {
    return
  }
  const nameCell = document.createElement('td')
  nameCell.innerHTML = name
  practitionerRow.appendChild(nameCell)
  // const speciality = getSpecialities(practitioner)
  // const specialityCell = document.createElement('td')
  // specialityCell.innerHTML = speciality
  // practitionerRow.appendChild(specialityCell)
  const location = getLocation(practitioner)
  const locationCell = document.createElement('td')
  locationCell.innerHTML = location
  practitionerRow.appendChild(locationCell)
  const contact = getContact(practitioner)
  const contactCell = document.createElement('td')
  contactCell.innerHTML = contact
  practitionerRow.appendChild(contactCell)
  parent.appendChild(practitionerRow)
}

function getName(practitioner: Practitioner): string {
  /**
   * As per specs, we should be doing a lot more here.
   * 1. There is more than 1 name
   * 2. Use = usual
   * 3. Period is current to the date of the usage
   * 4. Use = official
   * 5. Other order as decided by internal business rules.
   * 
   * For now, we'll just take the first name.
   */
  if (practitioner.name?.length === 0) {
    return ''
  }
  if (practitioner.name === undefined) {
    return ''
  }
  const nameData = practitioner.name[0]
  if (nameData.text !== undefined && nameData.text.length > 0) {
    return nameData.text
  }
  const compositeName = []
  if (nameData.prefix !== undefined) {
    compositeName.push(nameData.prefix)
  }
  if (nameData.given !== undefined) {
    compositeName.push(nameData.given)
  }
  if (nameData.family !== undefined) {
    compositeName.push(nameData.family)
  }
  return compositeName.join(' ')
}

function getLocation(practitioner: Practitioner): string {
  if (practitioner.address === undefined) {
    return ''
  }
  if (practitioner.address?.length === 0) {
    return ''
  }
  const addressData = practitioner.address[0]
  return addressData.city + ' ' + addressData.country
}

function getContact(practitioner: Practitioner): string {
  if (practitioner.telecom === undefined) {
    return ''
  }
  if (practitioner.telecom?.length === 0) {
    return ''
  }
  const contactData = []
  for (let i = 0; i < practitioner.telecom.length; i++) {
    const contact = practitioner.telecom[i]
    if (contact.system === 'phone' && contact.value !== undefined) {
      const phone = document.createElement('a')
      phone.setAttribute('href', 'tel:' + contact.value)
      phone.innerHTML = contact.value
      contactData.push(phone.outerHTML)
    }
    if (contact.system === 'email' && contact.value !== undefined) {
      const email = document.createElement('a')
      email.setAttribute('href', 'mailto:' + contact.value)
      email.innerHTML = contact.value
      contactData.push(email.outerHTML)
    }
  }
  return contactData.join(', ')
}

// function getSpecialities(practitioner: Practitioner): string {
//   console.log(practitioner)
//   return ""
// }

function searchPractitioners(orgID: string) {
  const search = document.getElementById('practitioner-search') as HTMLInputElement
  if (search === null || search instanceof HTMLInputElement === false) {
    return
  }
  if (search.value.length < 3) {
    return
  }
  client.search({
    resourceType: 'Practitioner',
    searchParams: { name: search.value },
  })
    .then((data) => {
      // Reset table and repopulate.
      const table = document.getElementById('results') as HTMLTableElement
      if (table === null || table instanceof HTMLTableElement === false) {
        return
      }
      const tbody = table.getElementsByTagName('tbody')[0]
      tbody.innerHTML = ''
      if (data.entry === undefined || data.entry.length === 0) {
        return
      }
      for (let i = 0; i < data.entry.length; i++) {
        let entity = data.entry[i].resource
        if (entity.resourceType === 'Practitioner') {
          renderPractitionerResult(entity, tbody, orgID)
        }
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

function renderPractitionerResult(practitioner: Practitioner, parent: HTMLElement, orgID: string) {
  if (practitioner.id === undefined) {
    return
  }
  const practitionerRow = document.createElement('tr')
  practitionerRow.setAttribute('id', practitioner.id)
  const name = getName(practitioner)
  if (name.length < 1) {
    return
  }
  const nameCell = document.createElement('td')
  nameCell.innerHTML = name
  practitionerRow.appendChild(nameCell)
  const location = getLocation(practitioner)
  const locationCell = document.createElement('td')
  locationCell.innerHTML = location
  practitionerRow.appendChild(locationCell)
  const roleDropdown = getRoleDropdown(practitioner.id, orgID)
  const roleCell = document.createElement('td')
  roleCell.appendChild(roleDropdown)
  practitionerRow.appendChild(roleCell)
  parent.appendChild(practitionerRow)
}

function getRoleDropdown(practitionerID: string, orgID: string): HTMLSelectElement {
  const select = document.createElement('select')
  const empty = document.createElement('option')
  empty.setAttribute('value', '')
  empty.innerHTML = 'Select a speciality'
  select.appendChild(empty)
  for (let i = 0; i < specialities.length; i++) {
    const speciality = specialities[i]
    const option = document.createElement('option')
    option.setAttribute('value', speciality.code)
    option.innerHTML = speciality.display
    select.appendChild(option)
  }
  select.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement
    const role = target.value
    let display = target.value
    // Gather display name.
    specialities.forEach((speciality) => {
      if (speciality.code === role) {
        display = speciality.display
      }
    })
    if (role.length < 1) {
      return
    }
    // We always use the PP (Primary Care Provider) code for now.
    const practitioner = {
      resourceType: 'PractitionerRole',
      practitioner: {
        reference: 'Practitioner/' + practitionerID,
      },
      organization: {
        reference: 'Organization/' + orgID,
      },
      specialty: [
        {
          coding: [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0265",
              "code": role,
              "display": display
            }
          ]
        }
      ],
      code: [
        {
          coding: [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0286",
              "code": "PP"
            },
          ],
        },
      ],
    }
    client.create({
      resourceType: 'PractitionerRole',
      body: practitioner,
    })
      .then((data) => {
        showModal()
        // Ugly hack, we reload the page instead of cleaning up things properly.
        // On top, the search index takes a while to update, and we should instead find some other mechanism.
        setTimeout(() => {
          window.location.reload()
        }, 5 * 1000)
      })
      .catch((err) => {
        console.log(err)
      })
  })
  return select
}

function showModal() {
  const modal = document.createElement('dialog')
  modal.setAttribute('id', 'modal')
  modal.setAttribute('open', 'true')
  const inner = document.createElement('article')
  const innerHeader = document.createElement('header')
  innerHeader.innerHTML = "<p>Please wait...</p>"
  const innerContent = document.createElement('div')
  innerContent.innerHTML = "<p>Adding practitioner to organization.</p>"
  innerContent.setAttribute('aria-busy', 'true')
  inner.appendChild(innerHeader)
  inner.appendChild(innerContent)
  modal.appendChild(inner)
  document.body.appendChild(modal)
}

export default Practitioners
