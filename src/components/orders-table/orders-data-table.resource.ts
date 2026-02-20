import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { useMemo } from 'react';

interface CustomOrder extends Omit<Order, 'orderer' | 'patient'> {
  patient: string;
  patientUuid: string;
  orderer: string;
}

export default function useSearchResults(tableEntries: CustomOrder[], searchString): CustomOrder[] {
  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      const search = searchString.toLowerCase();
      return tableEntries.filter((eachDataRow) =>
        Object.entries(eachDataRow).some(([header, value]) => {
          return `${value}`.toLowerCase().includes(search);
        }),
      );
    }

    return tableEntries;
  }, [searchString, tableEntries]);

  return searchResults;
}

export interface Location {
  uuid: string;
  display?: string;
  name?: string;
}

export interface InpatientAdmission {
  currentInpatientLocation: Location;
}

/**
 * fetches a list of inpatient admissions (in any location) for the given patients
 */
export function useInpatientAdmissionByPatients(patientUuids: string[]) {
  // prettier-ignore
  const customRepresentation = 'custom:(currentInpatientLocation)';

  const hasPatients = patientUuids?.length > 0;
  const searchParams = new URLSearchParams();
  searchParams.append('v', customRepresentation);
  for (const uuid of patientUuids ?? []) {
    searchParams.append('patients', uuid);
  }

  return useOpenmrsFetchAll<InpatientAdmission>(
    hasPatients ? `${restBaseUrl}/emrapi/inpatient/admission?${searchParams.toString()}` : null,
  );
}
