import { useCallback, useState } from 'react';

export interface SelectedMember {
  id: string;
  name: string;
}

interface SignSeatModalState {
  isOpen: boolean;
  selectedMember: SelectedMember | null;
  organizationId: string | null;
}

interface UseSignSeatModalReturn extends SignSeatModalState {
  openModal: (member: SelectedMember, orgId: string) => void;
  closeModal: () => void;
}

const initialState: SignSeatModalState = {
  isOpen: false,
  selectedMember: null,
  organizationId: null,
};

export default function useSignSeatModal(): UseSignSeatModalReturn {
  const [state, setState] = useState<SignSeatModalState>(initialState);

  const openModal = useCallback((member: SelectedMember, orgId: string) => {
    setState({
      isOpen: true,
      selectedMember: member,
      organizationId: orgId,
    });
  }, []);

  const closeModal = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    openModal,
    closeModal,
  };
}
