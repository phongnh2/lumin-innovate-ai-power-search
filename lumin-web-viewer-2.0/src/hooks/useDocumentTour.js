import { useParams } from 'react-router-dom';

function useDocumentTour() {
  const { documentId } = useParams();
  return {
    isTourDocument: [process.env.DOCUMENT_TOUR_ID, 'tour'].includes(documentId),
  };
}

export { useDocumentTour };
