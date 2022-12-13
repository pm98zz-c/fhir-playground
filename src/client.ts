import FhirClient from 'fhir-kit-client'

const Client = new FhirClient({ baseUrl: 'https://hapi.fhir.org/baseR4', requestOptions: { referrerPolicy: "no-referrer" } })

export default Client