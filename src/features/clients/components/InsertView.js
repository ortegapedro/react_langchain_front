import React from 'react';
import ContentCard from '../../../components/ContentCard';
import ClientForm from './ClientForm';

function InsertView({ onSessionExpired }) {
  return (
    <ContentCard title="Insert Client">
      <ClientForm onSessionExpired={onSessionExpired} />
    </ContentCard>
  );
}

export default InsertView;
